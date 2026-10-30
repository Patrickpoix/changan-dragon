/* 西市首街验收场景。
 *
 * 这里不是旧城的缩略图，也不是把概念图贴到背景上。街道、建筑、摊铺、
 * 人物与小龙都是真实三维对象；建筑复用 content/architecture 导出的 GLB，
 * 运行时只共享几何与语义 PBR 材质。
 */
(() => {
  'use strict';

  const canvas = document.getElementById('street');
  const body = document.body;
  const isMobile = matchMedia('(pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) body.classList.add('mobile');

  const ui = {
    enter: document.getElementById('enter'),
    enterBtn: document.getElementById('enterBtn'),
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loadingText'),
    loadingBar: document.getElementById('loadingBar'),
    placeName: document.getElementById('placeName'),
    statusMeta: document.getElementById('statusMeta'),
    nearBtn: document.getElementById('nearBtn'),
    resetBtn: document.getElementById('resetBtn'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    joystick: document.getElementById('joystick'),
    stick: document.getElementById('stick'),
    toast: document.getElementById('toast'),
    modeButtons: [...document.querySelectorAll('[data-mode]')],
  };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.35 : 1.8));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc9c2a8, 40, 122);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 320);
  const clock = new THREE.Clock();
  const textureLoader = new THREE.TextureLoader();
  const tmp = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  const state = {
    ready: false,
    started: false,
    mode: 'walk',
    near: false,
    yaw: Math.PI,
    speed: 0,
    steer: 0,
    vertical: 0,
    orbitYaw: 0,
    orbitPitch: 0.12,
    distance: 7.8,
    frameCount: 0,
    time: 0,
    position: new THREE.Vector3(0, 0.03, 23),
    buildings: [],
    kitStats: null,
    lanterns: [],
    banners: [],
    people: [],
  };

  let keys = Object.create(null);
  const joystick = { active: false, pointerId: null, x: 0, y: 0 };
  const drag = { active: false, pointerId: null, x: 0, y: 0 };
  const materials = Object.create(null);
  const DRAGON_LAYER = 7;
  let dragon = null;
  let sun = null;
  let hemi = null;
  let rootWorld = null;
  let sky = null;
  let introAngle = 0;
  let toastTimer = 0;

  const STREET_Z0 = -38;
  const STREET_Z1 = 34;
  const STREET_HALF = 5.55;
  const SHOP_X = 8.5;
  const SHOP_FRONT = 5.88;

  function setProgress(value, label) {
    ui.loadingBar.style.width = Math.round(Math.max(0, Math.min(1, value)) * 100) + '%';
    if (label) ui.loadingText.textContent = label;
  }

  function toast(text, ms = 1800) {
    ui.toast.textContent = text;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), ms);
  }

  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function smoothstep(a, b, value) {
    const t = clamp((value - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function loadTexture(url, { srgb = false, repeat = [1, 1], anisotropy = 8 } = {}) {
    return new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(repeat[0], repeat[1]);
          texture.anisotropy = Math.min(anisotropy, renderer.capabilities.getMaxAnisotropy());
          if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        (error) => reject(new Error('纹理载入失败：' + url + ' (' + error + ')')),
      );
    });
  }

  async function loadPBR(name, base, normal, rough, repeat = [2, 2], color = 0xffffff) {
    const [baseMap, normalMap, roughMap] = await Promise.all([
      base ? loadTexture(base, { srgb: true, repeat }) : Promise.resolve(null),
      loadTexture(normal, { repeat }),
      loadTexture(rough, { repeat }),
    ]);
    const material = new THREE.MeshStandardMaterial({
      name,
      color,
      map: baseMap,
      normalMap,
      roughnessMap: roughMap,
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.85,
    });
    material.normalScale.set(0.62, 0.62);
    return material;
  }

  function makeMat(name, color, roughness = 0.82, metalness = 0) {
    return new THREE.MeshStandardMaterial({
      name,
      color,
      roughness,
      metalness,
      envMapIntensity: 0.8,
    });
  }

  function makePlasterTexture() {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 512;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#c9c0aa';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3400; i++) {
      const shade = Math.random() < 0.5 ? 255 : 40;
      ctx.fillStyle = `rgba(${shade},${shade - 8},${shade - 22},${Math.random() * 0.035})`;
      const size = 0.5 + Math.random() * 3.2;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, size, size);
    }
    ctx.strokeStyle = 'rgba(105,92,72,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 24;
        y += 8 + Math.random() * 18;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(cv);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 2.2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function makeRoadTexture() {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 512;
    const ctx = cv.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#9c8a6c');
    grad.addColorStop(0.5, '#a18f71');
    grad.addColorStop(1, '#938267');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4200; i++) {
      const light = Math.random() < 0.55;
      ctx.fillStyle = light
        ? `rgba(220,204,169,${0.018 + Math.random() * 0.055})`
        : `rgba(56,48,37,${0.012 + Math.random() * 0.05})`;
      const size = 0.5 + Math.random() * 2.8;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, size, size);
    }
    for (let i = 0; i < 22; i++) {
      const x = 100 + Math.random() * 312;
      ctx.strokeStyle = `rgba(72,61,45,${0.025 + Math.random() * 0.04})`;
      ctx.lineWidth = 0.6 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.bezierCurveTo(x + 15, 150, x - 12, 340, x + 8, 522);
      ctx.stroke();
    }
    // 少量碎砖/车辙边缘，让街面不是一整块均匀泥。
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(112,103,88,${0.10 + Math.random() * 0.08})`;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 5 + Math.random() * 12, 1.5 + Math.random() * 4);
    }
    const texture = new THREE.CanvasTexture(cv);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 18);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  async function buildMaterials() {
    setProgress(0.08, '辨认木、瓦、土、石');
    const root = '/assets/library/production-materials/';
    const [mud, stone, wood, darkWood, cloth, roof] = await Promise.all([
      loadPBR('street-mud', root + 'brown_mud_02/basecolor_512.png',
        root + 'brown_mud_02/normal_512.png', root + 'brown_mud_02/roughness_512.png', [7, 20], 0x8f8068),
      loadPBR('street-stone', root + 'grey_stone_path/basecolor_512.png',
        root + 'grey_stone_path/normal_512.png', root + 'grey_stone_path/roughness_512.png', [2, 8], 0xb5aa92),
      loadPBR('street-wood', root + 'fine_grained_wood/basecolor_512.png',
        root + 'fine_grained_wood/normal_512.png', root + 'fine_grained_wood/roughness_512.png', [1, 3], 0x9e7553),
      loadPBR('street-darkwood', root + 'dark_wood/basecolor_512.png',
        root + 'dark_wood/normal_512.png', root + 'dark_wood/roughness_512.png', [1, 2], 0x4f3328),
      loadPBR('street-cloth', root + 'Fabric081C/basecolor_512.png',
        root + 'Fabric081C/normal_512.png', root + 'Fabric081C/roughness_512.png', [3, 2], 0xb75b48),
      loadPBR('street-roof', null,
        '/assets/library/architecture/pbr/clay_roof_tiles_02/normal.jpg',
        '/assets/library/architecture/pbr/clay_roof_tiles_02/roughness.jpg', [6, 3], 0x6d7472),
    ]);
    mud.color.setHex(0x9a8769);
    stone.color.setHex(0xb7aa91);
    wood.color.setHex(0x9a7051);
    darkWood.color.setHex(0x4b3026);
    cloth.color.setHex(0xb4513e);
    roof.color.setHex(0x666f6e);
    cloth.side = THREE.DoubleSide;
    materials.mud = mud;
    materials.stone = stone;
    materials.wood = wood;
    materials.darkWood = darkWood;
    materials.cloth = cloth;
    materials.roof = roof;
    materials.road = mud.clone();
    materials.road.name = 'street-road';
    materials.road.color.setHex(0x9b896d);
    materials.road.map = makeRoadTexture();
    materials.road.normalMap = mud.normalMap.clone();
    materials.road.normalMap.repeat.set(4, 22);
    materials.road.normalMap.needsUpdate = true;
    materials.road.roughnessMap = mud.roughnessMap.clone();
    materials.road.roughnessMap.repeat.set(4, 22);
    materials.road.roughnessMap.needsUpdate = true;
    materials.road.normalScale.set(0.20, 0.20);
    materials.road.roughness = 0.98;
    materials.road.color.setHex(0xb19e7c);
    materials.road.normalMap.repeat.set(3, 18);
    materials.road.roughnessMap.repeat.set(3, 18);
    materials.mud.normalScale.set(0.24, 0.24);
    materials.mud.color.setHex(0x9d8c70);
    materials.roadEdge = mud.clone();
    materials.roadEdge.name = 'street-road-edge';
    materials.roadEdge.color.setHex(0x78674f);
    materials.clothBlue = cloth.clone();
    materials.clothBlue.name = 'street-cloth-blue';
    materials.clothBlue.color.setHex(0x466f73);
    materials.clothOchre = cloth.clone();
    materials.clothOchre.name = 'street-cloth-ochre';
    materials.clothOchre.color.setHex(0xb88a4f);
    const plasterNormal = await loadTexture('/assets/library/architecture/pbr/white_plaster_rough_01/normal.jpg', { repeat: [2.2, 2.2] });
    const plasterRough = await loadTexture('/assets/library/architecture/pbr/white_plaster_rough_01/roughness.jpg', { repeat: [2.2, 2.2] });
    materials.plaster = new THREE.MeshStandardMaterial({
      name: 'street-plaster',
      map: makePlasterTexture(),
      normalMap: plasterNormal,
      roughnessMap: plasterRough,
      color: 0xc9c0aa,
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.78,
    });
    materials.plaster.normalScale.set(0.20, 0.20);
    materials.redWood = wood.clone();
    materials.redWood.name = 'street-red-wood';
    materials.redWood.color.setHex(0x9f4b3d);
    materials.redWood.roughness = 0.76;
    materials.ink = makeMat('street-ink', 0x1b2b28, 0.8);
    materials.jade = new THREE.MeshPhysicalMaterial({
      name: 'dragon-jade',
      color: 0x4ca58e,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.22,
      clearcoatRoughness: 0.55,
      envMapIntensity: 0.9,
    });
    materials.jadeDark = new THREE.MeshPhysicalMaterial({
      name: 'dragon-jade-dark',
      color: 0x256d62,
      roughness: 0.44,
      metalness: 0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.65,
      envMapIntensity: 0.8,
    });
    materials.cream = makeMat('dragon-cream', 0xe3d7b7, 0.58, 0);
    materials.horn = makeMat('dragon-horn', 0xd8cfb7, 0.48, 0);
    materials.gold = makeMat('street-gold', 0xc6944b, 0.34, 0.36);
    materials.red = makeMat('street-red', 0xb74b37, 0.64, 0.02);
    materials.lantern = new THREE.MeshStandardMaterial({
      name: 'street-lantern',
      color: 0xd65a3e,
      roughness: 0.5,
      emissive: 0xc33d26,
      emissiveIntensity: 1.2,
    });
    materials.lanternGlow = new THREE.MeshBasicMaterial({
      color: 0xffa15d,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materials.eyeWhite = makeMat('dragon-eye-white', 0xf3e9d1, 0.3, 0);
    materials.eyeAmber = makeMat('dragon-eye-amber', 0xd8a349, 0.24, 0.1);
    materials.pupil = makeMat('dragon-pupil', 0x15201d, 0.24, 0);
    materials.skin = makeMat('street-skin', 0xcfa982, 0.72, 0);
    materials.hair = makeMat('street-hair', 0x27201c, 0.8, 0);
    materials.fruitRed = makeMat('fruit-red', 0xaa4a38, 0.66, 0);
    materials.fruitGold = makeMat('fruit-gold', 0xc98d3d, 0.64, 0);
    materials.fruitGreen = makeMat('fruit-green', 0x71834b, 0.7, 0);
    materials.terracotta = makeMat('terracotta', 0x9b6646, 0.88, 0);
    materials.plasterWarm = makeMat('street-plaster-warm', 0xcab995, 0.86, 0);
    materials.vermilion = makeMat('street-vermilion', 0x8f4034, 0.72, 0.02);
    materials.greenPaint = makeMat('street-green-paint', 0x365f58, 0.76, 0.01);
    materials.doorBlue = makeMat('street-door-blue', 0x344f55, 0.8, 0.02);
    materials.window = makeMat('street-window', 0x302b22, 0.72, 0);
    materials.window.emissive.setHex(0x2c1b10);
    materials.window.emissiveIntensity = 0.18;
    materials.water = new THREE.MeshPhysicalMaterial({
      color: 0x637b72,
      roughness: 0.16,
      metalness: 0,
      transparent: true,
      opacity: 0.34,
      envMapIntensity: 0.8,
      side: THREE.DoubleSide,
    });
  }

  function createSky() {
    const geometry = new THREE.SphereGeometry(240, 32, 18);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x5f8f9c) },
        horizonColor: { value: new THREE.Color(0xe6d2ac) },
        groundColor: { value: new THREE.Color(0x95876e) },
        sunDirection: { value: new THREE.Vector3(0.42, 0.52, 0.32).normalize() },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 groundColor;
        uniform vec3 sunDirection;
        varying vec3 vWorld;
        void main() {
          vec3 dir = normalize(vWorld - cameraPosition);
          float h = smoothstep(-0.15, 0.72, dir.y);
          vec3 color = mix(horizonColor, topColor, h);
          color = mix(groundColor, color, smoothstep(-0.22, 0.03, dir.y));
          float sun = pow(max(dot(dir, normalize(sunDirection)), 0.0), 220.0);
          color += vec3(1.0, 0.68, 0.34) * sun * 0.52;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    sky = new THREE.Mesh(geometry, material);
    sky.frustumCulled = false;
    scene.add(sky);
  }

  function createLights() {
    hemi = new THREE.HemisphereLight(0xbcd5d2, 0x5c4b3d, 1.08);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffebc9, 0.22);
    scene.add(ambient);
    sun = new THREE.DirectionalLight(0xffd9a2, 2.15);
    sun.position.set(18, 32, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 95;
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    sun.shadow.bias = -0.00045;
    sun.shadow.normalBias = 0.035;
    scene.add(sun);
    scene.add(sun.target);
    sun.target.position.set(0, 1.5, -4);
    if (window.ChanganRenderingAddons?.RoomEnvironment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new window.ChanganRenderingAddons.RoomEnvironment(), 0.035).texture;
      pmrem.dispose();
    }
    // 街口和街心的真实点光让灯笼与布篷之间产生局部明暗，不把全城铺平。
    for (const [x, y, z, color, intensity, distance] of [
      [-4.7, 3.1, 16.0, 0xffa45e, 1.15, 10],
      [4.7, 3.1, -2.0, 0xffb070, 1.25, 11],
      [-4.7, 3.0, -22.0, 0xff9a58, 0.85, 9],
    ]) {
      const light = new THREE.PointLight(color, intensity, distance, 2);
      light.position.set(x, y, z);
      scene.add(light);
    }
  }

  function createGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), materials.mud);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.025, -8);
    ground.receiveShadow = true;
    scene.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(11.1, 78), materials.road);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.002, -3);
    road.receiveShadow = true;
    scene.add(road);

    for (const side of [-1, 1]) {
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 78), materials.roadEdge);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(side * 6.95, 0.018, -3);
      walk.receiveShadow = true;
      scene.add(walk);
    }

    // 路缘石用实例化重复，既读出街道边界，又不为每块石头单独提交 draw call。
    const curbGeo = new THREE.BoxGeometry(0.34, 0.13, 0.62);
    const curb = new THREE.InstancedMesh(curbGeo, materials.stone, 2 * 84);
    curb.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(2 * 112 * 3), 3);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    let cursor = 0;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 84; i++) {
        const z = STREET_Z0 + 0.42 + i * 0.64;
        matrix.makeTranslation(side * STREET_HALF, 0.07, z);
        curb.setMatrixAt(cursor, matrix);
        color.setHex(i % 3 === 0 ? 0xa99b82 : i % 3 === 1 ? 0xb9ad95 : 0x978b77);
        curb.setColorAt(cursor, color);
        cursor++;
      }
    }
    curb.instanceMatrix.needsUpdate = true;
    curb.instanceColor.needsUpdate = true;
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);

    // 车辙是道路使用痕迹，不做贴图滤镜；两条细长暗面帮助读出通行方向。
    for (const x of [-1.35, 1.35]) {
      const rut = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 74),
        new THREE.MeshStandardMaterial({
          color: 0x5c4c3b,
          roughness: 1,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        }),
      );
      rut.rotation.x = -Math.PI / 2;
      rut.position.set(x, 0.021, -3);
      scene.add(rut);
    }
    // 街道横断面的排水微高差：中心略高、两侧略低，避免整条街像一块水平桌面。
    const crownGeo = new THREE.PlaneGeometry(11.1, 78, 12, 40);
    const pos = crownGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const center = 1 - Math.min(1, Math.abs(x) / 5.55);
      pos.setZ(i, center * 0.018 + Math.sin(z * 0.11) * 0.003);
    }
    crownGeo.computeVertexNormals();
    const crown = new THREE.Mesh(crownGeo, materials.road);
    crown.rotation.x = -Math.PI / 2;
    crown.position.set(0, 0.018, -3);
    crown.receiveShadow = true;
    scene.add(crown);
  }

  function createGate() {
    const gate = new THREE.Group();
    gate.name = 'west-market-gate';
    const z = -39.2;
    for (const side of [-1, 1]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.18, 4.8, 1.38), materials.stone);
      pier.position.set(side * 6.15, 2.4, z);
      pier.castShadow = pier.receiveShadow = true;
      gate.add(pier);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.34, 1.72), materials.stone);
      base.position.set(side * 6.15, 0.17, z);
      base.castShadow = base.receiveShadow = true;
      gate.add(base);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.2, 1.58), materials.stone);
      cap.position.set(side * 6.15, 4.85, z);
      cap.castShadow = cap.receiveShadow = true;
      gate.add(cap);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(13.45, 0.48, 0.58), materials.darkWood);
    lintel.position.set(0, 5.0, z);
    lintel.castShadow = lintel.receiveShadow = true;
    gate.add(lintel);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(14.1, 0.22, 0.78), materials.wood);
    beam.position.set(0, 5.28, z);
    beam.castShadow = true;
    gate.add(beam);
    const slope = 0.25;
    for (const side of [-1, 1]) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.17, 3.35), materials.roof);
      slab.position.set(0, 6.0, z + side * 1.38);
      slab.rotation.x = -side * slope;
      slab.castShadow = slab.receiveShadow = true;
      gate.add(slab);
    }
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(15.3, 0.2, 0.3), materials.roof);
    ridge.position.set(0, 6.48, z);
    ridge.castShadow = true;
    gate.add(ridge);
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.25, 0.56), materials.plaster);
      wall.position.set(side * 10.0, 1.62, z);
      wall.castShadow = wall.receiveShadow = true;
      gate.add(wall);
    }
    const sign = makeSignMesh('西市', 3.3, 0.86, { vertical: false, font: 112 });
    sign.position.set(0, 4.55, z + 0.36);
    gate.add(sign);
    scene.add(gate);
    return gate;
  }

  function createPagoda() {
    const pagoda = new THREE.Group();
    pagoda.name = 'distant-pagoda';
    pagoda.position.set(0, 0, -76);
    const stone = materials.darkWood;
    const roof = materials.roof;
    for (let i = 0; i < 5; i++) {
      const radius = 3.0 - i * 0.34;
      const h = 4.1 - i * 0.28;
      const y = 2.0 + i * 4.45;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius + 0.18, h, 10), stone);
      body.position.y = y;
      body.castShadow = body.receiveShadow = true;
      pagoda.add(body);
      const eave = new THREE.Mesh(new THREE.ConeGeometry(radius + 1.05, 1.05, 10, 1, true), roof);
      eave.position.y = y + h * 0.5 + 0.34;
      eave.rotation.y = Math.PI / 10;
      eave.castShadow = true;
      pagoda.add(eave);
      const balcony = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.34, radius + 0.34, 0.12, 10), materials.stone);
      balcony.position.y = y + h * 0.5 - 0.1;
      pagoda.add(balcony);
    }
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8), materials.gold);
    spire.position.y = 23.1;
    spire.castShadow = true;
    pagoda.add(spire);
    scene.add(pagoda);
    return pagoda;
  }

  function signTexture(text, { vertical = false, font = 72 } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = vertical ? 192 : 512;
    canvas.height = vertical ? 512 : 160;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5b3927');
    grad.addColorStop(1, '#342219');
    ctx.fillStyle = grad;
    ctx.fillRect(3, 3, w - 6, h - 6);
    ctx.strokeStyle = '#c6a15e';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#f1dfb7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (vertical) {
      ctx.font = `700 ${font}px "Ma Shan Zheng","STKaiti","KaiTi",serif`;
      [...text].forEach((ch, i, arr) => {
        ctx.fillText(ch, w / 2, h / 2 + (i - (arr.length - 1) / 2) * font * 1.08);
      });
    } else {
      ctx.font = `700 ${font}px "Ma Shan Zheng","STKaiti","KaiTi",serif`;
      ctx.fillText(text, w / 2, h / 2 + 4);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function makeSignMesh(text, width, height, opts = {}) {
    const group = new THREE.Group();
    const backing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, height + 0.12, 0.09), materials.darkWood);
    backing.castShadow = true;
    group.add(backing);
    const texture = signTexture(text, opts);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    plane.position.z = 0.052;
    group.add(plane);
    return group;
  }

  function addBuildingSigns(entry) {
    const { side, z, kind, scale } = entry;
    const isTavern = kind === 'tavern';
    const depth = isTavern ? 5.82 : 5.24;
    const frontX = side * (SHOP_X - (depth * scale) / 2 - 0.075);
    const facing = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const names = isTavern
      ? ['酒', '西市酒肆']
      : [['胡饼铺', '香药铺', '绸缎庄', '书肆', '茶坊'][Math.abs(Math.round(z)) % 5], '杂货'];
    const board = makeSignMesh(names[1], isTavern ? 2.3 : 1.8, isTavern ? 0.7 : 0.56, { font: isTavern ? 82 : 66 });
    board.position.set(frontX, isTavern ? 5.65 : 4.2, z);
    board.rotation.y = facing;
    scene.add(board);
    if (isTavern || Math.abs(z) % 14 < 1) {
      const hanging = makeSignMesh(names[0], 0.56, 1.5, { vertical: true, font: 62 });
      hanging.position.set(frontX + (side < 0 ? -0.55 : 0.55), isTavern ? 3.7 : 2.85, z + (isTavern ? 3.15 : 2.15));
      hanging.rotation.y = facing;
      scene.add(hanging);
    }
  }

  function addBuildingDetails(group, entry) {
    const isTavern = entry.kind === 'tavern';
    const halfW = isTavern ? 3.325 : 2.345;
    const halfD = isTavern ? 2.91 : 2.62;
    const sideY = isTavern ? 3.05 : 2.28;
    const windowMat = materials.window;
    const frameMat = materials.darkWood;

    function addSideWindow(side, z, y, width = 0.9, height = 0.72) {
      const local = new THREE.Matrix4().makeTranslation(side * (halfW + 0.035), y, z);
      const scale = entry.scale;
      const toWorld = new THREE.Matrix4().makeTranslation(entry.side * SHOP_X, 0, entry.z)
        .multiply(new THREE.Matrix4().makeRotationY(entry.side < 0 ? -Math.PI / 2 : Math.PI / 2))
        .multiply(new THREE.Matrix4().makeScale(scale, scale, scale));
      queueBatch('side-window', sharedGeometry.windowPane, windowMat, toWorld.clone().multiply(local));
      const frameBase = toWorld.clone().multiply(new THREE.Matrix4().makeTranslation(side * (halfW + 0.07), y, z));
      queueBatch('side-frame-h', sharedGeometry.windowFrameH, frameMat,
        frameBase.clone().multiply(new THREE.Matrix4().makeTranslation(0, height / 2, 0)));
      queueBatch('side-frame-h', sharedGeometry.windowFrameH, frameMat,
        frameBase.clone().multiply(new THREE.Matrix4().makeTranslation(0, -height / 2, 0)));
      for (const dz of [-width / 2, width / 2]) {
        queueBatch('side-frame-v', sharedGeometry.windowFrameV, frameMat,
          frameBase.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, dz)));
      }
      queueBatch('side-bar', sharedGeometry.windowBar, frameMat,
        frameBase.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0)));
    }

    for (const side of [-1, 1]) {
      addSideWindow(side, 0.82, sideY);
      if (isTavern) addSideWindow(side, -0.82, sideY);
      const beamGeo = new THREE.BoxGeometry(0.09, 0.10, 1);
      const scale = entry.scale;
      const base = new THREE.Matrix4().makeTranslation(entry.side * SHOP_X, 0, entry.z)
        .multiply(new THREE.Matrix4().makeRotationY(entry.side < 0 ? -Math.PI / 2 : Math.PI / 2))
        .multiply(new THREE.Matrix4().makeScale(scale, scale, scale));
      const beam = base.clone().multiply(
        new THREE.Matrix4().makeTranslation(side * (halfW + 0.07), isTavern ? 4.45 : 3.62, 0),
      );
      const beamWorld = beam.clone().multiply(new THREE.Matrix4().makeScale(1, 1, halfD * 1.72));
      queueBatch(isTavern ? 'tavern-beam' : 'shop-beam', beamGeo, frameMat, beamWorld);
    }
    if (!isTavern) {
      for (const x of [-1.35, 0, 1.35]) {
        const scale = entry.scale;
        const base = new THREE.Matrix4().makeTranslation(entry.side * SHOP_X, 0, entry.z)
          .multiply(new THREE.Matrix4().makeRotationY(entry.side < 0 ? -Math.PI / 2 : Math.PI / 2))
          .multiply(new THREE.Matrix4().makeScale(scale, scale, scale));
        const transom = base.clone().multiply(new THREE.Matrix4().makeTranslation(x, 4.72, -halfD - 0.035));
        queueBatch('transom', sharedGeometry.transom, windowMat, transom);
        const bar = base.clone().multiply(new THREE.Matrix4().makeTranslation(x, 4.72, -halfD - 0.07));
        queueBatch('transom-bar', sharedGeometry.transomBar, frameMat, bar);
      }
    }
  }

  function addBuilding(root, entry) {
    const group = kitInstance(root, {
      position: [entry.side * SHOP_X, 0, entry.z],
      rotationY: entry.side < 0 ? -Math.PI / 2 : Math.PI / 2,
      scale: entry.scale,
    });
    group.name = entry.kind + '-' + entry.side + '-' + entry.z;
    group.userData.entry = entry;
    const tint = [materials.redWood, materials.wood, materials.greenPaint][Math.abs(Math.round(entry.z)) % 3];
    const plasterTint = [materials.plaster, materials.plaster, materials.stone][Math.abs(Math.round(entry.z)) % 3];
    group.traverse((node) => {
      if (!node.isMesh) return;
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!material) return;
      if (/mat_vermilion|mat_timber|mat_bracket_block/i.test(material.name || '')) {
        node.material = tint;
      } else if (/mat_plaster/i.test(material.name || '')) {
        node.material = plasterTint;
      }
    });
    scene.add(group);
    addBuildingDetails(group, entry);
    state.buildings.push(entry);
    addBuildingSigns(entry);
    return group;
  }

  function addBackgroundBuilding(root, side, z, scale) {
    const group = kitInstance(root, {
      position: [side * 14.7, -0.35, z],
      rotationY: side < 0 ? -Math.PI / 2 : Math.PI / 2,
      scale,
    });
    group.traverse((node) => {
      if (!node.isMesh) return;
      node.visible = false;
    });
    return group;
  }

  async function createStreet() {
    createSky();
    createLights();
    createGround();
    createGate();
    createPagoda();
    kitInit();
    Object.assign(KitLibrary.materials, {
      mat_timber: materials.wood,
      mat_bracket_block: materials.wood,
      mat_vermilion: materials.redWood,
      mat_stone: materials.stone,
      mat_roof_tile: materials.roof,
      mat_roof_surface: materials.roof,
      mat_roof_ridge: materials.darkWood,
      mat_plaster: materials.plaster,
      mat_cloth: materials.cloth,
      mat_hair: materials.hair,
      mat_skin: materials.skin,
      mat_belt: materials.plasterWarm,
      mat_garment: materials.clothBlue,
      mat_red_cloth: materials.red,
      mat_silk: materials.clothOchre,
      mat_eye: materials.eyeWhite,
      mat_shoe: materials.hair,
    });
    state.kitStats = KitLibrary.stats;

    setProgress(0.2, '装起西市木构');
    const [shopRoot, tavernRoot, residentMale, residentFemale] = await Promise.all([
      kitLoad('shop-shijing', '/assets/kit/architecture/shop-shijing.glb'),
      kitLoad('tavern-shijing', '/assets/kit/architecture/tavern-shijing.glb'),
      kitLoad('resident-male', '/assets/kit/architecture/resident-male.glb'),
      kitLoad('resident-female', '/assets/kit/architecture/resident-female.glb'),
    ]);
    // 源 GLB 保留分件网格；首街只把真实实例放进场景，背后的屋海由远景塔与
    // 两侧连续街墙建立纵深，不再重复加载 16 个不可读的完整建筑。
    setProgress(0.54, '排布临街铺面');

    const leftZ = [-31, -24, -17, -8.8, 1.2, 8.6, 16.0, 23.4, 30.8];
    const rightZ = [-31, -24, -17, -10, -3, 4, 11, 18, 25, 32];
    const entries = [];
    leftZ.forEach((z, i) => {
      if (z === -8.8) {
        entries.push({ side: -1, z, kind: 'tavern', scale: 0.96 });
      } else {
        entries.push({ side: -1, z, kind: 'shop', scale: i % 3 === 0 ? 0.96 : i % 3 === 1 ? 1.0 : 1.04 });
      }
    });
    rightZ.forEach((z, i) => {
      entries.push({ side: 1, z, kind: 'shop', scale: i % 4 === 0 ? 0.97 : i % 3 === 0 ? 1.03 : 1.0 });
    });
    entries.forEach((entry) => addBuilding(entry.kind === 'tavern' ? tavernRoot : shopRoot, entry));
    flushBatches();

    setProgress(0.68, '摆摊、点灯、落人');
    createStreetProps();
    createPeople({ male: residentMale, female: residentFemale });
    await addStreetTrees();
    setProgress(0.88, '让小龙落到街口');
    dragon = createDragon();
    dragon.root.position.set(0, 0.03, 23);
    dragon.root.rotation.y = state.yaw;
    scene.add(dragon.root);
    setProgress(1, '街口已开');
    await new Promise((resolve) => setTimeout(resolve, 180));
    state.ready = true;
    state.kitStats = KitLibrary.stats;
    ui.loading.classList.add('hidden');
  }

  async function addStreetTrees() {
    setProgress(0.78, '种下街树与阴影');
    const loader = new window.ChanganRenderingAddons.GLTFLoader();
    const loadTree = (url) => new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(new Error('街树载入失败：' + error)),
      );
    });
    const [root, matureTree] = await Promise.all([
      loadTree('/assets/library/vegetation/studies/street-lod1.glb'),
      loadTree('/assets/library/polyhaven/tree_small_02/runtime.glb'),
    ]);
    root.updateMatrixWorld(true);
    matureTree.updateMatrixWorld(true);
    const placements = [
      [-5.0, 26.5, 0.9], [5.0, 20.5, 0.84], [-5.0, 13.0, 0.8],
      [5.0, 6.5, 0.76], [-5.0, -6.0, 0.9], [5.0, -16.0, 0.82],
      [-5.0, -27.5, 0.8],
    ];
    for (const [x, z, scale] of placements) {
      const tree = root.clone(true);
      tree.position.set(x, 0.02, z);
      tree.rotation.y = (x < 0 ? 0.7 : -0.4) + z * 0.03;
      tree.scale.setScalar(scale);
      tree.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
      });
      tree.name = 'street-tree';
      scene.add(tree);
    }
    for (const [x, z, scale, rot] of [
      [-5.45, 3.5, 1.05, 0.8], [5.35, -11.0, 1.08, -0.5], [-5.35, -20.0, 0.98, 0.3],
    ]) {
      const tree = matureTree.clone(true);
      tree.position.set(x, 0.02, z);
      tree.rotation.y = rot;
      tree.scale.setScalar(scale);
      tree.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
        const source = Array.isArray(node.material) ? node.material[0] : node.material;
        if (!source) return;
        const key = 'mature-tree-' + source.name;
        if (!materials[key]) {
          const clone = source.clone();
          clone.color?.multiplyScalar(0.88);
          materials[key] = clone;
        }
        node.material = materials[key];
      });
      tree.name = 'street-mature-tree';
      scene.add(tree);
    }
  }

  function makeCharacterMaterialSet(root) {
    const sourceMaterials = new Map();
    const recolored = [
      ['cloth', 0x526b78],
      ['silk', 0xc29561],
      ['red', 0xa75c46],
      ['skin', 0xd3a583],
      ['dark', 0x302e29],
    ];
    root.traverse((node) => {
      if (!node.isMesh) return;
      const source = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!source) return;
      const key = source.name || 'unnamed';
      if (!sourceMaterials.has(key)) {
        const material = source.clone();
        material.side = THREE.FrontSide;
        material.roughness = Math.max(0.68, material.roughness ?? 0.8);
        material.metalness = 0;
        sourceMaterials.set(key, material);
      }
      node.material = sourceMaterials.get(key);
    });
  }

  function canopyGeometry(width, depth) {
    const nx = 10;
    const nz = 5;
    const vertices = [];
    const indices = [];
    for (let iz = 0; iz <= nz; iz++) {
      const v = iz / nz;
      for (let ix = 0; ix <= nx; ix++) {
        const u = ix / nx;
        const x = (u - 0.5) * width;
        const z = (v - 0.5) * depth;
        const y = -0.07 * Math.sin(Math.PI * u) * (0.4 + v * 0.6);
        vertices.push(x, y, z);
      }
    }
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const a = iz * (nx + 1) + ix;
        const b = a + 1;
        const c = a + nx + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function jarGeometry() {
    const profile = [
      new THREE.Vector2(0.11, 0),
      new THREE.Vector2(0.18, 0.05),
      new THREE.Vector2(0.22, 0.22),
      new THREE.Vector2(0.16, 0.42),
      new THREE.Vector2(0.12, 0.47),
      new THREE.Vector2(0.14, 0.53),
      new THREE.Vector2(0.10, 0.53),
    ];
    return new THREE.LatheGeometry(profile, 18);
  }

  const JAR_GEOMETRY = jarGeometry();
  const sharedGeometry = {
    windowPane: new THREE.BoxGeometry(0.055, 0.72, 0.9),
    windowFrameH: new THREE.BoxGeometry(0.09, 0.06, 1.02),
    windowFrameV: new THREE.BoxGeometry(0.09, 0.84, 0.06),
    windowBar: new THREE.BoxGeometry(0.085, 0.035, 0.9),
    sideBeam: null,
    transom: new THREE.BoxGeometry(0.86, 0.34, 0.055),
    transomBar: new THREE.BoxGeometry(0.88, 0.045, 0.07),
  };

  const batchQueues = new Map();
  function queueBatch(key, geometry, material, matrix) {
    if (!batchQueues.has(key)) {
      batchQueues.set(key, { geometry, material, matrices: [] });
    }
    batchQueues.get(key).matrices.push(matrix.clone());
  }

  function localMatrix(x, y, z, sx = 1, sy = 1, sz = 1, rotation = null) {
    const matrix = new THREE.Matrix4();
    if (rotation) matrix.makeRotationFromEuler(rotation);
    matrix.scale(new THREE.Vector3(sx, sy, sz));
    matrix.setPosition(x, y, z);
    return matrix;
  }

  function flushBatches() {
    for (const [key, batch] of batchQueues) {
      if (!batch.matrices.length) continue;
      const mesh = new THREE.InstancedMesh(batch.geometry, batch.material, batch.matrices.length);
      batch.matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.name = 'batch-' + key;
      scene.add(mesh);
    }
    batchQueues.clear();
  }

  function makeBasket(radius = 0.2, height = 0.18) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.82, height, 16), materials.wood);
    body.position.y = height / 2;
    body.castShadow = body.receiveShadow = true;
    group.add(body);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 5, 18), materials.darkWood);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = height;
    group.add(rim);
    return group;
  }

  function addProduce(group, radius, height) {
    const colors = [materials.fruitRed, materials.fruitGold, materials.fruitGreen];
    for (let i = 0; i < 7; i++) {
      const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), colors[i % colors.length]);
      const angle = i * 2.4;
      fruit.position.set(Math.cos(angle) * radius * 1.2, height + radius * 0.7, Math.sin(angle) * radius * 0.8);
      fruit.scale.set(1, 0.8, 1);
      fruit.castShadow = true;
      group.add(fruit);
    }
  }

  function createStall(x, z, side, clothMaterial) {
    const group = new THREE.Group();
    group.name = 'stall-' + side + '-' + z;
    group.position.set(x, 0.03, z);
    const width = 2.35;
    const depth = 1.25;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.075, 2.35, 0.075), materials.darkWood);
        post.position.set(sx * width * 0.47, 1.18, sz * depth * 0.42);
        post.castShadow = true;
        group.add(post);
      }
    }
    const canopy = new THREE.Mesh(canopyGeometry(width, depth), clothMaterial);
    canopy.position.y = 2.3;
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);
    const valance = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.92, 0.22), clothMaterial);
    valance.position.set(0, 2.18, -depth * 0.48);
    valance.rotation.x = Math.PI * 0.08;
    group.add(valance);
    const table = new THREE.Mesh(new THREE.BoxGeometry(width * 0.84, 0.09, depth * 0.66), materials.wood);
    table.position.set(0, 0.82, 0.05);
    table.castShadow = table.receiveShadow = true;
    group.add(table);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.08), materials.darkWood);
      leg.position.set(sx * width * 0.32, 0.4, 0.05);
      group.add(leg);
    }
    const basket = makeBasket(0.18, 0.16);
    basket.position.set(-0.52, 0.87, 0.02);
    group.add(basket);
    addProduce(basket, 0.055, 0.15);
    for (const [jx, jz, scale] of [[0.2, 0.02, 0.9], [0.48, -0.12, 0.72]]) {
      const jar = new THREE.Mesh(JAR_GEOMETRY, materials.terracotta);
      jar.scale.setScalar(scale);
      jar.position.set(jx, 0.86, jz);
      jar.castShadow = true;
      group.add(jar);
    }
    const stack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.32), materials.wood);
    stack.position.set(0.76, 0.97, -0.08);
    stack.castShadow = true;
    group.add(stack);
    for (const [bx, by, bz, bScale] of [
      [-0.78, 1.03, 0.25, 0.18], [-0.66, 0.99, 0.05, 0.14], [0.15, 0.99, 0.26, 0.13],
    ]) {
      const bowl = new THREE.Mesh(JAR_GEOMETRY, materials.plasterWarm || materials.cream);
      bowl.scale.setScalar(bScale);
      bowl.position.set(bx, by, bz);
      bowl.castShadow = true;
      group.add(bowl);
    }
    group.rotation.y = side < 0 ? -0.12 : 0.12;
    scene.add(group);
    return group;
  }

  function createLanternPost(x, z, side, lit = false) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 2.75, 8), materials.darkWood);
    post.position.y = 1.38;
    post.castShadow = true;
    group.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.06), materials.darkWood);
    arm.position.set(side * -0.32, 2.62, 0);
    group.add(arm);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), materials.lantern);
    lantern.scale.set(1, 0.78, 1);
    lantern.position.set(side * -0.62, 2.3, 0);
    lantern.castShadow = true;
    group.add(lantern);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.055, 10), materials.darkWood);
    cap.position.set(side * -0.62, 2.44, 0);
    group.add(cap);
    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 6), materials.red);
    tassel.position.set(side * -0.62, 2.04, 0);
    group.add(tassel);
    if (lit) {
      const light = new THREE.PointLight(0xff9a5b, 0.7, 6, 2);
      light.position.set(side * -0.62, 2.25, 0);
      group.add(light);
    }
    group.userData.lantern = lantern;
    group.userData.phase = z * 0.37;
    state.lanterns.push(group);
    scene.add(group);
    return group;
  }

  function createHangingBanner(text, x, y, z, rotation, material) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotation;
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.8, 0.055), materials.darkWood);
    pole.position.y = -0.65;
    pole.castShadow = true;
    group.add(pole);
    const texture = signTexture(text, { vertical: true, font: 58 });
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 1.45, 6, 12),
      new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        alphaTest: 0.06,
        side: THREE.DoubleSide,
        roughness: 0.9,
      }),
    );
    plane.position.set(0, 0.05, 0.05);
    const pos = plane.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + 0.3) / 0.6;
      const v = (pos.getY(i) + 0.725) / 1.45;
      pos.setZ(i, Math.sin(u * Math.PI * 1.5 + v * 2.2) * 0.045);
    }
    plane.geometry.computeVertexNormals();
    plane.castShadow = true;
    group.add(plane);
    group.userData.plane = plane;
    group.userData.phase = z * 0.2;
    state.banners.push(group);
    scene.add(group);
    return group;
  }

  function createStreetProps() {
    createStall(-3.65, 10.0, -1, materials.clothOchre);
    createStall(3.65, 2.0, 1, materials.clothBlue);
    createStall(-3.65, -15.0, -1, materials.cloth);
    createStall(3.65, -25.0, 1, materials.clothOchre);
    for (const [side, z, lit] of [
      [-1, 27, false], [-1, 17, false], [-1, 7, true], [-1, -3, false],
      [-1, -13, false], [-1, -23, false], [-1, -33, false],
      [1, 27, false], [1, 17, false], [1, 7, true], [1, -3, false],
      [1, -13, false], [1, -23, false], [1, -33, false],
    ]) {
      createLanternPost(side * 5.02, z, side, lit);
    }
    for (const [text, side, z, y] of [
      ['酒', -1, -7.1, 5.2], ['绸', -1, 4.5, 4.4], ['饼', 1, 14.2, 4.2],
      ['香', 1, -7.2, 4.2], ['茶', 1, -20.0, 4.2],
    ]) {
      createHangingBanner(text, side * 5.02, y, z, side < 0 ? Math.PI / 2 : -Math.PI / 2, materials.cloth);
    }
    for (const [x, z, sx, sz, rot] of [
      [1.75, -1.8, 2.7, 0.9, -0.1],
      [-2.15, 13.8, 1.5, 0.55, 0.12],
      [2.2, 22.5, 1.2, 0.45, -0.05],
    ]) {
      const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), materials.water);
      puddle.rotation.x = -Math.PI / 2;
      puddle.rotation.z = rot;
      puddle.scale.set(sx, sz, 1);
      puddle.position.set(x, 0.028, z);
      puddle.receiveShadow = true;
      scene.add(puddle);
    }
    // 地衣、散落菜叶与木屑提供近景尺度线索，不能只靠重复摊位。
    const leafGeo = new THREE.CircleGeometry(0.045, 5);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x73865a, roughness: 0.9, side: THREE.DoubleSide });
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, 180);
    const leafMatrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    for (let i = 0; i < 180; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (4.6 + Math.random() * 2.0);
      const z = STREET_Z0 + Math.random() * (STREET_Z1 - STREET_Z0);
      euler.set(-Math.PI / 2, Math.random() * Math.PI, 0);
      quat.setFromEuler(euler);
      leafMatrix.compose(
        new THREE.Vector3(x, 0.033 + Math.random() * 0.004, z),
        quat,
        new THREE.Vector3(0.5 + Math.random(), 0.5 + Math.random(), 1),
      );
      leaves.setMatrixAt(i, leafMatrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
    leaves.receiveShadow = true;
    scene.add(leaves);
    for (const [side, z] of [[-1, 22.0], [1, 17.8], [-1, -28.0], [1, -31.5]]) {
      const crate = new THREE.Group();
      crate.position.set(side * 4.55, 0.03, z);
      for (let i = 0; i < 3; i++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.52), materials.wood);
        box.position.set((i % 2) * 0.16, 0.22 + i * 0.34, (i % 2) * 0.08);
        box.rotation.y = i * 0.08;
        box.castShadow = box.receiveShadow = true;
        crate.add(box);
      }
      scene.add(crate);
    }
  }

  function makeRobeFigure({ robe = 0x8c5e48, female = false, guard = false, scale = 1 } = {}) {
    const group = new THREE.Group();
    const robeMat = makeMat('person-robe-' + robe, robe, 0.94);
    const profile = female
      ? [[0, 0], [0.23, 0.02], [0.28, 0.2], [0.26, 0.55], [0.23, 0.92], [0.28, 1.14], [0.19, 1.35], [0.10, 1.43]]
      : [[0, 0], [0.20, 0.02], [0.24, 0.18], [0.23, 0.55], [0.21, 0.92], [0.25, 1.15], [0.18, 1.35], [0.09, 1.43]];
    const robeMesh = new THREE.Mesh(
      new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 24),
      robeMat,
    );
    robeMesh.position.y = 0.06;
    // 袍身不是绝对旋转体：肩宽、腰收和衣摆要在同一网格里变化。
    const rp = robeMesh.geometry.attributes.position;
    for (let i = 0; i < rp.count; i++) {
      const x = rp.getX(i);
      const y = rp.getY(i);
      const z = rp.getZ(i);
      const shoulder = smoothstep(1.08, 1.36, y);
      const waist = Math.exp(-Math.pow((y - 0.88) / 0.18, 2));
      const hem = smoothstep(0.55, 0.03, y);
      const scaleX = 1 + shoulder * 0.20 - waist * 0.10 + hem * 0.12;
      const scaleZ = 1 - shoulder * 0.04 + hem * 0.08;
      rp.setXYZ(i, x * scaleX, y, z * scaleZ);
    }
    robeMesh.geometry.computeVertexNormals();
    robeMesh.castShadow = robeMesh.receiveShadow = true;
    group.add(robeMesh);
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.25, 0.10, 24, 1, true), robeMat);
    yoke.position.y = 1.33;
    yoke.castShadow = true;
    group.add(yoke);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.015, 5, 18), materials.cream);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.40;
    group.add(collar);
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.035), materials.darkWood);
    lapel.position.set(0, 1.14, 0.175);
    lapel.rotation.z = -0.18;
    group.add(lapel);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.255 : 0.225, female ? 0.255 : 0.225, 0.07, 24, 1, true), materials.darkWood);
    belt.position.y = 0.91;
    group.add(belt);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 14), materials.skin);
    head.scale.set(0.94, 1.06, 0.94);
    head.position.y = 1.53;
    head.castShadow = true;
    group.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), materials.hair);
    hair.scale.set(1.02, 0.72, 1.02);
    hair.position.set(0, 1.60, -0.012);
    hair.castShadow = true;
    group.add(hair);
    const faceFringe = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 10), materials.hair);
    faceFringe.scale.set(1.0, 0.45, 0.78);
    faceFringe.position.set(0, 1.66, 0.055);
    group.add(faceFringe);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(female ? 0.12 : 0.09, 12, 10), materials.hair);
    bun.position.set(0, female ? 1.73 : 1.69, -0.06);
    group.add(bun);
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), materials.eyeWhite);
      eyeWhite.scale.set(1.1, 0.72, 0.6);
      eyeWhite.position.set(side * 0.052, 1.56, 0.146);
      group.add(eyeWhite);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), materials.pupil);
      eye.position.set(side * 0.054, 1.56, 0.166);
      group.add(eye);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), materials.skin);
      ear.position.set(side * 0.15, 1.52, 0);
      group.add(ear);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.115, 0.44, 9), robeMat);
      sleeve.position.set(side * 0.285, 1.18, 0.015);
      sleeve.rotation.z = side * 0.42;
      sleeve.castShadow = true;
      group.add(sleeve);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), materials.skin);
      hand.position.set(side * 0.37, 0.99, 0.035);
      group.add(hand);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.055, 0.22), materials.hair);
      foot.position.set(side * 0.09, 0.035, 0.08);
      group.add(foot);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), robeMat);
      shoulder.scale.set(1.0, 0.72, 0.9);
      shoulder.position.set(side * 0.22, 1.32, 0.01);
      shoulder.castShadow = true;
      group.add(shoulder);
    }
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.07, 6), materials.skin);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 1.50, 0.165);
    group.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.012), materials.hair);
    mouth.position.set(0, 1.47, 0.155);
    group.add(mouth);
    if (guard) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.10, 12), materials.darkWood);
      cap.position.y = 1.72;
      group.add(cap);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.8, 6), materials.darkWood);
      pole.position.set(0.36, 0.95, 0);
      pole.rotation.z = -0.12;
      group.add(pole);
    }
    if (female) {
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 18), materials.cloth);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 1.38;
      group.add(scarf);
    }
    group.scale.setScalar(scale);
    group.userData.phase = Math.random() * Math.PI * 2;
    group.userData.isPerson = true;
    scene.add(group);
    return group;
  }

  function createPeople(characterRoots = {}) {
    const people = [
      [-4.35, 9.0, 0.1, { robe: 0x8d5a45, female: false, scale: 1.0 }],
      [4.45, 3.0, -0.25, { robe: 0x596e70, female: true, scale: 0.94 }],
      [-4.15, -14.0, 0.2, { robe: 0xa16b47, female: false, scale: 1.03 }],
      [4.4, -24.0, -0.1, { robe: 0x76634c, female: false, scale: 0.96 }],
      [-2.5, 14.0, 0.45, { robe: 0x7d5042, female: true, scale: 0.9 }],
      [2.65, -3.0, -0.6, { robe: 0x465b55, female: false, guard: true, scale: 1.02 }],
      [4.1, 17.5, 2.9, { robe: 0x8a6647, female: false, scale: 0.98 }],
      [-1.7, -30.0, -2.8, { robe: 0x6f6252, female: false, scale: 0.94 }],
      [3.9, -33.0, -1.4, { robe: 0x4e5c5c, female: false, guard: true, scale: 1.0 }],
      [-3.6, 27.5, 2.3, { robe: 0x9b7355, female: true, scale: 0.86 }],
    ];
    for (const [x, z, ry, options] of people) {
      const source = options.female ? characterRoots.female : characterRoots.male;
      let person;
      if (source) {
        person = kitInstance(source, {
          position: [x, 0.03, z],
          rotationY: ry,
          scale: options.scale,
        });
        person.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = true;
          node.receiveShadow = true;
        });
        person.userData.isPerson = true;
        person.userData.phase = Math.random() * Math.PI * 2;
        person.userData.baseY = 0.03;
        // 共享 GLB 的人物材质仍保留原始皮肤/织物色，不能把整身都染成粉色。
        person.userData.sharedCharacter = true;
        scene.add(person);
      } else {
        person = makeRobeFigure(options);
        person.position.set(x, 0.03, z);
        person.rotation.y = ry;
        person.userData.baseY = person.position.y;
      }
    }
    state.people = scene.children.filter((o) => o.userData.isPerson);
  }

  function createTaperedTube(points, radii, material, segments = 32, radial = 12) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const frames = curve.computeFrenetFrames(segments, false);
    const vertices = [];
    const indices = [];
    const uvs = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const next = Math.min(radii.length - 1, Math.max(0, t * (radii.length - 1)));
      const low = Math.floor(next);
      const high = Math.min(radii.length - 1, low + 1);
      const radius = THREE.MathUtils.lerp(radii[low], radii[high], next - low);
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];
      for (let j = 0; j <= radial; j++) {
        const angle = (j / radial) * Math.PI * 2;
        const vertex = point.clone()
          .addScaledVector(normal, Math.cos(angle) * radius)
          .addScaledVector(binormal, Math.sin(angle) * radius);
        vertices.push(vertex.x, vertex.y, vertex.z);
        uvs.push(t, j / radial);
        if (i < segments && j < radial) {
          const a = i * (radial + 1) + j;
          const b = a + 1;
          const c = a + radial + 1;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, curve };
  }

  function createRibbon(points, width, material) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const segments = 16;
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const w = width * (1 - t * 0.55);
      vertices.push(
        p.x - side.x * w, p.y - side.y * w, p.z - side.z * w,
        p.x + side.x * w, p.y + side.y * w, p.z + side.z * w,
      );
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    mesh.castShadow = true;
    return mesh;
  }

  function createDragonLeg(side, z, front) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.24, 0.75, z);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.086, 0.16, 4, 8), materials.jade);
    upper.position.y = -0.12;
    upper.castShadow = true;
    pivot.add(upper);
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.15, 4, 8), materials.jadeDark);
    lower.position.set(0, -0.35, 0.035);
    lower.rotation.x = -0.12;
    lower.castShadow = true;
    pivot.add(lower);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 8), materials.jadeDark);
    foot.scale.set(1.12, 0.38, 1.32);
    foot.position.set(0, -0.49, 0.10);
    foot.castShadow = true;
    pivot.add(foot);
    for (const x of [-0.055, 0, 0.055]) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 6), materials.horn);
      claw.rotation.x = Math.PI / 2;
      claw.position.set(x, -0.51, 0.22);
      pivot.add(claw);
    }
    pivot.userData.front = front;
    pivot.userData.side = side;
    return pivot;
  }

  function createDragonHeadMesh() {
    const geometry = new THREE.SphereGeometry(1, 44, 30);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const colors = new Float32Array(position.count * 3);
    const jade = new THREE.Color(0x4ca58e);
    const cream = new THREE.Color(0xe3d7b7);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const baseU = uv.getX(i);
      const baseV = uv.getY(i);
      const front = smoothstep(-0.1, 0.9, z);
      const upper = smoothstep(-0.35, 0.4, y);
      // 颅骨横向略窄、纵向略高，鼻吻只占前段，不再像一个整球。
      let px = x * 0.285 * (1 - front * 0.16);
      let py = y * 0.235;
      let pz = z * 0.295 + front * front * 0.06;
      const brow = Math.exp(-Math.pow((y - 0.12) / 0.13, 2)) * Math.exp(-Math.pow(x / 0.30, 2));
      const muzzle = Math.exp(-Math.pow((y + 0.05) / 0.14, 2)) * Math.exp(-Math.pow(x / 0.22, 2));
      const cheek = Math.exp(-Math.pow((y + 0.01) / 0.12, 2)) * Math.exp(-Math.pow((Math.abs(x) - 0.23) / 0.10, 2));
      const chin = Math.exp(-Math.pow((y + 0.21) / 0.10, 2)) * Math.exp(-Math.pow(x / 0.24, 2));
      px *= 1 + cheek * 0.16 * smoothstep(0.0, 0.9, z);
      py += brow * 0.055 * smoothstep(0.1, 0.95, z);
      pz += muzzle * 0.070 * smoothstep(0.1, 1.0, z);
      pz -= chin * 0.015 * smoothstep(0.2, 1.0, z);
      if (y < -0.12 && z > 0.2) py -= smoothstep(0.1, 0.95, z) * 0.035;
      position.setXYZ(i, px, py, pz);
      const creamMix = smoothstep(0.2, 0.9, z) * (1 - upper * 0.9);
      color.copy(jade).lerp(cream, creamMix * 0.82);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      uv.setXY(i, baseU * 1.35, baseV * 1.25);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      name: 'dragon-head-blended',
      vertexColors: true,
      roughness: 0.47,
      metalness: 0,
      envMapIntensity: 0.7,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(DRAGON_LAYER);
    return mesh;
  }

  function createDragon() {
    const root = new THREE.Group();
    root.name = 'player-dragon';
    root.scale.setScalar(0.78);
    const visual = new THREE.Group();
    root.add(visual);

    const bodyPoints = [
      new THREE.Vector3(0, 0.70, -0.54),
      new THREE.Vector3(0, 0.80, -0.25),
      new THREE.Vector3(0, 0.92, 0.03),
      new THREE.Vector3(0, 1.02, 0.28),
      new THREE.Vector3(0, 1.12, 0.50),
      new THREE.Vector3(0, 1.25, 0.69),
    ];
    const bodyRadii = [0.20, 0.30, 0.37, 0.36, 0.28, 0.18];
    const body = createTaperedTube(bodyPoints, bodyRadii, materials.jade, 36, 14);
    visual.add(body.mesh);
    const bodyCurve = body.curve;
    // 沿背部补一条连续鬃脊：不是零散尖刺，而是有主次的曲面层。
    for (let i = 0; i < 9; i++) {
      const t = 0.06 + i * 0.09;
      const p = bodyCurve.getPointAt(t);
      const radius = THREE.MathUtils.lerp(bodyRadii[0], bodyRadii[bodyRadii.length - 1], t);
      const crest = new THREE.Mesh(
        new THREE.ConeGeometry(0.055 + (1 - t) * 0.018, 0.14 + (1 - t) * 0.08, 6),
        i % 2 ? materials.jadeDark : materials.cream,
      );
      crest.position.set(0, p.y + radius * 0.90, p.z - 0.015);
      crest.rotation.x = -0.42;
      crest.castShadow = true;
      visual.add(crest);
    }

    // 腹甲用一组压扁的暖色甲片，贴着连续躯干，不用另一套球体拼贴。
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.12;
      const p = bodyCurve.getPointAt(t);
      const radius = THREE.MathUtils.lerp(bodyRadii[0], bodyRadii[bodyRadii.length - 1], t);
      const plate = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), materials.cream);
      plate.scale.set(1.05, 0.32, 1.32);
      plate.position.set(0, p.y - radius * 0.68, p.z + 0.015);
      plate.castShadow = true;
      visual.add(plate);
    }
    const head = new THREE.Group();
    head.position.set(0, 1.37, 0.87);
    visual.add(head);
    const eyelids = [];
    const headMesh = createDragonHeadMesh();
    head.add(headMesh);
    const neck = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.19, 0.16, 6, 12),
      materials.jade,
    );
    neck.rotation.x = Math.PI * 0.34;
    neck.position.set(0, -0.17, -0.08);
    neck.castShadow = true;
    head.add(neck);
    // 额心鳞甲与鼻梁隆起给正脸一个视觉中心，避免双眼之间一片平。
    const foreheadScale = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 6), materials.cream);
    foreheadScale.position.set(0, 0.255, 0.20);
    foreheadScale.rotation.x = -0.55;
    head.add(foreheadScale);
    const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.16, 4, 8), materials.jade);
    noseBridge.rotation.x = Math.PI / 2;
    noseBridge.position.set(0, 0.08, 0.33);
    head.add(noseBridge);
    // 颊鬃沿头部外缘做有厚度的叶片，正面看到蓬松轮廓，侧面也有体积。
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const tuft = new THREE.Mesh(
          new THREE.ConeGeometry(0.045 + (1 - t) * 0.014, 0.14 + (1 - t) * 0.06, 6),
          i % 2 ? materials.cream : materials.jadeDark,
        );
        tuft.scale.set(0.8, 1, 0.8);
        tuft.position.set(
          side * (0.235 + t * 0.055),
          0.13 - t * 0.26,
          0.06 + t * 0.055,
        );
        tuft.rotation.z = side * -(0.80 + t * 0.14);
        tuft.castShadow = true;
        head.add(tuft);
      }
      for (let i = 0; i < 3; i++) {
        const browTuft = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 6),
          i % 2 ? materials.cream : materials.jadeDark,
        );
        browTuft.scale.set(1.15, 0.38, 0.70);
        browTuft.position.set(side * (0.10 + i * 0.06), 0.22 - i * 0.03, 0.18 + i * 0.02);
        browTuft.rotation.z = side * -0.52;
        head.add(browTuft);
      }
    }
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.094, 20, 14), materials.eyeWhite);
      eye.scale.set(1.02, 1.08, 0.78);
      eye.position.set(side * 0.128, 0.062, 0.277);
      head.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.054, 16, 12), materials.eyeAmber);
      iris.scale.set(1.0, 1.06, 0.78);
      iris.position.set(side * 0.137, 0.062, 0.336);
      head.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.031, 12, 10), materials.pupil);
      pupil.scale.set(0.88, 1.06, 0.82);
      pupil.position.set(side * 0.138, 0.060, 0.366);
      head.add(pupil);
      const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), materials.eyeWhite);
      catchlight.position.set(side * 0.132, 0.078, 0.388);
      head.add(catchlight);
      // 上眼睑压在眼球上，眼窝由头部体积包住，避免外挂球眼。
      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(0.134, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.40),
        materials.jade,
      );
      lid.scale.set(1.03, 0.82, 0.9);
      lid.position.set(side * 0.128, 0.101, 0.277);
      lid.rotation.x = -0.08;
      head.add(lid);
      eyelids.push(lid);
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.10, 4, 8), materials.jadeDark);
      brow.rotation.z = side * 1.10;
      brow.rotation.x = -0.25;
      brow.position.set(side * 0.128, 0.168, 0.210);
      head.add(brow);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), materials.jadeDark);
      ear.scale.set(1.2, 0.62, 0.42);
      ear.position.set(side * 0.29, 0.15, 0.015);
      ear.rotation.z = side * -0.55;
      head.add(ear);
      const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), materials.cream);
      earInner.scale.set(1.05, 0.45, 0.26);
      earInner.position.set(side * 0.285, 0.145, 0.045);
      earInner.rotation.z = side * -0.55;
      head.add(earInner);
      const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), materials.pupil);
      nostril.position.set(side * 0.060, -0.035, 0.530);
      head.add(nostril);
      const hornPoints = [
        new THREE.Vector3(side * 0.14, 0.21, -0.03),
        new THREE.Vector3(side * 0.18, 0.36, -0.10),
        new THREE.Vector3(side * 0.19, 0.50, -0.23),
        new THREE.Vector3(side * 0.13, 0.58, -0.31),
        new THREE.Vector3(side * 0.06, 0.59, -0.35),
      ];
      const horn = createTaperedTube(hornPoints, [0.056, 0.045, 0.033, 0.020, 0.008], materials.horn, 22, 8);
      horn.mesh.castShadow = true;
      head.add(horn.mesh);
      const fork = createTaperedTube([
        new THREE.Vector3(side * 0.16, 0.44, -0.17),
        new THREE.Vector3(side * 0.26, 0.49, -0.22),
        new THREE.Vector3(side * 0.30, 0.53, -0.27),
      ], [0.025, 0.017, 0.006], materials.horn, 10, 6);
      head.add(fork.mesh);
      const whiskerPoints = [
        new THREE.Vector3(side * 0.10, -0.09, 0.44),
        new THREE.Vector3(side * 0.21, -0.11, 0.50),
        new THREE.Vector3(side * 0.30, -0.07, 0.43),
      ];
      const whisker = createTaperedTube(whiskerPoints, [0.009, 0.006, 0.002], materials.horn, 10, 5);
      head.add(whisker.mesh);
    }
    const mouthCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.085, -0.135, 0.425),
      new THREE.Vector3(0, -0.158, 0.458),
      new THREE.Vector3(0.085, -0.135, 0.425),
    ]);
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 10, 0.007, 5, false), materials.pupil);
    head.add(mouth);
    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), materials.cream);
    lowerLip.scale.set(0.90, 0.42, 0.78);
    lowerLip.position.set(0, -0.155, 0.350);
    lowerLip.rotation.x = 0.2;
    head.add(lowerLip);
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 10), materials.cream);
    noseTip.scale.set(1.2, 0.52, 0.68);
    noseTip.position.set(0, 0.010, 0.474);
    noseTip.castShadow = true;
    head.add(noseTip);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.060, 0.18, 5), materials.jadeDark);
      fin.position.set(0, 0.19 - i * 0.055, -0.14 - i * 0.10);
      fin.rotation.x = -0.55;
      head.add(fin);
    }

    const legs = [
      createDragonLeg(-1, 0.30, true),
      createDragonLeg(1, 0.30, true),
      createDragonLeg(-1, -0.31, false),
      createDragonLeg(1, -0.31, false),
    ];
    legs.forEach((leg) => visual.add(leg));

    const tail = new THREE.Group();
    tail.position.set(0, 0.72, -0.55);
    const tailTube = createTaperedTube(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.01, -0.30),
        new THREE.Vector3(0, 0.10, -0.68),
        new THREE.Vector3(0, 0.21, -1.04),
        new THREE.Vector3(0, 0.29, -1.27),
      ],
      [0.18, 0.15, 0.10, 0.045, 0.012],
      materials.jade,
      24,
      10,
    );
    tail.add(tailTube.mesh);
    const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 5), materials.jadeDark);
    tailFin.rotation.x = Math.PI / 2;
    tailFin.position.set(0, 0.30, -1.34);
    tail.add(tailFin);
    for (let i = 0; i < 7; i++) {
      const t = 0.15 + i * 0.10;
      const p = tailTube.curve.getPointAt(t);
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06 + t * 0.02, 0.16 + t * 0.08, 5), materials.cream);
      fin.position.set(0, p.y + 0.12, p.z - 0.02);
      fin.rotation.x = -0.55;
      tail.add(fin);
    }
    visual.add(tail);

    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.045, 8, 24), materials.red);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.set(0, 1.18, 0.50);
    scarf.castShadow = true;
    visual.add(scarf);
    const ribbonA = createRibbon(
      [
        new THREE.Vector3(0.07, 1.15, 0.38),
        new THREE.Vector3(0.17, 1.10, 0.10),
        new THREE.Vector3(0.27, 1.00, -0.25),
        new THREE.Vector3(0.30, 0.86, -0.56),
      ],
      0.08,
      materials.red,
    );
    const ribbonB = createRibbon(
      [
        new THREE.Vector3(-0.05, 1.14, 0.36),
        new THREE.Vector3(-0.16, 1.06, 0.08),
        new THREE.Vector3(-0.28, 0.95, -0.30),
        new THREE.Vector3(-0.34, 0.80, -0.60),
      ],
      0.065,
      materials.red,
    );
    visual.add(ribbonA, ribbonB);

    const stateMotion = { bob: 0, blink: 0 };
    function update(dt, time, speed, mode, steer) {
      const moving = Math.min(1, Math.abs(speed) / 2.8);
      stateMotion.bob += dt * (mode === 'fly' ? 2.2 : 5.0 + moving * 3.0);
      const bob = mode === 'fly' ? Math.sin(stateMotion.bob) * 0.06 : Math.sin(stateMotion.bob * 2) * 0.025 * moving;
      visual.position.y = bob;
      visual.rotation.x = damp(visual.rotation.x, mode === 'fly' ? -0.20 : 0, 5, dt);
      visual.rotation.z = damp(visual.rotation.z, steer * (mode === 'fly' ? 0.12 : 0.06), 5, dt);
      head.rotation.y = Math.sin(time * 0.8) * 0.06 + steer * 0.08;
      head.rotation.x = mode === 'fly' ? -0.08 : Math.sin(time * 0.55) * 0.025;
      tail.rotation.y = Math.sin(time * 2.0) * 0.13 + steer * 0.22;
      tail.rotation.x = Math.sin(time * 1.2) * 0.04;
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        const phase = (i < 2 ? 0 : Math.PI) + (i % 2) * Math.PI;
        const swing = mode === 'fly' ? -0.95 : Math.sin(stateMotion.bob + phase) * 0.42 * moving;
        leg.rotation.x = damp(leg.rotation.x, swing, 8, dt);
        leg.rotation.z = mode === 'fly' ? (leg.userData.side * 0.35) : 0;
      }
      ribbonA.rotation.y = Math.sin(time * 2.3) * 0.11;
      ribbonB.rotation.y = Math.sin(time * 2.0 + 1.3) * 0.10;
      scarf.rotation.z = Math.sin(time * 1.8) * 0.035;
      stateMotion.blink += dt;
      if (stateMotion.blink > 4.4) stateMotion.blink = 0;
      const blink = stateMotion.blink > 4.22 ? 0.12 : 1;
      eyelids.forEach((lid) => { lid.scale.y = 0.72 * blink; });
    }
    root.traverse((node) => {
      node.layers.set(DRAGON_LAYER);
    });
    visual.userData.head = head;
    visual.userData.tail = tail;
    visual.userData.eyelids = eyelids;
    visual.userData.body = body.mesh;
    return {
      root,
      visual,
      head,
      legs,
      tail,
      update,
      headWorld: new THREE.Vector3(),
    };
  }

  function setMode(mode) {
    if (!['walk', 'fly'].includes(mode) || state.mode === mode) return;
    state.mode = mode;
    state.speed = 0;
    state.steer = 0;
    body.classList.toggle('flight', mode === 'fly');
    ui.modeButtons.forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (mode === 'walk') {
      state.position.y = 0.03;
      state.near = false;
      ui.nearBtn.textContent = '近看小龙';
      toast('落地 · 街市就在眼前');
    } else {
      state.position.y = Math.max(1.35, state.position.y);
      toast('乘风而起 · Q / E 或右侧按钮升降');
    }
  }

  function resetStreet() {
    state.position.set(0, 0.03, 23);
    state.yaw = Math.PI;
    state.speed = 0;
    state.steer = 0;
    state.vertical = 0;
    state.near = false;
    body.classList.remove('near');
    state.orbitYaw = 0;
    state.orbitPitch = 0.12;
    state.distance = 7.8;
    body.classList.remove('flight');
    ui.nearBtn.textContent = '近看小龙';
    if (state.mode !== 'walk') {
      state.mode = 'walk';
      ui.modeButtons.forEach((button) => {
        const active = button.dataset.mode === 'walk';
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    if (dragon) {
      dragon.root.position.copy(state.position);
      dragon.root.rotation.y = state.yaw;
    }
    toast('已回街口');
  }

  function toggleNear() {
    state.near = !state.near;
    ui.nearBtn.textContent = state.near ? '回到街中' : '近看小龙';
    if (state.near) {
      body.classList.add('near');
      state.orbitYaw = 0.55;
      state.orbitPitch = 0.04;
      updateCamera(0.016, true);
      toast('近看小龙 · 拖动环视');
    } else {
      body.classList.remove('near');
      toast('回到街中');
    }
  }

  function bindEvents() {
    ui.enterBtn.addEventListener('click', () => {
      state.started = true;
      body.classList.add('entered');
      // 软件 WebGL 下单帧可能较长，不把入场完成依赖在 CSS 过渡的帧率上。
      setTimeout(() => {
        ui.enter.style.display = 'none';
      }, 80);
      state.orbitYaw = 0;
      state.orbitPitch = 0.12;
      state.distance = 7.8;
      updateCamera(0.016, true);
    });
    ui.modeButtons.forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    ui.nearBtn.addEventListener('click', toggleNear);
    ui.resetBtn.addEventListener('click', resetStreet);
    for (const [button, key] of [[ui.upBtn, 'up'], [ui.downBtn, 'down']]) {
      const set = (value) => {
        if (key === 'up') state.vertical = value ? 1 : 0;
        else state.vertical = value ? -1 : 0;
      };
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        set(true);
      });
      const clear = () => set(false);
      button.addEventListener('pointerup', clear);
      button.addEventListener('pointercancel', clear);
      button.addEventListener('pointerleave', clear);
    }

    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.repeat) return;
      keys[event.code] = true;
      if (!state.started) {
        if (event.code === 'Enter' || event.code === 'Space') ui.enterBtn.click();
        return;
      }
      if (event.code === 'KeyF') setMode(state.mode === 'fly' ? 'walk' : 'fly');
      if (event.code === 'KeyV') toggleNear();
      if (event.code === 'KeyR') resetStreet();
    });
    window.addEventListener('keyup', (event) => { keys[event.code] = false; });
    window.addEventListener('blur', () => {
      keys = Object.create(null);
      joystick.x = 0;
      joystick.y = 0;
      state.vertical = 0;
      ui.stick.style.transform = 'translate3d(0,0,0)';
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (!state.started) return;
      drag.active = true;
      drag.pointerId = event.pointerId;
      drag.x = event.clientX;
      drag.y = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!drag.active || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      state.orbitYaw -= dx * 0.006;
      state.orbitPitch = clamp(state.orbitPitch + dy * 0.004, -0.05, 0.68);
    });
    const endDrag = (event) => {
      if (drag.pointerId === event.pointerId) drag.active = false;
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('wheel', (event) => {
      if (!state.started) return;
      event.preventDefault();
      state.distance = clamp(state.distance * (1 + event.deltaY * 0.0012), 3.2, 14.5);
    }, { passive: false });

    const setStick = (event) => {
      const rect = ui.joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const limit = rect.width * 0.32;
      let dx = event.clientX - cx;
      let dy = event.clientY - cy;
      const length = Math.hypot(dx, dy);
      if (length > limit) {
        dx = dx / length * limit;
        dy = dy / length * limit;
      }
      joystick.x = dx / limit;
      joystick.y = dy / limit;
      ui.stick.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    };
    ui.joystick.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      joystick.active = true;
      joystick.pointerId = event.pointerId;
      ui.joystick.setPointerCapture?.(event.pointerId);
      setStick(event);
    });
    ui.joystick.addEventListener('pointermove', (event) => {
      if (!joystick.active || joystick.pointerId !== event.pointerId) return;
      event.preventDefault();
      setStick(event);
    });
    const endStick = (event) => {
      if (joystick.pointerId !== event.pointerId) return;
      joystick.active = false;
      joystick.x = 0;
      joystick.y = 0;
      ui.stick.style.transform = 'translate3d(0,0,0)';
    };
    ui.joystick.addEventListener('pointerup', endStick);
    ui.joystick.addEventListener('pointercancel', endStick);

    addEventListener('resize', resize);
  }

  function resize() {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateMovement(dt) {
    if (!state.started || !dragon) return;
    let throttle = 0;
    let steer = 0;
    if (keys.KeyW || keys.ArrowUp) throttle += 1;
    if (keys.KeyS || keys.ArrowDown) throttle -= 1;
    if (keys.KeyA || keys.ArrowLeft) steer += 1;
    if (keys.KeyD || keys.ArrowRight) steer -= 1;
    throttle += -joystick.y;
    steer -= joystick.x;
    throttle = clamp(throttle, -1, 1);
    steer = clamp(steer, -1, 1);
    const targetSpeed = state.mode === 'fly' ? throttle * 4.6 : throttle * 3.0;
    state.speed = damp(state.speed, targetSpeed, 5.2, dt);
    state.steer = damp(state.steer, steer, 7.5, dt);
    state.yaw += state.steer * dt * (state.mode === 'fly' ? 1.25 : 1.75);
    const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
    const next = state.position.clone().addScaledVector(forward, state.speed * dt);
    if (state.mode === 'walk') {
      next.x = clamp(next.x, -4.55, 4.55);
      next.z = clamp(next.z, -36.6, 31.4);
      next.y = 0.03;
    } else {
      const lift = clamp(state.vertical + (keys.KeyQ ? 1 : 0) - (keys.KeyE ? 1 : 0), -1, 1);
      next.y = clamp(state.position.y + lift * dt * 5.2, 1.15, 16);
      next.x = clamp(next.x, -11.5, 11.5);
      next.z = clamp(next.z, -37.0, 32.0);
    }
    state.position.copy(next);
    dragon.root.position.copy(state.position);
    dragon.root.rotation.y = state.yaw;
    dragon.update(dt, state.time, state.speed, state.mode, state.steer);
    ui.statusMeta.textContent = `${state.mode === 'fly' ? '乘风' : '步行'} · ${Math.abs(state.speed).toFixed(1)} 米/秒`;
    if (state.mode === 'fly') {
      ui.statusMeta.textContent = `飞行 · ${Math.abs(state.speed).toFixed(1)} 米/秒 · 高度 ${Math.round(state.position.y)} 米`;
    }
  }

  function updateCamera(dt, immediate = false) {
    if (!dragon) return;
    let target;
    let angle;
    let distance;
    let height;
    if (!state.started) {
      introAngle += dt * 0.025;
      camera.position.set(2.2 + Math.sin(introAngle) * 0.45, 5.2, 34.2);
      camera.lookAt(0, 2.7, -10);
      camera.fov = 48;
      camera.updateProjectionMatrix();
      return;
    }
    if (state.near) {
      dragon.root.updateMatrixWorld(true);
      dragon.head.getWorldPosition(dragon.headWorld);
      target = dragon.headWorld.clone();
      angle = state.yaw + state.orbitYaw;
      distance = 1.85;
      height = 0.04 + Math.sin(state.orbitPitch) * 0.85;
    } else {
      const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
      target = state.position.clone().add(new THREE.Vector3(0, 0.98, 0)).addScaledVector(forward, 0.28);
      angle = state.yaw + Math.PI + state.orbitYaw;
      distance = state.distance;
      height = 1.25 + Math.sin(state.orbitPitch) * distance;
    }
    const desired = new THREE.Vector3(
      target.x + Math.sin(angle) * distance,
      target.y + height,
      target.z + Math.cos(angle) * distance,
    );
    desired.y = Math.max(desired.y, 0.8);
    if (desired.y < 7.2) desired.x = clamp(desired.x, -10.5, 10.5);
    if (immediate) camera.position.copy(desired);
    else camera.position.lerp(desired, 1 - Math.exp(-4.5 * dt));
    camera.lookAt(target);
    camera.fov = damp(camera.fov, state.near ? 42 : 48, 4.5, dt);
    camera.updateProjectionMatrix();
  }

  function updateAmbientMotion(dt) {
    const time = state.time;
    for (const person of state.people) {
      person.position.y = 0.03 + Math.sin(time * 0.85 + person.userData.phase) * 0.008;
      person.rotation.z = Math.sin(time * 0.55 + person.userData.phase) * 0.006;
    }
    for (const lantern of state.lanterns) {
      const node = lantern.userData.lantern;
      node.rotation.z = Math.sin(time * 1.4 + lantern.userData.phase) * 0.08;
    }
    for (const banner of state.banners) {
      const plane = banner.userData.plane;
      plane.rotation.z = Math.sin(time * 1.7 + banner.userData.phase) * 0.025;
      plane.rotation.x = Math.sin(time * 1.1 + banner.userData.phase) * 0.018;
    }
    if (sun) {
      sun.target.position.set(state.position.x, 1.2, state.position.z - 2);
      sun.position.set(state.position.x + 18, 32, state.position.z + 22);
      sun.target.updateMatrixWorld();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    updateMovement(dt);
    if (!state.started && dragon) {
      dragon.update(dt, state.time, 0, 'walk', 0);
    }
    updateAmbientMotion(dt);
    updateCamera(dt);
    camera.layers.enable(DRAGON_LAYER);
    renderer.render(scene, camera);
    state.frameCount++;
  }

  async function init() {
    try {
      if (document.fonts?.load) {
        await Promise.race([
          document.fonts.load('700 64px "Ma Shan Zheng"'),
          new Promise((resolve) => setTimeout(resolve, 1600)),
        ]);
      }
      resize();
      await buildMaterials();
      setProgress(0.16, '搭起街口与屋顶');
      await createStreet();
      bindEvents();
      dragon.root.position.copy(state.position);
      dragon.root.rotation.y = state.yaw;
      updateCamera(0.016, true);
      animate();
    } catch (error) {
      console.error(error);
      ui.loading.classList.remove('hidden');
      ui.loadingText.textContent = '街口没有搭起来：' + error.message;
      ui.loadingBar.style.width = '100%';
      ui.loadingBar.style.background = '#b64b35';
    }
  }

  window.__street = {
    state,
    scene,
    camera,
    renderer,
    get dragon() { return dragon; },
    setMode,
    reset: resetStreet,
    near: toggleNear,
    get joystick() { return { ...joystick }; },
    teleport(x, z, y = 0.03) {
      state.position.set(x, y, z);
      if (dragon) dragon.root.position.copy(state.position);
    },
  };

  init();
})();
