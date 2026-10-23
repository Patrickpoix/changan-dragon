# 原创合成音景研究层

`python3 tools/prepare_environment_audio.py`可离线重建；`--verify`检查已存摘要/PCM/电平/循环边界。固定NumPy随机种子，风/水为周期频谱塑形噪声，木轮为循环木质脉冲，钟为衰减分音，土路脚步为短噪声包络。不含第三方录音，不需要音库/密钥/运行时联网。

五条WAV为mono / PCM16 / 22.05kHz，峰值0.32；不是长安实地录音、经考证的唐代钟声、中文叫卖或已听审的最终音景。Web Audio实际解码与手势启动后的音频时钟前进见studio-source测试记录；这种技术验证不等于人耳试听和手机扬声器混音验收。

用途和空间混音/人声录音合同在production-contracts.json。未接入主游戏；没有用合成噪声冒充中文人声。被隔离的第三方混制音包记录在docs/audio-rights-review.md。
