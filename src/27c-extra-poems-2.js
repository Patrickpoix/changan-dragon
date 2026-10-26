/* ============================================================
   额外诗笺扩展二 · 追加4枚（西市/东市/曲江池/兴庆宫）
   统一使用20-character的makePoemScroll卷轴样式，加载时立即执行。
   曲江池诗笺移至东南岸(398,346)、兴庆宫移至龙池北岸沉香亭花圃(342,-190)，
   确保玩家可站立拾取（原坐标在水面中心不可达）。
   ============================================================ */
(function() {
  'use strict';
  const morePoems = [
    { place: '西市', line: '胡姬春酒，一杯十千，与君同醉', x: -258, z: 20 },
    { place: '东市', line: '长安回望绣成堆，山顶千门次第开', x: 174, z: 20 },
    { place: '曲江池', line: '三月三日天气新，长安水边多丽人', x: 398, z: 346 },
    { place: '兴庆宫', line: '名花倾国两相欢，长得君王带笑看', x: 342, z: -190 },
  ];
  if (typeof poems === 'undefined' || typeof makePoemScroll !== 'function') return;
  morePoems.forEach(p => makePoemScroll(p.x, p.z, p.line, p.place));
  if (typeof updatePoemCounter === 'function') updatePoemCounter();
  if (typeof buildCollectionList === 'function') buildCollectionList();
  console.log('[Poems] 追加诗笺 4 枚（西市/东市/曲江池/兴庆宫）→ 共 ' + poems.length + ' 枚');
})();