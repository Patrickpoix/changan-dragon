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
| city-viewer Vite入口27KB | 非原件，重建预取、并发限流、取消、卸载 | city-viewer/src/main.js，待浏览器验收 |
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

未做：没有补出108个历史坊，没有找回云端源文件、GLB或动画，没有把程序化盒子称为电影级唐建筑，没有更换正式r160引擎。
