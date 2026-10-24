# 2026-10-24 — 系统架构/湖溪真实流动研究工作留痕

## 任务与实际变更
用户要求全域高精长安美术（宫殿、亭台、店铺、人物、园林、石桥、水、船、声音）及波光粼粼湖泊/持续沿河道流动的潺潺小溪；允许初创期系统性考虑替换 Three.js / 渲染、物理、制作和资源发布，既自上而下又自下而上避免补丁累积。

**计划提交**：新增 `docs/SYSTEM_ARCHITECTURE.md`（唯一架构/技术选择/水系质量入口）和本日志；修改 `AGENTS.md`、`docs/PRODUCT_BRIEF.md`、`docs/DESIGN_FRAMEWORK.md`、`docs/ART_ASSET_EXECUTION.md`、`docs/CONTINUE.md`、`docs/production-spec.json`、`docs/resource-catalog.json`。**不删除、移动或重命名文件。** 不修改 `src/`、`vendor/`、`dist/`、实际模型/纹理或 Einar/龙原件。

## 已执行核对
- 联网阅读 Three WebGPU/TSL 与官方迁移指南、Babylon/PlayCanvas、UE Pixel Streaming/Godot 浏览器说明、水材质/高度场 MIT 仓库、真实中国石拱桥、Poly Haven CC0 河床石等外部发布资料，均在总纲中列明原始地址。
- Poly Haven 官方 API 实际获取 River Small Rocks 三份 2K PBR JPG 的 URL、字节数及 MD5 元数据；此步骤不等于文件本身已下载。
- GitHub 只读审查仓库最新 AGENTS、PRODUCT_BRIEF、CONTINUE、DESIGN_FRAMEWORK 和 production-spec，并发现并行 Codex 于 2026-10-24T03:22:18Z 推送 `12ad9f4`（高精 Einar、两只龙原件入库，目录由135增到140）。**采用这一最新版本重新合并 AGENTS、CONTINUE、production-spec 与资源目录，未使用较旧文件覆盖并行 Codex 的成果**。
- 资源目录去重，19 条新增 **candidate only** 的引擎/水系/材质/桥/流式加载公开来源链接。后续提交回读及 JSON 分类/阶段计数验证须以实际输出记载，不将未跑视作通过。

## 未执行与原因
- 未下载 19 个新增候选的源码/二进制，也未替换 Three、水、物理或 asset loader；未运行 Blender 多角度、浏览器流动录屏、A/B 引擎与真机 GPU 回归。原因是当前云端 Codex 正在实做高精资产，必须先隔离技术样板并按同源素材比较，不能无证据破坏运行时；本次 docs-only 修改不触碰游戏功能，不机械跑整城测试。
- 用户要求的视频级水流、光学效果和完整美术**仍是未解决的制作目标**；候选 shader 有 pool/平面限制和 r160/WebGPU 兼容风险。实际桌面性能、迁移范围和艺术验收未知。

## 研究、安全、数据和授权边界
没有绕过登录/付费、索取用户账号、改安全/私有数据、运行第三方来源脚本或重分发受限资源。资产清单维持 candidate/acquired 区别。用户授权择优换底座，但尚不允许冒称迁移验证通过；保持只主代理、保护正在进行的云端工作和避免强推。

## 下一位优先阅读
`AGENTS.md` → `docs/PRODUCT_BRIEF.md` → `docs/SYSTEM_ARCHITECTURE.md` → `docs/DESIGN_FRAMEWORK.md` → `docs/CONTINUE.md` → `docs/production-spec.json`。先查 Codex Cloud 当前未提交工作，保护 Einar/龙高精源，然后在隔离 worktree 用同一套完成度足够高的角色、桥溪柳岸、店铺场景做现代 Three WebGPU 与 Babylon（必要时 PlayCanvas）动态真实对照，决定一套长期渲染/物理/内容管理架构。
