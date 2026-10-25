# 坊市不同建筑母体：真实GLB制作研究（2026-10-25）

本目录包含两套由仓库内**完整可重复运行的源脚本**生成的独立三维网格，并非豆包云端丢失的模型，也不是由原两层木构商铺拉伸复制而来。

- `market-pavilion.glb`：单层三开间、市坊内部开敞铺棚与硬质瓦屋顶，具备真实可进入的中央通道、柱脚、梁、出挑支承、屋面瓦缝、架设柜台与木格栅。
- `courtyard-gate.glb`：带门道及侧墙的院落入口，采用四坡屋顶、厚墙、双扇半开木门、柱梁、压顶与雕刻式门楣；形体、通行方式和原两层铺面不同。

它们不是考古精确复原；市场铺棚和院落门楼的具体年代形制、材料、屋面坡度、木构构件等级均待独立史料和电影美术审核。脚本使用原创网格和内嵌简单PBR颜色材质（**尚未完成最终真实木纹、瓦/泥灰高分辨PBR贴图**），不能冒充成熟免费外源4K模型。避免把结构技术达标等同于电影级完成。

生成源：`tools/build_ward_architecture_studies.py`；在安装numpy+trimesh的隔离开发环境执行：
```
python tools/build_ward_architecture_studies.py
```
生成的GLB和带模型哈希、尺寸、三角形数和材料数的`manifest.json`应提交GitHub main，确保跨会话复用；不要只留在本机。浏览器四面、近景、碰撞和实际美术验收前，禁止将新GLB批量替换正式城市。

## 非侵权历史参考（只阅读，不复制插画和模型）
- Heng Chye Kiang (2014), *Visualizing Everyday Life in the City*, JSAH 73(1), DOI 10.1525/jsah.2014.73.1.91。里坊用地、院落与内街布局研究。
- *A Comparative Study of Urban Spatial Characteristics of the Capitals of Tang and Song Dynasties Based on Space Syntax* (2021), https://www.mdpi.com/2413-8851/5/2/34 。描述坊门、道路、东西市与后世沿街商业模式差异。
- *Study of Roof Forms of the Tang Dynasty Structures according to the Murals in the Mogao Caves in Dunhuang, China* (2023)。屋顶类型、壁画研究；**不是特定建筑可直接复制的准确蓝图**。
