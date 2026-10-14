export interface HotkeyCallbacks {
  onTogglePause(): void;
  onToggleFullscreen(): void;
  onSelectTrajectory(index: number): void;
  onTogglePanel(): void;
}

export function bindHotkeys(_cb: HotkeyCallbacks): () => void {
  return () => {};
}
