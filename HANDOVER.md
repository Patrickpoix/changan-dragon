# 《龙游长安》交接文档

**更新日期：2026年10月27日 13:10 北京时间**

---

## 当前架构（权威）

### 引擎加载顺序（src/boot.js v4，2026-10-27）

**性能优化v4核心改动**：scene-materials.js (7MB) 和 runtime-models.js (9.58MB) 改为并行下载，与小引擎文件同时进行。首屏下载时间从串行 17.9MB 降为并行 ~10MB。

```
// 立即并行启动大文件下载（不互相阻塞）
assets/scene-materials.js (7MB)  ──┐
assets/runtime-models.js (9.58MB) ──┤
                                     ├── 并行
// 同时串行加载小引擎文件              │
vendor/three.min.js (670KB)         │
vendor/rendering-addons.js (113KB)  │
assets/materials.js (113KB)         │
assets/character-faces.js (100KB)  │
assets/boat-hulls.js (50KB)         │
src/00-core.js → ... → 99-safe-init.js ──┘

// 小文件+大文件全部就绪后，才加载主入口
→ src/30-main.js（执行 boot() → buildWorld()）
```

**enhance模块**（6个）不在boot阶段加载，由30-main.js在GAME.ready后100ms动态注入script标签。

### 初始化生命周期（v2）
- **统一调度器**：src/99-safe-init.js 提供 `window.__enhance.register(owner, fn, priority)`
- GAME.ready 后下一帧开始，**requestAnimationFrame 分帧执行**（每帧一个模块）
- 全部 enhance 完成后自动调用 `window.__changan.rebuild()`，再置 `GAME.fullyReady = true`
- **禁止**散装 setTimeout 固定延迟；**禁止**覆盖 buildWorld / window.updateDayNight

### Enhance 模块 Owner（6个，按优先级）
| Owner | 优先级 | 职责 | 文件 |
|-------|--------|------|------|
| Performance | 30 | 纹理各向异性16x + 阴影±140m | enhance/performance.js |
| Weather | 35 | 晴/阴/雨：雨滴800点跟随玩家、包装GameRendering.update | src/28-weather.js |
| Landmarks | 40 | 东西市牌坊 + 两塔石碑（不重复角楼/垛口/台阶） | enhance/landmarks.js |
| Vegetation | 50 | 沉香亭花圃/大雁塔蓝花/太极宫菊花/曲江岸草/竹林 | enhance/vegetation.js |
| Water | 60 | 护城河三面（共享waterMat，rotation.x=-π/2）+6木桥+岸石芦苇鸭 | enhance/water.js |
| NightLight | 70 | 64盏灯笼(局部Batch) + 7组点光源(登记__nightLights) | enhance/night-light.js |
| Outside | 80 | 城外驿站/水井/里程碑碰撞 + 城外树 | enhance/outside.js |

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
- **1 world unit ≈ 2 米**（艺术化缩尺）
- CITY = {x0:-450, x1:450, z0:-380, z1:380}
- WORLD = {x0:-780, x1:780, z0:-660, z1:660}
- 城墙角楼在(±450, ±380)；护城河在 z=±400 / x=±465

## 全局变量名（权威）
scene / camera / renderer / sun / ambient / hemi / rim / MAT / TEX / GAME.ready / waterMat / B / Batch类

---

## 本轮性能优化 commits（2026-10-27）

| Commit | 内容 |
|--------|------|
| `843d918` | boot.js v4：大素材文件(7MB+9.58MB)并行下载 |
| `105c72f` | 删除18.7MB旧独立构建 dist/changan-dragon.html |
| `af59393` | 更新.gitignore（不再追踪dist/） |
| `c443656` | CI v2.1：index.html完整性检查+防新模块白名单+禁用变量名检测 |
| `b53b3e4` | agent.md v3：性能优化原则+推送事故教训+模块Owner映射+CI门禁规则 |
| `b53af24` | 恢复index.html完整52KB版本+preload标签 |
| `0ed1aa6` | 30-main v4：启用fastStart模式 |
| `a5d0320` | 05-rendering v2：fastStart模式（跳过PMREM+后处理，startGame时升级） |
| `9f8e26a` | 30-main v3：WorldAssets.populate()非阻塞+renderer.compile()移到startGame |
| `a06d1a2` | 99-safe-init v3：支持动态注册 |
| `8474c12` | boot.js v3：移除6个enhance模块（首屏请求34→28） |

### 性能优化策略总结
1. **首屏并行**：17MB素材文件并行下载，不串行阻塞
2. **fastStart模式**：开始界面低质量快速渲染（跳过PMREM+SAO+Bloom+FXAA），点击入城时升级
3. **非阻塞素材**：WorldAssets.populate()不等待外部GLB加载
4. **enhance延迟加载**：6个增强模块在GAME.ready后动态注入，不占首屏请求
5. **preload预热**：index.html添加<link rel=preload>预热three.min.js和boot.js

---

## CI 门禁（v2.1，.github/workflows/ci.yml）

每次push自动执行：
1. JS语法检查（所有src/*.js和enhance/*.js通过node --check）
2. boot.js清单验证（引用文件必须存在）
3. orphan检测（enhance文件必须被30-main.js引用）
4. **index.html完整性**（必须以</html>结尾，大小>40KB）
5. **防新模块白名单**（src/下数字开头文件必须在白名单内）
6. **禁用变量名检测**（不得出现sunLight/ambientLight）

---

## 开发规范（必须遵守，详见 agent.md）

1. **新功能优先在现有 enhance 模块内扩展**，不新建碎片模块
2. **禁止**覆盖 buildWorld / window.updateDayNight
3. **禁止**错误变量名（sun不是sunLight）
4. **禁止**硬编码坐标新建同名地标
5. **禁止**重复造轮子（复用MAT/水面Shader/昼夜/音频/NPC）
6. **禁止**散装 setTimeout 固定延迟初始化（用 __enhance.register）
7. **禁止**独立 RAF 循环（接入 GameRendering.update 或 __nightLights）
8. 新增物体必须触发 `__changan.rebuild()`
9. 推送大文件（>10KB）后必须回读验证字节数
10. 模块Owner映射见 agent.md 第11节

---

## 下一步建议

1. **浏览器实测验收**：固定机位截图 + FPS/DrawCalls/内存数据
2. **PBR贴图升级**：Canvas生成纹理 → 真实法线/粗糙度贴图
3. **高精度模型替换**：简单几何体 → GLB精模（共享素材包）
4. **人物骨骼动画**：胶囊体NPC → 骨骼动画角色
5. **分区流式加载**：按城市分区异步加载/卸载
6. **大文件优化**：scene-materials.js/runtime-models.js内嵌base64纹理可考虑外部化

---

*《龙游长安》 · 梦回盛唐*
