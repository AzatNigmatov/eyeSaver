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
