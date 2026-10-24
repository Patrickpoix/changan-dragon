# 角色与动画免费资源方案（2026-10-24）

> 针对唐长安 NPC 角色、动画、道具需求，调研可直接下载的免费 3D 角色和动作资源。

## 一、核心发现：three.ws 免费素材平台

### 基本信息
- 网站：https://three.ws
- CLI工具：`npx @three-ws/assets`
- 特点：**完全免费，无需账号、无需API key、无需注册**
- 道具全部 CC0 公共领域

### 三大资源库

| 类型 | 说明 | 数量 |
|---|---|---|
| object | CC0 道具模型（家具、器皿、建筑构件等） | 数千个 |
| character | 绑定好的人形角色（带骨骼绑定） | 持续增长 |
| animation | 动作片段（走路、跑步、挥手等） | 持续增长 |

### 使用方式
```bash
# 搜索
npx @three-ws/assets search wooden chair --kind object
npx @three-ws/assets search walk --kind animation --limit 10

# 下载
npx @three-ws/assets add object:painted_wooden_chair_01
npx @three-ws/assets add character:abe --dir src/models
```

## 二、其他角色资源

### 已有资源
| 资源 | 数量 | 用途 |
|---|---:|---|
| 唐代文物 GLB | 15个 | 仕女俑、明光铠等静态参考 |
| RobotExpressive.glb | 1个 | 10+动画参考 |
| Khronos 示例模型 | 3个 | Fox/Duck/CesiumMan 动画参考 |
| Quaternius 马鹿 | 2个 | 已在运行时 |

### 待获取资源
| 资源 | 状态 | 用途 |
|---|---|---|
| Blender Studio Einar | 需下载 | 高精角色工艺参考 |
| Style3D 唐代齐胸襦裙 | 需下载 | 唐装服饰参考 |
| Blender Studio Scales | 需下载 | 小龙角色参考 |

## 三、角色应用方案

### NPC 行人
- **基础**：使用 three.ws 的 CC0 人形角色作为基础
- **改造**：替换为唐代服饰材质和发型
- **动画**：使用 three.ws 的走路、 idle 动画
- **人群**：通过 GPU 实例化和变体实现 188+ 行人

### 小青龙主角
- **参考**：Blender Studio Scales 小龙模型
- **动画**：走路、跑步、飞行、骑乘等动作
- **材质**：青玉质感，自发光眼睛

## 四、道具资源扩展

three.ws 的 CC0 道具库可以补充：
- 更多家具和室内陈设
- 市集摊位道具
- 交通工具（车、轿）
- 建筑构件（栏杆、台阶）

---
更新日期：2026-10-24
