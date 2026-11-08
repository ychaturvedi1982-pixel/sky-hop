/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameMode,
  Obstacle,
  CoinPickup,
  ActivePowerup,
  PowerupType,
  BossEntity,
  RunSummary,
  PlayerSaveData,
  GameSettings,
  TrailType,
} from './game/types';
import { CHARACTERS, WORLDS } from './game/constants';
import {
  checkCircleRectCollision,
  checkBoundaryCollision,
  calculateScrollSpeed,
  calculateGapSize,
  evaluatePassQuality,
  calculateComboMultiplier,
  calculateMagnetPull,
} from './game/physics';
import { soundEngine } from './game/audio';
import { ParticleSystem } from './game/particles';
import { GameRenderer } from './game/renderer';
import { storage } from './game/storage';

// Modals & UI Screens
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { CharacterModal } from './components/CharacterModal';
import { WorldModal } from './components/WorldModal';
import { MissionsModal } from './components/MissionsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ShopModal } from './components/ShopModal';
import { RecordsModal } from './components/RecordsModal';
import { SettingsModal } from './components/SettingsModal';
import { ReviveModal } from './components/ReviveModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent save data
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => storage.getData());
  const [gameState, setGameState] = useState<GameState>('title');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [pendingCrashCause, setPendingCrashCause] = useState<string>('');

  // Game UI indicators throttled to React
  const [hudScore, setHudScore] = useState(0);
  const [hudCombo, setHudCombo] = useState(0);
  const [hudDistance, setHudDistance] = useState(0);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudGems, setHudGems] = useState(0);
  const [hudPowerups, setHudPowerups] = useState<ActivePowerup[]>([]);
  const [hudBoss, setHudBoss] = useState<BossEntity | null>(null);
  const [hudTimeLeft, setHudTimeLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  // Sync dataset.state with document.body
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Handle autostart query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleStartGame();
    }
  }, []);

  // Mutable Game Loop State stored in refs to run decoupled at 60 FPS
  const simRef = useRef({
    playerX: 140,
    playerY: 260,
    playerVy: 0,
    obstacles: [] as Obstacle[],
    coins: [] as CoinPickup[],
    activePowerups: [] as ActivePowerup[],
    boss: null as BossEntity | null,
    score: 0,
    combo: 0,
    distanceMeters: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    nearMisses: 0,
    perfectPasses: 0,
    maxCombo: 0,
    flaps: 0,
    runDuration: 0,
    timeAttackRemaining: 30,
    nextObstacleX: 450,
    obstacleIdCounter: 1,
    coinIdCounter: 1,
    hitstopTimer: 0,
    invulnerableTimer: 0,
    waddlesBounceUsed: false,
    trauma: 0,
    totalTime: 0,
    lastFrameTime: 0,
    width: 800,
    height: 600,
    groundY: 530,
    ceilingY: 10,
    jumpBuffered: false,
    jumpBufferTimer: 0,
    revivesUsed: 0,
    isReviving: false,
    coinStreak: 0,
    lastCoinTime: 0,
  });

  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const rendererRef = useRef<GameRenderer | null>(null);

  // Active configurations
  const activeCharacter =
    CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];
  const activeSkinId =
    saveData.selectedSkinId[activeCharacter.id] || activeCharacter.defaultSkinId;
  const activeSkin =
    activeCharacter.skins.find((s) => s.id === activeSkinId) || activeCharacter.skins[0];
  const activeWorld = WORLDS.find((w) => w.id === saveData.selectedWorldId) || WORLDS[0];

  // Initialize Canvas Renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new GameRenderer(canvasRef.current, particlesRef.current);
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      simRef.current.width = width;
      simRef.current.height = height;
      simRef.current.groundY = height - Math.max(65, height * 0.12);
      renderer.resize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger Flap
  const triggerFlap = useCallback(() => {
    if (gameState === 'title') {
      handleStartGame();
      return;
    }
    if (gameState !== 'playing') return;

    const sim = simRef.current;
    let impulse = activeCharacter.flapImpulse;

    // Character ability adjustments
    if (activeCharacter.id === 'ignis') {
      impulse -= 15;
    } else if (activeCharacter.id === 'aura') {
      impulse += 15;
    }

    sim.playerVy = impulse;
    sim.flaps += 1;
    soundEngine.playFlap();

    // Spawn wing trail burst
    particlesRef.current.spawnTrail(sim.playerX, sim.playerY, saveData.selectedTrail);
  }, [gameState, activeCharacter, saveData.selectedTrail]);

  // Helper to generate coin formations (arcs, sine waves, clusters, corridors) in open skies
  const spawnCoinFormation = useCallback(
    (startX: number, endX: number, startY: number, targetY: number) => {
      const sim = simRef.current;
      const distance = endX - startX;
      if (distance < 100) return;

      const isCoinRush = saveData.selectedMode === 'coin_rush';
      const densityMultiplier = isCoinRush ? 1.5 : 1.0;
      const count = Math.min(10, Math.max(3, Math.floor((distance / 50) * densityMultiplier)));
      const stepX = distance / (count + 1);

      const rand = Math.random();

      if (rand < 0.35) {
        // Parabolic Flight Arc
        const apexDelta = (Math.random() > 0.45 ? -1 : 1) * (45 + Math.random() * 35);
        for (let i = 1; i <= count; i++) {
          const norm = i / (count + 1);
          const arcY = startY + (targetY - startY) * norm + Math.sin(norm * Math.PI) * apexDelta;
          const clampedY = Math.max(75, Math.min(sim.groundY - 50, arcY));
          sim.coins.push({
            id: sim.coinIdCounter++,
            x: startX + i * stepX,
            y: clampedY,
            isGem: i === Math.ceil(count / 2) && Math.random() < 0.3,
            collected: false,
          });
        }
      } else if (rand < 0.65) {
        // Undulating Sine-Wave Stream
        const freq = 1.6;
        const amp = 32 + Math.random() * 25;
        const midY = (startY + targetY) / 2;
        for (let i = 1; i <= count; i++) {
          const norm = i / (count + 1);
          const waveY = midY + Math.sin(norm * Math.PI * freq) * amp;
          const clampedY = Math.max(75, Math.min(sim.groundY - 50, waveY));
          sim.coins.push({
            id: sim.coinIdCounter++,
            x: startX + i * stepX,
            y: clampedY,
            isGem: Math.random() < 0.18,
            collected: false,
          });
        }
      } else if (rand < 0.85) {
        // Diamond / Star Cross Cluster with Sparkling Gem at center
        const clusterX = startX + distance / 2;
        const clusterY = Math.max(85, Math.min(sim.groundY - 60, (startY + targetY) / 2));
        const offsets = [
          { dx: -24, dy: 0, isGem: false },
          { dx: 24, dy: 0, isGem: false },
          { dx: 0, dy: -24, isGem: false },
          { dx: 0, dy: 24, isGem: false },
          { dx: 0, dy: 0, isGem: true },
        ];
        offsets.forEach((off) => {
          sim.coins.push({
            id: sim.coinIdCounter++,
            x: clusterX + off.dx,
            y: clusterY + off.dy,
            isGem: off.isGem,
            collected: false,
          });
        });
      } else {
        // Straight Flight Corridor
        const lineY = Math.max(80, Math.min(sim.groundY - 50, (startY + targetY) / 2));
        for (let i = 1; i <= count; i++) {
          sim.coins.push({
            id: sim.coinIdCounter++,
            x: startX + i * stepX,
            y: lineY,
            isGem: i === count && Math.random() < 0.3,
            collected: false,
          });
        }
      }
    },
    [saveData.selectedMode]
  );

  // Helper to generate a single obstacle and its passage gate pickups
  const spawnObstacleAt = useCallback((atX: number): Obstacle => {
    const sim = simRef.current;
    const gapSize = calculateGapSize(saveData.selectedMode, sim.score);
    const minGapY = 70;
    const maxGapY = Math.max(minGapY + 20, sim.groundY - gapSize - 60);
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    const obstacleWidth = 58;

    const isMoving =
      saveData.selectedMode === 'hardcore' ||
      (sim.score >= 6 && Math.random() < 0.4);

    const hasCoin = Math.random() < 0.95;
    const hasGem = Math.random() < 0.22;
    const hasPowerup = Math.random() < 0.22;

    let powerupType: PowerupType | undefined;
    if (hasPowerup) {
      const types: PowerupType[] = ['shield', 'magnet', 'slowmo', 'double_score', 'ghost', 'air_bounce'];
      powerupType = types[Math.floor(Math.random() * types.length)];
    }

    const newObs: Obstacle = {
      id: sim.obstacleIdCounter++,
      x: atX,
      topHeight: gapY,
      bottomHeight: Math.max(10, sim.groundY - (gapY + gapSize)),
      gapY,
      gapSize,
      width: obstacleWidth,
      passed: false,
      perfectPassGiven: false,
      nearMissGiven: false,
      verticalSpeed: isMoving ? 35 + Math.random() * 30 : 0,
      verticalDirection: Math.random() > 0.5 ? 1 : -1,
      minGapY,
      maxGapY,
      hasCoin,
      hasGem,
      hasPowerup,
      powerupType,
      coinCollected: false,
      gemCollected: false,
      powerupCollected: false,
    };

    sim.obstacles.push(newObs);

    // Passage gate coins: 2 coins leading smoothly through the gate
    if (hasCoin) {
      const cx = atX + obstacleWidth / 2;
      const cy = gapY + gapSize / 2;
      sim.coins.push({
        id: sim.coinIdCounter++,
        x: cx - 18,
        y: cy,
        isGem: false,
        collected: false,
      });
      sim.coins.push({
        id: sim.coinIdCounter++,
        x: cx + 18,
        y: cy,
        isGem: hasGem,
        collected: false,
      });
    }

    return newObs;
  }, [saveData.selectedMode]);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    const sim = simRef.current;
    const initY = Math.min(260, sim.groundY * 0.45);

    sim.playerX = Math.min(160, sim.width * 0.22);
    sim.playerY = initY;
    sim.playerVy = -180;
    sim.obstacles = [];
    sim.coins = [];
    sim.activePowerups = [];
    sim.score = 0;
    sim.combo = 0;
    sim.distanceMeters = 0;
    sim.coinsEarned = 0;
    sim.gemsEarned = 0;
    sim.nearMisses = 0;
    sim.perfectPasses = 0;
    sim.maxCombo = 0;
    sim.flaps = 0;
    sim.runDuration = 0;
    sim.timeAttackRemaining = 35;
    sim.hitstopTimer = 0;
    sim.invulnerableTimer = 0;
    sim.waddlesBounceUsed = false;
    sim.revivesUsed = 0;
    sim.isReviving = false;
    sim.coinStreak = 0;
    sim.lastCoinTime = 0;
    sim.trauma = 0;

    // Obstacle spacing with generous breathing room (arrive every ~2.2s, not continuously!)
    const spacing =
      saveData.selectedMode === 'zen'
        ? 520
        : saveData.selectedMode === 'hardcore'
        ? 350
        : saveData.selectedMode === 'coin_rush'
        ? 400
        : 440;

    // First obstacle placed nicely ahead at playerX + 460
    let spawnX = sim.playerX + 460;
    const targetPreSpawnMax = Math.max(sim.width + 400, sim.playerX + 1300);

    // Initial welcome coin runway leading smoothly from takeoff to first gate
    spawnCoinFormation(sim.playerX + 80, spawnX - 70, sim.playerY, sim.groundY * 0.45);

    let lastGapY = sim.groundY * 0.45;
    while (spawnX <= targetPreSpawnMax) {
      const newObs = spawnObstacleAt(spawnX);
      // Spawn rich coin formations in the open skies between obstacles!
      spawnCoinFormation(
        spawnX - spacing + 70,
        spawnX - 70,
        lastGapY,
        newObs.gapY + newObs.gapSize / 2
      );
      lastGapY = newObs.gapY + newObs.gapSize / 2;
      spawnX += spacing;
    }
    sim.nextObstacleX = spawnX;

    // Boss setup if in boss mode
    if (saveData.selectedMode === 'boss_challenge') {
      sim.boss = {
        x: sim.width - 90,
        y: sim.groundY * 0.45,
        targetY: sim.groundY * 0.45,
        vy: 0,
        hp: 120,
        maxHp: 120,
        phase: 1,
        attackTimer: 2.5,
        projectiles: [],
      };
    } else {
      sim.boss = null;
    }

    particlesRef.current.clear();

    setHudScore(0);
    setHudCombo(0);
    setHudDistance(0);
    setHudCoins(0);
    setHudGems(0);
    setHudPowerups([]);
    setHudBoss(sim.boss);
    setHudTimeLeft(35);
    setGameState('playing');
    setActiveModal(null);

    soundEngine.playFlap();
  }, [saveData.selectedMode, spawnObstacleAt, spawnCoinFormation]);

  // Pause & Resume
  const handlePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const handleResume = useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  // End Game (Collision / Loss)
  const handleGameOver = useCallback((cause: string) => {
    const sim = simRef.current;
    sim.isReviving = false;
    sim.trauma = 1.0;
    soundEngine.playCrash();

    // Spawn crash explosion debris
    particlesRef.current.spawnBurst(
      sim.playerX,
      sim.playerY,
      24,
      ['#ef4444', '#f97316', '#facc15', '#ffffff'],
      220
    );

    // Save statistics & progression
    const result = storage.recordRun({
      mode: saveData.selectedMode,
      score: sim.score,
      distanceMeters: sim.distanceMeters,
      coins: sim.coinsEarned,
      gems: sim.gemsEarned,
      nearMisses: sim.nearMisses,
      perfectPasses: sim.perfectPasses,
      comboMax: sim.maxCombo,
      flaps: sim.flaps,
      durationSeconds: sim.runDuration,
    });

    const summary: RunSummary = {
      score: sim.score,
      bestScore: storage.getData().stats.highScores[saveData.selectedMode] || sim.score,
      isNewRecord: result.isNewHigh,
      coinsEarned: sim.coinsEarned,
      gemsEarned: sim.gemsEarned,
      distanceMeters: sim.distanceMeters,
      nearMisses: sim.nearMisses,
      perfectPasses: sim.perfectPasses,
      maxCombo: sim.maxCombo,
      durationSeconds: sim.runDuration,
      mode: saveData.selectedMode,
      xpEarned: result.xpGained,
      levelBefore: saveData.level,
      levelAfter: storage.getData().level,
      causeOfDeath: cause,
    };

    setRunSummary(summary);
    setSaveData(storage.getData());
    setGameState('gameover');
  }, [saveData.selectedMode, saveData.level]);

  // Player Crash trigger (offer revive if available)
  const handlePlayerCrash = useCallback((cause: string) => {
    const sim = simRef.current;
    if (sim.isReviving) return;
    if (sim.revivesUsed < 1) {
      sim.isReviving = true;
      sim.playerVy = 0;
      sim.trauma = 0.5;
      soundEngine.playCrash();
      setPendingCrashCause(cause);
      setGameState('reviving');
    } else {
      handleGameOver(cause);
    }
  }, [handleGameOver]);

  // Handle Revive Action
  const handleRevive = useCallback((paymentType: 'gem' | 'coins' | 'free') => {
    const currentData = storage.getData();
    if (paymentType === 'gem' && currentData.gems >= 1) {
      currentData.gems -= 1;
      storage.save();
    } else if (paymentType === 'coins' && currentData.coins >= 50) {
      currentData.coins -= 50;
      storage.save();
    }
    setSaveData({ ...storage.getData() });

    const sim = simRef.current;
    sim.isReviving = false;
    sim.revivesUsed += 1;
    sim.playerY = Math.max(120, sim.groundY * 0.45);
    sim.playerVy = -150;

    // Clear any obstacle currently on top of or immediately next to player
    sim.obstacles = sim.obstacles.filter(
      (o) => o.x > sim.playerX + 180 || o.x + o.width < sim.playerX - 80
    );

    // Grant 3.5s golden invulnerability shield & ghost mode
    sim.invulnerableTimer = 3.5;
    sim.activePowerups = [
      { type: 'shield', remainingMs: 3500, totalMs: 3500 },
      { type: 'ghost', remainingMs: 2500, totalMs: 2500 },
    ];

    soundEngine.playRevive();
    particlesRef.current.spawnBurst(
      sim.playerX,
      sim.playerY,
      30,
      ['#fde047', '#f59e0b', '#38bdf8', '#ffffff'],
      220
    );
    particlesRef.current.spawnFloatingText(sim.playerX, sim.playerY - 25, 'REVIVED! GLIDE ON!', '#facc15');

    setGameState('playing');
  }, []);

  const handleReviveSkip = useCallback(() => {
    simRef.current.isReviving = false;
    handleGameOver(pendingCrashCause || 'Flight Ended');
  }, [handleGameOver, pendingCrashCause]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerFlap();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (gameState === 'playing') handlePause();
        else if (gameState === 'paused') handleResume();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'gameover' || gameState === 'paused') {
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap, handlePause, handleResume, handleStartGame, gameState]);

  // 60 FPS Simulation & Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamped simulation step

      const sim = simRef.current;
      sim.totalTime += dt;

      // Handle screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (sim.trauma > 0 && saveData.settings.screenShake) {
        sim.trauma = Math.max(0, sim.trauma - dt * 2.2);
        const shakeMag = sim.trauma * sim.trauma * 16;
        shakeX = (Math.random() - 0.5) * shakeMag;
        shakeY = (Math.random() - 0.5) * shakeMag;
      }

      const isPlaying = gameState === 'playing';

      if (isPlaying) {
        sim.runDuration += dt;

        // Hitstop check
        if (sim.hitstopTimer > 0) {
          sim.hitstopTimer -= dt;
        } else {
          // Time attack countdown
          if (saveData.selectedMode === 'time_attack') {
            sim.timeAttackRemaining -= dt;
            if (sim.timeAttackRemaining <= 0) {
              handleGameOver('Out of Flight Time!');
            }
          }

          // Invulnerability timer decay
          if (sim.invulnerableTimer > 0) {
            sim.invulnerableTimer -= dt;
          }

          // Active Powerup timers decay
          for (let i = sim.activePowerups.length - 1; i >= 0; i--) {
            const pu = sim.activePowerups[i];
            pu.remainingMs -= dt * 1000;
            if (pu.remainingMs <= 0) {
              sim.activePowerups.splice(i, 1);
            }
          }

          const hasSlowmo = sim.activePowerups.some((p) => p.type === 'slowmo');
          const timeScale = hasSlowmo ? 0.65 : 1.0;
          const simDt = dt * timeScale;

          // Scroll speed
          const scrollSpeed = calculateScrollSpeed(saveData.selectedMode, sim.score);
          const moveX = scrollSpeed * simDt;
          sim.distanceMeters += (moveX * 0.12);

          // Gravity and Player movement
          let gravity = activeCharacter.baseGravity;
          if (saveData.selectedMode === 'zen') gravity *= 0.78;
          if (saveData.selectedMode === 'hardcore') gravity *= 1.15;

          // Pip Aero Glide passive
          if (activeCharacter.id === 'pip' && sim.playerVy > 60) {
            gravity *= 0.88;
          }

          sim.playerVy += gravity * simDt;
          sim.playerY += sim.playerVy * simDt;

          // Trail spawn
          if (Math.random() < 0.45) {
            particlesRef.current.spawnTrail(
              sim.playerX - activeCharacter.radius + 2,
              sim.playerY,
              saveData.selectedTrail
            );
          }

          // Ceiling & Ground collision
          const boundHit = checkBoundaryCollision(
            { x: sim.playerX, y: sim.playerY, radius: activeCharacter.radius },
            sim.ceilingY,
            sim.groundY
          );

          if (boundHit.collides) {
            if (activeCharacter.id === 'waddles' && !sim.waddlesBounceUsed) {
              // Waddles absorbs 1 bounce
              sim.waddlesBounceUsed = true;
              sim.playerVy = boundHit.isGround ? -240 : 180;
              sim.playerY = boundHit.isGround ? sim.groundY - activeCharacter.radius - 4 : sim.ceilingY + activeCharacter.radius + 4;
              soundEngine.playNearMiss();
              particlesRef.current.spawnFloatingText(sim.playerX, sim.playerY, 'PENGUIN BOUNCE!', '#38bdf8');
            } else {
              handlePlayerCrash(boundHit.isGround ? 'Crashed into Ground' : 'Hit Cloud Ceiling');
            }
          }

          // World movement moves the spawn horizon toward the screen
          sim.nextObstacleX -= moveX;

          // Spawn new obstacles dynamically with generous breathing room and skies full of coins
          const spacing =
            saveData.selectedMode === 'zen'
              ? 520
              : saveData.selectedMode === 'hardcore'
              ? 350
              : saveData.selectedMode === 'coin_rush'
              ? 400
              : 440;

          // Seamlessly generate incoming obstacles and coin formations as the player flies forward
          while (sim.nextObstacleX <= sim.width + 350) {
            const prevObs = sim.obstacles[sim.obstacles.length - 1];
            const prevX = prevObs ? prevObs.x : sim.nextObstacleX - spacing;
            const prevY = prevObs ? prevObs.gapY + prevObs.gapSize / 2 : sim.groundY * 0.45;

            const newObs = spawnObstacleAt(sim.nextObstacleX);
            // Spawn coin stream between the previous pillar and this new pillar!
            spawnCoinFormation(prevX + 70, sim.nextObstacleX - 70, prevY, newObs.gapY + newObs.gapSize / 2);

            sim.nextObstacleX += spacing;
          }

          // Update obstacles
          const hasGhost = sim.activePowerups.some((p) => p.type === 'ghost');
          const hasShield = sim.activePowerups.some((p) => p.type === 'shield');

          for (let i = sim.obstacles.length - 1; i >= 0; i--) {
            const obs = sim.obstacles[i];
            obs.x -= moveX;

            // Vertical movement if moving obstacle
            if (obs.verticalSpeed > 0) {
              obs.gapY += obs.verticalSpeed * obs.verticalDirection * simDt;
              if (obs.gapY <= obs.minGapY) {
                obs.gapY = obs.minGapY;
                obs.verticalDirection = 1;
              } else if (obs.gapY >= obs.maxGapY) {
                obs.gapY = obs.maxGapY;
                obs.verticalDirection = -1;
              }
              obs.topHeight = obs.gapY;
              obs.bottomHeight = sim.groundY - (obs.gapY + obs.gapSize);
            }

            // Check obstacle pass
            if (!obs.passed && obs.x + obs.width < sim.playerX) {
              obs.passed = true;
              sim.score += 1;
              sim.combo += 1;
              if (sim.combo > sim.maxCombo) sim.maxCombo = sim.combo;

              // Time attack bonus
              if (saveData.selectedMode === 'time_attack') {
                sim.timeAttackRemaining = Math.min(60, sim.timeAttackRemaining + 2.5);
              }

              // Boss damage
              if (sim.boss && sim.boss.hp > 0) {
                sim.boss.hp = Math.max(0, sim.boss.hp - 10);
                if (sim.boss.hp === 0) {
                  particlesRef.current.spawnFloatingText(sim.playerX, sim.playerY, 'BOSS DEFEATED! +500', '#facc15');
                  sim.coinsEarned += 100;
                  sim.gemsEarned += 5;
                }
              }

              // Evaluate pass quality
              const quality = evaluatePassQuality(
                sim.playerY,
                activeCharacter.radius,
                obs.gapY,
                obs.gapSize
              );

              if (quality.isPerfect && !obs.perfectPassGiven) {
                obs.perfectPassGiven = true;
                sim.perfectPasses += 1;
                particlesRef.current.spawnFloatingText(sim.playerX, sim.playerY - 20, 'PERFECT PASS! +50', '#38bdf8');
                sim.coinsEarned += 2;
              } else if (quality.isNearMiss && !obs.nearMissGiven) {
                obs.nearMissGiven = true;
                sim.nearMisses += 1;
                soundEngine.playNearMiss();
                const bonusCoins = activeCharacter.id === 'ignis' ? 4 : 1;
                sim.coinsEarned += bonusCoins;
                particlesRef.current.spawnFloatingText(
                  sim.playerX,
                  sim.playerY - 20,
                  activeCharacter.id === 'ignis' ? 'FIRE SURGE! +100' : 'NEAR MISS!',
                  '#f97316'
                );
              }

              soundEngine.playScore(sim.combo);
            }

            // Collision check with top and bottom pillars (unless ghost or invulnerable)
            if (!hasGhost && sim.invulnerableTimer <= 0) {
              const playerCircle = {
                x: sim.playerX,
                y: sim.playerY,
                radius: activeCharacter.radius,
              };
              const topRect = { x: obs.x, y: 0, width: obs.width, height: obs.topHeight };
              const bottomRect = {
                x: obs.x,
                y: sim.groundY - obs.bottomHeight,
                width: obs.width,
                height: obs.bottomHeight,
              };

              const hitTop = checkCircleRectCollision(playerCircle, topRect);
              const hitBottom = checkCircleRectCollision(playerCircle, bottomRect);

              if (hitTop || hitBottom) {
                if (hasShield) {
                  // Shield absorbs the blow!
                  const shieldIdx = sim.activePowerups.findIndex((p) => p.type === 'shield');
                  if (shieldIdx >= 0) sim.activePowerups.splice(shieldIdx, 1);
                  sim.invulnerableTimer = 1.2;
                  sim.trauma = 0.6;
                  soundEngine.playShieldBreak();
                  particlesRef.current.spawnBurst(
                    sim.playerX,
                    sim.playerY,
                    16,
                    ['#38bdf8', '#ffffff'],
                    140
                  );
                  particlesRef.current.spawnFloatingText(sim.playerX, sim.playerY - 15, 'SHIELD SAVED!', '#38bdf8');
                } else {
                  handlePlayerCrash('Collided with Obstacle Pillar');
                }
              }
            }

            // Power-up pickup collision
            if (obs.hasPowerup && !obs.powerupCollected && obs.powerupType) {
              const puX = obs.x + obs.width / 2;
              const puY = obs.gapY + obs.gapSize / 2;
              const dx = sim.playerX - puX;
              const dy = sim.playerY - puY;
              if (dx * dx + dy * dy < 28 * 28) {
                obs.powerupCollected = true;
                soundEngine.playPowerup();

                let duration = 8000;
                if (activeCharacter.id === 'cosmo') duration += 3500; // Cosmo ability

                // Add or renew powerup
                const existing = sim.activePowerups.find((p) => p.type === obs.powerupType);
                if (existing) {
                  existing.remainingMs = duration;
                } else {
                  sim.activePowerups.push({
                    type: obs.powerupType,
                    remainingMs: duration,
                    totalMs: duration,
                  });
                }

                particlesRef.current.spawnFloatingText(
                  sim.playerX,
                  sim.playerY - 20,
                  `${obs.powerupType.replace('_', ' ').toUpperCase()}!`,
                  '#facc15'
                );
              }
            }

            // Remove offscreen obstacles
            if (obs.x + obs.width < -100) {
              sim.obstacles.splice(i, 1);
            }
          }

          // Update Coins & Magnet Pull
          const hasMagnet =
            sim.activePowerups.some((p) => p.type === 'magnet') || activeCharacter.id === 'bolt';
          const magnetRadius = hasMagnet ? (activeCharacter.id === 'bolt' ? 220 : 170) : 0;
          const hasDoubleScore = sim.activePowerups.some((p) => p.type === 'double_score');

          for (let i = sim.coins.length - 1; i >= 0; i--) {
            const coin = sim.coins[i];
            coin.x -= moveX;

            // Magnet pull towards player
            if (hasMagnet && !coin.collected) {
              const pulled = calculateMagnetPull(
                { x: coin.x, y: coin.y },
                { x: sim.playerX, y: sim.playerY },
                magnetRadius,
                550,
                simDt
              );
              coin.x = pulled.x;
              coin.y = pulled.y;
            }

            // Coin collect collision with musical pentatonic streak chime
            if (!coin.collected) {
              const cdx = sim.playerX - coin.x;
              const cdy = sim.playerY - coin.y;
              if (cdx * cdx + cdy * cdy < (activeCharacter.radius + 14) * (activeCharacter.radius + 14)) {
                coin.collected = true;
                const now = sim.totalTime;
                if (now - sim.lastCoinTime < 0.9) {
                  sim.coinStreak = Math.min(6, sim.coinStreak + 1);
                } else {
                  sim.coinStreak = 0;
                }
                sim.lastCoinTime = now;

                if (coin.isGem) {
                  sim.gemsEarned += 1;
                  soundEngine.playGem();
                  particlesRef.current.spawnCoinSparkle(coin.x, coin.y, true);
                  particlesRef.current.spawnFloatingText(coin.x, coin.y, '+1 GEM!', '#06b6d4');
                } else {
                  const coinValue = hasDoubleScore ? 2 : 1;
                  sim.coinsEarned += coinValue;
                  soundEngine.playCoin(sim.coinStreak);
                  particlesRef.current.spawnCoinSparkle(coin.x, coin.y, false);
                  particlesRef.current.spawnFloatingText(coin.x, coin.y, `+${coinValue}`, '#facc15');
                }
              }
            }

            if (coin.x < -50 || coin.collected) {
              sim.coins.splice(i, 1);
            }
          }

          // Boss updates
          if (sim.boss && sim.boss.hp > 0) {
            const boss = sim.boss;
            // Bob up and down targeting player Y
            boss.targetY = sim.playerY;
            boss.y += (boss.targetY - boss.y) * simDt * 1.5;

            boss.attackTimer -= simDt;
            if (boss.attackTimer <= 0) {
              boss.attackTimer = 2.4 - boss.phase * 0.3;
              // Launch projectile
              boss.projectiles.push({
                x: boss.x - 30,
                y: boss.y,
                vx: -240,
                vy: (sim.playerY - boss.y) * 0.5,
                radius: 8,
                active: true,
              });
              soundEngine.playNearMiss();
            }

            // Update boss projectiles
            for (let pIdx = boss.projectiles.length - 1; pIdx >= 0; pIdx--) {
              const proj = boss.projectiles[pIdx];
              proj.x += proj.vx * simDt;
              proj.y += proj.vy * simDt;

              // Check projectile collision with player
              if (proj.active && sim.invulnerableTimer <= 0 && !hasGhost) {
                const pdx = sim.playerX - proj.x;
                const pdy = sim.playerY - proj.y;
                if (pdx * pdx + pdy * pdy < (activeCharacter.radius + proj.radius) * (activeCharacter.radius + proj.radius)) {
                  proj.active = false;
                  if (hasShield) {
                    const shieldIdx = sim.activePowerups.findIndex((p) => p.type === 'shield');
                    if (shieldIdx >= 0) sim.activePowerups.splice(shieldIdx, 1);
                    sim.invulnerableTimer = 1.0;
                    soundEngine.playShieldBreak();
                  } else {
                    handlePlayerCrash('Struck by Sky Titan Laser');
                  }
                }
              }

              if (proj.x < -30) {
                boss.projectiles.splice(pIdx, 1);
              }
            }
          }

          // Throttle UI HUD updates
          if (Math.random() < 0.25) {
            setHudScore(sim.score);
            setHudCombo(sim.combo);
            setHudDistance(sim.distanceMeters);
            setHudCoins(sim.coinsEarned);
            setHudGems(sim.gemsEarned);
            setHudPowerups([...sim.activePowerups]);
            setHudBoss(sim.boss ? { ...sim.boss } : null);
            setHudTimeLeft(sim.timeAttackRemaining);
          }
        }
      }

      // Update particles
      particlesRef.current.update(dt);

      // Render Canvas
      if (rendererRef.current) {
        rendererRef.current.render({
          width: sim.width,
          height: sim.height,
          playerX: sim.playerX,
          playerY: sim.playerY,
          playerVy: sim.playerVy,
          playerRadius: activeCharacter.radius,
          character: activeCharacter,
          skin: activeSkin,
          trailType: saveData.selectedTrail,
          world: activeWorld,
          obstacles: sim.obstacles,
          coins: sim.coins,
          activePowerups: sim.activePowerups,
          boss: sim.boss,
          scrollSpeed: calculateScrollSpeed(saveData.selectedMode, sim.score),
          shakeOffset: { x: shakeX, y: shakeY },
          totalTime: sim.totalTime,
          groundY: sim.groundY,
          isPlaying,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, activeCharacter, activeSkin, activeWorld, saveData, handleGameOver]);

  // Daily Reward Claim handler
  const handleClaimDaily = () => {
    const res = storage.claimDaily();
    if (res) {
      soundEngine.playGem();
      particlesRef.current.spawnBurst(simRef.current.width / 2, 100, 25, ['#facc15', '#38bdf8', '#ffffff'], 200);
      setSaveData({ ...storage.getData() });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none touch-none"
      onPointerDown={(e) => {
        // Only trigger canvas tap flap if clicking on the play field, not inside interactive buttons/modals
        if ((e.target as HTMLElement).closest('button, input, select, [data-interactive]')) {
          return;
        }
        triggerFlap();
      }}
    >
      {/* 60 FPS HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-pointer" />

      {/* Screen 1: Title Screen & Navigation Menu */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenModal={(modal) => setActiveModal(modal)}
          saveData={saveData}
          activeCharacter={activeCharacter}
          activeWorld={activeWorld}
          selectedMode={saveData.selectedMode}
          onSelectMode={(mode) => {
            storage.selectMode(mode);
            setSaveData({ ...storage.getData() });
          }}
          onClaimDaily={handleClaimDaily}
          canClaimDaily={storage.canClaimDaily()}
        />
      )}

      {/* Screen 2: In-Game HUD */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <GameHUD
          score={hudScore}
          combo={hudCombo}
          distanceMeters={hudDistance}
          coinsEarned={hudCoins}
          gemsEarned={hudGems}
          activePowerups={hudPowerups}
          boss={hudBoss}
          mode={saveData.selectedMode}
          timeLeft={saveData.selectedMode === 'time_attack' ? hudTimeLeft : undefined}
          isMuted={isMuted}
          character={activeCharacter}
          skinId={activeSkinId}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundEngine.setSfxEnabled(!next);
            soundEngine.setMusicEnabled(!next);
          }}
          onPause={handlePause}
        />
      )}

      {/* Screen 3: Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleStartGame}
          onHome={() => {
            setGameState('title');
          }}
          settings={saveData.settings}
          onUpdateSettings={(newSettings) => {
            storage.updateSettings(newSettings);
            setSaveData({ ...storage.getData() });
          }}
        />
      )}

      {/* Screen: Revive / Second Chance Modal */}
      {gameState === 'reviving' && (
        <ReviveModal
          score={hudScore}
          distanceMeters={hudDistance}
          cause={pendingCrashCause || 'Crashed!'}
          saveData={saveData}
          onRevive={handleRevive}
          onSkip={handleReviveSkip}
        />
      )}

      {/* Screen 4: Game Over Modal */}
      {gameState === 'gameover' && runSummary && (
        <GameOverModal
          summary={runSummary}
          saveData={saveData}
          onRestart={handleStartGame}
          onHome={() => {
            setGameState('title');
          }}
        />
      )}

      {/* Modal Overlays */}
      {activeModal === 'characters' && (
        <CharacterModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
          onSelectCharacter={(charId) => {
            storage.selectCharacter(charId);
            setSaveData({ ...storage.getData() });
          }}
          onSelectSkin={(charId, skinId) => {
            storage.selectSkin(charId, skinId);
            setSaveData({ ...storage.getData() });
          }}
          onSelectTrail={(trail) => {
            storage.selectTrail(trail);
            setSaveData({ ...storage.getData() });
          }}
          onUnlockCharacter={(charId) => {
            if (storage.unlockCharacter(charId)) {
              setSaveData({ ...storage.getData() });
            }
          }}
          onUnlockSkin={(skinId, cost) => {
            if (storage.unlockSkin(skinId, cost)) {
              setSaveData({ ...storage.getData() });
            }
          }}
          onUnlockTrail={(trail, cost) => {
            if (storage.unlockTrail(trail, cost)) {
              setSaveData({ ...storage.getData() });
            }
          }}
        />
      )}

      {activeModal === 'worlds' && (
        <WorldModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
          onSelectWorld={(worldId) => {
            storage.selectWorld(worldId);
            setSaveData({ ...storage.getData() });
          }}
          onUnlockWorld={(worldId, cost) => {
            if (storage.unlockWorld(worldId, cost)) {
              setSaveData({ ...storage.getData() });
            }
          }}
        />
      )}

      {activeModal === 'missions' && (
        <MissionsModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
          onClaimMission={(mId) => {
            if (storage.claimMission(mId)) {
              setSaveData({ ...storage.getData() });
            }
          }}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
          onClaimAchievement={(aId) => {
            if (storage.claimAchievement(aId)) {
              setSaveData({ ...storage.getData() });
            }
          }}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
          onUnlockCharacter={(charId) => {
            if (storage.unlockCharacter(charId)) {
              setSaveData({ ...storage.getData() });
            }
          }}
          onUnlockSkin={(skinId, cost) => {
            if (storage.unlockSkin(skinId, cost)) {
              setSaveData({ ...storage.getData() });
            }
          }}
          onUnlockTrail={(trail, cost) => {
            if (storage.unlockTrail(trail, cost)) {
              setSaveData({ ...storage.getData() });
            }
          }}
        />
      )}

      {activeModal === 'records' && (
        <RecordsModal
          onClose={() => setActiveModal(null)}
          saveData={saveData}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          settings={saveData.settings}
          onUpdateSettings={(newSettings) => {
            storage.updateSettings(newSettings);
            setSaveData({ ...storage.getData() });
          }}
        />
      )}
    </div>
  );
}
