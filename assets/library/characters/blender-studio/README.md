# Blender Studio 成熟制作源（造型已否决，仅保留研究）

**用户指出夸张变形不像正常人类，已撤回它们作为本项目人物造型基准，最新组合试片不再使用。** 原件保留仅作拓扑/绑定技术参考，不因资源成熟而强行采用。

官方 Snow v2、Rain v2 已实际下载。官方页面及.blend内嵌ReadMe均明确 **CC BY 4.0**；不是CC0。来源/ZIP摘要/保留的原文件逐项SHA256在各manifest。原始.blend不改写，24项Snow与18项Rain原件（包含blend与脸/身体/眼/发贴图）入Git。完整110,767,761B/199,329,585B ZIP保留在仓库外缓存，不把超过GitHub单文件上限的ZIP提交。未保留的现代衣服贴图不参与本项目加工；需要时可从缓存取，不重复下载。

核验：`python3 tools/fetch_studio_sources.py`。缺失文件恢复：`python3 tools/fetch_studio_sources.py --fetch`，先查完整缓存，再必要下载，严格按既有ZIP/成员SHA256核对；不同内容停止，不覆盖原件。

检查记录inspection.json来自Blender4.3.2禁用自动脚本打开原件。包含源网格、shape keys、修改器和制作骨架清单。原rig含大量控制/变形骨，**不适合直接全城运行**；有些Blender驱动/约束存在版本警告，不将“打开文件”称为绑定迁移已通过。

`blender -b --disable-autoexec -t 2 -P tools/prepare_studio_heads.py`导出head-study.glb：只保留静态头/眉/眼/发/口内，去衣服、制作辅助物与rig，换中性普通PBR，眼睛用作者原图缩512嵌入。此为拓扑/加载试片，不能称已导出原表情、原rig、电影皮肤材质或成品唐人。原制作源的完整变形系统仍保留，下一阶段精简/烘焙/重绑定后才检查新动作。

**署名**：Snow and Rain by Blender Studio, <https://studio.blender.org/characters/>, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modifications by Changan Dragon project: static neutral head studies, rig/controller and modern clothes excluded, eye image resized, proportion/clothing assembly experiments. 原内嵌许可逐字见各ReadMe.txt，官方页面快照保留（临时媒体URL签名已去除，不影响下载源或许可正文）。

适用：成熟脸部连续拓扑、表情/口内/眼睑、人体/制作绑定研究。风格成本：需要调整具体脸形/肤色/发式、唐服剪裁、普通PBR烘焙、65骨以内生产骨架与LOD。并非“西式角色直接换衣色就能成为唐人”。静态头约3万面，已超普通NPC整人近景预算，需选择性保留/重拓扑；不是可直接量产的人群资源。
