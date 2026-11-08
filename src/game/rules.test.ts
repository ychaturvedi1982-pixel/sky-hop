import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCircleRectCollision,
  checkBoundaryCollision,
  calculateScrollSpeed,
  calculateGapSize,
  calculateComboMultiplier,
  evaluatePassQuality,
  calculateLevelFromXp,
  getXpRequiredForLevel,
  calculateMagnetPull,
} from './physics';

test('checkCircleRectCollision detects overlap and separation', () => {
  const circle = { x: 100, y: 100, radius: 20 };

  // Rect inside or touching circle
  const collidingRect = { x: 90, y: 110, width: 40, height: 100 };
  assert.equal(checkCircleRectCollision(circle, collidingRect), true);

  // Rect far away
  const distantRect = { x: 200, y: 200, width: 50, height: 50 };
  assert.equal(checkCircleRectCollision(circle, distantRect), false);

  // Corner touching
  const cornerRect = { x: 120, y: 120, width: 50, height: 50 };
  assert.equal(checkCircleRectCollision(circle, cornerRect), false); // center (100,100) to (120,120) distSq = 800 > 400
});

test('checkBoundaryCollision detects ground and ceiling hits', () => {
  const circle = { x: 100, y: 500, radius: 18 };
  const ceilingY = 0;
  const groundY = 510;

  // Circle is below groundY - radius = 492
  const groundHit = checkBoundaryCollision(circle, ceilingY, groundY);
  assert.equal(groundHit.collides, true);
  assert.equal(groundHit.isGround, true);

  // In safe zone
  const safeCircle = { x: 100, y: 250, radius: 18 };
  const safeCheck = checkBoundaryCollision(safeCircle, ceilingY, groundY);
  assert.equal(safeCheck.collides, false);

  // Ceiling hit
  const ceilingCircle = { x: 100, y: 15, radius: 18 };
  const ceilingHit = checkBoundaryCollision(ceilingCircle, ceilingY, groundY);
  assert.equal(ceilingHit.collides, true);
  assert.equal(ceilingHit.isGround, false);
});

test('calculateScrollSpeed returns appropriate speed curves for modes', () => {
  const zenSpeed0 = calculateScrollSpeed('zen', 0);
  const zenSpeed20 = calculateScrollSpeed('zen', 20);
  assert.equal(zenSpeed0, 160);
  assert.ok(zenSpeed20 >= 160 && zenSpeed20 <= 220);

  const hardcoreSpeed0 = calculateScrollSpeed('hardcore', 0);
  const hardcoreSpeed20 = calculateScrollSpeed('hardcore', 20);
  assert.equal(hardcoreSpeed0, 290);
  assert.ok(hardcoreSpeed20 > hardcoreSpeed0);
  assert.ok(hardcoreSpeed20 <= 520);
});

test('calculateGapSize shrinks gradually with floor limit', () => {
  const initialGap = calculateGapSize('classic', 0);
  const lateGap = calculateGapSize('classic', 50);
  assert.equal(initialGap, 160);
  assert.ok(lateGap < initialGap);
  assert.ok(lateGap >= 110);
});

test('calculateComboMultiplier scales with combo tiers', () => {
  assert.equal(calculateComboMultiplier(0), 1);
  assert.equal(calculateComboMultiplier(2), 1);
  assert.equal(calculateComboMultiplier(3), 2);
  assert.equal(calculateComboMultiplier(5), 2);
  assert.equal(calculateComboMultiplier(6), 3);
  assert.equal(calculateComboMultiplier(8), 3);
  assert.equal(calculateComboMultiplier(9), 4);
});

test('evaluatePassQuality identifies perfect passes and near misses', () => {
  const gapY = 200;
  const gapSize = 160;
  const radius = 18;

  // Center of gap is 280
  const perfect = evaluatePassQuality(280, radius, gapY, gapSize);
  assert.equal(perfect.isPerfect, true);
  assert.equal(perfect.isNearMiss, false);

  // Near top edge: gapY is 200. Player center at 225 -> top of player is 207 -> distToTop is 7px (<22)
  const nearMiss = evaluatePassQuality(225, radius, gapY, gapSize);
  assert.equal(nearMiss.isNearMiss, true);
  assert.equal(nearMiss.isPerfect, false);
});

test('XP calculations correctly map total XP to levels and progression', () => {
  assert.equal(getXpRequiredForLevel(1), 0);
  assert.ok(getXpRequiredForLevel(2) > 0);

  const lvl1 = calculateLevelFromXp(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentLevelXp, 50);

  const req2 = getXpRequiredForLevel(2);
  const lvl2 = calculateLevelFromXp(req2 + 20);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentLevelXp, 20);
});

test('calculateMagnetPull brings coins closer to player', () => {
  const coin = { x: 200, y: 200 };
  const player = { x: 220, y: 200 };
  const pulled = calculateMagnetPull(coin, player, 100, 300, 0.05);

  assert.ok(pulled.x > coin.x, 'Coin should move towards player X');
  assert.equal(pulled.y, coin.y, 'Y position should stay aligned');
});
