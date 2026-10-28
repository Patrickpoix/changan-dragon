/* ============================================================
   战斗系统增强 v2.0
   战斗、技能、伤害、经验
   ============================================================ */

const CombatSystemEnhancer = {
  
  player: {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
  },
  
  skills: [
    { id: 'punch', name: '普通攻击', damage: 10, mpCost: 0, cooldown: 0 },
    { id: 'sword_slash', name: '挥剑', damage: 20, mpCost: 5, cooldown: 2 },
    { id: 'qinggong_dash', name: '轻功突进', damage: 15, mpCost: 10, cooldown: 5 },
    { id: 'poetry_attack', name: '诗朗诵攻击', damage: 30, mpCost: 20, cooldown: 10 },
  ],
  
  enemies: [],
  
  combatPanel: null,
  
  inCombat: false,
  
  init() {
    this.createCombatPanel();
    console.log('[Combat] 战斗系统初始化完成');
  },
  
  createCombatPanel() {
    this.combatPanel = document.createElement('div');
    this.combatPanel.style.cssText = `
      position: absolute;
      left: 20px;
      bottom: 80px;
      width: 300px;
      background: rgba(139, 69, 19, 0.95);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 15px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      display: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(this.combatPanel);
  },
  
  startCombat(enemy) {
    this.inCombat = true;
    this.currentEnemy = enemy;
    this.renderCombatPanel();
    
    console.log('[Combat] 开始战斗 vs', enemy.name);
  },
  
  endCombat(victory) {
    this.inCombat = false;
    this.combatPanel.style.display = 'none';
    
    if (victory) {
      console.log('[Combat] 战斗胜利！');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('战斗胜利！', `击败了 ${this.currentEnemy.name}！`);
      }
      
      if (window.CharacterGrowthEnhancer) {
        CharacterGrowthEnhancer.gainExp(this.currentEnemy.expReward);
      }
    } else {
      console.log('[Combat] 战斗失败...');
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.error('战斗失败...', '你被打败了...');
      }
    }
  },
  
  renderCombatPanel() {
    if (!this.inCombat || !this.currentEnemy) return;
    
    this.combatPanel.style.display = 'block';
    
    let html = `
      <div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 10px;">
        ⚔️ 战斗中
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>HP</span>
          <span>${this.player.hp} / ${this.player.maxHp}</span>
        </div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 5px; height: 10px; overflow: hidden;">
          <div style="width: ${this.player.hp / this.player.maxHp * 100}%; height: 100%; background: #4CAF50;"></div>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>MP</span>
          <span>${this.player.mp} / ${this.player.maxMp}</span>
        </div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 5px; height: 10px; overflow: hidden;">
          <div style="width: ${this.player.mp / this.player.maxMp * 100}%; height: 100%; background: #2196F3;"></div>
        </div>
      </div>
      
      <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
        <div style="font-weight: bold; text-align: center;">${this.currentEnemy.name}</div>
        <div style="font-size: 12px; text-align: center; margin-top: 5px;">
          HP: ${this.currentEnemy.hp} / ${this.currentEnemy.maxHp}
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
    `;
    
    this.skills.forEach(skill => {
      html += `
        <button onclick="CombatSystemEnhancer.useSkill('${skill.id}')" style="padding: 8px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer; font-size: 12px;">
          ${skill.name}
        </button>
      `;
    });
    
    html += `</div>`;
    
    this.combatPanel.innerHTML = html;
  },
  
  useSkill(skillId) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) return;
    
    if (this.player.mp < skill.mpCost) {
      console.log('[Combat] 法力不足');
      return;
    }
    
    this.player.mp -= skill.mpCost;
    
    console.log('[Combat] 使用技能:', skill.name, '伤害:', skill.damage);
    
    this.currentEnemy.hp -= skill.damage;
    
    setTimeout(() => {
      this.player.hp -= this.currentEnemy.attack;
      
      if (this.currentEnemy.hp <= 0) {
        this.endCombat(true);
      } else if (this.player.hp <= 0) {
        this.endCombat(false);
      } else {
        this.renderCombatPanel();
      }
    }, 500);
  }
};

window.CombatSystemEnhancer = CombatSystemEnhancer;

console.log('[Combat] 战斗系统增强模块加载完成');
