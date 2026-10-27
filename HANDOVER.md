# 《龙游长安》交接文档

**更新日期：2026年10月27日 09:45 北京时间**

---

## 当前架构（权威）

### 引擎加载顺序（src/boot.js，共34项）
```
vendor/three.min.js → rendering-addons.js → assets/materials.js → scene-materials.js
→ runtime-models.js → character-faces.js → boat-hulls.js
→ src/00-core.js → 04-compatibility.js → 05-rendering.js → 06-surfaces.js → 07-water.js
→ 08-assets.js → 09-botany.js → 10-world.js → 11-shorelines.js → 12-landmarks.js
→ 20-character.js → 25-exploration.js → 25b-film-shots-extra.js
→ 26-extra-places.js → 26b-extra-places-2.js → 27-session.js → 27b-extra-poems.js → 27c-extra-poems-2.js
→ 28-weather.js
→ src/enhance/{performance,landmarks,vegetation,water,night-light,outside}.js
→ 99-safe-init.js → 30-main.js
```

### 初始化生命周期（v2，2026-10-27）
- **统一调度器**：src/99-safe-init.js 提供 `window.__enhance.register(owner, fn, priority)`
- GAME.ready 后下一帧开始，**requestAnimationFrame 分帧执行**（每帧一个模块，8帧≈133ms）
- 全部 enhance 完成后自动调用 `window.__changan.rebuild()`（重建全部 Batch 实例 + 碰撞哈希 + 屋顶飞行网格 + 渲染刷新），再置 `GAME.fullyReady = true`
- **禁止**散装 setTimeout 固定延迟（旧机制已废弃）；**禁止**覆盖 buildWorld / window.updateDayNight

### Enhance 模块 Owner（6个，按优先级）
| Owner | 优先级 | 职责 | 文件 |
|-------|--------|------|------|
| Performance | 30 | 纹理各向异性16x + 阴影±140m（2048贴图≈7.3cm/texel） | enhance/performance.js |
| Weather | 35 | 晴/阴/雨：雨滴800点跟随玩家、雾/曝光基于GRADE基线相对微调、包装GameRendering.update | src/28-weather.js |
| Landmarks | 40 | 东西市牌坊 + 两塔石碑（不重复角楼/垛口/台阶） | enhance/landmarks.js |
| Vegetation | 50 | 沉香亭花圃/大雁塔蓝花/太极宫菊花/曲江岸草/竹林 | enhance/vegetation.js |
| Water | 60 | 护城河三面（共享waterMat，PlaneGeometry已rotation.x=-π/2躺平）+6木桥+岸石芦苇鸭 | enhance/water.js |
| NightLight | 70 | 64盏灯笼(局部Batch 2 drawcall) + 7组点光源(登记__nightLights由updateDayNight尾部驱动) | enhance/night-light.js |
| Outside | 80 | 城外驿站/水井/里程碑碰撞 + 城外树(原addTree经rebuild可见) | enhance/outside.js |

> 已删除空模块：visual-grade.js（视觉基调由主循环GRADE驱动）、sky.js（天空Shader在00-core.js）

---

## 权威地标坐标（src/12-landmarks.js）

| 地标 | 坐标 (x, z) |
|------|-------------|
| 大明宫含元殿 | (150, -432) |
| 大明宫丹凤门 | (150, -380) |
| 太极宫太极殿 | (0, -334) |
| 兴庆宫龙池 | (342, -152) |
| 兴庆宫花萼相辉楼 | (398, -108) |
| 曲江池中心 | (354, 318) |
| 大雁塔 | (216, 283) |
| 小雁塔 | (-216, 349) |
| 青龙寺塔 | (300, 100) |
| 西明寺塔 | (-300, 150) |
| 朱雀大街 | x=0 |
| 西市中心 | (-258, -14) |
| 东市中心 | (174, -14) |
| 明德门 | (0, 380) |

## 世界尺度
- **1 world unit ≈ 2 米**（艺术化缩尺）
- CITY = {x0:-450, x1:450, z0:-380, z1:380}（核心游玩区≈1.8km×1.5km）
- WORLD = {x0:-780, x1:780, z0:-660, z1:660}（全境≈3.1km×2.6km）
- 城墙角楼在(±450, ±380)；护城河在 z=±400 / x=±465

## 全局变量名（权威）
scene / camera / renderer / sun（平行光）/ ambient（环境光）/ hemi / rim / MAT（共享材质）/ TEX（纹理）/ GAME.ready / GAME.nightT / waterMat（水面Shader）/ B（Batch实例组）/ Batch类

---

## 已完成修复（2026-10-27）

1. **P0-1 水面朝向**：water.js 护城河 PlaneGeometry 已 `rotation.x=-π/2` 躺平 ✓
2. **P0-2 重复建筑**：landmarks.js 只做牌坊石碑，不重复角楼/垛口/台阶 ✓
3. **P0-3 批处理碰撞**：rebuild() 遍历 Object.values(B).forEach(b=>b?.build?.()) 幂等重建 ✓
4. **P0-4 初始化生命周期**：99-safe-init v2 改 RAF 分帧（消除500ms×8=4s固定延迟）✓
5. **P0-5 昼夜统一**：enhance 不覆盖 window.updateDayNight；天气包装 GameRendering.update；点光登记 __nightLights ✓
6. 空模块清理：删除 visual-grade.js / sky.js（boot.js 引用同步移除）✓

### 全量源码审查确认健康（2026-10-27 09:40）

| 文件 | SHA | 审查结论 |
|------|-----|----------|
| src/00-core.js | 20834ea1 | Batch 幂等重建✓ CITY/WORLD坐标✓ 天空Shader(双层云+星+山脊)✓ MAX_DPR 触控1.25/桌面1.65✓ |
| src/05-rendering.js | a42ad59d | GameRendering: SAO+Bloom+FXAA+ACESFilmic+PMREM, 质量档位auto/low/med/high, LOD距离裁剪✓ |
| src/09-botany.js | e3684476 | 3植物Batch(柳/桃/松) LOD近/远两档+相机穿叶避让shader(canopyAnchor discard)✓ |
| src/10-world.js | 57fb767a | 城墙角楼(±450,±380)与CITY边界一致✓ 坊市网格✓ 唐式歇山顶几何✓ |
| src/12-landmarks.js | c0d0db57 | 地标坐标与权威表一致✓ 水面真实Shader(time/deep/shallow/fresnel)✓ |
| src/20-character.js | 91104e7c | 小青龙IK骨骼动画✓ 人物mergeColored+顶点步态shader✓ 城市人群InstancedMesh共享6模板✓ |
| src/25-exploration.js | 5f79b8b4 | 三模式移动(walk/bike/fly)✓ 8景点电影镜头✓ buildRoofGrid飞行包络✓ |
| src/28-weather.js | 04652076 | v4包装GameRendering.update✓ 雨滴800跟随玩家✓ 雾/曝光GRADE基线相对微调✓ |
| src/30-main.js | 9a019d3e | updateDayNight词法绑定唯一驱动✓ rebuild()完整链路✓ |
| src/enhance/performance.js | 6ed38e35 | 阴影±140m✓ 各向异性16x✓ 正确变量名sun✓ |
| src/enhance/night-light.js | 65a6bd72 | 64灯笼局部Batch(2drawcall)✓ 7点光登记__nightLights✓ |
| src/enhance/water.js | 8cd9dacc | 护城河三面共享waterMat✓ 6木桥bridgeZones✓ |

**结论**：P0 五项全部修复并推 main；全部核心文件源码审查健康；无重复系统、无坐标冲突、无初始化失效。

---

## 开发规范（必须遵守）

1. **新功能优先在现有 enhance 模块内扩展**，不轻易新建碎片模块
2. **禁止**覆盖 buildWorld / window.updateDayNight（词法绑定，替换无效）
3. **禁止**错误变量名（sun不是sunLight，ambient不是ambientLight）
4. **禁止**硬编码坐标新建同名地标（必须在原有建筑上精修）
5. **禁止**重复造轮子（已有Sound/NPC/水面Shader/昼夜/材质库MAT）
6. **禁止**散装 setTimeout 固定延迟初始化（用 __enhance.register）
7. **禁止**独立 RAF 循环（逐帧更新接入 GameRendering.update 或 __nightLights）
8. 新增物体必须触发 `__changan.rebuild()` 确保批处理/碰撞同步
9. 提交前必须 `node --check` 全部通过（CI 自动验证）

---

## 下一步建议

1. **浏览器实测验收**：本地起服务 + chromium headless，产出朱雀大街/大明宫/东西市/曲江池/大雁塔固定机位截图 + FPS/DrawCalls/内存数据（verify.mjs 已就绪，依赖 CDP PORT 9226）
2. **PBR 贴图升级**：替换 Canvas 生成纹理为真实 PBR（法线/粗糙度贴图）
3. **高精度模型替换**：简单几何体 → GLB 精模（共享素材包，不重复存储纹理）
4. **人物骨骼动画**：胶囊体 NPC → 骨骼动画角色
5. **分区流式加载**：按城市分区异步加载/卸载，LOD 分级
6. **移动端性能**：DPR/阴影/后处理按设备档位自适应

---

*《龙游长安》 · 梦回盛唐*
