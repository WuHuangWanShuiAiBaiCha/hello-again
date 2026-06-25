# Repository Guidelines

## Project Structure & Module Organization

This repository is a browser-native static site with no root build step. The main entry is `index.html`. Device-specific entries live in `mac/`, `ipad/`, `iphone/`, `ipod/`, `watch/`, and `airpods/`. Shared JavaScript lives in `scripts/`; shared styles are split across `styles/base.css`, `styles/home.css`, `styles/components.css`, `styles/device-page.css`, and `styles/series.css`. Static media and archived product fragments belong under `assets/`. Project notes and handoff docs live in `docs/`. The isolated Remotion experiment is under `playgrounds/remotion-skill-sandbox/`.

## Build, Test, and Development Commands

- `python3 -m http.server 8123`: serve the static site from the repository root.
- `open http://127.0.0.1:8123/`: inspect the site through a local HTTP server; avoid relying on `file://`.
- `node --check scripts/series-shell.js`: syntax-check a changed JavaScript file. Repeat for any edited file in `scripts/`.
- `cd playgrounds/remotion-skill-sandbox && npm run dev`: open Remotion Studio for the sandbox.
- `cd playgrounds/remotion-skill-sandbox && npm run render`: render the sample Remotion video.

## Coding Style & Naming Conventions

Use two-space indentation in HTML, CSS, and JavaScript. Keep browser code plain and dependency-free unless the existing architecture requires otherwise. JavaScript modules attach behavior through the `window.HelloAgain` namespace; preserve that pattern. Use descriptive kebab-case CSS classes such as `series-page-four` and `archive-inline-shell`. Keep shared constants in `scripts/config.js` and DOM lookup helpers in `scripts/dom.js`.

## Testing Guidelines

There is no root test framework. For site changes, run a local HTTP server, check the affected entry pages, and syntax-check edited scripts with `node --check`. When changing the Mac series shell, verify all relevant entry files in `mac/` because they share interaction logic but may start on different panels.

## Commit & Pull Request Guidelines

Recent commits use short, imperative messages, for example `Restore Chinese iMac page with Wayback links` or `Increase iMac final image box height`. Keep commits focused on one behavior or page. Pull requests should describe the changed pages, list verification steps, link any relevant issue, and include screenshots or screen recordings for visible UI changes.

## Agent-Specific Instructions

Do not overwrite existing handoff files or unrelated local changes. Before editing shared shell files, inspect `docs/ARCHITECTURE.md` and the affected HTML entries. For local rendering issues, verify through `http://127.0.0.1:8123/` from a running server.
