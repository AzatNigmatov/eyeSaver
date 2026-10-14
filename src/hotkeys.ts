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
