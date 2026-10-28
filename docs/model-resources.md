# 《龙游长安》3D模型资源目录

## 免费可下载的唐式/中国古建筑模型

### 一、Sketchfab（CC Attribution 许可）

| 模型 | 作者 | 多边形数 | 格式 | 许可证 | 链接 |
|------|------|----------|------|--------|------|
| Chinese pagoda | SibeYu | - | GLB | CC Attribution | https://sketchfab.com/3d-models/chinese-pagoda-9368be07f47949e2b6eaa962ea9c58ad |
| Chinese Temple Square Pagoda | mattwells3d | 167.8k | GLB | CC Attribution | https://sketchfab.com/3d-models/chinese-temple-square-pagoda-288743caaa4e410eacec7f5d17c5bfc6 |
| Chinese hut | Abhitabhji | - | GLB | CC Attribution | https://sketchfab.com/3d-models/chinese-hut-1b9c99b0fa9d49b88c4aa5b8c9c097da |
| Guangfu Pagoda | - | - | GLB | - | https://sketchfab.com/3d-models/guangfu-pagoda-f1ef14904a5f462998da03a45c9dd1ac |

### 二、itch.io（免费游戏资产包）

| 资产包 | 作者 | 内容 | 格式 | 许可证 | 链接 |
|------|------|------|------|--------|------|
| Low Poly Chinese Style Building Set 1 | CS Studio | 中国古建筑组：butcher, clothing, gazeebo, horse_room, AncientChina_set_1 | Unity package / GLB | 免费(任意金额) | https://cs-studio.itch.io/cs-building-set1 |

### 三、Open3dModel（免费下载）

| 资源 | 数量 | 格式 | 链接 |
|------|------|------|------|
| Pagoda 3D Models | 64个 | Blend, Max, Obj, Fbx, GLB | https://open3dmodel.com/3d-models/pagoda |

### 四、RigModels（免费）

| 模型 | 多边形数 | 格式 | 链接 |
|------|----------|------|------|
| Chinese-style ancient architectural palace tower | - | OBJ, GLB, FBX, DAE | https://rigmodels.com/model.php?searchkeyword=build&view=Chinese-style_ancient_architectural_palace_tower-3d-model__71ec551b96324992a7d8a7098226ecfa |
| Pagoda Structure Scene | 1.2M | - | https://rigmodels.com/model.php?manualsearch=1&searchkeyword=cadnav&view=Pagoda_Structure_Scene-3d-model__abe6b579971742b6a35465e21951d616 |

## 推荐优先下载

### 1. 大雁塔模型
- **推荐**: Chinese Temple Square Pagoda (mattwells3d)
- **理由**: 167k三角形，PBR材质（Albedo, Normal, AO, Roughness），质量高
- **用途**: 替换现有大雁塔程序化模型

### 2. 寺庙建筑
- **推荐**: Chinese pagoda (SibeYu) + Chinese hut (Abhitabhji)
- **理由**: CC Attribution许可，适合寺庙建筑群
- **用途**: 替换大慈恩寺、荐福寺建筑

### 3. 民居商铺
- **推荐**: CS Studio Low Poly Chinese Style Building Set
- **理由**: 游戏专用低多边形，性能好
- **用途**: 替换108坊民居、东西市商铺

## 集成方式

### GLB模型加载
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('assets/models/dayanta.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(300, 0, 420);
  model.scale.set(0.1, 0.1, 0.1); // 调整大小
  scene.add(model);
});
```

### 文件存放结构
```
assets/
  models/
    dayanta.glb          # 大雁塔
    pagoda-square.glb    # 方形宝塔
    temple-hall.glb      # 寺庙大殿
    shop-01.glb          # 商铺1
    shop-02.glb          # 商铺2
    house-01.glb         # 民居1
    ...
  textures/
    # 材质贴图
```

## 许可证注意事项

- **CC Attribution**: 必须在游戏内或README中注明作者
- **CC0**: 无需署名，可商用
- **免费游戏资产**: 检查具体许可条款

## 当前状态

- [ ] 下载并导入大雁塔GLB模型
- [ ] 下载并导入寺庙大殿模型
- [ ] 下载并导入商铺民居模型包
- [ ] 创建模型加载器
- [ ] 替换现有程序化建筑
