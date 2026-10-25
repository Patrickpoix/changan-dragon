# 长安Dragon · 项目交接文档

> 最后更新：2026-10-26 03:00 北京时间
> 仓库：Patrickpoix/changan-dragon
> 分支：main

---

## 一、项目概述

**唐长安开放世界3D页游**，国风漫剧/电影画风，参考《长安三万里》《大理寺日志》质感。

- **引擎**：Three.js r160（正式版），Demo探索用r169
- **目标**：页游首屏加载优先，真实精致开放世界
- **坐标**：考古原点外郭城西南角，X东向正，Z北向正；Three.js中 worldX=archX, worldZ=-archZ
- **城市尺寸**：9721m × 8652m，朱雀大街中心X=0，宽26m

---

## 二、核心文件结构

### src/ 目录（主游戏）

**原始核心文件（23个）：**
- `00-core.js` (33KB) — 核心/材质/批次/城市数据/天空Shader/地面道路
- `05-rendering.js` (17KB) — 后处理管线（ACESFilmicToneMapping + PCFSoftShadowMap + SAOPass + UnrealBloomPass + FXAA）
- `06-surfaces.js` (5.8KB) — PBR材质库
- `07-water.js` (2.6KB) — 水面
- `08-assets.js` (21KB) — 外部模型加载
- `09-botany.js` (8.6KB) — 程序化植物
- `10-world.js` (72KB) — 108坊+道路构建
- `11-shorelines.js` (4.5KB) — 湖岸步道
- `12-landmarks.js` (26KB) — 宫苑塔寺曲江
- `20-character.js` (74KB) — 角色/人群/舟船
- `25-exploration.js` (17KB) — 移动模式/景点/电影镜头
- `27-session.js` (2.7KB) — 本地存档
- `30-main.js` (48KB) — 主循环/UI绑定
- `boot.js` — 启动加载器（已更新加载所有模块）

**本轮新增核心提升模块（121-128号，真正的主体打磨）：**

| 文件 | 内容 |
|------|------|
| `121-core-overhaul.js` | 核心区域视觉综合提升：朱雀大街御道石+排水沟、大明宫丹凤门重檐+立柱+玉阶、东西市店铺立面+招牌、曲江池步道+亭子 |
| `122-geometry-refine.js` | 核心建筑几何精修：斗拱层（坐斗/翘/昂）、鸱吻（龙形卷尾）、瓦垄（筒瓦行列）、坊门精修、店铺屋顶精修 |
| `123-pbr-upgrade.js` | 5种高质量PBR材质：朱红漆（大明宫立柱）、蓝琉璃瓦（大明宫屋顶）、青灰砖（城墙）、汉白玉（台基栏杆）、原木（民居） |
| `124-cinematic-lighting.js` | 电影级灯光：黄金时刻（暖金色低角度）、蓝调时刻、朱雀大街灯笼暖光点光源、大明宫宫灯、体积光柱 |
| `125-cinematic-sky.js` | 国风天空：远山两层（远近不同透明度）、晚霞云层、暖色调大气透视雾、星夜月亮+100星 |
| `126-real-water.js` | 真实水面：曲江池湖面（PBR反射）、波光粼粼高光点、南北护城河、荷花荷叶 |
| `127-tang-vegetation.js` | 唐代植被：朱雀大街行道槐（40棵）、曲江池桃花（15棵）、池边垂柳（10棵下垂枝）、大明宫前松柏（三层塔形） |
| `128-city-life.js` | 长安城市生活：朱雀大街行人（24人）、东西市摊位（9个带布篷）、西市骆驼商队（5只丝绸之路）、朱雀大街马车（3辆） |

**此前创建的细节模块（25-117号，约90个）：**
- 系统级：天气（晴/阴/雨）、昼夜循环、五声音阶环境音景、花瓣飞鸟氛围
- 地标级：大明宫/东西市/曲江池/城墙/塔寺/坊门/兴庆宫/太极宫/明德门各自细节
- 材质级：色彩分级（国风电影色调）、大气透视、雾效增强
- 注意：其中香炉系列（82-117号约30个）是碎片化次要细节，后续可考虑整合

---

## 三、关键代码结构

- **Batch类**：InstancedMesh空间分块批渲染，支持LOD
- **roofGeometry()**：中式曲面屋顶生成函数（中间起脊、檐口微翘、四角上扬）
- **FILM_SHOTS**：电影镜头定义，在00-core.js中
- **Explore.places**：16个景点
- **landmarks数组**：地标（大明宫/兴庆宫/大雁塔/小雁塔/曲江池等）
- **B对象**：建筑批次集合（stone/red/roof/roofGold/roofGable/columns/dark/trim/wood等）
- **MAT对象**：材质集合（plaster/plasterWarm/wood/red/stone/roof/roofGlazed/gold/dark/leaf/trunk/blossom/lantern/window）
- **TEX对象**：Canvas纹理（stone/roof/wood/grass/dirt/lattice/bark/stoneBump）
- **GameRendering.init()**：在boot()中调用，初始化完整后处理管线
- **updateDayNight()**：在30-main.js中，完整的昼夜过渡系统
- **Colors对象**：白天/夜晚的天空/雾/光照颜色定义

---

## 四、已完成的工作

1. ✅ 渲染管线：ACESFilmicToneMapping + PCFSoftShadowMap + SAO + Bloom + FXAA
2. ✅ 核心区域视觉提升：朱雀大街/大明宫/东西市/曲江池（121-128号模块）
3. ✅ PBR材质：朱红漆/蓝琉璃/青灰砖/汉白玉/原木（Canvas程序化纹理）
4. ✅ 电影级灯光：黄金时刻/灯笼/体积光
5. ✅ 国风天空：远山/晚霞/大气透视
6. ✅ 真实水面：曲江池/护城河/荷花
7. ✅ 唐代植被：行道槐/桃花/垂柳/松柏
8. ✅ 城市生活：行人/商贩/骆驼商队/马车
9. ✅ 引擎选型：Three.js r160（页游加载优先）

---

## 五、待后续会话接手的缺口

### 高优先级（核心质感提升）
1. **真正的GLB模型资产**：当前建筑仍为程序化几何体，需接入免费CC0中式建筑GLB
2. **大文件推送**：GLB/PBR/HDR/音频母版（>10MB）需走GitHub Release或LFS
3. **docs/目录整合**：仍有约925个带日期设计文档，需合并精简
4. **浏览器实测**：需在浏览器跑一遍确认128个模块无报错、帧率达标

### 中优先级
5. **香炉系列模块整合**：82-117号约30个碎片化香炉细节模块可合并为一个
6. **更多地标**：大雁塔/小雁塔/兴庆宫/太极宫的建筑几何可进一步精修
7. **人物动画**：行人/马车目前是静态的，可加简单漫游动画
8. **音频系统**：环境音景框架已有，可加真实音频文件

---

## 六、素材共享原则

- 原GLB + 共享PBR材质源，不重复存储纹理
- 25个建筑材质组统一绑定
- 避免重复上传13MB×2的纹理模型

---

## 七、推送方式

云电脑无git认证，使用GitHub MCP工具：
- `mcp__github_oauth__push_files`：多文件一次commit
- `mcp__github_oauth__create_or_update_file`：单文件更新（需先get SHA）
- `mcp__github_oauth__delete_file`：删除文件

---

**下一会话从这里继续：先浏览器实测当前版本，再决定下一步优先做什么。**
