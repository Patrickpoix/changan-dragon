# 2026-10-24 续轮素材检索与史实/水岸生态专项记录

## 目标
在用户要求继续广泛找素材的基础上，重点补全唐代历史真实建模依据、完整亭阁/木构、可编辑CC0高精园林石木草与水面/天空的成熟工业源；不重复已有220条内容。

## 文件
拟修改 docs/resource-catalog.json（220→257 条），新增 docs/RESOURCE_SWEEP_FOLLOWUP_20261024.md 和本工作日志。删除、移动、重命名：无。src/vendor/dist 和原始资产保持不变。

## 实际检索与验证
在多项网络查询中查阅Sketchfab博物馆/作者发布页、Poly Haven实际模型页面、官方GitHub技术项目和Fab可下载格式说明，记录明确的三角数、PBR/格式、年代与许可证风险；本轮新 37 个来源网址逐条与 GitHub resource-catalog.json 的原source_url去重；新JSON解析、总数与by_category/by_stage一致性检查实际执行并相等 257。本轮研究来源不等于开发或商业权利审批。

## 未运行
未实际下载和导入本轮新增的模型/贴图/引擎，不运行Blob/源码、Blender五视角、Three与Babylon A/B、真实水录屏、桌面GPU FPS或整城回归。因为此次仅检索文档，避免与云端Codex的高精资产生产并发覆盖且不需要运行无关测试。

## 失败/不确定/边界
Sketchfab单页有时403，故检索结果仍需在实际下载阶段核验；未查每个文件的内嵌第三方图案/著作权、NoAI/NC/CCBY-SA的具体使用条件，默认仅“来源候选”。未触碰登录/付费、账号/隐私/安全数据；没有绕过平台权利，NoAI/NC及盗用模型不做AI辅助生产。未来仍可能发生新的竞态提交，更新以实际git head为准。

## 下一位执行者
依序阅读 AGENTS.md、docs/PRODUCT_BRIEF.md、docs/SYSTEM_ARCHITECTURE.md、docs/CONTINUE.md、docs/RESOURCE_SWEEP_FOLLOWUP_20261024.md；先检查Codex当前进度，优先正规取得唐木构/CC0高精石植被/真正适用水天shader，动态实景验证并留艺术待用户批准记录。
