import type { CharSetId } from './types';
import { CHAR_SETS } from './ball';

export interface TrailSample {
  x: number;
  y: number;
  char: string;
}

export class Trail {
  charSet: CharSetId = 'binary';
  private samples: TrailSample[] = [];
  private lastX = 0;
  private lastY = 0;
  private hasLast = false;

  get pathLength(): number {
    let d = 0;
    for (let i = 1; i < this.samples.length; i++) {
      d += Math.hypot(
        this.samples[i].x - this.samples[i - 1].x,
        this.samples[i].y - this.samples[i - 1].y,
      );
    }
    return d;
  }

  clear(): void {
    this.samples = [];
    this.hasLast = false;
  }

  add(x: number, y: number): void {
    if (this.hasLast) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      if (dx * dx + dy * dy < 9) return;
    }
    this.lastX = x;
    this.lastY = y;
    this.hasLast = true;
    const set = CHAR_SETS[this.charSet];
    this.samples.push({ x, y, char: set[Math.floor(Math.random() * set.length)] });
  }

  trim(maxLength: number): void {
    if (this.samples.length < 2) return;
    let dist = 0;
    let cut = this.samples.length;
    for (let i = this.samples.length - 1; i > 0; i--) {
      const a = this.samples[i];
      const b = this.samples[i - 1];
      dist += Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > maxLength) {
        cut = i - 1;
        break;
      }
    }
    if (cut < this.samples.length) this.samples = this.samples.slice(0, cut + 1);
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    for (const s of this.samples) {
      ctx.fillText(s.char, s.x, s.y);
    }
  }
}
