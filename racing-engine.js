/* Neon Highway 3D — deterministic local racing-engine systems.
 * No AI model, network service, API key, telemetry, or paid dependency.
 * This is gameplay logic built on the free Three.js renderer.
 */
export function createRacingEngine(THREE, scene, { isMobile = false } = {}) {
  let seed = 0x6d2b79f5;
  let weather = "clear";
  let weatherObject = null;
  let weatherGeometry = null;
  let weatherMaterial = null;
  let weatherPositions = null;
  let weatherCount = 0;
  const lanes = [-5.25, -1.75, 1.75, 5.25];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const random = () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const seededValue = (value) => {
    let x = (Number(value) || 1) | 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
  function clearWeather() {
    if (weatherObject) scene.remove(weatherObject);
    weatherGeometry?.dispose();
    weatherMaterial?.dispose();
    weatherObject = weatherGeometry = weatherMaterial = weatherPositions = null;
    weatherCount = 0;
  }
  function setWeather(next = "clear") {
    const safe = ["clear", "rain", "snow", "fog"].includes(next) ? next : "clear";
    if (safe === weather && weatherObject) return;
    weather = safe;
    clearWeather();
    if (safe === "fog") {
      if (scene.fog) scene.fog.density = isMobile ? 0.014 : 0.011;
      return;
    }
    if (scene.fog) scene.fog.density = isMobile ? 0.010 : 0.008;
    if (safe === "clear") return;
    weatherCount = safe === "rain" ? (isMobile ? 150 : 320) : (isMobile ? 90 : 180);
    const vertices = safe === "rain" ? weatherCount * 2 : weatherCount;
    weatherPositions = new Float32Array(vertices * 3);
    for (let i = 0; i < vertices; i++) {
      weatherPositions[i * 3] = (random() - 0.5) * 42;
      weatherPositions[i * 3 + 1] = random() * 24;
      weatherPositions[i * 3 + 2] = -random() * 150 + 18;
    }
    if (safe === "rain") {
      for (let i = 0; i < weatherCount; i++) {
        const a = i * 6;
        weatherPositions[a + 3] = weatherPositions[a] - 0.28;
        weatherPositions[a + 4] = weatherPositions[a + 1] - 1.1;
        weatherPositions[a + 5] = weatherPositions[a + 2];
      }
    }
    weatherGeometry = new THREE.BufferGeometry();
    weatherGeometry.setAttribute("position", new THREE.BufferAttribute(weatherPositions, 3));
    weatherMaterial = safe === "rain"
      ? new THREE.LineBasicMaterial({ color: 0x9acfff, transparent: true, opacity: 0.44 })
      : new THREE.PointsMaterial({ color: 0xe6f5ff, size: isMobile ? 0.11 : 0.16, transparent: true, opacity: 0.82, sizeAttenuation: true });
    weatherObject = safe === "rain"
      ? new THREE.LineSegments(weatherGeometry, weatherMaterial)
      : new THREE.Points(weatherGeometry, weatherMaterial);
    weatherObject.frustumCulled = false;
    scene.add(weatherObject);
  }
  function updateWeather(delta, speed = 0, playerX = 0) {
    if (!weatherObject || !weatherPositions) return;
    const rain = weather === "rain";
    const stride = rain ? 2 : 1;
    const fall = (rain ? 38 : 5.5) * delta;
    for (let i = 0; i < weatherCount; i++) {
      const base = i * stride * 3;
      let y = weatherPositions[base + 1] - fall;
      let z = weatherPositions[base + 2] + Math.max(0, speed) * delta * 0.16;
      if (y < 0 || z > 24) {
        y = 14 + random() * 12;
        z = -100 - random() * 70;
        weatherPositions[base] = playerX + (random() - 0.5) * 42;
        if (rain) {
          weatherPositions[base + 3] = weatherPositions[base] - 0.28;
          weatherPositions[base + 4] = y - 1.1;
          weatherPositions[base + 5] = z;
        }
      }
      weatherPositions[base + 1] = y;
      weatherPositions[base + 2] = z;
      if (rain) {
        weatherPositions[base + 3] += (playerX - weatherPositions[base + 3]) * delta * 0.04;
        weatherPositions[base + 4] = y - 1.1;
        weatherPositions[base + 5] = z;
      }
    }
    weatherGeometry.attributes.position.needsUpdate = true;
  }
  function updateCarAI(car, trafficCars, player, delta, roadLimit = 5.9, aggressive = false) {
    if (!car?.userData || !Number.isFinite(car.position.x)) return;
    const data = car.userData;
    if (data.aiLane === undefined) {
      data.aiLane = Number.isInteger(data.lane) ? data.lane : lanes.reduce((best, x, i) => Math.abs(x-car.position.x) < Math.abs(lanes[best]-car.position.x) ? i : best, 0);
      data.targetLane = data.aiLane;
      data.aiTimer = 0.5 + seededValue(data.aiSeed || car.id || 1) * 1.6;
      data.aiSeed = (data.aiSeed || car.id || 1) | 0;
    }
    data.aiClock = (data.aiClock || 0) + delta;
    data.aiTimer -= delta;
    if (data.aiTimer <= 0) {
      data.aiTimer = 0.8 + seededValue(data.aiSeed + Math.floor(data.aiClock * 3)) * (aggressive ? 1.0 : 2.2);
      const blocked = trafficCars.some(other => other !== car &&
        Math.abs(other.position.z - car.position.z) < (aggressive ? 20 : 14) &&
        Math.abs(other.position.x - lanes[data.targetLane]) < 2.3);
      if (blocked || (aggressive && seededValue(data.aiSeed + Math.floor(data.aiClock * 7)) > 0.84)) {
        const candidates = lanes.map((x, lane) => ({ lane, x, clear: !trafficCars.some(other => other !== car &&
          Math.abs(other.position.z - car.position.z) < 24 && Math.abs(other.position.x - x) < 2.25) &&
          (!player || Math.abs(player.position.z - car.position.z) > 8 || Math.abs(player.position.x - x) > 2.1) }))
          .filter(option => option.clear && Math.abs(option.x) <= roadLimit);
        if (candidates.length) {
          candidates.sort((a,b) => Math.abs(a.lane-data.aiLane)-Math.abs(b.lane-data.aiLane));
          data.targetLane = candidates[aggressive && candidates.length > 1 ? 1 : 0].lane;
        }
      }
    }
    const targetX = lanes[data.targetLane] ?? lanes[data.aiLane];
    const response = aggressive ? 3.4 : 2.2;
    car.position.x += (targetX - car.position.x) * (1 - Math.exp(-response * delta));
  }
  function updateSurfaceGrip(baseGrip = 1) {
    return weather === "rain" ? baseGrip * 0.86 : weather === "snow" ? baseGrip * 0.74 : baseGrip;
  }
  return {
    random, setWeather, updateWeather, updateCarAI, updateSurfaceGrip,
    get weather() { return weather; },
    dispose() { clearWeather(); }
  };
}
