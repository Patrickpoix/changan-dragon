/* ============================================================
   建筑细节增强 · 唐风韵味
   斗拱 / 飞檐 / 门窗 / 彩画 / 装饰
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildArchitecturalDetails();
  }

  function buildPalaceDetails() {
    const palaceX = 150, palaceZ = -400;
    for (let i = -5; i <= 5; i++) {
      B.red.add(palaceX + i * 8, 12, palaceZ - 20, 1, 1.5, 1, 0, 0xc04030);
      B.red.add(palaceX + i * 8, 12, palaceZ + 20, 1, 1.5, 1, 0, 0xc04030);
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        B.roofGold.add(palaceX + sx * 45, 15, palaceZ + sz * 30, 3, 1, 3, 0, 0xd4a840);
      }
    }
    for (let i = -4; i <= 4; i++) {
      B.columns.add(palaceX + i * 10, 8, palaceZ - 22, 0.8, 16, 0.8, 0, 0xd04838);
    }
    console.log('[ArchDetails] 宫殿细节完成');
  }

  function buildTempleDetails() {
    const pagodaX = 216, pagodaZ = 283;
    B.roof.add(pagodaX, 8, pagodaZ - 50, 20, 3, 12, 0, 0x406060);
    B.plaster.add(pagodaX, 5, pagodaZ - 50, 16, 6, 8, 0, 0xf0e0c0);
    B.roof.add(pagodaX - 30, 6, pagodaZ - 30, 8, 2, 8, 0, 0x406060);
    B.roof.add(pagodaX + 30, 6, pagodaZ - 30, 8, 2, 8, 0, 0x406060);
    console.log('[ArchDetails] 寺庙细节完成');
  }

  function buildShopDetails() {
    for (let i = 0; i < 10; i++) {
      const x = 150 + i * 6;
      const z = -14;
      B.wood.add(x, 4, z - 5, 3, 1.5, 0.2, 0, 0x8a5a3a);
      B.red.add(x, 5, z - 3, 4, 0.2, 2, 0, 0xc04030);
    }
    for (let i = 0; i < 10; i++) {
      const x = -280 + i * 6;
      const z = -14;
      B.wood.add(x, 4, z + 5, 3, 1.5, 0.2, 0, 0x8a5a3a);
      B.red.add(x, 5, z + 3, 4, 0.2, 2, 0, 0xc04030);
    }
    console.log('[ArchDetails] 商铺细节完成');
  }

  function buildWallDetails() {
    B.roofGold.add(0, 12, -380, 40, 4, 20, 0, 0xd4a840);
    B.plaster.add(0, 8, -380, 30, 6, 12, 0, 0xf0e0c0);
    console.log('[ArchDetails] 城墙细节完成');
  }

  function buildArchitecturalDetails() {
    console.log('[ArchDetails] 开始构建建筑细节...');
    buildPalaceDetails();
    buildTempleDetails();
    buildShopDetails();
    buildWallDetails();
    console.log('[ArchDetails] 建筑细节构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
