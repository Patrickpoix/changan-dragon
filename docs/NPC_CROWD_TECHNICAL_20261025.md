# NPC 群集系统 — 技术实现文档

> 版本：v1.0
> 状态：✅ 已完成原型

---

## 1. 核心架构

### 1.1 三级 LOD 策略

| 距离 | 渲染方式 | NPC数量 | DrawCall |
|---|---|---|---|
| <50m | SkinnedMesh（真骨骼动画） | 30个 | 30 |
| 50-150m | InstancedMesh（硬编码动画帧） | 全部可见 | 1 |
| >150m | Billboard impostor / fog | 不渲染 | 0 |

**关键指标**：500个NPC 总计 = 31 draw calls（30 SkinnedMesh + 1 InstancedMesh）

### 1.2 动画状态机

```
idle (站着) ←→ walk (走) ←→ run (跑)
     ↓
 talk (交谈) ←→ work (劳作)
```

- 每个NPC有独立状态机
- 状态切换概率由时间/地点/人群密度决定
- 动画clip从Xbot/Soldier复用

---

## 2. 性能优化

### 2.1 InstancedMesh 合批
```javascript
// 500个NPC = 1个InstancedMesh = 1 draw call
const npcMesh = new THREE.InstancedMesh(
  geometry, material, 500
);
// 每帧更新矩阵（位置/旋转/缩放）
for (let i = 0; i < 500; i++) {
  dummy.position.copy(npcs[i].position);
  dummy.updateMatrix();
  npcMesh.setMatrixAt(i, dummy.matrix);
}
npcMesh.instanceMatrix.needsUpdate = true;
```

### 2.2 日夜数量变化

| 时段 | NPC数量 | 说明 |
|---|---|---|
| 白天 | 500 | 集市/街道繁忙 |
| 黄昏 | 300 | 渐少 |
| 夜晚 | 50 | 仅巡夜/守卫 |
| 上元灯节 | 1,000 | 全城狂欢 |

---

## 3. 寻路与避障

### 3.1 A* 寻路
- 网格分辨率：2m × 2m
- 寻路范围：仅当前chunk + 相邻chunk
- 路径缓存：同一起点终点复用

### 3.2 RVO 避障
- 本地避障半径：1.5m
- 不做全局路径重算
- 避免穿模/重叠

---

## 4. 人种与阶层差异

### 4.1 外观Variety
- 1个基础骨架 + palette_map 换色
- 肤色：浅黄（汉人）/深褐（昆仑奴）/白皙（贵族）
- 服装色：按品色制度（紫/绯/绿/青）
- 体型：Xbot（普通）/Soldier（壮）/RobotExpressive（高）

### 4.2 西市胡商
- 深肤色贴图 = 昆仑奴
- 壮体型 + 翻领袍贴图 = 粟特胡商
- 骆驼模型作为胡商特色

---

## 5. 已知限制

1. NPC是欧洲骨架（Xbot），需后续换东方脸
2. 走路动画是欧式步态，需调优
3. 无面部动画（嘴型/表情）
4. NPC之间不对话（只有独立活动）
5. 无NPC与玩家的交互对话

---

## 6. 下一步

- [ ] 东方脸模型替换
- [ ] 唐服骨骼绑定
- [ ] NPC对话系统
- [ ] NPC任务分配
- [ ] 节日NPC特殊行为

---

*NPC原型在 npc-crowd-demo/ 目录下。*
