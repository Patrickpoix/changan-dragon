# 两套可合法复用的 Poly Haven 原始三维资产（仅研究，不是运行时）

2026-10-24 由独立网络路径下载 **Poly Haven 官方 API 声明的 glTF 1K + 各自引用的全部 BIN/JPG**，上传为 Git blob；逐文件 MD5 与官方 API 比对一致。未改变文件名/字节、GLB 原素材包或正式游戏代码。材质图是 OpenGL normal，ARM 为 AO/Roughness/Metallic 合成纹理。

- **chinese_screen_panels**：中式彩绘双屏风，作者 Kirill Sannikov，网站称约 784 triangles / 1.6 m 高；[原始页面](https://polyhaven.com/a/chinese_screen_panels)、[官方文件 API](https://api.polyhaven.com/files/chinese_screen_panels)。包含两个 panel 网格。纹样与家具年代未核实为唐代，宜先作为室内改造参考，不默认置入唐代城景。
- **chinese_stool**：古风中式木凳，作者 Kirill Sannikov，网站称约 1K triangles / 0.6 m 高；[原始页面](https://polyhaven.com/a/chinese_stool)、[官方文件 API](https://api.polyhaven.com/files/chinese_stool)。可优先用于店铺/茶肆陈设**独立试片**，实际尺度、年代造型和同场配色需确认。
- **许可**：[Poly Haven 所有原始资产 CC0](https://polyhaven.com/license)。无需署名但建议保留作者/链接；这里的源文件没有转换自第三方不明来源或付费包。明确不意味着所有唐代形制/影视风格适配已经通过。

## 每套文件与 API MD5（原始源字节）

| 文件 | 屏风 MD5 / 大小 | 木凳 MD5 / 大小 |
|---|---|---|
| `*_1k.gltf` | `757c0dbdcbb0eae54e6dfa8ea812caaa` / 4225 B | `260547e2e492af393aedd6a6a460c3a1` / 2883 B |
| `*.bin` | `f3ec2d7d0c14165e764e930112a31616` / 35936 B | `a2951579ea0f4421b754331fb748d6f2` / 40172 B |
| `textures/*_diff_1k.jpg` | `5aa7494de265d99a25e0c86daa2137a5` / 666440 B | `10519c09d42b36c461540f3e727df211` / 542758 B |
| `textures/*_arm_1k.jpg` | `2280069ab77f92ddab27cd93098d5253` / 558223 B | `d73e325e36b12467d98283648bf98c10` / 578268 B |
| `textures/*_nor_gl_1k.jpg` | `5aefa3e752c297f545890b23f1d3397d` / 428108 B | `8b15a90085107867de316844cf03b3d7` / 629035 B |

导入 Blender：`File → Import → glTF 2.0`，选择 `chinese_screen_panels/chinese_screen_panels_1k.gltf` 或 `chinese_stool/chinese_stool_1k.gltf`。必须保持相邻 `.bin` 和 `textures/` 的相对路径。可在 Blender 修改为唐风语汇、检查 UV/拓扑，再导出运行用 GLB。**本轮未实际运行 Blender 导入或查看模型渲染图；切勿把文件齐全称作可视化通过。**

建议下次在已有 model_review 验收台中单独导入、做正侧背/3/4/灰模和 PBR 截图，必要时调整木色和花纹；经过人工对照后再纳入某一铺面。不要把后世家具直接当作唐代标准文物。
