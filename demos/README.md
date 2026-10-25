# Demos

本目录存放可独立运行的技术Demo，均为可跑的代码而非设计文档。

## 朱雀大街可走Demo

- **路径**: `demos/zhuque-walkable/index.html`
- **引擎**: Three.js r160（CDN加载）
- **内容**: 150m宽 x 1000m长朱雀大街，两侧坊墙、坊门、商铺、行道树、50个NPC、马车、灯笼
- **操作**: WASD移动 / 鼠标视角 / Shift跑 / R雨 / N昼夜 / Q自动漫游
- **特点**: 第三人称控制，昼夜循环，雨粒子，InstancedMesh树木/灌木/灯笼，自发光灯笼
- **状态**: 可运行，直接浏览器打开HTML即可

## 108坊程序化生成器

- **路径**: `demos/ward-generator/`
- **语言**: Node.js
- **内容**: 单坊生成器(generate_ward.js) + 全城批量生成器(generate_city.js)
- **输出**: 每个坊的JSON（建筑/坊墙/坊门/树/灯笼/NPC位置）
- **种子化**: mulberry32 PRNG，同seed同结果
- **支持坊类型**: 平民坊(H)、贵族坊(B/C)、商业坊(F/G)、娱乐坊(I)、作坊坊(K)、寺庙坊(D/E)
- **特殊区域**: 东市/西市/曲江池/大明宫/宫城/皇城桩文件
