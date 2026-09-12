import * as THREE from 'three';

/* =========================================================
   NEON HIGHWAY 3D
   Realistic procedural cars + environment
   Strict collision detection
   ========================================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050911);
scene.fog = new THREE.Fog(0x050911, 35, 240);

const camera = new THREE.PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.1,
    600
);

camera.position.set(0, 5.2, 11);
camera.lookAt(0, 1, -25);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.appendChild(renderer.domElement);


/* =========================================================
   LIGHTING
   ========================================================= */

const hemiLight = new THREE.HemisphereLight(
    0x9ecbff,
    0x10151d,
    2.2
);

scene.add(hemiLight);

const moonLight = new THREE.DirectionalLight(
    0xc8ddff,
    2.8
);

moonLight.position.set(-40, 70, 20);
moonLight.castShadow = true;

moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;

moonLight.shadow.camera.left = -70;
moonLight.shadow.camera.right = 70;
moonLight.shadow.camera.top = 80;
moonLight.shadow.camera.bottom = -80;

scene.add(moonLight);


/* =========================================================
   ROAD
   ========================================================= */

const roadWidth = 14;
const roadLength = 320;
const roadSegment = 12;

const roadParts = [];

function createBox(
    width,
    height,
    depth,
    color,
    x,
    y,
    z,
    roughness = 0.8,
    metalness = 0
) {
    const material = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


/* Asphalt */

for (
    let z = -roadLength / 2;
    z < roadLength / 2;
    z += roadSegment
) {
    const road = createBox(
        roadWidth,
        0.12,
        roadSegment,
        0x252a31,
        0,
        0,
        z,
        0.92,
        0.02
    );

    roadParts.push(road);

    /* Lane markings */

    createBox(
        0.10,
        0.025,
        roadSegment * 0.48,
        0xf2f3f4,
        -3.5,
        0.075,
        z,
        0.55
    );

    createBox(
        0.10,
        0.025,
        roadSegment * 0.48,
        0xf2f3f4,
        3.5,
        0.075,
        z,
        0.55
    );

    /* Yellow road edges */

    createBox(
        0.16,
        0.04,
        roadSegment,
        0xffc928,
        -7.15,
        0.08,
        z,
        0.5
    );

    createBox(
        0.16,
        0.04,
        roadSegment,
        0xffc928,
        7.15,
        0.08,
        z,
        0.5
    );
}


/* =========================================================
   GROUND
   ========================================================= */

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c2117,
    roughness: 1
});

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 500),
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.25, -100);

ground.receiveShadow = true;

scene.add(ground);


/* =========================================================
   ROAD BARRIERS
   ========================================================= */

for (let z = -155; z < 160; z += 10) {

    createBox(
        0.25,
        0.7,
        8,
        0x9ca3a8,
        -7.8,
        0.35,
        z,
        0.35,
        0.65
    );

    createBox(
        0.25,
        0.7,
        8,
        0x9ca3a8,
        7.8,
        0.35,
        z,
        0.35,
        0.65
    );

    createBox(
        0.35,
        0.15,
        8,
        0xc5ccd2,
        -7.8,
        0.65,
        z,
        0.3,
        0.8
    );

    createBox(
        0.35,
        0.15,
        8,
        0xc5ccd2,
        7.8,
        0.65,
        z,
        0.3,
        0.8
    );
}


/* =========================================================
   CITY BUILDINGS
   ========================================================= */

function createBuilding(x, z) {

    const width = 5 + Math.random() * 7;
    const depth = 5 + Math.random() * 8;
    const height = 8 + Math.random() * 30;

    const colors = [
        0x111820,
        0x17212c,
        0x202a35,
        0x10161e,
        0x252e38
    ];

    const building = createBox(
        width,
        height,
        depth,
        colors[Math.floor(Math.random() * colors.length)],
        x,
        height / 2 - 0.2,
        z,
        0.9,
        0.05
    );

    /* Windows */

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x9bdcff,
        emissive: 0x315f80,
        emissiveIntensity: 1.5
    });

    const floors = Math.floor(height / 3);

    for (let floor = 0; floor < floors; floor++) {

        for (let side = -1; side <= 1; side += 2) {

            for (let w = -1; w <= 1; w++) {

                if (Math.random() < 0.3) continue;

                const windowMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.55,
                        0.7,
                        0.04
                    ),
                    windowMaterial
                );

                windowMesh.position.set(
                    x + w * (width * 0.25),
                    1.5 + floor * 3,
                    z + side * (depth / 2 + 0.03)
                );

                scene.add(windowMesh);
            }
        }
    }
}

for (let i = 0; i < 65; i++) {

    const side = Math.random() < 0.5 ? -1 : 1;

    const x =
        side *
        (15 + Math.random() * 35);

    const z =
        -20 -
        Math.random() * 240;

    createBuilding(x, z);
}


/* =========================================================
   TREES
   ========================================================= */

function createTree(x, z) {

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.25,
            0.4,
            3,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x4c3020,
            roughness: 1
        })
    );

    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;

    scene.add(trunk);

    const crownMaterial = new THREE.MeshStandardMaterial({
        color: 0x0d542f,
        roughness: 0.95
    });

    for (let i = 0; i < 3; i++) {

        const crown = new THREE.Mesh(
            new THREE.SphereGeometry(
                1.5 + Math.random() * 0.8,
                10,
                8
            ),
            crownMaterial
        );

        crown.position.set(
            x + (Math.random() - 0.5),
            3.4 + i * 0.8,
            z + (Math.random() - 0.5)
        );

        crown.castShadow = true;

        scene.add(crown);
    }
}

for (let i = 0; i < 90; i++) {

    const side = Math.random() < 0.5 ? -1 : 1;

    const x =
        side *
        (11 + Math.random() * 32);

    const z =
        -Math.random() * 270;

    createTree(x, z);
}


/* =========================================================
   STREET LIGHTS
   ========================================================= */

function createStreetLight(x, z) {

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.08,
            0.12,
            5.5,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x343a40,
            metalness: 0.75,
            roughness: 0.35
        })
    );

    pole.position.set(x, 2.75, z);
    pole.castShadow = true;

    scene.add(pole);

    const arm = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.3,
            0.08,
            0.08
        ),
        pole.material
    );

    arm.position.set(
        x + (x < 0 ? 0.55 : -0.55),
        5.35,
        z
    );

    scene.add(arm);

    const light = new THREE.PointLight(
        0xffe9b0,
        18,
        18,
        2
    );

    light.position.set(
        x + (x < 0 ? 1 : -1),
        5.15,
        z
    );

    scene.add(light);

    const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 8),
        new THREE.MeshBasicMaterial({
            color: 0xfff0b5
        })
    );

    lamp.position.copy(light.position);

    scene.add(lamp);
}

for (let z = -155; z < 160; z += 22) {

    createStreetLight(-9.2, z);
    createStreetLight(9.2, z + 11);
}


/* =========================================================
   MOON
   ========================================================= */

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 24),
    new THREE.MeshBasicMaterial({
        color: 0xb8d5ff
    })
);

moon.position.set(
    -65,
    55,
    -180
);

scene.add(moon);


/* =========================================================
   REALISTIC PROCEDURAL CAR
   ========================================================= */

function makeCar(color = 0x00d9ff) {

    const car = new THREE.Group();

    /* Main lower body */

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.65,
        roughness: 0.25
    });

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.05,
            0.48,
            4.25
        ),
        bodyMaterial
    );

    body.position.y = 0.62;
    body.castShadow = true;

    car.add(body);


    /* Hood */

    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.9,
            0.22,
            1.25
        ),
        bodyMaterial
    );

    hood.position.set(
        0,
        0.86,
        -1.35
    );

    hood.castShadow = true;

    car.add(hood);


    /* Roof */

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x101722,
        metalness: 0.25,
        roughness: 0.18
    });

    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.55,
            0.48,
            1.75
        ),
        roofMaterial
    );

    roof.position.set(
        0,
        1.12,
        0.15
    );

    roof.rotation.x = 0.03;

    roof.castShadow = true;

    car.add(roof);


    /* Windshield */

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x13293b,
        metalness: 0.05,
        roughness: 0.08,
        transparent: true,
        opacity: 0.72
    });

    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.42,
            0.34,
            0.08
        ),
        glassMaterial
    );

    windshield.position.set(
        0,
        1.14,
        -0.78
    );

    windshield.rotation.x = -0.18;

    car.add(windshield);


    /* Rear window */

    const rearWindow = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.42,
            0.34,
            0.08
        ),
        glassMaterial
    );

    rearWindow.position.set(
        0,
        1.14,
        0.92
    );

    rearWindow.rotation.x = 0.18;

    car.add(rearWindow);


    /* Wheels */

    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x080a0d,
        roughness: 0.8
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8bec5,
        metalness: 0.85,
        roughness: 0.2
    });

    for (const x of [-0.96, 0.96]) {

        for (const z of [-1.42, 1.42]) {

            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.39,
                    0.39,
                    0.25,
                    20
                ),
                wheelMaterial
            );

            tire.rotation.z = Math.PI / 2;

            tire.position.set(
                x,
                0.4,
                z
            );

            tire.castShadow = true;

            car.add(tire);


            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.19,
                    0.19,
                    0.27,
                    16
                ),
                rimMaterial
            );

            rim.rotation.z = Math.PI / 2;

            rim.position.set(
                x,
                0.4,
                z
            );

            car.add(rim);
        }
    }


    /* Front headlights */

    const headlightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x9edfff,
            emissiveIntensity: 6
        });

    for (const x of [-0.62, 0.62]) {

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.16,
                0.08
            ),
            headlightMaterial
        );

        light.position.set(
            x,
            0.75,
            -2.15
        );

        car.add(light);
    }


    /* Rear brake lights */

    const brakeMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff1111,
            emissive: 0xff0000,
            emissiveIntensity: 4
        });

    for (const x of [-0.62, 0.62]) {

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.15,
                0.08
            ),
            brakeMaterial
        );

        light.position.set(
            x,
            0.76,
            2.15
        );

        car.add(light);
    }


    /* Side mirrors */

    for (const x of [-1.08, 1.08]) {

        const mirror = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.13,
                0.32
            ),
            roofMaterial
        );

        mirror.position.set(
            x,
            1.02,
            -0.45
        );

        car.add(mirror);
    }


    /* Spoiler */

    const spoiler = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.65,
            0.08,
            0.22
        ),
        bodyMaterial
    );

    spoiler.position.set(
        0,
        1.12,
        1.8
    );

    car.add(spoiler);


    return car;
}


/* =========================================================
   PLAYER
   ========================================================= */

const player = makeCar(0x00d9ff);

player.position.set(
    0,
    0,
    6
);

scene.add(player);


/* =========================================================
   GAME VARIABLES
   ========================================================= */

const lanes = [
    -5.25,
    -1.75,
    1.75,
    5.25
];

const traffic = [];
const coins = [];

let score = 0;

let best =
    Number(localStorage.getItem('neon3dBest') || 0);

let speed = 28;

let running = false;
let paused = false;

let spawnTimer = 0;
let coinTimer = 0;

let lastTime = 0;

let steer = 0;
let throttle = 0;


/* =========================================================
   DOM
   ========================================================= */

const speedEl = document.querySelector('#speed');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');

const menu = document.querySelector('#menu');
const pauseScreen = document.querySelector('#pause');
const over = document.querySelector('#over');

const howtoScreen =
    document.querySelector('#howtoScreen');

const settingsScreen =
    document.querySelector('#settingsScreen');

const menuBest =
    document.querySelector('#menuBest');

const finalScore =
    document.querySelector('#finalScore');

const finalBest =
    document.querySelector('#finalBest');


bestEl.textContent = best;

if (menuBest) {
    menuBest.textContent = best;
}


/* =========================================================
   HUD
   ========================================================= */

function updateHud() {

    speedEl.textContent =
        Math.round(speed * 3.6);

    scoreEl.textContent =
        Math.floor(score);

    bestEl.textContent =
        best;

    if (menuBest) {
        menuBest.textContent =
            best;
    }
}


/* =========================================================
   TRAFFIC
   ========================================================= */

function addTraffic() {

    const colors = [
        0xff3b30,
        0xffc928,
        0x9b6cff,
        0x25e0a0,
        0xff7043,
        0xffffff,
        0x1d75ff
    ];

    const car =
        makeCar(
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ]
        );

    car.position.set(
        lanes[
            Math.floor(
                Math.random() *
                lanes.length
            )
        ],
        0,
        -120
    );

    car.userData.speed =
        14 +
        Math.random() * 18;

    scene.add(car);

    traffic.push(car);
}


/* =========================================================
   COINS
   ========================================================= */

function addCoin() {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffd23f,
            emissive: 0x9b6200,
            emissiveIntensity: 2,
            metalness: 0.8,
            roughness: 0.2
        });

    const coin =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.42,
                0.12,
                12,
                24
            ),
            material
        );

    coin.rotation.x =
        Math.PI / 2;

    coin.position.set(
        lanes[
            Math.floor(
                Math.random() *
                lanes.length
            )
        ],
        1.2,
        -115
    );

    scene.add(coin);

    coins.push(coin);
}


/* =========================================================
   RESET
   ========================================================= */

function reset() {

    score = 0;

    speed = 28;

    player.position.set(
        0,
        0,
        6
    );

    player.rotation.set(
        0,
        0,
        0
    );

    traffic.forEach(car => {
        scene.remove(car);
    });

    coins.forEach(coin => {
        scene.remove(coin);
    });

    traffic.length = 0;
    coins.length = 0;

    spawnTimer = 0;
    coinTimer = 0;

    updateHud();
}


/* =========================================================
   STRICT COLLISION DETECTION
   ========================================================= */

/*
   IMPORTANT:

   The old collision system used only X/Z distance.

   This system uses THREE.Box3.

   This means if the player's physical car body
   touches another car, even slightly, the collision
   is detected.

   The small tolerance makes the game feel strict.
*/

function carsCollide(playerCar, trafficCar) {

    const playerBox =
        new THREE.Box3().setFromObject(
            playerCar
        );

    const trafficBox =
        new THREE.Box3().setFromObject(
            trafficCar
        );

    /*
       Expand boxes by a very small amount.

       This means a tiny visual touch also counts.
    */

    const collisionTolerance = 0.035;

    playerBox.min.x -= collisionTolerance;
    playerBox.min.y -= collisionTolerance;
    playerBox.min.z -= collisionTolerance;

    playerBox.max.x += collisionTolerance;
    playerBox.max.y += collisionTolerance;
    playerBox.max.z += collisionTolerance;

    return playerBox.intersectsBox(
        trafficBox
    );
}


/* =========================================================
   CRASH
   ========================================================= */

function crash() {

    if (!running) {
        return;
    }

    running = false;
    paused = false;

    best = Math.max(
        best,
        Math.floor(score)
    );

    localStorage.setItem(
        'neon3dBest',
        best
    );

    finalScore.textContent =
        Math.floor(score);

    finalBest.textContent =
        best;

    pauseScreen.classList.add(
        'hidden'
    );

    over.classList.remove(
        'hidden'
    );

    updateHud();
}


/* =========================================================
   START
   ========================================================= */

function startGame() {

    reset();

    running = true;
    paused = false;

    menu.classList.add(
        'hidden'
    );

    over.classList.add(
        'hidden'
    );

    pauseScreen.classList.add(
        'hidden'
    );

    howtoScreen.classList.add(
        'hidden'
    );

    settingsScreen.classList.add(
        'hidden'
    );

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseGame() {

    if (!running) {
        return;
    }

    paused = !paused;

    if (paused) {

        pauseScreen.classList.remove(
            'hidden'
        );

        return;
    }

    pauseScreen.classList.add(
        'hidden'
    );

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   EXIT GAME
   ========================================================= */

function exitGame() {

    running = false;
    paused = false;

    pauseScreen.classList.add(
        'hidden'
    );

    over.classList.add(
        'hidden'
    );

    howtoScreen.classList.add(
        'hidden'
    );

    settingsScreen.classList.add(
        'hidden'
    );

    menu.classList.remove(
        'hidden'
    );

    reset();

    camera.position.set(
        0,
        5.2,
        11
    );

    camera.lookAt(
        0,
        1,
        -25
    );

    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   KEYBOARD
   ========================================================= */

function handleKey(event, pressed) {

    const key =
        event.key.toLowerCase();

    if (
        [
            'arrowleft',
            'arrowright',
            'arrowup',
            'arrowdown',
            'a',
            'd',
            'w',
            's'
        ].includes(key)
    ) {
        event.preventDefault();
    }


    /* ESC ONLY FOR PAUSE */

    if (
        key === 'escape' &&
        pressed
    ) {

        if (
            settingsScreen &&
            !settingsScreen.classList.contains(
                'hidden'
            )
        ) {
            return;
        }

        if (
            howtoScreen &&
            !howtoScreen.classList.contains(
                'hidden'
            )
        ) {
            return;
        }

        pauseGame();

        return;
    }


    if (
        key === 'arrowleft' ||
        key === 'a'
    ) {
        steer =
            pressed ? -1 : 0;
    }


    if (
        key === 'arrowright' ||
        key === 'd'
    ) {
        steer =
            pressed ? 1 : 0;
    }


    if (
        key === 'arrowup' ||
        key === 'w'
    ) {
        throttle =
            pressed ? 1 : 0;
    }


    if (
        key === 'arrowdown' ||
        key === 's'
    ) {
        throttle =
            pressed ? -1 : 0;
    }
}


window.addEventListener(
    'keydown',
    event => handleKey(event, true)
);

window.addEventListener(
    'keyup',
    event => handleKey(event, false)
);


/* =========================================================
   TOUCH CONTROLS
   ========================================================= */

function bindControl(
    selector,
    callback
) {

    const button =
        document.querySelector(selector);

    if (!button) {
        return;
    }

    button.addEventListener(
        'pointerdown',
        event => {

            event.preventDefault();

            callback(true);
        }
    );

    button.addEventListener(
        'pointerup',
        event => {

            event.preventDefault();

            callback(false);
        }
    );

    button.addEventListener(
        'pointercancel',
        () => {
            callback(false);
        }
    );

    button.addEventListener(
        'pointerleave',
        () => {
            callback(false);
        }
    );
}


bindControl(
    '#left',
    value => {
        steer =
            value ? -1 : 0;
    }
);

bindControl(
    '#right',
    value => {
        steer =
            value ? 1 : 0;
    }
);

bindControl(
    '#boost',
    value => {
        throttle =
            value ? 1 : 0;
    }
);

bindControl(
    '#brake',
    value => {
        throttle =
            value ? -1 : 0;
    }
);


/* =========================================================
   BUTTONS
   ========================================================= */

document.querySelector(
    '#start'
)?.addEventListener(
    'click',
    startGame
);

document.querySelector(
    '#again'
)?.addEventListener(
    'click',
    startGame
);

document.querySelector(
    '#resume'
)?.addEventListener(
    'click',
    pauseGame
);

document.querySelector(
    '#restart'
)?.addEventListener(
    'click',
    startGame
);

document.querySelector(
    '#exit'
)?.addEventListener(
    'click',
    exitGame
);

document.querySelector(
    '#mainMenu'
)?.addEventListener(
    'click',
    exitGame
);


/* =========================================================
   HOW TO PLAY
   ========================================================= */

document.querySelector(
    '#howto'
)?.addEventListener(
    'click',
    () => {

        howtoScreen.classList.remove(
            'hidden'
        );
    }
);


document.querySelector(
    '#closeHowto'
)?.addEventListener(
    'click',
    () => {

        howtoScreen.classList.add(
            'hidden'
        );
    }
);


document.querySelector(
    '#closeHowto2'
)?.addEventListener(
    'click',
    () => {

        howtoScreen.classList.add(
            'hidden'
        );
    }
);


/* =========================================================
   SETTINGS
   ========================================================= */

document.querySelector(
    '#settings'
)?.addEventListener(
    'click',
    () => {

        settingsScreen.classList.remove(
            'hidden'
        );
    }
);


document.querySelector(
    '#pauseSettings'
)?.addEventListener(
    'click',
    () => {

        settingsScreen.classList.remove(
            'hidden'
        );
    }
);


document.querySelector(
    '#closeSettings'
)?.addEventListener(
    'click',
    () => {

        settingsScreen.classList.add(
            'hidden'
        );
    }
);


document.querySelector(
    '#closeSettings2'
)?.addEventListener(
    'click',
    () => {

        settingsScreen.classList.add(
            'hidden'
        );
    }
);


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(time) {

    if (!running || paused) {
        return;
    }

    const delta =
        Math.min(
            (time - lastTime) / 1000,
            0.04
        );

    lastTime = time;


    /* Speed increases */

    speed +=
        delta *
        (1.8 + score / 4000);


    if (throttle > 0) {

        speed +=
            delta * 15;
    }


    if (throttle < 0) {

        speed -=
            delta * 24;
    }


    speed =
        THREE.MathUtils.clamp(
            speed,
            18,
            72
        );


    /* Score */

    score +=
        delta *
        speed *
        0.75;


    /* Player movement */

    player.position.x +=
        steer *
        delta *
        8;


    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -6.1,
            6.1
        );


    player.rotation.z =
        THREE.MathUtils.lerp(
            player.rotation.z,
            -steer * 0.08,
            delta * 8
        );


    /* Camera */

    camera.position.x +=
        (
            player.position.x * 0.18 -
            camera.position.x
        ) *
        delta *
        3;


    camera.lookAt(
        player.position.x * 0.1,
        1,
        -22
    );


    /* Traffic spawning */

    spawnTimer -= delta;

    coinTimer -= delta;


    if (spawnTimer <= 0) {

        addTraffic();

        spawnTimer =
            Math.max(
                0.45,
                1.15 -
                score / 18000
            );
    }


    if (coinTimer <= 0) {

        addCoin();

        coinTimer =
            0.7 +
            Math.random() * 1.1;
    }


    /* =====================================================
       TRAFFIC
       ===================================================== */

    for (
        let i = traffic.length - 1;
        i >= 0;
        i--
    ) {

        const car =
            traffic[i];


        car.position.z +=
            (
                speed -
                car.userData.speed
            ) *
            delta;


        /*
           STRICT COLLISION

           Check before allowing the car
           to pass through the player.

           Even a very small physical overlap
           triggers GAME OVER.
        */

        if (
            carsCollide(
                player,
                car
            )
        ) {

            crash();

            return;
        }


        if (
            car.position.z > 20
        ) {

            scene.remove(car);

            traffic.splice(
                i,
                1
            );
        }
    }


    /* =====================================================
       COINS
       ===================================================== */

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];


        coin.position.z +=
            speed * delta;


        coin.rotation.z +=
            delta * 5;


        if (
            coin.position.z > 20
        ) {

            scene.remove(coin);

            coins.splice(
                i,
                1
            );

            continue;
        }


        if (
            Math.abs(
                coin.position.x -
                player.position.x
            ) < 1.4 &&
            Math.abs(
                coin.position.z -
                player.position.z
            ) < 2.4
        ) {

            score += 100;

            scene.remove(coin);

            coins.splice(
                i,
                1
            );
        }
    }


    /* =====================================================
       ROAD MOVEMENT
       ===================================================== */

    for (const road of roadParts) {

        road.position.z +=
            speed * delta;

        if (
            road.position.z > 18
        ) {

            road.position.z -=
                roadLength;
        }
    }


    updateHud();

    renderer.render(
        scene,
        camera
    );

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    'resize',
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


/* =========================================================
   INITIAL RENDER
   ========================================================= */

updateHud();

renderer.render(
    scene,
    camera
);
