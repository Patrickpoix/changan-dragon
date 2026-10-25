/* ============================================================
   城市活力 · 更多NPC行人 + 车马
   让长安更有烟火气
   ============================================================ */

const CityLife = {
  people: [],
  cart: null,
  
  // 生成更多行人
  addPedestrians() {
    const positions = [];
    // 朱雀大街上的行人
    for (let i = 0; i < 40; i++) {
      positions.push([
        (Math.random() - 0.5) * 20,
        -350 + Math.random() * 700,
      ]);
    }
    // 东西市的行人
    for (let i = 0; i < 30; i++) {
      positions.push([
        -250 + Math.random() * 80,
        -40 + Math.random() * 100,
      ]);
    }
    for (let i = 0; i < 30; i++) {
      positions.push([
        180 + Math.random() * 80,
        -40 + Math.random() * 100,
      ]);
    }
    
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.8 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
    
    positions.forEach(([x, z], i) => {
      const g = new THREE.Group();
      // 身体
      const body = new THREE.Mesh(UNIT_CYL, bodyMat);
      body.scale.set(0.25, 0.8, 0.25);
      body.position.y = 0.4;
      g.add(body);
      // 头
      const head = new THREE.Mesh(UNIT_SPHERE, headMat);
      head.scale.set(0.15, 0.15, 0.15);
      head.position.y = 1.0;
      g.add(head);
      
      g.position.set(x, 0, z);
      g.userData.speed = 0.5 + Math.random() * 0.5;
      g.userData.direction = Math.random() > 0.5 ? 1 : -1;
      g.userData.walkPhase = Math.random() * Math.PI * 2;
      
      scene.add(g);
      this.people.push(g);
    });
    
    console.log('[CityLife] 添加了', this.people.length, '个行人');
  },
  
  // 更新行人动画
  update(dt, t) {
    for (const person of this.people) {
      // 沿街道行走
      person.position.z += person.userData.speed * person.userData.direction * dt;
      
      // 走到尽头回头
      if (person.position.z > 380) person.userData.direction = -1;
      if (person.position.z < -380) person.userData.direction = 1;
      
      // 走路摆动
      person.position.y = Math.sin(t * 4 + person.userData.walkPhase) * 0.05;
      person.rotation.y = person.userData.direction > 0 ? 0 : Math.PI;
    }
  },
  
  init() {
    this.addPedestrians();
    console.log('[CityLife] 城市活力增强完成');
  },
};

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    CityLife.init();
  };
}

if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready) {
      CityLife.update(Math.min(0.05, (now - GAME.lastFrame) / 1000), GAME.time);
    }
  };
}
