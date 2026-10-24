# 天空与氛围效果方案研究（2026-10-24）

> 针对唐长安电影级天空、体积云、雾效需求，调研可直接复用的 Three.js 开源方案。

## 一、体积云方案

### sky-cloud-3d
- 仓库：https://github.com/xiaxiangfeng/sky-cloud-3d
- Stars：29
- 特点：
  - 基于物理的 3D 天空和体积云网格
  - 实时光照和动画
  - 一行代码集成
  - 支持 WebGL/WebGPU

## 二、已有 HDRI 环境光

| HDRI | 氛围 |
|---|---|
| Kiara Dawn 黎明 | 暖金晨景 |
| Kloppenheim 晴朗白日 | 干净明快 |
| Venice Sunset 日落 | 黄昏水面 |
| Sunset JHB Central 城市日落 | 暖金夕照 |
| Autumn Forest 01 秋林 | 暖秋光线 |
| Bambanani Sunset 草原日落 | 开阔落日 |
| Aarfontein Dawn 2 原野黎明 | 清早日野 |

## 三、推荐氛围方案

### 清晨（晨跑时段）
- 天空：淡蓝色渐变，薄雾
- 云：薄云，淡金色边缘
- 光线：低角度暖光，长阴影
- 对应 HDRI：kiara_1_dawn

### 正午（游览高峰）
- 天空：湛蓝色，少量白云
- 云：蓬松积云
- 光线：明亮顶光，清晰阴影
- 对应 HDRI：kloppenheim_06_puresky

### 黄昏（最佳观影时段）
- 天空：橙金到紫粉渐变
- 云：火烧云，金边逆光
- 光线：低角度暖金，长阴影
- 对应 HDRI：sunset_jhbcentral / venice_sunset

### 秋景（季节限定）
- 天空：高远淡蓝
- 云：丝状卷云
- 光线：清冷通透
- 对应 HDRI：autumn_forest_01

## 四、雾效方案

- **薄雾**：Three.js FogExp2，城市远景朦胧
- **晨雾**：清晨河面薄雾，密度随时间变化
- **远山雾**：终南山方向空气透视

---
更新日期：2026-10-24
