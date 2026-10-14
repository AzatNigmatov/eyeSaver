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
