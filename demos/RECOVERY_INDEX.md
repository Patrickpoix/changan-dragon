# 2026-10-25 豆包云端遗留成果恢复清单

范围仅限独立技术Demo；正式游戏src、vendor、dist与已有可编辑高精素材不改动。
只使用现存仓库与用户可访问的本机研究资料，不能访问豆包云端工作目录。

| 原交接项 | 当前恢复结果 | 证据/限制 |
| --- | --- | --- |
| 朱雀大街自包含入口 | 保留并修复树实例容量、漫游方向错误 | zhuque-walkable/index.html；仍需浏览器实测 |
| 朱雀Vite原20KB src/main.js | **未恢复** | 云端唯一原件不可访问，不臆造等价文件 |
| 108坊布局 | 恢复96个研究槽位及真实缺口12 | ward-generator/generate_layout.js，非历史复原 |
| 云端105个坊JSON | **原件未恢复**；重新生成93个普通坊与3特殊引用 | ward-generator/output/ |
| 云端原分块JSON | **原件未恢复**；新生成50个可再生技术分块 | city-viewer/scripts/build_chunks.mjs |
| city-viewer Vite入口27KB | 非原件，重建预取、并发限流、取消、卸载 | city-viewer/src/main.js，软件浏览器技术验收通过；正式GPU尚未实测 |
| integrated Vite入口23KB | 非原件，复用唯一技术Viewer | integrated/src/main.js，不冒称原多系统集成 |
| postprocessing Vite入口29KB | 非原件，接入已有Composer的A/B技术演示 | postprocessing/src/main.js，LUT仍未应用 |
| 大明宫与NPC源 | 现有源保留，不把缺失的外部模型标为交付 | daming-palace/src/main.js, npc-crowd/src/main.js |
| GLB/PBR/HDRI/Xbot 原件 | **未恢复** | 可核验许可后重新获取；已有否决造型不能当成品 |

从仓库根目录重建和测试：

    node demos/ward-generator/generate_city.js
    node --test demos/ward-generator/test/generator.test.cjs
    cd demos/city-viewer
    npm install --no-save --no-package-lock
    npm run dev

其他Vite目录分别安装依赖运行。npm run dev/build自动由坊JSON生成临时chunks。
唯一数据权威在 GitHub main：ward-generator/generate_layout.js、generate_ward.js 和 special-areas/*.json。ward-generator/output/ 与 public/chunks/ 均属可重复生成、Git忽略的派生缓存，构建时自动生成全部93份普通坊JSON和50个技术Chunk。已上传的20份不完整缓存从main追踪中撤回，避免误认为是完整数据。

验收证据保存在 qa-evidence/recovery-20261025/：results.json、city-viewer.png、integrated.png、postprocessing.jpg。最后一张由实际浏览器PNG截图压缩转码，只为降低仓库体积。浏览器测试使用SwiftShader软件渲染，不能替代用户笔记本GPU性能或美术验收。

未做：没有补出108个历史坊，没有找回云端源文件、GLB或动画，没有把程序化盒子称为电影级唐建筑，没有更换正式r160引擎。

## 可复用资源与正式网页构建去重（2026-10-25）

- 跨区块生命周期：shared/resource-registry.mjs 通过稳定资源ID去重同步及异步加载，按区块作用域记录引用，最后一个使用者退出才释放几何或材质；取消加载和失败重试亦有Node测试。city-viewer和integrated独立Demo已接入，正式src未迁移。测试：node --test demos/shared/resource-registry.test.mjs；浏览器测试：python demos/scripts/smoke_recovery.py。
- HTTP发布准备：tools/build_shared_web_assets.py 按已审核资产的原始路径读取字节、通过SHA256去重，每种完全相同的文件只发布一个不可变URL，多个资源ID引用同一路径。原始GLB、高精PBR母版不降面、不缩图、不覆盖，且不替代现有docs/asset-manifest.json或docs/resource-catalog.json。测试：python -m unittest discover -s tools -p test_build_shared_web_assets.py。
- 实物验证：木凳的3张CC0贴图在两个研究目录重复；6个引用共3,500,122B，去重后3个对象共1,750,061B，准确节省1,750,061B（仅该组重复贴图，不外推整个游戏，也不误称Git历史减半）。
- 正式阶段仍须基于通过美术审核的高精源建立统一asset_id、材质profile、LOD/KTX2派生及区块依赖；不能为了去重把不同唐代建筑做成同一个造型。
