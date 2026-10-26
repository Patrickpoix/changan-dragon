# 《龙游长安》ChatGPT Sites 部署测试记录

日期：2026-10-26（北京时间）。结论：原版静态运行文件已两次发布成功；Safari真机、3D实际渲染与性能未通过验收；无人值守GitHub main自动部署未实现。

## 站点与版本

- URL：https://changan-dragon-test-20261026.freshelm12.chatgpt.site
- 独立owner-private测试站点；正式入口在云端Chrome显示“登录后即可访问”。需使用站点所有者的ChatGPT账号登录，不需要在ChatGPT客户端内嵌页面打开。
- project_id：appgprj_6adf579669a48191a0a3d0f3ca2f808b
- v1来源 main：af99a99e6fd4f61c9cf91ffa8066597a99d9f4c5
- v1 Sites源提交：9d88220acbc575fce125921924ada32a150659ed
- v1部署：appgdep_6adf5a964f7c8191b252a63fe5055f7c，succeeded。
- v2来源 main：494dec33c346786c0f146a1cee3a2cae766b2561
- v2 Sites源提交：9f8feab0a30fc2713832aaf64efee899e9702163
- v2版本：appgprj_6adf579669a48191a0a3d0f3ca2f808b~appgver_2454382b482881919a65c1350e702d59
- v2部署：appgdep_6adf5bbf28c08191a20dc038a20165c0，succeeded，同一URL。
- 测试中的“最新”均指各次导入时固定的main提交；仓库仍有其他执行者继续更新，本测试没有锁定或改动main。

## 目的、范围和变更清单

目标是部署现有游戏并检验Sites，而非制作新游戏。GitHub main保持唯一源码权威。
隔离路径：/workspace/sites/changan-dragon-test-20261026。

新增站点文件：.openai/hosting.json、PROVENANCE.json、WORK_LOG.md、SYNTAX_CHECKS.json，以及dist中的49个原版文件。完整49文件路径、字节数、Git blob SHA见同目录的SITES_RUNTIME_PROVENANCE_20261026.json。
49文件包括index.html、完整src和vendor、现有assets五个模型/材质等JS文件以及字体文件。最终运行文件总量25,117,041字节。现有真实素材通过原有runtime-models.js、scene-materials.js等保留；未简化、减面、改材质或重写游戏。制作源、研究文档及其他独立demo不属于根游戏的运行依赖，没有把全仓库制作资料作为网站文件发布。
main递归树最初2336项、文件约1.09GB，这是制作/研究/演示/运行文件总量，不是首屏网络加载量，也不表示已下载发布全部1.09GB。

v2原样跟进9个上游文件：src/99-safe-init.js，以及src/enhance下landmarks、night-light、outside、performance、sky、vegetation、visual-grade、water.js。没有本地自行修改这些游戏文件。
删除：站点副本中最初下载工具产生的download-verification.json中间失败报告；失败与纠正方式保留在WORK_LOG，最终以PROVENANCE为准。无移动/重命名。

GitHub只新增独立测试分支chatgpt/sites-deployment-test-20261026及本报告/清单。没有改动main、现有部署、原游戏源码或本机配置；没有强推或覆写其他执行者成果。

## 实际执行的验证及结果

| 项目 | 结果与证据范围 |
| --- | --- |
| 完整运行文件来源 | 49文件与v2固定main提交的Git blob SHA逐项一致，零不一致 |
| 文件引用 | boot.js的38个静态引用全部存在 |
| JS语法 | 40个JS运行node --check，全部退出0；不表示运行逻辑无误 |
| 托管 | 两次save/deploy均返回succeeded，第二次沿用URL |
| 私有访问入口 | 云Chrome独立打开部署URL，正确出现ChatGPT登录门；没有绕过认证 |
| 3D预览 | 实际打开原游戏，云Chrome无法创建WebGL上下文：GL_VENDOR/GL_RENDERER Disabled，Error creating WebGL context |
| 连锁错误 | 00-core初始化失败后renderer/Batch/MAT/WORLD等未定义；不能将这些单独作为新版本游戏缺陷结论 |
| 模型文件保留 | 模型/材质JS文件字节一致；由于WebGL失败，没有验证实际模型解码与场景摆放 |
| 后续更新 | main的9个运行文件变化后，站点版本仍只有v1；显式导入并再次调用发布后v2成功 |

最初raw固定提交链接404，部分main分支raw缓存与固定提交不一致；通过GitHub连接器直接读取固定提交纠正，最终全部哈希一致。不把初次失败的导入当作通过。

## 自动部署调查与实测

1. 官方create_source_repository_write_credential实际传入publish_on_push=private；返回publish_on_push_accepted=false、publish_on_push_expires_at=null。当前账号没有获得该实验自动发布窗口。它即使可用，也不能据此推断已经绑定外部GitHub main。
2. 实际查询GitHub自动化事件schema：支持pull_request的开启、合并和可选提交更新等事件；没有普通main push事件。enable_commit_updates指PR synchronize，不是任意main推送。未以PR触发冒充需求，未创建轮询或后台任务。
3. 本轮没有找到/配置官方“绑定此GitHub仓库main并持久自动部署”的入口。当前站点是导入快照。第二次发布明确由本会话显式调用，不是GitHub自动发布。
4. 研究第三方JacobLinCool/make-chatgpt-site：README说明经本机已登录Codex的app-server转接Sites，不需导出浏览器cookie。它不是已验证的GitHub托管集成或长期CI授权。仅查文档，未安装、未运行、未进行安全审计；没有向第三方发送ChatGPT凭据。
5. 本机DevSpace连接失败，Local Coding报告隧道客户端超过300秒未在线；未尝试重配本机以扩大本测试。
6. 因持久触发/认证入口未建立，没有完成任意main push到Sites无人值守更新的端到端实测，不能报告为已实现。

第三方来源：https://github.com/JacobLinCool/make-chatgpt-site

## Plus、容量与流量

官方当前定价文档称公开beta期间Sites包含在符合资格的ChatGPT套餐内，取决于套餐、地区与工作区。此次账号实际允许创建和两次发布，未购买额度、未启用收费服务。
https://learn.chatgpt.com/docs/pricing

官方存储表：每Site D1数据库10GB，R2对象存储无固定容量上限。
https://learn.chatgpt.com/docs/sites
这不是“整个游戏只能10GB”，也不等于免费无限存储/流量。当前检索到的官方页面及本轮接口未提供此账号可确认的每月流量、带宽、请求总量、静态单文件/包体硬上限或剩余额度数字，因此这些仍未验证。没有使用Cloudflare个人免费套餐数值替代Sites配额。没有消耗额度进行上限压力测试。

此次仅证明约25.1MB现有运行文件可发布，未证明GB级运行素材、多人并发、长时间访问或长期免费容量可靠性。现有1.09GB制作仓库大小不构成GB级网站性能测试。D1未启用；游戏既有浏览器本地存档逻辑保持原样，未建立云存档。

## 未运行验证、原因与不确定性

- Safari、iPhone、Mac真机：无Safari控制环境；云Chrome不等于Safari。
- 3D渲染、模型解码、移动交互、键鼠/触摸、景点、长时间稳定性、帧率、显存/发热：当前浏览器WebGL不可用，无法有效验收。
- v2真实渲染没有重复测试：基础WebGL环境限制未改变；仅完成全文件哈希与40JS语法检查。
- 登录后的线上游戏加载：云浏览器停在认证门，未进入；未请求/生成绕过令牌。
- 大陆网络直连、CDN跨地区表现：没有测试。
- GB级资产发布、流量/负载与完整回归：本任务未改游戏，且上述环境/配额不明确，没有机械跑全量或耗尽额度。
- 第三方桥接、安全审计与无人值守CI：未安装、未实测。

## 后续维护与优先阅读

优先读本报告与SITES_RUNTIME_PROVENANCE_20261026.json；Sites源仓库中还有WORK_LOG.md与SYNTAX_CHECKS.json。复用project_id，禁止重新创建同名站点。
短期做法：从GitHub main固定一次提交，复制原运行依赖，逐项校验哈希，再在同一Sites保存/发布。只在GitHub改游戏，Sites保持可再生成的发布副本。
下一步首先在真实Safari登录此URL，验证入城、真实模型、步行/骑行/飞行、昼夜与存档，以及启动时间/持续帧率；此项通过前不宣称游戏已可正常游玩。
如必须“Claude/Codex直接push main即自动发布”，当前测试未达到条件。优先保留已具备GitHub持续部署能力的现有托管作正式入口；Sites继续作隔离验证站点。若以后采用PR合并触发的官方任务或本机桥接，需另做持久授权、失败恢复、更新并发和真实更新的端到端验收，不能直接把本报告当作该方案已通过。

安全/数据/研究/执行边界：保持$0，不购买或自动扣费；未新增第三方账号访问，不导出cookie/ChatGPT会话；所有短期凭据只在会话内存与隐藏stdin；网站保持owner-private；无现有环境配置或生产部署改动。
