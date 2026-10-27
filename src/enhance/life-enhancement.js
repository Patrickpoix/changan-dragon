/* ============================================================
   人物与自然增强 · 生机盎然
   更多行人 / 更丰富植被 / 自然元素
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildLifeEnhancement();
  }

  function buildMorePedestrians() {
    const pedestrianCount = 50;
    const colors = [0xc04030, 0x4060a0, 0x408050, 0xc0a040, 0x8060a0, 0x606060];
    for (let i = 0; i < pedestrianCount; i++) {
      const x = rand(-20, 20);
      const z = rand(-350, 350);
      const color = pick(colors);
      B.plaster.add(x, 1, z, 0.6, 1.2, 0.4, 0, color);
      B.plaster.add(x, 2, z, 0.35, 0.35, 0.35, 0, 0xf0d0b0);
      B.dark.add(x - 0.15, 0.4, z, 0.12, 0.8, 0.12, 0, 0x404040);
      B.dark.add(x + 0.15, 0.4, z, 0.12, 0.8, 0.12, 0, 0x404040);
    }
    console.log('[LifeEnhancement] 额外行人: ' + pedestrianCount + ' 人');
  }

  function buildMoreTrees() {
    const treePositions = [
      [-20, -300], [-20, -200], [-20, -100], [-20, 0], [-20, 100], [-20, 200], [-20, 300],
      [20, -300], [20, -200], [20, -100], [20, 0], [20, 100], [20, 200], [20, 300],
      [150, -60], [180, -60], [150, 20], [180, 20],
      [-280, -60], [-250, -60], [-280, 20], [-250, 20],
    ];
    const blossomColors = [0xe880a0, 0xf0a0b0, 0xd07090];
    for (const [x, z] of treePositions) {
      B.trunk.add(x, 2, z, 0.4, 4, 0.4, 0, 0x6a4a3a);
      const color = pick(blossomColors);
      B.blossom.add(x, 5, z, 3, 3, 3, 0, color);
    }
    console.log('[LifeEnhancement] 额外花树: ' + treePositions.length + ' 棵');
  }

  function buildBirds() {
    const birdCount = 20;
    for (let i = 0; i < birdCount; i++) {
      const x = rand(-400, 400);
      const y = rand(50, 100);
      const z = rand(-400, 400);
      B.dark.add(x, y, z, 0.3, 0.1, 0.1, 0, 0x404040);
    }
    console.log('[LifeEnhancement] 飞鸟: ' + birdCount + ' 只');
  }

  function buildLifeEnhancement() {
    console.log('[LifeEnhancement] 开始增强人物与自然...');
    buildMorePedestrians();
    buildMoreTrees();
    buildBirds();
    console.log('[LifeEnhancement] 人物与自然增强完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
