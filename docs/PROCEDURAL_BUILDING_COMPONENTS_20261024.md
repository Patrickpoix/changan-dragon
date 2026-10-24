# 程序化建筑组件研究（2026-10-24）

> 基于 Forbidden City 3D（MIT）源码深度分析
> 核心文件：HallKit.js + RoofBuilder.js

---

## 一、可直接复用的建筑组件

### 1. 殿身生成 buildHallBody()
**参数：**
- width：面宽（柱中到柱中，米）
- depth：进深
- height：柱高（地面到额枋顶）
- bays：面宽间数（奇数）
- facade：lattice（隔扇门窗）/ wall（红墙）/ open（敞开）
- openBays：哪些间敞开可通行

**生成内容：**
- 檐柱（圆形截面，收分）
- 槛墙/隔扇门窗
- 额枋彩画带
- 自动计算碰撞体

### 2. 须弥座台基 buildSumeruBase()
**参数：**
- width/depth：顶层台面尺寸
- height：总高
- layers：层数（可多层）
- balustrade：是否带汉白玉栏杆
- stairs：台阶位置和宽度，可带御路

**生成内容：**
- 多层收分台基
- 汉白玉栏杆四面环绕
- 台阶和御路
- 自动碰撞体

### 3. 屋顶生成 RoofBuilder.js
**屋顶类型：**
- hip（庑殿顶）
- gable（歇山顶）
- pavilion（攒尖顶）

**核心算法：**
- 举折剖面：t=0屋脊 → t=1檐口，凹曲线（脊部陡、檐部缓）
- 等高线多边形族：每个t对应一圈水平多边形
- 四坡相交无裂缝（共用角脊线）
- 翼角起翘：角部起翘 + 平面出冲
- 走兽脊兽自动排列

---

## 二、材质体系

项目使用 TextureLibrary 统一管理材质：
- roof_tile — 屋顶瓦
- rafters — 椽子
- dougong_band — 斗拱带
- caihua_beam — 彩画梁
- wood_column — 木柱
- wall_red — 红墙
- sumeru_band — 须弥座
- balustrade — 栏杆
- marble — 大理石
- door_studded — 门钉门
- lattice_doors — 隔扇门

**我们的改造方向：**
- roof_tile：灰色瓦（唐代）而非黄色琉璃（明代）
- wall_red：朱红色（唐代）
- wood_column：朱红木柱
- caihua_beam：唐代彩画（更朴素）

---

## 三、性能优化方案

### 合批优化
- 同材质合批，DrawCall减少66.5%
- Triangles减少57.1%
- 使用 mergeByMaterial() 工具函数

### LOD策略
- 走近15m自动加载内景
- 离开40m自动卸载
- 失败自动回退

---

## 四、改造为唐代风格的要点

| 维度 | 明代故宫 | 唐代建筑 |
|------|---------|---------|
| 屋顶 | 黄琉璃瓦 | 灰陶瓦 |
| 斗拱 | 小而密 | 大而疏（出檐远） |
| 柱色 | 朱红 | 朱红（更雄浑） |
| 彩画 | 和玺彩画（华丽） | 唐代彩画（朴素） |
| 台基 | 汉白玉三层 | 砖石台基 |
| 整体比例 | 严谨规整 | 雄浑舒展 |

---

## 五、下一步

1. 提取 RoofBuilder.js 核心算法
2. 提取 HallKit.js 组件库
3. 改造材质为唐代风格
4. 调整比例为唐代建筑尺度
5. 集成到唐长安项目

---
研究日期：2026-10-24
