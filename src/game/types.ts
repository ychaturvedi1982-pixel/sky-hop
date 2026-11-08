export type GameMode =
  | 'classic'
  | 'zen'
  | 'hardcore'
  | 'time_attack'
  | 'coin_rush'
  | 'boss_challenge';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'reviving';

export type CharacterRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type TrailType = 'clouds' | 'rainbow' | 'stardust' | 'neon' | 'fire' | 'bubbles';

export interface CharacterSkin {
  id: string;
  name: string;
  rarity: CharacterRarity;
  costCoins: number;
  unlocked: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  species: string;
  description: string;
  rarity: CharacterRarity;
  unlocked: boolean;
  costCoins: number;
  costGems: number;
  baseGravity: number;
  flapImpulse: number;
  radius: number;
  abilityName: string;
  abilityDesc: string;
  statSpeed: number; // 1-5
  statControl: number; // 1-5
  statMagnet: number; // 1-5
  skins: CharacterSkin[];
  defaultSkinId: string;
}

export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'stars' | 'cherry_petals';

export interface WorldDef {
  id: string;
  name: string;
  description: string;
  theme: string;
  unlocked: boolean;
  unlockLevel: number;
  costCoins: number;
  skyTop: string;
  skyBottom: string;
  horizonColor: string;
  cloudColor: string;
  groundColor: string;
  groundGrassColor: string;
  pillarColor: string;
  pillarAccentColor: string;
  weather: WeatherType;
}

export type PowerupType =
  | 'shield'
  | 'slowmo'
  | 'magnet'
  | 'double_score'
  | 'ghost'
  | 'air_bounce';

export interface ActivePowerup {
  type: PowerupType;
  remainingMs: number;
  totalMs: number;
}

export interface Obstacle {
  id: number;
  x: number;
  topHeight: number;
  bottomHeight: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
  perfectPassGiven: boolean;
  nearMissGiven: boolean;
  verticalSpeed: number;
  verticalDirection: number;
  minGapY: number;
  maxGapY: number;
  hasCoin: boolean;
  hasGem: boolean;
  hasPowerup: boolean;
  powerupType?: PowerupType;
  coinCollected?: boolean;
  gemCollected?: boolean;
  powerupCollected?: boolean;
}

export interface CoinPickup {
  id: number;
  x: number;
  y: number;
  isGem: boolean;
  collected: boolean;
}

export interface BossEntity {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  hp: number;
  maxHp: number;
  phase: number;
  attackTimer: number;
  projectiles: BossProjectile[];
}

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: CharacterRarity;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardGems: number;
}

export interface RunSummary {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  coinsEarned: number;
  gemsEarned: number;
  distanceMeters: number;
  nearMisses: number;
  perfectPasses: number;
  maxCombo: number;
  durationSeconds: number;
  mode: GameMode;
  xpEarned: number;
  levelBefore: number;
  levelAfter: number;
  causeOfDeath: string;
}

export interface PlayerStats {
  totalRuns: number;
  totalFlaps: number;
  totalObstaclesPassed: number;
  totalCoinsCollected: number;
  totalGemsCollected: number;
  totalDistanceMeters: number;
  totalNearMisses: number;
  totalPlayTimeSeconds: number;
  bestCombo: number;
  highScores: Record<GameMode, number>;
  bestDistance: Record<GameMode, number>;
}

export interface PlayerSaveData {
  coins: number;
  gems: number;
  xp: number;
  level: number;
  selectedCharacterId: string;
  selectedSkinId: Record<string, string>;
  selectedTrail: TrailType;
  selectedWorldId: string;
  selectedMode: GameMode;
  unlockedCharacters: string[];
  unlockedSkins: string[]; // skinId
  unlockedTrails: TrailType[];
  unlockedWorlds: string[];
  stats: PlayerStats;
  missions: Mission[];
  achievements: Achievement[];
  lastDailyClaimDate: string;
  dailyStreak: number;
  settings: GameSettings;
}

export interface GameSettings {
  sfxVolume: number; // 0-1
  musicVolume: number; // 0-1
  musicEnabled: boolean;
  sfxEnabled: boolean;
  screenShake: boolean;
  particleDensity: 'high' | 'medium' | 'low';
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high_contrast';
  controls: {
    tapAnywhere: boolean;
    spaceBar: boolean;
    arrowUp: boolean;
  };
}
