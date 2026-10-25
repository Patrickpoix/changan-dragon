# 龙游长安 Demo 交接文档

> 仓库：Patrickpoix/changan-dragon (main)
> 更新：2026-10-26

## 已推送到 GitHub 的完整文件清单

### 核心文档
- `ARCHITECTURE.md` — 全项目架构总览（技术栈/目录/系统/性能/待办）
- `demos/HANDOVER.md` — 本文档

### demos/zhuque-walkable/
- `index.html` — 朱雀大街1km可走Demo（自包含CDN版，浏览器直接打开）

### demos/ward-generator/
- `generate_ward.js` — 单坊程序化生成器（mulberry32种子化PRNG）
- `generate_city.js` — 全城108坊批量生成器
- `generate_layout.js` — 108坊布局生成器（考古坐标）
- `data/wards.json` — 坊布局定义（meta+示例，完整数据运行生成器）
- `data/city_index.json` — 城市索引（12门+关键坊）

### demos/npc-crowd/
- `index.html` / `package.json` / `vite.config.js`
- `src/main.js` — 500 NPC LOD系统（InstancedMesh+SkinnedMesh池）
- `REPORT.md` — NPC群集技术报告

### demos/daming-palace/
- `index.html` / `package.json` / `vite.config.js`
- `src/main.js` — 大明宫场景（含元殿/麟德殿/太液池，WASD飞行控制）
- `data/damingPalace.json` — 大明宫布局数据

### demos/sky-weather/
- `index.html` / `package.json` / `vite.config.js`
- `src/main.js` — 主入口（昼夜循环+天气切换）
- `src/particles/Particles.js` — 雨/雪/落叶/花瓣粒子系统
- `src/scenes/DayNightCycle.js` — 24h昼夜循环控制器
- `src/scenes/DemoScene.js` — 演示场景（建筑+树+灯笼）

### demos/postprocessing/
- `index.html` / `package.json` / `vite.config.js`
- `src/post/Composer.js` — 电影级后处理管线（SSAO+Bloom+Vignette+FXAA）
- `src/post/LUTs.js` — 程序化电影LUT（4套预设）
- `src/main.js` — 后处理Demo完整场景（772行，含NPC+雨+昼夜+HUD）

### demos/integrated/
- `index.html` / `package.json`
- `src/main.js` — 1km²片区整合Demo完整源码（657行）

### demos/city-viewer/
- `index.html` / `package.json` / `vite.config.js`
- `src/main.js` — 全城84km²流加载Viewer（chunked LOD + InstancedMesh）

### demos/special-areas/
- `gates.json` / `damingPalace.json` / `eastMarket.json` / `westMarket.json` / `quchi.json`
- `README.md` — 12门/东西市/曲江池/关键坊布局说明

### demos/audio-system/
- `README.md` — 音频系统架构（三档音量+3D空间音频+BGM交叉淡入+音效池）

## 素材共享策略（重要）

**核心原则：不重复存储纹理。原GLB + 共享材质源。**

- 市集亭屋和庭院门楼共用同一套PBR材质源（木材/瓦面/灰泥/石材）
- 25个建筑材质组统一绑定
- 避免上传两份各约13MB的重复贴图模型
- 新增缺失法线恢复 + 按实际几何坐标生成UV
- 后续游戏正式构建阶段继续沿用此模式

## 接手步骤

1. **先读** `ARCHITECTURE.md` 了解全项目架构
2. **跑起来**：`cd demos/zhuque-walkable && python3 -m http.server 8080` 浏览器打开
3. **正式游戏引擎**在 `src/` 下（Three.js r160），Demo用r169
4. **108坊数据**运行 `node demos/ward-generator/generate_layout.js` 重新生成
5. **约束**：免费$0素材、不覆盖src/正式代码、Demo放demos/目录
6. **画质目标**：国风漫剧/电影画风，参考《长安三万里》+《大理寺日志》

## 待开发优先级

1. 整合docs/上千份历史文档为精简架构文档
2. 接入共享PBR材质库到正式引擎src/
3. 实现坊间连通路网 + 寻路
4. NPC接入108坊真实路径
5. 大明宫+东市+西市+曲江池 全区域连通
6. 游戏UI系统（任务/对话/背包）
7. 音效系统完整实现
