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
    // 唐式是深青灰陶瓦。之前用 0x6b7472 且 envMapIntensity 0.85，
    // 高光与环境反射把屋面冲成近白，俯瞰整条街读成"白顶街"。
    roof.color.setHex(0x2f3839);
    roof.roughness = 0.86;
    roof.envMapIntensity = 0.28;
    roof.normalScale.set(0.42, 0.42);
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
    // 布篷需要第四档：深青。唐式市街的遮阳布本来就有青、赭、绛几种，
    // 只有蓝/赭/红三色时，赭与绛在夕照下会混成同一种"红"，
    // 整条街的篷布仍读成一片红（实测）。
    materials.clothGreen = cloth.clone();
    materials.clothGreen.name = 'street-cloth-green';
    materials.clothGreen.color.setHex(0x4d6b56);
    materials.clothGreen.roughness = 0.92;
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
    // 第三档墙色：偏土的赭黄。三档墙面各自有法线/粗糙度贴图，
    // 不能拿灰石路材质顶替——那张贴图偏亮偏白，会把整面墙读成白板。
    materials.plasterOchre = materials.plaster.clone();
    materials.plasterOchre.name = 'street-plaster-ochre';
    materials.plasterOchre.color.setHex(0xbfa886);
    // 铺面内壁：比外墙暗两档的暖灰，格扇后面的暗部。
    materials.shopInterior = makeMat('street-shop-interior', 0x2e251d, 0.94, 0);
    // 后排屋海的材质：比前店更浅、更偏冷，配合雾把纵深压进空气里，
    // 避免后排与前店同样的对比度，让整条街像两堵平行的墙。
    materials.plasterDistant = makeMat('street-plaster-distant', 0x8f8672, 0.94, 0);
    materials.roofDistant = makeMat('street-roof-distant', 0x59605f, 0.94, 0);
    materials.woodDistant = makeMat('street-wood-distant', 0x6f5240, 0.92, 0);
    // 远景塔：比近景深一档，才能在雾里读出一层层屋檐。
    // 塔身偏暖砖色、檐口深青灰、木构带赭红：三段明度差是"塔"与"白罐子"的区别。
    materials.pagodaBody = makeMat('pagoda-body', 0x9a7f63, 0.88, 0);
    materials.pagodaRoof = makeMat('pagoda-roof', 0x333b3d, 0.84, 0);
    materials.pagodaWood = makeMat('pagoda-wood', 0x8d4a3a, 0.82, 0);
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
    // 阴影相机必须覆盖整条街（-38 到 34，约 72m 长）与两座门楼（±39/41）。
    // 之前只覆盖 ±34，坊门与街口都落在阴影范围之外，
    // 那里自然没有接触阴影，地面读成一张平铺的纸（已实测确认）。
    // far 也要相应拉长，否则远处物体被 near/far 裁掉后不投影。
    sun.shadow.camera.far = 170;
    sun.shadow.camera.left = -52;
    sun.shadow.camera.right = 52;
    sun.shadow.camera.top = 56;
    sun.shadow.camera.bottom = -56;
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

    // 车辙泥路只铺在街内：范围必须严格落在街段 STREET_Z0(-38) 到 STREET_Z1(34)
    // 之内。之前 78m 长、中心 -3，实际覆盖 -42 到 36，越出门洞后压在铺装之上，
    // 近看门洞时读成"街尽头一块土黄平台"。
    const ROAD_Z0 = STREET_Z0;
    const ROAD_Z1 = STREET_Z1;
    const roadLen = ROAD_Z1 - ROAD_Z0;
    const roadMid = (ROAD_Z0 + ROAD_Z1) / 2;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(11.1, roadLen), materials.road);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.002, roadMid);
    road.receiveShadow = true;
    scene.add(road);

    for (const side of [-1, 1]) {
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(2.8, roadLen), materials.roadEdge);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(side * 6.95, 0.018, roadMid);
      walk.receiveShadow = true;
      scene.add(walk);

      const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(2.28, roadLen), materials.stone);
      sidewalk.rotation.x = -Math.PI / 2;
      sidewalk.position.set(side * 6.85, 0.026, roadMid);
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
    // 铺装底层：石板实例覆盖不到的地方（街两端）会露出这一层。
    // 之前这层用白底材质，结果坊门前露出两块刺眼的白斑；
    // 这里单独给一层石灰色底，漏出的部分读作"石板缝里的砂浆"。
    const pavingBase = new THREE.MeshStandardMaterial({
      name: 'street-paving-base',
      color: 0x8b8377,
      normalMap: materials.stone.normalMap,
      roughnessMap: materials.stone.roughnessMap,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.5,
    });
    // 铺装要盖住门洞前后的整段：石板实例排到 z≈-45 就结束，
    // 再往外露出的就是泥地。近看门洞时会读成"街尽头铺了一块土黄平台"。
    // 这里把底层平面延伸到坊门之后，并在门洞前后补一段石板。
    const paving = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 112), pavingBase);
    paving.rotation.x = -Math.PI / 2;
    paving.position.set(0, 0.024, -8);
    paving.receiveShadow = true;
    scene.add(paving);
    const slabGeometry = new THREE.BoxGeometry(0.62, 0.035, 0.94);
    const COLUMNS = 21;
    const ROWS = 104;
    const slabs = new THREE.InstancedMesh(slabGeometry, pavingMaterial, COLUMNS * ROWS);
    let slabCursor = 0;
    // 街面读成"补丁被面"的根因是每块石头的色差太大（明度差 30%），
    // 加上逐块随机平移，整条街读成拼布。这里把色差压到 8% 以内，
    // 只保留一层极淡的深浅错动，让铺装读作"同一批石料"；
    // 变化交给贴图、接缝与阴影，而不是靠每块石头换色。
    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLUMNS; column++) {
        const offset = row % 2 ? 0.21 : 0;
        // 位移只用于打破完全对齐的网格，幅度极小。
        const jitter = ((row * 7 + column * 11) % 9 - 4) * 0.006;
        const wobble = ((row * 13 + column * 5) % 7 - 3) * 0.002;
        matrix.makeTranslation(
          -4.20 + column * 0.42 + offset + jitter,
          0.026 + ((row + column) % 3) * 0.0012,
          STREET_Z0 + 0.8 + row * 0.92 + wobble,
        );
        slabs.setMatrixAt(slabCursor, matrix);
        color.setHex(
          (row + column) % 11 === 0 ? 0x84806f
            : (row + column) % 7 === 0 ? 0x7e7a6a
              : (row + column) % 4 === 0 ? 0x787565 : 0x7a7768,
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

    // 门洞地坪：坊门两侧是夯土墙，门洞正中那段地面既没有铺装也不属于街段，
    // 从街上看过去是一块土黄平台。这里在门洞内外各铺一段石板，
    // 让"穿过门洞"这件事在地面上也连续。
    for (const gateZ of [-39.2, 41.0]) {
      const apron = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 12.0), pavingBase);
      apron.rotation.x = -Math.PI / 2;
      apron.position.set(0, 0.028, gateZ - Math.sign(gateZ) * 3.0);
      apron.receiveShadow = true;
      scene.add(apron);
      // 石板：与主街同尺寸，横向 16 列、纵向 12 行，盖住 10.6×12 的铺装面。
      const apronSlabs = new THREE.InstancedMesh(slabGeometry, pavingMaterial, 16 * 12);
      let cursor = 0;
      for (let row = 0; row < 12; row++) {
        for (let column = 0; column < 16; column++) {
          matrix.makeTranslation(
            -4.20 + column * 0.56,
            0.030 + ((row + column) % 3) * 0.0012,
            gateZ - Math.sign(gateZ) * 3.0 - 5.4 + row * 0.94,
          );
          apronSlabs.setMatrixAt(cursor, matrix);
          color.setHex(
            (row + column) % 9 === 0 ? 0x84806f
              : (row + column) % 5 === 0 ? 0x7e7a6a : 0x7a7768,
          );
          apronSlabs.setColorAt(cursor, color);
          cursor++;
        }
      }
      apronSlabs.instanceMatrix.needsUpdate = true;
      if (apronSlabs.instanceColor) apronSlabs.instanceColor.needsUpdate = true;
      apronSlabs.receiveShadow = true;
      scene.add(apronSlabs);
    }

    // 车辙：两条连续的淡线读成"画上去的线"，不像真的碾过。
    // 改为断续的辙段：每段长度、宽度、深浅都不同，中间有断开，
    // 这样才像长期碾压出来的痕迹。
    const rutMat = new THREE.MeshStandardMaterial({
      color: 0x504234,
      roughness: 1,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
    });
    for (const lane of [-1.35, 1.35]) {
      let z = STREET_Z0 + 2;
      let seg = 0;
      while (z < STREET_Z1 - 2) {
        // 段长 1.4–4.2m，间隔 0.5–1.6m：辙痕本来就是断续的。
        const len = 1.4 + ((seg * 7 + 3) % 5) * 0.7;
        const gapLen = 0.5 + ((seg * 5 + 1) % 4) * 0.35;
        const width = 0.13 + ((seg * 3) % 3) * 0.025;
        const rut = new THREE.Mesh(new THREE.PlaneGeometry(width, len), rutMat);
        rut.rotation.x = -Math.PI / 2;
        rut.position.set(
          lane + ((seg * 11) % 5 - 2) * 0.018,
          0.021,
          z + len / 2,
        );
        scene.add(rut);
        z += len + gapLen;
        seg += 1;
      }
    }

    // 散落草料：独轮车与驮驴走过的地方会掉草。
    // 用实例化的小扁方块，几百根草叶只占一次 draw call。
    // 草叶尺寸要够大才看得见：0.03×0.012×0.22m 在 5m 外基本不可见（实测）。
    // 放大到 0.055×0.020×0.34m，并把撒落点放在街心而不是靠墙处。
    // 尺寸要"小而成堆"：0.055 x 0.020 x 0.34m 单根太大，看着像散落的木条。
    // 改为 0.022 x 0.008 x 0.16m 并加大数量，才读作"干草碎屑"。
    // 900 根撒在半径 1.2-1.9m 的圆里密度过高，读成"撒了一地木屑"（实测）。
    // 减到 360 根、收小半径，只在车与驴脚下成小片，才像零星掉落的草。
    const strawGeo = new THREE.BoxGeometry(0.022, 0.008, 0.16);
    const STRAW = 360;
    // 草料不能用布料材质：clothOchre 是织物，色相与铺装接近，
    // 撒在石板上几乎看不出来（实测）。单独建一份干草材质，
    // 更黄更亮、粗糙度更高，才读得出"散落的草"。
    const strawMat = new THREE.MeshStandardMaterial({
      name: 'street-straw',
      color: 0xc8a961,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.45,
    });
    const straw = new THREE.InstancedMesh(strawGeo, strawMat, STRAW);
    const strawMatrix = new THREE.Matrix4();
    const strawColor = new THREE.Color();
    // 撒落点跟独轮车、驮驴的实际位置对齐，并往街心偏一点：
    // 全贴着墙根时会被铺面阴影吞掉。
    const strawSpots = [
      [-2.2, 6.8, 0.85], [2.6, -9.2, 0.80], [-1.8, -26.0, 0.75],
      [-3.0, 18.2, 0.90], [2.9, -18.0, 0.80], [-3.0, 10.2, 0.70],
    ];
    let si = 0;
    for (const [sx, sz, radius] of strawSpots) {
      const count = Math.floor(STRAW / strawSpots.length);
      for (let k = 0; k < count && si < STRAW; k++) {
        // 用确定性伪随机，保证每次运行草料位置一致，便于验收对比。
        const a = ((k * 37 + si * 13) % 97) / 97;
        const b = ((k * 71 + si * 29) % 89) / 89;
        const r = radius * Math.sqrt(a);
        const ang = b * Math.PI * 2;
        strawMatrix.makeRotationY(ang * 1.7);
        // 石板顶面在 0.043-0.048（中心 0.026-0.030 + 半厚 0.0175），
        // 草料放在 0.028 会被埋进石板里看不见（实测）。
        strawMatrix.setPosition(
          sx + Math.cos(ang) * r,
          0.052,
          sz + Math.sin(ang) * r,
        );
        straw.setMatrixAt(si, strawMatrix);
        strawColor.setHex((k % 4 === 0) ? 0x9a7f4c : (k % 3 === 0 ? 0xb59352 : 0x8d7647));
        straw.setColorAt(si, strawColor);
        si += 1;
      }
    }
    straw.instanceMatrix.needsUpdate = true;
    if (straw.instanceColor) straw.instanceColor.needsUpdate = true;
    straw.castShadow = false;
    straw.receiveShadow = true;
    scene.add(straw);
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
  /* 坊内殿堂：街尽头的主景。
   * 目标要求"宏大建筑奇观"，而首街两侧只有市井小铺，屋面高度基本在同一线，
   * 天际线缺一个高点。放在街侧会被两排铺面完全挡住（实测过：x=±19 时
   * 屋顶只高出铺面 1m，从街上看不见）。因此改放在坊门之后的轴线上——
   * 唐长安里坊的空间逻辑本来就是"坊门内十字街、两侧宅邸寺观"，
   * 从街心穿过门洞看到的应当是殿宇，而不是另一排铺面。
   * 只用变换复用同一份 GLB 与共享材质，不增加下载量。 */
  function addWardHalls(hallRoot) {
    if (!hallRoot) return null;
    const group = new THREE.Group();
    group.name = 'ward-halls';
    // 尺寸经过实测标定：殿堂原本 scale 0.96、台基 1.35m 时屋面只到 8.5m，
    // 被门楼（脊高 6.48m、宽 15m）完全挡住，从街上只看得到一片白墙。
    // 现在 scale 1.5、台基 3.2m，屋面到 14.4m，能在门楼之上露出整片屋顶——
    // 这是"宏大建筑奇观"在街景里唯一能成立的位置：街道尽头的主景。
    const SCALE = 1.5;
    const BASE_H = 3.2;
    const HALL_Z = -52.0;
    const baseW = 16.6;
    const baseD = 12.2;

    const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, BASE_H, baseD), materials.stone);
    base.position.set(0, BASE_H / 2 - 0.02, HALL_Z);
    base.castShadow = base.receiveShadow = true;
    group.add(base);
    const coping = new THREE.Mesh(new THREE.BoxGeometry(baseW + 0.5, 0.26, baseD + 0.5), materials.stone);
    coping.position.set(0, BASE_H - 0.06, HALL_Z);
    group.add(coping);
    // 台基压边下一道暗色墙脚，避免台基读成一块大方盒子。
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(baseW + 0.2, 0.5, baseD + 0.2),
      materials.darkWood,
    );
    plinth.position.set(0, 0.25, HALL_Z);
    group.add(plinth);

    const hall = kitInstance(hallRoot, {
      position: [0, BASE_H, HALL_Z],
      rotationY: Math.PI,
      scale: SCALE,
    });
    hall.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!material) return;
      // 殿堂用比市井更重的木色与更深的屋面，读作"更高等级"。
      // 匹配运行时材质名（kitApplySharedMaterials 已把 mat_* 换成 street-*）。
      const name = material.name || '';
      if (/street-red-wood/i.test(name)) node.material = materials.redWood;
      else if (/street-wood|street-darkwood/i.test(name)) node.material = materials.darkWood;
      else if (/street-roof/i.test(name)) node.material = materials.roof;
      else if (/street-plaster/i.test(name)) node.material = materials.plaster;
    });
    group.add(hall);
    // 殿前踏道：从坊门地面接到台基，给主景一条可读的路径。
    const STEPS = 7;
    for (let i = 0; i < STEPS; i++) {
      const h = BASE_H * (STEPS - i) / STEPS;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, h, 0.74),
        materials.stone,
      );
      step.position.set(0, h / 2, -45.3 - i * 0.74);
      step.receiveShadow = true;
      step.castShadow = true;
      group.add(step);
    }
    scene.add(group);
    state.wardHalls = 1;
    return group;
  }

  /* 坊墙：唐长安的里坊以夯土墙围合，墙头压瓦。之前这里是一块无构造的
   * 平板盒子，远看读成一块灰绿色板子。这里按"台基 + 墙身 + 双坡瓦顶"
   * 三段构造，并让门洞后一定有建筑封住视线。 */
  function createWardWall(shopRoot, tavernRoot) {
    const group = new THREE.Group();
    group.name = 'ward-wall';

    const capRoof = materials.roof;
    // 瓦垄用同一份瓦面材质的深色克隆：坊墙离街只有十几米，
    // 与铺面共用 roof 材质会看不出墙头与屋面的差别。
    const capTile = materials.roofTile || (materials.roofTile = materials.roof.clone());
    // 一段坊墙：长度可变，构造固定。
    const addWall = (x, z, width) => {
      const bodyH = 3.05;
      const base = new THREE.Mesh(new THREE.BoxGeometry(width + 0.34, 0.42, 1.02), materials.stone);
      base.position.set(x, 0.21, z);
      base.receiveShadow = true;
      base.castShadow = true;
      group.add(base);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, bodyH, 0.78), materials.plaster);
      body.position.set(x, 0.42 + bodyH / 2, z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // 墙头：两道坡瓦，中间一道脊。单块平板读不出"墙头"，必须双坡。
      const capY = 0.42 + bodyH;
      for (const side of [-1, 1]) {
        const slope = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.11, 0.66), capRoof);
        slope.position.set(x, capY + 0.16, z + side * 0.28);
        slope.rotation.x = -side * 0.26;
        slope.castShadow = true;
        slope.receiveShadow = true;
        group.add(slope);
        // 瓦垄：沿墙长每 0.34m 一道，给墙头一点肌理。
        const rolls = Math.max(4, Math.round((width + 0.5) / 0.34));
        for (let i = 0; i < rolls; i++) {
          const rx = x - (width + 0.5) / 2 + (width + 0.5) * (i + 0.5) / rolls;
          const roll = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.62), capTile);
          roll.position.set(rx, capY + 0.24, z + side * 0.28);
          roll.rotation.x = -side * 0.26;
          group.add(roll);
        }
      }
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(width + 0.56, 0.16, 0.16), capTile);
      ridge.position.set(x, capY + 0.30, z);
      ridge.castShadow = true;
      group.add(ridge);
    };

    // 北端（坊门之后）与南端（街口之后）：连续墙段，只在门洞处断开。
    for (const z of [-43.5, 39.5]) {
      for (const x of [-23, -13.6, 13.6, 23]) addWall(x, z, 9.2);
      // 门洞两侧的短墙，把门楼边缘到外侧长墙之间补满。
      for (const side of [-1, 1]) addWall(side * 6.3, z, 5.8);
    }

    // 门洞之后必须有建筑：否则从街上穿过门洞看到的是雾里的一片白。
    // 正中不放铺面——那里留给 addWardHalls 的殿堂作主景；
    // 只在两侧各补一栋，把门洞两侧的空隙填住。
    // 两侧建筑要退出视线锥：之前放在 x=±22、z=-47.5，酒肆的红色布篷
    // 正好从门洞两侧各露出一个角，近看门洞像墙脚挂着两块红牌（已实测定位）。
    const beyond = [
      [-14.5, -52.0, Math.PI, 0.9, shopRoot],
      [14.5, -52.0, Math.PI, 0.9, shopRoot],
      [-26.0, -50.0, Math.PI, 0.86, tavernRoot],
      [26.0, -50.0, Math.PI, 0.86, tavernRoot],
    ];
    for (const [x, z, ry, scale, root] of beyond) {
      const building = kitInstance(root, { position: [x, -0.02, z], rotationY: ry, scale });
      building.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = true;
        const material = Array.isArray(node.material) ? node.material[0] : node.material;
        if (!material) return;
        const name = material.name || '';
        if (/street-plaster/i.test(name)) node.material = materials.plasterDistant;
        else if (/street-shop-interior/i.test(name)) node.material = materials.shopInterior;
        else if (/street-roof/i.test(name)) node.material = materials.roofDistant;
        else if (/street-red-wood|street-wood|street-darkwood/i.test(name)) {
          node.material = materials.woodDistant;
        }
      });
      group.add(building);
    }
    // 街口（南端）门洞之后同样不能是空地。
    const beyondSouth = kitInstance(tavernRoot, {
      position: [0, -0.02, 48.5],
      rotationY: Math.PI,
      scale: 1.0,
    });
    beyondSouth.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = true;
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!material) return;
      const name = material.name || '';
      if (/street-plaster/i.test(name)) node.material = materials.plaster;
      else if (/street-shop-interior/i.test(name)) node.material = materials.shopInterior;
      else if (/street-roof/i.test(name)) node.material = materials.roof;
      else if (/street-red-wood|street-wood|street-darkwood/i.test(name)) {
        node.material = materials.wood;
      }
    });
    group.add(beyondSouth);
    scene.add(group);
    return group;
  }

  /* 石狮：用体块拼出可辨认的坐狮轮廓（须弥座 + 身 + 前腿 + 昂起的头 + 鬃鬣）。
   * 街景尺度上不求写实，只求读得出"一对石兽蹲在坊门前"。
   * 石狮朝外守门，因此朝向随坊门的 facing 一起转。 */
  function addStoneLion(parent, x, z, facing, side) {
    const lion = new THREE.Group();
    lion.position.set(x, 0, z);
    // 石狮要够大才读得出"镇守"：初版约 1.5m 高，在 4.5m 外只有一小团。
    lion.scale.setScalar(1.45);
    lion.rotation.y = facing > 0 ? 0 : Math.PI;
    lion.name = 'gate-stone-lion';

    const stone = materials.stone;
    const dark = materials.darkWood;

    // 须弥座
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 1.35), stone);
    pedestal.position.set(0, 0.21, 0);
    pedestal.castShadow = pedestal.receiveShadow = true;
    lion.add(pedestal);
    const pedTop = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 1.22), stone);
    pedTop.position.set(0, 0.48, 0);
    lion.add(pedTop);

    // 身：坐姿，前高后低
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), stone);
    body.scale.set(0.34, 0.40, 0.44);
    body.position.set(0, 0.86, -0.05);
    body.castShadow = true;
    lion.add(body);

    // 前腿：两根立柱，撑在须弥座上
    for (const lx of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.52, 8), stone);
      leg.position.set(lx, 0.72, 0.26);
      leg.castShadow = true;
      lion.add(leg);
      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.26), stone);
      paw.position.set(lx, 0.52, 0.34);
      lion.add(paw);
    }

    // 头：昂起，略侧向街心
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), stone);
    head.scale.set(0.25, 0.25, 0.23);
    head.position.set(0, 1.32, 0.10);
    head.castShadow = true;
    lion.add(head);
    // 吻部
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.18), stone);
    muzzle.position.set(0, 1.26, 0.26);
    lion.add(muzzle);
    // 眼：两颗暗点，正面能看出朝向
    for (const ex of [-0.10, 0.10]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), dark);
      eye.position.set(ex, 1.38, 0.24);
      lion.add(eye);
    }
    // 鬃鬣：一圈短锥，从颅后向外，读作石狮的卷鬃
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.20, 5), stone);
      tuft.position.set(
        Math.cos(a) * 0.21,
        1.34 + Math.sin(a) * 0.13,
        -0.05 + Math.sin(a) * 0.10,
      );
      tuft.rotation.z = a;
      tuft.castShadow = true;
      lion.add(tuft);
    }
    // 尾：从身后上卷
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.03, 0.46, 6), stone);
    tail.position.set(0, 1.02, -0.44);
    tail.rotation.x = -0.55;
    lion.add(tail);

    // 面朝街心一侧略偏，两只狮子的头因此不完全平行。
    lion.rotation.y += side * 0.16 * (facing > 0 ? 1 : -1);
    parent.add(lion);
    return lion;
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
    // 坊门两侧的一对石狮：唐式坊门本有石兽守门，
    // 只有石柱与门楼时，门洞读成"一个洞"，缺少镇守的体量。
    for (const side of [-1, 1]) {
      addStoneLion(gate, side * 4.55, z + facing * 2.35, facing, side);
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
    // 门楼的屋面同样需要瓦垄：整条街的屋面都有瓦垄，只有门楼是一块黑板，
    // 从街上一眼就能看出它是临时搭的。
    for (const side of [-1, 1]) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.17, 3.35), materials.roof);
      slab.position.set(0, 6.0, z + side * 1.38);
      slab.rotation.x = -side * slope;
      slab.castShadow = slab.receiveShadow = true;
      gate.add(slab);
      // 瓦垄：沿门楼长度方向每 0.36m 一道。
      const rolls = 42;
      for (let i = 0; i < rolls; i++) {
        const rx = -7.4 + 14.8 * (i + 0.5) / rolls;
        const roll = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 3.3), materials.roofTile);
        roll.position.set(rx, 6.10, z + side * 1.38);
        roll.rotation.x = -side * slope;
        gate.add(roll);
      }
      // 檐口压边：把坡面下缘收成一条明确的线。
      const edge = new THREE.Mesh(new THREE.BoxGeometry(15.3, 0.10, 0.16), materials.roofTile);
      edge.position.set(0, 6.0 - Math.sin(slope) * 1.66, z + side * 2.72);
      gate.add(edge);
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
    // 门楼斗拱：唐式坊门在梁上有一排铺作托住瓦顶。
    // 之前梁上直接压瓦，门楼读成"两根柱子架一块板"，没有等级。
    // 这里沿门宽排 9 朵，每朵由栌斗 + 两层出跳组成，与殿堂构件同一套比例。
    const douSize = 0.30;
    for (let i = 0; i < 9; i++) {
      const dx = -6.0 + 12.0 * (i / 8);
      // 栌斗
      const dou = new THREE.Mesh(
        new THREE.BoxGeometry(douSize * 1.15, douSize * 0.75, douSize * 1.15),
        materials.darkWood,
      );
      dou.position.set(dx, 5.44, z);
      dou.castShadow = true;
      gate.add(dou);
      // 两跳出跳：每跳比上一跳更薄、更外伸。
      for (let jump = 0; jump < 2; jump++) {
        const armW = douSize * (1.9 - jump * 0.35);
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(armW, douSize * 0.52, douSize * 2.4),
          materials.redWood,
        );
        arm.position.set(dx, 5.62 + jump * douSize * 0.55, z);
        arm.castShadow = true;
        gate.add(arm);
        // 跳头的小斗
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(douSize * 0.9, douSize * 0.5, douSize * 0.9),
          materials.darkWood,
        );
        cap.position.set(dx, 5.78 + jump * douSize * 0.55, z);
        gate.add(cap);
      }
    }
    // 斗拱之上的通长枋：把 9 朵铺作连成一条，托住瓦顶。
    const topBeam = new THREE.Mesh(
      new THREE.BoxGeometry(14.6, 0.26, 0.72),
      materials.redWood,
    );
    topBeam.position.set(0, 6.28, z);
    topBeam.castShadow = true;
    gate.add(topBeam);

    // 门额：梁下的一块横匾底，写坊名。
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 1.12, 0.16),
      materials.darkWood,
    );
    plaque.position.set(0, 4.62, z + 0.30 * facing);
    plaque.castShadow = true;
    gate.add(plaque);

    const sign = makeSignMesh('西市', 3.3, 0.86, { vertical: false, font: 112 });
    sign.position.set(0, 4.62, z + 0.40 * facing);
    if (facing < 0) sign.rotation.y = Math.PI;
    gate.add(sign);
    scene.add(gate);
    return gate;
  }

  /* 远景楼阁式塔：五层，逐层收分，每层"塔身 + 铺作带 + 檐口 + 平坐"四段。
   * 之前每层只是一段白圆柱加一片开口锥面，远看像几节白罐子叠着——
   * 檐口是薄片、塔身没有分段的木构，读不出"塔"。 */
  function createPagoda() {
    const pagoda = new THREE.Group();
    pagoda.name = 'distant-pagoda';
    // 塔放在坊门之后的偏侧：正对轴线会被殿堂完全挡住（实测），
    // 偏到 x=-24 后与殿堂各占一条天际线，从街心看是"左塔右殿"的层次。
    pagoda.position.set(-24.0, 0, -66);
    const stone = materials.pagodaBody;
    const eaveMat = materials.pagodaRoof;
    const woodMat = materials.pagodaWood;

    let baseY = 0;
    for (let i = 0; i < 5; i++) {
      const radius = 2.45 - i * 0.28;
      const bodyH = 2.9 - i * 0.16;
      // 塔身：微收分的柱身，每层比下层细一档。
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.94, radius, bodyH, 12),
        stone,
      );
      body.position.y = baseY + bodyH / 2;
      body.castShadow = body.receiveShadow = true;
      pagoda.add(body);

      // 木构带：塔身顶部一圈深色额枋 + 每间一朵小斗，读出"层"的分界。
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 0.06, radius + 0.06, 0.26, 12),
        woodMat,
      );
      band.position.y = baseY + bodyH - 0.13;
      pagoda.add(band);
      const bracketCount = 8;
      for (let k = 0; k < bracketCount; k++) {
        const a = (k / bracketCount) * Math.PI * 2;
        const dou = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.22, 0.30), woodMat);
        dou.position.set(Math.sin(a) * (radius + 0.16), baseY + bodyH + 0.10, Math.cos(a) * (radius + 0.16));
        dou.rotation.y = a;
        pagoda.add(dou);
      }

      // 檐口：向外下斜的实心台锥（不是开口薄片），外缘再压一圈脊。
      const eave = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 0.30, radius + 1.18, 0.42, 12),
        eaveMat,
      );
      eave.position.y = baseY + bodyH + 0.38;
      eave.castShadow = true;
      pagoda.add(eave);
      const eaveEdge = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 1.18, radius + 1.22, 0.12, 12),
        eaveMat,
      );
      eaveEdge.position.y = baseY + bodyH + 0.20;
      pagoda.add(eaveEdge);

      // 平坐：檐口之上、上层塔身之下的平台，带一圈勾栏剪影。
      const deckY = baseY + bodyH + 0.62;
      const deck = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 0.12, radius + 0.12, 0.14, 12),
        woodMat,
      );
      deck.position.y = deckY;
      pagoda.add(deck);
      const railCount = 16;
      for (let k = 0; k < railCount; k++) {
        const a = (k / railCount) * Math.PI * 2;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.07), woodMat);
        post.position.set(Math.sin(a) * (radius + 0.06), deckY + 0.28, Math.cos(a) * (radius + 0.06));
        pagoda.add(post);
      }

      baseY = deckY + 0.06;
    }

    // 塔顶：覆钵 + 相轮 + 宝珠。
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), eaveMat);
    bowl.position.y = baseY + 0.42;
    bowl.scale.y = 0.72;
    pagoda.add(bowl);
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.03, 0.05, 6, 14), materials.gold);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = baseY + 0.92 + i * 0.20;
      pagoda.add(ring);
    }
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.10, 1.30, 8), materials.gold);
    spire.position.y = baseY + 1.62;
    pagoda.add(spire);
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), materials.gold);
    pearl.position.y = baseY + 2.32;
    pagoda.add(pearl);

    scene.add(pagoda);
    return pagoda;
  }

  /* 招牌贴图：底色、字色与边框色都可由行当指定。
   * 之前所有招牌都是同一种深木底 + 米色字，整条街的匾额看起来像同一块复制品。 */
  function signTexture(text, { vertical = false, font = 72, style = null } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = vertical ? 192 : 512;
    canvas.height = vertical ? 512 : 160;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const palette = style
      ? {
        top: '#' + style.board.toString(16).padStart(6, '0'),
        bottom: '#' + shadeHex(style.board, 0.72),
        border: '#' + shadeHex(style.glyph, 0.80),
        glyph: '#' + style.glyph.toString(16).padStart(6, '0'),
      }
      : { top: '#5b3927', bottom: '#342219', border: '#c6a15e', glyph: '#f1dfb7' };

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, palette.top);
    grad.addColorStop(1, palette.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(3, 3, w - 6, h - 6);
    // 木纹：几道极淡的横向深线，避免匾面读成一块纯色塑料。
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = 12 + i * (h - 24) / 5;
      ctx.beginPath();
      ctx.moveTo(6, y);
      ctx.lineTo(w - 6, y + 3);
      ctx.stroke();
    }
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = palette.glyph;
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

  /* 把十六进制颜色按比例压暗，用于匾额底部的渐变与边框。 */
  function shadeHex(hex, factor) {
    const r = Math.round(((hex >> 16) & 0xff) * factor);
    const g = Math.round(((hex >> 8) & 0xff) * factor);
    const b = Math.round((hex & 0xff) * factor);
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function makeSignMesh(text, width, height, opts = {}) {
    const group = new THREE.Group();
    // 招牌底：唐式市井的匾额多为深木本色，少数朱漆；底色按行当分配，
    // 不再整条街清一色黑底金字。
    const backingMat = opts.backing || materials.darkWood;
    const backing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, height + 0.12, 0.09), backingMat);
    backing.castShadow = true;
    group.add(backing);
    // 匾框：上下两道压边，读作"挂起来的匾"而不是一块贴纸。
    const frameMat = opts.frame || materials.darkWood;
    for (const dy of [-(height / 2 + 0.05), height / 2 + 0.05]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.20, 0.055, 0.13), frameMat);
      rail.position.y = dy;
      group.add(rail);
    }
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
  // 每个行当带自己的匾额底色与字形色：胡食铺用朱漆、香药铺用青、
  // 书肆用素木、茶坊用绿——街上一眼能分出"这家卖什么"。
  const SIGN_STYLES = {
    lacquer: { board: 0x8f3a2e, glyph: 0xf0dcae },
    ink: { board: 0x2b3230, glyph: 0xe6d8b4 },
    plain: { board: 0x6b5237, glyph: 0xf2e6c8 },
    jade: { board: 0x33564c, glyph: 0xe8dfc2 },
  };
  const SHOP_TRADES = [
    { board: '胡饼铺', short: '饼', style: 'lacquer' },
    { board: '香药铺', short: '香', style: 'jade' },
    { board: '绸缎庄', short: '绸', style: 'lacquer' },
    { board: '书肆', short: '书', style: 'plain' },
    { board: '茶坊', short: '茶', style: 'jade' },
    { board: '陶器行', short: '陶', style: 'plain' },
    { board: '果子铺', short: '果', style: 'ink' },
    { board: '鞍马行', short: '马', style: 'ink' },
  ];

  function shopTrade(entry) {
    const index = Math.abs(Math.round(entry.z) + entry.side * 3) % SHOP_TRADES.length;
    return SHOP_TRADES[index];
  }

  // 铺面的临街几何与招牌文案只有这一处定义：布局、招牌网格和验收记录共用，
  // 避免"挂幌位置"在展示代码和记录数据里各算一遍而互相漂移。
  /* 各档铺面的实测基座半宽（scale=1.0）。
   * 在场景里逐个量过基座（plinth / platform_core）的 z 范围换算得到：
   *   常铺 tier 0/1  4.690m → 2.345m
   *   常铺 tier 2    5.089m → 2.545m
   *   酒肆           6.652m → 3.326m
   *   重檐 tier 3    7.892m → 3.946m
   * 旧的估计值（常铺 2.62、酒肆 2.91）偏大偏小不一，
   * 导致酒肆与邻铺长期有 -0.004 ~ -0.535m 的基座侵入。
   * 排布与间隙核对必须共用这一份数据，否则两套半宽会互相矛盾（实测验收失败）。 */
  const BODY_HALF_WIDTH = { shop0: 2.345, shop1: 2.345, shop2: 2.545, shop3: 3.946, tavern: 3.326 };
  function bodyHalfWidth(kind, tier = 1) {
    if (kind === 'tavern') return BODY_HALF_WIDTH.tavern;
    if (tier === 3) return BODY_HALF_WIDTH.shop3;
    if (tier === 2) return BODY_HALF_WIDTH.shop2;
    return BODY_HALF_WIDTH.shop1;
  }

  function shopPlacement(entry) {
    const isTavern = entry.kind === 'tavern';
    const depth = isTavern ? 5.82 : 5.24;
    const halfD = bodyHalfWidth(entry.kind, entry.tier) * entry.scale;
    const trade = shopTrade(entry);
    const hasHanging = isTavern || Math.abs(entry.z) % 14 < 1;
    // 招牌位置随铺面档位走：高铺的匾额更高，低铺更低。
    // 之前所有匾额都在同一高度，从街上一眼看过去是一条水平线。
    const boardY = isTavern ? 5.25
      : entry.tier === 0 ? 4.00
        : entry.tier === 2 ? 4.72 : 4.35;
    return {
      isTavern,
      frontX: entry.side * (SHOP_X - (depth * entry.scale) / 2 - 0.075),
      facing: entry.side < 0 ? Math.PI / 2 : -Math.PI / 2,
      board: isTavern ? '西市酒肆' : trade.board,
      vertical: isTavern ? '酒' : trade.short,
      style: isTavern ? SIGN_STYLES.lacquer : SIGN_STYLES[trade.style] || SIGN_STYLES.plain,
      boardY,
      hasHanging,
      halfD,
      hangingZ: hasHanging ? entry.z + halfD - 0.42 : null,
    };
  }

  function addBuildingSigns(entry) {
    const { z, side } = entry;
    const placement = shopPlacement(entry);
    const { isTavern, frontX, facing, style } = placement;
    const board = makeSignMesh(
      placement.board,
      isTavern ? 2.3 : 1.8,
      isTavern ? 0.7 : 0.56,
      { font: isTavern ? 82 : 66, style },
    );
    board.position.set(frontX, placement.boardY, z);
    board.rotation.y = facing;
    board.scale.setScalar(1.15);
    scene.add(board);
    if (placement.hasHanging) {
      const hanging = makeSignMesh(placement.vertical, 0.56, 1.5, {
        vertical: true, font: 62, style,
      });
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
    // 雨篷不再在运行时另铺：构件库的 build_shop/build_townhouse 已经带一条
    // 有下垂弧与波浪垂边的布篷，颜色由 addBuilding 按铺面轮换。
    // 之前这里再叠一层平板布篷，街上会同时看到两套篷，且平板读成一根横杆。
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
    // 构件库的临街面在局部 -Z（Blender 的 +Y 经 yup 导出翻成 glTF -Z）。
    // 左铺（x<0）绕 Y 转 -π/2、右铺转 +π/2，临街面才朝向街心；
    // 这一点用"红布篷是否朝向街心"实测确认过，不要凭 +Z 假设去改。
    const group = kitInstance(root, {
      position: [entry.side * SHOP_X, 0, entry.z],
      rotationY: entry.side < 0 ? -Math.PI / 2 : Math.PI / 2,
      scale: entry.scale,
    });
    group.name = entry.kind + '-' + entry.side + '-' + entry.z;
    group.userData.entry = entry;
    // 檐柱（朱红）与木构/格扇（本木）必须分开上色。
    // 之前把两者合并成同一个 tint，轮到"青漆"那档时整间铺面的柱子、
    // 格扇、额枋全染成同一块青绿平板，铺面读成一块色板（实测在香药铺出现）。
    // 唐式铺面是"朱柱 + 木色格扇"的对比，柱色轮换、木作保持本木。
    const columnTint = [
      materials.redWood, materials.redWood, materials.darkWood,
    ][Math.abs(Math.round(entry.z)) % 3];
    const timberTint = [
      materials.wood, materials.wood, materials.darkWood,
    ][Math.abs(Math.round(entry.z)) % 3];
    // 墙面三色都用带法线/粗糙度的灰泥类材质。这里不能用 materials.stone：
    // 灰石路的贴图偏亮偏白，乘上后整面读成一块白板（实测在右侧铺面出现）。
    const plasterTint = [
      materials.plaster, materials.plasterWarm, materials.plasterOchre,
    ][Math.abs(Math.round(entry.z)) % 3];
    // 布篷按铺面轮换颜色：整条街清一色红布篷会读成一条流水线。
    // 四色之间要拉开明度与色相，赭与绛在夕照下会混成同一种红，因此加入深青。
    const clothTint = [
      materials.clothBlue, materials.clothGreen, materials.clothOchre, materials.cloth,
    ][Math.abs(Math.round(entry.z)) % 4];
    group.traverse((node) => {
      if (!node.isMesh) return;
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!material) return;
      // 注意：这里必须匹配"运行时材质名"，不能匹配 GLB 里的语义名。
      // kitApplySharedMaterials 在装载时已把 mat_cloth / mat_plaster / mat_vermilion
      // 换成 street-cloth / street-plaster / street-red-wood，
      // 之前按 mat_* 匹配，整套按铺面换色的代码从未生效过（实测确认）。
      const name = material.name || '';
      if (/street-red-wood/i.test(name)) {
        node.material = columnTint;
      } else if (/street-wood/i.test(name)) {
        node.material = timberTint;
      } else if (/street-shop-interior/i.test(name)) {
        // 内壁必须保持深色：混进 plasterTint 会重新变白。
        node.material = materials.shopInterior;
      } else if (/street-plaster/i.test(name)) {
        node.material = plasterTint;
      } else if (/street-cloth/i.test(name)) {
        node.material = clothTint;
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
   * 屋顶轮廓、楼层高度与沿街方向都与前店错开，读出"坊内纵深"。
   *
   * 这里必须复用前排的真实材质，只把明度压暗一档：
   * 之前用 plasterDistant 之类的纯色无贴图材质，整排屋海读成一片白板墙，
   * 从街上一眼就能看出后排是假的（射线实测确认那片白就是这排）。
   * 现在按"乘一个暗色"的方式复用前排材质，贴图与法线仍在，
   * 远看是同一套建筑，只是退到后面、暗了一层。 */
  const distantTintCache = new Map();
  function distantTint(source, factor, name) {
    const key = source.name + '|' + factor;
    if (distantTintCache.has(key)) return distantTintCache.get(key);
    const material = source.clone();
    material.name = name;
    material.color = source.color.clone().multiplyScalar(factor);
    material.roughness = Math.min(1, (source.roughness ?? 0.9) + 0.04);
    material.envMapIntensity = Math.min(source.envMapIntensity ?? 0.8, 0.35);
    distantTintCache.set(key, material);
    return material;
  }

  /* 侧巷：唐式坊内除了主街，还有通往宅邸后院的曲巷。
   * 只有一条直街、两侧铺面连成铁板一块时，从街上看不出"坊内还有纵深"。
   * 这里在预留的巷口处补一条退进的巷子：两侧巷墙 + 巷底一栋铺面 +
   * 巷口地坪。巷宽 3.2–3.6m，退深 9m，能看见巷底的建筑但看不穿。
   * 全部复用现有 GLB 与共享材质，不增加下载量。 */
  function addSideAlleys(shopRoot, tavernRoot) {
    // 巷宽 4.6-5.0m：唐式坊内曲巷能容一辆车通过。
    // 3.2-3.6m 太窄，从街上看只像铺面之间的一条缝，读不出"巷口"。
    const LANE_GAPS = {
      '-1': [{ z: 3.0, width: 4.8 }, { z: -19.5, width: 4.6 }],
      1: [{ z: -5.0, width: 4.6 }, { z: 18.0, width: 5.0 }],
    };
    const DEPTH = 9.0;

    for (const side of [-1, 1]) {
      for (const gap of LANE_GAPS[String(side)] || []) {
        const group = new THREE.Group();
        group.name = 'side-alley-' + side + '-' + gap.z;

        // 巷口地坪：从街面铺装一直铺进巷底。
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(DEPTH, gap.width - 0.1),
          materials.road,
        );
        floor.rotation.x = -Math.PI / 2;
        floor.rotation.z = Math.PI / 2;
        floor.position.set(
          side * (SHOP_X + DEPTH / 2 - 1.2),
          0.026,
          gap.z,
        );
        floor.receiveShadow = true;
        group.add(floor);

        // 巷墙：巷子两侧各一道墙，把巷子围出来。
        // 墙高比铺面矮一档，读作"后院墙"而不是主街铺面。
        const wallH = 2.55;
        for (const along of [-1, 1]) {
          const wall = new THREE.Mesh(
            new THREE.BoxGeometry(DEPTH, wallH, 0.42),
            materials.plaster,
          );
          wall.position.set(
            side * (SHOP_X + DEPTH / 2 - 1.2),
            wallH / 2,
            gap.z + along * (gap.width / 2 + 0.21),
          );
          wall.castShadow = true;
          wall.receiveShadow = true;
          group.add(wall);
          // 墙头压瓦，避免读成一堵水泥板。
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(DEPTH + 0.2, 0.14, 0.60),
            materials.roof,
          );
          cap.position.set(
            side * (SHOP_X + DEPTH / 2 - 1.2),
            wallH + 0.07,
            gap.z + along * (gap.width / 2 + 0.21),
          );
          group.add(cap);
        }

        // 巷底：一栋退进的小铺面，挡住视线尽头。
        const end = kitInstance(shopRoot, {
          // 巷底铺面的临街面必须朝向巷口（即街心方向）。
          // 主街左铺（x<0）用 -π/2 让临街面朝 +X，巷底同侧因此也用 -π/2；
          // 写成 +π/2 会让它背对巷子，巷底就只剩一堵后墙。
          position: [side * (SHOP_X + DEPTH - 0.6), 0, gap.z],
          rotationY: side < 0 ? -Math.PI / 2 : Math.PI / 2,
          scale: 0.88,
        });
        end.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = false;
          node.receiveShadow = true;
          const material = Array.isArray(node.material) ? node.material[0] : node.material;
          if (!material) return;
          const name = material.name || '';
          if (/street-plaster/i.test(name)) node.material = materials.plasterWarm;
          else if (/street-shop-interior/i.test(name)) node.material = materials.shopInterior;
          else if (/street-roof/i.test(name)) node.material = distantTint(materials.roof, 0.82, 'street-roof-alley');
          else if (/street-cloth/i.test(name)) node.material = distantTint(materials.clothOchre, 0.85, 'street-cloth-alley');
          else if (/street-red-wood|street-wood|street-darkwood/i.test(name)) {
            node.material = distantTint(materials.wood, 0.70, 'street-wood-alley');
          }
        });
        group.add(end);

        // 巷口两根石柱：给巷口一个明确的边界，不然只是墙上一个洞。
        for (const along of [-1, 1]) {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 2.9, 0.34),
            materials.stone,
          );
          post.position.set(
            side * (SHOP_FRONT - 0.1),
            1.45,
            gap.z + along * (gap.width / 2 + 0.28),
          );
          post.castShadow = true;
          post.receiveShadow = true;
          group.add(post);
        }

        // 巷口护墙：把让开铺面后暴露的裸山墙挡住。
        // 只留石柱和巷墙时，巷口两侧是邻铺的米色山墙，俯瞰看过去是一块裸板，
        // 比不开巷更刺眼（实测）。这里在巷口两侧各贴一段与铺面同高的护墙，
        // 墙头压瓦，让它读作"巷口两侧的房子"，而不是"被切开的铺面断面"。
        // 护墙沿 X 方向从临街面伸到铺面中心，沿 Z 方向很薄：
        // 它是"巷口两侧的墙面"，不能横在巷口前面。
        // 上一版把 X/Z 尺寸写反（X 0.55、Z 2.6），等于在巷口前横了一道墙，
        // 从俯瞰看巷子被完全堵住（实测）。
        const wingH = 3.4;
        const wingLen = (SHOP_X - SHOP_FRONT) + 0.5;
        const wingX = side * (SHOP_FRONT + wingLen / 2 - 0.15);
        for (const along of [-1, 1]) {
          const wingZ = gap.z + along * (gap.width / 2 + 0.30);
          const wing = new THREE.Mesh(
            new THREE.BoxGeometry(wingLen, wingH, 0.46),
            materials.plaster,
          );
          wing.position.set(wingX, wingH / 2, wingZ);
          wing.castShadow = true;
          wing.receiveShadow = true;
          group.add(wing);
          // 墙头压瓦：沿 X 方向双坡，与坊墙同一套做法。
          for (const s2 of [-1, 1]) {
            const cap = new THREE.Mesh(
              new THREE.BoxGeometry(wingLen + 0.3, 0.10, 0.44),
              materials.roof,
            );
            cap.position.set(wingX, wingH + 0.10, wingZ + s2 * 0.18);
            cap.rotation.x = -s2 * 0.30;
            group.add(cap);
          }
        }

        scene.add(group);
      }
    }
    return true;
  }

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
          const name = material.name || '';
          if (/street-plaster/i.test(name)) {
            node.material = distantTint(materials.plaster, 0.72, 'street-plaster-back');
          } else if (/street-shop-interior/i.test(name)) {
            node.material = materials.shopInterior;
          } else if (/street-roof/i.test(name)) {
            node.material = distantTint(materials.roof, 0.80, 'street-roof-back');
          } else if (/street-cloth/i.test(name)) {
            node.material = distantTint(materials.cloth, 0.78, 'street-cloth-back');
          } else if (/street-red-wood|street-wood|street-darkwood/i.test(name)) {
            node.material = distantTint(materials.wood, 0.66, 'street-wood-back');
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
      // 铺面内壁：格扇后面那层暗色面。没有它，格眼后面直接透出后墙白灰，
      // 整面读成"白墙贴了一排木格子"。
      mat_interior: materials.shopInterior,
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
    const [shopLowRoot, shopRoot, shopTallRoot, shopDoubleRoot, tavernRoot, hallRoot, residentMale, residentFemale] = await Promise.all([
      // 三档铺面：同一套构件，柱高 / 铺作跳数 / 举高 / 台基不同，
      // 屋脊高度 5.38 / 6.03 / 6.89 米。檐口因此有真实的高低错落。
      kitLoad('shop-low-shijing', '/assets/kit/architecture/shop-low-shijing.glb'),
      kitLoad('shop-shijing', '/assets/kit/architecture/shop-shijing.glb'),
      kitLoad('shop-tall-shijing', '/assets/kit/architecture/shop-tall-shijing.glb'),
      // 重檐铺面：这条街天际线的最高一档，只给少数大行铺用。
      kitLoad('shop-double-shijing', '/assets/kit/architecture/shop-double-shijing.glb'),
      kitLoad('tavern-shijing', '/assets/kit/architecture/tavern-shijing.glb'),
      // 殿堂构件：目标要求"宏大建筑奇观"，只靠市井小铺做不到。
      // 这里把已有的殿堂 GLB 作为坊内宏大量体放在街廓之后，
      // 与街面铺面共用同一套语义材质，不额外下载贴图。
      kitLoad('hall-shijing', '/assets/kit/architecture/hall-shijing.glb'),
      kitLoad('resident-male', '/assets/kit/architecture/resident-male.glb'),
      kitLoad('resident-female', '/assets/kit/architecture/resident-female.glb'),
    ]);
    // 源 GLB 保留分件网格；首街只把真实实例放进场景，背后的屋海由远景塔与
    // 两侧连续街墙建立纵深，不再重复加载 16 个不可读的完整建筑。
    setProgress(0.54, '排布临街铺面');

    // 概念图的市街靠两层与单层交错读出来；两层酒肆按铺面位置间隔布置，
    // 而不是只有一间。仍复用同一个酒肆 GLB，靠变换与共享材质区分类别。
    // 唐式市街是连排的：铺面之间几乎贴住，山墙被邻铺挡住。
    // 位置不能按固定步长算：每间铺面的 scale 不同，半深随之变化，
    // 固定步长会让个别相邻铺面互相侵入（实测出现 -0.018m 的重叠）。
    // 这里按"上一间的实际半深 + 本间半深 + 一条窄缝"累加排布。
    // 沿街半宽必须用实测的基座半宽，不能沿用旧的估计值。
    // 在场景里逐个量过基座（plinth / platform_core）的 z 范围，换算到 scale=1.0：
    //   常铺 tier 0/1  4.690m → 半宽 2.345m
    //   常铺 tier 2    5.089m → 半宽 2.545m
    //   酒肆           6.652m → 半宽 3.326m
    //   重檐 tier 3    7.892m → 半宽 3.946m
    // 旧值（常铺 2.62、酒肆 2.91）与实测不符：酒肆偏小 0.42m，
    // 因此酒肆与邻铺一直有 -0.004 ~ -0.535m 的基座侵入（实测确认）。
    const halfDepthOf = (kind, scale, tier = 1) =>
      bodyHalfWidth(kind, tier) * scale;
    const SEAM = 0.12;

    // 巷口：唐式坊内是"十字街 + 若干曲巷"，一条直街两侧铺满铁板一块，
    // 读不出坊内纵深。这里在两侧各留两个巷口（gap 以米计），
    // 巷口处不放铺面，并在缺口后补一条退进的巷子。
    // 巷宽 4.6-5.0m：唐式坊内曲巷能容一辆车通过。
    // 3.2-3.6m 太窄，从街上看只像铺面之间的一条缝，读不出"巷口"。
    const LANE_GAPS = {
      '-1': [{ z: 3.0, width: 4.8 }, { z: -19.5, width: 4.6 }],
      1: [{ z: -5.0, width: 4.6 }, { z: 18.0, width: 5.0 }],
    };

    const layLane = (side, plan, startZ) => {
      const lane = [];
      let cursor = startZ;
      const gaps = LANE_GAPS[String(side)] || [];
      plan.forEach((item, i) => {
        // 三档铺面沿街半深相同（进深都是 5.24m），所以排布不受档位影响；
        // 档位只改高度与屋顶，不改占地。
        const scale = item.kind === 'tavern' ? 0.96
          : i % 4 === 0 ? 0.97 : i % 3 === 0 ? 1.03 : 1.0;
        const halfD = halfDepthOf(item.kind, scale, item.tier || 1);
        let z = cursor + halfD;
        // 若这一间会压住巷口，就整体越过巷口再放。
        const blocking = gaps.find((g) => z + halfD > g.z - g.width / 2 && z - halfD < g.z + g.width / 2);
        if (blocking) {
          cursor = blocking.z + blocking.width / 2 + SEAM;
          z = cursor + halfD;
        }
        lane.push({ side, z, kind: item.kind, tier: item.tier || 1, scale });
        cursor = z + halfD + SEAM;
      });
      return lane;
    };

    // 左侧从 -30.25 起、右侧从 -33.0 起，两侧错开半间，避免正对面的铺面
    // 檐口在同一位置对齐。tier 是三档铺面（0 低 / 1 常 / 2 高）。
    const leftPlan = [
      { kind: 'shop', tier: 0 }, { kind: 'tavern' }, { kind: 'shop', tier: 3 },
      { kind: 'shop', tier: 1 }, { kind: 'shop', tier: 0 }, { kind: 'shop', tier: 1 },
      { kind: 'tavern' }, { kind: 'shop', tier: 2 }, { kind: 'shop', tier: 0 },
      { kind: 'tavern' }, { kind: 'shop', tier: 1 }, { kind: 'shop', tier: 0 },
    ];
    const rightPlan = [
      { kind: 'shop', tier: 1 }, { kind: 'shop', tier: 0 }, { kind: 'shop', tier: 1 },
      { kind: 'tavern' }, { kind: 'shop', tier: 3 }, { kind: 'shop', tier: 1 },
      { kind: 'shop', tier: 0 }, { kind: 'tavern' }, { kind: 'shop', tier: 1 },
      { kind: 'shop', tier: 2 }, { kind: 'tavern' }, { kind: 'shop', tier: 0 },
    ];
    const entries = [
      ...layLane(-1, leftPlan, -30.25),
      ...layLane(1, rightPlan, -33.0),
    ];
    // 按档位选对应的 GLB：同一套构件，三份不同高度的导出。
    const rootFor = (entry) => {
      if (entry.kind === 'tavern') return tavernRoot;
      if (entry.tier === 0) return shopLowRoot;
      if (entry.tier === 2) return shopTallRoot;
      if (entry.tier === 3) return shopDoubleRoot;
      return shopRoot;
    };
    entries.forEach((entry) => addBuilding(rootFor(entry), entry));
    addSideAlleys(shopRoot, tavernRoot);
    flushBatches();
    addBackRows(shopRoot, tavernRoot);
    addWardHalls(hallRoot);
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
    // 库里已有四种树（street / blossom / willow / pine），此前只用了一种，
    // 街上读成同一棵树复制七遍。唐长安的坊内行道树本就混植，
    // 这里按四种混种，并复用同一份 GLB 的 LOD1，不增加下载量。
    const [streetTree, blossomTree, willowTree, pineTree, matureTree] = await Promise.all([
      loadTree('/assets/library/vegetation/studies/street-lod1.glb'),
      loadTree('/assets/library/vegetation/studies/blossom-lod1.glb'),
      loadTree('/assets/library/vegetation/studies/willow-lod1.glb'),
      loadTree('/assets/library/vegetation/studies/pine-lod1.glb'),
      loadTree('/assets/library/polyhaven/tree_small_02/runtime.glb'),
    ]);
    for (const tree of [streetTree, blossomTree, willowTree, pineTree, matureTree]) {
      tree.updateMatrixWorld(true);
    }

    const variants = [
      { root: streetTree, scale: 0.62, sink: 0.02 },
      { root: blossomTree, scale: 0.58, sink: 0.02 },
      { root: willowTree, scale: 0.70, sink: 0.02 },
      { root: pineTree, scale: 0.54, sink: 0.02 },
      { root: matureTree, scale: 0.78, sink: 0.02 },
    ];
    // 沿街两侧交替种，避免同一种树连着出现两次。
    const placements = [
      [-5.3, 28.5, 0], [5.3, 22.5, 1], [-5.3, 15.8, 2], [5.3, 9.5, 3],
      [-5.3, -7.5, 1], [5.3, -17.0, 0], [-5.3, -28.5, 2],
      [5.6, 2.0, 4], [-5.5, -12.0, 3], [5.5, -20.5, 4],
    ];
    const treeMaterials = new Map();
    placements.forEach(([x, z, variantIndex], i) => {
      const variant = variants[variantIndex % variants.length];
      const tree = variant.root.clone(true);
      tree.position.set(x, variant.sink, z);
      // 每棵树单独转一个角度、给一点尺寸抖动，读作"种的树"而不是"复制的树"。
      tree.rotation.y = (x < 0 ? 0.7 : -0.4) + z * 0.03 + (i % 3) * 0.18;
      tree.scale.setScalar(variant.scale * (0.94 + (i % 4) * 0.035));
      tree.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
        const source = Array.isArray(node.material) ? node.material[0] : node.material;
        if (!source) return;
        // 每棵树的材质按"树型 + 明度"缓存一份，不逐棵克隆。
        const tint = 0.82 + (i % 5) * 0.055;
        const key = 'street-tree|' + (source.name || 'leaf') + '|' + tint.toFixed(2);
        if (!treeMaterials.has(key)) {
          const clone = source.clone();
          clone.color?.multiplyScalar(tint);
          treeMaterials.set(key, clone);
        }
        node.material = treeMaterials.get(key);
      });
      tree.name = 'street-tree';
      scene.add(tree);
    });
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
    // 市集的"使用痕迹"：独轮车与驮货的驴。
    // 只有铺面、摊位与行人时，街面读成干净的展台；
    // 这两类大轮廓物件是"这里真的在运货"的关键信号，也补上街心的体积感。
    addHandcarts();
    addPackDonkeys();
  }

  /* 独轮车：一只木轮 + 车架 + 两侧货担。
   * 唐式市集短途运货主要靠这种独轮车，形制简单、轮廓清楚。 */
  function addHandcarts() {
    const placements = [
      // [x, z, 朝向]
      [-2.6, 6.4, 0.42],
      [3.05, -9.5, -0.55],
      [-2.2, -26.5, 0.28],
    ];
    for (const [x, z, yaw] of placements) {
      const cart = new THREE.Group();
      cart.position.set(x, 0.03, z);
      cart.rotation.y = yaw;

      // 车轮：竖立的圆盘，轮缘一圈木条。
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.09, 16), materials.darkWood);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.42, 0);
      wheel.castShadow = true;
      cart.add(wheel);
      for (let i = 0; i < 8; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.05), materials.wood);
        spoke.rotation.x = (i / 8) * Math.PI;
        spoke.position.set(0, 0.42, 0);
        spoke.castShadow = true;
        cart.add(spoke);
      }
      // 车架：一根横梁 + 两根把手。
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 1.85), materials.wood);
      beam.position.set(0, 0.80, 0);
      beam.castShadow = beam.receiveShadow = true;
      cart.add(beam);
      for (const side of [-1, 1]) {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.15), materials.wood);
        handle.position.set(side * 0.30, 0.92, -1.28);
        handle.rotation.x = 0.16;
        handle.castShadow = true;
        cart.add(handle);
      }
      // 两侧货担：竹筐 + 麻袋，让车不是空架。
      for (const side of [-1, 1]) {
        const basket = makeBasket(0.24, 0.20);
        basket.position.set(side * 0.34, 0.92, -0.28);
        cart.add(basket);
        addProduce(basket, 0.06, 0.16);
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 9), materials.clothOchre);
        sack.scale.set(1, 0.78, 1.15);
        sack.position.set(side * 0.34, 1.10, 0.48);
        sack.castShadow = true;
        cart.add(sack);
      }
      cart.name = 'street-handcart';
      scene.add(cart);
    }
  }

  /* 驮货的驴：市集运输的另一半。
   * 用低多边形体块拼出可辨认的轮廓（身、头、四腿、驮架），
   * 不追求写实，只求在街景尺度上读得出"这是一头驮畜"。
   * 毛色不能用 materials.hair（近乎纯黑）：全黑会读成一块剪影，
   * 失去体块转折。这里单独给驴一身暖灰褐毛色，腹面再浅一档。 */
  const donkeyCoat = new THREE.MeshStandardMaterial({
    name: 'donkey-coat',
    color: 0x6f6154,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.55,
  });
  const donkeyCoatLight = new THREE.MeshStandardMaterial({
    name: 'donkey-coat-light',
    color: 0x9a8b7a,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.55,
  });
  const donkeyHoof = new THREE.MeshStandardMaterial({
    name: 'donkey-hoof',
    color: 0x2c2723,
    roughness: 0.78,
    metalness: 0,
    envMapIntensity: 0.4,
  });

  function addPackDonkeys() {
    const placements = [
      [-3.6, 18.5, 1.9],
      [3.4, -18.5, -1.2],
    ];
    for (const [x, z, yaw] of placements) {
      const donkey = new THREE.Group();
      donkey.position.set(x, 0.03, z);
      donkey.rotation.y = yaw;

      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), donkeyCoat);
      body.scale.set(0.30, 0.30, 0.62);
      body.position.set(0, 0.92, 0);
      body.castShadow = true;
      donkey.add(body);
      // 腹面浅一档：体块转折靠明度差读出来，不是靠全黑轮廓。
      const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), donkeyCoatLight);
      belly.scale.set(0.24, 0.20, 0.50);
      belly.position.set(0, 0.78, 0);
      donkey.add(belly);

      // 颈与头：低头歇脚的姿态，头低一点更像真的。
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.52, 8), donkeyCoat);
      neck.position.set(0, 1.16, 0.52);
      neck.rotation.x = -0.62;
      neck.castShadow = true;
      donkey.add(neck);
      const head = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), donkeyCoat);
      head.scale.set(0.14, 0.16, 0.30);
      head.position.set(0, 1.30, 0.78);
      head.castShadow = true;
      donkey.add(head);
      // 口鼻：浅色，给头一个明确的前端。
      const muzzle = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), donkeyCoatLight);
      muzzle.scale.set(0.10, 0.10, 0.14);
      muzzle.position.set(0, 1.22, 0.98);
      donkey.add(muzzle);
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), donkeyCoat);
        ear.position.set(side * 0.10, 1.48, 0.74);
        ear.rotation.z = side * 0.28;
        ear.castShadow = true;
        donkey.add(ear);
        // 眼：两颗小暗点，正面能看出朝向。
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), donkeyHoof);
        eye.position.set(side * 0.11, 1.34, 0.88);
        donkey.add(eye);
      }

      // 四条腿：细长，末端留出蹄。
      for (const [lx, lz] of [[-0.17, 0.38], [0.17, 0.38], [-0.17, -0.40], [0.17, -0.40]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.78, 7), donkeyCoat);
        leg.position.set(lx, 0.42, lz);
        leg.castShadow = true;
        donkey.add(leg);
        const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.10, 7), donkeyHoof);
        hoof.position.set(lx, 0.08, lz);
        hoof.castShadow = true;
        donkey.add(hoof);
      }
      // 尾巴。
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.55, 6), donkeyCoat);
      tail.position.set(0, 0.92, -0.62);
      tail.rotation.x = 0.30;
      donkey.add(tail);

      // 驮架：两侧的货捆，明确读作"运货的驴"。
      for (const side of [-1, 1]) {
        const bundle = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.52), materials.clothOchre);
        bundle.position.set(side * 0.30, 1.06, 0.02);
        bundle.rotation.z = side * 0.08;
        bundle.castShadow = true;
        donkey.add(bundle);
      }
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.46), materials.darkWood);
      saddle.position.set(0, 1.20, 0.02);
      saddle.castShadow = true;
      donkey.add(saddle);

      donkey.name = 'street-pack-donkey';
      scene.add(donkey);
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

  /* 后处理管线：Composer + 轻度泛光 + FXAA。
   * 之前 composer/fxaaPass/bloomPass 三个变量声明了却从未创建，
   * 场景直接走 renderer.render()，于是：
   *   - 灯笼、金饰、夕阳这些高光没有溢光，画面读成"塑料平光"；
   *   - 没有抗锯齿，屋檐与瓦垄的斜边在 1280 宽下有明显阶梯。
   * 这两项是"电影感"里最省成本、收益最直接的一层。 */
  function setupPostProcessing() {
    const addons = window.ChanganRenderingAddons;
    if (!addons?.EffectComposer || !addons.RenderPass) return false;
    composer = new addons.EffectComposer(renderer);
    composer.addPass(new addons.RenderPass(scene, camera));

    // 泛光：只让高光溢开一点。阈值要高（0.92），否则整条街发糊。
    // 半径也要小：0.72 会把整幅画面的大块区域抬起来，阴影被泛光填平，
    // 实测整条街明显变暗、暗部细节消失。改为 0.38 / strength 0.18。
    if (addons.UnrealBloomPass) {
      bloomPass = new addons.UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        0.18,   // strength
        0.38,   // radius
        0.92,   // threshold
      );
      composer.addPass(bloomPass);
    }

    // 输出必须走 OutputPass：它负责 sRGB 编码与色调映射。
    // 缺了它，composer 的最后一步写回画布时没有做 sRGB 转换，
    // 整幅画面会比直出暗一档（实测确认）。
    if (addons.OutputPass) {
      composer.addPass(new addons.OutputPass());
    }

    // FXAA 放在最后：先合成再抗锯齿，避免把泛光边缘二次模糊。
    if (addons.ShaderPass && addons.FXAAShader) {
      fxaaPass = new addons.ShaderPass(addons.FXAAShader);
      const pr = renderer.getPixelRatio();
      fxaaPass.material.uniforms.resolution.value.set(
        1 / (innerWidth * pr), 1 / (innerHeight * pr),
      );
      composer.addPass(fxaaPass);
    }
    return true;
  }

  function resize() {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // 后处理管线也要跟着改尺寸，否则窗口变化后泛光与 FXAA 会按旧尺寸采样。
    if (composer) composer.setSize(width, height);
    if (fxaaPass) {
      const pr = renderer.getPixelRatio();
      fxaaPass.material.uniforms.resolution.value.set(1 / (width * pr), 1 / (height * pr));
    }
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
    // 后处理不可用时退回直出，不能因为管线缺失就黑屏。
    // renderer.info 默认每趟 pass 自动清零，接上 composer 之后
    // info.render.calls 只会剩最后一趟的数值（实测为 1），验收记录因此失真。
    // 关掉自动清零、每帧手动清零，读到的才是整帧（含所有 pass）的真实总量。
    renderer.info.autoReset = false;
    renderer.info.reset();
    if (composer) composer.render(dt);
    else renderer.render(scene, camera);
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
      // 后处理必须在相机与渲染尺寸就位之后建立，否则首帧会按错误尺寸采样。
      state.postProcessing = setupPostProcessing();
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
