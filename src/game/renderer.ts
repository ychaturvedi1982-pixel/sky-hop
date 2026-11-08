import {
  CharacterDef,
  CharacterSkin,
  WorldDef,
  Obstacle,
  CoinPickup,
  ActivePowerup,
  TrailType,
  BossEntity,
} from './types';
import { ParticleSystem } from './particles';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ParticleSystem;

  // Parallax offsets
  private bgOffsetFar = 0;
  private bgOffsetMid = 0;
  private groundOffset = 0;

  // Weather particles
  private weatherParticles: { x: number; y: number; speed: number; size: number; drift: number }[] = [];

  constructor(canvas: HTMLCanvasElement, particles: ParticleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.particles = particles;
    this.initWeather();
  }

  private initWeather() {
    this.weatherParticles = [];
    for (let i = 0; i < 40; i++) {
      this.weatherParticles.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        speed: 40 + Math.random() * 90,
        size: 1.5 + Math.random() * 3,
        drift: (Math.random() - 0.5) * 30,
      });
    }
  }

  public resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  public render(params: {
    width: number;
    height: number;
    playerX: number;
    playerY: number;
    playerVy: number;
    playerRadius: number;
    character: CharacterDef;
    skin: CharacterSkin;
    trailType: TrailType;
    world: WorldDef;
    obstacles: Obstacle[];
    coins: CoinPickup[];
    activePowerups: ActivePowerup[];
    boss: BossEntity | null;
    scrollSpeed: number;
    shakeOffset: { x: number; y: number };
    totalTime: number;
    groundY: number;
    isPlaying: boolean;
  }) {
    const {
      width,
      height,
      playerX,
      playerY,
      playerVy,
      playerRadius,
      character,
      skin,
      trailType,
      world,
      obstacles,
      coins,
      activePowerups,
      boss,
      scrollSpeed,
      shakeOffset,
      totalTime,
      groundY,
      isPlaying,
    } = params;

    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
      ctx.translate(shakeOffset.x, shakeOffset.y);
    }

    // 1. Sky Gradient Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, world.skyTop);
    skyGrad.addColorStop(1, world.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Update parallax offsets
    const dtScroll = isPlaying ? scrollSpeed * 0.016 : 30 * 0.016;
    this.bgOffsetFar = (this.bgOffsetFar + dtScroll * 0.15) % 600;
    this.bgOffsetMid = (this.bgOffsetMid + dtScroll * 0.45) % 500;
    this.groundOffset = (this.groundOffset + dtScroll) % 48;

    // 2. Far Mountain / Island Parallax Layer
    this.drawFarLayer(ctx, width, groundY, world, this.bgOffsetFar);

    // 3. Midground Clouds / Structures
    this.drawMidLayer(ctx, width, groundY, world, this.bgOffsetMid, totalTime);

    // 4. Dynamic Weather
    this.drawWeather(ctx, width, height, world.weather, totalTime);

    // 5. Obstacles
    obstacles.forEach((obs) => {
      this.drawObstacle(ctx, obs, groundY, world, totalTime);
    });

    // 6. Coins & Gems
    coins.forEach((coin) => {
      if (!coin.collected) {
        this.drawCoin(ctx, coin.x, coin.y, coin.isGem, totalTime);
      }
    });

    // 7. Boss Entity (if active)
    if (boss && boss.hp > 0) {
      this.drawBoss(ctx, boss, totalTime);
    }

    // 8. Ground Platform & Grass
    this.drawGround(ctx, width, height, groundY, world, this.groundOffset);

    // 9. Particle Layer
    this.particles.draw(ctx);

    // 10. Player Character
    this.drawCharacter(
      ctx,
      playerX,
      playerY,
      playerVy,
      playerRadius,
      character,
      skin,
      activePowerups,
      totalTime
    );

    ctx.restore();
  }

  private drawFarLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number,
    world: WorldDef,
    offset: number
  ) {
    ctx.save();
    ctx.fillStyle = world.horizonColor;
    ctx.globalAlpha = 0.35;

    // Mountain silhouettes
    const mountainWidth = 300;
    const startX = -offset;
    for (let x = startX - mountainWidth; x < width + mountainWidth; x += mountainWidth) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + mountainWidth * 0.5, groundY - 140);
      ctx.lineTo(x + mountainWidth, groundY);
      ctx.fill();

      // Second smaller ridge
      ctx.beginPath();
      ctx.moveTo(x + 100, groundY);
      ctx.lineTo(x + 220, groundY - 95);
      ctx.lineTo(x + 340, groundY);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawMidLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number,
    world: WorldDef,
    offset: number,
    time: number
  ) {
    ctx.save();
    ctx.fillStyle = world.cloudColor;
    ctx.globalAlpha = 0.45;

    // Floating puffy clouds
    const cloudSpan = 260;
    const startX = -offset;
    for (let x = startX - cloudSpan; x < width + cloudSpan; x += cloudSpan) {
      const cy = 110 + Math.sin((x + time * 20) * 0.01) * 20;
      this.drawPuffyCloud(ctx, x, cy, 1.0);
      this.drawPuffyCloud(ctx, x + 140, cy + 80, 0.75);
    }
    ctx.restore();
  }

  private drawPuffyCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.arc(28, -8, 32, 0, Math.PI * 2);
    ctx.arc(60, 0, 24, 0, Math.PI * 2);
    ctx.arc(30, 16, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawWeather(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    weather: string,
    time: number
  ) {
    ctx.save();
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.lineWidth = 1.5;
      for (const p of this.weatherParticles) {
        const px = (p.x - time * 200) % width;
        const py = (p.y + time * 450) % height;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 6, py + 18);
        ctx.stroke();
      }
    } else if (weather === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (const p of this.weatherParticles) {
        const px = (p.x + Math.sin(time + p.drift) * 30) % width;
        const py = (p.y + time * 70) % height;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weather === 'stars') {
      ctx.fillStyle = '#ffffff';
      for (const p of this.weatherParticles) {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 3 + p.x));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x % width, (p.y * 0.7) % (height * 0.65), p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weather === 'cherry_petals') {
      ctx.fillStyle = 'rgba(251, 207, 232, 0.7)';
      for (const p of this.weatherParticles) {
        const px = (p.x + time * 40 + Math.sin(time * 2 + p.drift) * 20) % width;
        const py = (p.y + time * 60) % height;
        ctx.beginPath();
        ctx.ellipse(px, py, p.size * 2, p.size, Math.sin(time + p.drift), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    groundY: number,
    world: WorldDef,
    time: number
  ) {
    const x = obs.x;
    const w = obs.width;
    const topH = obs.topHeight;
    const bottomH = obs.bottomHeight;
    const bottomY = groundY - bottomH;

    ctx.save();

    // Theme-based coloring and ornamentation
    switch (world.theme) {
      case 'clockwork': {
        // Polished warm terracotta and brushed brass steampunk aviation columns
        this.drawClockworkPillar(ctx, x, 0, w, topH, true, time);
        this.drawClockworkPillar(ctx, x, bottomY, w, bottomH, false, time);
        break;
      }
      case 'bioluminescent': {
        // Neon spires
        this.drawPillar(ctx, x, 0, w, topH, '#1e1b4b', '#a855f7', true);
        this.drawPillar(ctx, x, bottomY, w, bottomH, '#1e1b4b', '#a855f7', false);
        // Glowing pulsing core
        const pulse = 0.5 + 0.5 * Math.sin(time * 4 + obs.id);
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, 0);
        ctx.lineTo(x + w / 2, topH);
        ctx.moveTo(x + w / 2, bottomY);
        ctx.lineTo(x + w / 2, groundY);
        ctx.stroke();
        break;
      }
      case 'candy': {
        // Candy cane striped wafer
        this.drawStripedPillar(ctx, x, 0, w, topH, '#be185d', '#fbcfe8', true);
        this.drawStripedPillar(ctx, x, bottomY, w, bottomH, '#be185d', '#fbcfe8', false);
        break;
      }
      case 'ancient': {
        // Overgrown stone totem
        this.drawPillar(ctx, x, 0, w, topH, '#064e3b', '#10b981', true);
        this.drawPillar(ctx, x, bottomY, w, bottomH, '#064e3b', '#10b981', false);
        // Ancient rune mark
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x + w / 2, topH - 24, 10, 0, Math.PI * 1.5);
        ctx.arc(x + w / 2, bottomY + 24, 10, Math.PI * 0.5, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'cyber': {
        // Laser barrier pylon
        this.drawPillar(ctx, x, 0, w, topH, '#0891b2', '#22d3ee', true);
        this.drawPillar(ctx, x, bottomY, w, bottomH, '#0891b2', '#22d3ee', false);
        // Grid highlight
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 1;
        for (let y = 15; y < topH; y += 20) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y);
          ctx.stroke();
        }
        for (let y = bottomY + 15; y < groundY; y += 20) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y);
          ctx.stroke();
        }
        break;
      }
      case 'crystal':
      default: {
        // Azure crystal obelisks
        this.drawPillar(ctx, x, 0, w, topH, world.pillarColor, world.pillarAccentColor, true);
        this.drawPillar(ctx, x, bottomY, w, bottomH, world.pillarColor, world.pillarAccentColor, false);
        break;
      }
    }

    // Draw clear illuminated passage gate between the pillars
    this.drawPassageGate(ctx, x, w, obs.gapY, obs.gapSize, obs.passed, world.theme, time);

    // Power-up orb if present
    if (obs.hasPowerup && !obs.powerupCollected && obs.powerupType) {
      this.drawPowerupOrb(ctx, x + w / 2, obs.gapY + obs.gapSize / 2, obs.powerupType, time);
    }

    ctx.restore();
  }

  private drawPassageGate(
    ctx: CanvasRenderingContext2D,
    x: number,
    w: number,
    gapY: number,
    gapSize: number,
    passed: boolean,
    theme: string,
    time: number
  ) {
    ctx.save();
    const cx = x + w / 2;
    const cy = gapY + gapSize / 2;

    // Glowing gate beacon rings on top and bottom lips
    const pulse = 0.5 + 0.5 * Math.sin(time * 5 + x * 0.04);
    let gateRgb = '56, 189, 248';
    if (theme === 'clockwork') gateRgb = '245, 158, 11';
    if (theme === 'bioluminescent') gateRgb = '168, 85, 247';
    if (theme === 'candy') gateRgb = '244, 114, 182';
    if (theme === 'ancient') gateRgb = '16, 185, 129';
    if (theme === 'cyber') gateRgb = '6, 182, 212';

    // Top and bottom lip glowing jewel guide nodes
    const nodeGlow = passed ? 'rgba(34, 197, 94, 0.95)' : `rgba(${gateRgb}, ${0.85 + pulse * 0.15})`;
    ctx.fillStyle = nodeGlow;
    ctx.beginPath();
    ctx.arc(cx, gapY - 2, 4 + pulse * 1.5, 0, Math.PI * 2);
    ctx.arc(cx, gapY + gapSize + 2, 4 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle soft ambient halo at the entrance
    const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, gapSize * 0.45);
    haloGrad.addColorStop(0, passed ? 'rgba(34, 197, 94, 0.08)' : `rgba(${gateRgb}, 0.06)`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, gapSize * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Flight target ring & directional chevron (if not yet passed)
    if (!passed) {
      // Gentle luminous portal ring
      ctx.strokeStyle = `rgba(${gateRgb}, ${0.2 + pulse * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 15 + pulse * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Clean aerodynamic chevron arrow >
      ctx.strokeStyle = `rgba(${gateRgb}, ${0.55 + pulse * 0.35})`;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 6);
      ctx.lineTo(cx + 3, cy);
      ctx.lineTo(cx - 5, cy + 6);
      ctx.stroke();
    } else {
      // Subtle green passage success ring
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    baseColor: string,
    accentColor: string,
    isTop: boolean
  ) {
    if (h <= 0) return;

    ctx.save();

    // 1. Column Main Body Gradient with Depth Shading
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, accentColor);
    grad.addColorStop(0.25, baseColor);
    grad.addColorStop(0.75, baseColor);
    grad.addColorStop(0.95, '#060a12');
    grad.addColorStop(1, '#020408');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, isTop ? [0, 0, 8, 8] : [8, 8, 0, 0]);
    ctx.fill();

    // 2. Vertical Fluted Shaft Grooves (soft 2.5D column architecture)
    const grooveCount = 3;
    const grooveSpacing = (w - 16) / (grooveCount + 1);
    for (let g = 1; g <= grooveCount; g++) {
      const gx = x + 8 + g * grooveSpacing;
      // Soft shadow groove line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, isTop ? y : y + 16);
      ctx.lineTo(gx, isTop ? y + h - 16 : y + h);
      ctx.stroke();

      // Soft highlight bevel beside groove
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx + 1.5, isTop ? y : y + 16);
      ctx.lineTo(gx + 1.5, isTop ? y + h - 16 : y + h);
      ctx.stroke();
    }

    // 3. Leading edge ambient light rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, y);
    ctx.lineTo(x + 2, y + h);
    ctx.stroke();

    // 4. Stepped Ornate Capital Molding at Gap Edge
    const cap1H = 8;
    const cap2H = 14;
    const overlap1 = 3;
    const overlap2 = 6;

    if (isTop) {
      // Upper tier of stepped cap
      const cap1Y = y + h - cap2H - cap1H;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.roundRect(x - overlap1, cap1Y, w + overlap1 * 2, cap1H, [0, 0, 3, 3]);
      ctx.fill();

      // Golden / Accent Lip Rim
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(x - overlap2, y + h - cap2H, w + overlap2 * 2, cap2H, [0, 0, 8, 8]);
      ctx.fill();

      // Inset Jewel / Power Node in the center of the cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - cap2H / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Golden / Accent Lip Rim
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(x - overlap2, y, w + overlap2 * 2, cap2H, [8, 8, 0, 0]);
      ctx.fill();

      // Lower tier of stepped cap
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.roundRect(x - overlap1, y + cap2H, w + overlap1 * 2, cap1H, [3, 3, 0, 0]);
      ctx.fill();

      // Inset Jewel / Power Node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + cap2H / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawClockworkPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isTop: boolean,
    time: number
  ) {
    if (h <= 0) return;

    ctx.save();

    // 1. Warm Terracotta & Polished Bronze Column Body Gradient
    const bodyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    bodyGrad.addColorStop(0, '#f97316'); // Warm rim highlight on left
    bodyGrad.addColorStop(0.2, '#c2410c'); // Terracotta
    bodyGrad.addColorStop(0.65, '#7c2d12'); // Rich deep bronze shadow
    bodyGrad.addColorStop(0.92, '#431407'); // Deep shadow
    bodyGrad.addColorStop(1, '#1c0a03'); // Ambient occlusion edge
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, isTop ? [0, 0, 8, 8] : [8, 8, 0, 0]);
    ctx.fill();

    // 2. Brushed Brass Structural Riveted Ribs (replaces generic black fluting)
    const bandSpacing = 65;
    for (let by = y + 18; by < y + h - 18; by += bandSpacing) {
      // Horizontal polished brass strap
      const brassGrad = ctx.createLinearGradient(x, 0, x + w, 0);
      brassGrad.addColorStop(0, '#fef08a');
      brassGrad.addColorStop(0.3, '#f59e0b');
      brassGrad.addColorStop(0.8, '#b45309');
      brassGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = brassGrad;
      ctx.fillRect(x + 2, by, w - 4, 5);

      // Tiny brass rivet studs
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 8, by + 2.5, 1.2, 0, Math.PI * 2);
      ctx.arc(x + w / 2, by + 2.5, 1.2, 0, Math.PI * 2);
      ctx.arc(x + w - 8, by + 2.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Subtle vertical architectural depth bevel
    ctx.strokeStyle = 'rgba(255, 237, 213, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, isTop ? y : y + 20);
    ctx.lineTo(x + 4, isTop ? y + h - 20 : y + h);
    ctx.stroke();

    // 4. Stepped Ornate Brass Capital Molding
    const cap1H = 9;
    const cap2H = 15;
    const overlap1 = 4;
    const overlap2 = 7;

    const capBaseY = isTop ? y + h - cap2H : y;
    const capTier2Y = isTop ? y + h - cap2H - cap1H : y + cap2H;

    // Sub-tier collar
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x - overlap1, capTier2Y, w + overlap1 * 2, cap1H, isTop ? [0, 0, 4, 4] : [4, 4, 0, 0]);
    ctx.fill();

    // Polished Brass Capital Lip
    const lipGrad = ctx.createLinearGradient(x - overlap2, 0, x + w + overlap2, 0);
    lipGrad.addColorStop(0, '#fef08a');
    lipGrad.addColorStop(0.3, '#f59e0b');
    lipGrad.addColorStop(0.7, '#d97706');
    lipGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.roundRect(x - overlap2, capBaseY, w + overlap2 * 2, cap2H, isTop ? [0, 0, 9, 9] : [9, 9, 0, 0]);
    ctx.fill();

    // 5. Inset Cockpit Brass Altimeter / Pressure Dial (cleanly embedded inside the capital!)
    const gaugeCenterX = x + w / 2;
    const gaugeCenterY = isTop ? y + h - cap2H / 2 : y + cap2H / 2;
    const gaugeRadius = 6.5;

    // Outer bezel ring
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius + 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Dark dial face
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Amber glowing needle gently swaying
    const needleAngle = Math.sin(time * 2.5 + x * 0.1) * 0.8 - Math.PI / 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gaugeCenterX, gaugeCenterY);
    ctx.lineTo(gaugeCenterX + Math.cos(needleAngle) * (gaugeRadius - 1.2), gaugeCenterY + Math.sin(needleAngle) * (gaugeRadius - 1.2));
    ctx.stroke();

    // Central brass pin
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(gaugeCenterX, gaugeCenterY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Glass specular lens shine reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(gaugeCenterX - 2, gaugeCenterY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawStripedPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    col1: string,
    col2: string,
    isTop: boolean
  ) {
    if (h <= 0) return;
    this.drawPillar(ctx, x, y, w, h, col1, col2, isTop);

    // Diagonal candy stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let stripe = -w; stripe < h + w; stripe += 24) {
      ctx.beginPath();
      ctx.moveTo(x, y + stripe);
      ctx.lineTo(x + w, y + stripe - 20);
      ctx.lineTo(x + w, y + stripe - 8);
      ctx.lineTo(x, y + stripe + 12);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawGear(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i * Math.PI * 2) / teeth;
      const r1 = radius;
      const r2 = radius + 4;
      ctx.arc(0, 0, r1, a, a + Math.PI / teeth / 2);
      ctx.lineTo(Math.cos(a + Math.PI / teeth / 2) * r2, Math.sin(a + Math.PI / teeth / 2) * r2);
      ctx.arc(0, 0, r2, a + Math.PI / teeth / 2, a + Math.PI / teeth);
      ctx.lineTo(Math.cos(a + Math.PI / teeth) * r1, Math.sin(a + Math.PI / teeth) * r1);
    }
    ctx.closePath();
    ctx.fill();

    // Center hole
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawCoin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isGem: boolean,
    time: number
  ) {
    ctx.save();
    const floatY = y + Math.sin(time * 5 + x * 0.08) * 3.5;

    if (isGem) {
      // Shimmering Prism Diamond with Internal Facets
      ctx.translate(x, floatY);
      const pulseScale = 1.0 + 0.08 * Math.sin(time * 7 + x * 0.1);
      ctx.scale(pulseScale, pulseScale);

      // Cyan ambient halo
      const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
      halo.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      halo.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Faceted diamond shape
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(11, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-11, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Internal facet highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Star sparkle glint on peak
      const glintPulse = 0.5 + 0.5 * Math.sin(time * 10 + x);
      if (glintPulse > 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2, -5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Handcrafted 3D Rotating Golden Coin
      ctx.translate(x, floatY);
      const spin = Math.cos(time * 4.5 + x * 0.04);
      const spinScale = Math.max(0.15, Math.abs(spin));

      // Golden ambient glow
      const halo = ctx.createRadialGradient(0, 0, 4, 0, 0, 16);
      halo.addColorStop(0, 'rgba(250, 204, 21, 0.4)');
      halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Apply 3D Y-axis rotation
      ctx.scale(spinScale, 1);

      // 1. Outer Bevel Rim
      const rimGrad = ctx.createLinearGradient(-11, -11, 11, 11);
      rimGrad.addColorStop(0, '#fef08a');
      rimGrad.addColorStop(0.5, '#f59e0b');
      rimGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = rimGrad;
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Inner Coin Disc
      const innerGrad = ctx.createLinearGradient(0, -8, 0, 8);
      innerGrad.addColorStop(0, '#facc15');
      innerGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Embossed Center Star Symbol
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        const a1 = (s * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        if (s === 0) ctx.moveTo(Math.cos(a1) * 4.5, Math.sin(a1) * 4.5);
        else ctx.lineTo(Math.cos(a1) * 4.5, Math.sin(a1) * 4.5);
        ctx.lineTo(Math.cos(a2) * 2.2, Math.sin(a2) * 2.2);
      }
      ctx.closePath();
      ctx.fill();

      // 4. Moving Specular Shine Sweep
      const sweepPhase = (time * 2.5 + x * 0.05) % Math.PI;
      if (sweepPhase < 1.2) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        const sweepX = -8 + sweepPhase * 12;
        ctx.ellipse(sweepX, 0, 2.5, 7, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawPowerupOrb(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: string,
    time: number
  ) {
    ctx.save();
    const floatY = y + Math.sin(time * 4) * 4;
    ctx.translate(x, floatY);

    // Glowing halo
    const glowRadius = 18 + Math.sin(time * 6) * 3;
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRadius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Center orb
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icon glyph
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let symbol = '🛡️';
    if (type === 'magnet') symbol = '🧲';
    if (type === 'slowmo') symbol = '⏳';
    if (type === 'double_score') symbol = '2X';
    if (type === 'ghost') symbol = '👻';
    if (type === 'air_bounce') symbol = '⚡';

    if (symbol === '2X') {
      ctx.fillStyle = '#ffffff';
      ctx.fillText('2X', 0, 0);
    } else {
      ctx.fillText(symbol, 0, 1);
    }

    ctx.restore();
  }

  private drawBoss(ctx: CanvasRenderingContext2D, boss: BossEntity, time: number) {
    ctx.save();
    const bx = boss.x;
    const by = boss.y + Math.sin(time * 3) * 15;

    // Mecha-Hawk / Sky Titan Body
    ctx.translate(bx, by);

    // Wings
    const wingFlap = Math.sin(time * 6) * 18;
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;

    // Top wing
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(25, -45 - wingFlap);
    ctx.lineTo(-15, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bottom wing
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(25, 45 + wingFlap);
    ctx.lineTo(-15, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main hull
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing red eye visor
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-18, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Jet flame behind
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(25, -8);
    ctx.lineTo(42 + Math.random() * 8, 0);
    ctx.lineTo(25, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Boss projectiles
    boss.projectiles.forEach((proj) => {
      if (!proj.active) return;
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawGround(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    groundY: number,
    world: WorldDef,
    offset: number
  ) {
    ctx.save();

    // Ground bedrock
    ctx.fillStyle = world.groundColor;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Grass / surface strip
    ctx.fillStyle = world.groundGrassColor;
    ctx.fillRect(0, groundY, width, 12);

    // Decorative ground tiles / stones
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const tileSize = 48;
    for (let x = -offset; x < width + tileSize; x += tileSize) {
      ctx.beginPath();
      ctx.roundRect(x + 4, groundY + 18, 38, 16, 4);
      ctx.fill();
    }

    // Top surface shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, groundY, width, 2);

    ctx.restore();
  }

  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    vy: number,
    radius: number,
    char: CharacterDef,
    skin: CharacterSkin,
    powerups: ActivePowerup[],
    time: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Rotation based on vertical velocity
    const targetAngle = Math.max(-0.55, Math.min(1.15, vy * 0.0022));
    ctx.rotate(targetAngle);

    // Ghost powerup transparency
    const hasGhost = powerups.some((p) => p.type === 'ghost');
    if (hasGhost) {
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(time * 8);
    }

    // Shield effect aura
    const hasShield = powerups.some((p) => p.type === 'shield');
    if (hasShield) {
      ctx.save();
      const shieldScale = 1.0 + 0.06 * Math.sin(time * 7);
      ctx.scale(shieldScale, shieldScale);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Character model rendering based on character id
    switch (char.id) {
      case 'bolt':
        this.drawModelBolt(ctx, skin, time, vy);
        break;
      case 'ignis':
        this.drawModelIgnis(ctx, skin, time, vy);
        break;
      case 'aura':
        this.drawModelAura(ctx, skin, time, vy);
        break;
      case 'waddles':
        this.drawModelWaddles(ctx, skin, time, vy);
        break;
      case 'cosmo':
        this.drawModelCosmo(ctx, skin, time, vy);
        break;
      case 'pip':
      default:
        this.drawModelPip(ctx, skin, time, vy);
        break;
    }

    ctx.restore();
  }

  /**
   * Pip: Sky Finch
   */
  private drawModelPip(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    vy: number
  ) {
    // Body
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly patch
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(4, 5, 12, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing flap oscillation
    const wingAngle = vy < 0 ? -0.8 : Math.sin(time * 12) * 0.4;
    ctx.save();
    ctx.translate(-4, 0);
    ctx.rotate(wingAngle);
    ctx.fillStyle = skin.primaryColor;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 11, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Beak
    ctx.fillStyle = skin.secondaryColor || '#f97316';
    ctx.beginPath();
    ctx.moveTo(13, -3);
    ctx.lineTo(24, 1);
    ctx.lineTo(13, 5);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(11, -6, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Bolt-8: Cyber Drone
   */
  private drawModelBolt(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    _vy: number
  ) {
    // Chassis
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 24, 7);
    ctx.fill();

    // Spinning top rotor
    const rotorWidth = Math.abs(Math.sin(time * 30)) * 26 + 6;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -17);
    ctx.moveTo(-rotorWidth / 2, -17);
    ctx.lineTo(rotorWidth / 2, -17);
    ctx.stroke();

    // Cyan glowing visor
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(0, -5, 14, 10, 4);
    ctx.fill();

    // Jet thruster nozzle
    ctx.fillStyle = '#475569';
    ctx.fillRect(-20, -4, 5, 8);
    // Exhaust spark
    ctx.fillStyle = skin.accentColor;
    ctx.beginPath();
    ctx.moveTo(-20, -3);
    ctx.lineTo(-27 - Math.random() * 5, 0);
    ctx.lineTo(-20, 3);
    ctx.fill();
  }

  /**
   * Ignis: Ember Drake
   */
  private drawModelIgnis(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    vy: number
  ) {
    // Dragon body
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = skin.accentColor;
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(-12, -22);
    ctx.lineTo(-8, -10);
    ctx.fill();

    // Spiky wing
    const wingAngle = vy < 0 ? -0.7 : Math.sin(time * 10) * 0.45;
    ctx.save();
    ctx.translate(-2, -3);
    ctx.rotate(wingAngle);
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-16, -16);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Golden reptile eye
    ctx.fillStyle = skin.accentColor;
    ctx.beginPath();
    ctx.arc(8, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -7, 1.5, 6); // Slit pupil

    // Nostril flame puff
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.arc(19, 1, 3 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Aura: Monarch Sprite
   */
  private drawModelAura(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    _vy: number
  ) {
    // Slender body
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Butterfly wings flapping
    const flap = Math.sin(time * 16);
    ctx.save();
    ctx.scale(Math.abs(flap) * 0.7 + 0.3, 1);

    // Upper wing
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(-8, -10, 16, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Lower wing
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(-6, 8, 12, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Wing edge spots
    ctx.fillStyle = skin.accentColor;
    ctx.beginPath();
    ctx.arc(-18, -12, 2.5, 0, Math.PI * 2);
    ctx.arc(-13, 11, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Antennae
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, -10);
    ctx.lineTo(8, -18);
    ctx.stroke();
  }

  /**
   * Waddles: Cloud Penguin
   */
  private drawModelWaddles(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    vy: number
  ) {
    // Chubby body
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(5, 2, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beanie propeller
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -16, 5, Math.PI, 0);
    ctx.fill();
    // Propeller spinning
    const pWidth = Math.sin(time * 25) * 16;
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-pWidth / 2, -18);
    ctx.lineTo(pWidth / 2, -18);
    ctx.stroke();

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(22, 1);
    ctx.lineTo(14, 4);
    ctx.closePath();
    ctx.fill();

    // Flipper
    const flipperAngle = vy < 0 ? -0.8 : Math.sin(time * 10) * 0.3;
    ctx.save();
    ctx.translate(-5, 3);
    ctx.rotate(flipperAngle);
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(-3, 0, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cute eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, -5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Cosmo: Celestial UFO
   */
  private drawModelCosmo(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    time: number,
    _vy: number
  ) {
    // Glass dome
    ctx.fillStyle = 'rgba(167, 243, 208, 0.6)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -5, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little alien eyes inside dome
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, -7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Saucer metallic rim
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flashing bottom lights
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing anti-gravity ring
    const pulse = Math.sin(time * 8) * 3;
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 7 + pulse, 10, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
