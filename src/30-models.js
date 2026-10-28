/* ============================================================
   3D高精模型加载器 v2.0
   从 assets/models/ 加载GLB模型，替换程序化几何体
   支持地标建筑替换、批量加载、事件通知
   ============================================================ */

const __models = {
  loaded: {},
  queue: [],
  loading: false,
  total: 0,
  completed: 0,
  replacements: {} // 记录被替换的原始对象
};

// 模型配置：地标 -> GLB文件路径与变换参数
const MODEL_CONFIG = {
  // ========== 历史地标 ==========
  // 大雁塔
  dayanta: {
    path: 'assets/models/dayanta.glb',
    position: [300, 0, 420],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'dayanta' // 要替换的原始对象名
  },
  // 小雁塔
  pagodaSquare: {
    path: 'assets/models/pagoda-square.glb',
    position: [-300, 0, 480],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'xiaoyanta'
  },
  // 寺庙大殿（大慈恩寺）
  templeHall: {
    path: 'assets/models/temple-hall.glb',
    position: [300, 0, 380],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'ciensi-hall'
  },
  // 大明宫含元殿
  daming-hanyuan: {
    path: 'assets/models/daming-hanyuan.glb',
    position: [320, 0, -460],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'daming-hanyuan'
  },
  // 太极宫
  taiji-palace: {
    path: 'assets/models/taiji-palace.glb',
    position: [0, 0, -450],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'taiji-palace'
  },
  // 兴庆宫
  xingqing-palace: {
    path: 'assets/models/xingqing-palace.glb',
    position: [610, 0, -195],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'xingqing-palace'
  },
  // 明德门
  mingde-gate: {
    path: 'assets/models/mingde-gate.glb',
    position: [0, 0, 430],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'mingde-gate'
  },
  // 曲江池
  qujiang: {
    path: 'assets/models/qujiang-pavilion.glb',
    position: [520, 0, 470],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: true,
    originalObject: 'qujiang-pavilion'
  },
  // ========== 仙侠奇观建筑 ==========
  // 浮空寺
  floating-temple: {
    path: 'assets/models/floating-temple.glb',
    position: [0, 150, -600],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: false,
    isWonder: true
  },
  // 摘星楼
  zhaixing-tower: {
    path: 'assets/models/zhaixing-tower.glb',
    position: [-200, 200, -700],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: false,
    isWonder: true
  },
  // 悬空寺
  xuankong-temple: {
    path: 'assets/models/xuankong-temple.glb',
    position: [200, 180, -650],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    replaceExisting: false,
    isWonder: true
  },
  // ========== 通用建筑 ==========
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
  },
  // 亭子
  pavilion: {
    path: 'assets/models/pavilion.glb',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  // 桥
  bridge: {
    path: 'assets/models/bridge.glb',
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
            // 优化：减少顶点颜色
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });
        
        // 替换原有对象
        if (config.replaceExisting && window.__changan && window.__changan.scene) {
          // 查找并隐藏原有对象
          const original = window.__changan.scene.getObjectByName(config.originalObject);
          if (original) {
            original.visible = false;
            __models.replacements[configKey] = original;
            console.log(`[Models] Replaced original: ${config.originalObject}`);
          }
        }
        
        scene.add(model);
        __models.loaded[configKey] = model;
        __models.completed++;
        
        console.log(`[Models] Loaded: ${configKey} (${__models.completed}/${__models.total})`);
        onLoad && onLoad(model);
        
        // 触发模型加载完成事件
        window.dispatchEvent(new CustomEvent('model-loaded', { 
          detail: { key: configKey, model, config } 
        }));
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
        __models.completed++;
        
        // 触发加载失败事件
        window.dispatchEvent(new CustomEvent('model-load-failed', { 
          detail: { key: configKey, error: error.message } 
        }));
      }
    );
  }).catch((err) => {
    console.warn(`[Models] GLTFLoader not available:`, err);
    __models.completed++;
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

// 检查模型是否存在（HEAD请求）
async function checkModelExists(path) {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// 尝试加载所有存在的模型
async function autoLoadAvailableModels() {
  console.log('[Models] Checking available GLB models...');
  
  const availableKeys = [];
  
  for (const [key, config] of Object.entries(MODEL_CONFIG)) {
    const exists = await checkModelExists(config.path);
    if (exists) {
      availableKeys.push(key);
      console.log(`[Models] Found: ${key} -> ${config.path}`);
    }
  }
  
  if (availableKeys.length > 0) {
    console.log(`[Models] Auto-loading ${availableKeys.length} models...`);
    loadModels(availableKeys, (models) => {
      console.log('[Models] Auto-load complete:', Object.keys(models));
    });
  } else {
    console.log('[Models] No GLB models found, using procedural geometry');
  }
  
  return availableKeys;
}

// 导出
window.CHANGAN_MODELS = {
  load: loadGLBModel,
  loadBatch: loadModels,
  get: getModel,
  config: MODEL_CONFIG,
  loaded: __models.loaded,
  autoLoad: autoLoadAvailableModels,
  checkExists: checkModelExists
};

console.log('[Models] 3D model loader v2.0 initialized');
