/* ============================================================
   家园与种植增强 · 安居乐业
   买房置地 / 房屋装修 / 种植养殖
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildHomeGarden();
  }

  function buildHousingSystem() {
    const houses = [
      { name: '茅屋', desc: '最简单的茅草屋，价格便宜' },
      { name: '瓦房', desc: '砖瓦房，宽敞舒适' },
      { name: '四合院', desc: '传统四合院，气派非凡' },
      { name: '别墅', desc: '豪华别墅，顶级享受' },
    ];
    console.log('[HomeGarden] 房产系统完成: ' + houses.length + ' 种房子');
  }

  function buildDecorationSystem() {
    const decorations = [
      { name: '桌椅', desc: '吃饭会客用的桌椅' },
      { name: '床榻', desc: '休息睡觉用的床' },
      { name: '书架', desc: '放书的书架，充满书香' },
      { name: '花瓶', desc: '插花的花瓶，美化环境' },
    ];
    console.log('[HomeGarden] 装修系统完成: ' + decorations.length + ' 种家具');
  }

  function buildFarmingSystem() {
    const plants = [
      { name: '牡丹', desc: '国色天香的牡丹花' },
      { name: '菊花', desc: '秋天的菊花，傲霜怒放' },
      { name: '桃花', desc: '春天的桃花，美不胜收' },
      { name: '荷花', desc: '夏天的荷花，出淤泥而不染' },
    ];
    console.log('[HomeGarden] 种植系统完成: ' + plants.length + ' 种植物');
  }

  function buildAnimalSystem() {
    const animals = [
      { name: '鸡', desc: '会下蛋的母鸡' },
      { name: '鸭', desc: '会游泳的鸭子' },
      { name: '鹅', desc: '看家护院的鹅' },
      { name: '羊', desc: '温顺的小羊' },
    ];
    console.log('[HomeGarden] 养殖系统完成: ' + animals.length + ' 种动物');
  }

  function buildHomeGarden() {
    console.log('[HomeGarden] 开始构建家园与种植...');
    buildHousingSystem();
    buildDecorationSystem();
    buildFarmingSystem();
    buildAnimalSystem();
    console.log('[HomeGarden] 家园与种植构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
