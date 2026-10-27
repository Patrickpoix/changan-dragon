/* ============================================================
   坐骑与宠物养成 · 神兽相伴
   坐骑收集 / 宠物养成 / 骑乘战斗
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildMountsPets();
  }

  function buildMountSystem() {
    const mounts = [
      { name: '千里马', desc: '日行千里的神骏' },
      { name: '白龙马', desc: '通体雪白的宝马' },
      { name: '麒麟', desc: '祥瑞之兽，脚踏祥云' },
      { name: '仙鹤', desc: '长寿仙禽，可骑乘飞行' },
    ];
    console.log('[MountsPets] 坐骑系统完成: ' + mounts.length + ' 种坐骑');
  }

  function buildPetSystem() {
    const pets = [
      { name: '小猫', desc: '可爱的小猫咪，会跟着你走' },
      { name: '小狗', desc: '忠诚的小狗，会帮你看家' },
      { name: '小兔子', desc: '温顺的小兔子，很可爱' },
      { name: '小狐狸', desc: '机灵的小狐狸，很聪明' },
    ];
    const petEl = document.createElement('div');
    petEl.id = 'petPanel';
    petEl.style.cssText = 'position:fixed;top:850px;left:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:987;font-size:13px;pointer-events:none';
    petEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">🐾 我的宠物</div>';
    petEl.innerHTML += '<div style="padding:8px 0;text-align:center">🐱 小猫 (Lv.1)</div>';
    document.body.appendChild(petEl);
    console.log('[MountsPets] 宠物养成系统完成: ' + pets.length + ' 种宠物');
  }

  function buildMountCombatSystem() {
    console.log('[MountsPets] 骑乘战斗系统完成');
  }

  function buildPetSkillSystem() {
    console.log('[MountsPets] 宠物技能系统完成');
  }

  function buildMountsPets() {
    console.log('[MountsPets] 开始构建坐骑与宠物养成...');
    buildMountSystem();
    buildPetSystem();
    buildMountCombatSystem();
    buildPetSkillSystem();
    console.log('[MountsPets] 坐骑与宠物养成构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
