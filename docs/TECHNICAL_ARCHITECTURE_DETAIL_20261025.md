# 技术架构详细设计（2026-10-25）

> 从demo到全城开放世界，技术架构要清晰可扩展。

---

## 一、整体架构

### 分层
1. **渲染层**：Three.js场景/相机/渲染器
2. **资源层**：GLB加载/纹理/材质
3. **系统层**：流加载/LOD/NPC/天气
4. **逻辑层**：游戏逻辑/任务/交互
5. **表现层**：UI/音效/后处理

---

## 二、目录结构

```
changan-dragon/
├── src/
│   ├── core/          # 核心引擎
│   ├── scenes/        # 场景
│   ├── systems/       # 系统
│   ├── assets/        # 资源加载
│   ├── entities/      # 实体
│   └── ui/            # UI
├── public/
│   ├── assets/        # 静态资源
│   └── chunks/        # 流加载chunk
└── docs/              # 设计文档
```

---

## 三、核心模块

### 渲染模块
- SceneManager：场景管理
- CameraManager：相机管理
- Renderer：渲染器
- PostProcessing：后处理

### 资源模块
- AssetLoader：资源加载
- ChunkLoader：chunk加载
- TextureManager：纹理管理

### 系统模块
- StreamingSystem：流加载
- LODSystem：LOD管理
- NPCSystem：NPC管理
- WeatherSystem：天气
- TimeSystem：时间

---

## 四、数据流

### 加载流程
1. 初始化核心
2. 加载初始chunk
3. 玩家移动
4. 动态加载新chunk
5. 卸载远处chunk

### 渲染流程
1. 收集可见物体
2. 应用LOD
3. 渲染
4. 后处理

---

## 五、扩展点

### 新增区域
- 新建chunk
- 注册到流加载
- 配置建筑/植被/NPC

### 新增NPC
- 新建模板
- 配置行为
- 分配到区域

---

## 六、技术选型

### 已确定
- 引擎：Three.js r169
- 语言：TypeScript
- 打包：Vite
- 模型：GLB + Draco
- 纹理：KTX2

### 可选
- 状态管理：Zustand
- 工具：Three.js Examples

---
文档日期：2026-10-25
