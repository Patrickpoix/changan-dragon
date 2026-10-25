# 龙游长安 — 素材搜集与技术研究综合进展报告

> 报告时间：2026-10-25 13:50 (上海时间)

---

## 一、本轮新发现（GitHub远程搜索）

### 最重要发现：kk20054/ThreeJS-Stylized-World-Assets
- **516个模型资产**（135 Temple GLB + 381 Meadow glTF）
- 模块化中式寺庙建筑套件 + 植被/岩石/远景
- ⚠️ 许可证待确认（Stylarts + ANGRY MESH原始包可能是付费Asset Store包）
- 技术规格：Three.js 0.180+, PBR材质, 自包含GLB
- **下一步**: 确认许可证后决定是否使用

### 其他发现
1. **hafewa/chinese-ancient-architecture-sandbox** — 清明上河图古建沙盒（代码参考）
2. **aicanbuild/chinese-autumn-temple** — 中式秋景寺庙花园（代码参考）
3. **3dassets-dev/3dassets** — CC0 GLB模型MCP库
4. **nirholas/three-ws-assets** — three.ws免费CC0道具/角色库
5. **VictorZakharov/beautiful-water** — 程序化浅海水面着色器

---

## 二、现有素材库状态

| 类别 | 数量 | 来源 | 质量 |
|---|---|---|---|
| 建筑GLB | 44个 | 程序化+RigModels+改造 | 白模为主 |
| 烤PBR建筑 | 26个 | 本地加工 | 中等 |
| 唐代文物扫描 | 15个 | Gitee Mulan PSL | 高（真文物） |
| 骨骼动画角色 | 5个 | Mixamo/Three示例 | 欧洲骨架 |
| 动物GLB | 10个 | Quaternius等 | 低多边形 |
| PBR贴图 | 224张 | Poly Haven CC0 | 高 |
| 4K HDRI | 8张 | Poly Haven CC0 | 高 |
| 音效 | 359个 | Kenney CC0 | 高 |
| BGM | 4首 | Kevin MacLeod CC-BY | 中 |
| 服饰参考图 | 14张 | Cleveland博物馆CC0 | 高 |

---

## 三、关键缺口（按优先级）

### P0 — 阻塞视觉效果
1. **真正的唐式建筑精模** — 现有44个多为白模/日式改造
2. **中式灯笼自发光** — kk20054有3款但许可证待确认
3. **动态水面** — jbouny/ocean已研究但未集成
4. **唐人NPC东方脸** — 现有欧洲骨架需换脸

### P1 — 提升沉浸感
5. **骆驼/牛/狗动物模型** — 西市胡商需要骆驼
6. **东方龙主角模型** — 现有西方龙需替换
7. **摊位/幌子/招牌** — 街市氛围关键
8. **雨雷环境音** — 天气系统配套

### P2 — 锦上添花
9. **更多植被variety** — 109,784棵树需要更多种类
10. **行人服饰换色方案** — 12阶层NPC

---

## 四、技术方案已确定

- **引擎**: Three.js r169 (gzip 157KB)
- **构建**: Vite
- **坐标**: 原点西南角, X东Z北, 1 unit=1m
- **分块**: 500m×500m=360 chunks, 3×3常驻/7×7预加载
- **LOD**: <100m精模/100-300m中模/300-800m billboard/>800m雾
- **性能预算**: DrawCall<200, 三角面<50万, 几何<512MB
- **唐长安尺寸**: 9721m×8652m=84.1km²
- **108坊**: 105个坊JSON已生成, 34,568物体

---

## 五、下一步行动计划

### 立即执行
1. 确认kk20054许可证（查Stylarts/ANGRY MESH是否免费）
2. 如免费: clone到E:\project\kk20054-assets
3. 如付费: 继续找CC0替代
4. 集成jbouny/ocean水面到曲江池demo

### 短期（本周）
5. 用kk20054模块（如许可证OK）替换程序化白模
6. 制作3款唐式灯笼自发光材质
7. 寻找骆驼/牛CC0模型
8. 补全雨后雷环境音

### 中期
9. 完成朱雀大街1km可走demo视觉升级
10. 大明宫精模场景
11. 后处理管线（Bloom/SSAO/色彩分级）

---

*持续工作中，目标500小时以上。*
