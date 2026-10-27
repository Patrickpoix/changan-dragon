/* ============================================================
   城市细节增强 · 繁华盛唐
   灯笼 / 旗帜 / 招牌 / 花箱 / 装饰
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildCityDetails();
  }

  function buildStreetLanterns() {
    const lanternCount = 40;
    for (let i = 0; i < lanternCount; i++) {
      const t = i / lanternCount;
      const z = lerp(-360, 360, t);
      for (const side of [-1, 1]) {
        const x = side * 14;
        B.lantern.add(x, 5, z, 0.6, 0.8, 0.6, 0, 0xff5030);
        B.lanternGlow.add(x, 5, z, 1.5, 1.5, 1.5, 0, 0xff8050);
        B.dark.add(x, 5.8, z, 0.1, 1.5, 0.1, 0, 0x6a4a3a);
      }
    }
    console.log('[CityDetails] 沿街灯笼完成: ' + lanternCount * 2 + ' 盏');
  }

  function buildShopBanners() {
    const bannerColors = [0xc04030, 0x4080c0, 0x40a060, 0xc0a040, 0x8040a0];
    for (let i = 0; i < 20; i++) {
      const x = rand(150, 200);
      const z = rand(-40, 10);
      const color = pick(bannerColors);
      B.dark.add(x, 6, z, 0.15, 6, 0.15, 0, 0x5a3a2a);
      B.plaster.add(x + 1, 6.5, z, 2, 1.2, 0.1, 0, color);
    }
    for (let i = 0; i < 20; i++) {
      const x = rand(-280, -230);
      const z = rand(-40, 10);
      const color = pick(bannerColors);
      B.dark.add(x, 6, z, 0.15, 6, 0.15, 0, 0x5a3a2a);
      B.plaster.add(x - 1, 6.5, z, 2, 1.2, 0.1, 0, color);
    }
    console.log('[CityDetails] 商铺旗帜完成: 40 面');
  }

  function buildFlowerBoxes() {
    const flowerColors = [0xe880a0, 0xf0c050, 0xd06060, 0xa0c060];
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const z = lerp(-350, 350, t);
      for (const side of [-1, 1]) {
        const x = side * 10;
        B.wood.add(x, 0.5, z, 2, 1, 0.8, 0, 0x8a5a3a);
        const color = pick(flowerColors);
        B.blossom.add(x, 1.3, z, 1.5, 1, 1, 0, color);
      }
    }
    console.log('[CityDetails] 花箱绿植完成: 60 组');
  }

  function buildPaifang(x, z, rotation = 0) {
    for (const sx of [-1, 1]) {
      B.columns.add(x + sx * 6, 5, z, 0.6, 10, 0.6, 0, 0xc04030);
    }
    B.red.add(x, 9.5, z, 14, 1, 0.5, 0, 0xb03020);
    B.red.add(x, 11, z, 12, 0.8, 0.5, 0, 0xc04030);
    B.roofGold.add(x, 12, z, 15, 1.5, 3, 0, 0xd4a840);
    B.gold.add(x, 10, z + 0.3, 5, 1.2, 0.1, 0, 0xf0c050);
    addCollider(x - 7, x + 7, z - 1, z + 1, 'paifang');
    console.log('[CityDetails] 牌坊完成: (' + x + ', ' + z + ')');
  }

  function buildCityDetails() {
    console.log('[CityDetails] 开始构建城市细节...');
    buildStreetLanterns();
    buildShopBanners();
    buildFlowerBoxes();
    buildPaifang(0, 260, 0);
    buildPaifang(0, -200, 0);
    buildPaifang(174, -14, Math.PI / 2);
    buildPaifang(-258, -14, Math.PI / 2);
    console.log('[CityDetails] 城市细节构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
