# 恢复的生产材质候选（研究库存）

2026-10-24：旧环境未提交文件未保留，本目录依据仓库来源目录和旧研究请求缓存重建，**不是旧文件逐字节恢复**。六组 Poly Haven（fine_grained_wood、dark_wood、bark_willow_02、grey_stone_path、brown_leather、brown_mud_02）和 ambientCG Fabric081C，共七组原件、21张512² PNG。

- Poly Haven 保留1k JPG原件、作者/API信息和官方下载清单，逐文件核对官方MD5，另记SHA256。
- Fabric081C保留完整官方1K-JPG ZIP、API信息和官方CC0许可页；记录本地SHA256，官方API未提供独立摘要，不冒称有官方MD5校验。
- 原件均CC0；完整许可正文见本目录LICENSE，Fabric官方证据另在其目录。来源、作者、派生记录见manifest。扫描木材/地面和印花布不是唐代材料考古证据。
- 派生：Lanczos缩至512；OpenGL法线重新单位化；basecolor按sRGB使用，normal/roughness按线性数据使用。没有声称已统一电影色彩或通过实景接缝/物理UV验收。
- 未接入主游戏或离线包。目录名称不代表最终成品已获批准。

复验：`python tools/prepare_production_materials.py --verify`。

重新取得来源并生成：`python tools/prepare_production_materials.py`（Python、Pillow、NumPy）；与已有文件不同即停止，保护已有内容。元数据可能随网站更新而变化，不能据此覆盖已存版本。
