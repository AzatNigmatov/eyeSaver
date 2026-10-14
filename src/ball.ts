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
      this.fillGrid();
    }
  }

  private fillGrid(): void {
    const set = CHAR_SETS[this.charSet];
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = set[Math.floor(Math.random() * set.length)];
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    this.fontSize = Math.max(10, Math.min(48, radius / 8));
    this.cellW = this.fontSize * 0.6;
    this.cellH = this.fontSize * 1.2;
    const cols = Math.max(1, Math.floor((radius * 2) / this.cellW));
    const rows = Math.max(1, Math.floor((radius * 2) / this.cellH));
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.grid = new Array(cols * rows).fill(' ');
      this.fillGrid();
    }
    ctx.font = `${this.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const colors = COLORS[this.color];
    const x0 = x - (cols * this.cellW) / 2;
    const y0 = y - (rows * this.cellH) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x0 + c * this.cellW + this.cellW / 2;
        const cy = y0 + r * this.cellH + this.cellH / 2;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        const idx = r * cols + c;
        ctx.fillStyle =
          this.color === 'multi' ? colors[(r * 7 + c * 13) % colors.length] : colors[0];
        ctx.fillText(this.grid[idx], cx, cy);
      }
    }
  }
}
