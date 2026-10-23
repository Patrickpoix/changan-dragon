# 音景实际取得与授权复查

2026-10-23重新请求 [JC Sounds Nature Ambient Pack Vol 1](https://opengameart.org/content/jc-sounds-nature-ambient-pack-vol-1)，取得官方链接的78,466,981B 7z，解出Peaceful Lake、Campfire Crackling、Forest Day、Desert Wind四条约3.1MB MP3。不是只有候选链接；没有把它们接入游戏或提交为可分发资产。

进一步阅读页面评论：2025-09-24作者明确写“some birds, wind and more stuff that's from libraries I've bought”；管理员追问是否可CC BY再分发，作者解释混制过程，管理员仍询问具体库/URL。公开页面没有这些上游库及再许可条款。因此页面的CC BY4.0标签不足以在本项目公开仓库分发整个混制源文件。

下载、页面、选取原件和SHA256清单保留在环境缓存`resource-prep/audio-rights-hold/`，不删除、不宣称已合法放行；可丢失缓存不是生产依赖。没有联系作者、购买或代用户发送消息。后续若没有新的清晰许可链，就持续不采用，不重复下载。

现可复现替代为 [原创合成脚本](../tools/prepare_environment_audio.py)，输出风、水感、木轮、远钟、土路脚步五层PCM，存于`assets/library/environment-audio/`，无需外部音库/服务。它们用于验证离线音频解码、循环和区域混音接口；并非实地录音、最终音效或已经听审的电影音景。中文叫卖仍按production-contracts中的独立人声录制合同处理，不能用Web Speech运行时联网或合成杂音冒充。
