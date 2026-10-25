# 技术参考项目完整清单（2026-10-25更新）

> 按系统分类的开源技术参考项目，均可用于龙游长安开发。

---

## 一、水面系统

### 1. jbouny/ocean (MIT, 804星)
- 地址：https://github.com/jbouny/ocean
- 功能：Three.js真实水面着色器
- 特点：真实波浪、反射、折射、日光波光
- 应用：曲江池、太液池、护城河

### 2. VictorZakharov/beautiful-water (MIT, 14星)
- 地址：https://github.com/VictorZakharov/beautiful-water
- 功能：浅水海洋，有反射、泡沫、水下生物
- 特点：适合湖泊/河流等浅水场景

### 3. Nugget8/Three.js-Ocean-Scene (76星)
- 地址：https://github.com/Nugget8/Three.js-Ocean-Scene
- 功能：移动端优化的程序化天空盒和水面
- 特点：适合性能敏感场景

---

## 二、地形系统

### IceCreamYou/THREE.Terrain (MIT, 914星)
- 地址：https://github.com/IceCreamYou/THREE.Terrain
- 功能：Three.js程序化地形生成引擎
- 算法：钻石-方形算法、高度图、Perlin噪声
- 特点：成熟、稳定、文档完善
- 应用：长安城周边地形（南山、坡地）

---

## 三、古建生成系统

### 1. chinese-ancient-architecture-sandbox (MIT)
- 地址：https://github.com/hafewa/chinese-ancient-architecture-sandbox
- 功能：《清明上河图》3D古建沙盒
- 核心模块：
  - BuildingGenerator.js (24KB) - 建筑生成
  - CityGateGenerator.js (6KB) - 城门生成
  - Decorations.js (57KB) - 装饰件库
  - Presets.js (47KB) - 参数预设
  - SiheyuanManager.js (11KB) - 四合院
  - WallGenerator.js (10KB) - 墙体
  - PathGenerator.js (5KB) - 道路
  - WeatherManager.js (9KB) - 天气
  - NatureGenerator.js (18KB) - 自然
  - LakeManager.js (9KB) - 湖泊

### 2. forbidden-city-3d (MIT)
- 功能：故宫3D程序化生成
- 核心：RoofBuilder.js、HallKit.js
- 特点：屋顶生成算法成熟

---

## 四、植被系统

### ez-tree (MIT)
- 功能：程序化树木生成
- 特点：可生成不同树种

---

## 五、开放世界参考

### 1. solara (MIT)
- 地址：https://github.com/Johannett321/solara
- 功能：零资产程序化开放世界
- 特点：城市、人群、天气、音频全代码生成

### 2. neon-mayhem (MIT, 6星)
- 地址：https://github.com/pranshuparmar/neon-mayhem
- 功能：浏览器开放世界驾驶游戏
- 特点：Vanilla Three.js，无构建步骤

---

## 六、引擎选型补充评估

| 维度 | Three.js r169 | Babylon.js v7.54 | 评估结论 |
|---|---|---|---|
| gzip包体 | 157KB | 433KB | Three更小 |
| 中文生态 | 最厚 | 中 | Three更好 |
| 现有代码复用 | 零迁移 | 全部重写 | Three胜出 |
| 大世界性能 | 优秀 | 优秀 | 相当 |
| 后处理效果 | 丰富 | 丰富 | 相当 |
| 社区活跃度 | 最高 | 高 | Three更好 |

**结论：Three.js r169 仍是最优选择**

---

更新日期：2026-10-25 13:20
