# 故宫3D复原项目参考汇总

> 更新时间：2026-10-25

---

## 所有发现的故宫/中式宫殿Three.js项目

### 1. watsonbkeel/forbidden-city-3d（⭐0，最详细）
- URL: https://github.com/watsonbkeel/forbidden-city-3d
- **332栋建筑、108个角色、41个可进入大殿、6个详细室内**
- 第一人称漫游
- 零外部3D模型（全程序化）
- Three.js r162 + Vite
- **这是我们的主要参考项目！**

### 2. eric-thy/forbidden-city-deepseek-v4.1-flash-1017（⭐2）
- URL: https://github.com/eric-thy/forbidden-city-deepseek-v4.1-flash-1017
- 紫禁城中轴3D互动长卷
- 九殿·四角楼·金水河·红墙
- 昼夜·巡游·第一人称·移动端触控
- DeepSeek AI生成

### 3. daniei-chen/Forbidden-City（⭐1）
- URL: https://github.com/daniei-chen/Forbidden-City
- 单文件Three.js可漫游场景
- 七殿室内 / 四时段 / SSAO / 小人跳跃与NPC
- 零外部资源

### 4. mongachen/taihedian-particles（⭐1）
- URL: https://github.com/mongachen/taihedian-particles
- 太和殿3D点云粒子展陈
- 180,000 GPU粒子组装太和殿
- Three.js + GLSL

### 5. zjzhang-cn/taihe-hall（⭐0）
- URL: https://github.com/zjzhang-cn/taihe-hall
- 太和殿实时Three.js场景

---

## 对我们的参考价值

### 建筑程序化生成
- watsonbkeel项目：332栋建筑全程序化
- 可参考其建筑模块化方法
- 对比唐代建筑与明清宫殿差异

### NPC系统
- 108个角色的实现方式
- 室内/室外NPC分配

### 性能优化
- 332建筑如何保持帧率
- 41个可进入大殿的室内加载策略

---

*故宫是明清建筑，唐代建筑更古朴雄伟，但程序化方法可直接参考。*
