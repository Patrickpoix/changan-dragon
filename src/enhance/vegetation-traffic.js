/* ============================================================
   植被与交通增强 · 生机盎然
   更多树木 / 花草 / 交通工具
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildVegetationTraffic();
  }

  function buildStreetTrees() {
    const treePositions = [];
    for (let i = 0; i < 20; i++) {
      const z = lerp(-370, 370, i / 19);
      treePositions.push([-16, z]);
      treePositions.push([16, z]);
    }
    for (const [x, z] of treePositions) {
      B.trunk.add(x, 3, z, 0.5, 6, 0.5, 0, 0x6a4a3a);
      B.leaf.add(x, 8, z, 4, 5, 4, 0, 0x4a8a4a);
    }
    console.log('[VegetationTraffic] 行道树: ' + treePositions.length + ' 棵');
  }

  function buildFlowerBeds() {
    const flowerColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6b9d];
    for (let i = 0; i < 30; i++) {
      const x = rand(-20, 20);
      const z = rand(-370, 370);
      const color = pick(flowerColors);
      B.stone.add(x, 0.2, z, 3, 0.4, 1.5, 0, 0x888888);
      for (let j = 0; j < 5; j++) {
        B.blossom.add(x + rand(-1, 1), 0.6, z + rand(-0.5, 0.5), 0.3, 0.3, 0.3, 0, color);
      }
    }
    console.log('[VegetationTraffic] 花坛: 30 个');
  }

  function buildCarriages() {
    const carriagePositions = [[0, -200], [5, -100], [-5, 50], [3, 200]];
    for (const [x, z] of carriagePositions) {
      B.wood.add(x, 2, z, 2, 1.5, 3, 0, 0x8a5a3a);
      B.roof.add(x, 3.5, z, 2.2, 0.3, 3.2, 0, 0x406060);
      B.dark.add(x - 1.1, 0.8, z - 1, 0.2, 0.8, 0.8, 0, 0x404040);
      B.dark.add(x + 1.1, 0.8, z - 1, 0.2, 0.8, 0.8, 0, 0x404040);
      B.dark.add(x - 1.1, 0.8, z + 1, 0.2, 0.8, 0.8, 0, 0x404040);
      B.dark.add(x + 1.1, 0.8, z + 1, 0.2, 0.8, 0.8, 0, 0x404040);
      B.plaster.add(x, 1.5, z + 2.5, 0.8, 1.5, 1.5, 0, 0xd4a860);
    }
    console.log('[VegetationTraffic] 马车: ' + carriagePositions.length + ' 辆');
  }

  function buildOxCarts() {
    const oxCartPositions = [[-250, -10], [-260, 0], [-240, 5]];
    for (const [x, z] of oxCartPositions) {
      B.wood.add(x, 1.5, z, 2.5, 1, 3, 0, 0x8a5a3a);
      B.plaster.add(x, 1, z + 2.5, 1, 1.2, 1.5, 0, 0x606060);
    }
    console.log('[VegetationTraffic] 牛车: ' + oxCartPositions.length + ' 辆');
  }

  function buildVegetationTraffic() {
    console.log('[VegetationTraffic] 开始构建植被与交通...');
    buildStreetTrees();
    buildFlowerBeds();
    buildCarriages();
    buildOxCarts();
    console.log('[VegetationTraffic] 植被与交通构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
