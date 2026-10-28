/* Neon Highway 3D — garage, upgrades, race modes, and manual save slots. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const STORAGE = {
    profile: "neonHighwayProfileV2",
    save: "neonHighwayManualSaveV1",
    mode: "neonHighwayMode",
    environment: "neonHighwayEnvironment"
  };
  const cars = [
    { id: "starter", name: "NEON GT", type: "Starter coupe", price: 0, color: "#087cff", speed: 1, handling: 1 },
    { id: "scarlet", name: "SCARLET R", type: "Street supercar", price: 1200, color: "#ff3152", speed: 1.08, handling: 1.02 },
    { id: "volt", name: "VOLT X", type: "Electric hypercar", price: 2800, color: "#2cffb0", speed: 1.16, handling: 1.08 },
    { id: "phantom", name: "PHANTOM", type: "Track weapon", price: 5000, color: "#a879ff", speed: 1.22, handling: 1.12 },
    { id: "goldline", name: "GOLDLINE", type: "Luxury grand tourer", price: 8500, color: "#ffd52f", speed: 1.18, handling: 1.2 },
    { id: "zenith", name: "ZENITH ONE", type: "Prototype hypercar", price: 15000, color: "#f5f9ff", speed: 1.32, handling: 1.16 }
  ];
  const upgradeCatalog = [
    { id: "engine", name: "ENGINE TUNING", desc: "Increase acceleration and top speed.", base: 600, max: 5 },
    { id: "handling", name: "RACE SUSPENSION", desc: "Sharper, more responsive steering.", base: 450, max: 5 },
    { id: "nitro", name: "NITRO CAPACITY", desc: "Longer boost bursts and quicker recovery.", base: 700, max: 5 },
    { id: "armor", name: "SAFETY CELL", desc: "Unlock one crash recovery per run at level 3.", base: 900, max: 3 }
  ];
  const defaultProfile = () => ({ credits: Math.max(0, Number(localStorage.getItem("neonHighwayCredits") || 0)), owned: ["starter"], selected: "starter", upgrades: { engine: 0, handling: 0, nitro: 0, armor: 0 }, races: 0, bestRun: Number(localStorage.getItem("neonHighwayBest") || 0), missions: {} });
  let profile;
  try { profile = { ...defaultProfile(), ...JSON.parse(localStorage.getItem(STORAGE.profile) || "{}") }; } catch { profile = defaultProfile(); }
  profile.owned = Array.isArray(profile.owned) && profile.owned.length ? profile.owned : ["starter"];
  profile.upgrades = { ...defaultProfile().upgrades, ...(profile.upgrades || {}) };
  const persistProfile = () => {
    localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
    localStorage.setItem("neonHighwayCredits", String(profile.credits));
    window.dispatchEvent(new CustomEvent("neon:profile-updated", { detail: profile }));
    renderProfileSummary();
  };
  const addOption = (select, value, label) => {
    if (!select || Array.from(select.options).some((o) => o.value === value)) return;
    const option = document.createElement("option");
    option.value = value; option.textContent = label; select.appendChild(option);
  };
  const consoleBox = $("launch-console");
  const modeSelect = document.createElement("select");
  modeSelect.id = "raceModeSelect"; modeSelect.className = "difficulty-select";
  const modeLabel = document.createElement("label");
  modeLabel.className = "field-label"; modeLabel.htmlFor = modeSelect.id; modeLabel.textContent = "RACE MODE";
  [["career","CAREER · Unlock levels"],["endless","ENDLESS · No finish line"],["time-trial","TIME TRIAL · 90 seconds"],["traffic","TRAFFIC CHALLENGE · Collect coins"],["drift","DRIFT RUN · Score while steering"],["police","POLICE PURSUIT · Dense traffic"]].forEach(([v,l]) => addOption(modeSelect,v,l));
  modeSelect.value = localStorage.getItem(STORAGE.mode) || "career";
  const environmentSelect = document.createElement("select");
  environmentSelect.id = "environmentSelect"; environmentSelect.className = "difficulty-select";
  const environmentLabel = document.createElement("label");
  environmentLabel.className = "field-label"; environmentLabel.htmlFor = environmentSelect.id; environmentLabel.textContent = "ROAD ATMOSPHERE";
  [["neon","NEON CITY"],["sunset","SUNSET DRIVE"],["arctic","ARCTIC NIGHT"],["emerald","EMERALD GRID"]].forEach(([v,l]) => addOption(environmentSelect,v,l));
  environmentSelect.value = localStorage.getItem(STORAGE.environment) || "neon";
  const modeHint = document.createElement("p");
  modeHint.className = "feature-hint";
  modeHint.textContent = "Career unlocks levels · Endless removes the distance finish · Time Trial races the clock.";
  if (consoleBox) {
    const paint = $("paintSelect");
    if (paint) {
      consoleBox.insertBefore(modeLabel, paint);
      consoleBox.insertBefore(modeSelect, paint);
      consoleBox.insertBefore(environmentLabel, paint);
      consoleBox.insertBefore(environmentSelect, paint);
      consoleBox.insertBefore(modeHint, paint);
    } else {
      consoleBox.append(modeLabel, modeSelect, environmentLabel, environmentSelect, modeHint);
    }
  }
  modeSelect.addEventListener("change", () => {
    localStorage.setItem(STORAGE.mode, modeSelect.value);
    document.dispatchEvent(new CustomEvent("neon:mode-change", { detail: { mode: modeSelect.value } }));
  });
  environmentSelect.addEventListener("change", () => {
    localStorage.setItem(STORAGE.environment, environmentSelect.value);
    document.dispatchEvent(new CustomEvent("neon:environment-change", { detail: { environment: environmentSelect.value } }));
    applyEnvironment();
  });
  const style = document.createElement("style");
  style.textContent = ".feature-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.feature-actions .game-button{min-height:44px;font-size:10px}.feature-hint{margin-top:8px;color:var(--muted);font-size:10px;line-height:1.5}.feature-overlay{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(1,4,12,.86);backdrop-filter:blur(12px);overflow-y:auto}.feature-window{width:min(920px,100%);max-height:92dvh;overflow:auto;padding:clamp(17px,3vw,28px);border:1px solid rgba(66,245,255,.28);border-radius:20px;background:linear-gradient(145deg,#0d1930,#030711 75%);box-shadow:0 24px 90px #000}.feature-window-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.feature-window-head h2{font-size:clamp(20px,4vw,30px);letter-spacing:1px}.feature-close{min-width:44px;min-height:44px;border:1px solid #34506c;border-radius:10px;color:#fff;background:#111d32;font-size:20px}.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}.feature-card{padding:16px;border:1px solid rgba(104,159,230,.2);border-radius:14px;background:rgba(255,255,255,.035)}.feature-car-art{height:94px;display:grid;place-items:center;margin-bottom:12px;border-radius:10px;background:radial-gradient(ellipse,rgba(66,245,255,.11),transparent 72%)}.feature-car-art span{font-size:48px;filter:drop-shadow(0 0 16px currentColor)}.feature-card h3{font-size:15px;letter-spacing:1px}.feature-card p,.feature-muted{margin-top:7px;color:#96a9c6;font-size:12px;line-height:1.5}.feature-price{display:block;margin:12px 0;color:#ffd52f;font-size:12px;font-weight:800}.feature-card .game-button{width:100%;min-height:44px;margin-top:5px}.feature-stats{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}.feature-stat{flex:1;min-width:110px;padding:12px;border:1px solid rgba(104,159,230,.17);border-radius:10px;background:rgba(255,255,255,.035)}.feature-stat span{display:block;color:#96a9c6;font-size:9px;letter-spacing:1px}.feature-stat strong{display:block;margin-top:5px;font-size:19px}.feature-progress{height:5px;margin-top:10px;border-radius:9px;background:#1c2a40;overflow:hidden}.feature-progress span{display:block;height:100%;background:linear-gradient(90deg,#087cff,#42f5ff)}.feature-save-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.feature-toast{position:fixed;z-index:180;left:50%;bottom:max(20px,env(safe-area-inset-bottom));transform:translateX(-50%);max-width:calc(100vw - 24px);padding:12px 16px;border:1px solid rgba(66,245,255,.4);border-radius:12px;background:#071629;color:#fff;font-size:12px;text-align:center;box-shadow:0 8px 28px #000}.home-logo-button{pointer-events:auto}body[data-environment="sunset"] .hud-box{border-color:rgba(255,126,82,.45)}body[data-environment="arctic"] .hud-box{border-color:rgba(123,220,255,.45)}body[data-environment="emerald"] .hud-box{border-color:rgba(44,255,176,.4)}body[data-mode="police"] .hud-title{animation:policeFlash .7s steps(2,end) infinite alternate}@keyframes policeFlash{to{color:#ff3152;text-shadow:0 0 18px #ff3152}}@media(max-width:480px){.feature-actions{grid-template-columns:1fr 1fr}.feature-window{padding:15px;border-radius:15px}.feature-save-row{grid-template-columns:1fr}.feature-window-head{position:sticky;top:-1px;background:#0b162a;padding:5px 0;z-index:2}}";
  document.head.appendChild(style);
  const actions = document.createElement("div");
  actions.className = "feature-actions";
  actions.innerHTML = '<button class="game-button" id="openGarage" type="button">GARAGE</button><button class="game-button" id="openUpgrades" type="button">UPGRADES</button><button class="game-button" id="openMissions" type="button">MISSIONS</button><button class="game-button" id="openSaveLoad" type="button">SAVE / LOAD</button>';
  const menuButtons = document.querySelector(".menu-buttons");
  if (menuButtons) menuButtons.insertAdjacentElement("afterend", actions);
  const overlay = document.createElement("div");
  overlay.id = "featureOverlay"; overlay.className = "feature-overlay hidden"; overlay.setAttribute("role","dialog"); overlay.setAttribute("aria-modal","true"); overlay.setAttribute("aria-labelledby","featureTitle");
  overlay.innerHTML = '<section class="feature-window"><header class="feature-window-head"><h2 id="featureTitle">GARAGE</h2><button type="button" class="feature-close" id="closeFeature" aria-label="Close">×</button></header><div id="featureStats" class="feature-stats"></div><div id="featureBody"></div></section>';
  document.body.appendChild(overlay);
  const toast = (message) => {
    const old = $("featureToast"); if (old) old.remove();
    const node = document.createElement("div"); node.id = "featureToast"; node.className = "feature-toast"; node.textContent = message; document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 2600);
  };
  const selectedCar = () => cars.find((car) => car.id === profile.selected) || cars[0];
  const renderProfileSummary = () => {
    const balance = $("creditBalance"); const hudBalance = $("hudCreditBalance");
    if (balance) balance.textContent = profile.credits.toLocaleString() + " CR";
    if (hudBalance) hudBalance.textContent = profile.credits.toLocaleString() + " CR";
  };
  const showPanel = (title, body) => {
    $("featureTitle").textContent = title;
    $("featureBody").innerHTML = body;
    $("featureStats").innerHTML = '<div class="feature-stat"><span>CREDITS</span><strong>' + profile.credits.toLocaleString() + '</strong></div><div class="feature-stat"><span>CARS OWNED</span><strong>' + profile.owned.length + ' / ' + cars.length + '</strong></div><div class="feature-stat"><span>RACES FINISHED</span><strong>' + profile.races + '</strong></div>';
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };
  const hidePanel = () => { overlay.classList.add("hidden"); document.body.style.overflow = ""; };
  const openGarage = () => {
    const cards = cars.map((car) => {
      const owned = profile.owned.includes(car.id); const active = profile.selected === car.id;
      return '<article class="feature-card"><div class="feature-car-art" style="color:' + car.color + '"><span>🏎</span></div><h3>' + car.name + '</h3><p>' + car.type + '</p><p class="feature-muted">Top speed ' + Math.round(car.speed * 100) + ' · Handling ' + Math.round(car.handling * 100) + '</p><strong class="feature-price">' + (car.price ? car.price.toLocaleString() + ' CR' : 'FREE STARTER') + '</strong><button class="game-button ' + (active ? 'primary' : '') + '" data-car="' + car.id + '">' + (active ? 'EQUIPPED' : owned ? 'SELECT VEHICLE' : 'BUY VEHICLE') + '</button></article>';
    }).join("");
    showPanel("VEHICLE GARAGE", '<p class="feature-muted">Unlock vehicles with credits earned in races. Your selected car paint is applied to the existing 3D car model.</p><div class="feature-grid" style="margin-top:14px">' + cards + '</div>');
    $("featureBody").querySelectorAll("[data-car]").forEach((button) => button.addEventListener("click", () => {
      const car = cars.find((item) => item.id === button.dataset.car); if (!car) return;
      if (!profile.owned.includes(car.id)) {
        if (profile.credits < car.price) { toast("You need " + (car.price - profile.credits).toLocaleString() + " more credits."); return; }
        profile.credits -= car.price; profile.owned.push(car.id);
      }
      profile.selected = car.id; localStorage.setItem("neonHighwayPaint", car.color);
      const paint = $("paintSelect"); if (paint) { if (!Array.from(paint.options).some((o) => o.value === car.color)) { const option = document.createElement("option"); option.value = car.color; option.textContent = car.name; paint.appendChild(option); } paint.value = car.color; }
      document.dispatchEvent(new CustomEvent("neon:paint-change", { detail: { color: car.color } }));
      persistProfile(); openGarage(); toast(car.name + " selected.");
    }));
  };
  const openUpgrades = () => {
    const cards = upgradeCatalog.map((upgrade) => {
      const level = Number(profile.upgrades[upgrade.id] || 0); const price = upgrade.base * (level + 1);
      return '<article class="feature-card"><h3>' + upgrade.name + '</h3><p>' + upgrade.desc + '</p><div class="feature-progress"><span style="width:' + (level / upgrade.max * 100) + '%"></span></div><p class="feature-muted">LEVEL ' + level + ' / ' + upgrade.max + '</p><strong class="feature-price">' + (level >= upgrade.max ? 'MAX LEVEL' : price.toLocaleString() + ' CR') + '</strong><button class="game-button" data-upgrade="' + upgrade.id + '" ' + (level >= upgrade.max ? 'disabled' : '') + '>' + (level >= upgrade.max ? 'FULLY UPGRADED' : 'PURCHASE UPGRADE') + '</button></article>';
    }).join("");
    showPanel("PERFORMANCE LAB", '<p class="feature-muted">Upgrades persist on this device and affect acceleration, handling, boost, and the optional recovery perk.</p><div class="feature-grid" style="margin-top:14px">' + cards + '</div>');
    $("featureBody").querySelectorAll("[data-upgrade]").forEach((button) => button.addEventListener("click", () => {
      const item = upgradeCatalog.find((upgrade) => upgrade.id === button.dataset.upgrade); const level = Number(profile.upgrades[item.id] || 0); const price = item.base * (level + 1);
      if (level >= item.max) return;
      if (profile.credits < price) { toast("Not enough credits for this upgrade."); return; }
      profile.credits -= price; profile.upgrades[item.id] = level + 1; persistProfile(); applyUpgrades(); openUpgrades(); toast(item.name + " upgraded.");
    }));
  };
  const openMissions = () => {
    const missions = [
      { id: "coins5", title: "COIN COLLECTOR", desc: "Collect 5 coins in a single run.", reward: 500, goal: 5, count: Number(profile.missions.coins5 || 0) },
      { id: "runs3", title: "ROAD REGULAR", desc: "Finish 3 races.", reward: 750, goal: 3, count: Number(profile.missions.runs3 || 0) },
      { id: "score5k", title: "SCORE HUNTER", desc: "Score 5,000 points in a run.", reward: 900, goal: 5000, count: Number(profile.missions.score5k || 0) }
    ];
    const body = missions.map((m) => '<article class="feature-card"><h3>' + m.title + '</h3><p>' + m.desc + '</p><p class="feature-muted">Progress: ' + Math.min(m.count,m.goal).toLocaleString() + ' / ' + m.goal.toLocaleString() + '</p><div class="feature-progress"><span style="width:' + Math.min(100,m.count/m.goal*100) + '%"></span></div><strong class="feature-price">REWARD ' + m.reward + ' CR</strong></article>').join("");
    showPanel("MISSIONS & REWARDS", '<div class="feature-grid">' + body + '</div><p class="feature-hint">Mission progress updates as race events occur. Rewards are granted once per mission milestone.</p>');
  };
  const openSaveLoad = () => {
    let hasSave = false; try { hasSave = Boolean(localStorage.getItem(STORAGE.save)); } catch {}
    showPanel("MANUAL SAVE / LOAD", '<p class="feature-muted">Save a snapshot when you choose. Loading restores the saved garage, upgrades, credits, selected mode, environment, difficulty, paint, and unlocked level on this device.</p><div class="feature-save-row"><button class="game-button primary" id="saveProfile">SAVE PROGRESS NOW</button><button class="game-button" id="loadProfile" ' + (hasSave ? "" : "disabled") + '>LOAD SAVED PROGRESS</button></div><p class="feature-hint">No cloud account is required. This save is local to this browser and device.</p>');
    $("saveProfile").addEventListener("click", () => {
      const snapshot = { profile: JSON.parse(JSON.stringify(profile)), difficulty: $("difficultySelect")?.value || "normal", mode: modeSelect.value, environment: environmentSelect.value, paint: $("paintSelect")?.value || selectedCar().color, level: localStorage.getItem("neonHighwayLevel") || "1", best: localStorage.getItem("neonHighwayBest") || "0" };
      localStorage.setItem(STORAGE.save, JSON.stringify(snapshot)); $("loadProfile").disabled = false; toast("Progress snapshot saved on this device.");
    });
    $("loadProfile").addEventListener("click", () => {
      let snapshot; try { snapshot = JSON.parse(localStorage.getItem(STORAGE.save) || "null"); } catch {}
      if (!snapshot || !snapshot.profile) { toast("No valid save found."); return; }
      profile = snapshot.profile; profile.upgrades = { ...defaultProfile().upgrades, ...(profile.upgrades || {}) };
      localStorage.setItem(STORAGE.profile, JSON.stringify(profile)); localStorage.setItem("neonHighwayCredits", String(profile.credits || 0));
      localStorage.setItem("neonHighwayDifficulty", snapshot.difficulty || "normal"); localStorage.setItem(STORAGE.mode, snapshot.mode || "career"); localStorage.setItem(STORAGE.environment, snapshot.environment || "neon"); localStorage.setItem("neonHighwayPaint", snapshot.paint || "#087cff"); localStorage.setItem("neonHighwayLevel", snapshot.level || "1"); localStorage.setItem("neonHighwayBest", snapshot.best || "0");
      if ($("difficultySelect")) $("difficultySelect").value = snapshot.difficulty || "normal"; modeSelect.value = snapshot.mode || "career"; environmentSelect.value = snapshot.environment || "neon";
      document.dispatchEvent(new CustomEvent("neon:paint-change", { detail: { color: snapshot.paint || "#087cff" } })); applyEnvironment(); applyUpgrades(); persistProfile(); openSaveLoad(); toast("Saved progress loaded.");
    });
  };
  function applyUpgrades() {
    document.dispatchEvent(new CustomEvent("neon:upgrades-change", { detail: { ...profile.upgrades, car: selectedCar() } }));
    window.neonHighwayProfile = profile;
  }
  function applyEnvironment() {
    document.body.dataset.environment = environmentSelect.value;
    document.dispatchEvent(new CustomEvent("neon:environment-change", { detail: { environment: environmentSelect.value } }));
  }
  $("closeFeature").addEventListener("click", hidePanel);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) hidePanel(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !overlay.classList.contains("hidden")) hidePanel(); });
  $("openGarage").addEventListener("click", openGarage);
  $("openUpgrades").addEventListener("click", openUpgrades);
  $("openMissions").addEventListener("click", openMissions);
  $("openSaveLoad").addEventListener("click", openSaveLoad);
  document.addEventListener("neon:run-ended", (event) => {
    const detail = event.detail || {};
    profile.credits = Math.max(profile.credits, Number(localStorage.getItem("neonHighwayCredits") || 0));
    profile.races += 1;
    profile.bestRun = Math.max(profile.bestRun || 0, Number(detail.score || 0));
    profile.missions.runs3 = Number(profile.missions.runs3 || 0) + 1;
    if (Number(detail.score || 0) >= 5000) profile.missions.score5k = 5000;
    if (Number(detail.coins || 0) >= 5) profile.missions.coins5 = 5;
    if (profile.missions.runs3 >= 3 && !profile.missions.runs3Paid) { profile.credits += 750; profile.missions.runs3Paid = true; toast("MISSION COMPLETE · +750 CR"); }
    if (profile.missions.score5k >= 5000 && !profile.missions.score5kPaid) { profile.credits += 900; profile.missions.score5kPaid = true; toast("MISSION COMPLETE · +900 CR"); }
    if (profile.missions.coins5 >= 5 && !profile.missions.coins5Paid) { profile.missions.coins5Paid = true; toast("MISSION COMPLETE · COIN BONUS CLAIMED"); }
    persistProfile();
  });
  window.addEventListener("neon:profile-updated", renderProfileSummary);
  const settingsList = document.querySelector("#settingsScreen .settings-list");
  if (settingsList) {
    const graphicsRow = document.createElement("div");
    graphicsRow.className = "setting-row";
    graphicsRow.innerHTML = '<div><strong>GRAPHICS QUALITY</strong><span>Adjust rendering for your device.</span></div><select id="graphicsQuality" class="difficulty-select" style="width:130px;min-height:40px;margin:0"><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option></select>';
    settingsList.appendChild(graphicsRow);
    const quality = localStorage.getItem("neonHighwayGraphics") || "high";
    graphicsRow.querySelector("select").value = quality;
    graphicsRow.querySelector("select").addEventListener("change", (event) => {
      localStorage.setItem("neonHighwayGraphics", event.target.value);
      window.dispatchEvent(new CustomEvent("neon:graphics-change", { detail: { quality: event.target.value } }));
    });
    window.dispatchEvent(new CustomEvent("neon:graphics-change", { detail: { quality } }));
  }
  const existingPaint = $("paintSelect");
  if (existingPaint) existingPaint.addEventListener("change", () => {
    const color = existingPaint.value;
    localStorage.setItem("neonHighwayPaint", color);
    document.dispatchEvent(new CustomEvent("neon:paint-change", { detail: { color } }));
  });
  if (!profile.owned.includes(profile.selected)) profile.selected = "starter";
  const currentCar = selectedCar();
  if (existingPaint && !Array.from(existingPaint.options).some((o) => o.value === currentCar.color)) {
    const option = document.createElement("option"); option.value = currentCar.color; option.textContent = currentCar.name; existingPaint.appendChild(option);
  }
  if (existingPaint && localStorage.getItem("neonHighwayPaint")) existingPaint.value = localStorage.getItem("neonHighwayPaint");
  applyUpgrades(); applyEnvironment(); persistProfile();
})();