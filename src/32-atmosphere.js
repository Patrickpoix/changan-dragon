/* ============================================================
   氛围增强系统 · 花瓣飘落 + 飞鸟 + 色彩分级
   提升国风漫剧/电影质感
   ============================================================ */

const Atmosphere = {
  petalGeo: null,
  petalMat: null,
  petals: null,
  petalCount: 300,
  
  birdGeo: null,
  birdMat: null,
  birds: null,
  birdCount: 12,
  birdTime: 0,
  
  init() {
    // 花瓣粒子
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.petalCount * 3);
    const vel = new Float32Array(this.petalCount * 3);
    
    for (let i = 0; i < this.petalCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 200;
      pos[i*3+1] = Math.random() * 40 + 5;
      pos[i*3+2] = (Math.random() - 0.5) * 200;
      vel[i*3] = (Math.random() - 0.5) * 0.5;
      vel[i*3+1] = -0.5 - Math.random() * 0.5;
      vel[i*3+2] = (Math.random() - 0.5) * 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.userData.vel = vel;
    
    const pMat = new THREE.PointsMaterial({
      color: 0xffb7c5,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true,
    });
    
    this.petals = new THREE.Points(pGeo, pMat);
    this.petals.frustumCulled = false;
    scene.add(this.petals);
    
    // 飞鸟（简单的V形）
    const bGeo = new THREE.BufferGeometry();
    const bPos = new Float32Array(this.birdCount * 2 * 3); // 每只鸟两个点
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    
    const bMat = new THREE.LineBasicMaterial({
      color: 0x3a3a3a,
      transparent: true,
      opacity: 0.6,\n    });
    
    this.birds = new THREE.LineSegments(bGeo, bMat);
    this.birds.frustumCulled = false;
    scene.add(this.birds);
  },
  
  update(dt, t) {
    if (!this.petals || !this.birds) return;
    
    // 花瓣飘落
    const pos = this.petals.geometry.attributes.position.array;
    const vel = this.petals.geometry.attributes.position.vel || this.petals.geometry.userData.vel;
    const center = player.group.position;
    
    for (let i = 0; i < this.petalCount; i++) {
      // 下落
      pos[i*3+1] += vel[i*3+1] * dt;
      // 横向飘动
      pos[i*3] += (vel[i*3] + Math.sin(t * 0.5 + i) * 0.3) * dt;
      pos[i*3+2] += (vel[i*3+2] + Math.cos(t * 0.3 + i * 0.7) * 0.2) * dt;
      
      // 落到底部后重置到顶部
      if (pos[i*3+1] < 0.5) {
        pos[i*3] = center.x + (Math.random() - 0.5) * 200;
        pos[i*3+1] = 30 + Math.random() * 20;
        pos[i*3+2] = center.z + (Math.random() - 0.5) * 200;
      }
      
      // 保持在玩家周围一定范围内
      const dx = pos[i*3] - center.x;
      const dz = pos[i*3+2] - center.z;
      if (Math.abs(dx) > 100 || Math.abs(dz) > 100) {
        pos[i*3] = center.x + (Math.random() - 0.5) * 100;
        pos[i*3+2] = center.z + (Math.random() - 0.5) * 100;
      }
    }
    this.petals.geometry.attributes.position.needsUpdate = true;
    
    // 飞鸟
    this.birdTime += dt;
    const bPos = this.birds.geometry.attributes.position.array;
    for (let i = 0; i < this.birdCount; i++) {
      const angle = this.birdTime * 0.15 + i * 0.5;
      const radius = 60 + i * 8;
      const height = 35 + Math.sin(i * 2) * 10;
      const cx = center.x + Math.cos(angle) * radius;
      const cz = center.z + Math.sin(angle) * radius;
      const cy = center.y + height;
      
      // 翅膀扇动
      const wing = Math.sin(this.birdTime * 6 + i) * 1.5;
      
      // 两个翅膀端点
      bPos[i*6] = cx - 1 + wing;
      bPos[i*6+1] = cy;
      bPos[i*6+2] = cz;
      bPos[i*6+3] = cx + 1 - wing;
      bPos[i*6+4] = cy;
      bPos[i*6+5] = cz;
    }
    this.birds.geometry.attributes.position.needsUpdate = true;
    
    // 花瓣颜色随时间微妙变化（粉红到白）
    const hueShift = Math.sin(t * 0.1) * 0.05;
    this.petals.material.color.setHSL(0.95 + hueShift, 0.6, 0.75);
  },
};

// 在主循环中更新
if (typeof animate !== 'undefined') {
  const origAnimate = animate;
  animate = function(now) {
    origAnimate(now);
    if (GAME.ready) Atmosphere.update(Math.min(0.05, (now - GAME.lastFrame) / 1000), GAME.time);
  };
}

// 初始化
if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    Atmosphere.init();
  };
}
