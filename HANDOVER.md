# 《龙游长安》交接文档

**更新日期：2026年10月27日 14:35 北京时间**

---

## 当前架构（权威）

### 引擎加载顺序（src/boot.js v8.2）

**关键路径已从16.6MB降至~1MB**：

```
// 关键路径（阻塞开始界面显示）：
//   25个小文件并行下载（~1MB）
//   完成后加载 src/30-main.js → buildWorld() → 开始界面

// 后台延迟加载（不阻塞，加载完自动增强场景）：
//   assets/scene-materials.js (7MB PBR纹理)
//   assets/runtime-models.js (9.58MB GLB模型)
//   每个加载完自动 WorldAssets.reset() + populate() 重试
//   scene-materials.js加载后还会 GameRendering.refreshEnvironment() 用HDRI替换临时RoomEnvironment

// Service Worker：sw.js 缓存所有静态资源，重复访问秒开
```

**enhance模块**（6个）由30-main.js在GAME.ready后动态注入script标签。

### 初始化生命周期（v4）
- **统一调度器**：src/99-safe-init.js v4 提供 `window.__enhance.register(owner, fn, priority)`
- GAME.ready 后RAF分帧执行（每帧一个模块）
- **v4错误追踪**：失败模块记录在 GAME.initErrors，不设 GAME.fullyReady=true
- 全部完成后自动 `__changan.rebuild()` 重建批处理+碰撞
- 提供 `__enhance.retry(owner)` 重试失败模块

### 开始界面期间后台预热（05-rendering v5 prewarm）
GAME.ready后requestIdleCallback自动执行：
1. makeEnvironment() — PMREM环境贴图（HDRI或RoomEnvironment fallback）
2. makePipeline() — SAO+Bloom+FXAA后处理管线
3. renderer.compile() — 材质着色器预编译

用户点击"入城漫游"时以上全部完成，upgradeToFullQuality()零等待。

### Enhance 模块 Owner（6个，按优先级）
| Owner | 优先级 | 职责 |
|-------|--------|------|
| Performance | 30 | 纹理各向异性16x + 阴影±140m |
| Weather | 35 | 晴/阴/雨：雨滴粒子(v6修复双重位移) + 包装render() |
| Landmarks | 40 | 东西市牌坊+石碑 |
| Vegetation | 50 | 花圃/竹林(种子随机可复现) |
| Water | 60 | 护城河三面(rotation.x=-π/2)+6木桥+岸石 |
| NightLight | 70 | 64灯笼(Batch)+7点光源(__nightLights钩子) |
| Outside | 80 | 城外驿站/水井/里程碑/树 |

---

## 权威地标坐标（src/12-landmarks.js）

| 地标 | 坐标 (x, z) |
|------|-------------|
| 大明宫含元殿 | (150, -432) |
| 大明宫丹凤门 | (150, -380) |
| 太极宫太极殿 | (0, -334) |
| 兴庆宫龙池 | (342, -152) |
| 曲江池中心 | (354, 318) |
| 大雁塔 | (216, 283) |
| 小雁塔 | (-216, 349) |
| 朱雀大街 | x=0 |
| 西市中心 | (-258, -14) |
| 东市中心 | (174, -14) |
| 明德门 | (0, 380) |

## 世界尺度
- 1 world unit ≈ 2 米
- CITY = {x0:-450, x1:450, z0:-380, z1:380}
- WORLD = {x0:-780, x1:780, z0:-660, z1:660}
- 完整长安城扩展设计见 docs/WORLD_ARCHITECTURE.md

## 全局变量名（权威）
scene/camera/renderer/sun/ambient/hemi/rim/MAT/TEX/GAME.ready/waterMat/B/Batch/skyUniforms/waterUniforms/colliderGrid/bridgeZones/waterRects/landZones/roads/marketDefs/wards/landmarks/poems/Explore/Session/WorldAssets/CityBotany/WaterSurface/LegacySkinning/GameRendering/RUNTIME_MODELS/SCENE_MATERIALS

---

## 本轮修复（2026-10-27 14:00后）

| Commit | 内容 |
|--------|------|
| `1ccd913` | 30-main v8.1: 修复Cam.zoomBy缺少clamp闭合括号语法错误 |
| `af1c01c` | 99-safe-init v4: 错误追踪，失败不标记fullyReady，GAME.initErrors |
| `57f70e0` | 28-weather v6: 修复雨滴粒子双重位移 |
| `377e720` | boot v8: scene-materials.js(7MB)移出关键路径，关键路径~1MB |
| `d697dc0` | AGENTS.md v2: 修复所有失效文档引用 |
| `b7ea9ec` | 新增sw.js: Service Worker静态资源缓存 |
| `9af30d3` | boot v8.1: 注册Service Worker |
| `e2a16be` | 05-rendering v4: refreshEnvironment() HDRI替换fallback |
| `b3b4965` | boot v8.2: scene-materials加载后调用refreshEnvironment() |
| `6f1976f` | 05-rendering v5: prewarm()同时创建管线+预编译材质 |
| `0862c3d` | docs: WORLD_ARCHITECTURE.md 完整长安城设计 |
| `dc6bff1` | CI: 添加sw.js语法检查 |

---

## CI 门禁（v2.2）

1. JS语法检查（src/*.js + src/enhance/*.js + sw.js）
2. boot.js清单验证（引用文件必须存在）
3. orphan检测（enhance文件必须被30-main.js引用）
4. index.html完整性（必须以</html>结尾，>40KB）
5. 防新模块白名单（21个已知核心文件）
6. 禁用变量名检测（sunLight/ambientLight）

---

## 下一步

1. **浏览器实测验收**：固定机位截图+FPS/DrawCalls数据
2. **PBR贴图升级**：Canvas纹理 → 真实法线/粗糙度贴图
3. **高精度GLB模型**：共享素材包替换程序化几何体
4. **完整长安城扩展**：按WORLD_ARCHITECTURE.md坐标映射扩展
5. **分区流式加载**：3×3大区异步加载/卸载
6. **明德门-朱雀大街样板区**：电影级美术打磨

---

*《龙游长安》 · 梦回盛唐*