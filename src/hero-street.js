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
  scene.fog = new THREE.Fog(0xe6d5b8, 40, 168);
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
  let composer = null;
  let fxaaPass = null;
  let bloomPass = null;
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

  const LIFT_CACHE = new Map();

  /* 贴图提亮：CC0 扫描贴图的原色偏暗（细纹木平均 #413020），直接乘语义色会
   * 把整条街压成近黑。这里在 512² 画布上按固定系数提亮一次，结果按 URL+系数
   * 缓存，全城构件共用同一张贴图，不新增下载量。 */
  function liftTexture(texture, factor, key) {
    if (LIFT_CACHE.has(key)) return LIFT_CACHE.get(key);
    const image = texture.image;
    const size = Math.min(512, image.width || 512, image.height || 512);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      px[i] = Math.min(255, px[i] * factor);
      px[i + 1] = Math.min(255, px[i + 1] * factor);
      px[i + 2] = Math.min(255, px[i + 2] * factor);
    }
    ctx.putImageData(data, 0, 0);
    const lifted = new THREE.CanvasTexture(canvas);
    lifted.wrapS = texture.wrapS;
    lifted.wrapT = texture.wrapT;
    lifted.repeat.copy(texture.repeat);
    lifted.colorSpace = texture.colorSpace;
    lifted.anisotropy = texture.anisotropy;
    lifted.needsUpdate = true;
    LIFT_CACHE.set(key, lifted);
    return lifted;
  }

  async function loadPBR(name, base, normal, rough, repeat = [2, 2], color = 0xffffff, lift = 1) {
    const [baseMapRaw, normalMap, roughMap] = await Promise.all([
      base ? loadTexture(base, { srgb: true, repeat }) : Promise.resolve(null),
      loadTexture(normal, { repeat }),
      loadTexture(rough, { repeat }),
    ]);
    const baseMap = baseMapRaw && lift !== 1
      ? liftTexture(baseMapRaw, lift, base + '|lift' + lift)
      : baseMapRaw;
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
        root + 'brown_mud_02/normal_512.png', root + 'brown_mud_02/roughness_512.png', [7, 20], 0xd9c6a4, 1.35),
      loadPBR('street-stone', root + 'grey_stone_path/basecolor_512.png',
        root + 'grey_stone_path/normal_512.png', root + 'grey_stone_path/roughness_512.png', [2, 8], 0xd6cdbb, 1.5),
      loadPBR('street-wood', root + 'fine_grained_wood/basecolor_512.png',
        root + 'fine_grained_wood/normal_512.png', root + 'fine_grained_wood/roughness_512.png', [1, 3], 0xd8b18a, 1.9),
      loadPBR('street-darkwood', root + 'dark_wood/basecolor_512.png',
        root + 'dark_wood/normal_512.png', root + 'dark_wood/roughness_512.png', [1, 2], 0xb08a72, 1.5),
      loadPBR('street-cloth', root + 'Fabric081C/basecolor_512.png',
        root + 'Fabric081C/normal_512.png', root + 'Fabric081C/roughness_512.png', [3, 2], 0xb75b48, 1),
      loadPBR('street-roof', null,
        '/assets/library/architecture/pbr/clay_roof_tiles_02/normal.jpg',
        '/assets/library/architecture/pbr/clay_roof_tiles_02/roughness.jpg', [6, 3], 0x6d7472, 1),
    ]);
    mud.color.setHex(0xd9c6a4);
    stone.color.setHex(0xd6cdbb);
    wood.color.setHex(0xd8b18a);
    darkWood.color.setHex(0xb08a72);
    cloth.color.setHex(0xb4513e);
    roof.color.setHex(0x6b7472);
    cloth.side = THREE.DoubleSide;
    materials.mud = mud;
    materials.stone = stone;
    materials.wood = wood;
    materials.darkWood = darkWood;
    materials.cloth = cloth;
    materials.dragonScarf = cloth.clone();
    materials.dragonScarf.name = 'dragon-scarf';
    materials.dragonScarf.color.setHex(0xb94232);
    materials.dragonScarf.roughness = 0.84;
    materials.dragonScarf.normalScale.set(0.85, 0.85);
    materials.dragonScarf.side = THREE.DoubleSide;
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
    materials.plaster.color.setHex(0xd6c7a8);
    materials.plaster.roughness = 0.9;
    materials.redWood = wood.clone();
    materials.redWood.name = 'street-red-wood';
    materials.redWood.color.setHex(0x9f4b3d);
    materials.redWood.roughness = 0.76;
    materials.ink = makeMat('street-ink', 0x1b2b28, 0.8);
    materials.jade = new THREE.MeshPhysicalMaterial({
      name: 'dragon-jade',
      color: 0x5a9e86,
      roughness: 0.48,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.68,
      envMapIntensity: 0.76,
    });
    materials.jadeDark = new THREE.MeshPhysicalMaterial({
      name: 'dragon-jade-dark',
      color: 0x2f7164,
      roughness: 0.54,
      metalness: 0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.72,
      envMapIntensity: 0.7,
    });
    materials.cream = makeMat('dragon-cream', 0xe7dab8, 0.62, 0);
    materials.horn = makeMat('dragon-horn', 0xd9cbaa, 0.52, 0);
    // 鳞片/鬃/背鳍：一片薄板几何，靠实例色与朝向区分，材质只有一份。
    materials.dragonScale = new THREE.MeshStandardMaterial({
      name: 'dragon-scale-instances',
      color: 0xffffff,
      roughness: 0.58,
      metalness: 0,
      envMapIntensity: 0.70,
    });
    // 腹甲更亮更哑，与青鳞拉开明度，近看能读出分节。
    materials.dragonScute = new THREE.MeshStandardMaterial({
      name: 'dragon-belly-scutes',
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0,
      envMapIntensity: 0.62,
    });
    // 背鳍/鬃膜：半透光的薄鳍，双面渲染，逆光时能透出暖色。
    materials.dragonFin = new THREE.MeshStandardMaterial({
      name: 'dragon-fin-membrane',
      color: 0x2f7064,
      roughness: 0.52,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
      envMapIntensity: 0.70,
    });
    // 鬃底：包住颅后的一层深色绒面，用来遮住秃颅并衬托鬃叶。
    materials.dragonManeBase = new THREE.MeshStandardMaterial({
      name: 'dragon-mane-base',
      color: 0x3f8875,
      roughness: 0.74,
      metalness: 0,
      envMapIntensity: 0.62,
    });
    // 躯干/头/颌共用一份顶点色材质：皮肤的青-奶白过渡烘焙在顶点色里。
    // 鳞序用程序化法线贴图表达：几何贴片在凸面上会在轮廓翘出毛边。
    materials.dragonBody = new THREE.MeshStandardMaterial({
      name: 'dragon-body-vertex-color',
      vertexColors: true,
      roughness: 0.52,
      metalness: 0,
      envMapIntensity: 0.72,
    });
    const scaleNormal = window.ChanganDragonModel.scaleNormalTexture();
    materials.dragonBody.normalMap = scaleNormal;
    // 强度必须压住：0.55 在近看时会把整张脸读成高尔夫球表面。
    materials.dragonBody.normalScale.set(0.16, 0.16);
    // 四肢比躯干略深，避免四条腿和身体读成同一根管子。
    materials.dragonLimb = new THREE.MeshStandardMaterial({
      name: 'dragon-limb',
      color: 0x478b74,
      roughness: 0.54,
      metalness: 0,
      envMapIntensity: 0.70,
    });
    materials.dragonLimbDark = new THREE.MeshStandardMaterial({
      name: 'dragon-limb-dark',
      color: 0x336b5f,
      roughness: 0.56,
      metalness: 0,
      envMapIntensity: 0.66,
    });
    materials.dragonLid = makeMat('dragon-lid', 0x3f8271, 0.58, 0);
    materials.dragonLip = makeMat('dragon-lip', 0x2f5d52, 0.60, 0);
    materials.dragonNose = makeMat('dragon-nose', 0x8e5a52, 0.52, 0);
    materials.dragonEar = makeMat('dragon-ear', 0xd9a094, 0.68, 0);
    // 檐下暗部：上深下透的竖向渐变，一张 4×64 画布生成一次，全街共享。
    const shadeCanvas = document.createElement('canvas');
    shadeCanvas.width = 4;
    shadeCanvas.height = 64;
    const shadeCtx = shadeCanvas.getContext('2d');
    const shadeGradient = shadeCtx.createLinearGradient(0, 0, 0, 64);
    shadeGradient.addColorStop(0, 'rgba(38, 30, 22, 0.55)');
    shadeGradient.addColorStop(0.45, 'rgba(38, 30, 22, 0.20)');
    shadeGradient.addColorStop(1, 'rgba(38, 30, 22, 0)');
    shadeCtx.fillStyle = shadeGradient;
    shadeCtx.fillRect(0, 0, 4, 64);
    const shadeTexture = new THREE.CanvasTexture(shadeCanvas);
    shadeTexture.needsUpdate = true;
    materials.facadeShade = new THREE.MeshBasicMaterial({
      name: 'facade-shade',
      map: shadeTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    // 吻部：奶油色略偏暖，与腹甲同一色系但不完全一样，避免整脸一个白块。
    materials.dragonMuzzle = makeMat('dragon-muzzle', 0xe9d9b6, 0.66, 0);
    materials.dragonNostril = makeMat('dragon-nostril', 0x6f4a44, 0.62, 0);
    materials.dragonSocket = makeMat('dragon-eye-socket', 0x2a5449, 0.62, 0);
    materials.whisker = makeMat('dragon-whisker', 0xe0d3b4, 0.46, 0);
    materials.dragonEyeRim = makeMat('dragon-eye-rim', 0x5b3b20, 0.36, 0.08);
    materials.dragonMouth = makeMat('dragon-mouth', 0x3a1716, 0.7, 0);
    materials.dragonTongue = makeMat('dragon-tongue', 0xc65b59, 0.64, 0);
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
    // 后排屋海的材质：比前店更浅、更偏冷，配合雾把纵深压进空气里，
    // 避免后排与前店同样的对比度，让整条街像两堵平行的墙。
    materials.plasterDistant = makeMat('street-plaster-distant', 0xcfc3ab, 0.94, 0);
    materials.roofDistant = makeMat('street-roof-distant', 0x59605f, 0.94, 0);
    materials.woodDistant = makeMat('street-wood-distant', 0x6f5240, 0.92, 0);
    // 远景塔：比近景深一档，才能在雾里读出一层层屋檐。
    materials.pagodaBody = makeMat('pagoda-body', 0x9d8f78, 0.88, 0);
    materials.pagodaRoof = makeMat('pagoda-roof', 0x4a5457, 0.86, 0);
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
    const geometry = new THREE.SphereGeometry(260, 48, 24);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x3f7f9c) },
        midColor: { value: new THREE.Color(0x9fc0c8) },
        horizonColor: { value: new THREE.Color(0xf3ddb6) },
        // 地平线以下用雾色，远处地面才能和天空接上，不出现一条硬边。
        groundColor: { value: new THREE.Color(0xe6d5b8) },
        sunDirection: { value: new THREE.Vector3(0.42, 0.34, 0.32).normalize() },
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
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform vec3 groundColor;
        uniform vec3 sunDirection;
        varying vec3 vWorld;

        // 三维噪声只用于云的软边，不参与建筑或地面着色。
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 3; i++) {
            value += noise(p) * amplitude;
            p *= 2.05;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec3 dir = normalize(vWorld - cameraPosition);
          float h = clamp(dir.y, -0.2, 1.0);
          // 天顶到地平线三段渐变：唐长安的黄昏不是一整块土黄。
          vec3 color = mix(horizonColor, midColor, smoothstep(0.0, 0.30, h));
          color = mix(color, topColor, smoothstep(0.22, 0.85, h));
          color = mix(groundColor, color, smoothstep(-0.20, 0.02, dir.y));

          // 低角度暖阳与光晕，让顺光/逆光的建筑轮廓有方向感。
          float sunDot = max(dot(dir, normalize(sunDirection)), 0.0);
          color += vec3(1.0, 0.70, 0.38) * pow(sunDot, 260.0) * 1.35;
          color += vec3(1.0, 0.76, 0.48) * pow(sunDot, 14.0) * 0.20;
          color += vec3(0.95, 0.72, 0.46) * pow(sunDot, 3.0) * 0.05;

          // 高空薄云：只在仰角较高处出现，靠近街面的地平线保持干净。
          // 云只在 dir.y > 0.05 时采样噪声，地面以下与街景方向不做无用的 fbm。
          if (dir.y > 0.05) {
            vec2 cloudUv = dir.xz / max(0.20, dir.y + 0.25) * 1.35;
            float cloud = fbm(cloudUv + vec2(2.4, 1.1));
            float cloudMask = smoothstep(0.56, 0.86, cloud)
              * smoothstep(0.06, 0.42, dir.y)
              * (1.0 - smoothstep(0.62, 0.98, dir.y));
            color = mix(color, vec3(1.0, 0.93, 0.82), cloudMask * 0.55);
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    sky = new THREE.Mesh(geometry, material);
    sky.frustumCulled = false;
    scene.add(sky);
  }

  function createLights() {
    // 冷暖分离：天光偏青、太阳偏橙，避免整条街被同一色温压平。
    hemi = new THREE.HemisphereLight(0xa9cfe0, 0x6b5540, 0.95);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffe6c4, 0.16);
    scene.add(ambient);
    sun = new THREE.DirectionalLight(0xffd9a6, 2.55);
    sun.position.set(22, 26, 16);
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
    // 远景地面：只作为坊外土地，颜色接近雾色，远处不会读成一条深色"海面"。
    // 街面本身另有铺装与土路，不靠这张大平面。
    const farGround = new THREE.MeshStandardMaterial({
      name: 'far-ground',
      color: 0xc8b696,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), farGround);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.025, -8);
    ground.receiveShadow = true;
    scene.add(ground);

    // 街两侧的土路只铺在近处，作为铺装与店铺之间的过渡。
    const nearGround = new THREE.Mesh(new THREE.PlaneGeometry(40, 90), materials.mud);
    nearGround.rotation.x = -Math.PI / 2;
    nearGround.position.set(0, -0.012, -3);
    nearGround.receiveShadow = true;
    scene.add(nearGround);

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

      const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 77), materials.stone);
      sidewalk.rotation.x = -Math.PI / 2;
      sidewalk.position.set(side * 6.85, 0.026, -3);
      sidewalk.receiveShadow = true;
      scene.add(sidewalk);
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

    // 排水沟沿街两侧连续铺设，凹槽与湿痕让路面有真实坡度方向。
    const gutterMaterial = new THREE.MeshStandardMaterial({
      color: 0x594d3e,
      roughness: 0.72,
      metalness: 0,
      envMapIntensity: 0.55,
    });
    const gutterStoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x837968,
      roughness: 0.92,
      metalness: 0,
    });
    for (const side of [-1, 1]) {
      const channel = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 77), gutterMaterial);
      channel.rotation.x = -Math.PI / 2;
      channel.position.set(side * 5.28, 0.022, -3);
      channel.receiveShadow = true;
      scene.add(channel);
      for (let i = 0; i < 22; i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.055, 3.15), gutterStoneMaterial);
        slab.position.set(side * 5.43, 0.020, STREET_Z0 + 1.7 + i * 3.42);
        slab.receiveShadow = true;
        slab.castShadow = true;
        scene.add(slab);
      }
      // 侧巷口的浅色门石与主街铺装断开，避免整条街只有一条相同带子。
      for (const z of [-19.6, 8.0, 24.4]) {
        const threshold = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.075, 0.55), gutterStoneMaterial);
        threshold.position.set(side * 4.90, 0.043, z);
        threshold.receiveShadow = true;
        scene.add(threshold);
      }
    }

    // 主街铺装：整条街面用方石铺满，只在最靠店铺的一米留土路。
    // 之前只在街心铺 4.25m，两侧是大片土黄，整条街读成"土路中间一条石板"。
    // 主街铺装：整条街面用方石铺满，只在最靠店铺的一米留土路。
    // 铺装材质不用灰石路的 basecolor——那张图本身偏褐，乘上实例色后整条街
    // 读成泥地。这里只用它的法线/粗糙度，底色交给实例色。
    const pavingMaterial = new THREE.MeshStandardMaterial({
      name: 'street-paving',
      color: 0xffffff,
      normalMap: materials.stone.normalMap,
      roughnessMap: materials.stone.roughnessMap,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.55,
    });
    pavingMaterial.normalScale.set(0.34, 0.34);
    const paving = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 77), pavingMaterial);
    paving.rotation.x = -Math.PI / 2;
    paving.position.set(0, 0.024, -3);
    paving.receiveShadow = true;
    scene.add(paving);
    const slabGeometry = new THREE.BoxGeometry(0.62, 0.035, 0.94);
    const COLUMNS = 21;
    const ROWS = 82;
    const slabs = new THREE.InstancedMesh(slabGeometry, pavingMaterial, COLUMNS * ROWS);
    let slabCursor = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLUMNS; column++) {
        const offset = row % 2 ? 0.30 : 0;
        // 每块石头单独一点位移与缩放，避免整条街读成一张重复贴图。
        const jitter = ((row * 7 + column * 11) % 9 - 4) * 0.016;
        const wobble = ((row * 13 + column * 5) % 7 - 3) * 0.004;
        matrix.makeTranslation(
          -4.20 + column * 0.42 + offset * 0.21 + jitter,
          0.026 + ((row + column) % 3) * 0.0018,
          STREET_Z0 + 0.8 + row * 0.92 + wobble,
        );
        slabs.setMatrixAt(slabCursor, matrix);
        color.setHex(
          (row + column) % 7 === 0 ? 0x8e8778
            : (row + column) % 5 === 0 ? 0x6f695d
              : (row + column) % 3 === 0 ? 0x7d7668 : 0x797265,
        );
        slabs.setColorAt(slabCursor, color);
        slabCursor++;
      }
    }
    slabs.instanceMatrix.needsUpdate = true;
    if (slabs.instanceColor) slabs.instanceColor.needsUpdate = true;
    slabs.castShadow = false;
    slabs.receiveShadow = true;
    scene.add(slabs);

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

  /* 坊墙与坊外街景：从街心望出去，坊门之后不能是一片空地和地平线。
   * 这里在坊门后补一道横墙、一段横向街道和两排远景屋顶，
   * 让视线有落点；全部复用现有共享材质与简单几何。 */
  function createWardWall(shopRoot, tavernRoot) {
    const group = new THREE.Group();
    group.name = 'ward-wall';
    // 坊墙是连续的：只在门洞处断开。之前按两段矮墙放在 ±16.6，
    // 街两侧 5.5–12m 的缺口会直接露出远处地平线，读成"街外是海"。
    const wallSegments = [
      // 北端（坊门之后）
      { z: -43.5, xs: [-23, -13.5, 13.5, 23] },
      // 南端（街口之后）
      { z: 39.5, xs: [-23, -13.5, 13.5, 23] },
    ];
    for (const { z, xs } of wallSegments) {
      for (const x of xs) {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(9.2, 3.4, 0.7),
          // 用带法线/粗糙度的灰泥材质，不用纯色远景材质：这两道墙离街口
          // 只有十几米，纯色会读成一块灰色板。
          materials.plaster,
        );
        wall.position.set(x, 1.7, z);
        wall.castShadow = false;
        wall.receiveShadow = true;
        group.add(wall);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.22, 1.05), materials.roof);
        cap.position.set(x, 3.5, z);
        group.add(cap);
      }
      // 门洞两侧的短墙：从门楼边缘接到外侧长墙，把缺口补满。
      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(5.8, 3.2, 0.7),
          materials.plaster,
        );
        wall.position.set(side * 6.3, 1.6, z);
        wall.receiveShadow = true;
        group.add(wall);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.20, 1.0), materials.roof);
        cap.position.set(side * 6.3, 3.3, z);
        group.add(cap);
      }
    }
    // 街口门楼之后：门洞外不能是一块发白的地面。补一道坊外横街的铺面，
    // 让视线穿过门洞时落在建筑上。
    const beyondGate = kitInstance(tavernRoot, {
      position: [0, -0.02, 48.5],
      rotationY: Math.PI,
      scale: 1.0,
    });
    beyondGate.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = true;
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!material) return;
      if (/mat_plaster/i.test(material.name || '')) node.material = materials.plaster;
      else if (/mat_roof/i.test(material.name || '')) node.material = materials.roof;
      else if (/mat_vermilion|mat_timber|mat_bracket_block/i.test(material.name || '')) {
        node.material = materials.wood;
      }
    });
    group.add(beyondGate);
    // 坊外横街：两排远景铺面横在门后，错开高度。
    for (const [x, scale, tavern] of [
      [-18.5, 0.92, false], [-8.5, 0.86, true], [8.5, 0.90, false], [18.5, 0.86, true],
    ]) {
      const root = tavern ? tavernRoot : shopRoot;
      const building = kitInstance(root, {
        position: [x, -0.02, -50.5],
        rotationY: 0,
        scale,
      });
      building.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = true;
        const material = Array.isArray(node.material) ? node.material[0] : node.material;
        if (!material) return;
        if (/mat_plaster/i.test(material.name || '')) node.material = materials.plasterDistant;
        else if (/mat_roof/i.test(material.name || '')) node.material = materials.roofDistant;
        else if (/mat_vermilion|mat_timber|mat_bracket_block/i.test(material.name || '')) {
          node.material = materials.woodDistant;
        }
      });
      group.add(building);
    }
    scene.add(group);
    return group;
  }

  function createGate(z = -39.2, facing = 1) {
    const gate = new THREE.Group();
    gate.name = 'west-market-gate';
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
    sign.position.set(0, 4.55, z + 0.36 * facing);
    if (facing < 0) sign.rotation.y = Math.PI;
    gate.add(sign);
    scene.add(gate);
    return gate;
  }

  function createPagoda() {
    const pagoda = new THREE.Group();
    pagoda.name = 'distant-pagoda';
    // 塔放在坊门之后、雾的过渡带里：太远会洗成一团白，太近会抢街景。
    pagoda.position.set(0, 0, -64);
    // 远景剪影：比近景构件深一档，才能在雾里读出塔的层次。
    const stone = materials.pagodaBody;
    const roof = materials.pagodaRoof;
    for (let i = 0; i < 5; i++) {
      const radius = 2.6 - i * 0.30;
      const h = 3.6 - i * 0.24;
      const y = 2.0 + i * 3.95;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius + 0.16, h, 10), stone);
      body.position.y = y;
      body.castShadow = body.receiveShadow = true;
      pagoda.add(body);
      const eave = new THREE.Mesh(new THREE.ConeGeometry(radius + 0.92, 0.95, 10, 1, true), roof);
      eave.position.y = y + h * 0.5 + 0.30;
      eave.rotation.y = Math.PI / 10;
      eave.castShadow = true;
      pagoda.add(eave);
      const balcony = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.30, radius + 0.30, 0.11, 10), materials.stone);
      balcony.position.y = y + h * 0.5 - 0.10;
      pagoda.add(balcony);
    }
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.17, 2.0, 8), materials.gold);
    spire.position.y = 20.9;
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

  // 西市真实行当：织物、胡食、香药、书肆、茶坊、陶器、果子、鞍马。
  const SHOP_TRADES = [
    { board: '胡饼铺', short: '饼' },
    { board: '香药铺', short: '香' },
    { board: '绸缎庄', short: '绸' },
    { board: '书肆', short: '书' },
    { board: '茶坊', short: '茶' },
    { board: '陶器行', short: '陶' },
    { board: '果子铺', short: '果' },
    { board: '鞍马行', short: '马' },
  ];

  function shopTrade(entry) {
    const index = Math.abs(Math.round(entry.z) + entry.side * 3) % SHOP_TRADES.length;
    return SHOP_TRADES[index];
  }

  // 铺面的临街几何与招牌文案只有这一处定义：布局、招牌网格和验收记录共用，
  // 避免"挂幌位置"在展示代码和记录数据里各算一遍而互相漂移。
  function shopPlacement(entry) {
    const isTavern = entry.kind === 'tavern';
    const depth = isTavern ? 5.82 : 5.24;
    const halfD = (isTavern ? 2.91 : 2.62) * entry.scale;
    const trade = shopTrade(entry);
    const hasHanging = isTavern || Math.abs(entry.z) % 14 < 1;
    return {
      isTavern,
      frontX: entry.side * (SHOP_X - (depth * entry.scale) / 2 - 0.075),
      facing: entry.side < 0 ? Math.PI / 2 : -Math.PI / 2,
      board: isTavern ? '西市酒肆' : trade.board,
      vertical: isTavern ? '酒' : trade.short,
      hasHanging,
      halfD,
      hangingZ: hasHanging ? entry.z + halfD - 0.42 : null,
    };
  }

  function addBuildingSigns(entry) {
    const { z, side } = entry;
    const placement = shopPlacement(entry);
    const { isTavern, frontX, facing } = placement;
    const board = makeSignMesh(
      placement.board,
      isTavern ? 2.3 : 1.8,
      isTavern ? 0.7 : 0.56,
      { font: isTavern ? 82 : 66 },
    );
    board.position.set(frontX, isTavern ? 5.25 : 4.35, z);
    board.rotation.y = facing;
    board.scale.setScalar(1.15);
    scene.add(board);
    if (placement.hasHanging) {
      const hanging = makeSignMesh(placement.vertical, 0.56, 1.5, { vertical: true, font: 62 });
      hanging.position.set(
        frontX + (side < 0 ? -0.55 : 0.55),
        isTavern ? 3.7 : 2.85,
        placement.hangingZ,
      );
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

    // 概念图里的市街靠"沿街木构 + 挑檐雨篷 + 布色变化"读出来，不是一排
    // 相同白墙。雨篷直接按世界坐标构造：临街面固定在 |x|=铺面前沿，
    // 只向街心挑出有限深度，避免此前误用局部轴导致篷布伸到街心。
    function addStreetAwning() {
      const eaveY = isTavern ? 3.46 : 2.78;
      // halfD 是铺面沿街半宽；雨篷略窄于铺面，不能盖到邻铺。
      const halfSpan = halfD * 0.94;
      const attachX = SHOP_FRONT * entry.scale;
      const reach = isTavern ? 1.05 : 0.92;
      const outerX = attachX - reach;
      const centerX = entry.side * (attachX + outerX) / 2;
      // 单位盒 1×0.06×1：X 是挑出深度，Y 是厚薄/垂高，Z 是沿街宽度。
      // 绕 Z 轴旋转才能让 X 方向的篷布向街心下倾；绕 Y 会把沿街宽度扭进
      // X 方向，实测会多伸出约 1 米并盖住邻铺。
      const place = (x, y, z, sx, sy, sz, tiltZ = 0) => {
        const matrix = new THREE.Matrix4().makeTranslation(x, y, z);
        if (tiltZ) matrix.multiply(new THREE.Matrix4().makeRotationZ(entry.side * tiltZ));
        matrix.multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
        return matrix;
      };
      const cloth = Math.abs(Math.round(entry.z)) % 2 ? materials.clothBlue : materials.clothOchre;
      // 篷布：由铺面前沿向街心下倾，前端略低。
      queueBatch('awning-canopy', sharedGeometry.awning, cloth,
        place(centerX, eaveY + 0.08, entry.z, reach + 0.10, 1, halfSpan * 2, 0.20));
      // 前缘垂帘：明确的篷下阴影边界。
      queueBatch('awning-valance', sharedGeometry.awning, cloth,
        place(entry.side * outerX, eaveY - 0.17, entry.z, 0.05, 0.32, halfSpan * 2));
      // 两根斜撑把篷布锚回铺面，避免悬空布板。
      for (const dz of [-halfSpan * 0.74, halfSpan * 0.74]) {
        queueBatch('awning-strut', sharedGeometry.awning, frameMat,
          place(centerX, eaveY - 0.36, entry.z + dz, reach + 0.14, 0.07, 0.07, 0.50));
      }
    }

    /* 檐下暗部：沿铺面立面贴一片上深下透的渐变，模拟挑檐挡住的天光。
     * 没有这层，整面白灰墙从檐口到地面亮度一样，读成一张贴纸；
     * 这是廉价但有效的假 AO，比加几何檐口更省。 */
    function addFacadeShade() {
      const eaveY = isTavern ? 3.46 : 2.78;
      const halfSpan = halfD * 0.94;
      const frontX = SHOP_FRONT * entry.scale;
      const shade = new THREE.Mesh(
        sharedGeometry.facadeShade,
        materials.facadeShade,
      );
      shade.position.set(entry.side * (frontX - 0.02), eaveY - 0.62, entry.z);
      shade.rotation.y = entry.side < 0 ? Math.PI / 2 : -Math.PI / 2;
      shade.scale.set(halfSpan * 1.9, 1.24, 1);
      scene.add(shade);
    }

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
    addStreetAwning();
    addFacadeShade();
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
    const plasterTint = [materials.plaster, materials.plasterWarm, materials.stone][Math.abs(Math.round(entry.z)) % 3];
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
    return group;
  }

  /* 临街铺面背后再排一层屋海：街两侧的天际线不能只由一排店铺和空地看着。
   * 第二排复用同一份 GLB 与共享材质，只做变换，因此不增加下载量；
   * 屋顶轮廓、楼层高度与沿街方向都与前店错开，读出"坊内纵深"。 */
  function addBackRows(shopRoot, tavernRoot) {
    const rows = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const z = STREET_Z0 + 6 + i * 8.4;
        const isTavern = i % 3 === 1;
        const scale = isTavern ? 0.90 : 0.86 + (i % 3) * 0.05;
        const group = addBackgroundBuilding(
          isTavern ? tavernRoot : shopRoot,
          side,
          z,
          scale,
        );
        group.position.y = -0.02;
        group.rotation.y = (side < 0 ? -Math.PI / 2 : Math.PI / 2) + (i % 2 ? 0.10 : -0.08);
        group.traverse((node) => {
          if (!node.isMesh) return;
          // 后排不做投影：阴影贴图覆盖不到这里，投影只会浪费采样。
          node.castShadow = false;
          node.receiveShadow = true;
          const material = Array.isArray(node.material) ? node.material[0] : node.material;
          if (!material) return;
          if (/mat_plaster/i.test(material.name || '')) {
            node.material = materials.plasterDistant;
          } else if (/mat_roof/i.test(material.name || '')) {
            node.material = materials.roofDistant;
          } else if (/mat_vermilion|mat_timber|mat_bracket_block/i.test(material.name || '')) {
            node.material = materials.woodDistant;
          }
        });
        scene.add(group);
        rows.push(group);
      }
    }
    state.backgroundRows = rows;
    return rows;
  }

  async function createStreet() {
    createSky();
    createLights();
    createGround();
    createGate();
    // 街口另立一座门楼：从街内回望时，视线落在门上而不是空墙。
    createGate(41.0, -1);
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

    // 概念图的市街靠两层与单层交错读出来；两层酒肆按铺面位置间隔布置，
    // 而不是只有一间。仍复用同一个酒肆 GLB，靠变换与共享材质区分类别。
    const leftZ = [-31, -24, -17, -8.8, 1.2, 8.6, 16.0, 23.4, 30.8];
    const rightZ = [-31, -24, -17, -10, -3, 4, 11, 18, 25, 32];
    const TAVERN_Z = new Set([-24, 8.6, 23.4]);
    const entries = [];
    leftZ.forEach((z, i) => {
      if (z === -8.8 || TAVERN_Z.has(z)) {
        entries.push({ side: -1, z, kind: 'tavern', scale: 0.96 });
      } else {
        entries.push({ side: -1, z, kind: 'shop', scale: i % 3 === 0 ? 0.96 : i % 3 === 1 ? 1.0 : 1.04 });
      }
    });
    const rightTavern = new Set([-17, 4, 25]);
    rightZ.forEach((z, i) => {
      entries.push({
        side: 1,
        z,
        kind: rightTavern.has(z) ? 'tavern' : 'shop',
        scale: rightTavern.has(z) ? 0.96 : i % 4 === 0 ? 0.97 : i % 3 === 0 ? 1.03 : 1.0,
      });
    });
    entries.forEach((entry) => addBuilding(entry.kind === 'tavern' ? tavernRoot : shopRoot, entry));
    flushBatches();
    addBackRows(shopRoot, tavernRoot);
    createWardWall(shopRoot, tavernRoot);
    // 记录每间铺面的行当与挂幌纵向范围，供验收核对不重复、不出铺面。
    state.streetPlan = entries.map((entry) => {
      const placement = shopPlacement(entry);
      return {
        side: entry.side,
        z: entry.z,
        kind: entry.kind,
        isTavern: placement.isTavern,
        board: placement.board,
        hangingZ: placement.hangingZ,
        frontX: placement.frontX,
        halfD: placement.halfD,
      };
    });
    // 相邻铺面沿街范围不能互相侵入：两层酒肆与单层铺面共用同一条排布线。
    state.streetGaps = [];
    for (const side of [-1, 1]) {
      const lane = state.streetPlan
        .filter((row) => row.side === side)
        .sort((a, b) => a.z - b.z);
      for (let i = 1; i < lane.length; i++) {
        const gap = (lane[i].z - lane[i].halfD) - (lane[i - 1].z + lane[i - 1].halfD);
        state.streetGaps.push({ side, a: lane[i - 1].z, b: lane[i].z, gap: +gap.toFixed(3) });
      }
    }

    setProgress(0.68, '摆摊、点灯、落人');
    createStreetProps();
    createPeople({ male: residentMale, female: residentFemale });
    await addShopGoods();
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
      [-5.3, 28.5, 0.66], [5.3, 22.5, 0.62], [-5.3, 15.8, 0.58],
      [5.3, 9.5, 0.56], [-5.3, -7.5, 0.66], [5.3, -17.0, 0.60],
      [-5.3, -28.5, 0.58],
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
      [-5.6, 2.0, 0.78, 0.8], [5.5, -12.0, 0.80, -0.5], [-5.5, -20.5, 0.74, 0.3],
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

  const GOODS_ASSETS = [
    ['ceramic-pot', '/assets/library/polyhaven/ceramic_pot/runtime.glb'],
    ['wicker-basket', '/assets/library/polyhaven/wicker_basket_01/runtime.glb'],
    ['wooden-bowl', '/assets/library/polyhaven/wooden_bowl_02/runtime.glb'],
    ['wooden-bucket', '/assets/library/polyhaven/wooden_bucket_01/runtime.glb'],
    ['pomegranate', '/assets/library/polyhaven/food_pomegranate_01/runtime.glb'],
    ['pears', '/assets/library/polyhaven/food_pears_asian_01/runtime.glb'],
    ['lychee', '/assets/library/polyhaven/food_lychee_01/runtime.glb'],
  ];

  async function addShopGoods() {
    setProgress(0.72, '摆上陶器、竹篮与果品');
    const templates = await Promise.all(
      GOODS_ASSETS.map(([name, url]) => kitLoad('goods-' + name, url)),
    );
    const byName = new Map(GOODS_ASSETS.map(([name], index) => [name, templates[index]]));
    const clusters = [
      [-1, 11.9, 0.0],
      [-1, 5.0, 0.0],
      [-1, -12.8, 0.0],
      [-1, -22.0, 0.0],
      [1, 16.7, Math.PI],
      [1, 6.6, Math.PI],
      [1, -5.8, Math.PI],
      [1, -18.4, Math.PI],
    ];
    for (const [side, z, facing] of clusters) {
      const cx = side * 4.78;
      const ground = 0.03;
      const props = [
        ['ceramic-pot', -0.43, 0.12, 0.48, -0.4],
        ['wicker-basket', 0.18, 0.18, 0.20, 0.2],
        ['wooden-bowl', 0.52, 0.05, 0.14, 0.5],
        ['pomegranate', 0.12, -0.48, 0.11, 0.1],
      ];
      for (const [name, lx, lz, height, rotation] of props) {
        const source = byName.get(name);
        if (!source) continue;
        const box = new THREE.Box3().setFromObject(source);
        const dimensions = box.getSize(new THREE.Vector3());
        if (!Number.isFinite(dimensions.y) || dimensions.y < 0.001) continue;
        const instance = kitInstance(source, {
          position: [cx + lx, ground, z + lz],
          rotationY: facing + rotation,
          scale: height / dimensions.y,
        });
        instance.name = 'shop-good-' + name + '-' + side + '-' + z;
        instance.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = true;
          node.receiveShadow = true;
        });
        scene.add(instance);
      }
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
    // 单位尺寸雨篷：所有铺面共用一份几何，靠实例矩阵缩放成不同宽度。
    awning: new THREE.BoxGeometry(1, 0.06, 1),
    // 檐下暗部：1×1 平面，靠缩放贴到不同宽高的立面上。
    facadeShade: new THREE.PlaneGeometry(1, 1),
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
    for (const [side, z, text] of [[-1, -11.8, '酒'], [1, 1.2, '茶']]) {
      const banner = createHangingBanner(
        text,
        side * 4.2,
        3.35,
        z,
        side < 0 ? Math.PI / 2 : -Math.PI / 2,
        materials.clothOchre,
      );
      banner.scale.setScalar(1.35);
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
    // 酒肆前檐下：长凳、矮桌与酒坛形成可停留的街角，不是路边摆件。
    for (const [side, z] of [[-1, -8.8], [1, 4.0]]) {
      const x = side * 4.05;
      const bench = new THREE.Group();
      bench.position.set(x, 0.03, z);
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 2.1), materials.wood);
      plank.position.y = 0.48;
      plank.castShadow = plank.receiveShadow = true;
      bench.add(plank);
      for (const dz of [-0.82, 0, 0.82]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.10), materials.darkWood);
        leg.position.set(0, 0.23, dz);
        leg.castShadow = true;
        bench.add(leg);
      }
      for (const dz of [-0.55, 0.55]) {
        const jar = new THREE.Mesh(JAR_GEOMETRY, materials.terracotta);
        jar.scale.setScalar(0.68);
        jar.position.set(side * 0.38, 0.02, dz);
        jar.castShadow = true;
        bench.add(jar);
      }
      scene.add(bench);
      const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), materials.wood);
      table.position.set(side * 3.4, 0.58, z + 1.25);
      table.castShadow = true;
      scene.add(table);
      for (const [dx, dz] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.56, 0.07), materials.darkWood);
        leg.position.set(side * 3.4 + dx, 0.31, z + 1.25 + dz);
        scene.add(leg);
      }
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.13, 10), materials.plasterWarm);
      cup.position.set(side * 3.25, 0.70, z + 1.2);
      cup.castShadow = true;
      scene.add(cup);
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

  /* 人物衣色变体：同一份 GLB 只克隆"布"材质，按颜色缓存。
   * 这样三十个人有六七种衣色，但几何与皮肤材质仍是共享的，
   * 不会为每个人复制整套贴图。 */
  const robeVariantCache = new Map();

  function robeVariant(source, color) {
    const key = (source.name || 'robe') + '|' + color.toString(16);
    if (robeVariantCache.has(key)) return robeVariantCache.get(key);
    const material = source.clone();
    material.name = 'resident-robe-' + color.toString(16);
    material.color = new THREE.Color(color);
    material.roughness = Math.max(0.72, material.roughness ?? 0.8);
    material.metalness = 0;
    robeVariantCache.set(key, material);
    return material;
  }

  function applyRobeColor(person, color) {
    person.traverse((node) => {
      if (!node.isMesh) return;
      const source = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!source) return;
      // 只改衣物类材质：皮肤、头发、瞳孔保持原样。
      if (/cloth|silk|scarf|belt/i.test(source.name || '')) {
        node.material = robeVariant(source, color);
      }
    });
  }

  function createPeople(characterRoots = {}) {
    // 街上的人分三类位置：铺面前的主顾、摊位边的买卖双方、街心走动的行人。
    // 只放十个人会让整条街读成空巷；这里加到三十余人，且成组出现，
    // 每组两三人，才像"市井"而不是排列的模型。
    const people = [
      [-5.15, 11.9, -Math.PI / 2, { robe: 0x8d5a45, female: false, scale: 1.0 }],
      [-4.28, 12.1, Math.PI / 2, { robe: 0x596e70, female: true, scale: 0.94 }],
      [-5.15, -12.8, -Math.PI / 2, { robe: 0xa16b47, female: false, scale: 1.03 }],
      [5.15, 6.6, Math.PI / 2, { robe: 0x76634c, female: false, scale: 0.96 }],
      [4.28, 6.9, -Math.PI / 2, { robe: 0x7d5042, female: true, scale: 0.9 }],
      [5.15, -18.4, Math.PI / 2, { robe: 0x465b55, female: false, guard: true, scale: 1.02 }],
      [4.25, -18.0, -Math.PI / 2, { robe: 0x8a6647, female: false, scale: 0.98 }],
      [-4.25, 5.1, Math.PI / 2, { robe: 0x6f6252, female: false, scale: 0.94 }],
      [3.9, -33.0, -1.4, { robe: 0x4e5c5c, female: false, guard: true, scale: 1.0 }],
      [-3.6, 27.5, 2.3, { robe: 0x9b7355, female: true, scale: 0.86 }],
      // 摊位前的买卖双方：与 createStall 的位置对齐。
      [-3.05, 9.2, 2.6, { robe: 0x7c6a4e, female: false, scale: 0.98 }],
      [-3.10, 10.6, 2.9, { robe: 0x8e5f4a, female: true, scale: 0.88 }],
      [3.05, 1.3, -2.7, { robe: 0x5f7074, female: false, scale: 1.0 }],
      [3.12, 2.7, -2.5, { robe: 0x9a6a4c, female: true, scale: 0.92 }],
      [-3.02, -15.6, 2.5, { robe: 0x6b5a48, female: false, scale: 1.02 }],
      [3.08, -24.4, -2.6, { robe: 0x7a5a50, female: false, scale: 0.95 }],
      // 街心行人：成组走动，给主街以人流。
      [-1.7, 19.5, 2.9, { robe: 0x6d7a68, female: false, scale: 0.97 }],
      [-1.1, 18.8, 3.1, { robe: 0x8a5b4a, female: true, scale: 0.9 }],
      [1.4, 13.0, -0.3, { robe: 0x5d6a72, female: false, scale: 1.0 }],
      [0.9, 3.6, -0.2, { robe: 0x7f6a4f, female: true, scale: 0.93 }],
      [-2.2, -2.5, 2.8, { robe: 0x6a5c4b, female: false, scale: 0.99 }],
      [-1.5, -3.4, 2.6, { robe: 0x8d6a52, female: false, scale: 0.92 }],
      [1.9, -9.8, -0.4, { robe: 0x596b5f, female: false, scale: 1.01 }],
      [1.2, -10.9, -0.2, { robe: 0x9a7258, female: true, scale: 0.87 }],
      [-2.4, -21.0, 2.9, { robe: 0x70604c, female: false, scale: 0.96 }],
      [2.6, -27.5, -0.5, { robe: 0x5f6a63, female: false, scale: 0.98 }],
      [0.4, -30.5, -0.1, { robe: 0x86604a, female: true, scale: 0.9 }],
      [-0.9, 24.8, 2.7, { robe: 0x77664e, female: false, scale: 0.94 }],
      [2.2, 25.6, -0.4, { robe: 0x6b5d55, female: false, scale: 1.0 }],
      [4.4, 16.4, -Math.PI / 2, { robe: 0x7d6a52, female: true, scale: 0.9 }],
      [-4.5, -5.6, Math.PI / 2, { robe: 0x5b6b62, female: false, scale: 0.96 }],
      [-4.4, -6.4, Math.PI / 2, { robe: 0x8b5f4b, female: true, scale: 0.88 }],
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
        applyRobeColor(person, options.robe);
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

  /* 小青龙：几何、材质与动画在 src/dragon-model.js，这里只做装配。
   * 拆分的理由是这个文件已经到三千行，龙又是最需要反复调整的部分；
   * 模型文件只产出几何，材质仍由本文件按全项目共享表传入。 */
  function createDragon() {
    const dragonMaterials = {
      body: materials.dragonBody,
      limb: materials.dragonLimb,
      limbDark: materials.dragonLimbDark,
      claw: materials.horn,
      mouth: materials.dragonMouth,
      tongue: materials.dragonTongue,
      lip: materials.dragonLip,
      nose: materials.dragonNose,
      nostril: materials.dragonNostril,
      socket: materials.dragonSocket,
      eyeWhite: materials.eyeWhite,
      eyeAmber: materials.eyeAmber,
      pupil: materials.pupil,
      catchlight: materials.eyeWhite,
      lid: materials.dragonLid,
      ear: materials.dragonEar,
      cream: materials.cream,
      muzzle: materials.dragonMuzzle,
      mane: materials.dragonScale,
      maneBase: materials.dragonManeBase,
      fin: materials.dragonFin,
      scutes: materials.dragonScute,
      scales: materials.dragonScale,
      horn: materials.horn,
      whisker: materials.whisker,
      scarf: materials.dragonScarf,
    };
    const model = window.ChanganDragonModel.create({
      materials: dragonMaterials,
      layer: DRAGON_LAYER,
      scale: 0.78,
    });
    // 供验收脚本与近看镜头使用的既有接口。
    model.visual.userData.head = model.head;
    return model;
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
      target = dragon.headWorld.clone().add(new THREE.Vector3(0, -0.02, 0.01));
      angle = state.yaw + state.orbitYaw;
      distance = 2.35;
      height = 0.02 + Math.sin(state.orbitPitch) * 0.85;
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
    get streetPlan() {
      // 供验收脚本核对招牌文案是否重复、挂幌是否落在铺面范围内。
      return state.streetPlan || [];
    },
    get streetGaps() {
      // 相邻铺面沿街间距；负值代表两层与单层店铺互相穿透。
      return state.streetGaps || [];
    },
    teleport(x, z, y = 0.03) {
      state.position.set(x, y, z);
      if (dragon) dragon.root.position.copy(state.position);
    },
  };

  init();
})();
