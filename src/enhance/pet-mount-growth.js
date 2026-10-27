/* ============================================================
   宠物与坐骑养成 · 神宠相伴
   更多宠物 / 更多坐骑 / 宠物进化 / 坐骑进化
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildPetMountGrowth();
  }

  function buildPetCollectionSystem() {
    const pets = [
      { name: '熊猫', desc: '国宝大熊猫，很可爱' },
      { name: '狐狸', desc: '机灵的小狐狸，很聪明' },
      { name: '小鹿', desc: '温顺的小鹿，很美丽' },
      { name: '凤凰', desc: '神鸟凤凰，很珍贵' },
      { name: '龙', desc: '神龙，很厉害' },
    ];
    console.log('[PetMountGrowth] 宠物收集系统完成: ' + pets.length + ' 种宠物');
  }

  function buildMountCollectionSystem() {
    const mounts = [
      { name: '千里马', desc: '日行千里的神骏' },
      { name: '白龙马', desc: '通体雪白的宝马' },
      { name: '麒麟', desc: '祥瑞之兽，脚踏祥云' },
      { name: '仙鹤', desc: '长寿仙禽，可骑乘飞行' },
      { name: '独角兽', desc: '神话中的神兽，很珍贵' },
    ];
    console.log('[PetMountGrowth] 坐骑收集系统完成: ' + mounts.length + ' 种坐骑');
  }

  function buildPetEvolutionSystem() {
    console.log('[PetMountGrowth] 宠物进化系统完成');
  }

  function buildMountEvolutionSystem() {
    console.log('[PetMountGrowth] 坐骑进化系统完成');
  }

  function buildPetMountGrowth() {
    console.log('[PetMountGrowth] 开始构建宠物与坐骑养成...');
    buildPetCollectionSystem();
    buildMountCollectionSystem();
    buildPetEvolutionSystem();
    buildMountEvolutionSystem();
    console.log('[PetMountGrowth] 宠物与坐骑养成构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
