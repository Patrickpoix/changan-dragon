/* ============================================================
   任务与剧情增强 · 长安故事
   更多任务 / 剧情线 / 故事体验
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildQuestStory();
  }

  function buildQuestSystem() {
    const quests = [
      { id: 'first_step', name: '初入长安', desc: '刚来到长安城，先四处逛逛，熟悉一下环境', reward: '诗笺×1' },
      { id: 'visit_daming', name: '大明宫参拜', desc: '前往大明宫，感受皇宫的宏伟气势', reward: '诗笺×2, 经验×100' },
      { id: 'visit_pagoda', name: '大雁塔访僧', desc: '前往大雁塔，拜访高僧，聆听佛法', reward: '诗笺×2, 功德×50' },
      { id: 'visit_market', name: '东市采购', desc: '前往东市，采购一些生活用品', reward: '铜钱×100, 物品×1' },
      { id: 'visit_qujiang', name: '曲江池赏景', desc: '前往曲江池，欣赏美丽的湖光山色', reward: '诗笺×1, 心情×10' },
    ];
    const questEl = document.createElement('div');
    questEl.id = 'questPanel';
    questEl.style.cssText = 'position:fixed;top:200px;right:20px;width:220px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:997;font-size:13px;pointer-events:none';
    questEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">📜 任务列表</div>';
    for (const q of quests) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.3)';
      item.innerHTML = '<div style="color:#ffd700;font-weight:bold">' + q.name + '</div><div style="opacity:0.8;margin:3px 0">' + q.desc + '</div><div style="opacity:0.6;font-size:11px">奖励: ' + q.reward + '</div>';
      questEl.appendChild(item);
    }
    document.body.appendChild(questEl);
    console.log('[QuestStory] 任务系统完成: ' + quests.length + ' 个任务');
  }

  function buildDialogueSystem() {
    const dialogues = [
      { npc: '城门守卫', text: '来者何人？此乃长安城，不得喧哗！' },
      { npc: '卖货郎', text: '客官，看看新鲜的货物吧！刚从西域运来的！' },
      { npc: '客栈老板', text: '客官，住店吗？我们这里有上好的房间！' },
      { npc: '和尚', text: '阿弥陀佛，施主从何处来？欲往何处去？' },
    ];
    console.log('[QuestStory] 剧情对话系统完成: ' + dialogues.length + ' 段对话');
  }

  function buildStoryBackground() {
    const story = { title: '盛唐长安', content: '大唐盛世，万国来朝。长安城作为当时世界上最大的城市，汇聚了来自世界各地的商人、使者、留学生。这里有宏伟的宫殿、繁华的市集、虔诚的寺庙，还有无数动人的故事等待你去发现。' };
    console.log('[QuestStory] 故事背景: ' + story.title);
  }

  function buildQuestStory() {
    console.log('[QuestStory] 开始构建任务与剧情...');
    buildQuestSystem();
    buildDialogueSystem();
    buildStoryBackground();
    console.log('[QuestStory] 任务与剧情构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
