# eyeSaver — Design

A browser-based eye exercise app. A ball made of small random ASCII
characters moves across a full black screen along various trajectories.
The user's eyes follow the ball — that is the exercise.

## Core concept

- Full-screen black background, no chrome, no distractions.
- One object on screen: a ball (disc) composed of small monospace ASCII
  characters, with a fading trail of ASCII characters behind it.
- The ball moves continuously along a selected trajectory, covering the
  whole screen.
- Desktop browser only. No sound. No backend — pure static frontend.

## The ball

- A disc filled with random ASCII characters (monospace font).
- Diameter: auto-computed from monitor size — 15% of the smallest screen
  dimension, clamped to 160–400 px (~200 px on typical 1080p).
  Manual override in Advanced settings.
- Characters inside the ball shuffle ~4 times per second.

### Character sets (Style, selectable in Advanced)

- `binary` — `0101...` (default)
- `ascii` — random printable ASCII
- `matrix` — `@#%*+=-` style

### Colors (selectable in Advanced)

- `green` (default), `white`, `cyan`, `multi`

## Trail

- A trail of ASCII characters follows the ball.
- Length: 150% of the ball diameter.
- Fade: characters drop out at the tail (disappear), no opacity gradient.

## Trajectories (modes)

The ball follows a closed path across the screen. Full set (7):

1. Square
2. Circle
3. Figure-8 (lemniscate)
4. Cross (+)
5. Diagonal
6. Zigzag
7. Smooth random

## Speed

- Default: slow — ~30 seconds for one full pass.
- Adjustable via slider in Advanced settings.

## Blink session (eye exercise feature)

- After every 2 full passes along the trajectory, the ball smoothly
  grows to full-screen size and shrinks back. This is a visual cue for
  the user to blink along with the animation.

## Interface

Minimal. A small panel on the left side of the screen, "coder-style
minimalist with 8-bit / pixel accents": monospace/pixel font, dark,
terminal-like.

- Hidden by default. A semi-transparent hint at the bottom of the screen
  says the settings panel can be opened with the `H` key.
- Panel controls:
  - **Mode** — trajectory selection (1–7)
  - **Style** — character set
  - **Advanced** — color, ball size override, speed, trail length

The UI is fully in English.

### Hotkeys

- `Space` — pause / resume
- `F` — fullscreen
- `1..7` — switch trajectory
- `H` — show / hide settings panel

## Non-goals

- No accounts, no persistence beyond in-memory settings.
- No sound.
- No mobile support.
- No backend.
