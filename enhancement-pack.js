/* Neon Highway 3D — free local quality-of-life pack.
   No analytics, network APIs, paid services, or third-party trackers. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const KEY = "neonHighwayEnhancementsV1";
  let settings = { sound: true, reducedMotion: false };
  try { settings = { ...settings, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch {}
  let audioContext = null;
  let lastToneAt = 0;

  const motionStyle = document.createElement("style");
  motionStyle.textContent = '[data-reduced-motion="true"] *, [data-reduced-motion="true"] *::before, [data-reduced-motion="true"] *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.001ms !important; }';
  document.head.appendChild(motionStyle);

  const saveSettings = () => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {}
    document.documentElement.dataset.reducedMotion = settings.reducedMotion ? "true" : "false";
    const soundButton = $("enhSound");
    if (soundButton) soundButton.textContent = "SOUND: " + (settings.sound ? "ON" : "OFF");
    const motionButton = $("enhMotion");
    if (motionButton) motionButton.textContent = "REDUCED MOTION: " + (settings.reducedMotion ? "ON" : "OFF");
  };

  function tone(kind = "tap") {
    if (!settings.sound) return;
    const now = performance.now();
    if (now - lastToneAt < 45) return;
    lastToneAt = now;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      const frequencies = { tap: 440, start: 660, reward: 880, alert: 220 };
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequencies[kind] || 440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(90, (frequencies[kind] || 440) * 0.72), audioContext.currentTime + 0.09);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + 0.12);
    } catch { /* Audio is optional; gameplay must never depend on it. */ }
  }

  function downloadFile(name, contents, type = "application/json") {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = name; link.hidden = true;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportProgress() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("neonHighway") || key === "neonHighwayManualSaveV1")) data[key] = localStorage.getItem(key);
    }
    downloadFile("neon-highway-progress-backup.json", JSON.stringify({
      format: "neon-highway-local-backup", version: 1, exportedAt: new Date().toISOString(), data
    }, null, 2));
    tone("reward");
    notify("Progress backup downloaded. Keep the file somewhere safe.");
  }

  function importProgress(file) {
    if (!file || file.size > 1024 * 1024) {
      notify("Choose a backup file smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result || ""));
        if (backup.format !== "neon-highway-local-backup" || backup.version !== 1 || !backup.data || typeof backup.data !== "object" || Array.isArray(backup.data)) throw new Error("Invalid format");
        const entries = Object.entries(backup.data);
        if (!entries.length || entries.some(([key, value]) => !key.startsWith("neonHighway") || typeof value !== "string")) throw new Error("Invalid keys");
        if (!window.confirm("Import " + entries.length + " saved game settings/progress values? Matching local values will be replaced.")) return;
        entries.forEach(([key, value]) => localStorage.setItem(key, value));
        notify("Backup imported. Reload the page to apply all saved progress.");
        tone("reward");
      } catch {
        notify("That backup is invalid or incompatible. No progress was imported.");
      }
    };
    reader.onerror = () => notify("Could not read the selected file.");
    reader.readAsText(file);
  }

  function notify(message) {
    let node = $("enhancementToast");
    if (!node) {
      node = document.createElement("div");
      node.id = "enhancementToast";
      node.className = "feature-toast";
      node.setAttribute("role", "status");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { node.hidden = true; }, 3500);
  }

  function addControls() {
    const host = document.querySelector(".feature-actions");
    if (!host || $("enhSound")) return;
    const sound = document.createElement("button");
    sound.id = "enhSound"; sound.type = "button"; sound.className = "game-button";
    sound.addEventListener("click", () => { settings.sound = !settings.sound; saveSettings(); tone("tap"); });
    const motion = document.createElement("button");
    motion.id = "enhMotion"; motion.type = "button"; motion.className = "game-button";
    motion.addEventListener("click", () => { settings.reducedMotion = !settings.reducedMotion; saveSettings(); tone("tap"); });
    const backup = document.createElement("button");
    backup.type = "button"; backup.className = "game-button"; backup.textContent = "EXPORT BACKUP";
    backup.addEventListener("click", exportProgress);
    const importButton = document.createElement("button");
    importButton.type = "button"; importButton.className = "game-button"; importButton.textContent = "IMPORT BACKUP";
    importButton.addEventListener("click", () => $("enhBackupFile").click());
    const file = document.createElement("input");
    file.id = "enhBackupFile"; file.type = "file"; file.accept = ".json,application/json"; file.hidden = true;
    file.addEventListener("change", () => { importProgress(file.files && file.files[0]); file.value = ""; });
    host.append(sound, motion, backup, importButton, file);
    saveSettings();
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("button.game-button, .feature-close")) tone("tap");
  }, true);
  document.addEventListener("neon:run-ended", () => tone("reward"));
  document.addEventListener("neon:mode-change", () => tone("start"));
  document.addEventListener("neon:weather-change", () => tone("tap"));
  document.addEventListener("DOMContentLoaded", addControls);
  addControls();
  saveSettings();

  // Best-effort static caching. CDN rendering modules are also attempted, but
  // offline 3D play is only possible if the browser successfully caches them.
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {
        console.info("Offline caching is unavailable on this host; online play still works.");
      });
    }, { once: true });
  }
})();
