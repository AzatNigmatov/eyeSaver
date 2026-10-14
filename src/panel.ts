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
