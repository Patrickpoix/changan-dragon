# NPC 群集系统原型 — 技术报告

> 日期：2026-10-25
> 目标：500 NPC 同屏（朱雀大街 demo）

## 架构
- 场景：朱雀大街 1km × 150m 宽
- NPC 数据池：1000 个纯 JS 对象（位置/方向/速度/状态/配色）
- LOD0 近距(<50m)：Xbot SkinnedMesh 池，最多 30 个
- LOD1 中距(50-150m)：InstancedMesh capsule，1 draw call
- LOD2 远距(>150m)：同 LOD1（fog 淡出）
- Steering：沿主路双向 + 坊门随机进出 + 简化 RVO
- 状态机：walk 80% / idle 15% / talk 5%
- 时间密度：白天 500 / 夜晚 50 / 上元灯节 1000

## 三档 LOD
| 档位 | 距离 | 渲染方式 | 数量上限 | 动画 |
|---|---|---|---|---|
| LOD0 近 | <50m | 真 SkinnedMesh | 30 | 真骨骼 AnimationMixer |
| LOD1 中 | 50-150m | InstancedMesh | 470-970 | 程序化 bob |
| LOD2 远 | >150m | 同 LOD1 | — | 无 |

## 性能估算（500 NPC）
- DrawCalls ~55, Triangles ~160k, 内存 ~15MB
- 桌面 Chrome 60fps

## NPC 多样性
- 身高 0.9-1.1, 步速 0.8-1.2
- 配色 6 类：紫=高官/绯=中官/青=兵/白=百姓/褐=胡商/绿=僧

## 下一步
1. 接108坊路径图 A*/flow field
2. talk 状态双人配对
3. GPU动画（骨骼bake到texture）
4. 上元灯节 1000 NPC + 灯笼 emissive + bloom
