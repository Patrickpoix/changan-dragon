/* ============================================================
   夜景灯光增强 · 盛唐不夜城
   更多灯笼 / 灯光效果 / 夜景氛围
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildNightLighting();
  }

  function buildStreetLanterns() {
    const lanternCount = 60;
    for (let i = 0; i < lanternCount; i++) {
      const t = i / lanternCount;
      const z = lerp(-370, 370, t);
      for (const side of [-1, 1]) {
        const x = side * 13;
        B.lantern.add(x, 6, z, 0.8, 1, 0.8, 0, 0xff5030);
        B.lanternGlow.add(x, 6, z, 2, 2, 2, 0, 0xff8050);
        B.dark.add(x, 7, z, 0.1, 2, 0.1, 0, 0x6a4a3a);
      }
    }
    console.log('[NightLight] 沿街灯笼: ' + lanternCount * 2 + ' 盏');
  }

  function buildShopLanterns() {
    const shopLanternCount = 80;
    for (let i = 0; i < shopLanternCount; i++) {
      if (i < 40) {
        const x = rand(150, 200);
        const z = rand(-50, 20);
        B.lantern.add(x, 4, z, 0.6, 0.8, 0.6, 0, 0xff6040);
        B.lanternGlow.add(x, 4, z, 1.5, 1.5, 1.5, 0, 0xff9060);
      } else {
        const x = rand(-280, -230);
        const z = rand(-50, 20);
        B.lantern.add(x, 4, z, 0.6, 0.8, 0.6, 0, 0xff6040);
        B.lanternGlow.add(x, 4, z, 1.5, 1.5, 1.5, 0, 0xff9060);
      }
    }
    console.log('[NightLight] 店铺灯笼: ' + shopLanternCount + ' 盏');
  }

  function buildPalaceLanterns() {
    const palaceLanternPositions = [
      [0, -300], [30, -300], [-30, -300],
      [0, -250], [30, -250], [-30, -250],
    ];
    for (const [x, z] of palaceLanternPositions) {
      B.lantern.add(x, 8, z, 1, 1.2, 1, 0, 0xff7050);
      B.lanternGlow.add(x, 8, z, 2.5, 2.5, 2.5, 0, 0xffa070);
      B.gold.add(x, 9, z, 0.2, 2, 0.2, 0, 0xf0c050);
    }
    console.log('[NightLight] 宫灯: ' + palaceLanternPositions.length + ' 盏');
  }

  function buildRiverLanterns() {
    const riverLanternCount = 30;
    for (let i = 0; i < riverLanternCount; i++) {
      const x = rand(320, 390);
      const z = rand(290, 340);
      B.lantern.add(x, 0.5, z, 0.4, 0.3, 0.4, 0, 0xff8060);
      B.lanternGlow.add(x, 0.5, z, 1, 1, 1, 0, 0xffa080);
    }
    console.log('[NightLight] 河灯: ' + riverLanternCount + ' 盏');
  }

  function buildNightLighting() {
    console.log('[NightLight] 开始构建夜景灯光...');
    buildStreetLanterns();
    buildShopLanterns();
    buildPalaceLanterns();
    buildRiverLanterns();
    console.log('[NightLight] 夜景灯光构建完成！盛唐不夜城');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
