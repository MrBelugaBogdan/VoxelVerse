import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { World } from './src/World.js';

// --- Ініціалізація ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Небо

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- Світ ---
const world = new World(scene);
world.generate();

// Ставимо гравця трохи вище найвищої точки в центрі
camera.position.set(16, 10, 16);

// --- Світло ---
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(10, 20, 15);
scene.add(light);
scene.add(new THREE.AmbientLight(0x606060));

// --- Керування та Гравітація ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;

// Фізичні змінні
const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
const PLAYER_HEIGHT = 1.8; // Зріст очей гравця
const PLAYER_RADIUS = 0.4; // Ширина гравця

const onKeyDown = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': 
            if (canJump) {
                playerVelocity.y = 12; // Сила стрибка
                canJump = false;
            }
            break;
    }
};
const onKeyUp = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- Будування та руйнування (Raycaster) ---
const raycaster = new THREE.Raycaster();
raycaster.far = 10; // Дальність взаємодії (10 блоків)
const mouseCenter = new THREE.Vector2(0, 0);

window.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    raycaster.setFromCamera(mouseCenter, camera);
    const intersects = raycaster.intersectObjects(world.blocks);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (event.button === 0) { // ЛКМ - ламати
            world.removeBlock(intersect.object);
        } else if (event.button === 2) { // ПКМ - ставити
            world.addBlockFromRaycast(intersect);
        }
    }
});
window.addEventListener('contextmenu', e => e.preventDefault());


// --- ЦИКЛ АНІМАЦІЇ (з фізикою) ---
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        // 1. Прискорюємо падіння (гравітація)
        playerVelocity.y -= 30.0 * delta; // 30 - сила тяжіння

        // 2. Сповільнюємо рух (тертя)
        playerVelocity.x -= playerVelocity.x * 10.0 * delta;
        playerVelocity.z -= playerVelocity.z * 10.0 * delta;

        // 3. Визначаємо напрямок руху
        playerDirection.z = Number(moveForward) - Number(moveBackward);
        playerDirection.x = Number(moveRight) - Number(moveLeft);
        playerDirection.normalize();

        // 4. Додаємо швидкість від клавіш
        if (moveForward || moveBackward) playerVelocity.z -= playerDirection.z * 200.0 * delta;
        if (moveLeft || moveRight) playerVelocity.x -= playerDirection.x * 200.0 * delta;

        // --- 5. ФІЗИКА ТА КОЛІЗІЇ ---
        const playerObj = controls.getObject();
        const oldPosition = playerObj.position.clone();
        
        // Рух по горизонталі
        controls.moveRight(-playerVelocity.x * delta);
        controls.moveForward(-playerVelocity.z * delta);

        // Рух по вертикалі
        playerObj.position.y += (playerVelocity.y * delta);

        // **Проста колізія з підлогою (AABB)**
        // Ми перевіряємо блок безпосередньо під ногами гравця
        const feetParams = {
            x: Math.round(playerObj.position.x),
            y: Math.round(playerObj.position.y - PLAYER_HEIGHT), // Ноги
            z: Math.round(playerObj.position.z)
        };

        // Шукаємо, чи є блок під нами в масиві світ
        const blockUnderFeet = world.blocks.find(b => 
            b.position.x === feetParams.x &&
            b.position.y === feetParams.y &&
            b.position.z === feetParams.z
        );

        if (blockUnderFeet) {
            // Якщо є блок, зупиняємо падіння і ставимо гравця на блок
            playerVelocity.y = 0;
            playerObj.position.y = blockUnderFeet.position.y + PLAYER_HEIGHT + 0.5; // 0.5 - половина висоти блоку
            canJump = true;
        } else {
            // Перевірка на випадок падіння за межі світу
            if (playerObj.position.y < -10) {
                playerObj.position.set(16, 10, 16); // Респавн
                playerVelocity.y = 0;
            }
        }

        prevTime = time;
    }

    renderer.render(scene, camera);
}

// Оновлення розміру вікна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
