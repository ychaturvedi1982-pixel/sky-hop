import { GameMode } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * Checks if a circle intersects with an axis-aligned bounding box (rectangle).
 */
export function checkCircleRectCollision(circle: Circle, rect: Rect): boolean {
  // Find the closest point to the circle within the rectangle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;

  const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  return distanceSquared < circle.radius * circle.radius;
}

/**
 * Checks if circle collides with ground or ceiling.
 */
export function checkBoundaryCollision(
  circle: Circle,
  ceilingY: number,
  groundY: number
): { collides: boolean; isGround: boolean } {
  if (circle.y - circle.radius <= ceilingY) {
    return { collides: true, isGround: false };
  }
  if (circle.y + circle.radius >= groundY) {
    return { collides: true, isGround: true };
  }
  return { collides: false, isGround: false };
}

/**
 * Calculates current scroll speed based on game mode and obstacles passed.
 */
export function calculateScrollSpeed(mode: GameMode, obstaclesPassed: number): number {
  let baseSpeed = 220; // pixels per second
  let rampRate = 3.5;

  switch (mode) {
    case 'zen':
      baseSpeed = 160;
      rampRate = 0.5; // very gentle ramp
      break;
    case 'hardcore':
      baseSpeed = 290;
      rampRate = 5.0;
      break;
    case 'time_attack':
      baseSpeed = 260;
      rampRate = 4.0;
      break;
    case 'coin_rush':
      baseSpeed = 210;
      rampRate = 2.5;
      break;
    case 'boss_challenge':
      baseSpeed = 190;
      rampRate = 1.8;
      break;
    case 'classic':
    default:
      baseSpeed = 220;
      rampRate = 3.5;
      break;
  }

  const maxSpeed = mode === 'hardcore' ? 520 : mode === 'zen' ? 220 : 440;
  return Math.min(maxSpeed, baseSpeed + obstaclesPassed * rampRate);
}

/**
 * Determines gap size based on game mode and difficulty.
 */
export function calculateGapSize(mode: GameMode, obstaclesPassed: number): number {
  let baseGap = 160;
  let minGap = 110;

  switch (mode) {
    case 'zen':
      baseGap = 200;
      minGap = 170;
      break;
    case 'hardcore':
      baseGap = 135;
      minGap = 95;
      break;
    case 'coin_rush':
      baseGap = 175;
      minGap = 130;
      break;
    case 'boss_challenge':
      baseGap = 190;
      minGap = 140;
      break;
    case 'classic':
    default:
      baseGap = 160;
      minGap = 110;
      break;
  }

  const shrink = Math.min(baseGap - minGap, Math.floor(obstaclesPassed / 4) * 2.5);
  return Math.max(minGap, baseGap - shrink);
}

/**
 * Evaluates pass quality when passing an obstacle:
 * - perfect: within central 30% of gap
 * - nearMiss: within 22px of top or bottom obstacle border without touching
 */
export function evaluatePassQuality(
  playerY: number,
  playerRadius: number,
  gapY: number,
  gapSize: number
): { isPerfect: boolean; isNearMiss: boolean } {
  const topEdge = gapY;
  const bottomEdge = gapY + gapSize;
  const center = gapY + gapSize / 2;

  const distFromCenter = Math.abs(playerY - center);
  const isPerfect = distFromCenter <= gapSize * 0.16;

  const distToTop = playerY - playerRadius - topEdge;
  const distToBottom = bottomEdge - (playerY + playerRadius);

  const isNearMiss =
    !isPerfect &&
    ((distToTop > 0 && distToTop <= 22) || (distToBottom > 0 && distToBottom <= 22));

  return { isPerfect, isNearMiss };
}

/**
 * Combo multiplier calculation:
 * combo 0-2: 1x
 * combo 3-5: 2x
 * combo 6-8: 3x
 * combo 9+: 4x
 */
export function calculateComboMultiplier(combo: number): number {
  if (combo < 3) return 1;
  if (combo < 6) return 2;
  if (combo < 9) return 3;
  return Math.min(5, 4 + Math.floor((combo - 9) / 5));
}

/**
 * XP Level curve formula:
 * Level 1: 0 - 150
 * Level 2: 151 - 400
 * Level N: 150 * N^1.4
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(150 * Math.pow(level - 1, 1.45));
}

export function calculateLevelFromXp(totalXp: number): { level: number; currentLevelXp: number; nextLevelXp: number } {
  let level = 1;
  while (true) {
    const nextReq = getXpRequiredForLevel(level + 1);
    if (totalXp < nextReq) {
      const curReq = getXpRequiredForLevel(level);
      return {
        level,
        currentLevelXp: totalXp - curReq,
        nextLevelXp: nextReq - curReq,
      };
    }
    level++;
    if (level >= 100) break; // Level cap
  }

  const curReq = getXpRequiredForLevel(100);
  return { level: 100, currentLevelXp: totalXp - curReq, nextLevelXp: 1000 };
}

/**
 * Computes magnetic pull vector toward player.
 */
export function calculateMagnetPull(
  coinPos: Point,
  playerPos: Point,
  magnetRadius: number,
  pullStrength: number,
  dt: number
): Point {
  const dx = playerPos.x - coinPos.x;
  const dy = playerPos.y - coinPos.y;
  const distSq = dx * dx + dy * dy;

  if (distSq <= magnetRadius * magnetRadius && distSq > 4) {
    const dist = Math.sqrt(distSq);
    const speed = pullStrength * (1 - dist / magnetRadius) * dt;
    return {
      x: coinPos.x + (dx / dist) * speed,
      y: coinPos.y + (dy / dist) * speed,
    };
  }

  return { x: coinPos.x, y: coinPos.y };
}
