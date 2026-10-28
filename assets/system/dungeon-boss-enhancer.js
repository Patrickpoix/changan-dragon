/* ============================================================
   副本BOSS挑战系统增强 v2.0
   副本、BOSS、挑战、奖励
   ============================================================ */

const DungeonBossEnhancer = {
  
  dungeons: [
    {
      id: 'dungeon_1',
      name: '曲江池秘境',
      desc: '曲江池深处隐藏着神秘的秘境',
      recommendedLevel: 10,
      boss: { name: '池底妖王', hp: 500, attack: 30 },
      rewards: { exp: 200, gold: 100, item: '秘境宝箱' },
      completed: false,
    },
    {
      id: 'dungeon_2',
      name: '大雁塔地宫',
      desc: '大雁塔地下深藏着古老的地宫',
      recommendedLevel: 20,
      boss: { name: '地宫守护兽', hp: 1000, attack: 50 },
      rewards: { exp: 500, gold: 300, item: '地宫秘宝' },
      completed: false,
    },
    {
      id: 'dungeon_3',
      name: '大明宫秘道',
      desc: '大明宫之下有不为人知的秘道',
      recommendedLevel: 30,
      boss: { name: '秘道暗影', hp: 2000, attack: 80 },
      rewards: { exp: 1000, gold: 500, item: '皇家珍宝' },
      completed: false,
    },
  ],
  
  dungeonPanel: null,
  
  init() {
    this.createDungeonPanel();
    console.log('[Dungeon] 副本BOSS挑战系统初始化完成');
  },
  
  createDungeonPanel() {
    this.dungeonPanel = document.createElement('div');
    this.dungeonPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.98);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 2000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    `;
    
    document.body.appendChild(this.dungeonPanel);
  },
  
  showDungeonPanel() {
    this.renderDungeonPanel();
    this.dungeonPanel.style.display = 'block';
  },
  
  closeDungeonPanel() {
    this.dungeonPanel.style.display = 'none';
  },
  
  renderDungeonPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏰 副本挑战
      </div>
    `;
    
    this.dungeons.forEach(dungeon => {
      html += `
        <div style="padding: 15px; margin-bottom: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid ${dungeon.completed ? '#4CAF50' : '#ff6b6b'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-weight: bold; font-size: 16px; color: ${dungeon.completed ? '#4CAF50' : '#ff6b6b'}">${dungeon.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">推荐等级: Lv.${dungeon.recommendedLevel}</div>
            </div>
            ${dungeon.completed ? '<span style="color: #4CAF50;">✓ 已通关</span>' : `<button onclick="DungeonBossEnhancer.enterDungeon('${dungeon.id}')" style="padding: 8px 16px; background: #ff6b6b; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
              进入副本
            </button>`}
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${dungeon.desc}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">
            BOSS: ${dungeon.boss.name} (HP: ${dungeon.boss.hp}, 攻击: ${dungeon.boss.attack})
          </div>
          <div style="font-size: 12px; opacity: 0.6;">
            奖励: 经验${dungeon.rewards.exp} · 金币${dungeon.rewards.gold} · ${dungeon.rewards.item}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="DungeonBossEnhancer.closeDungeonPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.dungeonPanel.innerHTML = html;
  },
  
  enterDungeon(dungeonId) {
    const dungeon = this.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    
    console.log('[Dungeon] 进入副本:', dungeon.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.info('副本挑战', `你进入了 ${dungeon.name}，BOSS ${dungeon.boss.name} 在等着你！`);
    }
    
    dungeon.completed = true;
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('通关成功！', `你击败了 ${dungeon.boss.name}！获得了 ${dungeon.rewards.item}！`);
    }
    
    this.renderDungeonPanel();
  }
};

window.DungeonBossEnhancer = DungeonBossEnhancer;

console.log('[Dungeon] 副本BOSS挑战系统增强模块加载完成');
