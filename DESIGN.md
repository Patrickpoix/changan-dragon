# 龙游长安

## 本轮目标与方案

横屏优先的 HTML / JavaScript / WebGL 三维漫游。沿用项目本地 Three.js，不引入运行时 CDN，不把生成图片充当立体建筑。步行、木车、飞行都是赏城的方式；诗笺是可选内容。保留原入口 `index.html`。

1. 核对现有场景、碰撞、角色骨架和手机布局。
2. 联网筛选唐代建筑参考与公开材质，统一美术方向后实施。
3. 增加三种移动方式、可靠着陆、飞行升降、景点直达、电影赏景、镜头环视。
4. 加强斗拱、檐下梁架、栏杆、门窗、殿前台阶、沿街店面与行人等真实几何细节；复用实例批次控制绘制开销。
5. 在浏览器实测桌面、手机横屏、竖屏适配、移动、碰撞、落地、镜头、昼夜和离线资源。

## 美术约束

朱红木构、灰青瓦、暖石台基、青玉小龙；柔和圆角与可绕看的真实体积。建筑尺度大于角色，沿街店铺细节能近看。画面铺满屏幕，HUD 使用深玉色半透明底与米白字，模式切换置底，景点与电影控制置顶。手机横屏时缩小地图、弱化次要按钮；竖屏给出横屏提示但仍可游玩。

本次尝试内置 Image Gen 概念图时，工具返回缺少上游图像服务配置（HTTP 400），未生成图像。视觉依据为现有实机截图与以下参考；三维资产为可编辑几何，明确不采用平面精灵替代多视角建筑。

## 联网筛选与素材来源（2026-10-22）

- [大明宫遗址公园 / 西安曲江新区](https://qjxq.xa.gov.cn/zjqj/gyqj/tsqj/5df21c62fd8508098d284f14.html)：丹凤门—含元殿—宣政殿—紫宸殿中轴参考。
- [Daming Palace Site / ChinaCulture](https://en.chinaculture.org/library/2008-02/15/content_36814.htm)：宫殿尺度与空间序列参考。
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)：重复建筑构件使用实例绘制。
- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)：考察成品 glTF 模型路线；本轮没有引入风格不统一的模型包。
- [Poly Haven 许可](https://polyhaven.com/license)：材质为 CC0。
- [Sandstone Blocks 05 / Rob Tuytel](https://polyhaven.com/a/sandstone_blocks_05)：台基石材。
- [Wood Planks / Amal Kumar](https://polyhaven.com/a/wood_planks)：木材纹理。
- 考察但未采用：[Small Chinese imperial style building / andertan](https://sketchfab.com/3d-models/small-chinese-imperial-style-building-631615777ba4421a98814559dc2d4c5a)、[Cute Dragon / shakiller](https://sketchfab.com/3d-models/cute-dragon-df14ec74767c4598920132758dab8a49)。模型时代、比例和材质需再适配，不将其标为已使用素材。

本作是唐长安题材的艺术化缩尺城市，木自行车和小龙是幻想设定，并非考古复原。当前地图延用既有坊市网格，不声称精确复原一百零八坊。

## 本地运行

解压后保留 `index.html`、`src/`、`vendor/`、`assets/` 的相对位置。可直接打开 `index.html`；手机系统若限制本地 HTML / WebGL，用静态 HTTP 服务打开。通过 HTTP 分发时，所有资源同源且无需联网素材服务。桌面可用 `python -m http.server 8877 --bind 0.0.0.0` 启动，再用手机访问电脑局域网地址。

操作：WASD / 方向键移动，Shift 加速，1/2/3 步行/骑行/飞行，Q/E 飞行升降，C 镜头，P 电影赏景，G 景点，N 昼夜，Esc 退出赏景或关闭窗口。手机使用摇杆、模式按钮、升降按钮和拖动镜头。
