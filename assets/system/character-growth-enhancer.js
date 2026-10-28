/* ============================================================
   角色成长系统增强 v2.0
   等级、经验、属性、技能
   ============================================================ */

const CharacterGrowthEnhancer = {
  
  player: {
    level: 1,
    exp: 0,
    expToNext: 100,
    strength: 10,
    agility: 10,
    intelligence: 10,
    charm: 10,
    maxHp: 100,
    maxMp: 50,
    moveSpeed: 5,
  },
  
  skills: [],
  
  availableSkills: [
    { id: 'qinggong', name: '轻功', desc: '提升移动速度', level: 1, maxLevel: 5 },
    { id: 'jianfa', name: '剑法', desc: '基础剑术', level: 1, maxLevel: 10 },
    { id: 'yiquan', name: '拳法', desc: '基础拳脚', level: 1, maxLevel: 10 },
    { id: 'shufa', name: '书法', desc: '书法艺术', level: 1, maxLevel: 5 },
    { id: 'qixiang', name: '棋艺', desc: '围棋对弈', level: 1, maxLevel: 5 },
  ],
  
  attributePoints: 0,
  
  characterPanel: null,
  
  init() {
    this.loadProgress();
    this.createCharacterPanel();
    console.log('[Character] 角色成长系统初始化完成，等级:', this.player.level);
  },
  
  loadProgress() {
    const saved = localStorage.getItem('changan_character');
    if (saved) {
      const data = JSON.parse(saved);
      this.player = { ...this.player, ...data.player };
      this.attributePoints = data.attributePoints || 0;
    }
  },
  
  saveProgress() {
    localStorage.setItem('changan_character', JSON.stringify({
      player: this.player,
      attributePoints: this.attributePoints,
    }));
  },
  
  createCharacterPanel() {
    this.characterPanel = document.createElement('div');
    this.characterPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 700px;
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
    
    document.body.appendChild(this.characterPanel);
  },
  
  showCharacterPanel() {
    this.renderCharacterPanel();
    this.characterPanel.style.display = 'block';
  },
  
  closeCharacterPanel() {
    this.characterPanel.style.display = 'none';
  },
  
  renderCharacterPanel() {
    const p = this.player;
    const expPercent = (p.exp / p.expToNext * 100).toFixed(1);
    
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        ⚔️ 角色信息
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: bold; color: #ffd700;">Lv.${p.level}</div>
        <div style="margin-top: 10px; background: rgba(0,0,0,0.3); border-radius: 10px; height: 20px; overflow: hidden;">
          <div style="width: ${expPercent}%; height: 100%; background: linear-gradient(90deg, #d4af37, #ffd700); transition: width 0.3s;">
          </div>
        </div>
        <div style="margin-top: 5px; font-size: 12px; opacity: 0.8;">
          ${p.exp} / ${p.expToNext} 经验 (${expPercent}%)
        </div>
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">
          📊 属性
          ${this.attributePoints > 0 ? `<span style="float: right; color: #4CAF50; font-size: 14px;">+${this.attributePoints} 可分配</span>` : ''}
        </div>
    `;
    
    const attrs = [
      { key: 'strength', name: '力量', icon: '💪' },
      { key: 'agility', name: '敏捷', icon: '🏃' },
      { key: 'intelligence', name: '智力', icon: '📚' },
      { key: 'charm', name: '魅力', icon: '✨' },
    ];
    
    attrs.forEach(attr => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div>
            ${attr.icon} ${attr.name}
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-weight: bold;">${p[attr.key]}</div>
            ${this.attributePoints > 0 ? `<button onclick="CharacterGrowthEnhancer.addAttribute('${attr.key}')" style="width: 24px; height: 24px; border-radius: 50%; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content center;">+</button>` : ''}
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">
          🎯 技能
        </div>
    `;
    
    this.availableSkills.forEach(skill => {
      html += `
        <div style="padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold;">${skill.name} <span style="font-size: 12px; opacity: 0.7;">Lv.${skill.level}/${skill.maxLevel}</span></div>
              <div style="font-size: 12px; opacity: 0.7;">${skill.desc}</div>
            </div>
            ${skill.level < skill.maxLevel ? `<button onclick="CharacterGrowthEnhancer.upgradeSkill('${skill.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer; font-size: 12px;">升级</button>` : '<span style="color: #4CAF50;">已满级</span>'}
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="CharacterGrowthEnhancer.closeCharacterPanel()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer; font-size: 16px;">
          关闭
        </button>
      </div>
    `;
    
    this.characterPanel.innerHTML = html;
  },
  
  addAttribute(key) {
    if (this.attributePoints <= 0) return;
    
    this.player[key]++;
    this.attributePoints--;
    this.saveProgress();
    this.renderCharacterPanel();
    
    console.log('[Character] 属性提升:', key, '=', this.player[key]);
  },
  
  upgradeSkill(skillId) {
    const skill = this.availableSkills.find(s => s.id === skillId);
    if (!skill || skill.level >= skill.maxLevel) return;
    
    skill.level++;
    this.saveProgress();
    this.renderCharacterPanel();
    
    console.log('[Character] 技能升级:', skill.name, 'Lv.', skill.level);
  },
  
  gainExp(amount) {
    this.player.exp += amount;
    
    console.log('[Character] 获得经验:', amount, '总经验:', this.player.exp);
    
    while (this.player.exp >= this.player.expToNext) {
      this.player.exp -= this.player.expToNext;
      this.levelUp();
    }
    
    this.saveProgress();
  },
  
  levelUp() {
    this.player.level++;
    this.player.expToNext = Math.floor(this.player.expToNext * 1.5);
    this.attributePoints += 5;
    
    this.player.strength += 2;
    this.player.agility += 2;
    this.player.intelligence += 2;
    this.player.charm += 2;
    
    console.log('[Character] 升级！当前等级:', this.player.level);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('升级！', `你升到了 Lv.${this.player.level}！获得5点属性点`);
    }
  }
};

window.CharacterGrowthEnhancer = CharacterGrowthEnhancer;

console.log('[Character] 角色成长系统增强模块加载完成');
