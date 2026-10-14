# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Project setup: repo, `DESIGN.md`, `PLAN.md`, `CHANGELOG.md`.
- eyeSaver app: ASCII ball with trail, 7 trajectories, 8-bit settings panel,
  hotkeys, blink cue every 2 passes, auto ball sizing.

### Changed

- Visuals: denser ball (overlapping char grid, radial shading, ring outline,
  soft halo), denser and larger trail, partial char shuffle to reduce flicker,
  refined 8-bit panel styling (title bar, section dividers, hover states).
- Trail is now a wide band of chars starting at the ball's rear edge and
  tapering to a point; fixed a bug where the trail kept the oldest samples
  (so it appeared in the start zone and vanished near the ball).
- Blink now runs 5 grow/shrink cycles per session (was 1), every 2 passes.
