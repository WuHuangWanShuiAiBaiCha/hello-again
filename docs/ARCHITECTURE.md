# Architecture

## Overview

This project is a static single-page experience deployed directly from GitHub Pages. It does not require a build step. The architecture is intentionally browser-native:

- `index.html` is the home entry document.
- `mac/` exposes the Mac series shell through multiple HTML entry files that share one interaction shell.
- `styles/` contains layered CSS grouped by responsibility.
- `scripts/` contains ES modules grouped by behavior.
- `assets/` stores static files.
- `vendor/` is kept outside the runtime path of the main site.

## Runtime Flow

1. `index.html` loads the Unicorn Studio runtime from jsDelivr.
2. `scripts/main.js` boots the application.
3. `scripts/app.js` wires together DOM refs, scroll hint behavior, scene loading, and the series shell controller.
4. User scroll drives the first-scene transition.
5. Clicking `Mac` opens the Mac series shell and lazily loads the Mac detail scene.
6. Each Mac shell HTML entry points at the same five-panel experience, but can choose a different initial panel through markup.
7. Clicking the Mac hit area opens the external Infinite Mac system in a new tab.

## JavaScript Modules

- `scripts/config.js`: central constants, scene IDs, panel indexes, URLs, and timing values.
- `scripts/dom.js`: one place to query and cache DOM references.
- `scripts/utils.js`: small shared helpers.
- `scripts/scroll-transition.js`: first-screen scroll animation logic.
- `scripts/scenes.js`: Unicorn scene setup and responsive scene scaling.
- `scripts/scroll-hint.js`: hello hint timing and visibility behavior.
- `scripts/series-shell.js`: horizontal panel shell state, navigation, and panel settling.
- `scripts/app.js`: composition root that binds modules together.
- `scripts/main.js`: browser entrypoint.

## CSS Layers

- `styles/base.css`: reset, tokens, and document-level styles.
- `styles/home.css`: first-screen and second-screen layout.
- `styles/components.css`: reusable UI pieces like buttons, docks, and responsive tweaks.
- `styles/series.css`: full-screen series shell and Mac detail page layout.

## Deployment

The site is deployed from the repository root through GitHub Pages. Because the code uses native CSS and ES modules, the same file structure works both locally and on GitHub Pages without a bundler.
