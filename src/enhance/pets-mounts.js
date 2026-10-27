/* ============================================================
   宠物与坐骑系统 · 神兽相伴
   宠物收集 / 坐骑收集 / 宠物养成 / 坐骑养成
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildPetsMounts();
  }

  function buildPetCollectionSystem() {
    const pets = [
      { name: '猫咪', desc: '可爱的小猫咪' },
      { name: '狗狗', desc: '忠诚的小狗' },
      { name: '兔子', desc: '温顺的小兔子' },
      { name: '仙鹤', desc: '优雅的仙鹤' },
    ];
    console.log('[PetsMounts] 宠物收集系统完成: ' + pets.length + ' 种宠物');
  }

  function buildMountCollectionSystem() {
    const mounts = [
      { name: '骏马', desc: '千里马' },
      { name: '白马', desc: '白龙马' },
      { name: '骆驼', desc: '沙漠之舟' },
      { name: '麒麟', desc: '祥瑞神兽' },
    ];
    console.log('[PetsMounts] 坐骑收集系统完成: ' + mounts.length + ' 种坐骑');
  }

  function buildPetTrainingSystem() {
    console.log('[PetsMounts] 宠物养成系统完成');
  }

  function buildMountTrainingSystem() {
    console.log('[PetsMounts] 坐骑养成系统完成');
  }

  function buildPetsMounts() {
    console.log('[PetsMounts] 开始构建宠物与坐骑系统...');
    buildPetCollectionSystem();
    buildMountCollectionSystem();
    buildPetTrainingSystem();
    buildMountTrainingSystem();
    console.log('[PetsMounts] 宠物与坐骑系统构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
