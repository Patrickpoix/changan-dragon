# 程序化城市生成器参考汇总

> 更新时间：2026-10-25

---

## 发现的Three.js程序化城市生成器

### 1. threex.proceduralcity（⭐147）
- URL: https://github.com/jeromeetienne/threex.proceduralcity
- 经典Three.js程序化城市生成器
- 基于mrdoob原始demo
- **参考价值**: 基础城市生成逻辑

### 2. IntroToComputerGraphics-CityGenerator（⭐49）
- URL: https://github.com/MHillier98/IntroToComputerGraphics-CityGenerator
- Three.js程序化城市生成器
- **参考价值**: 现代实现方式

### 3. Procedural-City-Generator（⭐48）
- URL: https://github.com/photonlines/Procedural-City-Generator
- 城市/街区生成器
- **参考价值**: 街区级生成逻辑

### 4. kowloon-walled-city（⭐0）
- URL: https://github.com/icomppower/kowloon-walled-city
- 九龙城寨——高密度街区生成器
- **参考价值**: 拥挤区域生成（类似西市热闹感）

### 5. Midnight-metropolis（⭐1）
- URL: https://github.com/omarjazaa/Midnight-metropolis
- 电影感夜晚城市生成器
- 发光窗户、霓虹灯、Bloom后处理
- **参考价值**: 夜晚视觉效果参考

---

## 对我们的参考价值

### 城市布局生成
- 参考街区划分逻辑
- 道路网生成方法
- 建筑随机放置算法

### 性能优化
- InstancedMesh合批方法
- LOD实现方式
- 视锥剔除

### 视觉效果
- 夜晚发光窗户
- Bloom后处理参数
- 电影感相机

---

*这些都是现代城市，建筑逻辑不同，但生成算法和性能优化可直接参考。*
