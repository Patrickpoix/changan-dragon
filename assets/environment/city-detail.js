/* ============================================================
   城市细节增强 v2.0
   街道、店铺、招牌、摊位、行人
   ============================================================ */

const CityDetailEnhancer = {
  
  createShopSign(text, width, height) {
    const group = new THREE.Group();
    
    const boardGeo = new THREE.BoxGeometry(width, height, 0.1);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 0, 512, 128);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const textMat = new THREE.MeshStandardMaterial({ map: texture });
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.95, height * 0.9),
      textMat
    );
    textPlane.position.z = 0.06;
    group.add(textPlane);
    
    return group;
  },
  
  createStall(type = 'food') {
    const group = new THREE.Group();
    
    const tableGeo = new THREE.BoxGeometry(2, 0.8, 1);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.4;
    table.castShadow = true;
    group.add(table);
    
    if (type === 'food') {
      const roofGeo = new THREE.ConeGeometry(1.5, 0.8, 8);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xb39969, roughness: 0.8 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 1.5;
      group.add(roof);
      
      const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a });
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6),
          postMat
        );
        post.position.set(side * 1, 0.75, 0);
        group.add(post);
      }
    }
    
    const goodsColors = {
      food: 0xff6b35,
      cloth: 0x87ceeb,
      pottery: 0xd2b48c,
    };
    
    const goodsMat = new THREE.MeshStandardMaterial({ 
      color: goodsColors[type] || 0xff6b35, 
      roughness: 0.7 
    });
    
    for (let i = 0; i < 5; i++) {
      const goods = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 4),
        goodsMat
      );
      goods.position.set(
        (Math.random() - 0.5) * 1.5,
        0.9,
        (Math.random() - 0.5) * 0.5
      );
      group.add(goods);
    }
    
    return group;
  },
  
  createPedestrian(type = 'commoner') {
    let person;
    
    if (typeof TangCharacterBuilder !== 'undefined') {
      switch (type) {
        case 'official':
          person = TangCharacterBuilder.createOfficial(0.9);
          break;
        case 'lady':
          person = TangCharacterBuilder.createLady(0.9);
          break;
        default:
          person = TangCharacterBuilder.createCommoner(0.9);
      }
    } else {
      person = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b7355 })
      );
      body.position.y = 0.8;
      person.add(body);
      
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xf0d0b0 })
      );
      head.position.y = 1.5;
      person.add(head);
    }
    
    person.rotation.y = Math.random() * Math.PI * 2;
    
    return person;
  },
  
  createStreetDecor(count, width, depth) {
    const group = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      let item;
      
      if (t < 0.2) {
        const types = ['food', 'cloth', 'pottery'];
        item = this.createStall(types[Math.floor(Math.random() * types.length)]);
      } else if (t < 0.6) {
        const types = ['commoner', 'lady', 'official'];
        item = this.createPedestrian(types[Math.floor(Math.random() * types.length)]);
      } else {
        if (typeof NightLightingEnhancer !== 'undefined') {
          item = NightLightingEnhancer.createLantern(0.2);
        } else {
          item = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0xff6b35 })
          );
        }
      }
      
      item.position.set(
        (Math.random() - 0.5) * width,
        0,
        (Math.random() - 0.5) * depth
      );
      
      group.add(item);
    }
    
    return group;
  }
};

window.CityDetailEnhancer = CityDetailEnhancer;

console.log('[City-Detail] 城市细节增强模块加载完成');
