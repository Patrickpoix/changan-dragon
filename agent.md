# Agent 开发规范

## 核心原则

### 1. 时间纪律
- 每次开始工作前必须校准北京时间
- 用户要求的停止时间前绝不允许中途停下汇报
- 想停下来时先校准时间，时间没到就继续做

### 2. 模块组织原则
- **按 Owner 分类，不按功能碎片分文件**
- 禁止写大量细小的单功能模块（如210-300号共90个）
- 每个模块应该是一个完整的系统，由一个owner负责
- 模块命名应该是系统级别的，不是细节级别的

### 3. 禁止硬编码
- 所有坐标、尺寸、数量等参数必须从配置读取
- 地标坐标必须引用 src/12-landmarks.js 的权威数据
- 全局变量必须使用原引擎的正确名称（sun/ambient/MAT/scene等）

### 4. 架构原则
- 不创建与原系统平行的重复系统
- 复用已有能力（材质库/NPC/水面/昼夜/音频/交互）
- 新增功能必须建立在原有引擎之上
- 不要通过增加更多模块来掩盖架构问题

### 5. 注入方式
- 必须使用 IIFE + 轮询等待 GAME.ready 的方式
- 禁止在 buildWorld 定义前覆盖它
- 所有模块加载时机必须晚于核心引擎

### 6. 测试与验证
- 完成后必须运行GitHub CI测试
- 报错必须修复，不能带病提交
- 不能把"代码已提交"当成"功能已完成"
- 不能把程序化基础几何当成电影级视觉资产

## 模块Owner划分

| Owner | 职责 | 对应文件 |
|-------|------|----------|
| VisualGrade | 视觉调色/色调映射/雾效/光影 | enhance/visual-grade.js |
| Landmarks | 所有地标建筑精修/台阶/广场/围墙 | enhance/landmarks.js |
| Vegetation | 所有树木/花卉/绿化系统 | enhance/vegetation.js |
| Water | 所有水面/船/桥/岸线/荷花 | enhance/water.js |
| Sky | 天空/太阳/月亮/星星/云/远山 | enhance/sky.js |
| CityLife | NPC/行人/商贩/摊位/城市活动 | enhance/city-life.js |
| Outside | 城外农田/树林/村落/驿站/远山 | enhance/outside.js |
| Night | 夜景灯光/灯笼/点光源 | enhance/night-light.js |
| Performance | 性能优化/DPR/LOD/阴影 | enhance/performance.js |

## 禁止事项
- ❌ 禁止写210、211...这种按编号堆模块的方式
- ❌ 禁止每个小细节一个文件
- ❌ 禁止硬编码坐标新建地标
- ❌ 禁止使用错误的变量名（sunLight/ambientLight）
- ❌ 禁止覆盖buildWorld而不等待它定义完成
- ❌ 禁止重复造轮子（已有系统就不要新建第二套）
- ❌ 禁止未经测试就推送main
