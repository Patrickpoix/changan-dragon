/* ============================================================
   战斗技能装备掉落经验升级系统增强 v2.0
   战斗、技能、装备掉落、经验升级
   ============================================================ */

const CombatLootEnhancer = {
  
  playerExp: 0,
  playerLevel: 1,
  expToNextLevel: 100,
  
  playerGold: 500,
  
  obtainedEquipment: [],
  
  lootTable: {
    'wolf': {
      exp: 20,
      gold: 10,
      drops: [
        { id: 'wolf_fur', name: '狼皮', chance: 0.8, price: 5 },
        { id: 'wolf_fang', name: '狼牙', chance: 0.3, price: 15 },
      ],
    },
    'bandit': {
      exp: 30,
      gold: 20,
      drops: [
        { id: 'rusty_sword', name: '生锈的剑', chance: 0.5, price: 30 },
        { id: 'old_armor', name: '旧盔甲', chance: 0.4, price: 25 },
      ],
    },
    'bandit_leader': {
      exp: 100,
      gold: 100,
      drops: [
        { id: 'iron_sword', name: '铁剑', chance: 0.3, price: 100 },
        { id: 'steel_armor', name: '钢甲', chance: 0.2, price: 150 },
        { id: 'rare_gem', name: '稀有宝石', chance: 0.1, price: 500 },
      ],
    },
  },
  
  lootPanel: null,
  
  init() {
    this.createLootPanel();
    console.log('[Loot] 战斗技能装备掉落经验升级系统初始化完成，等级:', this.playerLevel);
  },
  
  createLootPanel() {
    this.lootPanel = document.createElement('div');
    this.lootPanel.style.cssText = `
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
    
    document.body.appendChild(this.lootPanel);
  },
  
  showLootPanel() {
    this.renderLootPanel();
    this.lootPanel.style.display = 'block';
  },
  
  closeLootPanel() {
    this.lootPanel.style.display = 'none';
  },
  
  renderLootPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        ⚔️ 战斗与掉落
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #d4af37;">Lv.${this.playerLevel}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">玩家等级</div>
          <div style="margin-top: 10px; background: rgba(0,0,0,0.3); border-radius: 5px; height: 10px; overflow: hidden;">
            <div style="width: ${this.playerExp / this.expToNextLevel * 100}%; height: 100%; background: #4CAF50;"></div>
          </div>
          <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">${this.playerExp} / ${this.expToNextLevel} 经验</div>
        </div>
        
        <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #FFD700;">${this.playerGold}</div>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">金币</div>
          <div style="font-size: 11px; opacity: 0.6; margin-top: 10px;">已获得装备：${this.obtainedEquipment.length} 件</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">怪物掉落表</div>
    `;
    
    for (const monsterId in this.lootTable) {
      const monster = this.lootTable[monsterId];
      
      html += `
        <div style="padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #ff6b6b;">
          <div style="font-weight: bold; color: #ff6b6b; margin-bottom: 8px;">${monsterId.replace('_', ' ').toUpperCase()}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">
            经验：${monster.exp} · 金币：${monster.gold}
          </div>
          <div style="font-size: 12px;">
            <div style="opacity: 0.7; margin-bottom: 5px;">掉落物品：</div>
      `;
      
      monster.drops.forEach(drop => {
        html += `
          <div style="padding: 4px 8px; margin-bottom: 3px; background: rgba(0,0,0,0.15); border-radius: 4px; display: flex; justify-content: space-between;">
            <span>${drop.name}</span>
            <span style="opacity: 0.6;">${Math.round(drop.chance * 100)}% · ${drop.price}文</span>
          </div>
        `;
      });
      
      html += `</div></div>`;
    }
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="CombatLootEnhancer.closeLootPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.lootPanel.innerHTML = html;
  },
  
  gainExp(amount) {
    this.playerExp += amount;
    
    console.log('[Loot] 获得经验:', amount, '总经验:', this.playerExp);
    
    while (this.playerExp >= this.expToNextLevel) {
      this.playerExp -= this.expToNextLevel;
      this.playerLevel++;
      this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
      
      console.log('[Loot] 升级！等级:', this.playerLevel);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('升级！', `你升到了 Lv.${this.playerLevel}！`);
      }
    }
  },
  
  killMonster(monsterId) {
    const monster = this.lootTable[monsterId];
    if (!monster) return;
    
    this.gainExp(monster.exp);
    this.playerGold += monster.gold;
    
    monster.drops.forEach(drop => {
      if (Math.random() < drop.chance) {
        this.obtainedEquipment.push(drop);
        
        console.log('[Loot] 掉落物品:', drop.name);
        
        if (window.NotificationSystemEnhancer) {
          NotificationSystemEnhancer.info('获得物品', `你获得了 ${drop.name}！`);
        }
      }
    });
  }
};

window.CombatLootEnhancer = CombatLootEnhancer;

console.log('[Loot] 战斗技能装备掉落经验升级系统增强模块加载完成');
