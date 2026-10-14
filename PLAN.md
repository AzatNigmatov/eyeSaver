# eyeSaver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A browser eye-exercise app: an ASCII-character ball with a trail moves across a full black screen along selectable trajectories; minimal 8-bit-style settings panel; blink cue every 2 passes.

**Architecture:** Static Vite + TypeScript app, no framework, no backend. One full-screen `<canvas>` redrawn at 60 fps. Pure logic modules (trajectories, sizing, blink, trail) are unit-tested with vitest; rendering modules (ball, panel, main loop) are thin and verified manually in the browser.

**Tech Stack:** Vite, TypeScript (strict), Canvas 2D, vitest. Zero runtime dependencies.

---

## Decisions (from Q&A, 2026-10-14)

| # | Decision |
|---|----------|
| Q1 | Char sets: binary (default), ascii, matrix — selectable in Advanced |
| Q2 | Colors: green (default), white, cyan, multi — selectable in Advanced |
| Q3 | Ball chars shuffle ~4 times/sec |
| Q4 | 7 trajectories: square, circle, figure-8, cross, diagonal, zigzag, random |
| Q5 | Default speed: ~30 s per full pass; slider in Advanced |
| Q6 | Ball follows a closed path strictly |
| Q7 | Trail length: 150% of ball diameter; fade = chars drop out at the tail |
| Q8 | Panel hidden by default; semi-transparent hint at bottom: press H |
| Q9 | 8-bit / pixel accents (blocky borders, hard shadows, monospace) |
| Q10 | Hotkeys: Space pause, F fullscreen, 1..7 trajectory, H panel |
| Q11 | Ball size: 15% of smallest screen dimension, clamp 160–400 px |
| Q12 | After every 2 full passes the ball smoothly grows to full-screen size and shrinks back (blink cue) |
| Q13 | No sound |
| Q14 | Desktop browser only |

## File structure

```
eyeSaver/
├── index.html              — canvas + panel root + hint
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts             — entry: canvas, rAF loop, state, wiring
│   ├── style.css           — all styles (panel, hint, 8-bit look)
│   ├── types.ts            — shared types, ids, labels, defaults
│   ├── trajectories.ts     — 7 closed path functions + random spline
│   ├── sizing.ts           — auto ball size from screen
│   ├── blink.ts            — pass counting + blink grow/shrink
│   ├── ball.ts             — ASCII disc rendering
│   ├── trail.ts            — fading trail of chars
│   ├── panel.ts            — settings panel (DOM)
│   └── hotkeys.ts          — keyboard bindings
├── tests/
│   ├── trajectories.test.ts
│   ├── sizing.test.ts
│   ├── blink.test.ts
│   └── trail.test.ts
├── DESIGN.md
├── PLAN.md
├── CHANGELOG.md
└── README.md
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/style.css`, `src/main.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "eyesaver",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>eyeSaver</title>
  </head>
  <body>
    <canvas id="screen"></canvas>
    <div id="panel-root"></div>
    <div class="hint">Press H for settings</div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/style.css`**

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }
#screen { display: block; }

.hint {
  position: fixed;
  bottom: 12px;
  left: 0;
  width: 100%;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(0, 255, 65, 0.35);
  pointer-events: none;
  user-select: none;
}

.panel {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 230px;
  display: none;
  font-family: 'Courier New', monospace;
  color: #00ff41;
  background: rgba(0, 15, 0, 0.9);
  border: 2px solid #00ff41;
  box-shadow: 4px 4px 0 rgba(0, 255, 65, 0.25);
  padding: 12px;
  z-index: 10;
}
.panel.visible { display: block; }

.panel-title {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 4px;
  border-bottom: 2px solid #00ff41;
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.panel-section { margin-bottom: 12px; }
.panel-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(0, 255, 65, 0.6);
  margin-bottom: 6px;
}

.panel-list { display: flex; flex-wrap: wrap; gap: 4px; }
.panel-item {
  font-family: inherit;
  font-size: 11px;
  color: #00ff41;
  background: transparent;
  border: 1px solid #00ff41;
  padding: 3px 6px;
  cursor: pointer;
}
.panel-item.active { background: #00ff41; color: #000; }

.panel-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.panel-row-label { font-size: 10px; letter-spacing: 1px; color: rgba(0, 255, 65, 0.6); }
.panel-select, .panel-number {
  font-family: inherit;
  font-size: 11px;
  color: #00ff41;
  background: #000;
  border: 1px solid #00ff41;
  padding: 2px 4px;
  width: 110px;
}
.panel-range { width: 110px; accent-color: #00ff41; }
```

- [ ] **Step 6: Create `src/main.ts` (stub, full wiring in Task 7)**

```ts
const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: installs typescript, vite, vitest; creates `node_modules/`, `package-lock.json`.

- [ ] **Step 8: Verify**

Run: `npm run typecheck` — Expected: no errors.
Run: `npm run dev` — open the printed URL — Expected: black page, no console errors. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/
git commit -m "chore: scaffold vite + typescript project"
```

---

### Task 2: Types + auto-sizing (TDD)

**Files:**
- Create: `src/types.ts`, `src/sizing.ts`
- Test: `tests/sizing.test.ts`

- [ ] **Step 1: Write the failing test `tests/sizing.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { computeBallSize } from '../src/sizing';

describe('computeBallSize', () => {
  it('uses 15% of the smallest dimension', () => {
    expect(computeBallSize(1920, 1080, null)).toBeCloseTo(162, 5);
  });
  it('clamps to min 160', () => {
    expect(computeBallSize(800, 600, null)).toBe(160);
  });
  it('clamps to max 400', () => {
    expect(computeBallSize(4000, 3000, null)).toBe(400);
  });
  it('respects manual override', () => {
    expect(computeBallSize(1920, 1080, 250)).toBe(250);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/sizing.test.ts`
Expected: FAIL — cannot find module `../src/sizing`.

- [ ] **Step 3: Create `src/types.ts`**

```ts
export type TrajectoryId =
  | 'square'
  | 'circle'
  | 'figure8'
  | 'cross'
  | 'diagonal'
  | 'zigzag'
  | 'random';

export type CharSetId = 'binary' | 'ascii' | 'matrix';
export type ColorId = 'green' | 'white' | 'cyan' | 'multi';

export interface Settings {
  trajectory: TrajectoryId;
  charSet: CharSetId;
  color: ColorId;
  ballSize: number | null;
  speed: number;
  trailLength: number;
}

export const TRAJECTORY_IDS: TrajectoryId[] = [
  'square',
  'circle',
  'figure8',
  'cross',
  'diagonal',
  'zigzag',
  'random',
];

export const TRAJECTORY_LABELS: Record<TrajectoryId, string> = {
  square: 'Square',
  circle: 'Circle',
  figure8: 'Figure-8',
  cross: 'Cross',
  diagonal: 'Diagonal',
  zigzag: 'Zigzag',
  random: 'Random',
};

export const DEFAULT_SETTINGS: Settings = {
  trajectory: 'circle',
  charSet: 'binary',
  color: 'green',
  ballSize: null,
  speed: 30,
  trailLength: 150,
};
```

- [ ] **Step 4: Create `src/sizing.ts`**

```ts
export function computeBallSize(w: number, h: number, override: number | null): number {
  if (override !== null && override > 0) return override;
  const raw = 0.15 * Math.min(w, h);
  return Math.min(400, Math.max(160, raw));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/sizing.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/sizing.ts tests/sizing.test.ts
git commit -m "feat: settings types and auto ball sizing"
```

---

### Task 3: Trajectories (TDD)

**Files:**
- Create: `src/trajectories.ts`
- Test: `tests/trajectories.test.ts`

All trajectories are closed paths (t=0 equals t=1) that cover the whole
screen (margin 40 px). "Square" is a screen-filling rectangle, "Circle" is a
screen-filling ellipse — both cover the full screen on widescreen displays.

- [ ] **Step 1: Write the failing test `tests/trajectories.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getTrajectory, TRAJECTORY_IDS } from '../src/trajectories';

const W = 1920;
const H = 1080;

describe('trajectories', () => {
  it.each(TRAJECTORY_IDS)('%s is closed (t=0 == t=1)', (id) => {
    const fn = getTrajectory(id);
    const a = fn(0, W, H);
    const b = fn(1, W, H);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(1);
  });

  it.each(TRAJECTORY_IDS)('%s stays within the screen', (id) => {
    const fn = getTrajectory(id);
    for (let i = 0; i < 200; i++) {
      const p = fn(i / 200, W, H);
      expect(p.x).toBeGreaterThanOrEqual(-10);
      expect(p.x).toBeLessThanOrEqual(W + 10);
      expect(p.y).toBeGreaterThanOrEqual(-10);
      expect(p.y).toBeLessThanOrEqual(H + 10);
    }
  });

  it.each(TRAJECTORY_IDS)('%s covers most of the screen', (id) => {
    const fn = getTrajectory(id);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 400; i++) {
      const p = fn(i / 400, W, H);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    expect(maxX - minX).toBeGreaterThan(W * 0.7);
    expect(maxY - minY).toBeGreaterThan(H * 0.7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/trajectories.test.ts`
Expected: FAIL — cannot find module `../src/trajectories`.

- [ ] **Step 3: Create `src/trajectories.ts`**

```ts
import type { TrajectoryId } from './types';

export interface Point {
  x: number;
  y: number;
}

export type TrajectoryFn = (t: number, w: number, h: number) => Point;

const MARGIN = 40;

function norm(t: number): number {
  return ((t % 1) + 1) % 1;
}

function segmentPath(pts: Point[], t: number): Point {
  const n = pts.length;
  const u = norm(t) * n;
  const i = Math.floor(u) % n;
  const f = u - Math.floor(u);
  const a = pts[i];
  const b = pts[(i + 1) % n];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function square(t: number, w: number, h: number): Point {
  const x0 = MARGIN;
  const y0 = MARGIN;
  const x1 = w - MARGIN;
  const y1 = h - MARGIN;
  const pw = x1 - x0;
  const ph = y1 - y0;
  const per = 2 * (pw + ph);
  let d = norm(t) * per;
  if (d < pw) return { x: x0 + d, y: y0 };
  d -= pw;
  if (d < ph) return { x: x1, y: y0 + d };
  d -= ph;
  if (d < pw) return { x: x1 - d, y: y1 };
  d -= pw;
  return { x: x0, y: y1 - d };
}

function circle(t: number, w: number, h: number): Point {
  const rx = w / 2 - MARGIN;
  const ry = h / 2 - MARGIN;
  return {
    x: w / 2 + rx * Math.cos(2 * Math.PI * t),
    y: h / 2 + ry * Math.sin(2 * Math.PI * t),
  };
}

function figure8(t: number, w: number, h: number): Point {
  const a = w / 2 - MARGIN;
  const b = h / 2 - MARGIN;
  return {
    x: w / 2 + a * Math.sin(2 * Math.PI * t),
    y: h / 2 + b * Math.sin(4 * Math.PI * t),
  };
}

function cross(t: number, w: number, h: number): Point {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - MARGIN;
  const ry = h / 2 - MARGIN;
  const u = norm(t) * 4;
  const i = Math.floor(u);
  const f = u - i;
  switch (i) {
    case 0: return { x: cx + rx * f, y: cy };
    case 1: return { x: cx, y: cy - ry * f };
    case 2: return { x: cx - rx * f, y: cy };
    default: return { x: cx, y: cy + ry * (1 - f) };
  }
}

function diagonal(t: number, w: number, h: number): Point {
  const pts: Point[] = [
    { x: w / 2, y: MARGIN },
    { x: w - MARGIN, y: h / 2 },
    { x: w / 2, y: h - MARGIN },
    { x: MARGIN, y: h / 2 },
  ];
  return segmentPath(pts, t);
}

function zigzag(t: number, w: number, h: number): Point {
  const rows = 4;
  const x0 = MARGIN;
  const x1 = w - MARGIN;
  const y0 = MARGIN;
  const y1 = h - MARGIN;
  const pts: Point[] = [];
  for (let i = 0; i < rows; i++) {
    const y = y0 + ((y1 - y0) / (rows - 1)) * i;
    if (i % 2 === 0) {
      pts.push({ x: x0, y }, { x: x1, y });
    } else {
      pts.push({ x: x1, y }, { x: x0, y });
    }
  }
  return segmentPath(pts, t);
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

class RandomTrajectory {
  private pts: Point[] = [];

  regenerate(w: number, h: number): void {
    const n = 6;
    this.pts = [];
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const k = 0.8 + Math.random() * 0.2;
      this.pts.push({
        x: w / 2 + (w / 2 - MARGIN) * k * Math.cos(a),
        y: h / 2 + (h / 2 - MARGIN) * k * Math.sin(a),
      });
    }
  }

  point(t: number, w: number, h: number): Point {
    if (this.pts.length === 0) this.regenerate(w, h);
    const pts = this.pts;
    const n = pts.length;
    const u = norm(t) * n;
    const i = Math.floor(u) % n;
    const f = u - Math.floor(u);
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    return {
      x: catmullRom(p0.x, p1.x, p2.x, p3.x, f),
      y: catmullRom(p0.y, p1.y, p2.y, p3.y, f),
    };
  }
}

const randomTrajectory = new RandomTrajectory();

export function getTrajectory(id: TrajectoryId): TrajectoryFn {
  switch (id) {
    case 'square': return square;
    case 'circle': return circle;
    case 'figure8': return figure8;
    case 'cross': return cross;
    case 'diagonal': return diagonal;
    case 'zigzag': return zigzag;
    case 'random': return (t, w, h) => randomTrajectory.point(t, w, h);
  }
}

export function regenerateRandom(w: number, h: number): void {
  randomTrajectory.regenerate(w, h);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/trajectories.test.ts`
Expected: PASS (21 tests: 7 trajectories × 3).

- [ ] **Step 5: Commit**

```bash
git add src/trajectories.ts tests/trajectories.test.ts
git commit -m "feat: seven closed screen-covering trajectories"
```

---

### Task 4: Blink session (TDD)

**Files:**
- Create: `src/blink.ts`
- Test: `tests/blink.test.ts`

After every 2 completed passes the ball smoothly grows to full-screen size
and shrinks back over 3 seconds (blink cue).

- [ ] **Step 1: Write the failing test `tests/blink.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  createBlinkState,
  onPassComplete,
  updateBlink,
  blinkRadius,
} from '../src/blink';

describe('blink session', () => {
  it('does not blink before 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    expect(s.blinkT).toBe(0);
  });

  it('starts a blink after 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    expect(s.blinkT).toBeGreaterThan(0);
  });

  it('blink radius grows to full size at midpoint and back', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    updateBlink(s, 1.5);
    expect(blinkRadius(s, 100, 1000)).toBeCloseTo(1000, 0);
    updateBlink(s, 1.5);
    expect(s.blinkT).toBe(0);
    expect(blinkRadius(s, 100, 1000)).toBe(100);
  });

  it('blinks again after the next 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    updateBlink(s, 3);
    onPassComplete(s);
    expect(s.blinkT).toBe(0);
    onPassComplete(s);
    expect(s.blinkT).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/blink.test.ts`
Expected: FAIL — cannot find module `../src/blink`.

- [ ] **Step 3: Create `src/blink.ts`**

```ts
export interface BlinkState {
  passes: number;
  blinkT: number;
}

export const BLINK_EVERY_PASSES = 2;
export const BLINK_DURATION = 3;

export function createBlinkState(): BlinkState {
  return { passes: 0, blinkT: 0 };
}

export function onPassComplete(state: BlinkState): void {
  state.passes += 1;
  if (state.passes % BLINK_EVERY_PASSES === 0) {
    state.blinkT = 0.0001;
  }
}

export function updateBlink(state: BlinkState, dt: number): void {
  if (state.blinkT > 0) {
    state.blinkT += dt / BLINK_DURATION;
    if (state.blinkT >= 1) state.blinkT = 0;
  }
}

export function blinkRadius(state: BlinkState, baseRadius: number, fullRadius: number): number {
  if (state.blinkT <= 0) return baseRadius;
  const p = state.blinkT < 0.5 ? state.blinkT * 2 : (1 - state.blinkT) * 2;
  const e = p * p * (3 - 2 * p);
  return baseRadius + (fullRadius - baseRadius) * e;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/blink.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/blink.ts tests/blink.test.ts
git commit -m "feat: blink cue after every 2 passes"
```

---

### Task 5: Ball rendering

**Files:**
- Create: `src/ball.ts`

The ball is a disc filled with monospace chars. Cell size scales with the
radius (10–48 px font) so the full-screen blink stays performant. Chars
shuffle every 0.25 s.

- [ ] **Step 1: Create `src/ball.ts`**

```ts
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
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/ball.ts
git commit -m "feat: ascii ball rendering with shuffling chars"
```

---

### Task 6: Trail (TDD)

**Files:**
- Create: `src/trail.ts`
- Test: `tests/trail.test.ts`

The trail stores position samples (one per ~8 px of movement) and drops the
oldest samples beyond the max length — chars simply disappear at the tail.

- [ ] **Step 1: Write the failing test `tests/trail.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { Trail } from '../src/trail';

describe('trail', () => {
  it('drops samples beyond max length', () => {
    const t = new Trail();
    for (let i = 0; i <= 20; i++) t.add(i * 10, 0);
    t.trim(100);
    expect(t.pathLength).toBeLessThanOrEqual(110);
    expect(t.pathLength).toBeGreaterThanOrEqual(90);
  });

  it('keeps short paths intact', () => {
    const t = new Trail();
    for (let i = 0; i <= 5; i++) t.add(i * 10, 0);
    t.trim(1000);
    expect(t.pathLength).toBeCloseTo(50, 5);
  });

  it('clears on clear()', () => {
    const t = new Trail();
    for (let i = 0; i <= 5; i++) t.add(i * 10, 0);
    t.clear();
    expect(t.pathLength).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/trail.test.ts`
Expected: FAIL — cannot find module `../src/trail`.

- [ ] **Step 3: Create `src/trail.ts`**

```ts
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
      if (dx * dx + dy * dy < 64) return;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/trail.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/trail.ts tests/trail.test.ts
git commit -m "feat: ascii trail with tail drop-out"
```

---

### Task 7: Main loop wiring

**Files:**
- Modify: `src/main.ts` (replace stub)

- [ ] **Step 1: Replace `src/main.ts`**

```ts
import { DEFAULT_SETTINGS, TRAJECTORY_IDS } from './types';
import type { Settings } from './types';
import { getTrajectory, regenerateRandom } from './trajectories';
import { computeBallSize } from './sizing';
import { Ball, colorFor } from './ball';
import { Trail } from './trail';
import { createBlinkState, onPassComplete, updateBlink, blinkRadius } from './blink';
import { createPanel } from './panel';
import { bindHotkeys } from './hotkeys';
import './style.css';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const panelRoot = document.getElementById('panel-root') as HTMLElement;

let settings: Settings = { ...DEFAULT_SETTINGS };
let paused = false;
let progress = 0;
let lastTime = performance.now();

const ball = new Ball();
const trail = new Trail();
const blink = createBlinkState();

function applySettings(s: Settings): void {
  settings = s;
  ball.charSet = s.charSet;
  ball.color = s.color;
  trail.charSet = s.charSet;
}

const panel = createPanel(panelRoot, settings, (s) => {
  applySettings(s);
  panel.sync(s);
});

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  regenerateRandom(canvas.width, canvas.height);
  trail.clear();
}
window.addEventListener('resize', resize);
resize();

bindHotkeys({
  onTogglePause: () => {
    paused = !paused;
  },
  onToggleFullscreen: () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  },
  onSelectTrajectory: (i) => {
    const id = TRAJECTORY_IDS[i];
    if (!id) return;
    applySettings({ ...settings, trajectory: id });
    panel.sync(settings);
  },
  onTogglePanel: () => panel.setVisible(!panel.isVisible()),
});

function frame(now: number): void {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const baseRadius = computeBallSize(w, h, settings.ballSize) / 2;
  const fullRadius = Math.hypot(w, h) / 2;

  if (!paused) {
    progress += dt / settings.speed;
    if (progress >= 1) {
      progress -= 1;
      onPassComplete(blink);
    }
    updateBlink(blink, dt);
    ball.update(dt);
  }

  const radius = blinkRadius(blink, baseRadius, fullRadius);
  const pos = getTrajectory(settings.trajectory)(progress, w, h);

  if (!paused) trail.add(pos.x, pos.y);
  trail.trim((settings.trailLength / 100) * baseRadius * 2);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  trail.draw(ctx, colorFor(settings.color));
  ball.draw(ctx, pos.x, pos.y, radius);

  if (paused) {
    ctx.font = '24px monospace';
    ctx.fillStyle = '#00ff41';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', w / 2, h / 2);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

- [ ] **Step 2: Create `src/panel.ts` and `src/hotkeys.ts` stubs so typecheck passes**

`src/panel.ts`:

```ts
import type { Settings } from './types';

export interface Panel {
  setVisible(v: boolean): void;
  isVisible(): boolean;
  sync(s: Settings): void;
}

export function createPanel(
  _root: HTMLElement,
  _initial: Settings,
  _onChange: (s: Settings) => void,
): Panel {
  return {
    setVisible() {},
    isVisible: () => false,
    sync() {},
  };
}
```

`src/hotkeys.ts`:

```ts
export interface HotkeyCallbacks {
  onTogglePause(): void;
  onToggleFullscreen(): void;
  onSelectTrajectory(index: number): void;
  onTogglePanel(): void;
}

export function bindHotkeys(_cb: HotkeyCallbacks): () => void {
  return () => {};
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open the URL.
Expected: black screen, a green binary-ASCII ball (~160–200 px) moving in an
ellipse, leaving a fading char trail. Resize the window — ball and path adapt.
Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/panel.ts src/hotkeys.ts
git commit -m "feat: main animation loop with ball, trail, blink"
```

---

### Task 8: Settings panel

**Files:**
- Modify: `src/panel.ts` (replace stub)

- [ ] **Step 1: Replace `src/panel.ts`**

```ts
import type { CharSetId, ColorId, Settings, TrajectoryId } from './types';
import { TRAJECTORY_IDS, TRAJECTORY_LABELS } from './types';

const CHAR_SET_OPTIONS: { id: CharSetId; label: string }[] = [
  { id: 'binary', label: 'Binary' },
  { id: 'ascii', label: 'ASCII' },
  { id: 'matrix', label: 'Matrix' },
];

const COLOR_OPTIONS: { id: ColorId; label: string }[] = [
  { id: 'green', label: 'Green' },
  { id: 'white', label: 'White' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'multi', label: 'Multi' },
];

export interface Panel {
  setVisible(v: boolean): void;
  isVisible(): boolean;
  sync(s: Settings): void;
}

export function createPanel(
  root: HTMLElement,
  initial: Settings,
  onChange: (s: Settings) => void,
): Panel {
  const settings: Settings = { ...initial };
  const itemEls = new Map<string, HTMLButtonElement>();

  const panel = document.createElement('div');
  panel.className = 'panel';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.textContent = 'EYE SAVER';
  panel.appendChild(title);

  function update(patch: Partial<Settings>): void {
    Object.assign(settings, patch);
    onChange({ ...settings });
  }

  function makeList(
    items: { id: string; label: string }[],
    current: string,
    onPick: (id: string) => void,
  ): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'panel-list';
    for (const it of items) {
      const btn = document.createElement('button');
      btn.className = 'panel-item' + (it.id === current ? ' active' : '');
      btn.dataset.value = it.id;
      btn.textContent = it.label;
      btn.addEventListener('click', () => {
        onPick(it.id);
        wrap.querySelectorAll('.panel-item').forEach((el) => el.classList.remove('active'));
        btn.classList.add('active');
      });
      itemEls.set(it.id, btn);
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function section(label: string, content: HTMLElement): HTMLElement {
    const sec = document.createElement('div');
    sec.className = 'panel-section';
    const l = document.createElement('div');
    l.className = 'panel-label';
    l.textContent = label;
    sec.append(l, content);
    return sec;
  }

  function row(label: string, input: HTMLElement): HTMLElement {
    const r = document.createElement('div');
    r.className = 'panel-row';
    const l = document.createElement('span');
    l.className = 'panel-row-label';
    l.textContent = label;
    r.append(l, input);
    return r;
  }

  function makeSelect(
    options: { id: string; label: string }[],
    current: string,
    onPick: (id: string) => void,
  ): HTMLSelectElement {
    const sel = document.createElement('select');
    sel.className = 'panel-select';
    for (const o of options) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.label;
      if (o.id === current) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => onPick(sel.value));
    return sel;
  }

  function makeNumber(value: number, onInput: (v: number) => void): HTMLInputElement {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'panel-number';
    inp.min = '0';
    inp.max = '1000';
    inp.value = String(value);
    inp.title = '0 = auto';
    inp.addEventListener('change', () => onInput(Number(inp.value)));
    return inp;
  }

  function makeRange(min: number, max: number, value: number, onInput: (v: number) => void): HTMLInputElement {
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.className = 'panel-range';
    inp.min = String(min);
    inp.max = String(max);
    inp.value = String(value);
    inp.addEventListener('input', () => onInput(Number(inp.value)));
    return inp;
  }

  panel.appendChild(
    section(
      'MODE',
      makeList(
        TRAJECTORY_IDS.map((id) => ({ id, label: TRAJECTORY_LABELS[id] })),
        initial.trajectory,
        (id) => update({ trajectory: id as TrajectoryId }),
      ),
    ),
  );

  panel.appendChild(
    section(
      'STYLE',
      makeList(CHAR_SET_OPTIONS, initial.charSet, (id) => update({ charSet: id as CharSetId })),
    ),
  );

  const adv = document.createElement('div');
  adv.className = 'panel-section';
  const advLabel = document.createElement('div');
  advLabel.className = 'panel-label';
  advLabel.textContent = 'ADVANCED';
  adv.appendChild(advLabel);
  adv.appendChild(row('COLOR', makeSelect(COLOR_OPTIONS, initial.color, (id) => update({ color: id as ColorId }))));
  adv.appendChild(row('SIZE', makeNumber(initial.ballSize ?? 0, (v) => update({ ballSize: v > 0 ? v : null }))));
  adv.appendChild(row('SPEED', makeRange(5, 120, initial.speed, (v) => update({ speed: v }))));
  adv.appendChild(row('TRAIL', makeRange(50, 300, initial.trailLength, (v) => update({ trailLength: v }))));
  panel.appendChild(adv);

  root.appendChild(panel);

  return {
    setVisible(v: boolean) {
      panel.classList.toggle('visible', v);
    },
    isVisible() {
      return panel.classList.contains('visible');
    },
    sync(s: Settings) {
      for (const [id, el] of itemEls) {
        el.classList.toggle('active', id === s.trajectory || id === s.charSet);
      }
    },
  };
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open the URL, press `H`.
Expected: panel appears top-left, 8-bit green style. MODE list (7 items,
Circle active), STYLE list (Binary active), ADVANCED rows (COLOR select,
SIZE number, SPEED and TRAIL sliders). Clicking items changes the ball
immediately. Press `H` again — panel hides.
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/panel.ts
git commit -m "feat: 8-bit settings panel with mode, style, advanced"
```

---

### Task 9: Hotkeys

**Files:**
- Modify: `src/hotkeys.ts` (replace stub)

- [ ] **Step 1: Replace `src/hotkeys.ts`**

```ts
export interface HotkeyCallbacks {
  onTogglePause(): void;
  onToggleFullscreen(): void;
  onSelectTrajectory(index: number): void;
  onTogglePanel(): void;
}

export function bindHotkeys(cb: HotkeyCallbacks): () => void {
  const handler = (e: KeyboardEvent): void => {
    if (e.code === 'Space') {
      e.preventDefault();
      cb.onTogglePause();
    } else if (e.key === 'f' || e.key === 'F') {
      cb.onToggleFullscreen();
    } else if (e.key === 'h' || e.key === 'H') {
      cb.onTogglePanel();
    } else if (/^[1-7]$/.test(e.key)) {
      cb.onSelectTrajectory(Number(e.key) - 1);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open the URL.
Expected: `Space` pauses (PAUSED text in center) and resumes; `F` toggles
fullscreen; `1`..`7` switch trajectories (panel MODE highlight follows when
open); `H` toggles the panel.
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/hotkeys.ts
git commit -m "feat: hotkeys for pause, fullscreen, trajectory, panel"
```

---

### Task 10: README + final verification

**Files:**
- Create: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# eyeSaver

A browser eye exercise: an ASCII ball with a trail moves across a black
screen along selectable trajectories. Every 2 full passes the ball grows to
full-screen size and shrinks back — blink along with it.

## Run

```bash
npm install
npm run dev
```

Open the printed URL.

## Build

```bash
npm run build
```

Output in `dist/` — deploy anywhere static files are served.

## Controls

| Key | Action |
|-----|--------|
| `H` | show / hide settings panel |
| `Space` | pause / resume |
| `F` | fullscreen |
| `1`–`7` | switch trajectory |

## Settings (panel)

- **MODE** — square, circle, figure-8, cross, diagonal, zigzag, random
- **STYLE** — binary, ascii, matrix char sets
- **ADVANCED** — color, ball size (0 = auto), speed, trail length
```

- [ ] **Step 2: Update `CHANGELOG.md`**

Add under `## [Unreleased]` → `### Added`:

```markdown
- eyeSaver app: ASCII ball with trail, 7 trajectories, 8-bit settings panel,
  hotkeys, blink cue every 2 passes, auto ball sizing.
```

- [ ] **Step 3: Full verification**

Run: `npm run typecheck` — Expected: no errors.
Run: `npm test` — Expected: all tests pass (12 tests).
Run: `npm run build` — Expected: build succeeds, `dist/` created.
Run: `npm run preview` — open the URL — Expected: app works from the build.
Stop the preview server.

- [ ] **Step 4: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: readme and changelog for v0.1.0"
```

---

## Self-review notes

- Spec coverage: ball (Task 5), trail (Task 6), 7 trajectories (Task 3),
  speed default 30 s + slider (Tasks 2, 8), auto size 15%/clamp + override
  (Task 2), panel hidden + H hint (Tasks 1, 8), 8-bit style (Task 1 CSS),
  hotkeys (Task 9), blink every 2 passes (Task 4), no sound / desktop only
  (no code needed), English UI (labels in Task 8).
- Type consistency: `Settings`, `TrajectoryId`, `CharSetId`, `ColorId`
  defined once in `types.ts`; `Panel` interface identical in Tasks 7 and 8;
  `HotkeyCallbacks` identical in Tasks 7 and 9; `colorFor` exported in
  Task 5, used in Task 7.
