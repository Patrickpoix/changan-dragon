/* ============================================================
   动物系统增强 v2.0
   动物生成、动画、生态
   ============================================================ */

const AnimalSystemEnhancer = {
  
  animals: [],
  
  init() {
    console.log('[Animal] 动物系统初始化完成');
  },
  
  spawnAnimal(type, x, z) {
    let animal;
    
    if (typeof TangAnimalBuilder !== 'undefined') {
      switch (type) {
        case 'horse':
          animal = TangAnimalBuilder.createHorse(1);
          break;
        case 'camel':
          animal = TangAnimalBuilder.createCamel(1);
          break;
        case 'bird':
          animal = TangAnimalBuilder.createBird(1);
          break;
        case 'fish':
          animal = TangAnimalBuilder.createFish(1);
          break;
        default:
          animal = this.createSimpleAnimal(type);
      }
    } else {
      animal = this.createSimpleAnimal(type);
    }
    
    animal.position.set(x, 0, z);
    animal.userData = {
      type: 'animal',
      animalType: type,
      wanderRadius: 10,
      wanderCenter: { x: x, z: z },
    };
    
    this.animals.push(animal);
    
    if (window.GAME?.scene) {
      GAME.scene.add(animal);
    }
    
    return animal;
  },
  
  createSimpleAnimal(type) {
    const group = new THREE.Group();
    
    const colors = {
      horse: 0x8b4513,
      camel: 0xd2b48c,
      bird: 0x87ceeb,
      fish: 0xff6b6b,
    };
    
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 6),
      new THREE.MeshStandardMaterial({ color: colors[type] || 0x8b4513 })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 4),
      new THREE.MeshStandardMaterial({ color: colors[type] || 0x8b4513 })
    );
    head.position.set(0.3, 0.7, 0);
    group.add(head);
    
    return group;
  },
  
  spawnWildlife(count, xMin, xMax, zMin, zMax) {
    const types = ['horse', 'camel', 'bird', 'fish'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const x = xMin + Math.random() * (xMax - xMin);
      const z = zMin + Math.random() * (zMax - zMin);
      
      this.spawnAnimal(type, x, z);
    }
    
    console.log(`[Animal] 生成了 ${count} 只野生动物`);
  },
  
  update(deltaTime, time) {
    this.animals.forEach(animal => {
      if (!animal.userData.wanderRadius) return;
      
      const center = animal.userData.wanderCenter;
      const radius = animal.userData.wanderRadius;
      
      const angle = time * 0.3 + animal.position.x * 0.1;
      animal.position.x = center.x + Math.sin(angle) * radius;
      animal.position.z = center.z + Math.cos(angle) * radius * 0.7;
      
      if (animal.userData.animalType === 'bird') {
        animal.position.y = 10 + Math.sin(time * 2 + animal.position.x) * 2;
      }
      
      if (animal.userData.animalType === 'fish') {
        animal.position.y = 0.5;
      }
      
      animal.rotation.y = angle + Math.PI / 2;
    });
  }
};

window.AnimalSystemEnhancer = AnimalSystemEnhancer;

console.log('[Animal] 动物系统增强模块加载完成');
