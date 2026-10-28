/* Neon Highway 3D — fair-play challenges and three explicit manual progression slots.
   No ads, paid items, premium currency, or real-money advantages. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const PROFILE_KEY = "neonHighwayProfileV2";
  const SAVE_PREFIX = "neonHighwayManualSlotV1:";
  const CHALLENGE_KEY = "neonHighwayDailyChallengesV1";
  const buttonRow = document.querySelector(".feature-actions");
  const overlay = $("featureOverlay");
  if (!buttonRow || !overlay || !$("featureBody")) return;

  const addButton = (id, label) => {
    if ($(id)) return $(id);
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.className = "game-button";
    button.textContent = label;
    buttonRow.appendChild(button);
    return button;
  };
  const slotsButton = addButton("openSaveSlots", "SAVE SLOTS");
  const challengeButton = addButton("openDailyChallenges", "CHALLENGES");
  const style = document.createElement("style");
  style.textContent = `
    .fair-play-note{margin:12px 0 0;padding:12px 14px;border:1px solid rgba(44,255,176,.25);border-radius:12px;background:rgba(44,255,176,.045);color:#b7f9df;font-size:11px;line-height:1.6}
    .manual-slot{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px;margin-top:10px;border:1px solid rgba(104,159,230,.2);border-radius:12px;background:rgba(255,255,255,.025)}
    .manual-slot h3{font-size:13px;letter-spacing:.7px}.manual-slot p{margin-top:5px;color:#96a9c6;font-size:11px;line-height:1.5;overflow-wrap:anywhere}
    .manual-slot-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}.manual-slot-actions button{min-height:42px;padding:9px 11px;font-size:10px}
    .challenge-reward{color:#ffd52f;font-weight:800;font-size:11px}.challenge-done{color:#2cffb0}
    .fair-play-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.fair-play-actions button{min-height:44px}
    @media(max-width:520px){.manual-slot{grid-template-columns:1fr}.manual-slot-actions{display:grid;grid-template-columns:1fr 1fr}.manual-slot-actions button{width:100%}}
  `;
  document.head.appendChild(style);

  const dayKey = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  };
  const readJson = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value && typeof value === "object" ? value : fallback; }
    catch { return fallback; }
  };
  const toast = (message) => {
    const old = $("featureToast"); if (old) old.remove();
    const node = document.createElement("div");
    node.id = "featureToast"; node.className = "feature-toast"; node.textContent = message;
    document.body.appendChild(node); window.setTimeout(() => node.remove(), 2600);
  };
  const show = (title, body) => {
    $("featureTitle").textContent = title;
    $("featureBody").innerHTML = body;
    const profile = window.neonHighwayProfile || readJson(PROFILE_KEY, {});
    $("featureStats").innerHTML =
      '<div class="feature-stat"><span>CREDITS</span><strong>' + Math.max(0,Number(profile.credits||localStorage.getItem("neonHighwayCredits")||0)).toLocaleString() + '</strong></div>' +
      '<div class="feature-stat"><span>SAVE SLOTS</span><strong>3</strong></div>' +
      '<div class="feature-stat"><span>PAY-TO-WIN</span><strong>NEVER</strong></div>';
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };
  const currentSnapshot = () => ({
    version: 1,
    savedAt: new Date().toISOString(),
    profile: JSON.parse(JSON.stringify(window.neonHighwayProfile || readJson(PROFILE_KEY, {
      credits: Number(localStorage.getItem("neonHighwayCredits")||0), owned:["starter"], selected:"starter",
      upgrades:{engine:0,handling:0,nitro:0,armor:0}, races:0, bestRun:0, missions:{}
    }))),
    difficulty: $("difficultySelect")?.value || localStorage.getItem("neonHighwayDifficulty") || "normal",
    mode: $("raceModeSelect")?.value || localStorage.getItem("neonHighwayMode") || "career",
    environment: $("environmentSelect")?.value || localStorage.getItem("neonHighwayEnvironment") || "neon",
    weather: $("weatherSelect")?.value || localStorage.getItem("neonHighwayWeather") || "clear",
    paint: $("paintSelect")?.value || localStorage.getItem("neonHighwayPaint") || "#087cff",
    level: localStorage.getItem("neonHighwayLevel") || "1",
    best: localStorage.getItem("neonHighwayBest") || "0",
    graphics: localStorage.getItem("neonHighwayGraphics") || "high"
  });
  const saveSlot = (slot) => {
    try {
      localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(currentSnapshot()));
      toast("Slot " + slot + " saved. Nothing was saved automatically to this slot.");
      openSlots();
    } catch { toast("Could not save. Browser storage may be full or disabled."); }
  };
  const loadSlot = (slot) => {
    const snapshot = readJson(SAVE_PREFIX + slot, null);
    if (!snapshot || !snapshot.profile) { toast("This slot is empty or invalid."); return; }
    if (!window.confirm("Load Slot " + slot + "? Current unsaved changes to progression may be replaced.")) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(snapshot.profile));
      localStorage.setItem("neonHighwayCredits", String(Math.max(0,Number(snapshot.profile.credits||0))));
      localStorage.setItem("neonHighwayDifficulty", snapshot.difficulty || "normal");
      localStorage.setItem("neonHighwayMode", snapshot.mode || "career");
      localStorage.setItem("neonHighwayEnvironment", snapshot.environment || "neon");
      localStorage.setItem("neonHighwayWeather", snapshot.weather || "clear");
      localStorage.setItem("neonHighwayPaint", snapshot.paint || "#087cff");
      localStorage.setItem("neonHighwayLevel", snapshot.level || "1");
      localStorage.setItem("neonHighwayBest", snapshot.best || "0");
      localStorage.setItem("neonHighwayGraphics", snapshot.graphics || "high");
      window.location.reload();
    } catch { toast("Could not load this slot."); }
  };
  function openSlots() {
    const slots = [1,2,3].map((slot) => {
      const saved = readJson(SAVE_PREFIX + slot, null);
      const date = saved?.savedAt ? new Date(saved.savedAt).toLocaleString() : "Empty — no save stored";
      const credits = saved?.profile ? Number(saved.profile.credits||0).toLocaleString() + " CR" : "—";
      const level = saved?.level || "—";
      return '<article class="manual-slot"><div><h3>SLOT ' + slot + (saved ? ' · SAVED' : ' · EMPTY') + '</h3><p>' + date + '<br>Level ' + level + ' · ' + credits + '</p></div><div class="manual-slot-actions"><button class="game-button primary" data-slot-save="' + slot + '">SAVE HERE</button><button class="game-button" data-slot-load="' + slot + '" ' + (saved ? "" : "disabled") + '>LOAD</button><button class="game-button" data-slot-clear="' + slot + '" ' + (saved ? "" : "disabled") + '>CLEAR</button></div></article>';
    }).join("");
    show("MANUAL SAVE SLOTS", '<p class="feature-muted">Three separate local slots. A slot changes only when you press SAVE HERE. Saves stay in this browser and do not transfer to other devices.</p>' + slots + '<p class="fair-play-note">Manual slots never overwrite one another. Loading reloads the game so the selected snapshot is restored cleanly.</p>');
    $("featureBody").querySelectorAll("[data-slot-save]").forEach((b) => b.addEventListener("click", () => saveSlot(b.dataset.slotSave)));
    $("featureBody").querySelectorAll("[data-slot-load]").forEach((b) => b.addEventListener("click", () => loadSlot(b.dataset.slotLoad)));
    $("featureBody").querySelectorAll("[data-slot-clear]").forEach((b) => b.addEventListener("click", () => {
      const slot = b.dataset.slotClear;
      if (!window.confirm("Permanently clear manual save Slot " + slot + "?")) return;
      localStorage.removeItem(SAVE_PREFIX + slot); openSlots(); toast("Slot " + slot + " cleared.");
    }));
  }

  const challengeDefaults = () => ({ day: dayKey(), races: 0, claimed: [] });
  const readChallenges = () => {
    let state = readJson(CHALLENGE_KEY, challengeDefaults());
    if (state.day !== dayKey()) state = challengeDefaults();
    if (!Array.isArray(state.claimed)) state.claimed = [];
    return state;
  };
  const challengeList = [
    { id:"score", title:"SCORE RUNNER", desc:"Score 2,500 points or more in one run.", reward:250, test:(s,d)=>Number(d.score||0)>=2500 },
    { id:"collector", title:"COIN HUNTER", desc:"Collect at least 3 coins in one run.", reward:200, test:(s,d)=>Number(d.coins||0)>=3 },
    { id:"regular", title:"ROAD REGULAR", desc:"Finish 2 runs today.", reward:350, test:(s,d)=>s.races>=2 }
  ];
  function openChallenges() {
    const state = readChallenges();
    const cards = challengeList.map((challenge) => {
      const claimed = state.claimed.includes(challenge.id);
      const complete = claimed || (challenge.id==="regular" && state.races>=2);
      const progress = challenge.id==="regular" ? Math.min(2,state.races)+"/2 runs" : claimed ? "Completed" : "Complete the objective in a run";
      return '<article class="feature-card"><h3>' + challenge.title + '</h3><p>' + challenge.desc + '</p><p class="feature-muted">' + progress + '</p><strong class="challenge-reward">' + (claimed ? "REWARD CLAIMED" : "+"+challenge.reward+" CR") + '</strong><p class="' + (complete ? "challenge-done" : "feature-muted") + '">' + (claimed ? "Completed today" : complete ? "Reward earned" : "Keep racing — no purchase required") + '</p></article>';
    }).join("");
    show("FREE DAILY CHALLENGES", '<p class="feature-muted">Three challenges reset by your device date. Rewards are earned through play, with no ads, purchases, paid currency, or premium advantages.</p><div class="feature-grid" style="margin-top:12px">' + cards + '</div><p class="fair-play-note">FAIR PLAY GUARANTEE · Every car and performance upgrade is bought only with in-game credits. No real-money shortcuts.</p>');
  }
  slotsButton.addEventListener("click", openSlots);
  challengeButton.addEventListener("click", openChallenges);
  document.addEventListener("neon:run-ended", (event) => {
    const detail = event.detail || {};
    const state = readChallenges();
    state.races += 1;
    const profile = window.neonHighwayProfile || readJson(PROFILE_KEY, {});
    for (const challenge of challengeList) {
      if (state.claimed.includes(challenge.id)) continue;
      if (challenge.test(state, detail)) {
        state.claimed.push(challenge.id);
        const base = Math.max(Number(localStorage.getItem("neonHighwayCredits")||0),Number(profile.credits||0));
        const next = base + challenge.reward;
        localStorage.setItem("neonHighwayCredits",String(next));
        if (profile && typeof profile === "object") {
          profile.credits = next;
          localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
        }
        toast("DAILY CHALLENGE · +" + challenge.reward + " CR");
      }
    }
    localStorage.setItem(CHALLENGE_KEY,JSON.stringify(state));
  });
})();
