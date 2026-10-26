/* 自由游城：移动模式、地面安全、景点和电影镜头由这里统一管理。 */
const Explore = {
  mode: 'bike', altitude: 40, lift: 0, liftUp: false, liftDown: false, lastSafe: new THREE.Vector3(0, 0, 352),
  film: false, filmTime: 0, filmIndex: 0, filmPaused: false,
  roofGrid: new Map(), roofCell: 24,
  places: [
    { name: '朱雀天街', note: '晨光入城，市声渐起', x: 0, z: 302, yaw: Math.PI, focus: [0, 6, 286], radius: 36, height: 15 },
    { name: '西市烟火', note: '胡商云集，百货争陈', x: -258, z: 55, yaw: Math.PI, focus: [-258, 5, -14], radius: 80, height: 34 },
    { name: '东市百肆', note: '酒旗招展，锦绣满街', x: 174, z: 55, yaw: Math.PI, focus: [174, 5, -14], radius: 76, height: 31 },
    { name: '大明宫阙', note: '千门次第开，双阙凌云起', x: 150, z: -354, yaw: Math.PI, focus: [150, 15, -430], radius: 92, height: 54 },
    { name: '兴庆春色', note: '花萼相辉，宫苑如画', x: 300, z: -75, yaw: Math.PI, focus: [350, 5, -150], radius: 86, height: 34 },
    { name: '雁塔晴岚', note: '层塔摩云，钟声入风', x: 216, z: 325, yaw: Math.PI, focus: [216, 20, 283], radius: 70, height: 43 },
    { name: '曲江泛舟', note: '画舫穿柳，水映楼台', x: 287, z: 335, yaw: 1.4, focus: [354, 3, 318], radius: 83, height: 21 },
    { name: '明德城门', note: '登临南郭，一眼望长安', x: 0, z: 420, yaw: Math.PI, focus: [0, 10, 380], radius: 67, height: 28 },
  ],

  init() {
    document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => this.setMode(btn.dataset.mode)));
    $('#travelBtn').addEventListener('click', () => this.openTravel());
    $('#filmBtn').addEventListener('click', () => this.startFilm());
    $('#filmExit').addEventListener('click', () => this.stopFilm());
    $('#filmPrev').addEventListener('click', () => this.changeScene(-1));
    $('#filmNext').addEventListener('click', () => this.changeScene(1));
    $('#filmPause').addEventListener('click', () => {
      this.filmPaused = !this.filmPaused;
      $('#filmPause').textContent = this.filmPaused ? '继续运镜' : '暂停运镜';
      $('#filmPause').setAttribute('aria-pressed', String(this.filmPaused));
    });
    $('#filmPhoto').addEventListener('click', () => this.photo());
    $('#travelList').innerHTML = this.places.map((p, i) => `<button class="destination" data-place="${i}"><span class="destination-index">${String(i + 1).padStart(2, '0')}</span><span><strong>${p.name}</strong><small>${p.note}</small></span><span aria-hidden="true">↗</span></button>`).join('');
    $('#travelList').addEventListener('click', e => {
      const btn = e.target.closest('[data-place]');
      if (btn) this.travel(Number(btn.dataset.place));
    });
    bindHold($('#ascendBtn'), () => { this.liftUp = true; }, () => { this.liftUp = false; });
    bindHold($('#descendBtn'), () => { this.liftDown = true; }, () => { this.liftDown = false; });
    window.addEventListener('blur', () => this.resetInput());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.resetInput(); });
    window.addEventListener('keydown', e => {
      if (e.repeat || !GAME.started) return;
      if (e.code === 'Escape' && this.film) { this.stopFilm(); return; }
      if (GAME.modalOpen) return;
      if (e.code === 'KeyP') { this.film ? this.stopFilm() : this.startFilm(); return; }
      if (this.film) return;
      if (e.code === 'Digit1') this.setMode('walk');
      if (e.code === 'Digit2') this.setMode('bike');
      if (e.code === 'Digit3') this.setMode('fly');
      if (e.code === 'KeyG') this.openTravel();
    });
    this.refresh();
  },

  resetInput() {
    this.lift = 0; this.liftUp = this.liftDown = false; Input.keys = Object.create(null); Input.touchBoost = false;
    Input.pointers.clear(); Input.pinching = false; Cam.dragging = false;
    document.querySelectorAll('.held').forEach(el => el.classList.remove('held'));
    Input.joyX = 0; Input.joyY = 0; Input.joyPointer = null;
    UI.joyKnob.style.transform = ''; UI.joystick.classList.remove('active');
    Move.speed = 0; Move.steer = 0;
  },

  refresh() {
    document.querySelectorAll('[data-mode]').forEach(btn => {
      const on = btn.dataset.mode === this.mode;
      btn.classList.toggle('selected', on); btn.setAttribute('aria-pressed', String(on));
    });
    $('#flightControls').classList.toggle('hidden', this.mode !== 'fly');
    $('#modeHint').textContent = this.mode === 'fly' ? 'Q 上升 · E 下降 · 在空地切换落地' : this.mode === 'walk' ? '慢慢走，听一城烟火' : '木轮轻响，且看长安';
    $('#bellBtn .label').textContent = this.mode === 'bike' ? '车铃' : '招呼';
  },

  groundHeight(x, z) { return groundHeightAt(x, z); },
  safeGround(x, z) {
    if (x < WORLD.x0 + 2 || x > WORLD.x1 - 2 || z < WORLD.z0 + 2 || z > WORLD.z1 - 2 || !canStandAt(x, z)) return false;
    if ([[0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]].some(([dx, dz]) => !canStandAt(x + dx, z + dz))) return false;
    const gx = Math.floor(x / CELL), gz = Math.floor(z / CELL);
    for (let ix = gx - 1; ix <= gx + 1; ix++) for (let iz = gz - 1; iz <= gz + 1; iz++) {
      const arr = colliderGrid.get(ix + ',' + iz) || [];
      if (arr.some(c => x > c.minX - 1.2 && x < c.maxX + 1.2 && z > c.minZ - 1.2 && z < c.maxZ + 1.2)) return false;
    }
    return true;
  },
  landing(x, z, radius = 12) {
    if (this.safeGround(x, z)) return new THREE.Vector3(x, this.groundHeight(x, z), z);
    for (let r = 2; r <= radius; r += 2) for (let i = 0; i < 16; i++) {
      const a = i * TAU / 16, nx = x + Math.sin(a) * r, nz = z + Math.cos(a) * r;
      if (this.safeGround(nx, nz)) return new THREE.Vector3(nx, this.groundHeight(nx, nz), nz);
    }
    return null;
  },

  setMode(mode) {
    if (!player || !GAME.started || this.film || GAME.modalOpen || !['walk', 'bike', 'fly'].includes(mode) || mode === this.mode) return false;
    const p = player.group.position;
    if (mode !== 'fly' && this.mode === 'fly') {
      const ground = this.landing(p.x, p.z);
      if (!ground) { toast('此处无法落地，请飞到街道、岸边或桥上'); return false; }
      p.copy(ground); this.lastSafe.copy(ground); player.group.rotation.set(0, Move.yaw, 0);
    }
    if (mode === 'fly') {
      if (this.safeGround(p.x, p.z)) this.lastSafe.copy(p);
      this.altitude = Math.max(40, this.roofAt(p.x, p.z) + 5);
    }
    this.mode = mode; this.resetInput(); this.refresh();
    player.bike.group.visible = mode === 'bike';
    toast(mode === 'fly' ? '乘风而起 · 摇杆前行，右侧升降' : mode === 'walk' ? '下车漫步 · 长安不必匆忙' : '木车骑行 · 随风穿过街巷');
    return true;
  },

  buildRoofGrid() {
    this.roofGrid.clear();
    const addBox = box => {
      for (let x = Math.floor(box.x0 / this.roofCell); x <= Math.floor(box.x1 / this.roofCell); x++)
        for (let z = Math.floor(box.z0 / this.roofCell); z <= Math.floor(box.z1 / this.roofCell); z++) {
          const key = x + ',' + z;
          if (!this.roofGrid.has(key)) this.roofGrid.set(key, []);
          this.roofGrid.get(key).push(box);
        }
    };
    // 实例建筑和独立塔身、宫墙共用同一套飞行高度包络。
    for (const [name, batch] of Object.entries(B)) {
      if (!['plaster', 'plasterWarm', 'stone', 'red', 'roof', 'roofSmall', 'roofGold', 'roofGable'].includes(name)) continue;
      for (const it of batch.items) {
        const top = it.y + it.sy * (name.startsWith('roof') ? 1.45 : 0.5);
        if (top < 2) continue;
        const c = Math.abs(Math.cos(it.ry)), s = Math.abs(Math.sin(it.ry));
        const hw = (it.sx * c + it.sz * s) * 0.5 + 2, hd = (it.sz * c + it.sx * s) * 0.5 + 2;
        const box = { x0: it.x - hw, x1: it.x + hw, z0: it.z - hd, z1: it.z + hd, top };
        addBox(box);
      }
    }
    if (typeof flightObstacles !== 'undefined') flightObstacles.forEach(addBox);
  },
  roofAt(x, z) {
    let top = 0;
    for (const b of this.roofGrid.get(Math.floor(x / this.roofCell) + ',' + Math.floor(z / this.roofCell)) || [])
      if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) top = Math.max(top, b.top);
    return top;
  },

  updateFlight(dt, a, boosting) {
    const p = player.group.position;
    const lift = clamp(this.lift + Number(this.liftUp) - Number(this.liftDown) + (Input.keys.KeyQ ? 1 : 0) - (Input.keys.KeyE ? 1 : 0), -1, 1);
    this.altitude = clamp(this.altitude + lift * dt * 22, 5, 145);
    const floor = this.roofAt(p.x, p.z) + 3.5;
    this.altitude = Math.max(this.altitude, floor);
    p.y = damp(p.y, this.altitude, 2.2, dt);
    Move.speed = damp(Move.speed, a.throttle * (boosting ? 55 : 30), 2.5, dt);
    Move.steer = damp(Move.steer, a.steer, 7, dt);
    Move.yaw += Move.steer * dt * 1.5;
    const nx = clamp(p.x + Math.sin(Move.yaw) * Move.speed * dt, WORLD.x0 + 8, WORLD.x1 - 8);
    const nz = clamp(p.z + Math.cos(Move.yaw) * Move.speed * dt, WORLD.z0 + 8, WORLD.z1 - 8);
    // 爬升过程中不允许钻入高殿或塔身；悬停抬升后再越过。
    if (p.y >= this.roofAt(nx, nz) + 3.2) { p.x = nx; p.z = nz; }
    else { this.altitude = Math.max(this.altitude, this.roofAt(nx, nz) + 5); Move.speed *= 0.8; }
    p.y = Math.max(p.y, this.roofAt(p.x, p.z) + 3.2);
    player.group.rotation.set(Math.sin(GAME.time * 1.8) * 0.025, Move.yaw, -Move.steer * 0.16);
    player.yaw = Move.yaw; player.update(dt, Move.speed, Move.steer, boosting, 'fly');
    $('#altitude').textContent = Math.round(p.y) + ' 米';
  },

  openTravel() { if (GAME.started && !this.film) openModal($('#travelPanel')); },
  travel(i) {
    const spot = this.places[i]; if (!spot || !player) return;
    const ground = this.landing(spot.x, spot.z, 30);
    if (!ground) { toast('此处暂时无法到达'); return; }
    closeModal(); this.resetInput();
    player.group.position.copy(ground); player.yaw = Move.yaw = spot.yaw;
    player.group.rotation.set(0, spot.yaw, 0);
    if (this.mode === 'fly') { this.altitude = 45; player.group.position.y = Math.max(45, this.roofAt(ground.x, ground.z) + 5); }
    this.lastSafe.copy(ground); this.filmIndex = i;
    Cam.userYaw = 0; Cam.zoom = 1; Cam.update(0.016, player, true);
    showBanner(spot.name, spot.note, 3000);
  },

  startFilm() {
    if (!GAME.started || GAME.modalOpen || !player || this.film) return;
    this.filmIndex = this.places.reduce((best, spot, i) => {
      const p = player.group.position, b = this.places[best];
      return Math.hypot(p.x - spot.x, p.z - spot.z) < Math.hypot(p.x - b.x, p.z - b.z) ? i : best;
    }, 0);
    this.film = true; this.filmPaused = false; this.resetInput();
    for(const poem of poems)poem.group.visible=false;
    $('#filmPause').textContent = '暂停运镜'; $('#filmPause').setAttribute('aria-pressed', 'false');
    UI.interact.classList.remove('visible');
    player.group.visible = false;
    document.body.classList.add('cinema');
    $('#filmControls').classList.remove('hidden');
    this.changeScene(0);
    $('#filmExit').focus();
  },
  stopFilm() {
    if (!this.film) return;
    this.film = false; this.resetInput(); player.group.visible = true;
    document.body.classList.remove('cinema'); $('#filmControls').classList.add('hidden');
    Cam.update(0.016, player, true); $('#filmBtn').focus();
  },
  changeScene(delta) {
    this.filmIndex = (this.filmIndex + delta + this.places.length) % this.places.length;
    this.filmTime = 0;
    const spot = this.places[this.filmIndex];
    $('#filmPlace').textContent = spot.name; $('#filmNote').textContent = spot.note;
  },
  updateFilm(dt) {
    if (!this.filmPaused) this.filmTime += dt;
    const spot = this.places[this.filmIndex];
    const shot = FILM_SHOTS[this.filmIndex], phase = this.filmTime * 0.065;
    camera.position.set(shot.eye[0] + Math.sin(phase) * shot.drift, shot.eye[1] + Math.sin(phase * 0.5) * 0.35, shot.eye[2] - Math.sin(phase * 0.7) * shot.drift * 0.6);
    camera.lookAt(...shot.target); camera.fov = 48; camera.updateProjectionMatrix();
    sun.target.position.set(...spot.focus); sun.position.set(spot.focus[0] + 125, spot.focus[1] + 105, spot.focus[2] + 75);
    $('#filmProgress').style.transform = `scaleX(${Math.min(this.filmTime / 34, 1)})`;
    if (!this.filmPaused && this.filmTime >= 34) this.changeScene(1);
  },
  photo() {
    GameRendering.render(0);
    const a = document.createElement('a');
    a.download = '龙游长安-' + this.places[this.filmIndex].name + '.png';
    try { a.href = canvas.toDataURL('image/png'); a.click(); }
    catch (_) { toast('浏览器暂不支持留影，请使用系统截图'); return; }
    $('#filmPhoto').textContent = '已留影'; setTimeout(() => $('#filmPhoto').textContent = '留影', 1400);
  },
};

function installMaterials() {
  if (typeof MATERIAL_ASSETS === 'undefined') return;
  function embedded(key, repeat) {
    const t = new THREE.TextureLoader().load(MATERIAL_ASSETS[key]);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat); t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  TEX.stone = embedded('stone', [1, 1]);
  MAT.stone.map = TEX.stone.clone(); MAT.stone.map.repeat.set(2, 1); MAT.stone.map.needsUpdate = true;
  TEX.stoneBump = TEX.stone.clone(); TEX.stoneBump.colorSpace = THREE.NoColorSpace; TEX.stoneBump.needsUpdate = true;
  MAT.stone.bumpMap = TEX.stoneBump; MAT.stone.bumpScale = 0.014; SurfaceLibrary.softenStone(MAT.stone); MAT.stone.needsUpdate = true;
  MAT.wood.map = embedded('wood', [1, 2]); MAT.wood.roughness = 0.8; MAT.wood.needsUpdate = true;
}

function buildArchitecturalDetails() {
  // Individual gently rounded paving blocks carry actual contact edges in the
  // opening street. Small spatial batches simplify and cull the distant blocks.
  const pavingMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,
    normalMap:MAT.plaster.normalMap,normalScale:new THREE.Vector2(.12,.12)});
  B.pavingBlocks=new Batch(roundedBoxGeo(1,1,1,.035),pavingMaterial,{cast:false,
    farGeometry:new THREE.BoxGeometry(1,1,1),nearDistance:22,maxDistance:72,cellSize:16});
  const pavingColours=[0xd9d1bd,0xccc7b8,0xe0d7c4,0xd3ccba,0xcac5b6];
  const grout=new THREE.Mesh(new THREE.PlaneGeometry(7.6,110),new THREE.MeshStandardMaterial({color:0x938b78,roughness:1}));
  grout.rotation.x=-Math.PI/2;grout.position.set(0,.081,314.5);grout.receiveShadow=true;scene.add(grout);
  for(let row=0;row<146;row++) for(let col=0;col<7;col++) {
    const x=(col-3)*1.06,z=260+row*.75;
    const hash=(Math.imul(row+1,73856093)^Math.imul(col+1,19349663))>>>0;
    B.pavingBlocks.add(x,.084+(hash%3)*.0015,z,1.037,.062,.725,0,pavingColours[hash%pavingColours.length]);
  }
  groundPatches.push({x0:-3.71,x1:3.71,z0:259.63,z1:369.12,height:.117});
  // 近景仍使用真实几何，栏杆、斗拱、木格窗与台阶共享城市批次。
  const rails = new Batch(UNIT_CYL, MAT.stone);
  B.rails = rails;
  for (const x of [-26, 26]) {
    for (const [index, z] of AVENUE_SHOP_Z.entries()) {
      const ry = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      addShop(x, z, 16, 11, ry, x < 0 ? ['胡饼铺', '茶坊', '绸缎庄', '书肆'][index] : ['胡姬酒肆', '香药铺', '乐器行', '珠玉行'][index], { h: 6.8 });
      // 高层临街阁楼，保持主街和横街畅通。
      if (index % 2 === 0) addHall(x, z, 11, 8, { h: 3.2, roofH: 2.1, platform: 8.3, upperStorey: true, ry, windows: true });
      for (const dz of [-5.2, 5.2]) addLantern(x + (x < 0 ? 7 : -7), 5.2, z + dz, 1.1);
      addNPC(x + (x < 0 ? 9 : -9), z + 3, { merchant: true, foreign:x<0&&index%2===0, ry:x<0?Math.PI/2:-Math.PI/2, stationary: true });
    }
  }
  // 殿前仪仗、宽阶与层层石栏，放大宫城的纵深。
  for (let i = 0; i < 18; i++) {
    const y = (18 - i) * 0.38, z = -409 + i * 0.72;
    B.stone.add(150, y / 2, z, 26, y, 1.3, 0, 0xe6d7bb);
    groundPatches.push({ x0: 137, x1: 163, z0: z - 0.65, z1: z + 0.65, height: y });
  }
  for (const side of [-1, 1]) {
    for (let z = -449; z <= -410; z += 3.2) {
      const x = 150 + side * 32;
      rails.add(x, 7.8, z, 0.35, 2.3, 0.35, 0, 0xe8dfce);
      B.stone.add(x, 7.7, z, 0.22, 0.25, 3.3, 0, 0xd9c9aa);
      B.stone.add(x, 8.55, z, 0.26, 0.22, 3.3, 0, 0xeee2c9);
    }
    for (let z = -392; z <= -365; z += 8) {
      const x = 150 + side * 24;
      B.stone.add(x, 0.5, z, 1.5, 1, 1.5, 0, 0xe7d9c2);
      B.columns.add(x, 4, z, 0.35, 7, 0.35, 0, 0xb64732); addLantern(x, 6.6, z, 1.3);
    }
  }
  // 街道灯笼增强（原 29-lanterns.js 整合于此，作为正式构建阶段之一，消除覆盖模式）
  if (B.lanternCap) {
    // 朱雀大街两侧灯笼（每隔20米一对）
    for (let z = 260; z <= 360; z += 20) {
      for (const side of [-1, 1]) {
        const x = side * 30;
        B.wood.add(x, 1.8, z, 0.12, 3.6, 0.12, 0, 0x6b4423);
        B.lanternCap.add(x, 3.8, z, 0.35, 0.5, 0.35, 0, 0xd4382c);
      }
    }
    // 西市入口灯笼
    for (let x = -310; x <= -200; x += 22) {
      for (const z of [-70, 42]) {
        B.wood.add(x, 1.5, z, 0.1, 3, 0.1, 0, 0x6b4423);
        B.lanternCap.add(x, 3.2, z, 0.3, 0.45, 0.3, 0, 0xe8b84a);
      }
    }
    // 东市入口灯笼
    for (let x = 120; x <= 220; x += 22) {
      for (const z of [-70, 42]) {
        B.wood.add(x, 1.5, z, 0.1, 3, 0.1, 0, 0x6b4423);
        B.lanternCap.add(x, 3.2, z, 0.3, 0.45, 0.3, 0, 0xe8b84a);
      }
    }
    // 曲江池沿岸灯笼
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 0.7;
      const x = 300 + Math.cos(angle) * 70;
      const z = 260 + Math.sin(angle) * 50;
      B.wood.add(x, 1.4, z, 0.1, 2.8, 0.1, 0, 0x6b4423);
      B.lanternCap.add(x, 3.0, z, 0.28, 0.4, 0.28, 0, 0xd4382c);
    }
  }
  // 通用斗拱与木格窗在 addHall 中统一生成。
}