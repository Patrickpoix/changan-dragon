# 自然人物的成熟眼球与表情源

MakeHuman官方固定提交`a8bc2d54ff0ac92e78ff71431b1023eda42bf482`，10项原文件实际取得并逐件核对Git blob SHA1/字节/SHA256，详见manifest。与已取得的自然成年男/女基体配合；不采用用户否决的Snow/Rain夸张头脸。

- `high-poly.obj` / `.mhclo`：作者原眼球拓扑、UV与对hm08顶点的重心绑定；不是在脸上外挂放大球。
- `brown_eye.png` / `brown.mhmat`：成熟棕色眼图与作者材质定义。制作工具将PNG派生为512²，转普通PBR，**不运行原MakeHuman的litsphere shader**。
- 6个官方Asian expression unit目标：左右闭眼、嘴角、说话、左右抬眉。它们是自然表情位移，不改变人物基本头身/种族或放大五官。

原眼球mhclo和mhmat头部明确说明2020年发布为CC0，著作权持有人为Data Collection AB、Joel Palmius、Jonas Hauquier；核心图形/目标文件适用的完整许可及应用AGPL分离说明见[原许可](../makehuman-base/LICENSE.md)和[CC0全文](../makehuman-base/LICENSE.ASSETS.md)。原文件保持原字节，未将整个项目重新声明CC0；MakeHuman商标不进入游戏标识。

```sh
python3 tools/fetch_makehuman_details.py
python3 tools/fetch_makehuman_details.py --download-missing
```

默认只验证；下载仅补缺，拒绝覆盖不匹配文件。派生自然人物、连接裁衣、缩骨/权重与动作见`../tang-studies/`；这些是独立制作样板，未部署城市或通过最终人物美术。
