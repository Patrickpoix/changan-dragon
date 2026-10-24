# EZ-Tree 程序化树木生成器研究（2026-10-24）

> 仓库：https://github.com/dgreenheck/ez-tree
> Stars：1717+
> 许可：MIT
> 已克隆到本地研究：9.5 MB

---

## 一、核心特性

| 特性 | 说明 |
|------|------|
| 程序化生成 | 几十个可调参数 |
| LOD多级细节 | 同一骨架生成多级，远近距离自动切换 |
| GLB导出 | 浏览器内直接导出GLB模型 |
| 预设系统 | 内置多种树木预设 |
| Three.js集成 | npm包直接导入 |
| 独立Web应用 | https://eztree.dev 可视化调整 |

---

## 二、使用方式

### npm安装
```js
npm i @dgreenheck/ez-tree
```

### 基础用法
```js
import { Tree } from '@dgreenheck/ez-tree';

const tree = new Tree();
tree.options.seed = 12345;
tree.options.trunk.length = 20;
tree.options.branch.levels = 3;
tree.generate();
scene.add(tree);
```

### LOD用法
```js
const tree = new Tree();
tree.loadPreset('Ash Medium');
tree.generateLODs(); // 生成多级LOD
```

---

## 三、对唐长安项目的价值

### 可生成的唐代园林树木

| 树种 | 预设方向 | 场景用途 |
|------|---------|---------|
| 松树 | 直立主干+稀疏枝桠 | 宫苑古松 |
| 垂柳 | 下垂枝条+柔软质感 | 曲江池边 |
| 樱花/桃花 | 茂密树冠+花簇 | 曲江春景 |
| 槐树 | 宽大树冠+浓密叶 | 行道树 |
| 竹子 | 细干+簇生叶 | 园林雅趣 |

### 优势
1. **零外部模型**：全部代码生成，包体小
2. **LOD优化**：远处自动减面，性能好
3. **风动动画**：可配合风场做摇曳动画
4. **GLB导出**：调整好参数后导出为GLB备用

---

## 四、参数化方向

### 树干参数
- length：树干长度
- radius：树干半径
- curve：弯曲度
- taper：收分

### 树枝参数
- levels：分枝层数
- angle：分枝角度
- length：分枝长度
- amount：分枝数量

### 树叶参数
- density：树叶密度
- size：树叶大小
- color：树叶颜色

---

## 五、下一步

1. 访问 https://eztree.dev 在线调整参数
2. 预设垂柳、松树、桃花树三种唐代园林典型树木
3. 导出GLB模型备用
4. 集成到唐长安项目场景

---
研究日期：2026-10-24
本地克隆路径：new-assets/ez-tree/
