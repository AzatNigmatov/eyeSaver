export type TrajectoryId =
  | 'square'
  | 'circle'
  | 'figure8'
  | 'cross'
  | 'diagonal'
  | 'zigzag'
  | 'random';

export type CharSetId = 'binary' | 'ascii' | 'matrix';
export type ColorId = 'green' | 'white' | 'cyan' | 'multi';

export interface Settings {
  trajectory: TrajectoryId;
  charSet: CharSetId;
  color: ColorId;
  ballSize: number | null;
  speed: number;
  trailLength: number;
}

export const TRAJECTORY_IDS: TrajectoryId[] = [
  'square',
  'circle',
  'figure8',
  'cross',
  'diagonal',
  'zigzag',
  'random',
];

export const TRAJECTORY_LABELS: Record<TrajectoryId, string> = {
  square: 'Square',
  circle: 'Circle',
  figure8: 'Figure-8',
  cross: 'Cross',
  diagonal: 'Diagonal',
  zigzag: 'Zigzag',
  random: 'Random',
};

export const DEFAULT_SETTINGS: Settings = {
  trajectory: 'circle',
  charSet: 'binary',
  color: 'green',
  ballSize: null,
  speed: 30,
  trailLength: 150,
};
