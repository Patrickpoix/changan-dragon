# 2026-10-24 免费素材追加调研：目录315→331

## 任务目的及实际范围

应用户“继续”要求，延续 `Patrickpoix/changan-dragon` 的完全免费的、高完成度唐风3D资源搜寻。对照既有 `docs/resource-catalog.json` 和免费协议去重，新增16个网页级候选：中式建筑/有顶桥共6，灯笼2，真实文物/古建扫描2，唐代服饰1，Blender树木工具1，船舶1，8K/16K贴图3。继续先研究、再核实真实原文件、再审美与性能验证。当前不修改代码和正式游戏，也不重复下载正在被并行线程处理的Einar/龙模型。

## 文件变更

- 修改 `docs/resource-catalog.json`：从315增至331条，所有新资源包含准确URL、公开许可口径、零元取得条件、待核风险、技术/美术阶段和未整合说明。重复发现的Ara 3D Gen、CharacterCreator、205K三角形Chinese Junk Ship被去重，无重复候选。
- 新增 `docs/worklog/2026-10-24-free-discovery-batch-331.md`：本次留痕。
- 未删除、移动、重命名其他文件；未修改 `assets/library/`、`src/`、`dist/` 或运行资产manifest。

## 已运行的验证与结果

1. 针对候选核对了原始发布网页。BlendSwap Chinese Temple的下载详情页面显示“Sign in to download / Free under CC0”（确认为必须登录但非付费）；其他BlendSwap条目发布页CC0；Sketchfab预览源显示CC BY/下载按钮；Poly Haven 8K/16K PBR官方CC0；历史参考中的唐代678年碑刻来自明尼阿波利斯美术馆CC0。项目指定最高质量限制未降低。
2. 在GitHub远端重新读取和解析JSON：`resources`、`resource_count`、`summary.records`均为331；所有ID唯一331个、URL唯一331个；分类合计331，状态合计331。阶段仍为页面候选/参考/工具研究/权利待核；无新增已取得状态与运行集成。
3. 修正统计说明中的建筑/有顶桥类别数量为6（而不是7）；计数口径验证如上。

## 未执行的验证及原因

- 没有取得16项实际源压缩包，因此未执行ZIP检查、SHA256、Blender导入、五面灰模/PBR、绑定/动画、纹理打包、导出、视觉A/B或桌面真机性能。
- 没有改动程序/正式场景，不运行游戏构建、全量功能/WebGL回归、运行时画质测试；它们不能验证URL级候选的真实可用性。

## 已知风险/不确定结论

- **免费与可直接获取不同**：BlendSwap需免费帐号；Sketchfab可能需免费账户，一项模块化宫殿页面直接打开触发403，因此明确保持 `rights_hold`，不能绕过登录或把预览图当成源模型。
- **版权分层**：CC BY必须署名；扫描/模型压缩包可能含第三方纹理；树木Easy Tree代码GPL-3，拟离线作者工具，不能擅自作为闭源游戏依赖直接捆绑。其Blender最低版本4.5高于仓库旧环境4.3.2。
- **历史分层**：瑞典博物馆1932年缩模（清代承德寺庙）不是唐代建筑；两层亭上层明确不可进入；大型帆船不是曲江画舫；古建/木料表面均须唐风重设计。
- **仍缺合格核心生产资产**：自然面部+真实骨骼唐服男女、可爱连续小青龙与走骑飞、内部外部完整唐代宫殿/店铺以及有方向动态溪水。模型页的几何面数不是美术验收结果。

## 边界与下一手

- 遵守 `AGENTS.md`、`docs/FREE_ONLY_RESOURCES_20261024.md` 的 **$0** 预算与授权限制；未付款、未进入试用扣费、未绕过受限下载、未改项目引擎和主场景。
- 下位执行者优先阅读 `docs/SYSTEM_ARCHITECTURE.md`、`docs/ART_ASSET_EXECUTION.md`、`docs/DESIGN_FRAMEWORK.md`、`docs/resource-catalog.json` 及本次记录。
- 下一步从高优先级 CC0 Blender Chinese Temple、Style3D 唐装和CC BY宫殿挑选源文件，合法下载后核验原包/许可/哈希、对已有 `tools/model_review.html` 进行多视角、实际结构与统一材质评估。无美术认可不批量铺正式城市，与并行Codex先同步并保护工作树。
