/* ============================================================
   技能系统增强 — 文武双全
   v1: 技能、法术、技能树
   ============================================================ */

(function() {
  'use strict';
  
  let skills = [];
  let skillPoints = 0;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Skills] 开始增强技能系统...']);
    
    loadSkills();
    setupSkillUI();
    addSkills();
    
    console.log('[Skills] ✓ 技能系统增强完成');
  }
  
  // 加载技能
  function loadSkills() {
    try {
      const saved = localStorage.getItem('changan-dragon-skills');
      if (saved) {
        const data = JSON.parse(saved);
        skills = data.skills || [];
        skillPoints = data.skillPoints || 0;
        console.log('[Skills] 技能已加载，已学 ' + skills.length + ' 个');
      }
    } catch(e) {
      console.warn('[Skills] 加载技能失败', e);
    }
  }
  
  // 保存技能
  function saveSkills() {
    try {
      localStorage.setItem('changan-dragon-skills', JSON.stringify({
        skills: skills,
        skillPoints: skillPoints
      }));
    } catch(e) {
      console.warn('[Skills] 保存技能失败', e);
    }
  }
  
  // 技能UI
  function setupSkillUI() {
    // K键打开技能
    document.addEventListener('keydown', (e) => {
      if (e.key === 'k' || e.key === 'K') {
        showSkills();
      }
    });
    
    console.log('[Skills] 技能UI已就绪，按K打开');
  }
  
  // 添加技能
  function addSkills() {
    const allSkills = [
      { id: 'skill-1', name: '剑术', type: 'combat', icon: '⚔️', level: 1, maxLevel: 5 },
      { id: 'skill-2', name: '箭术', type: 'combat', icon: '🏹', level: 1, maxLevel: 5 },
      { id: 'skill-3', name: '骑马', type: 'movement', icon: '🐎', level: 1, maxLevel: 3 },
      { id: 'skill-4', name: '飞行', type: 'movement', icon: '✈️', level: 1, maxLevel: 3 },
      { id: 'skill-5', name: '吟诗', type: 'social', icon: '📜', level: 1, maxLevel: 5 },
      { id: 'skill-6', name: '作画', type: 'social', icon: '🎨', level: 1, maxLevel: 5 },
      { id: 'skill-7', name: '书法', type: 'social', icon: '✍️', level: 1, maxLevel: 5 },
      { id: 'skill-8', name: '茶道', type: 'life', icon: '🍵', level: 1, maxLevel: 3 }
    ];
    
    // 只添加未学习的
    allSkills.forEach(s => {
      if (!skills.find(x => x.id === s.id)) {
        skills.push(s);
      }
    });
    
    saveSkills();
    console.log('[Skills] 技能已添加，共 ' + skills.length + ' 个');
  }
  
  // 显示技能
  function showSkills() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '450px';
    
    let skillsHTML = '';
    skills.forEach(skill => {
      skillsHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px;">
          <span style="font-size: 24px;">${skill.icon}</span>
          <div style="flex: 1; margin: 0 15px;">
            <h4 style="color: #ffd700; margin-bottom: 3px;">${skill.name}</h4>
            <p style="color: #999; font-size: 12px;">Lv.${skill.level} / ${skill.maxLevel}</p>
          </div>
          <button onclick="window.GameSkills.upgrade('${skill.id}')" style="padding: 6px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">升级</button>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">✨ 技能</h3>
      <p style="color: #ffd700; text-align: center; margin-bottom: 15px;">技能点: ${skillPoints}</p>
      <div style="max-height: 350px; overflow-y: auto;">
        ${skillsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeSkillsBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeSkillsBtn').onclick = () => {
      menu.remove();
    };
  }
  
  // 升级技能
  function upgrade(skillId) {
    if (skillPoints > 0) {
      const skill = skills.find(s => s.id === skillId);
      if (skill && skill.level < skill.maxLevel) {
        skill.level++;
        skillPoints--;
        saveSkills();
        showToast('技能升级: ' + skill.name + ' Lv.' + skill.level);
      } else {
        showToast('技能已满级');
      }
    } else {
      showToast('技能点不足');
    }
  }
  
  // 工具函数
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'absolute';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#ffd700';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  init();
  
  // 暴露给其他模块
  window.GameSkills = {
    upgrade: upgrade,
    addSkillPoint: () => { skillPoints++; saveSkills(); },
    getSkills: () => [...skills]
  };
})();
