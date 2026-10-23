# 独立准备组合试片（非生产美术）

运行仓库静态服务后打开 `tools/model_review.html?model=../assets/library/preparation-study/assembly.glb`。整组真正三维，可正侧背/俯视、灰模、米尺及近景检查；不是概念图转背景。

生成：`blender -b -t 2 -P tools/build_botanical_studies.py`，再`blender -b -t 2 -P tools/build_preparation_study.py`。依赖现有Blender4.3.2，无新运行引擎。`production-spec.json`管理单位、前向、人物尺寸和法线强度；完整雕塑/裁衣/木构细节在生成器中可调。可编辑.blend为缓存，脚本/输入/GLB/哈希在Git，可重建。

复用：完整MIT木构研究GLB、MakeHuman CC0核心body与官方自然成年男/女宏目标（不放大头眼）（移除helper并遮蔽衣内人体）、CC0法线/粗糙度、原EZ-Tree MIT针叶树及新原创悬垂柳枝。使用保留层级的组合导入，未覆盖所有原件。Snow/Rain的夸张头脸已被用户否决，不在本组合中使用。自写小龙体素雕塑/木车/衣服轮廓仍很初步，**不能用于电影美术放行**。

许可：木构包含miniLibs MIT通知，原树包含EZ-Tree MIT；PBR完整CC0见production-materials/LICENSE，MakeHuman核心许可见characters/makehuman-base/。本目录只有派生试片，没有将MakeHuman应用程序AGPL代码或影视图像混入GLB。新增自写几何不改变原资源许可；项目整体未另宣称某种开源许可。

美术差距：脸部还未匹配用户人物图，服装是截面工艺验证且袖口/领口/褶皱仍需裁衣，龙的眼窝/表情/尾根/脸形需要完整重拓扑，木构缺少新店铺图的生活尺度/材质风化/侧后院落，树冠需要进一步构图。静态试片未绑定、无新人物动作；不存在已经替换全城或通过真机的声明。
