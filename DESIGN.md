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

## The ball

- A disc filled with random ASCII characters (monospace font).
- Diameter: auto-computed from monitor size (see below), default target
  ~200 px. Large enough that the eyes can focus comfortably.
- Characters inside the ball shuffle periodically so the ball "lives".
- A trail of ASCII characters follows the ball, fading out behind it.

## Trajectories (modes)

The ball follows a closed path across the screen. Base set:

1. Square
2. Circle
3. Figure-8 (lemniscate)
4. Cross (+)

Additional candidates: diagonal, zigzag, smooth random.

## Auto-sizing

Ball diameter is computed from monitor info (screen dimensions), e.g.
~15% of the smallest screen dimension, clamped to a sane range.
Manual override is available in the Advanced settings.

## Interface

Minimal. A small panel on the left side of the screen, "coder-style
minimalist" look: monospace font, dark, terminal-like.

Panel controls:

- Mode: trajectory selection (square / circle / figure-8 / cross / ...)
- Style: ball character set / color
- Advanced: ball size override, speed, trail length

The UI is fully in English.

## Non-goals

- No accounts, no persistence beyond local settings (if any).
- No sound (unless requested).
- No backend — pure static frontend.
