import { TrailType } from './types';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  initialSize: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  shape: 'circle' | 'spark' | 'star' | 'bubble' | 'text';
  text?: string;
}

export class ParticleSystem {
  private pool: Particle[] = [];
  private poolSize = 350;
  private nextIndex = 0;

  constructor() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        initialSize: 2,
        alpha: 1,
        color: '#ffffff',
        life: 0,
        maxLife: 1,
        shape: 'circle',
      });
    }
  }

  private acquire(): Particle {
    const p = this.pool[this.nextIndex];
    this.nextIndex = (this.nextIndex + 1) % this.poolSize;
    return p;
  }

  public spawnTrail(x: number, y: number, type: TrailType) {
    const p = this.acquire();
    p.active = true;
    p.x = x + (Math.random() - 0.5) * 6;
    p.y = y + (Math.random() - 0.5) * 6;
    p.vx = -70 - Math.random() * 30;
    p.vy = (Math.random() - 0.5) * 25;
    p.life = 0;

    switch (type) {
      case 'rainbow': {
        const colors = ['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#a855f7'];
        p.color = colors[Math.floor(Math.random() * colors.length)];
        p.size = 5 + Math.random() * 3;
        p.initialSize = p.size;
        p.maxLife = 0.45;
        p.shape = 'circle';
        break;
      }
      case 'stardust': {
        p.color = Math.random() > 0.4 ? '#fde047' : '#ffffff';
        p.size = 3.5 + Math.random() * 2.5;
        p.initialSize = p.size;
        p.maxLife = 0.5;
        p.shape = 'star';
        break;
      }
      case 'fire': {
        p.color = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        p.size = 4 + Math.random() * 4;
        p.initialSize = p.size;
        p.maxLife = 0.4;
        p.shape = 'spark';
        p.vy -= 25; // drift upward
        break;
      }
      case 'neon': {
        p.color = Math.random() > 0.5 ? '#06b6d4' : '#ec4899';
        p.size = 4;
        p.initialSize = 4;
        p.maxLife = 0.35;
        p.shape = 'spark';
        break;
      }
      case 'bubbles': {
        p.color = '#38bdf8';
        p.size = 3 + Math.random() * 4;
        p.initialSize = p.size;
        p.maxLife = 0.55;
        p.shape = 'bubble';
        p.vy -= 30; // buoyant
        break;
      }
      case 'clouds':
      default: {
        p.color = '#ffffff';
        p.size = 5 + Math.random() * 4;
        p.initialSize = p.size;
        p.maxLife = 0.4;
        p.shape = 'circle';
        break;
      }
    }
  }

  public spawnBurst(x: number, y: number, count: number, colors: string[], speed = 160) {
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      p.active = true;
      p.x = x;
      p.y = y;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = speed * (0.5 + Math.random() * 0.8);
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.size = 3 + Math.random() * 4;
      p.initialSize = p.size;
      p.life = 0;
      p.maxLife = 0.45 + Math.random() * 0.35;
      p.shape = 'spark';
    }
  }

  public spawnCoinSparkle(x: number, y: number, isGem = false) {
    const colors = isGem ? ['#38bdf8', '#06b6d4', '#ffffff'] : ['#facc15', '#fef08a', '#fbbf24'];
    this.spawnBurst(x, y, 10, colors, 120);
  }

  public spawnFloatingText(x: number, y: number, text: string, color = '#facc15') {
    const p = this.acquire();
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = 10;
    p.vy = -55;
    p.size = 14;
    p.initialSize = 14;
    p.color = color;
    p.life = 0;
    p.maxLife = 0.8;
    p.shape = 'text';
    p.text = text;
  }

  public update(dt: number) {
    for (let i = 0; i < this.poolSize; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.shape !== 'text') {
        p.size = p.initialSize * (1 - progress * 0.6);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.poolSize; i++) {
      const p = this.pool[i];
      if (!p.active || p.alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.shape === 'text' && p.text) {
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.fillStyle = p.color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // Little cross glint
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 1.6, p.y);
        ctx.lineTo(p.x + p.size * 1.6, p.y);
        ctx.moveTo(p.x, p.y - p.size * 1.6);
        ctx.lineTo(p.x, p.y + p.size * 1.6);
        ctx.stroke();
      } else if (p.shape === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Circle / spark
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public clear() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool[i].active = false;
    }
  }
}
