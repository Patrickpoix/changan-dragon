/* ============================================================
   技能树系统增强 v2.0
   技能树、天赋、加点、解锁
   ============================================================ */

const SkillTreeEnhancer = {
  
  branches: {
    martial: {
      name: '武学',
      icon: '⚔️',
      skills: [
        { id: 'basic_sword', name: '基础剑法', desc: '学习基本的剑术', level: 0, maxLevel: 5, cost: 1 },
        { id: 'advanced_sword', name: '高级剑法', desc: '进阶剑术', level: 0, maxLevel: 5, cost: 2, requires: 'basic_sword' },
        { id: 'sword_mastery', name: '剑术精通', desc: '精通剑术', level: 0, maxLevel: 3, cost: 3, requires: 'advanced_sword' },
      ],
    },
    literature: {
      name: '文学',
      icon: '📚',
      skills: [
        { id: 'poetry', name: '诗词', desc: '学习作诗', level: 0, maxLevel: 5, cost: 1 },
        { id: 'calligraphy', name: '书法', desc: '练习书法', level: 0, maxLevel: 5, cost: 1, requires: 'poetry' },
        { id: 'painting', name: '绘画', desc: '学习绘画', level: 0, maxLevel: 3, cost: 2, requires: 'calligraphy' },
      ],
    },
    qinggong: {
      name: '轻功',
      icon: '🏃',
      skills: [
        { id: 'basic_qinggong', name: '基础轻功', desc: '学习基本的轻功', level: 0, maxLevel: 5, cost: 1 },
        { id: 'advanced_qinggong', name: '高级轻功', desc: '进阶轻功', level: 0, maxLevel: 5, cost: 2, requires: 'basic_qinggong' },
        { id: 'fly', name: '飞行', desc: '御空飞行', level: 0, maxLevel: 1, cost: 5, requires: 'advanced_qinggong' },
      ],
    },
  },
  
  skillPoints: 3,
  
  skillTreePanel: null,
  
  init() {
    this.createSkillTreePanel();
    console.log('[SkillTree] 技能树系统初始化完成，可用技能点:', this.skillPoints);
  },
  
  createSkillTreePanel() {
    this.skillTreePanel = document.createElement('div');
    this.skillTreePanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
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
    
    document.body.appendChild(this.skillTreePanel);
  },
  
  showSkillTreePanel() {
    this.renderSkillTreePanel();
    this.skillTreePanel.style.display = 'block';
  },
  
  closeSkillTreePanel() {
    this.skillTreePanel.style.display = 'none';
  },
  
  renderSkillTreePanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🌳 技能树
        <span style="float: right; font-size: 16px; color: #4CAF50;">可用技能点: ${this.skillPoints}</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
    `;
    
    for (const branchKey in this.branches) {
      const branch = this.branches[branchKey];
      
      html += `
        <div>
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center; color: #ffd700;">
            ${branch.icon} ${branch.name}
          </div>
      `;
      
      branch.skills.forEach(skill => {
        const canUpgrade = this.skillPoints >= skill.cost && skill.level < skill.maxLevel && this.checkRequirement(skill);
        
        html += `
          <div style="padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${skill.level > 0 ? '#4CAF50' : '#666'};">
            <div style="font-weight: bold; margin-bottom: 5px;">${skill.name}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;">${skill.desc}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 12px;">Lv.${skill.level}/${skill.maxLevel}</div>
              ${skill.level < skill.maxLevel ? `<button onclick="SkillTreeEnhancer.upgradeSkill('${branchKey}', '${skill.id}')" ${canUpgrade ? '' : 'disabled'} style="padding: 4px 8px; background: ${canUpgrade ? '#d4af37' : '#666'}; border: none; color: #000; border-radius: 4px; cursor: ${canUpgrade ? 'pointer' : 'not-allowed'}; font-size: 11px;">
                ${skill.cost} 点升级
              </button>` : '<span style="color: #4CAF50; font-size: 12px;">已满级</span>'}
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="SkillTreeEnhancer.closeSkillTreePanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.skillTreePanel.innerHTML = html;
  },
  
  checkRequirement(skill) {
    if (!skill.requires) return true;
    
    for (const branchKey in this.branches) {
      const requiredSkill = this.branches[branchKey].skills.find(s => s.id === skill.requires);
      if (requiredSkill) {
        return requiredSkill.level > 0;
      }
    }
    
    return false;
  },
  
  upgradeSkill(branchKey, skillId) {
    const branch = this.branches[branchKey];
    if (!branch) return;
    
    const skill = branch.skills.find(s => s.id === skillId);
    if (!skill) return;
    
    if (this.skillPoints < skill.cost) {
      console.log('[SkillTree] 技能点不足');
      return;
    }
    
    if (skill.level >= skill.maxLevel) return;
    
    if (!this.checkRequirement(skill)) {
      console.log('[SkillTree] 需要先学习前置技能');
      return;
    }
    
    this.skillPoints -= skill.cost;
    skill.level++;
    
    console.log('[SkillTree] 升级技能:', skill.name, 'Lv.', skill.level);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('技能升级', `${skill.name} 升到了 Lv.${skill.level}！`);
    }
    
    this.renderSkillTreePanel();
  }
};

window.SkillTreeEnhancer = SkillTreeEnhancer;

console.log('[SkillTree] 技能树系统增强模块加载完成');
