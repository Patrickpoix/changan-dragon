# 动态水面开源方案研究（2026-10-24）

> 针对唐长安曲江池、溪流、护城河等动态水面需求，调研可直接复用的 Three.js 开源水面方案。全部免费开源。

## 一、核心候选方案对比

| 项目 | Stars | 技术特点 | 适合场景 | 许可证 |
|---|---:|---|---|---|
| jbouny/ocean | 803 | 经典水面着色器，反射+折射+波浪 | 湖面、池塘 | MIT |
| jeantimex/threejs-water | 228 | 光线追踪反射、折射、焦散、交互 | 近景水面、船桨尾迹 | MIT |
| caustic-volume | 182 | 实时水面焦散效果 | 浅水、池底光影 | MIT |
| SeedOcean | 10 | FFT海洋，持久泡沫、浮力、水下、喷雾 | 开阔水面 | MIT |
| web-ocean-3d | 54 | FFT波浪、光学、岸浪、泡沫、焦散、浮力、尾流 | 滨海大河 | MIT |

## 二、各方案详解

### 1. jbouny/ocean（最成熟）
- 仓库：https://github.com/jbouny/ocean
- Stars：803
- 特点：
  - 实时水面着色器，支持大海和小水面
  - 平面反射+折射+动态波浪
  - 雾效和旋转演示
  - 移动端适配演示
- 优势：社区最成熟，文档和演示完整
- 局限：基于较老的 Three.js r71，需要升级到 r160

### 2. jeantimex/threejs-water（画质最佳）
- 仓库：https://github.com/jeantimex/threejs-water
- Stars：228
- 特点：
  - 实时光线追踪反射
  - 折射和焦散效果
  - 可交互物体（船、石头）
  - TypeScript 实现
- 优势：画质最高，有焦散和交互
- 适合：曲江池近景、画舫周围水面

### 3. caustic-volume（焦散专用）
- 仓库：https://github.com/ScottieFox/caustic-volume
- Stars：182
- 特点：
  - 浏览器实时水面焦散
  - 单文件精简版和沙盒版
- 优势：轻量，可单独叠加到现有水面
- 适合：池底光影、浅水区

### 4. SeedOcean（FFD海洋）
- 仓库：https://github.com/reed-soul/SeedOcean
- Stars：10
- 特点：
  - 开源 FFT 海洋
  - 持久泡沫、10种海况预设
  - 浮力、水下、喷雾和雨
  - WebGL2 回退，TypeScript
- 适合：开阔水面、大运河

## 三、推荐实施方案

### 曲江池（静水面+微风浪）
- 基础：jbouny/ocean 升级到 r160
- 增强：叠加 caustic-volume 焦散
- 效果：平静湖面+细碎波光+池底光影

### 溪流（流动水）
- 方案：自定义流动法线贴图动画
- 参考：three-stylized-water 风格化水
- 效果：沿河道方向流动+岸边泡沫

### 画舫尾迹
- 方案：基于 jeantimex/threejs-water 的交互水面
- 效果：船桨入水+尾波扩散

## 四、技术实现要点

1. **反射**：使用 Three.js Reflector 平面反射器
2. **折射**：采样水下场景纹理，添加波纹扰动
3. **波浪**：Gerstner 波叠加，垂直位移+法线计算
4. **焦散**：屏幕空间焦散纹理叠加，随时间流动
5. **泡沫**：岸边和船尾泡沫 alpha 混合

---
更新日期：2026-10-24
