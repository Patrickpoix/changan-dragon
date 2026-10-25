# 开发规范文档（2026-10-25）

> 项目开发的规范与约定。

---

## 一、代码规范

### JavaScript
- 使用ES6+语法
- 组件化开发
- 注释清晰
- 命名规范：驼峰命名

### 文件结构
```
src/
├── main.js          # 主入口
├── App.js           # 应用主类
├── config.js        # 配置
├── systems/         # 核心系统
├── daynight/        # 昼夜系统
├── weather/         # 天气系统
├── streaming/       # 流加载
├── npc/             # NPC系统
├── player/          # 玩家
├── interaction/     # 交互
├── audio/           # 音频
└── performance/     # 性能
```

---

## 二、Git规范

### 分支管理
- **main**：主分支，唯一权威
- **feature/**：功能分支
- **fix/**：修复分支

### 提交规范
- 格式：`type: description`
- 示例：`feat: add npc system`
- 示例：`fix: fix water shader bug`

### 提交类型
- **feat**：新功能
- **fix**：修复
- **docs**：文档
- **refactor**：重构
- **style**：格式
- **test**：测试

---

## 三、素材规范

### 命名
- 小写字母+下划线
- 示例：`tang_hall_9bay.glb`
- 示例：`stone_pavers_diff_4k.jpg`

### 分类
- **01_buildings**：建筑模型
- **02_characters**：角色模型
- **03_nature**：自然材质
- **04_environment**：环境/HDRI
- **05_props**：道具
- **06_audio**：音频

---

## 四、性能规范

### 优化要求
- DrawCall < 300
- 可见三角形 < 150万
- 帧率目标：60fps
- 内存 < 2GB

### 优化手段
- InstancedMesh合批
- LOD分级
- 距离裁剪
- 纹理压缩

---

## 五、文档规范

### 设计文档
- 放在`docs/`目录
- 命名：`XXX_DESIGN_20261025.md`
- 格式：Markdown

### 代码注释
- 关键函数必须注释
- 复杂逻辑必须注释
- 示例代码必须注释

---

文档日期：2026-10-25
