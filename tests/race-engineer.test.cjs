/* Regression tests for the browser-only race engineer module. Run with: node tests/race-engineer.test.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const listeners = {};
const elements = new Map();
function element(id = "") {
  return { id, className: "", innerHTML: "", textContent: "", style: {}, attrs: {}, children: [],
    classList: { add() {}, remove() {} },
    setAttribute(name, value) { this.attrs[name] = value; },
    appendChild(child) { this.children.push(child); return child; } };
}
const body = element("body"), head = element("head");
const document = {
  body, head, createElement: tag => element(tag),
  getElementById(id) { if (!elements.has(id)) elements.set(id, element(id)); return elements.get(id); },
  addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
  dispatchEvent(event) { for (const fn of listeners[event.type] || []) fn(event); }
};
const storage = new Map();
const localStorage = { getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, String(value)) };
let now = 0;
const context = { document, localStorage, performance: { now: () => now }, console, Set, Map, Number, String, Math, JSON };
vm.runInNewContext(fs.readFileSync("race-engineer.js", "utf8"), context, { filename: "race-engineer.js" });
const dispatch = (type, detail = {}) => document.dispatchEvent({ type, detail });
dispatch("neon:race-start", { mode: "career", difficulty: "normal" });
for (let distance = 0; distance <= 1500; distance += 10) {
  now += 100;
  dispatch("neon:telemetry-tick", { distance, speed: 100, weather: "clear", difficulty: "legend" });
}
dispatch("neon:run-ended", { mode: "career", difficulty: "legend", distance: 1500 });
const saved = JSON.parse(localStorage.getItem("neonHighwaySectorBestV1:career:normal"));
assert.ok(Array.isArray(saved), "completed run saves a record under the starting difficulty");
assert.equal(saved.length, 3);
assert.ok(saved.every(value => Number.isFinite(value) && value > 0), "all three completed sector splits are positive");
assert.equal(localStorage.getItem("neonHighwaySectorBestV1:career:legend"), null, "mid-run difficulty changes do not misfile records");
dispatch("neon:race-start", { mode: "career", difficulty: "hard" });
for (let distance = 0; distance <= 1200; distance += 10) {
  now += 100;
  dispatch("neon:telemetry-tick", { distance, speed: 90, weather: "rain", difficulty: "hard" });
}
dispatch("neon:run-ended", { mode: "career", difficulty: "hard", distance: 1200 });
const partial = JSON.parse(localStorage.getItem("neonHighwaySectorBestV1:career:hard"));
assert.ok(Array.isArray(partial) && Number.isFinite(partial[0]) && Number.isFinite(partial[1]), "reached sectors are saved on an incomplete run");
assert.equal(partial[2], null, "an unfinished third sector is not saved as a personal best");
console.log("Race engineer regression tests passed.");
