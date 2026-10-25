/* ============================================================
   氛围增强系统 · 花瓣飘落 + 飞鸟
   提升国风漫剧/电影质感
   ============================================================ */

const Atmosphere = {
  petals: null,
  petalCount: 250,
  birds: null,
  birdCount: 10,
  birdTime: 0,

  init() {
    // --- 花瓣粒子 ---
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.petalCount * 3);
    this.petalVel = new Float32Array(this.petalCount * 3);
    for (let i = 0; i < this.petalCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 160;
      pos[i*3+1] = Math.random() * 35 + 5;
      pos[i*3+2] = (Math.random() - 0.5) * 160;
      this.petalVel[i*3] = (Math.random() - 0.5) * 0.4;
      this.petalVel[i*3+1] = -0.4 - Math.random() * 0.4;
      this.petalVel[i*3+2] = (Math.random() - 0.5) * 0.4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffb7c5, size: 0.22, transparent: true, opacity: 0.75,
      depthWrite: false, sizeAttenuation: true,
    });
    this.petals = new THREE.Points(pGeo, pMat);
    this.petals.frustumCulled = false;
    scene.add(this.petals);

    // --- 飞鸟（V形翅膀） ---
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.birdCount * 2 * 3), 3));
    const bMat = new THREE.LineBasicMaterial({ color: 0x3a3a3a, transparent: true, opacity: 0.55 });
    this.birds = new THREE.LineSegments(bGeo, bMat);
    this.birds.frustumCulled = false;
    scene.add(this.birds);
  },

  update(dt, t) {
    if (!this.petals || !this.birds) return;
    const center = player.group.position;

    // 花瓣
    const pos = this.petals.geometry.attributes.position.array;
    for (let i = 0; i < this.petalCount; i++) {
      pos[i*3+1] += this.petalVel[i*3+1] * dt;
      pos[i*3] += (this.petalVel[i*3] + Math.sin(t * 0.5 + i) * 0.25) * dt;
      pos[i*3+2] += (this.petalVel[i*3+2] + Math.cos(t * 0.3 + i * 0.7) * 0.18) * dt;
      if (pos[i*3+1] < 0.5) {
        pos[i*3] = center.x + (Math.random() - 0.5) * 160;
        pos[i*3+1] = 25 + Math.random() * 20;
        pos[i*3+2] = center.z + (Math.random() - 0.5) * 160;
      }
      const dx = pos[i*3] - center.x, dz = pos[i*3+2] - center.z;
      if (Math.abs(dx) > 80 || Math.abs(dz) > 80) {
        pos[i*3] = center.x + (Math.random() - 0.5) * 80;
        pos[i*3+2] = center.z + (Math.random() - 0.5) * 80;
      }
    }
    this.petals.geometry.attributes.position.needsUpdate = true;

    // 飞鸟
    this.birdTime += dt;
    const bPos = this.birds.geometry.attributes.position.array;
    for (let i = 0; i < this.birdCount; i++) {
      const angle = this.birdTime * 0.12 + i * 0.4;
      const radius = 50 + i * 6;
      const height = 30 + Math.sin(i * 1.7) * 8;
      const cx = center.x + Math.cos(angle) * radius;
      const cz = center.z + Math.sin(angle) * radius;
      const cy = center.y + height;
      const wing = Math.sin(this.birdTime * 5 + i) * 1.2;
      bPos[i*6]   = cx - 0.8 + wing;
      bPos[i*6+1] = cy;
      bPos[i*6+2] = cz;
      bPos[i*6+3] = cx + 0.8 - wing;
      bPos[i*6+4] = cy;
      bPos[i*6+5] = cz;
    }
    this.birds.geometry.attributes.position.needsUpdate = true;
  },
};

// 挂接主循环
if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    Atmosphere.init();
  };
}
if (typeof animate !== 'undefined') {
  const origAnim = animate;
  animate = function(now) {
    origAnim(now);
    if (GAME && GAME.ready && player) {
      Atmosphere.update(Math.min(0.05, (now - GAME.lastFrame) / 1000), GAME.time);
    }
  };
}
