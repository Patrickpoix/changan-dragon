# 开放世界技术参考项目更新

> 搜索日期：2026-10-25
> 补充之前的技术参考清单

---

## 一、浏览器开放世界游戏参考

### 1. grandma-gta (andyhuo520, 23星)
- 地址：https://github.com/andyhuo520/grandma-gta
- 内容：台湾乡村开放世界，老奶奶主角
- 技术：Three.js + Tripo 3D生成
- 特点：AI生成3D模型，浏览器可玩

### 2. neon-mayhem (pranshuparmar, 6星)
- 地址：https://github.com/pranshuparmar/neon-mayhem
- 内容：霓虹城开放世界驾驶游戏
- 技术：Vanilla Three.js，无构建步骤
- 特点：可离线运行，GitHub Pages部署

### 3. grand-theg-auto-i (joaonetovhc, 4星)
- 地址：https://github.com/joaonetovhc/grand-theg-auto-i
- 内容：GTA风格浏览器开放世界
- 技术：Three.js + Vanilla JS ES Modules

---

## 二、程序化城市生成参考

### ThreeJsProceduralCity (zukas3, 2星)
- 地址：https://github.com/zukas3/ThreeJsProceduralCity
- 内容：纯程序化生成城市
- 技术：Three.js + JavaScript

### procedural-city-generator (togzhan-krbkv, 1星)
- 内容：形状语法+L系统生成城市街区
- 技术：Python生成 + Three.js查看器

---

## 三、对我们项目的启示

### 浏览器开放世界关键技术点
1. **无构建部署** - neon-mayhem证明可以用Vanilla Three.js直接跑
2. **Chunk流加载** - 大场景必须分块加载
3. **LOD分级** - 远低近高
4. **InstancedMesh** - 重复物体实例化
5. **Draco压缩** - 模型几何压缩
6. **KTX2纹理** - GPU压缩纹理

### 从grandma-gta学到的
- 可以用AI生成3D模型补充素材
- 浏览器开放世界已可行
- 角色驱动叙事可以增强沉浸感

---

更新日期：2026-10-25 13:45
