# 后处理管线详细设计

> 创建时间：2026-10-25

---

## 目标
达到《长安三万里》电影质感 + 《对马岛之魂》美术水准。
后处理是从"3D模型"到"电影画面"的关键一步。

## 后处理链（按顺序）

### 1. Bloom（泛光）
- **作用**: 高光发光，夜晚灯笼效果
- **参数**: 
  - 阈值: 0.85（只让很亮的物体发光）
  - 强度: 0.8（白天）/ 2.0（夜晚灯节）
  - 半径: 0.6
- **效果**: 灯笼、月亮、灯光有光晕

### 2. SSAO（环境光遮蔽）
- **作用**: 角落、缝隙有阴影，增加立体感
- **半径**: 0.5m
- **强度**: 1.5
- **效果**: 屋檐下、墙角、家具底部有自然阴影

### 3. 色彩分级（Color Grading）
- **作用**: 统一画面色调，电影感
- **白天**: 偏暖黄，对比度+10%
- **黄昏**: 金橙色调
- **夜晚**: 偏冷蓝，对比度+20%
- **阴影**: 偏青蓝（电影感）
- **高光**: 偏暖黄

### 4. 暗角（Vignette）
- **作用**: 画面四周暗，聚焦中心
- **强度**: 0.3
- **效果**: 电影宽屏感

### 5. 景深（DOF）
- **作用**: 近景清晰，远景模糊（相机对焦）
- **只在特定镜头模式开启**
- **默认关闭**（开放世界需要全清晰）

### 6. 抗锯齿（FXAA/TAA）
- **作用**: 消除锯齿边缘
- **使用**: FXAA（快速）
- **移动端**: 关闭，节省性能

---

## Three.js实现方案

### 使用EffectComposer
```javascript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
```

### 性能分级
| 平台 | 后处理 |
|---|---|
| 高端桌面(RTX) | 全部开启 |
| 中端桌面 | Bloom + 色彩分级 + FXAA |
| 笔记本 | 只色彩分级 |
| 移动端 | 关闭后处理 |

---

## 电影感关键参数

### 对比度曲线
- S曲线：暗部更暗，亮部更亮
- 中间调柔和

### 色彩倾向
- 阴影: 青蓝 (0.9, 0.95, 1.0)
- 高光: 暖黄 (1.0, 0.95, 0.85)
- 中间调: 自然

### 颗粒感
- 轻微胶片颗粒（强度0.03）
- 增加电影质感

---

*后处理是"3A感"的秘密武器，同样的模型加了后处理立刻不一样。*
