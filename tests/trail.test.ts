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
