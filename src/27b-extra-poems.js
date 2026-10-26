/* ============================================================
   额外诗笺扩展一 · 追加4枚（太极宫/小雁塔/曲江亭/明德门）
   统一使用20-character的makePoemScroll卷轴样式，加载时立即执行，
   不覆盖buildWorld（避免P0初始化失效），坐标均为可站立区域。
   ============================================================ */
(function() {
  'use strict';
  const extraPoems = [
    { place: '太极宫', line: '九天阊阖开宫殿，万国衣冠拜冕旒', x: 0, z: -340 },
    { place: '小雁塔', line: '窣堵凌霄汉，浮图出烟雾', x: -216, z: 349 },
    { place: '曲江亭', line: '曲江丝管日纷纷，半入江风半入云', x: 300, z: 262 },
    { place: '明德门', line: '千轮万蹄踏晓霜，五门开启纳朝阳', x: 0, z: 390 },
  ];
  if (typeof poems === 'undefined' || typeof makePoemScroll !== 'function') return;
  extraPoems.forEach(p => makePoemScroll(p.x, p.z, p.line, p.place));
  if (typeof updatePoemCounter === 'function') updatePoemCounter();
  if (typeof buildCollectionList === 'function') buildCollectionList();
  console.log('[Poems] 追加诗笺 4 枚（太极宫/小雁塔/曲江亭/明德门）→ 共 ' + poems.length + ' 枚');
})();