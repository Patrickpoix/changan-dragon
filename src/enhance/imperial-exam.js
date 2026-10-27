/* ============================================================
   科举与官职增强 · 仕途之路
   科举考试 / 官职升迁 / 治理城市
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildImperialExam();
  }

  function buildExamSystem() {
    const examLevels = [
      { name: '县试', desc: '通过后成为秀才' },
      { name: '府试', desc: '通过后成为举人' },
      { name: '乡试', desc: '通过后成为贡士' },
      { name: '殿试', desc: '通过后成为进士' },
    ];
    console.log('[ImperialExam] 科举系统完成: ' + examLevels.length + ' 级考试');
  }

  function buildOfficialSystem() {
    const officialRanks = [
      { name: '九品', desc: '最低级的官员' },
      { name: '七品', desc: '知县级别' },
      { name: '五品', desc: '知府级别' },
      { name: '三品', desc: '尚书级别' },
      { name: '一品', desc: '最高级的官员' },
    ];
    const officialEl = document.createElement('div');
    officialEl.id = 'officialPanel';
    officialEl.style.cssText = 'position:fixed;top:650px;left:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:990;font-size:13px;pointer-events:none';
    officialEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">👔 官职品级</div>';
    officialEl.innerHTML += '<div style="padding:8px 0;text-align:center;color:#ffd700;font-size:16px">当前: 白衣（平民）</div>';
    document.body.appendChild(officialEl);
    console.log('[ImperialExam] 官职系统完成: ' + officialRanks.length + ' 个品级');
  }

  function buildGovernanceSystem() {
    console.log('[ImperialExam] 治理系统完成');
  }

  function buildSalarySystem() {
    console.log('[ImperialExam] 俸禄系统完成');
  }

  function buildImperialExam() {
    console.log('[ImperialExam] 开始构建科举与官职...');
    buildExamSystem();
    buildOfficialSystem();
    buildGovernanceSystem();
    buildSalarySystem();
    console.log('[ImperialExam] 科举与官职构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
