# 龙游长安项目技术栈总览

> 文档版本：v1.0
> 日期：2026-10-25

---

## 一、核心技术
- 引擎：Three.js r169
- 构建：Vite
- 语言：JavaScript / TypeScript

---

## 二、3D技术
- 模型格式：GLB / glTF
- 几何压缩：Draco + Meshopt
- 纹理压缩：KTX2 Basis
- PBR材质流程

---

## 三、生成技术
- 建筑：程序化生成（参考chinese-ancient-architecture-sandbox）
- 树木：ez-tree程序化生成
- 地形：THREE.Terrain
- 水面：jbouny/ocean着色器

---

## 四、性能优化
- InstancedMesh
- LOD多级
- 流加载（500m chunk）
- Frustum Culling
- 距离剔除

---

## 五、后处理
- Bloom
- FXAA
- Vignette
- Color Grading

---

设计日期：2026-10-25 15:00
