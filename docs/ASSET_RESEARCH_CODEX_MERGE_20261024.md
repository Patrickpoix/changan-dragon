# 龙游长安：在线素材与引擎筛选（codex分支merge）

> 调研日期：2026-10-23。此文是实际 HTTPS 请求、作者仓库 README/许可、glTF 文件结构和官方预览图的调查结果。**候选、可选素材库与已接入的运行时素材分开记录；仅通过筛选的资源进入游戏。**

## 当前美术目标与本次可交付素材

用户明确要求以电影级中国动画和高品质三维游戏的空间、材质、光照、细节为目标，不能把简单程序化玩具小城作为最终效果。程序化建模仍是编辑几何的手段，最终质量必须由近景模型、真实材质、建筑比例、层次、光影、连续镜头和浏览器实测来证明。

当前实际接入 **13 个成熟 CC0 模型来源**：陶锅、藤篮、木碗、木桶、木凳、苔石6形、阔叶树、蕨类、草、姜、荔枝、亚洲梨5形、石榴；共约1045处实例。另已接入 CC0 织物法线/ORM、瓦面与灰泥法线/粗糙度、本地 HDR 环境光。

## 已实际下载的成熟素材

### Poly Haven 模型来源
| 素材 | 作者 | 用途 |
|---|---|---|
| Ceramic Pot 陶锅 | Aron Łyczek | 食摊/器物店 |
| Wicker Basket 藤篮 | Kuutti Siitonen | 蔬果摊 |
| Wooden Bowl 木碗 | Kuutti Siitonen | 市集餐具 |
| Wooden Bucket 木桶 | James Ray Cock | 储水/运货 |
| Chinese Stool 木凳 | Kirill Sannikov | 通用坐具 |
| Rock Moss Set 01 苔石 | Kless Gyzen | 岸线假山 |
| Fern 02 蕨类 | Rob Tuytel / Rico Cilliers | 阴湿地被 |
| Grass Bermuda 01 草 | Rico Cilliers | 地面草簇 |
| Food Ginger 姜 | - | 市集食品 |
| Food Lychee 荔枝 | - | 市集食品 |
| Food Asian Pears 亚洲梨 | - | 市集食品 |
| Food Pomegranate 石榴 | - | 市集食品 |
| Tree Small 02 阔叶树 | Rico Cilliers | 街巷近景树 |

### Quaternius 动物来源
| 素材 | 用途 |
|---|---|
| Horse 马 | 东西市巡游马 |
| Deer 鹿 | 兴庆宫赏鹿 |

## 成熟建筑生成器与构件算法

### miniLibs 斗拱（MIT）
- 仓库：https://github.com/in-a-mist/miniLibs
- 内容： ShanTou/LuTou 枓、HuaKung/NiTaoKung 栱，卷杀、栱眼、挖槽真实轮廓
- 说明：宋式斗拱算法，可移植为 Three.js BufferGeometry
- 价值：斗拱参数化生成的核心参考

### ACA Builder（清式官式）
- 仓库：https://github.com/ppddry/ACA-Builder
- 说明：清代北方官式建筑生成器，依据《清工部工程做法则例》
- 注意：不作为唐代殿堂直接采用，仅作结构参考

### yingzao 营造法式
- 仓库：https://github.com/TanTien-Engine/yingzao
- 内容：佛光寺、斗拱、框架结构
- 说明：唐代建筑方向更有价值，待取得授权

## 可用引擎与工具

| 工具 | 许可 | 用途 |
|---|---|---|
| Three.js r160 | MIT | 渲染引擎 |
| meshoptimizer | MIT | glTF 几何压缩 |
| glTF Transform | MIT | 离线加工工具 |
| 马善政字体 | OFL 1.1 | 牌匾/片名书法字体 |

## 已明确舍弃的资源

- **Sketchfab 中式建筑**：需登录才能下载，且多为明清风格
- **Khronos Dragon**：Stanford 许可，非 CC0
- **Kenney City Builder 建筑**：现代西式街区，不适合唐代
- **Quaternius 新包**：许可已改为 QAL v1.0，不支持再分发

## 移动端性能要求

- 风格以轮廓、圆角、比例、统一调色和柔光为主
- 台基、梁、瓦、栏杆统一复用几何和材质
- 草簇、树群、瓦头用实例批次及距离裁剪
- 阴影只保留关键近景和主光
- 暂定目标：桌面 60fps，手机 30fps

---
来源：codex/changan-dragon-progress 分支 merge
更新日期：2026-10-24
