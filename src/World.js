import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = []; // Масив для колізій
        this.cellSize = 32; // Розмір світу (32x32)
        this.noise2D = createNoise2D(); // Генератор шуму

        // Завантаження текстур (посилання для прикладу)
        const loader = new THREE.TextureLoader();
        this.textures = {
            grass: loader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg'),
            dirt: loader.load('https://threejs.org/examples/textures/lava/lavatile.jpg'), // Тимчасово лава як земля для контрасту
        };
        
        // Матеріали
        this.matGrass = new THREE.MeshLambertMaterial({ map: this.textures.grass });
        this.matDirt = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Коричневий для нових блоків
        
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate() {
        console.log("Генерація воксельного світу...");
        
        // Створюємо масив для зберігання даних про висоту (щоб не дублювати блоки)
        this.worldData = [];

        for (let x = 0; x < this.cellSize; x++) {
            this.worldData[x] = [];
            for (let z = 0; z < this.cellSize; z++) {
                // Генерація висоти за допомогою шуму (від 0 до 5)
                const noiseVal = this.noise2D(x * 0.05, z * 0.05);
                const height = Math.floor((noiseVal + 1) * 3);
                
                this.worldData[x][z] = height;

                // Створюємо стовпчик блоків
                for (let y = 0; y <= height; y++) {
                    // Верхній блок - трава, інші - земля
                    const material = (y === height) ? this.matGrass : this.matGrass; // Поки все трава
                    this.placeBlock(x, y, z, material);
                }
            }
        }
    }

    // Універсальна функція для розміщення блоку за координатами
    placeBlock(x, y, z, material) {
        // Округляємо координати до цілих, щоб вони попадали в сітку 1x1x1
        const rx = Math.round(x);
        const ry = Math.round(y);
        const rz = Math.round(z);

        // Перевіряємо, чи немає вже блоку в цій позиції (спрощено)
        const blockExists = this.blocks.some(b => 
            b.position.x === rx && b.position.y === ry && b.position.z === rz
        );
        if (blockExists) return;

        const mesh = new THREE.Mesh(this.geometry, material);
        mesh.position.set(rx, ry, rz);
        
        this.scene.add(mesh);
        this.blocks.push(mesh); // Додаємо в масив для колізій та raycaster
    }

    addBlockFromRaycast(intersect) {
        // Отримуємо позицію кліку і нормаль грані (куди дивиться поверхню)
        const pos = intersect.point.clone();
        const normal = intersect.face.normal.clone();
        
        // Обчислюємо позицію нового блоку: позиція кліку + половина нормалі (щоб вийти за межі блоку)
        // і округляємо, щоб попасти в сітку.
        const targetPos = pos.add(normal.multiplyScalar(0.5));
        
        this.placeBlock(targetPos.x, targetPos.y, targetPos.z, this.matDirt);
    }

    removeBlock(block) {
        this.scene.remove(block);
        this.blocks = this.blocks.filter(b => b !== block);
    }
}
