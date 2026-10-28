# Neon Highway 3D

Free browser 3D racing game for GitHub Pages.

## Features
- Three.js 3D graphics
- Player car and AI traffic
- Coins and score
- Increasing speed
- Collision detection
- Keyboard and mobile touch controls
- Pause/restart
- Local high score
- No backend or database

## GitHub Pages
1. Create a public GitHub repository, e.g. `neon-highway-3d`.
2. Upload `index.html`, `style.css`, and `game.js`.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Open `https://YOUR-USERNAME.github.io/neon-highway-3d/`.

## Important
The game loads Three.js from jsDelivr. This is free, but players need internet access for the library CDN.

## 🚀 Live Demo

🌐 **[Play Neon Highway 3D Online](https://threed-racing-game-8wvg.onrender.com/)**

> Try the game directly in your browser — no installation required.


## Upgrade branch: Neon Highway Complete

- Responsive race setup with Easy, Normal, Hard, and Expert difficulty.
- Numbered levels with distance goals, progress HUD, Next Level, and Replay Level.
- Traffic and speed scale with difficulty and level progression.
- Gameplay capture and replay panel; WebM recording is saved locally in the browser.
- Improved small-screen layout, keyboard focus styles, and reduced-motion support.

Levels are generated from the existing highway/traffic system rather than handcrafted maps. A pre-recorded 4K trailer is not bundled because no captured source video exists in the repository; recorded quality depends on browser/device resolution and MediaRecorder support.


Additional progression systems include selectable player-car paint, persistent local credits, and a run mission that awards 500 credits after collecting five coins.


## Complete progression upgrade (October 2026)

- Vehicle garage with six unlockable car profiles, persistent ownership, selection, and vehicle-specific speed/handling.
- Engine, handling, nitro, and safety-cell upgrades purchased with in-game credits.
- Career, endless, time-trial, drift-run, traffic-challenge, and pursuit-traffic modes.
- Four selectable road-atmosphere themes: neon, sunset, arctic, and emerald.
- Near-miss bonus scoring, drift scoring, coin/race/score missions, and persistent rewards.
- Manual local save/load snapshot for profile, garage, upgrades, difficulty, mode, environment, paint, level, and best score.
- Graphics quality control for lower-powered devices, plus responsive feature panels for small screens.

Progress snapshots are stored in the current browser only; they do not sync across devices. Vehicle profiles currently tune the existing procedural 3D car model rather than loading six separate external car models. Environment options change the scene atmosphere/background; they are not separate handcrafted 3D maps.


## Fair-play and GitHub Pages deployment

- No ads, subscriptions, real-money purchases, premium currency, or paid performance advantages are included.
- Cars and performance upgrades are unlocked using credits earned in gameplay only.
- Three independent manual progression save slots are available; a slot changes only when the player explicitly saves it.
- Free daily challenges award in-game credits for scoring, collecting coins, and completing runs.
- GitHub Actions workflow `.github/workflows/pages.yml` publishes the static site from the repository root whenever `main` is updated.

### Enable GitHub Pages once

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source if it is not already selected. The workflow then deploys automatically on pushes to `main`. The site uses the free GitHub Pages service for public repositories, subject to GitHub's current usage limits and terms. Three.js is loaded from jsDelivr, so first load still requires internet access.


## Local JavaScript racing-engine layer

- `racing-engine.js` contains deterministic computer-driver lane decisions, seeded local randomness, weather particles, and surface-grip modifiers.
- **Rival Sprint** adds three rule-based opponents and race-position tracking. These are ordinary state machines and algorithms, not AI models or paid services.
- Weather choices: clear, rain, snow, and fog. Rain and snow adjust handling grip; fog changes scene visibility.
- The engine uses the free Three.js library for rendering. It requires no API key, AI provider, paid SDK, or backend.
- No new paid assets or services are required.


## Quality-of-life and offline enhancements

- Optional synthesized UI sounds use the browser's Web Audio API; no sound files or paid audio service are required.
- Reduced-motion preference can be toggled from the menu enhancement controls.
- Export/import local progress backups as JSON. Import requires confirmation and validates the backup before writing matching game keys.
- A best-effort service worker caches the local game shell and attempts to cache the Three.js modules. Offline 3D play depends on the browser successfully caching the CDN modules; it is not guaranteed on every host/device.
- The game remains client-side. No telemetry, ad network, account service, or AI API is introduced.


## Neon Cup championship expansion (October 2026)

- Five-heat Neon Cup championship with a six-car field, three distance-based laps per heat, start countdown, lap/checkpoint/position HUD, finish results, season standings and points.
- Five rule-based rival drivers use deterministic lane-changing logic and distinct procedural car colours. Championship progress is tracked separately from traffic recycling.
- Championship standings persist locally between heats. Finish-place points and credit rewards are earned by racing; crashes count as DNFs and allow the player to retry the current heat.
- Conditions rotate across existing neon, sunset, arctic and emerald atmospheres plus clear/rain/snow/fog. This is still the existing continuous highway scene with distance-based laps/checkpoints, not a newly modelled closed circuit.
- Static browser app using Three.js and native JavaScript APIs only. No paid AI, paid APIs, subscriptions, ads, premium currency or pay-to-win features were added. Offline cache and CI syntax validation include the new module.
