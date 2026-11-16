/* Static-site and offline-shell regression checks. Run: node tests/static-site.test.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("service-worker.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const localAssets = [
  "index.html", "style.css", "game.js", "racing-engine.js",
  "upgrade.js", "feature-pack.js", "championship-pack.js",
  "fair-play.js", "race-engineer.js", "service-worker.js"
];
assert.match(html, /name="viewport"[^>]*content="width=device-width, initial-scale=1\.0, viewport-fit=cover"/s,
  "viewport must preserve browser zoom for accessibility");
assert.match(html, /rel="manifest" href="manifest\.webmanifest"/,
  "static PWA manifest must be linked");
assert.match(html, /navigator\.serviceWorker\.register\("\.\/service-worker\.js"\)/,
  "the local service worker must be registered");
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");
for (const asset of localAssets) assert.ok(fs.existsSync(asset), "missing static asset: " + asset);
for (const asset of localAssets.slice(0, -1)) {
  assert.ok(worker.includes('"./' + asset + '"') || asset === "index.html" || asset === "service-worker.js",
    "offline shell list should include " + asset);
}
assert.match(worker, /neon-highway-shell-v8/, "cache version must be bumped");
assert.match(worker, /caches\.match\(request, \{ ignoreSearch: true \}\)/,
  "offline cache lookup must tolerate script cache-busting query strings");
console.log("Static-site and offline-shell checks passed.");

assert.ok(fs.existsSync("logo.svg"), "brand logo asset must exist");
assert.ok(fs.existsSync("favicon.svg"), "favicon asset must exist");
assert.match(html, /class="landing-brand"[\\s\\S]*?src="logo\\.svg"/, "landing page must show the game logo");
assert.match(html, /rel="icon"[^>]*href="\\.\\/favicon\\.svg"/, "browser favicon must be linked");
assert.match(html, /rel="apple-touch-icon"/, "Apple home-screen icon must be linked");
assert.match(css, /@media \\(max-width: 360px\\)/, "very small screens must have a dedicated layout");
assert.match(css, /orientation: landscape/, "landscape layouts must be supported");
assert.match(css, /pointer: coarse/, "touch-first devices must receive usable controls");
assert.match(css, /safe-area-inset-bottom/, "safe-area insets must be respected");
assert.match(worker, /neon-highway-shell-v9/, "responsive shell asset update must bump the cache");
