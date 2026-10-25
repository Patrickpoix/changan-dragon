# Presets.js 深度代码分析

> 来源：hafewa/chinese-ancient-architecture-sandbox
> 文件大小：47KB
> 分析日期：2026-10-25

---

## 一、整体架构

Presets类包含6个完整场景预设，每个都是一段组合式代码，调用各种生成器拼装出完整场景。

---

## 二、6个预设场景详解

### 预设1：清明上河图全卷盛景
- 5个区域从郊野到城门，沿Z轴展开
- 区域1：郊野春光 - 农舍、竹篱笆、桃花、古松
- 区域2：汴河码头 - 临水客栈、石埠码头、乌篷船、商摊
- 区域3：虹桥核心 - 木拱桥、桥头集市、望江酒楼
- 区域4：市街繁华 - 孙羊正店（二层重檐大酒楼）、彩楼欢门、药铺
- 区域5：城门楼与深宅 - 城门楼、三进四合院

### 预设2：三进四合院
- 正房、东西厢房、倒座房、抄手游廊、影壁
- 完整四合院格局

### 预设3：姑苏名园
- 荷花湖、水榭、三层六角宝塔、石拱桥
- 白墙黛瓦、月亮门、翠竹
- 天气：雨

### 预设4：帝阙琼林（皇家御苑）
- 中轴对称布局
- 前院：门楼、双荷塘、汉白玉神道、六角凉亭
- 中院：二门、五开间主殿、汉白玉月台、石狮、水榭
- 后院：二层重檐主堂、东西配楼、回廊
- 满园桃花、古松、太湖石

### 预设5：市井锦华·侯门深苑
- 左下市井：石拱桥、商摊、两层酒楼
- 侯门大宅：府门、石狮子、八字影壁
- 私园：荷花池、湖心亭、三重檐宝塔、芭蕉

### 预设6：蓬莱仙境·碧水浮宫
- 环形护城河环绕中央仙岛
- 汉白玉台基+雕花栏杆
- 多重檐复合大殿（抱厦+主殿+平座）
- 四向石桥连接
- 沿河水乡商街

---

## 三、可复用的生成器调用模式

### 建筑类型参数参考
| 类型 | width | depth | wallHeight | roofHeight | stories |
|---|---|---|---|---|---|
| 农家茅舍 | 7.5-8 | 5-5.5 | 2.8-3.0 | 1.9-2.0 | 1 |
| 临水客栈 | 9 | 6.2 | 3.4 | 2.2 | 1 |
| 望江酒楼 | 10.5 | 7.8 | 3.5 | 2.6 | 2 |
| 孙羊正店 | 14 | 9 | 3.8 | 3.0 | 2 |
| 普通商铺 | 8.5-9.2 | 6 | 3.2 | 2.2 | 1-2 |
| 六角亭 | 5.2 | - | 3.2 | 2.5 | 1 |
| 三层宝塔 | 6.8 | - | 3.2 | 2.8 | 3 |
| 主殿 | 14.5-16.5 | 8.5-10.5 | 3.8-4.0 | 2.8-3.2 | 1-2 |

### 装饰件调用清单
- createBanner(position, text) - 酒旗幌子
- createLantern(position) - 灯笼
- createStoneTable(position) - 石桌
- createMarketStall(position, rotation, type) - 商摊
- createStoneQuay(position, rotation) - 石埠码头
- createAwningBoat(position, rotation) - 乌篷船
- createRainbowBridge(position, span, width) - 虹桥
- createStoneArchBridge(position, span, width) - 石拱桥
- createHuanmen(position, rotation) - 彩楼欢门
- createManorGate(position, rotation, name) - 府门
- createStoneLion(position, rotation, scale, isMale) - 石狮
- createMarblePlatform(position, w, d, h) - 汉白玉台基
- createEightCharacterWall(position, rotation, length) - 八字影壁

### 植被调用清单
- createPeachTree(position, scale) - 桃花
- createPineTree(position, scale) - 古松
- createWillowTree(position, scale) - 垂柳
- createBambooCluster(position) - 竹林
- createLotusCluster(position) - 荷花
- createTaihuRock(position, scale) - 太湖石
- createBananaTree(position, scale) - 芭蕉

---

## 四、对我们108坊差异化的启示

### 不同坊区的参数化差异

| 坊区类型 | 建筑宽度 | 层数 | 屋顶形式 | 墙面材质 | 装饰密度 |
|---|---|---|---|---|---|
| 官署区 | 14-16 | 1-2 | 歇山 | 粉墙+石材台基 | 高（石狮、影壁） |
| 贵族宅邸 | 12-14 | 2 | 歇山 | 粉墙+雕花 | 高（花园、太湖石） |
| 东市（高档商业） | 10-12 | 2 | 歇山/悬山 | 木构+招牌 | 高（彩楼欢门） |
| 西市（胡商） | 8-10 | 1-2 | 悬山 | 木构+异域装饰 | 中 |
| 平民里坊 | 6-8 | 1 | 悬山 | 夯土墙 | 低 |
| 寺庙区 | 16-20 | 2-3 | 歇山+宝塔 | 朱墙+琉璃瓦 | 极高 |
| 平康坊（娱乐） | 10-12 | 2 | 歇山 | 华丽装饰 | 极高（灯笼、招牌） |

---

分析日期：2026-10-25 13:25
