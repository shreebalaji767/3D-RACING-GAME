/* Neon Highway 3D — local race engineer, sector timing and personal records. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const root = document.createElement("aside");
  root.id = "raceEngineer";
  root.className = "race-engineer hidden";
  root.setAttribute("aria-live", "polite");
  root.innerHTML = '<div class="engineer-head"><strong>RACE ENGINEER</strong><span id="engineerMode">READY</span></div><div class="engineer-stats"><div><span>SPEED</span><b id="engineerSpeed">0</b><small>KM/H</small></div><div><span>DISTANCE</span><b id="engineerDistance">0</b><small>METRES</small></div><div><span>BEST SECTOR</span><b id="engineerBest">--</b><small>SECONDS</small></div></div><div class="engineer-sector"><span id="engineerSector">SECTOR 1 / 3</span><span id="engineerDelta">LIVE DATA</span></div><div class="engineer-bar"><i id="engineerBar"></i></div><div class="engineer-foot"><span id="engineerWeather">CLEAR</span><span id="engineerDifficulty">NORMAL</span></div>';
  document.body.appendChild(root);
  const style = document.createElement("style");
  style.textContent = '.race-engineer{position:fixed;z-index:118;right:max(12px,env(safe-area-inset-right));bottom:calc(env(safe-area-inset-bottom) + 18px);width:min(250px,43vw);padding:11px;border:1px solid #42f5ff55;border-radius:12px;background:rgba(3,10,22,.88);backdrop-filter:blur(8px);color:#f2f7ff;font:10px/1.35 system-ui,sans-serif;pointer-events:none}.engineer-head,.engineer-sector,.engineer-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}.engineer-head{font-size:9px;letter-spacing:1.3px;color:#42f5ff}.engineer-head span,.engineer-foot{color:#9eb1cb}.engineer-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0}.engineer-stats div{min-width:0;padding:7px 5px;border-radius:7px;background:#ffffff08}.engineer-stats span,.engineer-stats small{display:block;color:#9eb1cb;font-size:8px}.engineer-stats b{display:block;margin:3px 0;font-size:17px;white-space:nowrap}.engineer-sector{font-size:9px}.engineer-bar{height:4px;margin:7px 0;background:#ffffff18;border-radius:8px;overflow:hidden}.engineer-bar i{display:block;width:0;height:100%;background:linear-gradient(90deg,#087cff,#42f5ff)}.engineer-foot{font-size:8px;letter-spacing:.7px}@media(max-width:520px){.race-engineer{right:8px;bottom:calc(env(safe-area-inset-bottom) + 132px);width:min(205px,49vw);padding:8px}.engineer-stats{gap:4px;margin:7px 0}.engineer-stats b{font-size:14px}}@media(prefers-reduced-motion:reduce){.engineer-bar i{transition:none!important}}';
  document.head.appendChild(style);
  const modeNames = {career:"CAREER",championship:"NEON CUP",rival:"RIVAL SPRINT",endless:"ENDLESS", "time-trial":"TIME TRIAL",traffic:"TRAFFIC",drift:"DRIFT",police:"PURSUIT"};
  let active = false, activeMode = "career", activeDifficulty = "normal", lastDistance = 0, sectorStart = 0, sector = 0, best = null, sectorTimes = [], lastTime = 0, totalTime = 0;
  const validDifficulties = new Set(["easy","normal","hard","expert","legend"]);
  const key = (mode,difficulty) => "neonHighwaySectorBestV1:"+String(mode||"career")+":"+String(validDifficulties.has(difficulty)?difficulty:"normal");
  const readBest = (mode,difficulty) => { try { const v=JSON.parse(localStorage.getItem(key(mode,difficulty))||"null"); return Array.isArray(v)?[0,1,2].map(i=>Number.isFinite(v[i])&&v[i]>0?v[i]:null):null; } catch { return null; } }
  const fmt = (v) => Number.isFinite(v) ? v.toFixed(2) : "--";
  function reset(detail={}) {
    active=true; activeMode=String(detail.mode||"career"); activeDifficulty=validDifficulties.has(detail.difficulty)?detail.difficulty:"normal"; lastDistance=0; sectorStart=0; sector=0; lastTime=performance.now(); totalTime=0; sectorTimes=[]; best=readBest(activeMode,activeDifficulty);
    root.classList.remove("hidden");
    $("engineerMode").textContent=modeNames[detail.mode]||"RACE";
    $("engineerBest").textContent=best&&best.length?fmt(Math.min(...best)):"--";
    $("engineerSector").textContent="SECTOR 1 / 3";
    $("engineerDelta").textContent="TIMING LIVE";
    $("engineerBar").style.width="0%";
  }
  document.addEventListener("neon:race-start",e=>reset(e.detail||{}));
  document.addEventListener("neon:telemetry-tick",e=>{
    if(!active)return;
    const d=e.detail||{}, now=performance.now(), delta=Math.max(0,(now-lastTime)/1000); lastTime=now; totalTime+=delta;
    const distance=Math.max(0,Number(d.distance)||0);
    $("engineerSpeed").textContent=String(Math.round(Number(d.speed)||0));
    $("engineerDistance").textContent=Math.floor(distance).toLocaleString();
    $("engineerWeather").textContent=String(d.weather||"clear").toUpperCase();
    $("engineerDifficulty").textContent=String(d.difficulty||"normal").toUpperCase();
    const sectionLength=500, completedSectors=Math.min(3,Math.floor(distance/sectionLength));
    const visibleSector=Math.min(2,Math.floor(distance/sectionLength));
    $("engineerSector").textContent="SECTOR "+(visibleSector+1)+" / 3";
    $("engineerBar").style.width=(Math.min(1,(distance%sectionLength)/sectionLength)*100).toFixed(1)+"%";
    const progress=distance-lastDistance;
    if(progress>0&&progress<30)sectorStart+=delta;
    lastDistance=distance;
    while(completedSectors>sector&&sector<3){
      sectorTimes[sector]=sectorStart;
      sectorStart=0; sector+=1;
      const split=sectorTimes[sector-1];
      $("engineerDelta").textContent="SPLIT "+fmt(split)+" S";
      const recorded=(best||[]).filter(v=>Number.isFinite(v)&&v>0);
      $("engineerBest").textContent=recorded.length?fmt(Math.min(...recorded)):"--";
    }
  });
  document.addEventListener("neon:run-ended",e=>{
    if(!active)return; active=false;
    const d=e.detail||{};
    const endedMode=activeMode;
    const endedDifficulty=activeDifficulty;
    // Save only completed sectors. The last sector is completed only when the finish
    // distance is reached, even if the final telemetry tick happened just before it.
    if(Number(d.distance)>=1500&&sector===2){sectorTimes[2]=sectorStart;sector=3;}
    const old=readBest(endedMode,endedDifficulty)||[null,null,null];
    const next=[0,1,2].map(i=>{
      const candidate=sectorTimes[i];
      const previous=old[i];
      return Number.isFinite(candidate)&&candidate>0
        ? (Number.isFinite(previous)&&previous>0?Math.min(previous,candidate):candidate)
        : previous;
    });
    const saved=next.some(v=>Number.isFinite(v)&&v>0);
    if(saved){
      try{localStorage.setItem(key(endedMode,endedDifficulty),JSON.stringify(next));}catch{}
      $("engineerDelta").textContent="RUN SAVED · "+endedDifficulty.toUpperCase();
      const recorded=next.filter(v=>Number.isFinite(v)&&v>0);
      $("engineerBest").textContent=recorded.length?fmt(Math.min(...recorded)):"--";
    } else $("engineerDelta").textContent="RUN ENDED";
    $("engineerMode").textContent="RESULT";
  });
  document.addEventListener("neon:menu-opened",()=>{active=false;root.classList.add("hidden")});
  document.addEventListener("neon:mode-change",()=>{if(!active)root.classList.add("hidden")});
})();
