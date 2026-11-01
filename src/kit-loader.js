/* 构件库装载器：把 Blender 导出的 GLB 构件装进场景，并按语义材质共享。
 *
 * 设计要点：
 * - 同一 GLB 只加载一次，其 BufferGeometry 与 Material 由所有实例共享，
 *   通过变换、色彩与组合表现差异，避免每件模型重复带材质包。
 * - 材质按语义名（木/瓦/石/灰泥…）映射到全局共享 PBR 集；
 *   构件自带的预览色不会被当成最终贴图。
 * - 加载失败必须显式上报到 GAME.initErrors，不允许静默回退成方块。
 */

const KitLibrary = {
  cache: new Map(),
  materials: Object.create(null),
  stats: { loaded: 0, failed: 0, instances: 0, sharedGeometries: 0 },
  ready: false,
};

/* 共享 PBR 贴图集：每个语义材质只引用一套贴图，全城构件复用同一批纹理对象。
 * 这样增加建筑数量只增加几何与实例，不会线性增加显存与下载量。 */
const KIT_TEXTURES = {
  wood: {
    base: '/assets/library/production-materials/fine_grained_wood/basecolor_512.png',
    normal: '/assets/library/production-materials/fine_grained_wood/normal_512.png',
    rough: '/assets/library/production-materials/fine_grained_wood/roughness_512.png',
  },
  darkWood: {
    base: '/assets/library/production-materials/dark_wood/basecolor_512.png',
    normal: '/assets/library/production-materials/dark_wood/normal_512.png',
    rough: '/assets/library/production-materials/dark_wood/roughness_512.png',
  },
  plaster: {
    base: null,
    normal: '/assets/library/architecture/pbr/white_plaster_rough_01/normal.jpg',
    rough: '/assets/library/architecture/pbr/white_plaster_rough_01/roughness.jpg',
  },
  tile: {
    base: null,
    normal: '/assets/library/architecture/pbr/clay_roof_tiles_02/normal.jpg',
    rough: '/assets/library/architecture/pbr/clay_roof_tiles_02/roughness.jpg',
  },
  clay: {
    base: null,
    normal: '/assets/library/architecture/pbr/clay_plaster/normal.jpg',
    rough: '/assets/library/architecture/pbr/clay_plaster/roughness.jpg',
  },
  mud: {
    base: '/assets/library/production-materials/brown_mud_02/basecolor_512.png',
    normal: '/assets/library/production-materials/brown_mud_02/normal_512.png',
    rough: '/assets/library/production-materials/brown_mud_02/roughness_512.png',
  },
  cloth: {
    base: '/assets/library/production-materials/Fabric081C/basecolor_512.png',
    normal: '/assets/library/production-materials/Fabric081C/normal_512.png',
    rough: '/assets/library/production-materials/Fabric081C/roughness_512.png',
  },
};

const KIT_TEXTURE_CACHE = new Map();

function kitTexture(url, srgb, repeat = 1) {
  if (!url) return null;
  const key = url + '|' + repeat;
  if (KIT_TEXTURE_CACHE.has(key)) return KIT_TEXTURE_CACHE.get(key);
  const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  KIT_TEXTURE_CACHE.set(key, texture);
  return texture;
}

/* 语义材质表：一套贴图供全部分件复用。 */
function kitMaterialSet() {
  const make = (color, roughness, set, repeat) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      envMapIntensity: 0.9,
    });
    const tex = KIT_TEXTURES[set];
    if (tex) {
      const normal = kitTexture(tex.normal, false, repeat);
      const rough = kitTexture(tex.rough, false, repeat);
      const base = kitTexture(tex.base, true, repeat);
      if (normal) mat.normalMap = normal;
      if (rough) mat.roughnessMap = rough;
      if (base) mat.map = base;
      mat.normalScale.set(0.85, 0.85);
    }
    return mat;
  };
  const materials = {
    mat_timber: make(0xa07a58, 0.82, 'wood', 2),
    mat_bracket_block: make(0xa87a52, 0.8, 'wood', 1.5),
    mat_vermilion: make(0xa8483c, 0.62, 'clay', 1),
    mat_stone: make(0xc9c0ae, 0.88, 'plaster', 2),
    // 瓦面用深青灰：唐式常见灰陶瓦，不用明清的亮黄琉璃。
    mat_roof_tile: make(0x4a4f52, 0.78, 'tile', 3),
    mat_roof_surface: make(0x3f4547, 0.76, 'tile', 4),
    mat_roof_ridge: make(0x34393b, 0.72, 'tile', 2),
    mat_plaster: make(0xd8cebb, 0.86, 'plaster', 2),
    mat_review_ground: make(0x8c8880, 0.92, 'mud', 6),
    mat_ruler: make(0x2e2e2e, 0.6, null, 0),
    mat_cloth: make(0xc45f4e, 0.9, 'cloth', 2),
    mat_hair: make(0x302e29, 0.78, null, 0),
    mat_skin: make(0xd3a583, 0.74, null, 0),
    mat_belt: make(0xc9b68f, 0.82, 'cloth', 1),
    mat_garment: make(0x526b78, 0.88, 'cloth', 2),
    mat_red_cloth: make(0xa75c46, 0.9, 'cloth', 2),
    mat_silk: make(0xc29561, 0.82, 'cloth', 2),
    mat_eye: make(0xe7dfca, 0.36, null, 0),
    mat_shoe: make(0x302e29, 0.82, null, 0),
  };
  materials.mat_cloth.side = THREE.DoubleSide;
  return materials;
}

/* 按语义名取共享材质；未登记的语义名照实回报，不用默认材质掩盖。 */
function kitResolveMaterial(name) {
  if (!KitLibrary.materials[name]) {
    KitLibrary.materials[name] = new THREE.MeshStandardMaterial({
      color: 0xb08080,
      roughness: 0.75,
    });
    if (window.GAME && GAME.initErrors) {
      GAME.initErrors.push('kit: unmapped material semantics "' + name + '"');
    }
  }
  return KitLibrary.materials[name];
}

function kitApplySharedMaterials(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    node.material = list.map((mat) => {
      const name = mat && mat.name ? mat.name : '';
      if (name) return kitResolveMaterial(name);
      // Character exports may lose material names while preserving node names.
      // Recover semantic classes from the mesh node; never leave a pink fallback.
      const nodeName = String(node.name || '').toLowerCase();
      if (/shoe/.test(nodeName)) return kitResolveMaterial('mat_shoe');
      if (/scalp|hair|eyebrow|pupil/.test(nodeName)) return kitResolveMaterial('mat_hair');
      if (/head_neck|hands|skin/.test(nodeName)) return kitResolveMaterial('mat_skin');
      if (/belt/.test(nodeName)) return kitResolveMaterial('mat_belt');
      if (/sleeve|garment|robe|skirt/.test(nodeName)) return kitResolveMaterial('mat_garment');
      if (window.GAME && GAME.initErrors) {
        GAME.initErrors.push('kit: unnamed material on "' + nodeName + '"');
      }
      return mat;
    });
    if (node.material.length === 1) node.material = node.material[0];
    node.castShadow = true;
    node.receiveShadow = true;
  });
}

/* 人物研究 GLB 的材质名是中文语义的可读英文名，不能落入建筑材质的粉色兜底。 */
function kitApplyCharacterMaterials(root) {
  const semantic = {
    'warm human skin': 'mat_skin',
    'hair pupils and mouth': 'mat_hair',
    'indigo cloth': 'mat_garment',
    'scarf and belt': 'mat_red_cloth',
    'muted ochre silk silhouette': 'mat_silk',
  };
  const byNode = (node) => {
    const name = String(node.name || '').toLowerCase();
    if (/shoe/.test(name)) return 'mat_shoe';
    if (/eyebrow|scalp|hair/.test(name)) return 'mat_hair';
    if (/iris|eyeball|pupil/.test(name)) return 'mat_eye';
    if (/head_neck|hands|skin|eyeball/.test(name)) return 'mat_skin';
    if (/belt/.test(name)) return 'mat_belt';
    if (/sleeve|garment|robe|skirt/.test(name)) return 'mat_garment';
    return null;
  };
  root.traverse((node) => {
    if (!node.isMesh) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    node.material = list.map((material) => {
      const name = material && material.name ? material.name : '';
      const target = semantic[name];
      const nodeTarget = byNode(node);
      return target ? kitResolveMaterial(target) : nodeTarget ? kitResolveMaterial(nodeTarget) : material;
    });
    if (node.material.length === 1) node.material = node.material[0];
  });
}

function kitLoad(name, url) {
  if (KitLibrary.cache.has(name)) return KitLibrary.cache.get(name);
  const promise = new Promise((resolve, reject) => {
    const addons = window.ChanganRenderingAddons || {};
    if (!addons.GLTFLoader) {
      const message = 'kit loader unavailable: ChanganRenderingAddons.GLTFLoader missing';
      if (window.GAME && GAME.initErrors) GAME.initErrors.push(message);
      reject(new Error(message));
      return;
    }
    const loader = new addons.GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        // 只有本项目构件库/人物导出件使用语义材质表。Poly Haven 等外部
        // 道具必须保留其内嵌 PBR 材质，不能被建筑语义映射成统一色。
        if (/^\/assets\/kit\//.test(url)) {
          kitApplySharedMaterials(root);
          kitApplyCharacterMaterials(root);
        } else {
          root.traverse((node) => {
            if (!node.isMesh) return;
            node.castShadow = true;
            node.receiveShadow = true;
            const list = Array.isArray(node.material) ? node.material : [node.material];
            list.forEach((material) => {
              if (!material) return;
              material.envMapIntensity = 0.8;
              if (typeof material.roughness === 'number') {
                material.roughness = Math.max(0.5, material.roughness);
              }
            });
          });
        }
        root.updateMatrixWorld(true);
        KitLibrary.stats.loaded += 1;
        resolve(root);
      },
      undefined,
      (error) => {
        KitLibrary.stats.failed += 1;
        const message = 'kit model failed: ' + url + ' (' + (error && error.message) + ')';
        if (window.GAME && GAME.initErrors) GAME.initErrors.push(message);
        reject(new Error(message));
      }
    );
  });
  KitLibrary.cache.set(name, promise);
  return promise;
}

/* 实例化：共享几何，只做变换；这是"一份源、多处引用"的落地位置。 */
function kitInstance(root, transform = {}) {
  const clone = root.clone(true);
  clone.traverse((node) => {
    if (!node.isMesh) return;
    // clone 会复制 Mesh 但共享 geometry；这里显式复用几何与材质对象。
    node.castShadow = true;
    node.receiveShadow = true;
  });
  const { position = [0, 0, 0], rotationY = 0, scale = 1 } = transform;
  clone.position.set(position[0], position[1], position[2]);
  clone.rotation.y = rotationY;
  clone.scale.setScalar(scale);
  KitLibrary.stats.instances += 1;
  return clone;
}

function kitInit() {
  KitLibrary.materials = kitMaterialSet();
  KitLibrary.ready = true;
}

window.KitLibrary = KitLibrary;
window.kitLoad = kitLoad;
window.kitInstance = kitInstance;
window.kitInit = kitInit;
