# 当前续做记录（2026-10-23）

用户要求继续完成唐代长安真正三维的小龙自由探索产品：国漫电影美术、宏伟建筑、丰富坊市/商旅/行人/画舫/游船/亭台连廊，横屏手机浏览器，步行/木自行车/飞行、多视角与电影赏景。当前可玩但视觉仍未达到认可概念，不得称为AAA、最终成熟或已完成全部需求。概念图只用于参考，绝不作为3D背景替身。

## 工作约束与文件安全

- 工程 `/workspace/changan-dragon`，main分支。原成果 `9493a63` 已按用户要求快进合并并推送到origin/main，独立备份分支codex/changan-dragon-progress也保留。后续在main继续，完成检查后提交推送，保护用户文件，不reset或强推。
- 用户明确停止新子代理以节省额度，由主代理继续。未创建定时“继续”消息，当前没有可靠的会话定时工具。
- 用户授权不限域名网络；配置草稿保存 `allowed_domains:["*"]`。当前环境状态API显示running/connected、策略mode unrestricted/state enforced、spec_revision=3。当前运行正常，不将当前实例验证冒充新实例恢复验证。
- 2026-10-23用户说原本地剩余文件已上传。已核对远端main `39357e2d13c42c069e7341cd42face4e93c2040e`，只取回本地缺失文件并逐一校验Git blob SHA1，保留所有本地改动。新取回 `vendor/three.min.js` 与3张旧版验收截图。原引擎SHA256与本地兼容包完全一致（Three0.160.1），可直接使用原入口。导入清单见 `upload-import.json`。此远端树没有22张独立PNG；现有代码素材/运行模型自包含，不因此停工。

## 已实际实现

- 本地静态HTML/JS/WebGL；独立r160兼容引擎、官方GLTF/RGBE/PMREM/Water/SAO/Bloom/Output/FXAA/SkeletonUtils。原上传r160引擎优先，单文件固定校验兼容包。自动手机流畅，medium/high增强渲染。
- `04-compatibility.js` 新补WebGL1蒙皮：采用Three r150官方MIT骨纹理读取公式，为每个骨纹理宽度注入uniform，含蒙皮阴影材质。修复r160在WebGL1使用textureSize/texelFetch/int取余导致尾巴、马鹿消失。WebGL2不修改。低能力水面走兼容shader，不尝试HDR倒影。
- 核心/渲染05/表面06/水面07/导入08/植物09/城市10/地标12/人物20/探索25/存档27/循环30分模块；新增11-shorelines沿湖园路模块；两处脚本清单位于src/boot.js和tools/build_standalone.py，增加模块必须同步。
- 程序柳/桃/松真实枝叶，空间合批/近远几何、地面高度、树干碰撞与飞行冠层包络。成熟作者树8处。共享镜头和庙阶/宫阶/街铺种植净空。
- 软边噪声云/昼夜天空、HDR只作环境光；圆角几何正确归一；城市土色与局部园地、实比例石材/近景圆角铺路石、空间地面高度索引。
- 含元殿重檐庑殿裙顶+真实木构上层/歇山顶、逐开间屏门格窗、斗拱、真实盖瓦条；城门上层窗廊/栏杆、下层木门金钉；upperStorey避免楼上出现巨大石台。
- 店铺可进入、布幔矢量团花边饰+CC0织物法线、弧形摊篷、实物货架/藤篮/陶器/木器/新鲜果品。圆润陶器24段、布卷改真实布材质，作者木碗/姜对齐实际柜台。
- 玉色大眼小龙、连续7骨骼尾、分叉角/鬃毛、真实木自行车/脚踏与步行飞行动画。188位共享实例行人与原有商贾守卫等，服装顶点mask织物微法线、闭合肩口、衣摆/肢体/阴影GPU步态。5位胡商复用作者面部/头发，唐风圆领长袍和头巾由代码实现，不采用西式服装。
- 8只CC0马鹿，独立骨架与原作者Walk/Idle/Eating，4匹马真实巡游；动态蒙皮未合批，静态素材按几何/材质/64米空间合批。
- 四跟随镜头、近墙/摊位避障、开场右侧实景小龙、8处景点、电影镜头/暂停/留影/返回、横屏单行44px控件、本机存档/存储禁用回退、触摸摇杆/双指缩放/飞行升降。
- 水上长廊/湖心亭/桥面/码头/停泊画舫/商铺/宫阶实际可走。诗笺可选，主路诗笺移到路边15.3/350、缩小弱化；电影时隐藏。

## 正式素材与体积

- 当前15个GLB源：13个Poly Haven CC0（陶锅、木凳、藤篮、木碗、木桶、苔石6形、阔叶树、蕨、草、姜、荔枝、亚洲梨5形、石榴），2个Quaternius CC0（马、鹿）；另2种Quaternius索引几何：Farmer面部1577顶点/2976面，以及Ships Pack中空小船790顶点/1460面。
- GLB二进制7,182,492B，runtime-models.js 9,582,151B。市场果品约900余处实例，单次布局总计约1045–1075个逻辑模型摆放（代码消耗固定随机序列，改布局会改计数）；实际对象约273–280，不能将逻辑数误称绘制调用。
- CC0瓦/灰泥法线粗糙、布料normal/ORM、Venice Sunset HDR；MIT miniLibs斗拱与Three；OFL马善政字体子集433168B。原许可/作者/源哈希/优化元数据保留在assets/library。Quaternius旧CC0包使用固定公开镜像commit722c39e…，作者具体许可页也保存，未用镜像仓库许可冒充模型许可。
- 最新单文件 `dist/changan-dragon.html` 18,687,084B；源变动后重建。内嵌代码/字体/材质/GLB/许可，加载后移除脚本DOM并释放GLB原base64，保留解码共享资源。
- Ships Pack小船已加工接入：22mm三段圆角/加权法线，保留作者中空轮廓与木色分区；数据在assets/boat-hulls.js，源文件、CC0作者页、固定镜像SHA和加工元数据在quaternius/boat_hull。船板/坐凳/桨座/人物/双桨/尾流为可编辑JS。

## 最新测试证据（不要把旧测试当最新）

- `/tmp/changan-round9-fixed-qa/results.json` 通过：844×390完整交互、667×375与390×844布局。首次round9因旧诗笺坐标夹具失败，已修正并检查“旧主路无提示→新路边拾取→刷新”。该轮早于最后果品/兼容层改动。
- `/tmp/changan-offline-round10/results.json` 通过：15GLB源、真实长廊/亭/画舫/铺面/宫阶通行、刷新地面y=.117、断网high SAO/Bloom/FXAA/曲江倒影/PNG，零外部资源请求/页面与控制台错误。早于最新树净空/WebGL1层。
- `/tmp/changan-webgl1-acceptance/results.json` 最新单文件兼容专项通过：强制WebGL1、16属性、floatVertexTextures=true，9个蒙皮网格（8动物+龙尾）、动作变化/飞行/赏景/高画质安全回退、glError=0，无页面和控制台错误。真实截图dragon-and-rigs.png已查看。
- `/tmp/changan-food-integration/food-counter.png`与log验证15来源、果品实例、base64释放，无异常；首次果品第五颗悬浮已改成同高度平摆，托盘比例和陶器布卷已后续精修。
- `/tmp/changan-round6-art/`相机距目标5.79m，地面空间索引与穷举误差0。`/tmp/changan-entry-review/entry.png`确认hero在右侧画面内。`/tmp/changan-merchant-review/merchant.png`已人工检查闭合肩口/作者脸/腰带。
- Browser插件当前缺失，Python Playwright + /usr/bin/chromium SwiftShader；同一时刻只跑一个完整WebGL浏览器。软件渲染不证明实际手机帧率。管理策略阻止file://，不绕过；单文件以HTTP取文档再断网验收，未宣称手机本地文件已测。

## 合并main后的舟船与湖岸精修

- 画舫龙骨从水面上方下延至局部y=-.22，保留停泊甲板1.11及登船通行面。小船替换为作者真中空船壳，龙骨-.20、舷边.63，增加木板横凳/桨座/划桨人物/同步双桨。每船独立动作相位，浅尾流跟随水面/昼夜，人物远景裁剪。
- 曲江增加小型碧帘画舫；总共6船，含2移动画舫、1停泊画舫、曲江2小舟和兴庆1小舟。旧小船航线中心两次各有6/256采样落在低桥上，现改分离航线并按米/秒设小舟速度。
- 新11-shorelines：曲江东岸2.4米宽园路，随真实湖岸并绕开作者石块/树根/亭柱。225几何中心点、地面高度索引、岸边低栏柱碰撞、柳桃与共享CC0蕨草地被。树根避让道路；栏杆独立沿岸布置，避免凹弯栏柱侵入邻近路段。
- 首轮点采样通过后，真实走路暴露弯道问题，已增加路径细分/根部净空，并检查每20cm细段；栏柱和路面分开沿岸布置后重跑通过。保留失败原因，不把失败目录称为通过。
- 水域碰撞由旧椭圆改为真正ShapeGeometry的多边形，小地图同源。湖心岛通行边界与17×12m实际平台一致；修复可见水面能走、可见干岸不能走的问题。低档水面减白色Fresnel冲淡、增加细波，柳叶投影面积提高但没有增加叶片三角形数。
- `docs/qa-evidence/boats-and-shore.json` 对应 `/tmp/changan-boats-final4/results.json`：最新单文件通过。6船每条512位置，真实变换后的船壳足迹/桨范围对可见水多边形、岛、桥检查无侵入；15组独立航线包络最小间隔约.542m。11163个水域网格与画面轮廓无不符；园路细段无碰撞；224个连续目标由真实键盘+updateMovement求解走完，仅设置起点，未注入终点。实际1120×630/844×390截图、船动作、glError=0和零页面/控制台错误均通过。
- 上一轮round12动作检查两时点恰遇正弦对称，夹具误报不动；现观察三个时点，真实动作变化已通过。旧final/final2/final3发现路面转角/栏柱问题，最终通过目录是final4。
- 最新单文件offline_test已通过（/tmp/changan-offline-round15/results.json，仓库证据offline-boats-shore.json）：四处真实通行/宫阶/刷新存档、断网high倒影+SAO/Bloom/FXAA/PNG，零外部请求/页面/控制台错误。WebGL1也已通过（/tmp/changan-webgl1-round16/results.json，仓库证据webgl1-boats-shore.json），9蒙皮、飞行/赏景/高档安全回退、glError=0、零错误。

## 林下镜头专项（舟船提交之后）

- CityBotany新增每片叶/花瓣共享的局部anchor属性，顶点阶段检查相机近距与镜头到小龙头部视线；只移除遮挡的整片近叶，树干和远景树冠保留。赏景关闭小龙视线净空，仅保留相机极近叶片处理。并未把树木变为平面背景。
- 初次抖动透明方案在截图有明显噪点，已弃用；整叶方案已实际看图通过，见qa-evidence/shore-camera-before.png与shore-camera-after.png。实现只作用程序柳/桃/松；导入作者阔叶树仍使用源材质。
- qa-evidence/foliage-camera.json：最新17,174,676B单文件手机844×390，林下追随/切镜头/电影焦点关闭、断网high FXAA/SAO/Bloom、glError0、零外部请求/页面/控制台错误。相应/tmp/changan-foliage-review下有侧拍和断网高档图。
- qa-evidence/webgl1-foliage.json：同版本WebGL1兼容通过，新增森林机位/叶片遮挡检查，9蒙皮、8动物姿态、飞行、电影和安全回退均正常，glError0、零错误。
- 源码页浏览器自动请求favicon.ico产生404，已增加本地内嵌SVG品牌图标；没有忽略本轮错误，修改后最新单文件复验全控制台通过。

## 继续工作优先项

1. 舟船/园路成果已提交推送main：4f16bf4。林下镜头遮叶也已实现并通过新专项，详情见下段；完成本轮保存后继续精修城墙/植被/角色美术。
2. 继续实际截图对照认可的art-direction.png和concept-market/palace/qujiang.png；电影级美术仍未达标。城墙在曲江镜头中过于单一，角色服饰、岸线庭园和城市层次仍需继续精修。
3. 后续可先改善城墙材质与近景物理尺度：addCityWalls目前BoxGeometry默认UV将TEX.dirt拉伸到长墙，需按真实尺寸重映射并保留唐代夯土风格；不要误改为明清城墙套件。当前只是发现，尚未实施。
4. 若新增素材继续核对具体作者许可、固定来源/hash、真实3D预览，再做代码整合和实际浏览器检查；不以概念图当场景。

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

## 城墙与有限HDR渲染（本轮最新）

- 新clay_plaster（Poly Haven / Amal Kumar / CC0）1k法线与粗糙度已正式接入，约2m物理尺寸、官方MD5/SHA记录、许可和加工说明齐全。开挖土壁否决，柳树皮仅候选。新增PBR不计入15个GLB来源。
- 城墙下宽上窄、物理UV、薄石基/压顶，保留原最大碰撞/飞行包围与城门开口。新SurfaceLibrary.rammedEarth控制暖色夯层和微表面；原Three引擎与addon文件保留不动。
- 人工看图发现“启动/控制台通过”仍可能高档近看全黑。现在维护tools/rendering_test.py，验证实际图像、原故障点和FOV变化；所有派生材质与实际通行都要看运行图。
- 诊断证据确认场景HDR输入18个NaN像素被泛光扩散。补上逆投影同步只是独立修正，单独禁用AO不解决；不能再说根因已确认为AO或法线。修改normalMap/切线/基础材质/环境的临时对照也未消除，所以基础着色/驱动的精确来源仍未确认。
- 已在泛光入口过滤非法值，在输出阶段用有效邻色重建非法像素；有效像素不改变，泛光/AO/FXAA/ACES保留。详细证据和取舍在RENDERING_DIAGNOSIS.md，原始GPU读回在qa-evidence/hdr-invalid-diagnostic.json。
- qa-evidence/rammed-walls-rendering.json：最新18,687,084B单文件现代1120×630/强制WebGL1手机844×390，9段墙有1024²法线/粗糙度、UV与收分；实际穿门397→364.946；断网切高档与FOV43/58/35真实图像通过，黑区比例0、原故障点RGB212/189/159、glError0，零外部请求/页面/控制台错误。截图wall-black-before.png与wall-close-after.png可对照。
- medium通道最后补测已通过（qa-evidence/medium-rendering.json，/tmp/changan-rendering-medium-final）：FOV43黑区0、均亮184.38、原故障点RGB212/189/159，glError0、零外部请求/页面/控制台错误。源码与本轮城墙/HDR保护已推送main提交03fcb0f，后续只补充验收记录。
- 下一步应继续对照认可概念提高建筑/人物/园林层次，当前视觉仍远低于用户AAA期望。有限值防护已解决可见扩散与细线，但未确定底层输入NaN来源，可保留GPU诊断路径供后续硬件比对，不要假装已取得手机真机结论。
