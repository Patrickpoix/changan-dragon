# 程序化树木生成器参考汇总

> 更新时间：2026-10-25

---

## 发现的Three.js程序化树木生成器

### 1. ez-tree（⭐1718）— 已选定
- URL: https://github.com/dgreenheck/ez-tree
- JavaScript + Three.js
- 参数化生成树木
- **我们的主要选择**

### 2. SeedThree（⭐109）
- URL: https://github.com/SkyeShark/SeedThree
- WebGPU程序化树木和植物生成器
- 无限物种生成

### 3. fantasy-trees（⭐0）
- URL: https://github.com/petershk/fantasy-trees
- 程序化奇幻树木生成器
- 支持GLB导出

### 4. terrainforge（⭐0）
- URL: https://github.com/godfengliang/terrainforge
- 3D程序化地形生成器
- Perlin噪声 + Three.js + 实例化树木

---

## 我们的树木方案

### 使用ez-tree生成
- **槐树**: 高大乔木，茂密树冠
- **柳树**: 垂枝
- **松树**: 常绿塔形
- **银杏**: 秋季金黄

### LOD策略
- <20m: 精模（1k面）
- 20-50m: 中模（200面）
- 50-100m: 低模（50面）
- >100m: Billboard

---

*树木是城市绿化的核心，ez-tree是最佳选择。*
