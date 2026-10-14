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
