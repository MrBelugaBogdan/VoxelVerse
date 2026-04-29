import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = []; // Масив для зберігання мешів блоків
        this.cellSize = 16; // Розмір чанку 16x16
    }

    // Створюємо сітку блоків (землю)
    generate() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x55aa55 });

        for (let x = 0; x < this.cellSize; x++) {
            for (let z = 0; z < this.cellSize; z++) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, 0, z);
                this.scene.add(mesh);
                this.blocks.push(mesh);
            }
        }
    }

    // Функція для додавання блоку
    addBlock(position) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Коричневий
        const block = new THREE.Mesh(geometry, material);
        block.position.copy(position).round(); // Округляємо координати до цілих
        this.scene.add(block);
        this.blocks.push(block);
    }

    // Функція для видалення блоку
    removeBlock(block) {
        this.scene.remove(block);
        this.blocks = this.blocks.filter(b => b !== block);
    }
}
