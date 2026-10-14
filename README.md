# eyeSaver

A browser eye exercise: an ASCII ball with a trail moves across a black
screen along selectable trajectories. Every 2 full passes the ball grows to
full-screen size and shrinks back — blink along with it.

## Run

```bash
npm install
npm run dev
```

Open the printed URL.

## Build

```bash
npm run build
```

Output in `dist/` — deploy anywhere static files are served.

## Controls

| Key | Action |
|-----|--------|
| `H` | show / hide settings panel |
| `Space` | pause / resume |
| `F` | fullscreen |
| `1`–`7` | switch trajectory |

## Settings (panel)

- **MODE** — square, circle, figure-8, cross, diagonal, zigzag, random
- **STYLE** — binary, ascii, matrix char sets
- **ADVANCED** — color, ball size (0 = auto), speed, trail length
