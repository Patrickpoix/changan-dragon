# 本地开发环境搭建指南（2026-10-25）

> 在E:\project下搭建本地开发环境。

---

## 一、环境要求

### 硬件
- 操作系统：Windows 10/11
- 内存：16GB+
- 显卡：支持WebGL2
- 磁盘：10GB+可用空间

### 软件
- Node.js 18+
- Git
- VS Code(推荐)

---

## 二、目录结构

```
E:\project\
├── changan-dragon\     # GitHub主仓克隆
│   ├── docs\            # 设计文档
│   ├── src\             # 源代码
│   ├── public\          # 静态资源
│   └── package.json
├── assets\              # 素材库
│   ├── buildings\        # 建筑模型
│   ├── characters\      # 角色模型
│   ├── nature\          # 自然材质
│   └── audio\           # 音频素材
└── research\            # 研究资料
```

---

## 三、克隆仓库

### 步骤
```bash
cd E:\project
git clone https://github.com/Patrickpoix/changan-dragon.git
cd changan-dragon
```

### 同步
```bash
git pull origin main
```

---

## 四、安装依赖

### 步骤
```bash
npm install
```

### 运行开发服务器
```bash
npm run dev
```

### 构建
```bash
npm run build
```

---

## 五、素材库

### 位置
- 本地：E:\project\assets\
- GitHub：仓库内assets/目录

### 同步
- 本地修改后push到GitHub
- 从GitHub pull最新素材

---

## 六、工作流程

### 日常开发
1. 从GitHub pull最新代码
2. 本地修改
3. 本地测试
4. push到GitHub

### 分支管理
- main分支：主分支，唯一权威
- feature分支：功能开发
- 完成后merge回main

---

## 七、实时同步

### 本地 → GitHub
```bash
git add .
git commit -m "message"
git push origin main
```

### GitHub → 本地
```bash
git pull origin main
```

---

## 八、验证

### 本地验证
- npm run dev 启动成功
- 浏览器访问正常
- 朱雀大街demo可跑

### GitHub同步
- push成功
- GitHub上可见
- 其他地方可pull

---
文档日期：2026-10-25
