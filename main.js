import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { World } from './src/World.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const world = new World(scene);
world.generate();

// Ставимо гравця
camera.position.set(16, 10, 16);

// Світло
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x707070));

// Керування
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

let moveF = false, moveB = false, moveL = false, moveR = false, canJump = false;
const v = new THREE.Vector3(); // Швидкість
const PLAYER_H = 1.8;

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveF = true;
    if (e.code === 'KeyS') moveB = true;
    if (e.code === 'KeyA') moveL = true;
    if (e.code === 'KeyD') moveR = true;
    if (e.code === 'Space' && canJump) { v.y = 10; canJump = false; }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveF = false;
    if (e.code === 'KeyS') moveB = false;
    if (e.code === 'KeyA') moveL = false;
    if (e.code === 'KeyD') moveR = false;
});

// Будування/Руйнування
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const hits = raycaster.intersectObjects(world.blocks);
    if (hits.length > 0) {
        if (e.button === 0) world.removeBlock(hits[0].object);
        if (e.button === 2) world.addBlockFromRaycast(hits[0]);
    }
});
window.oncontextmenu = (e) => e.preventDefault();

let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    if (controls.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        v.y -= 25 * delta; // Гравітація
        v.x -= v.x * 10 * delta;
        v.z -= v.z * 10 * delta;

        const dir = new THREE.Vector3(Number(moveR)-Number(moveL), 0, Number(moveF)-Number(moveB)).normalize();
        v.x += dir.x * 150 * delta;
        v.z += dir.z * 150 * delta;

        controls.moveRight(v.x * delta);
        controls.moveForward(v.z * delta);
        camera.position.y += v.y * delta;

        // Колізія з підлогою
        const p = camera.position;
        const ground = world.blocks.find(b => 
            Math.abs(b.position.x - Math.round(p.x)) < 0.6 &&
            Math.abs(b.position.z - Math.round(p.z)) < 0.6 &&
            Math.abs(b.position.y - Math.round(p.y - PLAYER_H)) < 0.5
        );

        if (ground && v.y < 0) {
            v.y = 0;
            camera.position.y = ground.position.y + PLAYER_H + 0.5;
            canJump = true;
        }
        if (p.y < -10) p.set(16, 10, 16); // Респавн
        prevTime = time;
    }
    renderer.render(scene, camera);
}
animate();
