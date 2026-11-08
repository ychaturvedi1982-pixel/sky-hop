import {
  PlayerSaveData,
  GameMode,
  TrailType,
  Mission,
  Achievement,
  GameSettings,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  CHARACTERS,
  WORLDS,
} from './constants';
import { calculateLevelFromXp } from './physics';

const STORAGE_KEY = 'sky_hop_save_v1';

function getDefaultSaveData(): PlayerSaveData {
  return {
    coins: 150, // Starting bonus
    gems: 5,
    xp: 0,
    level: 1,
    selectedCharacterId: 'pip',
    selectedSkinId: {
      pip: 'pip_classic',
      bolt: 'bolt_classic',
      ignis: 'ignis_classic',
      aura: 'aura_classic',
      waddles: 'waddles_classic',
      cosmo: 'cosmo_classic',
    },
    selectedTrail: 'clouds',
    selectedWorldId: 'azure',
    selectedMode: 'classic',
    unlockedCharacters: ['pip'],
    unlockedSkins: ['pip_classic'],
    unlockedTrails: ['clouds'],
    unlockedWorlds: ['azure', 'sunset'],
    stats: {
      totalRuns: 0,
      totalFlaps: 0,
      totalObstaclesPassed: 0,
      totalCoinsCollected: 0,
      totalGemsCollected: 0,
      totalDistanceMeters: 0,
      totalNearMisses: 0,
      totalPlayTimeSeconds: 0,
      bestCombo: 0,
      highScores: {
        classic: 0,
        zen: 0,
        hardcore: 0,
        time_attack: 0,
        coin_rush: 0,
        boss_challenge: 0,
      },
      bestDistance: {
        classic: 0,
        zen: 0,
        hardcore: 0,
        time_attack: 0,
        coin_rush: 0,
        boss_challenge: 0,
      },
    },
    missions: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
    achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
    lastDailyClaimDate: '',
    dailyStreak: 0,
    settings: { ...INITIAL_SETTINGS },
  };
}

export class StorageManager {
  private data: PlayerSaveData;

  constructor() {
    this.data = this.load();
  }

  public getData(): PlayerSaveData {
    return this.data;
  }

  private load(): PlayerSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultSaveData();
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure schema migrations
      const defaults = getDefaultSaveData();
      return {
        ...defaults,
        ...parsed,
        stats: {
          ...defaults.stats,
          ...(parsed.stats || {}),
          highScores: {
            ...defaults.stats.highScores,
            ...(parsed.stats?.highScores || {}),
          },
          bestDistance: {
            ...defaults.stats.bestDistance,
            ...(parsed.stats?.bestDistance || {}),
          },
        },
        settings: {
          ...defaults.settings,
          ...(parsed.settings || {}),
        },
      };
    } catch {
      return getDefaultSaveData();
    }
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage limit or private mode
    }
  }

  public updateSettings(newSettings: Partial<GameSettings>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }

  public recordRun(params: {
    mode: GameMode;
    score: number;
    distanceMeters: number;
    coins: number;
    gems: number;
    nearMisses: number;
    perfectPasses: number;
    comboMax: number;
    flaps: number;
    durationSeconds: number;
  }): { isNewHigh: boolean; xpGained: number; levelUp: boolean } {
    const stats = this.data.stats;
    stats.totalRuns += 1;
    stats.totalFlaps += params.flaps;
    stats.totalObstaclesPassed += params.score;
    stats.totalCoinsCollected += params.coins;
    stats.totalGemsCollected += params.gems;
    stats.totalDistanceMeters += params.distanceMeters;
    stats.totalNearMisses += params.nearMisses;
    stats.totalPlayTimeSeconds += Math.round(params.durationSeconds);
    if (params.comboMax > stats.bestCombo) {
      stats.bestCombo = params.comboMax;
    }

    const prevHigh = stats.highScores[params.mode] || 0;
    const isNewHigh = params.score > prevHigh;
    if (isNewHigh) {
      stats.highScores[params.mode] = params.score;
    }

    const prevDist = stats.bestDistance[params.mode] || 0;
    if (params.distanceMeters > prevDist) {
      stats.bestDistance[params.mode] = Math.round(params.distanceMeters);
    }

    // Add currency
    this.data.coins += params.coins;
    this.data.gems += params.gems;

    // Calculate XP: base score * 15 + coins * 2 + nearMisses * 5 + distance/10
    const xpGained = Math.round(
      params.score * 18 +
      params.coins * 2 +
      params.nearMisses * 6 +
      params.perfectPasses * 8 +
      params.distanceMeters * 0.15
    );

    const oldLevel = this.data.level;
    this.data.xp += xpGained;
    const { level: newLevel } = calculateLevelFromXp(this.data.xp);
    this.data.level = newLevel;
    const levelUp = newLevel > oldLevel;

    // Update mission progression
    this.data.missions.forEach((m) => {
      if (m.completed) return;
      if (m.id.includes('pass')) m.current += params.score;
      if (m.id.includes('coins')) m.current += params.coins;
      if (m.id.includes('combo') && params.comboMax >= m.target) m.current = params.comboMax;
      if (m.id.includes('near_miss')) m.current += params.nearMisses;
      if (m.current >= m.target) {
        m.current = m.target;
        m.completed = true;
      }
    });

    // Update achievement progression
    this.data.achievements.forEach((ach) => {
      if (ach.completed) return;
      if (ach.id === 'first_flight') ach.current = Math.min(ach.target, stats.totalObstaclesPassed);
      if (ach.id === 'score_10' || ach.id === 'score_25' || ach.id === 'score_50') {
        ach.current = Math.max(ach.current, params.score);
      }
      if (ach.id === 'combo_5') ach.current = Math.max(ach.current, params.comboMax);
      if (ach.id === 'near_miss_15') ach.current = Math.min(ach.target, stats.totalNearMisses);
      if (ach.id === 'coins_100') ach.current = Math.min(ach.target, stats.totalCoinsCollected);
      if (ach.id === 'gems_10') ach.current = Math.min(ach.target, stats.totalGemsCollected);
      if (ach.id === 'reach_level_5') ach.current = Math.min(ach.target, this.data.level);

      if (ach.current >= ach.target) {
        ach.current = ach.target;
        ach.completed = true;
      }
    });

    // Check world unlocks based on level
    WORLDS.forEach((world) => {
      if (!this.data.unlockedWorlds.includes(world.id) && this.data.level >= world.unlockLevel && world.costCoins === 0) {
        this.data.unlockedWorlds.push(world.id);
      }
    });

    this.save();
    return { isNewHigh, xpGained, levelUp };
  }

  public claimMission(missionId: string): boolean {
    const m = this.data.missions.find((item) => item.id === missionId);
    if (!m || !m.completed || m.claimed) return false;
    m.claimed = true;
    this.data.coins += m.rewardCoins;
    this.data.gems += m.rewardGems;
    this.save();
    return true;
  }

  public claimAchievement(achId: string): boolean {
    const a = this.data.achievements.find((item) => item.id === achId);
    if (!a || !a.completed || a.claimed) return false;
    a.claimed = true;
    this.data.coins += a.rewardCoins;
    this.data.gems += a.rewardGems;
    this.save();
    return true;
  }

  public canClaimDaily(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return this.data.lastDailyClaimDate !== today;
  }

  public claimDaily(): { coins: number; gems: number; streak: number } | null {
    if (!this.canClaimDaily()) return null;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (this.data.lastDailyClaimDate === yesterday) {
      this.data.dailyStreak = (this.data.dailyStreak % 7) + 1;
    } else {
      this.data.dailyStreak = 1;
    }

    this.data.lastDailyClaimDate = today;

    const streakCoins = 100 + this.data.dailyStreak * 40;
    const streakGems = this.data.dailyStreak >= 5 ? 3 : 1;

    this.data.coins += streakCoins;
    this.data.gems += streakGems;
    this.save();

    return { coins: streakCoins, gems: streakGems, streak: this.data.dailyStreak };
  }

  public unlockCharacter(charId: string): boolean {
    const char = CHARACTERS.find((c) => c.id === charId);
    if (!char) return false;
    if (this.data.unlockedCharacters.includes(charId)) return true;
    if (this.data.coins < char.costCoins || this.data.gems < char.costGems) return false;

    this.data.coins -= char.costCoins;
    this.data.gems -= char.costGems;
    this.data.unlockedCharacters.push(charId);
    if (!this.data.unlockedSkins.includes(char.defaultSkinId)) {
      this.data.unlockedSkins.push(char.defaultSkinId);
    }
    this.save();
    return true;
  }

  public unlockSkin(skinId: string, costCoins: number): boolean {
    if (this.data.unlockedSkins.includes(skinId)) return true;
    if (this.data.coins < costCoins) return false;
    this.data.coins -= costCoins;
    this.data.unlockedSkins.push(skinId);
    this.save();
    return true;
  }

  public unlockTrail(trail: TrailType, costCoins: number): boolean {
    if (this.data.unlockedTrails.includes(trail)) return true;
    if (this.data.coins < costCoins) return false;
    this.data.coins -= costCoins;
    this.data.unlockedTrails.push(trail);
    this.save();
    return true;
  }

  public unlockWorld(worldId: string, costCoins: number): boolean {
    if (this.data.unlockedWorlds.includes(worldId)) return true;
    if (this.data.coins < costCoins) return false;
    this.data.coins -= costCoins;
    this.data.unlockedWorlds.push(worldId);
    this.save();
    return true;
  }

  public selectCharacter(charId: string) {
    if (this.data.unlockedCharacters.includes(charId)) {
      this.data.selectedCharacterId = charId;
      this.save();
    }
  }

  public selectSkin(charId: string, skinId: string) {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.selectedSkinId[charId] = skinId;
      this.save();
    }
  }

  public selectTrail(trail: TrailType) {
    if (this.data.unlockedTrails.includes(trail)) {
      this.data.selectedTrail = trail;
      this.save();
    }
  }

  public selectWorld(worldId: string) {
    if (this.data.unlockedWorlds.includes(worldId)) {
      this.data.selectedWorldId = worldId;
      this.save();
    }
  }

  public selectMode(mode: GameMode) {
    this.data.selectedMode = mode;
    this.save();
  }
}

export const storage = new StorageManager();
