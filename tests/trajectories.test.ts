import { describe, it, expect } from 'vitest';
import { getTrajectory } from '../src/trajectories';
import { TRAJECTORY_IDS } from '../src/types';

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
