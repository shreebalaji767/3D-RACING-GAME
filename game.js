import * as THREE from 'three';


/* =====================================================
   SCENE
===================================================== */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x07111f);

scene.fog =
    new THREE.Fog(
        0x07111f,
        45,
        210
    );


/* =====================================================
   CAMERA
===================================================== */

const camera =
    new THREE.PerspectiveCamera(
        62,
        innerWidth / innerHeight,
        0.1,
        500
    );

camera.position.set(
    0,
    5.8,
    11
);

camera.lookAt(
    0,
    1,
    -20
);


/* =====================================================
   RENDERER
===================================================== */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
);

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


/* =====================================================
   LIGHTING
===================================================== */

scene.add(
    new THREE.HemisphereLight(
        0x9bdcff,
        0x10151c,
        2.0
    )
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.2
    );

sun.position.set(
    -20,
    35,
    20
);

sun.castShadow = true;

scene.add(sun);


/* =====================================================
   ROAD
===================================================== */

const roadW = 14;

const segment = 12;

const roadLen = 260;

const roadParts = [];


function box(
    w,
    h,
    d,
    color,
    x,
    y,
    z
) {

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w,
                h,
                d
            ),

            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.8
            })
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


/* =====================================================
   ROAD SEGMENTS
===================================================== */

for (
    let z = -roadLen / 2;
    z < roadLen / 2;
    z += segment
) {

    const road =
        box(
            roadW,
            0.12,
            segment,
            0x20252c,
            0,
            0,
            z
        );

    roadParts.push(road);


    /* Lane lines */

    box(
        0.18,
        0.04,
        segment * 0.55,
        0xf3f4f6,
        -3.5,
        0.09,
        z
    );


    box(
        0.18,
        0.04,
        segment * 0.55,
        0xf3f4f6,
        3.5,
        0.09,
        z
    );


    /* Road edges */

    box(
        0.22,
        0.08,
        segment,
        0xffd84a,
        -roadW / 2 - 0.15,
        0.08,
        z
    );


    box(
        0.22,
        0.08,
        segment,
        0xffd84a,
        roadW / 2 + 0.15,
        0.08,
        z
    );

}


/* =====================================================
   GROUND
===================================================== */

box(
    240,
    0.2,
    300,
    0x102b1b,
    0,
    -0.16,
    -80
);


/* =====================================================
   TREES
===================================================== */

for (
    let i = 0;
    i < 70;
    i++
) {

    const side =
        Math.random() < 0.5
            ? -1
            : 1;

    const x =
        side *
        (
            10 +
            Math.random() * 42
        );

    const z =
        -Math.random() * 230;


    const trunk =
        box(
            0.5,
            2 + Math.random() * 3,
            0.5,
            0x5a3926,
            x,
            1,
            z
        );


    const crown =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.5 +
                Math.random() * 1.7,
                8,
                6
            ),

            new THREE.MeshStandardMaterial({
                color: 0x145b32
            })
        );


    crown.position.set(
        x,
        3.2,
        z
    );

    crown.castShadow = true;

    scene.add(crown);

}


/* =====================================================
   MOON
===================================================== */

const moon =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            7,
            24,
            16
        ),

        new THREE.MeshBasicMaterial({
            color: 0x8fb6ff
        })
    );

moon.position.set(
    -65,
    50,
    -170
);

scene.add(moon);


/* =====================================================
   CAR CREATOR
===================================================== */

function makeCar(
    color = 0x00d9ff
) {

    const group =
        new THREE.Group();


    /* Body */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.15,
                0.55,
                4.1
            ),

            new THREE.MeshStandardMaterial({
                color,
                metalness: 0.15,
                roughness: 0.45
            })

        );

    body.position.y =
        0.62;

    body.castShadow = true;

    group.add(body);


    /* Cabin */

    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.55,
                0.65,
                1.9
            ),

            new THREE.MeshStandardMaterial({
                color: 0x172b45,
                metalness: 0.1,
                roughness: 0.2
            })

        );

    cabin.position.set(
        0,
        1.05,
        0.15
    );

    cabin.castShadow = true;

    group.add(cabin);


    /* Wheels */

    for (
        const x of [-0.92, 0.92]
    ) {

        for (
            const z of [-1.35, 1.35]
        ) {

            const wheel =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.38,
                        0.38,
                        0.22,
                        16
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x080a0e
                    })

                );

            wheel.rotation.z =
                Math.PI / 2;

            wheel.position.set(
                x,
                0.38,
                z
            );

            wheel.castShadow = true;

            group.add(wheel);

        }

    }


    /* Headlights */

    const lampMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffffff,

            emissive: 0xaaddff,

            emissiveIntensity: 3

        });


    for (
        const x of [-0.65, 0.65]
    ) {

        const lamp =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.35,
                    0.15,
                    0.08
                ),

                lampMaterial

            );

        lamp.position.set(
            x,
            0.72,
            -2.07
        );

        group.add(lamp);

    }


    return group;

}


/* =====================================================
   PLAYER
===================================================== */

const player =
    makeCar(
        0x00d9ff
    );

player.position.set(
    0,
    0,
    6
);

scene.add(player);


/* =====================================================
   GAME DATA
===================================================== */

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
    Number(
        localStorage.getItem(
            'neon3dBest'
        ) || 0
    );


let speed = 28;

let running = false;

let paused = false;

let spawn = 0;

let coinSpawn = 0;

let last = 0;

let steer = 0;

let throttle = 0;


/* =====================================================
   DOM
===================================================== */

const speedEl =
    document.querySelector(
        '#speed'
    );

const scoreEl =
    document.querySelector(
        '#score'
    );

const bestEl =
    document.querySelector(
        '#best'
    );

const menuBestEl =
    document.querySelector(
        '#menuBest'
    );


const menu =
    document.querySelector(
        '#menu'
    );

const pauseScreen =
    document.querySelector(
        '#pause'
    );

const gameOverScreen =
    document.querySelector(
        '#over'
    );

const howToScreen =
    document.querySelector(
        '#howtoScreen'
    );

const settingsScreen =
    document.querySelector(
        '#settingsScreen'
    );


bestEl.textContent =
    best;

menuBestEl.textContent =
    best;


/* =====================================================
   TRAFFIC
===================================================== */

function addTraffic() {

    const colors = [
        0xff3d81,
        0xffc928,
        0x9b6cff,
        0x25e0a0,
        0xff7043
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

        -110

    );


    car.userData.speed =
        15 +
        Math.random() * 15;


    scene.add(car);

    traffic.push(car);

}


/* =====================================================
   COINS
===================================================== */

function addCoin() {

    const coin =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                0.42,
                0.12,
                10,
                18
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0xffd23f,

                emissive:
                    0x7a4d00,

                emissiveIntensity:
                    1

            })

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

        1,

        -115

    );


    scene.add(coin);

    coins.push(coin);

}


/* =====================================================
   RESET
===================================================== */

function reset() {

    score = 0;

    speed = 28;

    steer = 0;

    throttle = 0;

    spawn = 0;

    coinSpawn = 0;


    player.position.x =
        0;

    player.rotation.z =
        0;


    traffic
        .splice(0)
        .forEach(
            car => scene.remove(car)
        );


    coins
        .splice(0)
        .forEach(
            coin => scene.remove(coin)
        );


    updateHud();

}


/* =====================================================
   HUD
===================================================== */

function updateHud() {

    speedEl.textContent =
        Math.round(
            speed * 3.6
        );


    scoreEl.textContent =
        Math.floor(score);


    bestEl.textContent =
        best;


    menuBestEl.textContent =
        best;

}


/* =====================================================
   GAME OVER
===================================================== */

function crash() {

    running = false;

    paused = false;


    best =
        Math.max(
            best,
            Math.floor(score)
        );


    localStorage.setItem(
        'neon3dBest',
        best
    );


    document.querySelector(
        '#finalScore'
    ).textContent =
        Math.floor(score);


    document.querySelector(
        '#finalBest'
    ).textContent =
        best;


    pauseScreen
        .classList
        .add('hidden');


    gameOverScreen
        .classList
        .remove('hidden');


    updateHud();

}


/* =====================================================
   START GAME
===================================================== */

function start() {

    reset();


    running = true;

    paused = false;


    menu
        .classList
        .add('hidden');


    pauseScreen
        .classList
        .add('hidden');


    gameOverScreen
        .classList
        .add('hidden');


    howToScreen
        .classList
        .add('hidden');


    settingsScreen
        .classList
        .add('hidden');


    player.position.set(
        0,
        0,
        6
    );


    camera.position.set(
        0,
        5.8,
        11
    );


    camera.lookAt(
        0,
        1,
        -20
    );


    last =
        performance.now();


    requestAnimationFrame(
        loop
    );

}


/* =====================================================
   PAUSE / RESUME
===================================================== */

function pauseGame() {

    if (!running) {
        return;
    }


    paused =
        !paused;


    if (paused) {

        pauseScreen
            .classList
            .remove('hidden');

        return;

    }


    pauseScreen
        .classList
        .add('hidden');


    last =
        performance.now();


    requestAnimationFrame(
        loop
    );

}


/* =====================================================
   EXIT GAME
===================================================== */

function exitGame() {

    running = false;

    paused = false;


    pauseScreen
        .classList
        .add('hidden');


    gameOverScreen
        .classList
        .add('hidden');


    howToScreen
        .classList
        .add('hidden');


    settingsScreen
        .classList
        .add('hidden');


    menu
        .classList
        .remove('hidden');


    reset();


    player.position.set(
        0,
        0,
        6
    );


    player.rotation.z =
        0;


    camera.position.set(
        0,
        5.8,
        11
    );


    camera.lookAt(
        0,
        1,
        -20
    );


    renderer.render(
        scene,
        camera
    );

}


/* =====================================================
   KEYBOARD
===================================================== */

function key(
    event,
    pressed
) {

    const k =
        event.key.toLowerCase();


    const movementKeys = [
        'arrowleft',
        'arrowright',
        'arrowup',
        'arrowdown',
        'a',
        'd',
        'w',
        's'
    ];


    if (
        movementKeys.includes(k)
    ) {

        event.preventDefault();

    }


    /* ESC PAUSE */

    if (
        k === 'escape' &&
        pressed
    ) {

        event.preventDefault();

        pauseGame();

        return;

    }


    /* LEFT */

    if (
        k === 'arrowleft' ||
        k === 'a'
    ) {

        steer =
            pressed
                ? -1
                : 0;

    }


    /* RIGHT */

    if (
        k === 'arrowright' ||
        k === 'd'
    ) {

        steer =
            pressed
                ? 1
                : 0;

    }


    /* ACCELERATE */

    if (
        k === 'arrowup' ||
        k === 'w'
    ) {

        throttle =
            pressed
                ? 1
                : 0;

    }


    /* BRAKE */

    if (
        k === 'arrowdown' ||
        k === 's'
    ) {

        throttle =
            pressed
                ? -1
                : 0;

    }

}


addEventListener(
    'keydown',
    event =>
        key(event, true)
);


addEventListener(
    'keyup',
    event =>
        key(event, false)
);


/* =====================================================
   MOBILE BUTTON BINDING
===================================================== */

function bind(
    selector,
    callback
) {

    const button =
        document.querySelector(
            selector
        );


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


bind(
    '#left',
    value =>
        steer =
            value
                ? -1
                : 0
);


bind(
    '#right',
    value =>
        steer =
            value
                ? 1
                : 0
);


bind(
    '#boost',
    value =>
        throttle =
            value
                ? 1
                : 0
);


bind(
    '#brake',
    value =>
        throttle =
            value
                ? -1
                : 0
);


/* =====================================================
   MAIN MENU BUTTONS
===================================================== */

document.querySelector(
    '#start'
).onclick = start;


document.querySelector(
    '#again'
).onclick = start;


document.querySelector(
    '#resume'
).onclick = pauseGame;


document.querySelector(
    '#restart'
).onclick = () => {

    pauseScreen
        .classList
        .add('hidden');

    start();

};


document.querySelector(
    '#exit'
).onclick = exitGame;


document.querySelector(
    '#mainMenu'
).onclick = exitGame;


/* =====================================================
   HOW TO PLAY
===================================================== */

document.querySelector(
    '#howto'
).onclick = () => {

    howToScreen
        .classList
        .remove('hidden');

};


document.querySelector(
    '#closeHowto'
).onclick = () => {

    howToScreen
        .classList
        .add('hidden');

};


document.querySelector(
    '#closeHowto2'
).onclick = () => {

    howToScreen
        .classList
        .add('hidden');

};


/* =====================================================
   SETTINGS
===================================================== */

document.querySelector(
    '#settings'
).onclick = () => {

    settingsScreen
        .classList
        .remove('hidden');

};


document.querySelector(
    '#closeSettings'
).onclick = () => {

    settingsScreen
        .classList
        .add('hidden');

};


document.querySelector(
    '#closeSettings2'
).onclick = () => {

    settingsScreen
        .classList
        .add('hidden');

};


/* =====================================================
   SETTINGS FROM PAUSE
===================================================== */

document.querySelector(
    '#pauseSettings'
).onclick = () => {

    settingsScreen
        .classList
        .remove('hidden');

};


/* =====================================================
   GAME LOOP
===================================================== */

function loop(time) {

    if (
        !running ||
        paused
    ) {

        return;

    }


    const dt =
        Math.min(
            (time - last) / 1000,
            0.04
        );


    last = time;


    /* =================================================
       SPEED
    ================================================= */

    speed +=
        dt *
        (
            1.8 +
            score / 4000
        );


    if (
        throttle > 0
    ) {

        speed +=
            dt * 15;

    }


    if (
        throttle < 0
    ) {

        speed -=
            dt * 24;

    }


    speed =
        THREE.MathUtils.clamp(
            speed,
            18,
            72
        );


    /* =================================================
       SCORE
    ================================================= */

    score +=
        dt *
        speed *
        0.75;


    /* =================================================
       PLAYER STEERING
    ================================================= */

    player.position.x +=
        steer *
        dt *
        8;


    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -6.1,
            6.1
        );


    player.rotation.z =
        -steer *
        0.08;


    /* =================================================
       CAMERA
    ================================================= */

    camera.position.x +=
        (
            player.position.x * 0.18 -
            camera.position.x
        ) *
        dt *
        3;


    camera.lookAt(
        player.position.x * 0.1,
        1,
        -22
    );


    /* =================================================
       SPAWNING
    ================================================= */

    spawn -= dt;

    coinSpawn -= dt;


    if (
        spawn <= 0
    ) {

        addTraffic();


        spawn =
            Math.max(
                0.45,
                1.15 -
                score / 18000
            );

    }


    if (
        coinSpawn <= 0
    ) {

        addCoin();


        coinSpawn =
            0.7 +
            Math.random() * 1.1;

    }


    /* =================================================
       TRAFFIC
    ================================================= */

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
            dt;


        if (
            car.position.z > 18
        ) {

            scene.remove(car);

            traffic.splice(
                i,
                1
            );

            continue;

        }


        /* COLLISION */

        if (

            Math.abs(
                car.position.x -
                player.position.x
            ) < 1.65

            &&

            Math.abs(
                car.position.z -
                player.position.z
            ) < 2.7

        ) {

            crash();

            return;

        }

    }


    /* =================================================
       COINS
    ================================================= */

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];


        coin.position.z +=
            speed * dt;


        coin.rotation.z +=
            dt * 5;


        if (
            coin.position.z > 18
        ) {

            scene.remove(coin);

            coins.splice(
                i,
                1
            );

            continue;

        }


        /* COIN COLLECTION */

        if (

            Math.abs(
                coin.position.x -
                player.position.x
            ) < 1.4

            &&

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


    /* =================================================
       ROAD MOVEMENT
    ================================================= */

    for (
        const road of roadParts
    ) {

        road.position.z +=
            speed * dt;


        if (
            road.position.z > 18
        ) {

            road.position.z -=
                roadLen;

        }

    }


    /* =================================================
       UPDATE
    ================================================= */

    updateHud();


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        loop
    );

}


/* =====================================================
   RESIZE
===================================================== */

addEventListener(
    'resize',
    () => {

        camera.aspect =
            innerWidth /
            innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);


/* =====================================================
   INITIAL RENDER
===================================================== */

updateHud();

renderer.render(
    scene,
    camera
);
