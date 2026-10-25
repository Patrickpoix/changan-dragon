# 粒子系统参考（天气效果）

> 更新时间：2026-10-25

---

## 发现的粒子系统项目

### 1. Particle-System-Simulation
- URL: https://github.com/MyoKyal/Particle-System-Simulation
- Three.js实时3D粒子模拟
- 支持：烟花、雨、雪、龙卷风
- 计算机图形学课程项目

### 2. SkyCast
- URL: https://github.com/abhranilsingharoy-cloud/SkyCast
- 天气应用
- React + Tailwind + Three.js
- 动态3D粒子系统（雨、雪）

---

## 我们的天气粒子方案

### 雨粒子
- 数量：3000个GPU粒子
- 效果：垂直下落，带轻微风偏
- 地面涟漪（近距离）

### 雪粒子
- 数量：2000个GPU粒子
- 效果：缓慢飘落，左右摇摆
- 地面积雪（白色覆盖层）

### 落叶粒子
- 数量：1000个
- 效果：旋转飘落
- 秋季梧桐叶

### 花瓣粒子
- 数量：500个
- 效果：缓慢飘落
- 春季桃花瓣

---

*粒子系统是天气氛围的关键，GPU粒子零CPU开销。*
