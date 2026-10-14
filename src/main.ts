import { DEFAULT_SETTINGS, TRAJECTORY_IDS } from './types';
import type { Settings } from './types';
import { getTrajectory, regenerateRandom } from './trajectories';
import { computeBallSize } from './sizing';
import { Ball, colorFor } from './ball';
import { Trail } from './trail';
import { createBlinkState, onPassComplete, updateBlink, blinkRadius } from './blink';
import { createPanel } from './panel';
import { bindHotkeys } from './hotkeys';
import './style.css';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const panelRoot = document.getElementById('panel-root') as HTMLElement;

let settings: Settings = { ...DEFAULT_SETTINGS };
let paused = false;
let progress = 0;
let lastTime = performance.now();
let prevX = 0;
let prevY = 0;
let hasPrev = false;

const ball = new Ball();
const trail = new Trail();
const blink = createBlinkState();

function applySettings(s: Settings): void {
  settings = s;
  ball.charSet = s.charSet;
  ball.color = s.color;
  trail.charSet = s.charSet;
}

const panel = createPanel(panelRoot, settings, (s) => {
  applySettings(s);
  panel.sync(s);
});

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  regenerateRandom(canvas.width, canvas.height);
  trail.clear();
}
window.addEventListener('resize', resize);
resize();

bindHotkeys({
  onTogglePause: () => {
    paused = !paused;
  },
  onToggleFullscreen: () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  },
  onSelectTrajectory: (i) => {
    const id = TRAJECTORY_IDS[i];
    if (!id) return;
    applySettings({ ...settings, trajectory: id });
    panel.sync(settings);
  },
  onTogglePanel: () => panel.setVisible(!panel.isVisible()),
});

function frame(now: number): void {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const baseRadius = computeBallSize(w, h, settings.ballSize) / 2;
  const fullRadius = Math.hypot(w, h) / 2;

  if (!paused) {
    progress += dt / settings.speed;
    if (progress >= 1) {
      progress -= 1;
      onPassComplete(blink);
    }
    updateBlink(blink, dt);
    ball.update(dt);
  }

  const radius = blinkRadius(blink, baseRadius, fullRadius);
  const pos = getTrajectory(settings.trajectory)(progress, w, h);

  let dirX = 1;
  let dirY = 0;
  if (hasPrev) {
    const dx = pos.x - prevX;
    const dy = pos.y - prevY;
    const len = Math.hypot(dx, dy);
    if (len > 0.001) {
      dirX = dx / len;
      dirY = dy / len;
    }
  }
  prevX = pos.x;
  prevY = pos.y;
  hasPrev = true;

  const trailLen = (settings.trailLength / 100) * baseRadius * 2;
  if (!paused) trail.add(pos.x, pos.y);
  trail.trim(trailLen);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  trail.draw(ctx, colorFor(settings.color), pos.x, pos.y, dirX, dirY, baseRadius, baseRadius * 2, trailLen);
  ball.draw(ctx, pos.x, pos.y, radius);

  if (paused) {
    ctx.font = '24px monospace';
    ctx.fillStyle = '#00ff41';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', w / 2, h / 2);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
