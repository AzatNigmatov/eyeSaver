import type { CharSetId, ColorId } from './types';

export const CHAR_SETS: Record<CharSetId, string> = {
  binary: '01',
  ascii:
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
  matrix: '@#%*+=-',
};

const COLORS: Record<ColorId, string[]> = {
  green: ['#00ff41'],
  white: ['#ffffff'],
  cyan: ['#00e5ff'],
  multi: ['#00ff41', '#00e5ff', '#ff00ff', '#ffff00', '#ff5555'],
};

export function colorFor(color: ColorId): string {
  return COLORS[color][0];
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export class Ball {
  charSet: CharSetId = 'binary';
  color: ColorId = 'green';
  private grid: string[] = [];
  private cols = 0;
  private rows = 0;
  private cellW = 0;
  private cellH = 0;
  private fontSize = 0;
  private shuffleTimer = 0;
  private readonly shuffleInterval = 0.25;

  update(dt: number): void {
    this.shuffleTimer += dt;
    if (this.shuffleTimer >= this.shuffleInterval) {
      this.shuffleTimer = 0;
      this.fillGrid(true);
    }
  }

  private fillGrid(partial: boolean): void {
    const set = CHAR_SETS[this.charSet];
    for (let i = 0; i < this.grid.length; i++) {
      if (partial && Math.random() > 0.3) continue;
      this.grid[i] = set[Math.floor(Math.random() * set.length)];
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    this.fontSize = Math.max(10, Math.min(48, radius / 6));
    this.cellW = this.fontSize * 0.55;
    this.cellH = this.fontSize * 0.85;
    const cols = Math.max(1, Math.floor((radius * 2) / this.cellW));
    const rows = Math.max(1, Math.floor((radius * 2) / this.cellH));
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.grid = new Array(cols * rows).fill(' ');
      this.fillGrid(false);
    }

    const base = COLORS[this.color][0];

    const halo = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.3);
    halo.addColorStop(0, rgba(base, 0.12));
    halo.addColorStop(1, rgba(base, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${this.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const colors = COLORS[this.color];
    const inset = this.cellH * 0.45;
    const x0 = x - (cols * this.cellW) / 2;
    const y0 = y - (rows * this.cellH) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x0 + c * this.cellW + this.cellW / 2;
        const cy = y0 + r * this.cellH + this.cellH / 2;
        const dx = cx - x;
        const dy = cy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius - inset) continue;
        const idx = r * cols + c;
        ctx.globalAlpha = 1 - 0.5 * Math.pow(dist / radius, 1.5);
        ctx.fillStyle =
          this.color === 'multi' ? colors[(r * 7 + c * 13) % colors.length] : base;
        ctx.fillText(this.grid[idx], cx, cy);
      }
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = base;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
