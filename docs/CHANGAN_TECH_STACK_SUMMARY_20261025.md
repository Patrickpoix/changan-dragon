# 长安项目整体技术栈总结

> 创建时间：2026-10-25

---

## 前端技术栈

### 核心
- **Three.js r169**: 3D渲染引擎
- **Vite**: 构建工具
- **JavaScript (ES6+)**: 开发语言

### 关键库
- **DRACOLoader**: 几何压缩
- **MeshoptDecoder**: 网格优化
- **KTX2Loader**: 纹理压缩
- **EffectComposer**: 后处理
- **Rapier**: 物理引擎（可选）

---

## 内容生产工具

### 3D建模
- **Blender**: 建模（可选，主要用程序化生成）
- **ez-tree**: 程序化树木
- **jbouny/ocean**: 水面着色器

### 素材来源
- **Poly Haven**: HDRI（CC0）
- **ambientCG**: PBR材质（CC0）
- **Kenney**: 音效（CC0）
- **KayKit**: 3D模型（CC0）
- **Quaternius**: 角色模型（CC0）

---

## 部署
- **GitHub Pages**: 静态托管
- **CDN**: 全球加速
- **WebGL**: 浏览器运行

---

## 性能目标
- **DrawCall**: <200
- **三角面**: <200万
- **帧率**: 60fps（桌面）
- **加载时间**: <10秒

---

*技术栈简洁高效，全部免费开源，适合WebGL开放世界。*
