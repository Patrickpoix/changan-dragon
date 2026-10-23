# 当前任务续做记录

用户要求持续推进完整的唐长安三维小龙自由探索产品，按“联网筛选素材/生图 → 实际三维整合 → 实机对照精修”的循环，不把可运行原型或概念图当作成熟产品。目标是国漫电影质感、宏伟可绕看的建筑、丰富坊市/商旅/行人/画舫/亭台连廊，横屏手机浏览器，步行/木自行车/飞行、多视角和电影赏景。

## 用户约束与环境

- 实际工程 `/workspace/changan-dragon`；未找到 `sa/changandragon`。分支work，HEAD12783fe，开发改动未提交/推送，不覆盖它们。
- 原有22张PNG与`vendor/three.min.js`尚待上传，不覆盖预期路径。当前本地兼容包让开发不依赖这些上传。
- 用户已授权完整开发和不限域名网络。配置草稿已保存`allowed_domains:["*"]`。API/模型下载实际成功，Poly Haven需要项目User-Agent。
- 用户因额度要求不再使用子代理，已有任务均已结束，后续只由主代理执行。
- 用户要求5小时后自动给本会话发“继续”。没有定时/自动唤醒工具，**没有创建定时任务**。当时北京时间2026-10-23 01:18，5小时后约06:18，需用户手动发送继续。
- 静态服务器8877只服务本仓库；进程会话92941。恢复快照需重新启动进程。
- 云环境配置草稿已重写为当前可运行项目的prepare/build/server/test流程，成功保存但`requires_publish:true`；需环境设置中保存并发布才能启用，尚未验证新会话恢复。

## 当前实现

- 有序本地启动、完整移动/飞行/景点/赏景UI，触摸/键盘输入释放、四镜头、镜头避障、模态框/焦点、横竖屏布局。
- 本地r160兼容引擎与官方GLTF/RGBE、PMREM、SAO、Bloom、Output、Water；最新增加ShaderPass/FXAA。手机自动流畅，精致/电影有倒影，电影有Bloom。原引擎上传且r160匹配时源码优先用原包；单文件固定用校验过的兼容包。
- 真实木构、屋脊、山墙/歇山几何、MIT miniLibs斗拱；含元殿52×26米、深门廊、逐开间屏门/窗棂、宽台阶和可走台基。
- 近景圆角实例、远景共享简化几何；饰物按距离裁剪，人群按空间分区。不能把软件渲染的CPU提交时间当真实手机帧率。
- 市场铺地覆盖错误土路，统一实际石材铺装比例，减弱摄影贴图过强的棕色/反差。店铺三面薄墙、地板、天花、货架、货物，留有实际侧入口。
- 连廊双侧柱、顺向屋脊、矩形可通行地面；亭台四向开口，可走进去。曲江北岸商铺/步道接通长廊。
- 画舫新建约13米长真实船体、舱柱、窗棂、幕帘、栏杆、檐顶，速度放缓。一艘移动，一艘西岸停泊可从码头登上。
- 修复NPC无视水面/墙体的路线；更新地面高度。约180名共享实例行人及原有商旅/守卫等。荷叶改为水平，莲花用立体花瓣代替粉色锥体。
- 小龙头部略放大、曲面精细化，玉色物理材质、棕金虹膜/高光/眨眼，侧拍机位降低靠近。
- `src/27-session.js`本机位置/方式/镜头/设置恢复，存储不可用也可玩。

## 实际素材与待评估文件

- 正式接入7个CC0来源：陶锅、藤篮、木碗、木桶、木凳、含六形态的苔石及作者阔叶树；78处摆放、104网格，GLB二进制约4.47MB。苔石从63,127面降至8,995面，各节点独立归零放在岸线，带碰撞。
- 正式使用CC0布料normal/ORM、屋瓦/灰泥normal/roughness、Venice Sunset HDR用于PMREM，不把威尼斯当背景。字体本地OFL MaShanZheng子集436,412B。
- 原始文件、作者、API MD5/SHA256、许可和优化元数据在各素材目录。`docs/ASSET_RESEARCH.md`和`docs/asset-manifest.json`已更新6来源状态。
- 最新另外下载并优化了Poly Haven **Tree Small 02 / Rico Cilliers**。原始glTF共100,974,143B、2,062,487面；已得到512²、45,000面`assets/library/polyhaven/tree_small_02/runtime.glb`。初次45k普通减面预览失败，未采用。已通过`tools/prepare_tree.py`保留作者叶片分布/朝向/UV，固定抽取11600组折面叶片，树干独立减面；最终53399面、GLB2953344B，已目视检查新预览并接入八处近景，模型包已更新。源码二进制约95MB，注意不要误称运行包有100MB。
- Sketchfab新检索已核验具体建筑/亭子/舟船/唐服作者与CC BY4.0，但下载端点401需登录，未取得源包。Quaternius自然包公开目录可读，但License/CommonTree/Bush下载为Google Drive Quota exceeded，未绕过。现代青花瓷瓶已目视否决，不当唐代器物。

## 验证现状

- 旧完整交互通过：`/tmp/changan-current-qa/results.json`手机844×390；之后小横屏/竖屏布局通过。
- 最新专项通过：`/tmp/changan-offline-latest/results.json`（58处模型版本），真实键盘+碰撞走过长廊、亭台、码头/画舫、街边商铺、含元殿台阶；存档恢复、断网高画质倒影/留影、零外部请求/页面错误。
- **完整源码回归已通过**：会话58781已结束，`python3 tools/smoke_test.py --url 'http://127.0.0.1:8877/?quality=low' --viewports desktop landscape compact portrait --output /tmp/changan-complete-qa`。四尺寸均通过；桌面/主要横屏完整交互，后两者布局启动。该次先于新树整合。
- 最新单文件`dist/changan-dragon.html`约13.34MB，已内嵌7来源/字体/脚本/许可证。`/tmp/changan-offline-final/results.json`验证78处模型、真实通行、断网FXAA/SAO/Bloom/倒影、存档和截图，零外部请求/页面异常；之后两处树位置微调并重新打包。
- `/workspace/.environment/changan-dragon/visual_pass.py`产生`/tmp/changan-visual/`场景图。必须等待实际frameCount变化，300ms墙钟等待会抓到旧机位；该脚本已修正。
- 管理Chromium禁止file://（ERR_BLOCKED_BY_ADMINISTRATOR），不绕过；单文件通过HTTP取文档再离线，不能当成真机文件打开测试。
- Browser插件未提供，使用Python Playwright+`/usr/bin/chromium`及SwiftShader；同一时刻只跑一个完整WebGL浏览器。

## 剩余重点

1. 检查最新实际截图，功能完整回归与单文件专项均已有通过证据。后续新改动针对性验证，不重复运行无关全量测试。
2. 八处成熟树已接入，核对其实际浏览器轮廓、光照与空间摆放。远处和柳树/桃花仍有球团树冠，后续逐步改善。
3. 用当前实际截图对照`docs/art-direction.png`及市场/宫殿/曲江概念。当前角色/服饰、屋瓦、庭院/岸线层次与电影美术仍有明显差距，不能说已达到AAA或最终视觉验收。
4. 若新增树接入，更新素材清单/QA/离线包；不使用任何概念图作为真实场景替身。
5. 保持续做，不创建额外代理；没有自动定时继续功能，不要假装已设置。

## 常用命令

```sh
cd /workspace/changan-dragon
python3 -m http.server 8877 --bind 0.0.0.0 --directory /workspace/changan-dragon
python3 tools/prepare_assets.py
python3 tools/build_standalone.py
python3 tools/offline_test.py --output /tmp/changan-offline-review
```

Blender4.3.2、Node24、Python Playwright/Chromium、fontTools已装；构建three/esbuild依赖在`/workspace/.environment/changan-rendering`。修改addons后运行`node tools/build_rendering_addons.mjs`，改源模型后运行`python3 tools/build_asset_bundle.py --bundle`，改字体覆盖字后运行`python3 tools/subset_font.py`。bundle会自动纳入所有*/runtime.glb；新增候选应先检查，不要误打包未采用资源。

## 最近一轮补充

- 对两处落在旧台基上的树重新选址，八处树根已通过实际浏览器确认全在y=0地面：`/tmp/changan-updated-trees.png`，相关脚本`/workspace/.environment/changan-dragon/tree_placement_qa.py`已通过。
- 大建筑共享圆角单位从0.09改为0.012，避免大尺度墙体/台基被过度削圆；含元殿侧面加木框/格窗。碰撞外包围不变。`/workspace/.environment/changan-dragon/latest_scene_qa.py`最新启动、八处树地面高度、宫殿切景检查已通过，零页面异常，进程99616已结束；截图`/tmp/changan-visual/palace-refined.png`。
- 七来源材质/树木/苔石实际浏览器加载，78实例/104网格，medium/high含FXAA初始化正常，零页面异常；`/tmp/changan-visual/`已更新市场/宫阙/曲江及角色图。与已认可概念对照仍可见明显简化，不能声称最终成熟美术已完成。
- 单文件最新约13,340,790B，生成路径`dist/changan-dragon.html`。原始树源文件约101MB是开发素材，不在13.34MB运行包内。
- `python3 tools/prepare_assets.py`校验通过；所有JS语法、Python编译、git diff空白检查通过。没有创建提交、PR或定时消息。

- 最近侧窗截图发现`ExtrudeGeometry`倒角会在XY方向扩出轮廓，原`roundedBoxGeo`只居中没归一，导致侧饰埋入墙体；现按w/h/d归一真实几何。单位块、52×11.5×26墙体及自行车坐垫的尺寸检查通过。最新宫殿场景复查进程8430已通过并结束，零页面异常，侧面的木框/格窗已在实际截图可见；最新单文件13,341,077B。

## 继续后的最新一轮（优先于上方旧数字）

- 仍只主代理，没有新建/重启子代理。静态服务器已重启：8877，exec会话34357；旧PID2820空响应已结束。没有创建定时消息。
- 新`src/09-botany.js`：程序枝条、柳叶、桃花、松枝替换球团树冠，近远几何/64米分块。`Batch`支持cellSize；远景叶花扩大投影覆盖，避免减面后变成枯树。
- 天空用确定性噪声驱动软边云层，移除灰色球状云；日夜着色保留。太阳偏移统一为125/105/75，低角度照明。
- 含元殿下层屋顶改为较低庑殿裙檐，上层为有格窗/柱/斗拱的木构层、歇山顶，消除悬空大红厚梁。主要近景屋顶增加沿曲线的真实半圆盖瓦条。
- 修复楼上建筑把platform误当整块高石台的问题：新增upperStorey，应用街边阁楼、花萼相辉楼上层及曲江紫云楼上层，保留木楼板。
- NPC肩袖/腿/鞋/衣摆增加GPU步态与同源阴影姿态，男女衣装分层，收敛袍色，加面部/发饰。小龙头身重新配比、圆润分叉角、奶油色短吻、较大金棕眼、曲线鬃毛，尾巴改连续蒙皮曲面（7骨骼），消除珠串尾。
- 默认追随镜头降低。发现近摊位避障会进入龙头，已增加邻近角度/抬升候选的resolvePosition；需要最新专项截图核对。
- 新真实圆角铺路石约1022块（近远几何/16米分块），只在开场中轴260..369段，带实际地面高度；地面台基索引改为空间格，实例人群也跟随真实地面高度。
- 布幔新增代码矢量团花/边饰并复用CC0织物微法线，市场摊顶改为弯曲带垂边的织物几何；电影控制栏改为横屏单行，保留44px按钮。
- 新实际下载整合PolyHaven fern02与grassBermuda01（36处）；导入静态道具按几何/材质/64米单元实例合批。模型总计9个PolyHaven来源。
- 新找到固定版本公开Quaternius镜像，直接核对作者页CC0后整合马/鹿，保留原作者Walk/Idle/Eating动作。原包和许可在assets/library/quaternius；prepare_animals.py细分曲面、逐角色区、单材质、保留蒙皮。8只动物（4行走马、2驻足马、2鹿），骨架互不共享。粗块柳树与西服人物不采用。详见ASSET_RESEARCH最新段。
- 官方addon多了SkeletonUtils.clone。当前11来源、122摆放、126实际网格对象（静态实例共140网格实例另加8只动画动物），GLB二进制6476664B；静态例合批不等于移动动物合批。
- `/tmp/changan-art-round2/`：天空/重檐/新植物+high渲染通过，无页面/着色器错误。发现曲江镜头钻进柳树，已共享FILM_SHOTS种植留白并移到306/3.5/350。
- `/tmp/changan-art-round3/`：新龙与曲江镜头通过。`/tmp/changan-animals-review/`与`/tmp/changan-animals-qa.log`：11来源、122摆放、8独立骨架、动作姿态与行走变化检查通过，零页面/着色器错误；但最后avenue-horses截图出现龙头占屏，引出上面的相机修复。
- `/tmp/changan-offline-round4/results.json`已通过真实通行/刷新/断网high倒影+FXAA/SAO/Bloom/PNG。**该次是9来源14.18MB版本，早于动画动物/铺路石/新布纹/控制栏/相机新避障。**
- 当前`dist/changan-dragon.html`16051783B，约16.05MB，已含11来源与上述新代码。最新手机源码回归在运行：exec会话1850，`/tmp/changan-round5-qa.log`、`/tmp/changan-round5-qa/`；landscape完整交互，compact/portrait布局。结束后查看results并人工看截图；随后针对相机近摊位与新版单文件进行验证，不把旧离线证据当作当前版。
- `tools/sync_asset_manifest.py`同步9+2来源清单。README提及09植物与Quaternius许可。所有开发改动仍未提交/推送。
- 剩余重点：当前仍明显弱于认可概念的建筑密度、角色服装、岸线/园林美术，不能称为AAA或最终成熟验收。应继续实际截图对照与精修。Browser插件缺失，继续Python Playwright，单一WebGL浏览器；真机GPU/file://仍未测（管理策略禁止file://）。

- Round6补充：`/tmp/changan-round6-art/`宫殿/城门/曲江/近摊位截图通过；`/tmp/changan-round6-art.log`相机距目标5.79m，原来龙头占屏问题已回避；地面1101块、577空间格与穷举高度对照最大误差0。城门新增逐间窗廊/木门，测试未改变原通行碰撞。
- 城内公共地面改为土色，保留曲江/兴庆/太液池局部草地，城外农田色收敛。修正城门外30×240m御道UV被拉伸问题。低档水面统一日夜太阳/ACES/雾效；首次雾参数缺失导致测试失败，已补齐并重跑。
- `/tmp/changan-offline-round7-fixed/results.json` **当前11来源/122摆放/8动物版本通过**：真实长廊/亭/画舫/商铺/宫阶，刷新（地面y=.117），断网high倒影+FXAA/SAO/Bloom/PNG，零外部请求、页面及着色器控制台错误。首轮失败目录round7不要当作通过。
- 该次单文件16055733B；此后只调整入城前相机，将小龙移到右侧可视框并去掉遮暗/模糊，需要最新entry专项截图检查（exec72151，/tmp/changan-entry-review.log）。`build_standalone.py`须再次执行以含此调整。
- 正在**仅于/tmp评估**两个人物的去服装/去帽面部衍生预览，未接入运行包。候选源分别为Quaternius FarMer/Medieval，作者对应页已核对CC0；当前bundle仍11来源，不把候选预览称为已采用。预览脚本/workspace/.environment/changan-dragon/prepare_head_candidates.py，Blender预览进程见当前工具输出。

## Round8/9与人像的新进展

- `assets/character-faces.js` 新增Quaternius Farmer面部/头发衍生，1577顶点/2976三角形，99889B；配套`tools/prepare_faces.py`与`assets/library/quaternius/merchant_face`保存原GLB、作者具体CC0页、镜像固定版本/SHA256。只复用面部/头发，不采用西服/草帽；给5位胡商加入头巾和自制圆领长袍。11个GLB来源之外另有这一种索引人像数据（共12种来源）。
- `mergeColored`支持保留作者顶点色；长袍肩口补曲面，腰带外径/扣与垂带修正。袍身改32周向段/较浅褶，纺织CC0法线由顶点mask只作用于衣料。`personMat`与画舫纯木色材质已分开。
- 新`merchant_review_qa.py`专项：5位作者脸胡商、开场近段人群增加后188人验证通过，真实canvas留影`/tmp/changan-merchant-review/merchant.png`；源人物加入圆领/腰带/肩曲面。此后又改袍褶与衣料normal mask，见最新手机源码验收。
- 源码入城右侧取景已通过`/tmp/changan-entry-review/entry.png`及log（heroX898在art627..1010内），并已重新打单文件。
- 程序柳/桃/松加入树干碰撞与冠层飞行包络，根部用真实地面高度。开场商铺区保留种植净空，AVENUE_SHOP_Z统一店址。
- 诗笺8从主路344移到路边15.3/350，整体缩小/减弱光晕；赏景隐藏全部诗笺，退出恢复未取项。开场333..363的行人路增加人群。
- 原round9测试因仍用旧诗笺坐标0/344而失败（无页面/控制台错误）；已更新位置夹具并真实检查“主路无拾取提示→走到路边诗笺→实际点击+刷新存档”。修正版exec11942运行，/tmp/changan-round9-fixed-qa.log及目录。
- `/tmp/changan-offline-round8/results.json`通过：作者脸/树碰撞/脚本DOM清理/模型解码后释放base64的版本，通行、刷新、断网高画质、截图正常。此后有衣料normal/种植净空/画舫材质分离改动，须针对性或最终包复验。最新dist约16.155MB，后续改动需再build。
- 脚本DOM解码完成删除临时可执行节点，模型解码完成清掉对应entry.base64以减手机冗余；保留共享几何/图像和context恢复所需HDR。云量噪声从RedFormat改RGBA，避免WebGL1的RED纹理格式限制。可后续用强制WebGL1启动专项核对。
- 又实际检索审阅PolyHaven石榴、姜、荔枝、亚洲梨（源约3.7MB合计），已决定作为市场道具候选，正在下载（exec工具输出中最近fetch进程；/tmp/changan-food-fetch.log）。**还未进入GLB运行包**；现bundle仍11个GLB来源+1人像。/tmp/changan-food-review有官方预览，素材风格核对通过，可进一步优化和整合后测试。
- 人像预览首次未焊接独立面，细分变成碎片，未采用；已在生产prepare_faces.py中先焊接源重复顶点，避免同类问题。
