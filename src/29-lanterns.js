/* ============================================================
   街道灯笼增强 · 朱雀大街+东西市+曲江沿岸
   ============================================================ */

function enhanceStreetLanterns() {
  if (typeof B === 'undefined' || !B.lanternCap) return;
  
  // 朱雀大街两侧灯笼（每隔20米一对）
  for (let z = 260; z <= 360; z += 20) {
    for (const side of [-1, 1]) {
      const x = side * 30;
      // 灯柱
      B.wood.add(x, 1.8, z, 0.12, 3.6, 0.12, 0, 0x6b4423);
      // 灯笼
      B.lanternCap.add(x, 3.8, z, 0.35, 0.5, 0.35, 0, 0xd4382c);
    }
  }
  
  // 西市入口灯笼
  for (let x = -310; x <= -200; x += 22) {
    for (const z of [-70, 42]) {
      B.wood.add(x, 1.5, z, 0.1, 3, 0.1, 0, 0x6b4423);
      B.lanternCap.add(x, 3.2, z, 0.3, 0.45, 0.3, 0, 0xe8b84a);
    }
  }
  
  // 东市入口灯笼
  for (let x = 120; x <= 220; x += 22) {
    for (const z of [-70, 42]) {
      B.wood.add(x, 1.5, z, 0.1, 3, 0.1, 0, 0x6b4423);
      B.lanternCap.add(x, 3.2, z, 0.3, 0.45, 0.3, 0, 0xe8b84a);
    }
  }
  
  // 曲江池沿岸灯笼
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 0.7;
    const x = 300 + Math.cos(angle) * 70;
    const z = 260 + Math.sin(angle) * 50;
    B.wood.add(x, 1.4, z, 0.1, 2.8, 0.1, 0, 0x6b4423);
    B.lanternCap.add(x, 3.0, z, 0.28, 0.4, 0.28, 0, 0xd4382c);
  }
}

// 在建筑细节构建完成后调用
if (typeof buildArchitecturalDetails === 'function') {
  const orig = buildArchitecturalDetails;
  buildArchitecturalDetails = function() {
    orig();
    enhanceStreetLanterns();
  };
}
