# 龙游长安 Demo 交接文档

> **2026-10-25 恢复核查补记（以此段和实际Git树为准）：**
> 豆包云电脑不可访问，四个原版main.js、105坊JSON与GLB等均无可验证的原件恢复通道。
> 已在独立工作区重建研究数据：原脚本仅8排×6列×东西两侧=96槽位，不是108；
> 因东市、西市、曲江池3处特殊区域，能重建93份坊JSON并给3个占位引用，
> 无证据的另12坊未编造。相关生成器、测试和可重建的Chunk脚本在demos/目录。
> city-viewer/integrated/postprocessing的新增main.js是**重新实现，不是豆包原文件**；
> 较大GLB、Xbot、PBR、HDRI及完整版朱雀原版20KB main.js仍未找回。
> 这些Demo不接正式游戏src，也不构成美术、历史或性能验收。
> **2026-10-25 GitHub统一权威补记：** main仅保存生成器和经核查的输入，93份研究JSON与50个Chunk在npm构建时自动确定性再生；不追踪不完整缓存，不把丢失的105份原件算作已经恢复。

> 仓库：Patrickpoix/changan-dragon (main)
> 更新：2026-10-25

## 已推送到 GitHub 的完整文件清单

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

### demos/integrated/
- `index.html` / `package.json` — 1km²片区整合Demo骨架

### demos/city-viewer/
- `index.html` / `package.json` / `vite.config.js` — 全城流加载Viewer骨架

### demos/special-areas/
- `gates.json` / `damingPalace.json` / `eastMarket.json` / `westMarket.json` / `quchi.json`

## 云电脑上仍存在但未推送的大文件

### 二进制资产（需git LFS）
- `engine-poc/zhuque-demo/dist/assets/*.glb` — 唐代建筑模型
- `Xbot.glb` (2.8MB) — 带走路动画人物
- `road_*.jpg` / `wall_*.jpg` — PBR纹理
- `sky.hdr` (17MB) — HDRI环境光照

### 未推送的源码
- `postprocessing-demo/src/main.js` (29KB)
- `integrated-demo/src/main.js` (23KB)
- `city-viewer/src/main.js` (27KB)
- `engine-poc/zhuque-demo/src/main.js` (20KB)

### 大数据
- `ward-generator/output/wards_all/` — 105个坊JSON
- `city-viewer/public/chunks/` — 全城分块JSON

## 接手步骤

1. 先读这个文档和 `docs/FACT_CHECK_AND_RECTIFICATION_20261025.md`
2. 跑起来：`cd demos/zhuque-walkable && python3 -m http.server 8080`
3. 正式游戏引擎在 `src/` 下（Three.js r160），Demo用r169
4. 108坊数据运行 `node demos/ward-generator/generate_layout.js` 重新生成
5. 约束：免费$0素材、不覆盖src/正式代码、Demo放demos/目录
