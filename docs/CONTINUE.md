# 当前续做记录（2026-10-23）

用户要求继续完成唐代长安真正三维的小龙自由探索产品：国漫电影美术、宏伟建筑、丰富坊市/商旅/行人/画舫/游船/亭台连廊，横屏手机浏览器，步行/木自行车/飞行、多视角与电影赏景。当前可玩但视觉仍未达到认可概念，不得称为AAA、最终成熟或已完成全部需求。概念图只用于参考，绝不作为3D背景替身。

## 工作约束与文件安全

- 工程 `/workspace/changan-dragon`，work分支，已快进纳入用户上传提交 `39357e2`，保留全部本地开发修改。用户现已明确要求提交并推送备份；准备保存到 `codex/changan-dragon-progress`，完成后以git实际状态为准。保护当前源码和素材，不reset或覆盖。
- 用户明确停止新子代理以节省额度，由主代理继续。未创建定时“继续”消息，当前没有可靠的会话定时工具。
- 用户授权不限域名网络；配置草稿保存 `allowed_domains:["*"]`。当前环境状态API显示running/connected、策略mode unrestricted但state unknown；以实际请求结果为准，不宣称发布或新环境恢复已验证。
- 2026-10-23用户说原本地剩余文件已上传。已核对远端main `39357e2d13c42c069e7341cd42face4e93c2040e`，只取回本地缺失文件并逐一校验Git blob SHA1，保留所有本地改动。新取回 `vendor/three.min.js` 与3张旧版验收截图。原引擎SHA256与本地兼容包完全一致（Three0.160.1），可直接使用原入口。导入清单见 `upload-import.json`。此远端树没有22张独立PNG；现有代码素材/运行模型自包含，不因此停工。

## 已实际实现

- 本地静态HTML/JS/WebGL；独立r160兼容引擎、官方GLTF/RGBE/PMREM/Water/SAO/Bloom/Output/FXAA/SkeletonUtils。原上传r160引擎优先，单文件固定校验兼容包。自动手机流畅，medium/high增强渲染。
- `04-compatibility.js` 新补WebGL1蒙皮：采用Three r150官方MIT骨纹理读取公式，为每个骨纹理宽度注入uniform，含蒙皮阴影材质。修复r160在WebGL1使用textureSize/texelFetch/int取余导致尾巴、马鹿消失。WebGL2不修改。低能力水面走兼容shader，不尝试HDR倒影。
- 核心/渲染05/表面06/水面07/导入08/植物09/城市10/地标12/人物20/探索25/存档27/循环30分模块；两处脚本清单位于src/boot.js和tools/build_standalone.py，增加模块必须同步。
- 程序柳/桃/松真实枝叶，空间合批/近远几何、地面高度、树干碰撞与飞行冠层包络。成熟作者树8处。共享镜头和庙阶/宫阶/街铺种植净空。
- 软边噪声云/昼夜天空、HDR只作环境光；圆角几何正确归一；城市土色与局部园地、实比例石材/近景圆角铺路石、空间地面高度索引。
- 含元殿重檐庑殿裙顶+真实木构上层/歇山顶、逐开间屏门格窗、斗拱、真实盖瓦条；城门上层窗廊/栏杆、下层木门金钉；upperStorey避免楼上出现巨大石台。
- 店铺可进入、布幔矢量团花边饰+CC0织物法线、弧形摊篷、实物货架/藤篮/陶器/木器/新鲜果品。圆润陶器24段、布卷改真实布材质，作者木碗/姜对齐实际柜台。
- 玉色大眼小龙、连续7骨骼尾、分叉角/鬃毛、真实木自行车/脚踏与步行飞行动画。188位共享实例行人与原有商贾守卫等，服装顶点mask织物微法线、闭合肩口、衣摆/肢体/阴影GPU步态。5位胡商复用作者面部/头发，唐风圆领长袍和头巾由代码实现，不采用西式服装。
- 8只CC0马鹿，独立骨架与原作者Walk/Idle/Eating，4匹马真实巡游；动态蒙皮未合批，静态素材按几何/材质/64米空间合批。
- 四跟随镜头、近墙/摊位避障、开场右侧实景小龙、8处景点、电影镜头/暂停/留影/返回、横屏单行44px控件、本机存档/存储禁用回退、触摸摇杆/双指缩放/飞行升降。
- 水上长廊/湖心亭/桥面/码头/停泊画舫/商铺/宫阶实际可走。诗笺可选，主路诗笺移到路边15.3/350、缩小弱化；电影时隐藏。

## 正式素材与体积

- 当前15个GLB源：13个Poly Haven CC0（陶锅、木凳、藤篮、木碗、木桶、苔石6形、阔叶树、蕨、草、姜、荔枝、亚洲梨5形、石榴），2个Quaternius CC0（马、鹿）；另1种Quaternius Farmer面部衍生索引几何1577顶点/2976面。
- GLB二进制7,182,492B，runtime-models.js 9,582,151B。市场果品约900余处实例，单次布局总计约1045–1075个逻辑模型摆放（代码消耗固定随机序列，改布局会改计数）；实际对象约273–280，不能将逻辑数误称绘制调用。
- CC0瓦/灰泥法线粗糙、布料normal/ORM、Venice Sunset HDR；MIT miniLibs斗拱与Three；OFL马善政字体子集432760B。原许可/作者/源哈希/优化元数据保留在assets/library。Quaternius旧CC0包使用固定公开镜像commit722c39e…，作者具体许可页也保存，未用镜像仓库许可冒充模型许可。
- 最新单文件 `dist/changan-dragon.html` 17,110,151B；源变动后重建。内嵌代码/字体/材质/GLB/许可，加载后移除脚本DOM并释放GLB原base64，保留解码共享资源。
- 当前在/tmp审阅Quaternius Ships Pack小船（CC0），尚未采用：轮廓过于简化，需评估能否通过平滑和增加内饰融入风格。不能将候选当已接入。

## 最新测试证据（不要把旧测试当最新）

- `/tmp/changan-round9-fixed-qa/results.json` 通过：844×390完整交互、667×375与390×844布局。首次round9因旧诗笺坐标夹具失败，已修正并检查“旧主路无提示→新路边拾取→刷新”。该轮早于最后果品/兼容层改动。
- `/tmp/changan-offline-round10/results.json` 通过：15GLB源、真实长廊/亭/画舫/铺面/宫阶通行、刷新地面y=.117、断网high SAO/Bloom/FXAA/曲江倒影/PNG，零外部资源请求/页面与控制台错误。早于最新树净空/WebGL1层。
- `/tmp/changan-webgl1-acceptance/results.json` 最新单文件兼容专项通过：强制WebGL1、16属性、floatVertexTextures=true，9个蒙皮网格（8动物+龙尾）、动作变化/飞行/赏景/高画质安全回退、glError=0，无页面和控制台错误。真实截图dragon-and-rigs.png已查看。
- `/tmp/changan-food-integration/food-counter.png`与log验证15来源、果品实例、base64释放，无异常；首次果品第五颗悬浮已改成同高度平摆，托盘比例和陶器布卷已后续精修。
- `/tmp/changan-round6-art/`相机距目标5.79m，地面空间索引与穷举误差0。`/tmp/changan-entry-review/entry.png`确认hero在右侧画面内。`/tmp/changan-merchant-review/merchant.png`已人工检查闭合肩口/作者脸/腰带。
- Browser插件当前缺失，Python Playwright + /usr/bin/chromium SwiftShader；同一时刻只跑一个完整WebGL浏览器。软件渲染不证明实际手机帧率。管理策略阻止file://，不绕过；单文件以HTTP取文档再断网验收，未宣称手机本地文件已测。

## 继续工作优先项

1. 原上传引擎启动专项已通过：docs/qa-evidence/uploaded-engine.json，source=original/revision160，实际帧和667×375触控布局正常、无必需资源或页面/控制台错误；6个必需HTTP入口均200。当前8877服务日志写/tmp/changan-http.log；环境启动指令见ENVIRONMENT.md。
2. 舟船修正：画舫龙骨当前最低.22高于水面.04，小船实心Extrude且船底约.47，存在悬浮。保留停泊画舫甲板1.11与通行面，只下延船底；换真中空小船、增加桨/人物。小船旧航线穿过低曲桥，必须审查全航线的船体足迹/岸线/湖心岛/桥/船间距。
3. 继续对照认可的art-direction.png和concept-market/palace/qujiang.png：当前岸线庭园层次、建筑密度、人物服饰和灯光仍明显简化，不能以数量替代美术质量。每次素材筛选后看实际3D截图再采用。
4. 新改动做针对性真实浏览器验证并重建单文件，更新ASSET_RESEARCH/manifest/QA/本记录；测试通过后不无谓重复全部旧套件。

## 环境与命令

Python3、Node24、Blender4.3.2、fontTools、Playwright和Chromium已安装。Three0.160.1/esbuild0.25.12开发依赖在 `/workspace/.environment/changan-rendering`，不要把构建缓存放入仓库。无需账号、API密钥、后端或应用npm安装。

```sh
cd /workspace/changan-dragon
python3 tools/prepare_assets.py
python3 tools/build_standalone.py
python3 -m http.server 8877 --bind 0.0.0.0 --directory /workspace/changan-dragon >/tmp/changan-http.log 2>&1
python3 tools/smoke_test.py --url 'http://127.0.0.1:8877/?quality=low' --viewports landscape compact portrait --output /tmp/changan-review
python3 tools/offline_test.py --output /tmp/changan-offline-review
python3 tools/compatibility_test.py --output /tmp/changan-webgl1-review
```

修改addons后 `node tools/build_rendering_addons.mjs`；修改采用的GLB后 `python3 tools/build_asset_bundle.py --bundle`；字体覆盖修改后 `python3 tools/subset_font.py`。历史详细记录保留在CONTINUE_HISTORY.md；以上当前记录优先。
