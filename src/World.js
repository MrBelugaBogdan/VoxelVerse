import * as THREE from 'three';
import { SimpleNoise } from 'https://cdn.skypack.dev/simplex-noise@2.4.0';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = [];
        this.cellSize = 32; // Розмір карти 32x32
        
        const simplex = new SimpleNoise();
        this.noise = (x, z) => simplex.noise2D(x, z); 

        // Матеріали
        this.matGrass = new THREE.MeshLambertMaterial({ color: 0x55aa55 });
        this.matDirt = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate() {
        console.log("Генерація світу...");
        for (let x = 0; x < this.cellSize; x++) {
            for (let z = 0; z < this.cellSize; z++) {
                // Створюємо пагорби
                const height = Math.floor(this.noise(x * 0.08, z * 0.08) * 3) + 3;
                
                for (let y = 0; y <= height; y++) {
                    this.placeBlock(x, y, z, this.matGrass);
                }
            }
        }
    }

    placeBlock(x, y, z, material) {
        const rx = Math.round(x);
        const ry = Math.round(y);
        const rz = Math.round(z);

        // Перевірка, щоб блоки не дублювалися
        if (this.blocks.find(b => b.position.x === rx && b.position.y === ry && b.position.z === rz)) return;

        const mesh = new THREE.Mesh(this.geometry, material);
        mesh.position.set(rx, ry, rz);
        this.scene.add(mesh);
        this.blocks.push(mesh);
    }

    addBlockFromRaycast(intersect) {
        const pos = intersect.point.clone();
        const normal = intersect.face.normal.clone();
        // Виштовхуємо позицію нового блоку за нормаллю грані
        const targetPos = pos.add(normal.multiplyScalar(0.5));
        this.placeBlock(targetPos.x, targetPos.y, targetPos.z, this.matDirt);
    }

    removeBlock(block) {
        this.scene.remove(block);
        this.blocks = this.blocks.filter(b => b !== block);
    }
}
