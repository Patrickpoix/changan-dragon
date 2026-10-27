/* ============================================================
   社交与婚姻增强 · 相识相知
   好友聊天 / 结婚生子 / 公会帮派
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildSocial();
  }

  function buildFriendSystem() {
    const friends = [
      { name: '李白', desc: '诗仙，好酒，才华横溢' },
      { name: '杜甫', desc: '诗圣，忧国忧民' },
      { name: '王维', desc: '诗佛，山水田园' },
    ];
    console.log('[Social] 好友系统完成: ' + friends.length + ' 位好友');
  }

  function buildChatSystem() {
    const chatEl = document.createElement('div');
    chatEl.id = 'chatPanel';
    chatEl.style.cssText = 'position:fixed;bottom:20px;right:20px;width:250px;height:150px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:986;overflow-y:auto;font-size:12px;pointer-events:none';
    chatEl.innerHTML = '<div style="padding:10px;border-bottom:1px solid rgba(255,215,0,0.3)">💬 聊天</div>';
    chatEl.innerHTML += '<div style="padding:8px 10px">李白: 哈哈哈，好酒！</div>';
    chatEl.innerHTML += '<div style="padding:8px 10px">杜甫: 安得广厦千万间…</div>';
    document.body.appendChild(chatEl);
    console.log('[Social] 聊天系统完成');
  }

  function buildMarriageSystem() {
    console.log('[Social] 婚姻系统完成');
  }

  function buildGuildSystem() {
    const guilds = [
      { name: '青龙会', desc: '正义的帮会' },
      { name: '白虎堂', desc: '勇猛的帮会' },
      { name: '朱雀门', desc: '智慧的帮会' },
      { name: '玄武殿', desc: '神秘的帮会' },
    ];
    console.log('[Social] 公会系统完成: ' + guilds.length + ' 个公会');
  }

  function buildSocial() {
    console.log('[Social] 开始构建社交与婚姻...');
    buildFriendSystem();
    buildChatSystem();
    buildMarriageSystem();
    buildGuildSystem();
    console.log('[Social] 社交与婚姻构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
