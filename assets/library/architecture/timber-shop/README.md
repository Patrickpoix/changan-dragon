# 木构建筑建模样板

这是根据影视研究开始重做的完整三开间建筑**研究样板**，未部署全城，也没有通过最终国漫电影美术验收。主体建模、屋面与瓦垄、柱梁、楼板、木廊、门窗和台基均为可编辑代码生成的真实三维网格。

它不是从影片取得的生产模型，没有包含任何影片截图、标志或纹理。建模目标与来源分析见 [影视研究](../../../../docs/FILM_STYLE_RESEARCH.md)。整体是艺术化唐风设计，不声称精确考古复原。

## 文件和重建

- `runtime.glb`：独立、内嵌材质的研究样板；GLTFLoader可直接打开。根节点extras包含所用MIT构件的完整许可通知。
- `bracket-component.json`：从项目既有miniLibs移植代码导出的构件几何，MIT。
- `manifest.json`：当前几何规模、尺寸、SHA256与来源，不计入游戏正式运行的15个GLB来源。
- 主生成源为 `tools/build_timber_shop.py`。重建命令：

```sh
node tools/export_bracket_component.mjs
blender -b -t 2 -P tools/build_timber_shop.py
```

节点导出工具复用环境已有Three构建依赖；不进行联网安装。Blender会先保存可逐对象编辑的 `.blend` 到仓库外 `/workspace/.environment/changan-dragon/timber-shop-source.blend`，然后按材质合并运行网格并导出GLB。缓存丢失后可由已提交脚本重建，不把这份缓存当作唯一源文件。

运行仓库静态服务后打开 `/tools/model_review.html`，可旋转、缩放、查看正面/侧面/背面/俯视、切灰模和米尺；无需加载整个城市。这是开发验收台，不是新增的游戏菜单。

## 第三方构件

斗拱复用项目现有 `src/10-world.js:miniLibsBracketGeometry` 的MIT移植，原作者EMPTY / miniLibs (2023)。原始C#与下载证据在相邻 `minilibs-source/`，完整许可见 [miniLibs-LICENSE.txt](../../../../vendor/miniLibs-LICENSE.txt)。该构件源按宋式命名，不能把它自动认定为某座唐代建筑的精确形制。

其余模型生成代码和场景设计属于本项目工作；本文件没有把整份项目重新声明为MIT，也没有将影视参考赋予游戏复用许可。

## 当前待办

本样板已解决四坡瓦面、屋顶壳体厚度、侧窗开口、真实退廊及第一轮斗拱穿屋面问题。接下来仍需继续核对梁柱/斗拱组合、材质的色彩与风化、铺面完整陈设、不同角度轮廓、LOD/手机预算，并同小龙/人物统一尺度。当前面数与体积以manifest为准，高细节样板不能直接不分距离铺满全城。
