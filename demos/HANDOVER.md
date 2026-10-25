# 云电脑工作交接文档

> 生成时间：2026-10-25  
> 仓库：Patrickpoix/changan-dragon  
> 云电脑工作目录：`/home/user/Doubao/chats/38447987101661954/new-assets/`

## 已推送到 main 的文件

### demos/zhuque-walkable/
- `index.html` — 朱雀大街1km可走Demo（自包含，CDN加载Three r160）
  - 150m宽 x 1000m长大街、坊墙、坊门、商铺、行道树(InstancedMesh)
  - 50个NPC、马车、灯笼、雨粒子、昼夜循环
  - WASD第三人称控制，直接浏览器打开即跑

### demos/ward-generator/
- `generate_ward.js` — 单坊程序化生成器（mulberry32种子化PRNG）
- `generate_city.js` — 全城108坊批量生成器

### demos/npc-crowd/
- `index.html` / `package.json` — NPC群集Demo骨架

### demos/daming-palace/
- `index.html` / `package.json` / `vite.config.js` — 大明宫Demo骨架

### demos/sky-weather/
- `index.html` / `package.json` / `vite.config.js` — 天空天气Demo骨架

### demos/postprocessing/
- `index.html` / `package.json` / `vite.config.js` — 后处理Demo骨架

### demos/integrated/
- `index.html` / `package.json` — 1km²片区整合Demo骨架

### demos/city-viewer/
- `index.html` / `package.json` / `vite.config.js` — 全城流加载Viewer骨架

### demos/special-areas/
- `gates.json` — 外郭城12门坐标

## 云电脑上仍存在但未推送的文件

### engine-poc/zhuque-demo/dist/（96MB）
- 完整版朱雀大街Demo，含GLB模型和PBR纹理
- Tang_*.glb — 唐代建筑模型
- Xbot.glb (2.8MB) — 带走路动画的人物
- road_*.jpg / wall_*.jpg — PBR纹理
- sky.hdr (17MB) — HDRI环境光照
- src/main.js (20KB) — Vite版完整源码

### ward-generator/output/（22MB）
- wards_all/ward_*.json — 105个坊生成结果
- city_index.json (57KB) / wards.json (60KB)

### 其他Demo
- daming-palace-demo/ — 大明宫场景源码和数据
- city-viewer/public/chunks/ — 全城分块JSON（300+文件）
- sky-weather-demo/src/ — 天空Shader和粒子系统
- postprocessing-demo/src/ — 后处理管线
- npc-crowd-demo/src/main.js — 500 NPC LOD系统
- integrated-demo/src/main.js — 整合Demo

### 第三方素材库（不需推送到游戏仓库）
- categorized/ (2.6GB) / forbidden-city-3d/ (436MB) / ez-tree/ / ocean/ / artifacts/

## 后续接手步骤

1. 先读 `docs/FACT_CHECK_AND_RECTIFICATION_20261025.md`
2. 云电脑 `new-assets/` 目录包含所有工作成果
3. 继续推送各Demo的 src/main.js 到对应 demos/ 目录
4. 大文件通过git LFS或批量上传
5. 正式游戏引擎在 src/ 下（Three.js r160），Demo用r169
6. 约束：免费$0素材、不覆盖src/正式代码、Demo放demos/目录
