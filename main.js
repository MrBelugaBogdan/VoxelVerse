import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';
import { World } from './World.js';

// --- Ініціалізація ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 5, 8); // Ставимо гравця в центр чанку

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Світ та світло ---
const world = new World(scene);
world.generate();

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// --- Керування ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// Raycaster для взаємодії з блоками
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0); // Центр екрану

// Обробка кліків миші
window.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(world.blocks);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        if (event.button === 0) { // Ліва кнопка — видалити
            world.removeBlock(intersect.object);
        } 
        else if (event.button === 2) { // Права кнопка — поставити
            const pos = intersect.point.add(intersect.face.normal);
            world.addBlock(pos);
        }
    }
});

// Вимикаємо контекстне меню при правому кліку
window.addEventListener('contextmenu', e => e.preventDefault());

// --- Рух (WASD) ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();

const onKeyDown = (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
};
const onKeyUp = (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- Цикл анімації ---
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        const direction = new THREE.Vector3();
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        prevTime = time;
    }

    renderer.render(scene, camera);
}
animate();
