# 西市坊内街段：真实GLB组合与近景PBR试片（2026-10-25）
 
## 目的
在**不修改正式游戏**的情况下，验证现存授权三维建筑、真实树木、道具、材质在同一场景中的形体、比例、交互和性能。它是艺术研发工作台，**不是新唐式资产交付、更不是最终精美长安**。
 
## 运行
从仓库根目录：`python -m http.server 8877`，打开
`http://localhost:8877/demos/tang-street-study/`。
依赖仓库内 `vendor/three.compat.min.js`、`vendor/rendering-addons.js`，无CDN或新增npm依赖。
场景只放已保存仓库的现成真实网格：
- 木构店铺 `assets/library/architecture/timber-shop/runtime.glb` — 项目生成的真实三维研究样板，约73k三角形，MIT miniLibs斗拱原件已附许可；**不是经考证的盛唐店铺，也尚未获电影美术认可**。
- `assets/library/polyhaven/tree_small_02/runtime.glb` — Poly Haven CC0 研究运行版（源始2M三角形已保存在库，运行版约53k三角形）；**不可将简化运行版冒充高精制作源**。
- `assets/library/polyhaven/chinese_stool/runtime.glb`、`wicker_basket_01/runtime.glb` — CC0道具，时代适用性尚未核准。
- `assets/library/production-materials/grey_stone_path/source/{basecolor_1k,normal_1k,roughness_1k}.jpg` — Poly Haven CC0原始1K石路PBR；瓦、木构材质依然沿用GLB研究源，不虚称全建筑高精4K PBR。
 
## 历史和参考边界
选**坊内市场支巷**，不把主轴朱雀大街的坊墙错误替换成连续临街店铺。参考：Heng Chye Kiang, *Visualizing Everyday Life in the City: A Categorization System for Residential Wards in Tang Chang'an*, Journal of the Society of Architectural Historians, 2014, https://doi.org/10.1525/jsah.2014.73.1.91 。本文为学术参考，**未复制论文插图、模型或受限复原图**。
佛光寺东大殿（857年）、南禅寺（782年）均晚于设定中开元天宝时期；可用木构术语与连接层级作推敲依据，不能直接将晚唐大殿照搬成盛唐商铺。院落、铺面开间、街墙与店面形制须在独立美术审核后调整。
 
## 当前缺口
1. 缺确定年代的唐式商铺原型/自有高完成度美术模型、门楼街巷系统、真实商品陈设、唐服人物和桥水结合；3份店铺来自同一研究母体，**重复资产不是场景成熟**。
2. 试片使用研究树的GLB运行衍生版和既有1K PBR，不能代表最终4K/高质量LOD/RTX4060实机指标。
3. 实际浏览器测试/画面与硬件性能以 `qa-evidence` 的独立核查为准；单靠代码、模型存在或Vite构建都不算验收。
4. 设计原型与正式游戏分离；需要多视角审美和历史形制认可后才能进入主城批量生产。
