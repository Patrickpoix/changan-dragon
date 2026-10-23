# 植物研究资产恢复

2026-10-24：旧未提交目录和生成脚本缺失，依据已保存的研究提交与缓存重建；不声称逐字节找回旧产物。

`ez-tree-source/`：dgreenheck/EZ-Tree 固定提交 `dcf309bd86bd521083d9c70f01f2de45fdc7c457`。未改动src/lib、预设、四张作者叶片、README/package、MIT正文和贴图许可说明；逐文件原始URL/SHA256见source-manifest.json。源码压缩包中的叶片原为Git LFS指针；已另外取得对应media原件，按指针的SHA256与大小核验，保留*.lfs-pointer作为证据。没有下载ambientCG树皮，不将树皮另行归为MIT。

`studies/`：street、willow、pine、blossom，各LOD0/1/2；参数和尺寸保存在*-options.json，校验/包围盒/面数见manifest.json。同一固定随机骨架派生低细节几何，LOD距离仍需实景测试。

**全部为研究样板，未接入正式场景。** willow是生长力/分枝角近似试验，不是已解决的垂柳成品；blossom仍使用粉色调的橡叶纹理，乘色后截图实际偏褐，不是真实花朵几何；树干目前仅色块。叶片是作者alpha-mask卡片，不是整棵树的平面替身。静态GLB不导出原库的风动shader。外观仍需对照电影参考返工，不能凭面数或加载通过验收美术。

生成仅使用独立工具Three 0.167.1，主游戏r160不变：

```sh
# 在仓库外建立工具依赖目录
npm install --prefix /path/to/tree-tools --save-exact esbuild@0.25.12 three@0.167.1
node tools/prepare_vegetation_studies.mjs /path/to/tree-tools
```

脚本不覆盖不同内容的已有文件。重跑生成已确认12个GLB逐字节一致；若调整参数，应明确保留已有版本再生成。

查看：启动仓库HTTP服务，打开 `tools/model_review.html?model=../assets/library/vegetation/studies/willow-lod0.glb`，或用“打开本地GLB”选择自包含文件。验收台自动包围盒取景，支持正侧背/俯视、灰模、米尺。

浏览器实际检查范围与限制见 `docs/qa-evidence/resource-recovery/results.json`。软件渲染和手机尺寸不代表真机性能、所有浏览器兼容或最终美术已通过。
