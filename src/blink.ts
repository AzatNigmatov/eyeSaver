export interface BlinkState {
  passes: number;
  blinkT: number;
  blinksLeft: number;
}

export const BLINK_EVERY_PASSES = 2;
export const BLINKS_PER_SESSION = 5;
export const BLINK_DURATION = 1.2;

export function createBlinkState(): BlinkState {
  return { passes: 0, blinkT: 0, blinksLeft: 0 };
}

export function onPassComplete(state: BlinkState): void {
  state.passes += 1;
  if (state.passes % BLINK_EVERY_PASSES === 0 && state.blinksLeft === 0) {
    state.blinksLeft = BLINKS_PER_SESSION;
    state.blinkT = 0.0001;
  }
}

export function updateBlink(state: BlinkState, dt: number): void {
  if (state.blinksLeft > 0) {
    state.blinkT += dt / BLINK_DURATION;
    if (state.blinkT >= 1) {
      state.blinkT = 0;
      state.blinksLeft -= 1;
    }
  }
}

export function blinkRadius(state: BlinkState, baseRadius: number, fullRadius: number): number {
  if (state.blinksLeft <= 0) return baseRadius;
  const p = state.blinkT < 0.5 ? state.blinkT * 2 : (1 - state.blinkT) * 2;
  const e = p * p * (3 - 2 * p);
  return baseRadius + (fullRadius - baseRadius) * e;
}
