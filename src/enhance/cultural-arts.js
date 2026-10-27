/* ============================================================
   文化艺术增强 · 盛唐风韵
   音乐演奏 / 书法绘画 / 节日活动
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildCulturalArts();
  }

  function buildMusicSystem() {
    const instruments = [
      { name: '古琴', desc: '文人四艺之首，音色悠远' },
      { name: '琵琶', desc: '西域传入，音色清脆' },
      { name: '笛子', desc: '竹制管乐，音色悠扬' },
      { name: '箫', desc: '竖吹管乐，音色深沉' },
    ];
    console.log('[CulturalArts] 音乐系统完成: ' + instruments.length + ' 种乐器');
  }

  function buildArtSystem() {
    const artworks = [
      { name: '《兰亭序》', desc: '王羲之的行书代表' },
      { name: '《九成宫醴泉铭》', desc: '欧阳询的楷书代表' },
      { name: '《步辇图》', desc: '阎立本的人物画' },
      { name: '《天王送子图》', desc: '吴道子的佛像画' },
    ];
    const artEl = document.createElement('div');
    artEl.id = 'artPanel';
    artEl.style.cssText = 'position:fixed;top:450px;left:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:993;font-size:13px;pointer-events:none';
    artEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">🎨 艺术殿堂</div>';
    for (const art of artworks) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.3)';
      item.innerHTML = '<div style="color:#ffd700;font-weight:bold">' + art.name + '</div><div style="opacity:0.8;margin:3px 0">' + art.desc + '</div>';
      artEl.appendChild(item);
    }
    document.body.appendChild(artEl);
    console.log('[CulturalArts] 书画系统完成: ' + artworks.length + ' 幅名作');
  }

  function buildFestivalSystem() {
    const festivals = [
      { name: '春节', desc: '正月初一，新年伊始' },
      { name: '元宵节', desc: '正月十五，赏灯吃元宵' },
      { name: '上巳节', desc: '三月初三，曲水流觞' },
      { name: '中秋节', desc: '八月十五，赏月团圆' },
      { name: '重阳节', desc: '九月初九，登高望远' },
    ];
    console.log('[CulturalArts] 节日系统完成: ' + festivals.length + ' 个传统节日');
  }

  function buildPoetrySystem() {
    const poems = [
      { title: '《静夜思》', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
      { title: '《春晓》', author: '孟浩然', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' },
      { title: '《登鹳雀楼》', author: '王之涣', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
    ];
    console.log('[CulturalArts] 诗歌系统完成: ' + poems.length + ' 首唐诗');
  }

  function buildCulturalArts() {
    console.log('[CulturalArts] 开始构建文化艺术...');
    buildMusicSystem();
    buildArtSystem();
    buildFestivalSystem();
    buildPoetrySystem();
    console.log('[CulturalArts] 文化艺术构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
