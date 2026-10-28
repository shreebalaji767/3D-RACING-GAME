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
