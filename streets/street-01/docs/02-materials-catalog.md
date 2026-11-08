# PBR 材质总表

共 **29 种材质**，每种输出 `albedo / normal / roughness / metallic / ao / height / orm` 七通道（透明与自发光材质另有 `opacity` / `emissive`），全部四边无缝平铺。

基色来源：`references/palette.json`（生图材质研究板逐格采样），经去光照补偿后作为 albedo 主色。

## 路面

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `stone_paving` | 青石板铺装 | #7B7F75 | 2048 px | 2.0 m | 0.68–0.94 | 0.00 | 04_stone_paving_detail |
| `stone_curb` | 路缘石 | #777B71 | 1024 px | 1.0 m | 0.70–0.95 | 0.00 | 04_stone_paving_detail |
| `grey_brick` | 青砖地 | #8F8779 | 2048 px | 1.2 m | 0.70–0.95 | 0.00 | 08_material_board |
| `rammed_earth` | 夯土路面 | #8F5A3D | 2048 px | 1.5 m | 0.78–0.98 | 0.00 | 08_material_board |
| `mud_track` | 车辙泥 | #5C4732 | 1024 px | 1.2 m | 0.80–0.98 | 0.00 | 04_stone_paving_detail |
| `water_puddle` | 积水 | #32404A | 1024 px | 1.0 m | 0.06–0.22 | 0.00 | 04_stone_paving_detail |

## 建筑

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `rammed_earth_wall` | 夯土墙 | #88563A | 1024 px | 1.6 m | 0.78–0.98 | 0.00 | 08_material_board |
| `grey_brick_wall` | 青砖墙 | #8D8577 | 2048 px | 1.2 m | 0.70–0.95 | 0.00 | 08_material_board |
| `lime_plaster` | 白灰抹面 | #C9C1B0 | 2048 px | 1.4 m | 0.72–0.95 | 0.00 | 08_material_board |
| `vermilion_lacquer` | 朱漆柱 | #7E2722 | 2048 px | 0.6 m | 0.30–0.72 | 0.00 | 05_lacquer_polychrome |
| `timber_beam` | 木枋梁 | #8F7554 | 2048 px | 0.8 m | 0.58–0.86 | 0.00 | 08_material_board |
| `wood_plank` | 木板 | #8B7152 | 1024 px | 0.7 m | 0.60–0.88 | 0.00 | 07_market_props |
| `lattice_paper` | 格扇糊纸 | #D5CAAC | 1024 px | 0.5 m | 0.78–0.96 | 0.00 | 02_shopfront_elevation |
| `roof_tile` | 青筒瓦 | #67665E | 2048 px | 0.9 m | 0.68–0.94 | 0.00 | 03_roof_tile_detail |
| `roof_ridge` | 瓦当屋脊 | #63615A | 1024 px | 0.5 m | 0.70–0.95 | 0.00 | 03_roof_tile_detail |
| `stone_base` | 台基石 | #A39C8F | 1024 px | 1.0 m | 0.66–0.90 | 0.00 | 02_shopfront_elevation |
| `painted_dougong` | 青绿彩画 | #48534A | 2048 px | 0.6 m | 0.38–0.88 | 0.00 | 05_lacquer_polychrome |
| `black_lacquer` | 黑漆匾额 | #221B18 | 1024 px | 0.5 m | 0.28–0.66 | 0.00 | 02_shopfront_elevation |

## 装饰

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `gilt_bronze` | 鎏金铜件 | #C59B40 | 1024 px | 0.4 m | 0.20–0.78 | 0.88 | 05_lacquer_polychrome |
| `lantern_silk` | 灯笼纱 | #B0B0A9 | 1024 px | 0.3 m | 0.62–0.90 | 0.00 | 06_lanterns_banners |
| `indigo_banner` | 靛蓝布幡 | #202C54 | 1024 px | 0.5 m | 0.76–0.96 | 0.00 | 06_lanterns_banners |
| `ochre_banner` | 赭黄布幡 | #CB8A49 | 1024 px | 0.5 m | 0.76–0.96 | 0.00 | 06_lanterns_banners |
| `bamboo_weave` | 竹编 | #D7AE66 | 1024 px | 0.4 m | 0.70–0.94 | 0.00 | 07_market_props |

## 道具

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pottery` | 陶器釉面 | #A16A46 | 1024 px | 0.4 m | 0.28–0.88 | 0.00 | 07_market_props |
| `sackcloth` | 麻袋粗布 | #B9A57C | 1024 px | 0.4 m | 0.80–0.98 | 0.00 | 07_market_props |

## 自然

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `tree_bark` | 槐树皮 | #7C6A55 | 1024 px | 0.6 m | 0.76–0.98 | 0.00 | 08_material_board |
| `leaf_atlas` | 槐叶图集 | #4C7035 | 1024 px | 1.0 m | 0.62–0.90 | 0.00 | 01_street_overview |
| `moss` | 苔藓 | #5B783F | 1024 px | 0.4 m | 0.84–0.98 | 0.00 | 04_stone_paving_detail |

## 细节

| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `grime` | 污渍贴花 | #3A2F25 | 1024 px | 1.0 m | 0.84–0.98 | 0.00 | 04_stone_paving_detail |

## 通道约定

| 通道 | 色彩空间 | 说明 |
| --- | --- | --- |
| albedo | sRGB | 固有色，无烘焙光照与方向阴影 |
| normal | Linear | OpenGL +Y，由 height 求导 |
| roughness | Linear | 灰度，含微观变化 |
| metallic | Linear | 仅鎏金铜 / 彩画金线非零 |
| ao | Linear | 由高度与缝隙遮蔽导出，不写入 albedo |
| height | Linear | 位移 / 世界空间细节 |
| orm | Linear | 打包图 R=AO、G=Roughness、B=Metallic，glTF 直接引用 |
| opacity | Linear | 叶片图集、污渍贴花（glTF 中合成为 RGBA basecolor） |
| emissive | sRGB | 灯笼纱、格扇糊纸的暖光 |

接口示例（glTF）：`baseColorTexture = albedo`，`normalTexture = normal`，`metallicRoughnessTexture = orm`，`occlusionTexture = orm`。
