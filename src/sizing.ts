export function computeBallSize(w: number, h: number, override: number | null): number {
  if (override !== null && override > 0) return override;
  const raw = 0.15 * Math.min(w, h);
  return Math.min(400, Math.max(160, raw));
}
