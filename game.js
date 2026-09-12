import * as THREE from "three";
import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {

    playerModel:
        "./assets/models/player-car.glb",

    trafficModels: [
        "./assets/models/traffic-car-01.glb",
        "./assets/models/traffic-car-02.glb",
        "./assets/models/traffic-car-03.glb"
    ],

    roadWidth: 14.5,

    startingSpeed: 42,

    maxSpeed: 145,

    acceleration: 20,

    braking: 45,

    /* ==============================================
       NEW SMOOTH SIDEWAYS CONTROL
    ============================================== */

    steeringResponse: 12,

    steeringReturn: 16,

    sidewaysSpeed: 8.5,

    roadLimit: 5.9,

    /* ==============================================
       COLLISION
    ============================================== */

    playerCollider: {
        width: 1.72,
        height: 1.30,
        length: 4.35
    },

    trafficCollider: {
        width: 1.72,
        height: 1.30,
        length: 4.35
    },

    collisionTolerance: 0.055,

    /* ==============================================
       TRAFFIC
    ============================================== */

    trafficRemoveZ: 35,

    trafficMinGap: 35,

    /* ==============================================
       WORLD
    ============================================== */

    segmentLength: 100,

    segmentCount: 12,

    /* ==============================================
       GRAPHICS
    ============================================== */

    desktopPixelRatio: 1.8,

    mobilePixelRatio: 1.25

};


/* =========================================================
   DOM
========================================================= */

const canvasContainer =
    document.getElementById(
        "canvasContainer"
    );

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const loadingText =
    document.getElementById(
        "loadingText"
    );

const menu =
    document.getElementById(
        "menu"
    );

const hud =
    document.getElementById(
        "hud"
    );

const pauseScreen =
    document.getElementById(
        "pause"
    );

const gameOverScreen =
    document.getElementById(
        "over"
    );

const howtoScreen =
    document.getElementById(
        "howtoScreen"
    );

const settingsScreen =
    document.getElementById(
        "settingsScreen"
    );

const touchControls =
    document.getElementById(
        "touchControls"
    );

const speedElement =
    document.getElementById(
        "speed"
    );

const scoreElement =
    document.getElementById(
        "score"
    );

const bestElement =
    document.getElementById(
        "best"
    );

const menuBestElement =
    document.getElementById(
        "menuBest"
    );

const finalScoreElement =
    document.getElementById(
        "finalScore"
    );

const finalBestElement =
    document.getElementById(
        "finalBest"
    );

const assetStatus =
    document.getElementById(
        "assetStatus"
    );

const dangerFlash =
    document.getElementById(
        "dangerFlash"
    );

const deviceMode =
    document.getElementById(
        "deviceMode"
    );


/* =========================================================
   DEVICE
========================================================= */

const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(
            navigator.userAgent
        )
    ||
    window.matchMedia(
        "(pointer: coarse)"
    ).matches;


deviceMode.textContent =
    isMobile
        ? "MOBILE"
        : "DESKTOP";


/* =========================================================
   THREE.JS
========================================================= */

let scene;

let camera;

let renderer;

let clock;


/* =========================================================
   GAME OBJECTS
========================================================= */

let player;

let roadGroup;

let environmentGroup;

let trafficGroup;

let coinGroup;


/* =========================================================
   MODELS
========================================================= */

const gltfLoader =
    new GLTFLoader();

let playerModelLoaded =
    false;

let trafficModelsLoaded =
    0;

let loadedTrafficTemplates =
    [];


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning =
    false;

let paused =
    false;

let gameOver =
    false;

let speed =
    CONFIG.startingSpeed;

let score =
    0;

let bestScore =
    Number(
        localStorage.getItem(
            "neonHighwayBest"
        ) || 0
    );


/* =========================================================
   INPUT
========================================================= */

const keys = {

    left: false,

    right: false,

    accelerate: false,

    brake: false

};


/* =========================================================
   NEW SMOOTH STEERING STATE
========================================================= */

/*
    steeringInput:

        -1 = full left
         0 = straight
        +1 = full right


    steeringTarget:

        The direction the player is asking for.

    There is NO sideways velocity anymore.

    This is what removes the floaty/sliding feeling.
*/

let steeringInput = 0;

let steeringTarget = 0;


/* =========================================================
   LOOP
========================================================= */

let lastTime =
    performance.now();


/* =========================================================
   INIT
========================================================= */

async function init() {

    setLoading(
        5,
        "STARTING 3D ENGINE..."
    );

    createScene();

    setLoading(
        18,
        "BUILDING NIGHT SKY..."
    );

    createLighting();

    setLoading(
        30,
        "BUILDING HIGHWAY..."
    );

    createRoad();

    setLoading(
        43,
        "BUILDING CITY..."
    );

    createEnvironment();

    setLoading(
        56,
        "BUILDING PLAYER CAR..."
    );

    createPlayer();

    setLoading(
        66,
        "LOADING PLAYER CAR..."
    );

    await loadPlayerModel();

    setLoading(
        76,
        "LOADING TRAFFIC CARS..."
    );

    await loadTrafficModels();

    setLoading(
        88,
        "PREPARING TRAFFIC..."
    );

    createTraffic();

    createCoins();

    setLoading(
        96,
        "SETTING CONTROLS..."
    );

    setupEvents();

    setLoading(
        100,
        "READY"
    );

    setTimeout(
        () => {

            loadingScreen.classList.add(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

            updateMenu();

        },
        500
    );
}


/* =========================================================
   LOADING
========================================================= */

function setLoading(
    percent,
    text
) {

    loadingProgress.style.width =
        `${percent}%`;

    loadingText.textContent =
        text;
}


/* =========================================================
   CREATE SCENE
========================================================= */

function createScene() {

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0x02050c
        );

    scene.fog =
        new THREE.FogExp2(
            0x050a14,
            isMobile
                ? 0.010
                : 0.008
        );


    /* ==============================================
       CAMERA
    ============================================== */

    camera =
        new THREE.PerspectiveCamera(

            62,

            window.innerWidth /
            window.innerHeight,

            0.1,

            900

        );


    camera.position.set(
        0,
        4.7,
        10
    );


    /* ==============================================
       RENDERER
    ============================================== */

    renderer =
        new THREE.WebGLRenderer({

            antialias:
                !isMobile,

            alpha:
                false,

            powerPreference:
                "high-performance"

        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    const pixelRatio =
        isMobile

            ? CONFIG.mobilePixelRatio

            : Math.min(
                window.devicePixelRatio,
                CONFIG.desktopPixelRatio
            );


    renderer.setPixelRatio(
        pixelRatio
    );


    renderer.shadowMap.enabled =
        true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.1;


    canvasContainer.appendChild(
        renderer.domElement
    );


    clock =
        new THREE.Clock();


    /* ==============================================
       GROUPS
    ============================================== */

    roadGroup =
        new THREE.Group();

    environmentGroup =
        new THREE.Group();

    trafficGroup =
        new THREE.Group();

    coinGroup =
        new THREE.Group();


    scene.add(
        roadGroup
    );

    scene.add(
        environmentGroup
    );

    scene.add(
        trafficGroup
    );

    scene.add(
        coinGroup
    );


    createSky();
}


/* =========================================================
   SKY
========================================================= */

function createSky() {

    const geometry =
        new THREE.SphereGeometry(
            500,
            32,
            16
        );


    const material =
        new THREE.ShaderMaterial({

            side:
                THREE.BackSide,

            uniforms: {

                topColor: {

                    value:
                        new THREE.Color(
                            0x02030a
                        )

                },

                bottomColor: {

                    value:
                        new THREE.Color(
                            0x111b30
                        )

                },

                offset: {

                    value: 33

                },

                exponent: {

                    value: 0.65

                }

            },


            vertexShader: `

                varying vec3 vWorldPosition;

                void main() {

                    vec4 worldPosition =
                        modelMatrix *
                        vec4(
                            position,
                            1.0
                        );

                    vWorldPosition =
                        worldPosition.xyz;

                    gl_Position =
                        projectionMatrix *
                        modelViewMatrix *
                        vec4(
                            position,
                            1.0
                        );
                }

            `,


            fragmentShader: `

                uniform vec3 topColor;

                uniform vec3 bottomColor;

                uniform float offset;

                uniform float exponent;

                varying vec3 vWorldPosition;

                void main() {

                    float h =
                        normalize(
                            vWorldPosition +
                            offset
                        ).y;

                    float factor =
                        pow(
                            max(
                                h,
                                0.0
                            ),
                            exponent
                        );

                    gl_FragColor =
                        vec4(
                            mix(
                                bottomColor,
                                topColor,
                                factor
                            ),
                            1.0
                        );
                }

            `

        });


    const sky =
        new THREE.Mesh(
            geometry,
            material
        );


    scene.add(
        sky
    );


    /* ==============================================
       MOON
    ============================================== */

    const moon =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                10,
                32,
                32
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0xe8efff

            })

        );


    moon.position.set(
        -80,
        100,
        -240
    );


    scene.add(
        moon
    );


    const moonGlow =
        new THREE.PointLight(
            0x667dff,
            1.5,
            300
        );


    moonGlow.position.copy(
        moon.position
    );


    scene.add(
        moonGlow
    );
}


/* =========================================================
   LIGHTING
========================================================= */

function createLighting() {

    const ambient =
        new THREE.HemisphereLight(

            0x8ca4d8,

            0x06080d,

            1.0

        );


    scene.add(
        ambient
    );


    const moonLight =
        new THREE.DirectionalLight(

            0x9bb5ff,

            2

        );


    moonLight.position.set(
        -80,
        120,
        -100
    );


    moonLight.castShadow =
        true;


    moonLight.shadow.mapSize.width =
        isMobile
            ? 1024
            : 2048;

    moonLight.shadow.mapSize.height =
        isMobile
            ? 1024
            : 2048;


    moonLight.shadow.camera.left =
        -80;

    moonLight.shadow.camera.right =
        80;

    moonLight.shadow.camera.top =
        100;

    moonLight.shadow.camera.bottom =
        -100;


    scene.add(
        moonLight
    );
}


/* =========================================================
   ROAD
========================================================= */

function createRoad() {

    const asphaltTexture =
        createAsphaltTexture();


    asphaltTexture.wrapS =
        THREE.RepeatWrapping;

    asphaltTexture.wrapT =
        THREE.RepeatWrapping;


    asphaltTexture.repeat.set(
        1,
        8
    );


    const roadMaterial =
        new THREE.MeshStandardMaterial({

            map:
                asphaltTexture,

            roughness:
                0.72,

            metalness:
                0.08

        });


    for (
        let i = 0;

        i <
        CONFIG.segmentCount;

        i++
    ) {

        const geometry =
            new THREE.PlaneGeometry(

                CONFIG.roadWidth,

                CONFIG.segmentLength

            );


        const road =
            new THREE.Mesh(
                geometry,
                roadMaterial
            );


        road.rotation.x =
            -Math.PI / 2;


        road.position.z =
            -i *
            CONFIG.segmentLength;


        road.position.y =
            -0.03;


        road.receiveShadow =
            true;


        road.userData.isRoad =
            true;


        roadGroup.add(
            road
        );


        createLaneLines(
            road.position.z
        );

        createRoadEdges(
            road.position.z
        );
    }


    /* ==============================================
       GROUND
    ============================================== */

    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1000,
                1200
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x07100b,

                roughness:
                    1

            })

        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.position.y =
        -0.12;


    ground.position.z =
        -400;


    ground.receiveShadow =
        true;


    environmentGroup.add(
        ground
    );
}


/* =========================================================
   ASPHALT
========================================================= */

function createAsphaltTexture() {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        512;

    canvas.height =
        512;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#171a20";


    ctx.fillRect(
        0,
        0,
        512,
        512
    );


    for (
        let i = 0;

        i < 5000;

        i++
    ) {

        const value =
            Math.floor(
                25 +
                Math.random() *
                45
            );


        ctx.fillStyle =
            `rgb(${value},${value},${value})`;


        ctx.fillRect(

            Math.random() * 512,

            Math.random() * 512,

            Math.random() * 2,

            Math.random() * 2

        );
    }


    ctx.strokeStyle =
        "rgba(0,0,0,0.16)";


    ctx.lineWidth =
        10;


    for (
        let x = 120;

        x < 512;

        x += 150
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x + 5,
            512
        );

        ctx.stroke();
    }


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;
}


/* =========================================================
   LANE LINES
========================================================= */

function createLaneLines(
    z
) {

    for (
        let lane = 0;

        lane < 3;

        lane++
    ) {

        const x =
            -3.5 +
            lane * 3.5;


        const line =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.08,
                    0.025,
                    5.5
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xcfd6dc,

                    roughness:
                        0.55

                })

            );


        line.position.set(
            x,
            0.02,
            z
        );


        line.userData.isRoadPart =
            true;


        roadGroup.add(
            line
        );
    }
}


/* =========================================================
   ROAD EDGES
========================================================= */

function createRoadEdges(
    z
) {

    const material =
        new THREE.MeshStandardMaterial({

            color:
                0xd2a91d,

            emissive:
                0x221500,

            roughness:
                0.55

        });


    [-7.05, 7.05].forEach(
        x => {

            const edge =
                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        0.12,

                        0.035,

                        CONFIG.segmentLength

                    ),

                    material

                );


            edge.position.set(
                x,
                0.025,
                z
            );


            edge.userData.isRoadPart =
                true;


            roadGroup.add(
                edge
            );
        }
    );
}


/* =========================================================
   ENVIRONMENT
========================================================= */

function createEnvironment() {

    for (
        let z = 20;

        z > -700;

        z -= 45
    ) {

        createCityBlock(
            -1,
            z
        );

        createCityBlock(
            1,
            z - 18
        );


        if (
            Math.random() > 0.3
        ) {

            createTree(
                -12 -
                Math.random() * 6,

                z -
                Math.random() * 30
            );


            createTree(
                12 +
                Math.random() * 6,

                z -
                Math.random() * 30
            );
        }


        if (
            Math.random() > 0.35
        ) {

            createStreetLight(
                -8.3,
                z
            );

            createStreetLight(
                8.3,
                z - 22
            );
        }
    }
}


/* =========================================================
   CITY BLOCK
========================================================= */

function createCityBlock(
    side,
    z
) {

    const count =
        isMobile
            ? 2
            : 3;


    for (
        let i = 0;

        i < count;

        i++
    ) {

        const width =
            5 +
            Math.random() * 9;


        const height =
            10 +
            Math.random() * 35;


        const depth =
            8 +
            Math.random() * 15;


        const geometry =
            new THREE.BoxGeometry(

                width,
                height,
                depth

            );


        const material =
            new THREE.MeshStandardMaterial({

                color:
                    new THREE.Color(

                        0.025 +
                        Math.random() * 0.035,

                        0.04 +
                        Math.random() * 0.04,

                        0.07 +
                        Math.random() * 0.08

                    ),

                roughness:
                    0.8,

                metalness:
                    0.05

            });


        const building =
            new THREE.Mesh(
                geometry,
                material
            );


        building.position.set(

            side *
            (
                15 +
                i * 12 +
                Math.random() * 6
            ),

            height / 2,

            z -
            Math.random() * 20

        );


        building.castShadow =
            !isMobile;


        building.receiveShadow =
            true;


        environmentGroup.add(
            building
        );


        createBuildingWindows(
            building
        );
    }
}


/* =========================================================
   WINDOWS
========================================================= */

function createBuildingWindows(
    building
) {

    if (
        isMobile
    ) {
        return;
    }


    const width =
        building.geometry.parameters.width;

    const height =
        building.geometry.parameters.height;

    const rows =
        Math.floor(
            height / 4
        );

    const cols =
        Math.max(
            2,
            Math.floor(
                width / 3
            )
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x8fc5ff,

            emissive:
                0x2e5d9c,

            emissiveIntensity:
                1.3,

            roughness:
                0.3

        });


    for (
        let row = 0;

        row < rows;

        row++
    ) {

        for (
            let col = 0;

            col < cols;

            col++
        ) {

            if (
                Math.random() < 0.28
            ) {
                continue;
            }


            const windowMesh =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.35,
                        0.65,
                        0.03
                    ),

                    material

                );


            windowMesh.position.set(

                (
                    col -
                    (cols - 1) / 2
                ) * 2.2,

                (
                    row + 0.7
                ) * 3.2,

                -(
                    building
                        .geometry
                        .parameters
                        .depth / 2
                ) - 0.03

            );


            building.add(
                windowMesh
            );
        }
    }
}


/* =========================================================
   TREE
========================================================= */

function createTree(
    x,
    z
) {

    const tree =
        new THREE.Group();


    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.25,
                0.4,
                3,
                8
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x3c2415,

                roughness:
                    1

            })

        );


    trunk.position.y =
        1.5;


    trunk.castShadow =
        !isMobile;


    tree.add(
        trunk
    );


    const foliage =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                2.2,

                isMobile ? 8 : 14,

                isMobile ? 8 : 14

            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x0d311b,

                roughness:
                    1

            })

        );


    foliage.position.y =
        4;


    foliage.castShadow =
        !isMobile;


    tree.add(
        foliage
    );


    tree.position.set(
        x,
        0,
        z
    );


    environmentGroup.add(
        tree
    );
}


/* =========================================================
   STREET LIGHT
========================================================= */

function createStreetLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.08,
                0.12,
                6,
                8
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0x30343a,

                metalness:
                    0.7,

                roughness:
                    0.35

            })

        );


    pole.position.y =
        3;


    group.add(
        pole
    );


    const lamp =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.5,
                0.12,
                0.25
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0xffffff,

                emissive:
                    0xb8d7ff,

                emissiveIntensity:
                    6,

                roughness:
                    0.2

            })

        );


    lamp.position.y =
        6;


    group.add(
        lamp
    );


    if (
        !isMobile
    ) {

        const light =
            new THREE.PointLight(
                0x9ccaff,
                4,
                20
            );


        light.position.y =
            5.8;


        group.add(
            light
        );
    }


    group.position.set(
        x,
        0,
        z
    );


    environmentGroup.add(
        group
    );
}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

    player =
        new THREE.Group();


    player.position.set(
        0,
        0,
        5
    );


    scene.add(
        player
    );


    const fallback =
        createDetailedCar(
            0x087cff,
            true
        );


    player.add(
        fallback
    );


    player.userData.fallback =
        fallback;

    player.userData.model =
        null;
}


/* =========================================================
   PLAYER GLB
========================================================= */

async function loadPlayerModel() {

    try {

        const gltf =
            await gltfLoader.loadAsync(
                CONFIG.playerModel
            );


        const model =
            prepareCarModel(
                gltf.scene,
                true
            );


        player.userData.model =
            model;


        player.add(
            model
        );


        player.userData.fallback.visible =
            false;


        playerModelLoaded =
            true;


        assetStatus.textContent =
            "HIGH GRAPHICS CAR LOADED";


    } catch (error) {

        console.warn(
            "Player GLB unavailable.",
            error
        );


        assetStatus.textContent =
            "PROCEDURAL HIGH GRAPHICS READY";
    }
}


/* =========================================================
   TRAFFIC GLB
========================================================= */

async function loadTrafficModels() {

    loadedTrafficTemplates =
        [];


    for (
        const path of
        CONFIG.trafficModels
    ) {

        try {

            const gltf =
                await gltfLoader.loadAsync(
                    path
                );


            const model =
                prepareCarModel(
                    gltf.scene,
                    false
                );


            loadedTrafficTemplates.push(
                model
            );


            trafficModelsLoaded++;


        } catch (error) {

            console.warn(
                "Traffic GLB unavailable:",
                path
            );
        }
    }


    if (
        trafficModelsLoaded > 0
    ) {

        assetStatus.textContent =
            `${trafficModelsLoaded} HIGH GRAPHICS CARS LOADED`;

    } else {

        assetStatus.textContent =
            "PROCEDURAL HIGH GRAPHICS READY";
    }
}


/* =========================================================
   PREPARE MODEL
========================================================= */

function prepareCarModel(
    model,
    isPlayer
) {

    model.traverse(
        child => {

            if (
                child.isMesh
            ) {

                child.castShadow =
                    !isMobile;


                child.receiveShadow =
                    true;


                if (
                    child.material
                ) {

                    if (
                        Array.isArray(
                            child.material
                        )
                    ) {

                        child.material.forEach(
                            improveMaterial
                        );

                    } else {

                        improveMaterial(
                            child.material
                        );
                    }
                }
            }
        }
    );


    const box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    const size =
        new THREE.Vector3();


    box.getSize(
        size
    );


    const targetLength =
        isPlayer
            ? 4.4
            : 4.3;


    const largest =
        Math.max(
            size.z,
            size.x
        );


    if (
        largest > 0
    ) {

        const scale =
            targetLength /
            largest;


        model.scale.setScalar(
            scale
        );
    }


    const newBox =
        new THREE.Box3()
            .setFromObject(
                model
            );


    const center =
        new THREE.Vector3();


    newBox.getCenter(
        center
    );


    model.position.x -=
        center.x;


    model.position.z -=
        center.z;


    model.position.y -=
        newBox.min.y;


    return model;
}


/* =========================================================
   MATERIAL
========================================================= */

function improveMaterial(
    material
) {

    if (
        !material
    ) {
        return;
    }


    if (
        "roughness" in material
    ) {

        material.roughness =
            Math.min(
                material.roughness,
                0.65
            );
    }


    if (
        "metalness" in material
    ) {

        material.metalness =
            Math.max(
                material.metalness,
                0.05
            );
    }


    material.needsUpdate =
        true;
}


/* =========================================================
   FALLBACK CAR
========================================================= */

function createDetailedCar(
    color,
    playerCar = false
) {

    const car =
        new THREE.Group();


    const bodyMaterial =
        new THREE.MeshStandardMaterial({

            color,

            metalness:
                0.65,

            roughness:
                0.23

        });


    const darkMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x080b10,

            metalness:
                0.25,

            roughness:
                0.2

        });


    const glassMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x081522,

            metalness:
                0.45,

            roughness:
                0.08,

            transparent:
                true,

            opacity:
                0.78

        });


    const chromeMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xbcc5d0,

            metalness:
                0.95,

            roughness:
                0.15

        });


    /* BODY */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.15,
                0.65,
                4.35
            ),

            bodyMaterial

        );


    body.position.y =
        0.75;


    car.add(
        body
    );


    /* LOWER BODY */

    const lower =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.28,
                0.35,
                3.8
            ),

            darkMaterial

        );


    lower.position.y =
        0.55;


    car.add(
        lower
    );


    /* HOOD */

    const hood =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.95,
                0.18,
                1.35
            ),

            bodyMaterial

        );


    hood.position.set(
        0,
        1.08,
        -1.35
    );


    car.add(
        hood
    );


    /* CABIN */

    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.72,
                0.78,
                2.05
            ),

            bodyMaterial

        );


    cabin.position.set(
        0,
        1.32,
        0.35
    );


    car.add(
        cabin
    );


    /* WINDSHIELD */

    const windshield =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.55,
                0.48,
                0.08
            ),

            glassMaterial

        );


    windshield.position.set(
        0,
        1.43,
        -0.55
    );


    windshield.rotation.x =
        -0.18;


    car.add(
        windshield
    );


    /* REAR GLASS */

    const rearGlass =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.55,
                0.48,
                0.08
            ),

            glassMaterial

        );


    rearGlass.position.set(
        0,
        1.43,
        1.28
    );


    rearGlass.rotation.x =
        0.18;


    car.add(
        rearGlass
    );


    /* MIRRORS */

    [-1, 1].forEach(
        side => {

            const mirror =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.18,
                        0.16,
                        0.42
                    ),

                    chromeMaterial

                );


            mirror.position.set(
                side * 1.12,
                1.25,
                -0.35
            );


            car.add(
                mirror
            );
        }
    );


    /* WHEELS */

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.42,
            0.42,
            0.28,
            20
        );


    const wheelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x050505,

            roughness:
                0.8

        });


    const rimGeometry =
        new THREE.CylinderGeometry(
            0.22,
            0.22,
            0.30,
            16
        );


    const rimMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xaab4c0,

            metalness:
                0.95,

            roughness:
                0.18

        });


    const wheelPositions = [

        [-1.08, 0.48, -1.38],

        [1.08, 0.48, -1.38],

        [-1.08, 0.48, 1.38],

        [1.08, 0.48, 1.38]

    ];


    wheelPositions.forEach(
        position => {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                ...position
            );


            car.add(
                wheel
            );


            const rim =
                new THREE.Mesh(
                    rimGeometry,
                    rimMaterial
                );


            rim.rotation.z =
                Math.PI / 2;


            rim.position.set(
                ...position
            );


            car.add(
                rim
            );
        }
    );


    /* HEADLIGHTS */

    const headlightMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xffffff,

            emissive:
                0xbfe2ff,

            emissiveIntensity:
                8,

            roughness:
                0.1

        });


    [-0.68, 0.68].forEach(
        x => {

            const lamp =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.45,
                        0.16,
                        0.08
                    ),

                    headlightMaterial

                );


            lamp.position.set(
                x,
                0.95,
                -2.18
            );


            car.add(
                lamp
            );


            if (
                !isMobile
            ) {

                const light =
                    new THREE.PointLight(

                        0xdceeff,

                        2.2,

                        22

                    );


                light.position.set(
                    x,
                    0.9,
                    -2.3
                );


                car.add(
                    light
                );
            }
        }
    );


    /* BRAKE LIGHTS */

    const brakeMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xff1010,

            emissive:
                0xff0000,

            emissiveIntensity:
                5

        });


    [-0.7, 0.7].forEach(
        x => {

            const lamp =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.45,
                        0.15,
                        0.08
                    ),

                    brakeMaterial

                );


            lamp.position.set(
                x,
                0.92,
                2.18
            );


            car.add(
                lamp
            );
        }
    );


    /* SPOILER */

    if (
        playerCar
    ) {

        const spoiler =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1.7,
                    0.10,
                    0.25
                ),

                darkMaterial

            );


        spoiler.position.set(
            0,
            1.7,
            1.75
        );


        car.add(
            spoiler
        );


        [-0.65, 0.65].forEach(
            x => {

                const support =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            0.08,
                            0.4,
                            0.08
                        ),

                        chromeMaterial

                    );


                support.position.set(
                    x,
                    1.48,
                    1.72
                );


                car.add(
                    support
                );
            }
        );
    }


    return car;
}


/* =========================================================
   TRAFFIC
========================================================= */

function createTraffic() {

    trafficGroup.clear();


    const count =
        isMobile
            ? 7
            : 10;


    for (
        let i = 0;

        i < count;

        i++
    ) {

        spawnTrafficCar(

            -60 -
            i *
            CONFIG.trafficMinGap

        );
    }
}


/* =========================================================
   SPAWN TRAFFIC
========================================================= */

function spawnTrafficCar(
    z
) {

    const lanes = [

        -5.25,

        -1.75,

        1.75,

        5.25

    ];


    const lane =
        Math.floor(
            Math.random() *
            lanes.length
        );


    const car =
        new THREE.Group();


    if (
        loadedTrafficTemplates.length >
        0
    ) {

        const template =
            loadedTrafficTemplates[
                Math.floor(
                    Math.random() *
                    loadedTrafficTemplates.length
                )
            ];


        const model =
            template.clone(
                true
            );


        car.add(
            model
        );


    } else {

        const colors = [

            0xd52b2b,

            0xeeeeee,

            0x11151c,

            0xf2a900,

            0x2d8cff,

            0x8d38d8

        ];


        const fallback =
            createDetailedCar(

                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

                false

            );


        car.add(
            fallback
        );
    }


    car.position.set(

        lanes[lane],

        0,

        z

    );


    car.userData.lane =
        lane;


    car.userData.speed =
        20 +
        Math.random() *
        30;


    trafficGroup.add(
        car
    );
}


/* =========================================================
   COINS
========================================================= */

function createCoins() {

    coinGroup.clear();


    for (
        let i = 0;

        i < 24;

        i++
    ) {

        const coin =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.35,
                    0.09,
                    10,
                    24
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xffd52f,

                    emissive:
                        0xffa900,

                    emissiveIntensity:
                        3,

                    metalness:
                        0.85,

                    roughness:
                        0.15

                })

            );


        const lanes = [

            -5.25,

            -1.75,

            1.75,

            5.25

        ];


        coin.position.set(

            lanes[
                Math.floor(
                    Math.random() *
                    lanes.length
                )
            ],

            1.2,

            -40 -
            i * 55

        );


        coin.rotation.y =
            Math.PI / 2;


        coinGroup.add(
            coin
        );
    }
}


/* =========================================================
   COLLISION BOX
========================================================= */

function getCollisionBox(
    object,
    dimensions
) {

    const halfWidth =
        dimensions.width / 2;

    const halfHeight =
        dimensions.height / 2;

    const halfLength =
        dimensions.length / 2;


    const box =
        new THREE.Box3(

            new THREE.Vector3(

                object.position.x -
                halfWidth,

                object.position.y +
                0.45 -
                halfHeight,

                object.position.z -
                halfLength

            ),

            new THREE.Vector3(

                object.position.x +
                halfWidth,

                object.position.y +
                0.45 +
                halfHeight,

                object.position.z +
                halfLength

            )

        );


    const t =
        CONFIG.collisionTolerance;


    box.min.x -= t;

    box.min.y -= t;

    box.min.z -= t;

    box.max.x += t;

    box.max.y += t;

    box.max.z += t;


    return box;
}


/* =========================================================
   COLLISION
========================================================= */

function carsCollide(
    playerCar,
    trafficCar
) {

    const playerBox =
        getCollisionBox(
            playerCar,
            CONFIG.playerCollider
        );


    const trafficBox =
        getCollisionBox(
            trafficCar,
            CONFIG.trafficCollider
        );


    return playerBox.intersectsBox(
        trafficBox
    );
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    menu.classList.add(
        "hidden"
    );


    pauseScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.add(
        "hidden"
    );


    hud.classList.remove(
        "hidden"
    );


    if (
        isMobile
    ) {

        touchControls.classList.remove(
            "hidden"
        );
    }


    resetGame();


    gameRunning =
        true;

    paused =
        false;

    gameOver =
        false;


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    speed =
        CONFIG.startingSpeed;


    score =
        0;


    /*
        IMPORTANT:

        Reset new steering system.
    */

    steeringInput =
        0;

    steeringTarget =
        0;


    player.position.x =
        0;


    player.position.z =
        5;


    player.rotation.set(
        0,
        0,
        0
    );


    clearInputs();


    trafficGroup.clear();

    createTraffic();


    coinGroup.clear();

    createCoins();


    updateHUD();
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(
    timestamp
) {

    if (
        !gameRunning
    ) {
        return;
    }


    if (
        paused ||
        gameOver
    ) {
        return;
    }


    const delta =
        Math.min(

            (
                timestamp -
                lastTime
            ) / 1000,

            0.05

        );


    lastTime =
        timestamp;


    updateGame(
        delta
    );


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   UPDATE GAME
========================================================= */

function updateGame(
    delta
) {

    updateSpeed(
        delta
    );


    updatePlayer(
        delta
    );


    updateTraffic(
        delta
    );


    updateCoins(
        delta
    );


    updateRoad(
        delta
    );


    updateEnvironment(
        delta
    );


    updateCamera(
        delta
    );


    score +=
        speed *
        delta *
        0.8;


    updateHUD();
}


/* =========================================================
   SPEED
========================================================= */

function updateSpeed(
    delta
) {

    if (
        keys.accelerate
    ) {

        speed +=
            CONFIG.acceleration *
            delta;

    } else if (
        keys.brake
    ) {

        speed -=
            CONFIG.braking *
            delta;

    } else {

        speed +=
            5 *
            delta;
    }


    speed =
        THREE.MathUtils.clamp(

            speed,

            20,

            CONFIG.maxSpeed

        );
}


/* =========================================================
   NEW SMOOTH SIDEWAYS MOVEMENT
========================================================= */

function updatePlayer(
    delta
) {

    /*
        ==============================================
        STEP 1
        ==============================================

        Read left/right buttons.
    */

    let input =
        0;


    if (
        keys.left
    ) {

        input -= 1;
    }


    if (
        keys.right
    ) {

        input += 1;
    }


    /*
        ==============================================
        STEP 2
        ==============================================

        Smoothly move steering input.

        This is NOT sideways velocity.

        It is only the steering amount.
    */

    if (
        input !== 0
    ) {

        steeringTarget =
            input;


        steeringInput =
            THREE.MathUtils.damp(

                steeringInput,

                steeringTarget,

                CONFIG.steeringResponse,

                delta

            );

    } else {

        steeringTarget =
            0;


        steeringInput =
            THREE.MathUtils.damp(

                steeringInput,

                0,

                CONFIG.steeringReturn,

                delta

            );
    }


    /*
        ==============================================
        STEP 3
        ==============================================

        Calculate sideways movement.

        No accumulated velocity.

        This makes the car feel controlled
        rather than like it is drifting.
    */

    const speedRatio =
        THREE.MathUtils.clamp(

            speed /
            CONFIG.maxSpeed,

            0.35,

            1.0

        );


    const sidewaysMovement =

        steeringInput *

        CONFIG.sidewaysSpeed *

        speedRatio *

        delta;


    player.position.x +=
        sidewaysMovement;


    /*
        ==============================================
        STEP 4
        ==============================================

        Road boundaries.
    */

    player.position.x =
        THREE.MathUtils.clamp(

            player.position.x,

            -CONFIG.roadLimit,

            CONFIG.roadLimit

        );


    /*
        ==============================================
        STEP 5
        ==============================================

        Smooth visual steering.

        The car leans slightly into the turn.
    */

    const targetRoll =
        -steeringInput *
        0.075;


    const targetYaw =
        -steeringInput *
        0.035;


    player.rotation.z =
        THREE.MathUtils.damp(

            player.rotation.z,

            targetRoll,

            10,

            delta

        );


    player.rotation.y =
        THREE.MathUtils.damp(

            player.rotation.y,

            targetYaw,

            9,

            delta

        );
}


/* =========================================================
   TRAFFIC UPDATE
========================================================= */

function updateTraffic(
    delta
) {

    trafficGroup.children.forEach(
        car => {

            car.position.z +=

                (
                    speed -
                    car.userData.speed
                ) *

                delta;


            /*
                HARD COLLISION
            */

            if (
                carsCollide(
                    player,
                    car
                )
            ) {

                crash();
            }
        }
    );


    for (
        let i =
            trafficGroup.children.length -
            1;

        i >= 0;

        i--
    ) {

        const car =
            trafficGroup.children[i];


        if (
            car.position.z >
            CONFIG.trafficRemoveZ
        ) {

            trafficGroup.remove(
                car
            );


            spawnTrafficCar(

                -260 -
                Math.random() *
                100

            );
        }
    }
}


/* =========================================================
   COINS
========================================================= */

function updateCoins(
    delta
) {

    coinGroup.children.forEach(
        coin => {

            coin.position.z +=
                speed *
                delta;


            coin.rotation.y +=
                delta * 5;


            coin.rotation.z +=
                delta * 2;


            const dx =
                Math.abs(

                    coin.position.x -
                    player.position.x

                );


            const dz =
                Math.abs(

                    coin.position.z -
                    player.position.z

                );


            if (
                dx < 1.3 &&
                dz < 2
            ) {

                score +=
                    250;


                coin.position.z =
                    -400 -
                    Math.random() *
                    100;


                coin.position.x =

                    CONFIG.roadLimit *

                    (
                        Math.random() * 2 -
                        1
                    );
            }


            if (
                coin.position.z >
                25
            ) {

                coin.position.z =
                    -400 -
                    Math.random() *
                    100;
            }
        }
    );
}


/* =========================================================
   ROAD UPDATE
========================================================= */

function updateRoad(
    delta
) {

    roadGroup.children.forEach(
        object => {

            if (
                object.userData.isRoad ||
                object.userData.isRoadPart
            ) {

                object.position.z +=
                    speed *
                    delta;


                if (
                    object.position.z >
                    100
                ) {

                    object.position.z -=

                        CONFIG.segmentCount *
                        CONFIG.segmentLength;
                }
            }
        }
    );
}


/* =========================================================
   ENVIRONMENT UPDATE
========================================================= */

function updateEnvironment(
    delta
) {

    environmentGroup.children.forEach(
        object => {

            object.position.z +=
                speed *
                delta *
                0.72;


            if (
                object.position.z >
                70
            ) {

                object.position.z -=
                    770;
            }
        }
    );
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(
    delta
) {

    const desiredY =
        isMobile
            ? 4.4
            : 4.7;


    camera.position.y =
        THREE.MathUtils.damp(

            camera.position.y,

            desiredY,

            4,

            delta

        );


    /*
        Camera follows player sideways
        very gently.

        It does NOT snap directly to
        the car.
    */

    const desiredCameraX =
        player.position.x *
        0.28;


    camera.position.x =
        THREE.MathUtils.damp(

            camera.position.x,

            desiredCameraX,

            5,

            delta

        );


    camera.lookAt(

        player.position.x *
        0.35,

        1.0,

        -16

    );
}


/* =========================================================
   CRASH
========================================================= */

function crash() {

    if (
        gameOver
    ) {
        return;
    }


    gameOver =
        true;


    gameRunning =
        false;


    const finalScore =
        Math.floor(
            score
        );


    if (
        finalScore >
        bestScore
    ) {

        bestScore =
            finalScore;


        localStorage.setItem(

            "neonHighwayBest",

            String(
                bestScore
            )

        );
    }


    finalScoreElement.textContent =
        finalScore;


    finalBestElement.textContent =
        bestScore;


    bestElement.textContent =
        bestScore;


    menuBestElement.textContent =
        bestScore;


    dangerFlash.classList.add(
        "active"
    );


    setTimeout(
        () => {

            dangerFlash.classList.remove(
                "active"
            );


            hud.classList.add(
                "hidden"
            );


            touchControls.classList.add(
                "hidden"
            );


            gameOverScreen.classList.remove(
                "hidden"
            );

        },
        180
    );
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        !gameRunning ||
        gameOver
    ) {
        return;
    }


    if (
        !howtoScreen.classList.contains(
            "hidden"
        )
    ) {

        return;
    }


    if (
        !settingsScreen.classList.contains(
            "hidden"
        )
    ) {

        return;
    }


    paused =
        !paused;


    if (
        paused
    ) {

        clearInputs();


        pauseScreen.classList.remove(
            "hidden"
        );

    } else {

        pauseScreen.classList.add(
            "hidden"
        );


        lastTime =
            performance.now();


        requestAnimationFrame(
            gameLoop
        );
    }
}


/* =========================================================
   EXIT GAME
========================================================= */

function exitGame() {

    gameRunning =
        false;

    paused =
        false;

    gameOver =
        false;


    clearInputs();


    pauseScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.add(
        "hidden"
    );


    hud.classList.add(
        "hidden"
    );


    touchControls.classList.add(
        "hidden"
    );


    menu.classList.remove(
        "hidden"
    );


    updateMenu();
}


/* =========================================================
   MENU
========================================================= */

function updateMenu() {

    menuBestElement.textContent =
        bestScore;


    bestElement.textContent =
        bestScore;
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    speedElement.textContent =
        Math.round(
            speed
        );


    scoreElement.textContent =
        Math.floor(
            score
        );


    bestElement.textContent =
        bestScore;
}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            /*
                ESC ONLY PAUSES.

                SPACE DOES NOT PAUSE.
            */

            if (
                event.code ===
                "Escape"
            ) {

                event.preventDefault();

                togglePause();

                return;
            }


            /*
                LEFT
            */

            if (
                event.code === "KeyA" ||
                event.code === "ArrowLeft"
            ) {

                event.preventDefault();

                keys.left =
                    true;
            }


            /*
                RIGHT
            */

            if (
                event.code === "KeyD" ||
                event.code === "ArrowRight"
            ) {

                event.preventDefault();

                keys.right =
                    true;
            }


            /*
                ACCELERATE
            */

            if (
                event.code === "KeyW" ||
                event.code === "ArrowUp"
            ) {

                event.preventDefault();

                keys.accelerate =
                    true;
            }


            /*
                BRAKE
            */

            if (
                event.code === "KeyS" ||
                event.code === "ArrowDown"
            ) {

                event.preventDefault();

                keys.brake =
                    true;
            }
        }
    );


    document.addEventListener(
        "keyup",
        event => {

            if (
                event.code === "KeyA" ||
                event.code === "ArrowLeft"
            ) {

                keys.left =
                    false;
            }


            if (
                event.code === "KeyD" ||
                event.code === "ArrowRight"
            ) {

                keys.right =
                    false;
            }


            if (
                event.code === "KeyW" ||
                event.code === "ArrowUp"
            ) {

                keys.accelerate =
                    false;
            }


            if (
                event.code === "KeyS" ||
                event.code === "ArrowDown"
            ) {

                keys.brake =
                    false;
            }
        }
    );


    window.addEventListener(
        "blur",
        clearInputs
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                clearInputs();
            }
        }
    );
}


/* =========================================================
   CLEAR INPUTS
========================================================= */

function clearInputs() {

    keys.left =
        false;

    keys.right =
        false;

    keys.accelerate =
        false;

    keys.brake =
        false;


    steeringTarget =
        0;
}


/* =========================================================
   TOUCH CONTROLS
========================================================= */

function setupTouchControls() {

    const left =
        document.getElementById(
            "left"
        );

    const right =
        document.getElementById(
            "right"
        );

    const brake =
        document.getElementById(
            "brake"
        );

    const boost =
        document.getElementById(
            "boost"
        );


    /* ==============================================
       LEFT
    ============================================== */

    left.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            left.setPointerCapture(
                event.pointerId
            );

            keys.left =
                true;
        }
    );


    left.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys.left =
                false;
        }
    );


    left.addEventListener(
        "pointercancel",
        () => {

            keys.left =
                false;
        }
    );


    left.addEventListener(
        "lostpointercapture",
        () => {

            keys.left =
                false;
        }
    );


    /* ==============================================
       RIGHT
    ============================================== */

    right.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            right.setPointerCapture(
                event.pointerId
            );

            keys.right =
                true;
        }
    );


    right.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys.right =
                false;
        }
    );


    right.addEventListener(
        "pointercancel",
        () => {

            keys.right =
                false;
        }
    );


    right.addEventListener(
        "lostpointercapture",
        () => {

            keys.right =
                false;
        }
    );


    /* ==============================================
       ACCELERATE
    ============================================== */

    boost.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            boost.setPointerCapture(
                event.pointerId
            );

            keys.accelerate =
                true;
        }
    );


    boost.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys.accelerate =
                false;
        }
    );


    boost.addEventListener(
        "pointercancel",
        () => {

            keys.accelerate =
                false;
        }
    );


    boost.addEventListener(
        "lostpointercapture",
        () => {

            keys.accelerate =
                false;
        }
    );


    /* ==============================================
       BRAKE
    ============================================== */

    brake.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            brake.setPointerCapture(
                event.pointerId
            );

            keys.brake =
                true;
        }
    );


    brake.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys.brake =
                false;
        }
    );


    brake.addEventListener(
        "pointercancel",
        () => {

            keys.brake =
                false;
        }
    );


    brake.addEventListener(
        "lostpointercapture",
        () => {

            keys.brake =
                false;
        }
    );
}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    document.getElementById(
        "start"
    ).addEventListener(
        "click",
        startGame
    );


    document.getElementById(
        "again"
    ).addEventListener(
        "click",
        startGame
    );


    document.getElementById(
        "resume"
    ).addEventListener(
        "click",
        togglePause
    );


    document.getElementById(
        "restart"
    ).addEventListener(
        "click",
        () => {

            pauseScreen.classList.add(
                "hidden"
            );


            resetGame();


            paused =
                false;


            gameOver =
                false;


            gameRunning =
                true;


            lastTime =
                performance.now();


            requestAnimationFrame(
                gameLoop
            );
        }
    );


    document.getElementById(
        "exit"
    ).addEventListener(
        "click",
        exitGame
    );


    document.getElementById(
        "mainMenu"
    ).addEventListener(
        "click",
        exitGame
    );


    /* ==============================================
       HOW TO PLAY
    ============================================== */

    document.getElementById(
        "howto"
    ).addEventListener(
        "click",
        () => {

            howtoScreen.classList.remove(
                "hidden"
            );
        }
    );


    document.getElementById(
        "closeHowto"
    ).addEventListener(
        "click",
        () => {

            howtoScreen.classList.add(
                "hidden"
            );
        }
    );


    /* ==============================================
       SETTINGS
    ============================================== */

    document.getElementById(
        "settings"
    ).addEventListener(
        "click",
        () => {

            settingsScreen.classList.remove(
                "hidden"
            );
        }
    );


    document.getElementById(
        "pauseSettings"
    ).addEventListener(
        "click",
        () => {

            settingsScreen.classList.remove(
                "hidden"
            );
        }
    );


    document.getElementById(
        "closeSettings"
    ).addEventListener(
        "click",
        () => {

            settingsScreen.classList.add(
                "hidden"
            );
        }
    );
}


/* =========================================================
   RESIZE
========================================================= */

function onResize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );


    const pixelRatio =
        isMobile

            ? CONFIG.mobilePixelRatio

            : Math.min(
                window.devicePixelRatio,
                CONFIG.desktopPixelRatio
            );


    renderer.setPixelRatio(
        pixelRatio
    );
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    window.addEventListener(
        "resize",
        onResize
    );


    setupKeyboard();

    setupTouchControls();

    setupButtons();
}


/* =========================================================
   START
========================================================= */

init();
