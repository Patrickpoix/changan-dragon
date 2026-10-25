# 渲染管线与后处理 — 技术实现文档

> 版本：v1.0
> 状态：🔄 设计完成，代码进行中

---

## 1. 渲染管线

### 1.1 基础渲染
- 引擎：Three.js r169
- 渲染器：WebGLRenderer（WebGL2）
- 阴影：PCFSoftShadowMap
- 色调映射：ACESFilmicToneMapping
- 输出：sRGB

### 1.2 材质
- PBR（MeshStandardMaterial / MeshPhysicalMaterial）
- 贴图：KTX2 压缩（待实现）
- 法线贴图：标准切线空间

---

## 2. 后处理 EffectComposer

### 2.1 后处理链
```
RenderPass
  ↓
BloomPass（泛光）
  ↓
SSAOPass（环境光遮蔽）
  ↓
FXAAPass（抗锯齿）
  ↓
ColorCorrectionPass（色彩分级）
  ↓
OutputPass
```

### 2.2 Bloom
- 夜晚灯笼：strength=0.8
- 上元灯节：strength=2.0
- 阈值：0.9（仅高亮区域泛光）

### 2.3 SSAO
- 半径：0.5m
- 强度：1.0
- 仅近距离开启（<50m）

---

## 3. 性能优化

| 技术 | 说明 |
|---|---|
| InstancedMesh | 合批重复物体 |
| Draco 压缩 | GLB 几何压缩 |
| Meshopt | GLB 优化 |
| KTX2 | 贴图压缩（待实现） |
| LOD | 四级距离降级 |
| Frustum Culling | 视锥剔除 |
| Fog | 远距离雾隐 |

---

## 4. 美术风格目标

- 参考：《长安三万里》电影质感
- 参考：《对马岛之魂》开放世界
- 介于写实与国漫之间
- 色彩：暖黄/朱红/青绿为主
- 光照：黄昏金橙为标志性时刻

---

## 5. 下一步

- [ ] 后处理管线集成到 demo
- [ ] KTX2 贴图压缩
- [ ] 屏幕空间反射（水面）
- [ ] 体积光（丁达尔效应）
- [ ] 景深（聚焦NPC/建筑）

---

*后处理 demo 代码就绪，沙箱恢复后跑截图验证。*
