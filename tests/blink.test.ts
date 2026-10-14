import { describe, it, expect } from 'vitest';
import {
  createBlinkState,
  onPassComplete,
  updateBlink,
  blinkRadius,
  BLINKS_PER_SESSION,
  BLINK_DURATION,
} from '../src/blink';

describe('blink session', () => {
  it('does not blink before 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    expect(s.blinksLeft).toBe(0);
  });

  it('starts 5 blinks after 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    expect(s.blinksLeft).toBe(BLINKS_PER_SESSION);
    expect(s.blinkT).toBeGreaterThan(0);
  });

  it('blink radius grows to full size at midpoint', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    updateBlink(s, BLINK_DURATION / 2);
    expect(blinkRadius(s, 100, 1000)).toBeCloseTo(1000, 0);
  });

  it('completes all 5 blinks then stops', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    for (let i = 0; i < BLINKS_PER_SESSION; i++) updateBlink(s, BLINK_DURATION);
    expect(s.blinksLeft).toBe(0);
    expect(blinkRadius(s, 100, 1000)).toBe(100);
  });

  it('does not restart blinks mid-session', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    onPassComplete(s);
    expect(s.blinksLeft).toBe(BLINKS_PER_SESSION);
  });

  it('blinks again after the next 2 passes', () => {
    const s = createBlinkState();
    onPassComplete(s);
    onPassComplete(s);
    for (let i = 0; i < BLINKS_PER_SESSION; i++) updateBlink(s, BLINK_DURATION);
    onPassComplete(s);
    expect(s.blinksLeft).toBe(0);
    onPassComplete(s);
    expect(s.blinksLeft).toBe(BLINKS_PER_SESSION);
  });
});
