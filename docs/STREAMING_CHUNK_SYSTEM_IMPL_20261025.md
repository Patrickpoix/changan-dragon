# 流加载系统具体实现方案

> 设计文档版本：v1.0
> 日期：2026-10-25

---

## 一、Chunk切分

### 尺寸
- 每个chunk：500m × 500m
- 全城：约19×17 = 323个chunk

### 坐标计算
```javascript
function getChunkX(worldX) {
  return Math.floor((worldX + 4860) / 500);
}
function getChunkZ(worldZ) {
  return Math.floor((worldZ + 4326) / 500);
}
```

---

## 二、加载策略

### 常驻chunk
- 玩家周围3×3 = 9个chunk常驻内存

### 预加载chunk
- 玩家周围5×5 = 25个chunk预加载

### 卸载chunk
- 距离玩家>3个chunk的卸载

### 双缓冲
- 加载时不卡顿
- 后台线程加载

---

## 三、LOD策略

### 4级LOD
- LOD0：玩家周围200m（高精度）
- LOD1：200-500m（中精度）
- LOD2：500-1000m（低精度）
- LOD3：>1000m（billboard）

---

## 四、内存预算
- 几何内存：<512MB
- 贴图内存：<1GB
- 总内存：<2GB

---

设计日期：2026-10-25 16:45
