# 开发环境搭建指南（2026-10-25）

> 快速搭建开发环境，开始贡献代码。

---

## 一、前置要求

### 必需
- Node.js 16+
- npm 或 yarn
- Git
- 现代浏览器（Chrome/Edge/Firefox）

### 推荐
- VS Code
- Three.js DevTools
- 代码格式化工具

---

## 二、快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/Patrickpoix/changan-dragon.git
cd changan-dragon
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 打开浏览器
```
http://localhost:5173
```

---

## 三、项目结构

```
changan-dragon/
├── src/               # 源代码
│   ├── core/         # 核心引擎
│   ├── scenes/       # 场景
│   ├── systems/      # 系统
│   ├── assets/       # 资源加载
│   ├── entities/      # 实体
│   └── ui/           # UI
├── public/           # 静态资源
│   ├── assets/       # 素材
│   └── chunks/       # 流加载chunk
├── docs/             # 设计文档（57份）
└── tools/            # 工具脚本
```

---

## 四、常用命令

### 开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建版本
```

### 测试
```bash
npm run test         # 运行测试
npm run lint         # 代码检查
```

---

## 五、开发流程

### 1. 创建分支
```bash
git checkout -b feature/your-feature
```

### 2. 开发代码
- 编写功能
- 测试验证
- 提交代码

### 3. 提交PR
- 推送到远程
- 创建Pull Request
- 等待审查
- 合并到main

---

## 六、资源管理

### 素材位置
- `public/assets/`：静态资源
- `categorized/`：分类素材库（2.5GB）

### 添加素材
1. 按分类放入对应目录
2. 更新索引
3. 提交PR

---

## 七、调试技巧

### 浏览器调试
- F12打开DevTools
- Console看日志
- Network看加载
- Performance看性能

### Three.js调试
- scene对象检查
- 材质检查
- 灯光检查

---

## 八、常见问题

### Q：npm install失败？
A：检查Node版本，清理缓存重试

### Q：开发服务器打不开？
A：检查端口占用，换端口重试

### Q：模型加载不出来？
A：检查路径，检查文件是否存在

---

## 九、获取帮助

### 文档
- `docs/`目录有57份设计文档
- README有项目说明

### 社区
- GitHub Issues提问题
- Discussions讨论

---

> 欢迎贡献，一起打造最美唐长安！

---
文档日期：2026-10-25
