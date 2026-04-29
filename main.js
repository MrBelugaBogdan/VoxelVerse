import * as THREE from 'three';

// 1. Налаштування сцени
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Блакитне небо

// 2. Камера (FOV, Aspect Ratio, Near, Far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 2;

// 3. Рендерер
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. Створення блоку (Геометрія + Матеріал)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 }); // Зелений блок
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 5. Світло (щоб бачити об'єм куба)
const light = new THREE.DirectionalLight(0xffffffff, 1);
light.position.set(1, 2, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040)); // М'яке фонове світло

// 6. Цикл анімації
function animate() {
    requestAnimationFrame(animate);
    
    // Трохи обертаємо куб для ефекту
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// Оновлення розміру при зміні вікна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
