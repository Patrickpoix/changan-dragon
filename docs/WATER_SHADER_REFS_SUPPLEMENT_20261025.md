# Three.js水面着色器参考汇总（补充）

> 更新时间：2026-10-25

---

## 发现的水面着色器项目

### 1. jbouny/ocean（⭐804）— 已选定
- URL: https://github.com/jbouny/ocean
- 写实水面着色器
- 支持：波浪、反射、折射、泡沫
- **我们的主要选择**

### 2. Three.js-Ocean-Scene（⭐76）
- URL: https://github.com/Nugget8/Three.js-Ocean-Scene
- 程序化天空盒 + 水面着色器
- 移动端优化

### 3. beautiful-water（⭐14）
- URL: https://github.com/VictorZakharov/beautiful-water
- 浅海水面：反射、泡沫、水下生物

### 4. Threejs-water-shader（⭐3）
- URL: https://github.com/davidllona/Threejs-water-shader
- 实时程序化海洋模拟

---

## 我们的水面方案

### 曲江池（湖泊）
- 波浪幅度：小（0.1m）
- 水色：青绿色
- 装饰：荷花、荷叶
- 倒影：天空+建筑

### 护城河
- 波浪：极小
- 水色：暗绿色
- 流动感：法线贴图滚动

---

*水面是园林感的关键，jbouny/ocean是最佳选择。*
