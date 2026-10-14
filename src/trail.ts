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

  get oldestX(): number {
    return this.samples.length > 0 ? this.samples[0].x : 0;
  }

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
      if (dx * dx + dy * dy < 1) return;
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
    let cut = 0;
    for (let i = this.samples.length - 1; i > 0; i--) {
      const a = this.samples[i];
      const b = this.samples[i - 1];
      dist += Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > maxLength) {
        cut = i;
        break;
      }
    }
    if (cut > 0) this.samples = this.samples.slice(cut);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    color: string,
    headX: number,
    headY: number,
    dirX: number,
    dirY: number,
    radius: number,
    bandWidth: number,
    trailLength: number,
  ): void {
    const n = this.samples.length;
    if (n === 0) return;

    const dists = new Array<number>(n);
    let d = Math.hypot(this.samples[n - 1].x - headX, this.samples[n - 1].y - headY);
    dists[n - 1] = d;
    for (let i = n - 2; i >= 0; i--) {
      d += Math.hypot(
        this.samples[i + 1].x - this.samples[i].x,
        this.samples[i + 1].y - this.samples[i].y,
      );
      dists[i] = d;
    }

    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    const charSpacing = 14;

    for (let i = n - 1; i >= 0; i--) {
      const dist = dists[i];
      if (dist < radius) continue;
      const t = (dist - radius) / Math.max(1, trailLength);
      if (t >= 1) continue;
      const width = bandWidth * (1 - t);
      if (width < charSpacing) continue;

      let lx: number;
      let ly: number;
      if (i < n - 1) {
        const dx = this.samples[i + 1].x - this.samples[i].x;
        const dy = this.samples[i + 1].y - this.samples[i].y;
        const len = Math.hypot(dx, dy);
        if (len < 0.001) {
          lx = dirX;
          ly = dirY;
        } else {
          lx = dx / len;
          ly = dy / len;
        }
      } else {
        lx = dirX;
        ly = dirY;
      }
      const px = -ly;
      const py = lx;

      const count = Math.floor(width / charSpacing);
      const s = this.samples[i];
      for (let k = -count; k <= count; k++) {
        ctx.fillText(s.char, s.x + px * k * charSpacing, s.y + py * k * charSpacing);
      }
    }
  }
}
