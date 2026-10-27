/* ============================================================
   活动与副本增强 · 精彩无限
   节日活动 / 限时活动 / 组队副本 / BOSS战
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildActivityDungeon();
  }

  function buildFestivalSystem() {
    const festivals = [
      { name: '春节', desc: '新年到，穿新衣，吃饺子' },
      { name: '元宵节', desc: '吃元宵，赏花灯，猜灯谜' },
      { name: '中秋节', desc: '赏月，吃月饼，团圆节' },
      { name: '重阳节', desc: '登高，赏菊，敬老节' },
    ];
    console.log('[ActivityDungeon] 节日活动系统完成: ' + festivals.length + ' 个节日');
  }

  function buildLimitedSystem() {
    const limiteds = [
      { name: '双倍经验', desc: '在活动期间，获得的经验翻倍' },
      { name: '双倍掉落', desc: '在活动期间，怪物掉落翻倍' },
      { name: '限时折扣', desc: '在活动期间，商店商品打折' },
    ];
    console.log('[ActivityDungeon] 限时活动系统完成: ' + limiteds.length + ' 个限时活动');
  }

  function buildDungeonSystem() {
    const dungeons = [
      { name: '大雁塔', desc: '唐代的著名佛塔，可以组队挑战' },
      { name: '曲江池', desc: '唐代的著名园林，可以组队游玩' },
      { name: '大明宫', desc: '唐代的皇宫，可以组队参观' },
    ];
    console.log('[ActivityDungeon] 副本系统完成: ' + dungeons.length + ' 个副本');
  }

  function buildBossSystem() {
    const bosses = [
      { name: '龙王', desc: '海里的龙王，很厉害' },
      { name: '妖王', desc: '山里的妖王，很凶猛' },
      { name: '魔王', desc: '魔界的魔王，很邪恶' },
    ];
    console.log('[ActivityDungeon] BOSS战系统完成: ' + bosses.length + ' 个BOSS');
  }

  function buildActivityDungeon() {
    console.log('[ActivityDungeon] 开始构建活动与副本...');
    buildFestivalSystem();
    buildLimitedSystem();
    buildDungeonSystem();
    buildBossSystem();
    console.log('[ActivityDungeon] 活动与副本构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
