# BuildingGenerator.js 深度代码分析

> 来源：hafewa/chinese-ancient-architecture-sandbox
> 文件大小：24KB
> 分析日期：2026-10-25

---

## 一、整体架构

```
BuildingGenerator
├── initMaterials()          # 材质初始化（Canvas程序化绘制）
├── createBuilding(options)    # 入口：创建建筑实例
├── buildMesh(group, config)   # 根据配置构建网格
├── buildHall(group, config, ph)    # 殿堂/楼阁
├── buildPavilion(group, config, ph) # 攒尖亭/宝塔
├── buildWaterTerrace(group, config, ph) # 水榭
└── generateStraightRoof({...})      # 屋顶生成器
```

---

## 二、材质系统（Canvas程序化绘制）

### 1. 瓦垄纹理（512×512 Canvas）
- 底色：#3a3f44（黛瓦）
- 24垄瓦，每垄用LinearGradient绘制圆筒高光
- 瓦沟阴影：rgba(15,18,20,0.6)
- 可直接复用于唐代筒瓦

### 2. 木构材质
- 朱砂红柱：#8a382c, roughness=0.65
- 栗壳木（枋、檩）：#4d3227, roughness=0.72

### 3. 石材/墙面
- 青石台基：#939a95, roughness=0.88
- 粉墙：#e8e6dc, roughness=0.92

### 4. 格扇窗（256×256 Canvas）
- 窗纸：#eedec5（暖黄）
- 木条：#5a3523
- 冰裂纹/万字格图案

---

## 三、建筑类型参数

| 类型 | 参数 | 说明 |
|---|---|---|
| xieshan（歇山殿） | width=8, depth=6, roofRatio=0.55 | 主殿 |
| xuanshan（悬山阁） | width=8, depth=6, roofRatio=0.95 | 民居 |
| pavilion（攒尖亭） | width=4.5, depth=4.5, 六角 | 亭台 |
| terrace（水榭） | 半临水，带木平台 | 观景 |

---

## 四、屋顶生成算法（核心）

### generateStraightRoof()
- 输入：width, depth, height, ridgeRatio（正脊长度比例）
- 用BufferGeometry手动构建6个面：
  1. 前坡（四边形）
  2. 后坡（四边形）
  3. 左坡（三角形）
  4. 右坡（三角形）
  5. 四周围护封檐板
  6. 檐下实心封底板
- UV映射：按宽高比例分配重复次数
- 附加构件：正脊梁、四方垂脊、鸱吻/宝顶

---

## 五、对我们项目的改造方向

### 宋代 → 唐代差异

| 维度 | 宋代 | 唐代（需改造） |
|---|---|---|
| 斗拱 | 变小，装饰化 | 硕大，结构作用强 |
| 出檐 | 较浅 | 深远（可达4米） |
| 屋顶坡度 | 较陡 | 平缓（1:2比例） |
| 鸱吻 | 鸱尾形状 | 更雄大，尾部分叉 |
| 木构色彩 | 朱砂红+栗壳 | 更朴素，少装饰 |
| 台基 | 较低 | 高大，多为须弥座 |

### 具体改造点
1. **屋顶坡度**：将宋代1:1.5改为唐代1:2（更平缓）
2. **出檐深度**：eavesOverhang从1.3m增加到2-4m
3. **斗拱**：在檐下增加斗拱构件（可参考Forbidden City 3D）
4. **鸱吻**：改为唐代鸱尾形状
5. **材质**：瓦色从青灰改为深灰黑（唐代用黑瓦）

---

## 六、可直接复用的部分

1. ✅ 瓦垄Canvas纹理生成方法
2. ✅ 格扇窗Canvas纹理生成
3. ✅ 屋顶BufferGeometry构建逻辑
4. ✅ 多层楼阁收分算法
5. ✅ 平座/栏杆生成逻辑
6. ✅ 水榭/平台生成逻辑
7. ✅ 材质参数配置结构

---

分析日期：2026-10-25 13:20
