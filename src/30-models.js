/* ============================================================
   3D高精模型加载器
   从 assets/models/ 加载GLB模型，替换程序化几何体
   ============================================================ */

const __models = {
  loaded: {},
  queue: [],
  loading: false,
  total: 0,
  completed: 0
};

// 模型配置：地标 -> GLB文件路径
const MODEL_CONFIG = {
  // 大雁塔
  dayanta: {
    path: 'assets/models/dayanta.glb',
    position: [300, 0, 420],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true
  },
  // 方形宝塔（小雁塔）
  pagodaSquare: {
    path: 'assets/models/pagoda-square.glb',
    position: [-300, 0, 480],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true
  },
  // 寺庙大殿
  templeHall: {
    path: 'assets/models/temple-hall.glb',
    position: [300, 0, 380],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true
  },
  // 商铺
  shop01: {
    path: 'assets/models/shop-01.glb',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  // 民居
  house01: {
    path: 'assets/models/house-01.glb',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  }
};

// 加载单个GLB模型
function loadGLBModel(configKey, onLoad) {
  const config = MODEL_CONFIG[configKey];
  if (!config) {
    console.warn(`[Models] No config for: ${configKey}`);
    return;
  }
  
  // 已加载则直接返回
  if (__models.loaded[configKey]) {
    onLoad && onLoad(__models.loaded[configKey]);
    return;
  }
  
  // 动态导入GLTFLoader
  import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
    const loader = new GLTFLoader();
    
    loader.load(config.path, 
      // onLoad
      (gltf) => {
        const model = gltf.scene;
        
        // 应用位置、缩放、旋转
        if (config.position) {
          model.position.set(config.position[0], config.position[1], config.position[2]);
        }
        if (config.scale) {
          model.scale.set(config.scale[0], config.scale[1], config.scale[2]);
        }
        if (config.rotation) {
          model.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
        }
        
        // 启用阴影
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(model);
        __models.loaded[configKey] = model;
        __models.completed++;
        
        console.log(`[Models] Loaded: ${configKey} (${__models.completed}/${__models.total})`);
        onLoad && onLoad(model);
        
        // 触发模型加载完成事件
        window.dispatchEvent(new CustomEvent('model-loaded', { detail: { key: configKey, model } }));
      },
      // onProgress
      (xhr) => {
        if (xhr.total) {
          const percent = ((xhr.loaded / xhr.total) * 100).toFixed(1);
          console.log(`[Models] Loading ${configKey}: ${percent}%`);
        }
      },
      // onError
      (error) => {
        console.warn(`[Models] Failed to load ${configKey}:`, error.message);
        // 模型不存在时静默失败，保留程序化几何体
      }
    );
  }).catch((err) => {
    console.warn(`[Models] GLTFLoader not available:`, err);
  });
}

// 批量加载模型
function loadModels(keys, onAllLoaded) {
  __models.total = keys.length;
  __models.completed = 0;
  
  let loaded = 0;
  const models = {};
  
  keys.forEach((key) => {
    loadGLBModel(key, (model) => {
      models[key] = model;
      loaded++;
      
      if (loaded === keys.length) {
        onAllLoaded && onAllLoaded(models);
        window.dispatchEvent(new CustomEvent('models-all-loaded', { detail: models }));
      }
    });
  });
}

// 获取已加载模型
function getModel(key) {
  return __models.loaded[key] || null;
}

// 导出
window.CHANGAN_MODELS = {
  load: loadGLBModel,
  loadBatch: loadModels,
  get: getModel,
  config: MODEL_CONFIG,
  loaded: __models.loaded
};

console.log('[Models] 3D model loader initialized');
