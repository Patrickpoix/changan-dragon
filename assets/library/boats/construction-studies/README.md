# 三类舟船：完整结构与成本样板

原创参数化代码生成，**不是最终美术或唐船考古复原**，未接入正式城市。现有CC0小船原件及正式运行包保持原样。另有`boarding-fixture.glb`，包含真实码头/1.2m搭板/透明水面，只用于静态通行和材质兼容性。生成器不加载影视图、第三方网格、贴图或商业资源，不给整个项目重新声明许可。

```sh
blender -b -t 2 -P tools/build_boat_studies.py
python3 tools/boat_study_test.py --output /tmp/changan-boat-studies
python3 tools/audit_preparation.py
```

在仓库静态服务下打开：

- `/tools/model_review.html?model=../assets/library/boats/construction-studies/skiff-lod0.glb`
- `/tools/model_review.html?model=../assets/library/boats/construction-studies/covered-lod0.glb`
- `/tools/model_review.html?model=../assets/library/boats/construction-studies/barge-lod0.glb`

| 类型 | 独立船壳尺寸 | L0/L1/L2三角形 | 内容 |
| --- | --- | --- | --- |
| 小舟 | 4.2×1.3m | 6516 / 2672 / 1336 | 中空内外壳、舷厚、地板、横凳、桨座与双桨 |
| 轻篷船 | 6.2×1.8m | 8420 / 3936 / 2232 | 独立船壳、弧肋篷与立柱、前后开口、座/桨/系泊接口 |
| 画舫 | 12×3.6m | 23076 / 8760 / 2704 | 中空壳、完整甲板、单层柱梁舱、闭合四坡屋面、两侧坐具、茶桌、真实栏杆开口、艏艉及舵桨 |

米制，GLB +Y向上，船纵轴+X，设计水线Y=0。船型、LOD与接口共用参数，**不缩放同一画舫充作三种船**。源输入仅生成器与制作规范；全部网格可重建。每船≤6材质批次、无外部资源/解码器；实际批次、字节、SHA256见manifest。导出前烘焙变换，避免以旋转小构件为合并原点使r160包围盒虚增。

画舫甲板Y=.65m、舱柱净高2.2m、中央段走道净宽≥1.2m；两侧中舷均有1.2m真实空口。茶桌位于端部会客区，不放在中部通行段。具名接口在GLB extras与manifest中同时保存；Three GLTFLoader会清理节点名称中的点，原名在`node.userData.name`，不要直接用原名调用`getObjectByName`。

结构检查包括船壳所有边恰好邻接两面、四方向/俯视/灰模、有限属性、9GLB与1个码头fixture在r160现代与强制WebGL1各加载一次、LOD接口一致、中央通道/横向登船口的甲板射线及头部净空、模型刚体变换后的接口一致。**刚体fixture不是已实现游戏搭乘**，射线不是实际人物走上船，设计水线也不是负载/稳性验证。中舷/舷条在开口处共同降低，已修正初版约8cm门槛；单有栏杆空口不足以证明可登船。

仍需：完整船形/时代/电影轮廓审查、近景木纹与低频磨损、舱内生活陈设、码头/搭板与实际游戏走面及靠泊状态连接、乘客局部坐标随船/靠岸上下船、船道/桥下净空及LOD切换实景、手机真机性能。无这些证据不放行正式替换，不把辅助概念图或本样板当最终产品。
