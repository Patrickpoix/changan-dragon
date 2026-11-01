# 西市首街

这是第一条可独立验收的街段，不是整座长安，也不是用概念图作为背景的
平面展示。页面只依赖仓库内的 Three r160、共享 GLB 构件与本地 PBR 贴图。

## 页面和运行脚本

- `index.html`：街口、HUD、触摸摇杆、近看模式、入场说明。
- `../../src/hero-street.js`：街道布局、共享材质、建筑实例、摊位、人物、
  灯笼、街树和可操作小龙。
- `../../src/kit-loader.js`：GLB 语义材质到共享 PBR 的映射。

打开方式：在仓库根目录运行静态服务，访问
`/content/street/index.html`。完整浏览器检查：

```sh
python tools/hero_street_test.py \
  --browser /path/to/chromium \
  --profiles desktop landscape
```

## 当前素材与许可

| 用途 | 来源 | 许可 | 取得/加工 |
| --- | --- | --- | --- |
| 单层铺面、两层酒肆 | 本项目 `content/architecture` 参数化源码 | 本项目代码；miniLibs 构件算法 MIT | Blender 4.3.2 生成；GLB 见 `assets/kit/architecture` |
| 男/女成人研究人物 | 现有 `assets/library/preparation-study/assembly.glb`，由本项目脚本独立导出 | MakeHuman 基体与 macro target CC0；唐服试片为本项目工作 | `resident-male.glb` / `resident-female.glb`，袖肩接缝仍待返工 |
| 木、瓦、灰泥、土、布 PBR | Poly Haven / ambientCG，具体作者和固定来源在各自 `assets/library` 目录 | CC0 | 512 派生贴图；原文件与哈希保留 |
| 街道研究树 | 本项目 EZ-Tree 固定提交生成 | MIT 代码；作者叶片许可见 `assets/library/vegetation` | LOD1 研究资产，仍标注未通过最终美术 |
| `tree_small_02` | Poly Haven / Rico Cilliers | CC0 | 固定来源、MD5/SHA256 与运行时 GLB 保留 |
| 字体 | 马善政 | OFL | 仓库内子集字体与许可正文 |

这些成熟树是街道配景，不声称是唐代考古复原；树形与叶片仍为研究资产。
当前页面没有使用影视截图、影视模型或商业素材包。

## 验收边界

2026-11-01 已在真实浏览器通过桌面和 844×390 手机横屏尺寸模拟、键盘/
触摸操作、飞行升降与 2.15m 近看机位，11 个 GLB / 61 个实例加载失败 0，
glError=0。小龙现为连续头脸/躯干、嵌入眼窝的琥珀眼、眼睑眉弓、分叉鹿角、
颊鬃、背鳞腹甲、落地短肢与布围巾，已修正近看穿脸和尾巴朝镜头。

但这不等于手机真机帧率、真机触摸或本地文件，也不等于美术通过。人工多角度
检查仍见躯干过圆、四肢偏直、后脑过光滑、鳞片与围巾层次不足；人物袖肩、
白墙/店面重复和街面生活细节也尚未解决。`finalArtAccepted=false`，不把
功能测试当作整街美术验收。
