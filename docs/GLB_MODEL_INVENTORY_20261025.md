# GLB模型清单详细设计（2026-10-25）

> 已有GLB模型完整清单与分类。

---

## 一、建筑模型（26个）

### A类：核心精模（7个）
| 模型 | 类型 | 大小 | 状态 |
|---|---|---|---|
| Tang_Hall_9bay | 9开间大殿 | 中 | ✅ demo中 |
| Tang_GateTower | 城门楼 | 中 | ✅ demo中 |
| Tang_Pagoda5 | 五重塔 | 中 | ✅ demo中 |
| Tang_SideHall | 配殿 | 小 | ✅ demo中 |
| Tang_BellTower | 钟楼 | 中 | ✅ demo中 |
| Tang_DrumTower | 鼓楼 | 中 | ✅ demo中 |
| Tang_CornerTower | 角楼 | 小 | ✅ demo中 |

### B类：模块化kit（13个）
| 模型 | 类型 | 大小 | 状态 |
|---|---|---|---|
| Tang_FangGate | 坊门 | 小 | ✅ demo中 |
| Tang_FangWall | 坊墙段 | 小 | ✅ demo中 |
| Tang_Paifang | 牌坊 | 小 | ✅ demo中 |
| Tang_ShopFront | 商铺面 | 小 | ✅ demo中 |
| Tang_Pavilion | 六角亭 | 小 | ✅ demo中 |
| Tang_House1 | 普通民居 | 小 | ✅ demo中 |
| Tang_House2 | 两层民居 | 小 | ❌ 待做 |
| Tang_Restaurant | 酒楼 | 中 | ❌ 待做 |
| Tang_TempleHall | 寺庙大殿 | 中 | ❌ 待做 |
| Tang_Tower | 大雁塔 | 大 | ❌ 待做 |
| Tang_PalaceGate | 宫殿门 | 中 | ❌ 待做 |
| Tang_Wall | 城墙段 | 小 | ❌ 待做 |
| Tang_Bridge | 石桥 | 小 | ❌ 待做 |

### C类：小品（6个）
| 模型 | 类型 | 大小 | 状态 |
|---|---|---|---|
| Tang_StoneLion | 石狮 | 小 | ✅ demo中 |
| Tang_StoneLantern | 石灯 | 小 | ❌ 待做 |
| Tang_Jingchuang | 经幢 | 小 | ❌ 待做 |
| Tang_Huabiao | 华表 | 中 | ❌ 待做 |
| Tang_Lantern | 灯笼(自发光) | 小 | ✅ demo中 |
| Tang_Stool | 摊位 | 小 | ❌ 待做 |

---

## 二、角色模型（5个骨骼+12阶层variety）

### 骨骼载体
| 模型 | 骨架 | 动画 | 状态 |
|---|---|---|---|
| Xbot | 欧洲人 | idle/walk/run | ✅ demo中 |
| Soldier | 欧洲士兵 | idle/walk/run | ✅ |
| RobotExpressive | 机器人 | idle/walk/run | ✅ |
| FarSoldier | 士兵 | idle/walk/run | ✅ |
| Fox | 狐狸 | walk/run | ✅ |

### 唐人variety（待做）
| 类型 | 贴图 | 状态 |
|---|---|---|
| 高级官员(紫袍) | 待做 | ❌ |
| 中级官员(绯袍) | 待做 | ❌ |
| 低级官员(绿袍) | 待做 | ❌ |
| 文人书生 | 待做 | ❌ |
| 贵族妇女 | 待做 | ❌ |
| 普通妇女 | 待做 | ❌ |
| 士兵 | 待做 | ❌ |
| 僧侣 | 待做 | ❌ |
| 胡商 | 待做 | ❌ |
| 平民百姓 | 待做 | ❌ |
| 手艺人 | 待做 | ❌ |
| 儿童 | 待做 | ❌ |

---

## 三、动物模型（8个）

| 模型 | 类型 | 大小 | 状态 |
|---|---|---|---|
| Horse | 马 | 中 | ✅ demo中 |
| Deer | 鹿 | 中 | ✅ |
| Bird1 | 飞鸟1 | 小 | ✅ demo中 |
| Bird2 | 飞鸟2 | 小 | ✅ |
| Bird3 | 飞鸟3 | 小 | ✅ |
| Duck | 鸭 | 小 | ✅ |
| Fox | 狐狸 | 小 | ✅ |
| WesternDragon | 西方龙×2 | 大 | ✅(参考) |

### 待补充动物
| 动物 | 类型 | 状态 |
|---|---|---|
| Camel | 骆驼 | ❌ |
| Ox | 牛 | ❌ |
| Donkey | 驴 | ❌ |
| Dog | 狗 | ❌ |
| Chicken | 鸡 | ❌ |
| Heron | 鹭鸶 | ❌ |

---

## 四、道具模型（5个）

| 模型 | 类型 | 大小 | 状态 |
|---|---|---|---|
| ChineseDesk | 中式案几 | 小 | ✅ |
| CandleStand | 烛台 | 小 | ✅ |
| Brazier | 炭火盆 | 小 | ✅ |
| Avocado | 牛油果 | 小 | ✅ |
| MilkCart | 牛奶车 | 小 | ✅ |

### 待补充道具
| 道具 | 类型 | 状态 |
|---|---|---|
| Signboard | 招牌幌子 | ❌ |
| Cart | 马车/牛车 | ❌ |
| SedanChair | 轿子 | ❌ |
| Boat | 船 | ❌ |
| Goods | 货物/商品 | ❌ |

---

## 五、唐代文物3D扫描（15个，Gitee Mulan PSL）

| 文物 | 类型 | 状态 |
|---|---|---|
| 明光铠 | 铠甲 | ✅ |
| 跪射俑 | 陶俑 | ✅ |
| 彩绘仕女俑 | 陶俑 | ✅ |
| 齐胸襦裙 | 服饰 | ✅ |
| 玉璧 | 玉器 | ✅ |
| 石佛 | 佛像 | ✅ |
| 开元通宝 | 钱币 | ✅ |
| 崇宁通宝 | 钱币 | ✅ |
| 端砚 | 文具 | ✅ |
| ...等 | ... | ✅ |

---

## 六、总计

| 类别 | 数量 | 已有 | 待做 |
|---|---|---|---|
| 建筑模型 | 26 | 15 | 11 |
| 角色模型 | 5骨骼+12variety | 5骨骼 | 12variety |
| 动物模型 | 8+6 | 8 | 6 |
| 道具模型 | 5+5 | 5 | 5 |
| 唐代文物 | 15 | 15 | 0 |
| **总计** | **~90** | **~48** | **~42** |

---
文档日期：2026-10-25
