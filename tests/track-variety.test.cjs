/* Track variety regression checks. Run: node tests/track-variety.test.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const game = fs.readFileSync("game.js","utf8");
const features = fs.readFileSync("feature-pack.js","utf8");
const worker = fs.readFileSync("service-worker.js","utf8");
const tracks = ["neon","sunset","arctic","emerald","desert","coastal","industrial","canyon"];
for (const track of tracks) {
  assert.ok(features.includes('["'+track+'"'), "menu should offer "+track);
  assert.ok(game.includes(track+":"), "track should have scene colors "+track);
}
assert.ok(game.includes("roadTints"), "road surfaces should vary by track");
assert.ok(game.includes("edgePalette"), "road barrier colors should vary by track");
assert.ok(game.includes("createDistinctTrackScenery"), "track-specific roadside scenery should be generated");
assert.ok(game.includes("roadGroup.clear();"), "switching track should rebuild the road");
assert.ok(worker.includes("neon-highway-shell-v7"), "offline cache should refresh for track updates");
console.log("Track variety regression checks passed for 8 venues.");
