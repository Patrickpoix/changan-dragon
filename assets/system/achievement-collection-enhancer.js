/* ============================================================
   成就图鉴系统增强 v2.0
   成就收集、图鉴系统、收藏展示
   ============================================================ */

const AchievementCollectionEnhancer = {
  
  categories: {
    exploration: {
      name: '探索成就',
      icon: '🗺️',
      achievements: [
        { id: 'first_step', name: '初入长安', desc: '第一次进入长安城', reward: 10 },
        { id: 'all_landmarks', name: '走遍长安', desc: '参观所有地标建筑', reward: 100 },
        { id: 'all_fang', name: '百坊漫游', desc: '走过108坊中的100个', reward: 200 },
      ],
    },
    collection: {
      name: '收集成就',
      icon: '📜',
      achievements: [
        { id: 'first_poem', name: '诗初成', desc: '收集第一首诗笺', reward: 20 },
        { id: 'all_poems', name: '诗仙', desc: '收集所有诗笺', reward: 200 },
        { id: 'first_relic', name: '初获珍宝', desc: '获得第一件文物', reward: 30 },
      ],
    },
    social: {
      name: '社交成就',
      icon: '👥',
      achievements: [
        { id: 'first_friend', name: '结识好友', desc: '添加第一个好友', reward: 15 },
        { id: 'ten_friends', name: '广结善缘', desc: '添加10个好友', reward: 50 },
      ],
    },
    challenge: {
      name: '挑战成就',
      icon: '⚔️',
      achievements: [
        { id: 'fly_high', name: '高飞', desc: '飞行到100米高空', reward: 25 },
        { id: 'speed_run', name: '极速', desc: '10分钟内跑完长安城', reward: 100 },
      ],
    },
  },
  
  unlocked: new Set(),
  
  collections: {
    landmarks: {
      name: '长安地标图鉴',
      items: [
        { id: 'daming', name: '大明宫', discovered: false },
        { id: 'taiji', name: '太极宫', discovered: false },
        { id: 'dayanta', name: '大雁塔', discovered: false },
        { id: 'xiaoyanta', name: '小雁塔', discovered: false },
        { id: 'qujiangchi', name: '曲江池', discovered: false },
        { id: 'mingdemen', name: '明德门', discovered: false },
      ],
    },
    foods: {
      name: '长安美食图鉴',
      items: [
        { id: 'hucake', name: '胡饼', discovered: false },
        { id: 'tangbao', name: '汤包', discovered: false },
        { id: 'yuanyang', name: '鸳鸯脍', discovered: false },
        { id: 'bihuoluo', name: '毕罗', discovered: false },
      ],
    },
  },
  
  collectionPanel: null,
  
  init() {
    this.loadProgress();
    this.createCollectionPanel();
    console.log('[Collection] 成就图鉴系统初始化完成');
  },
  
  loadProgress() {
    const saved = localStorage.getItem('changan_collection');
    if (saved) {
      const data = JSON.parse(saved);
      this.unlocked = new Set(data.unlocked || []);
    }
  },
  
  saveProgress() {
    localStorage.setItem('changan_collection', JSON.stringify({
      unlocked: Array.from(this.unlocked),
    }));
  },
  
  createCollectionPanel() {
    this.collectionPanel = document.createElement('div');
    this.collectionPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
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
    
    document.body.appendChild(this.collectionPanel);
  },
  
  showCollectionPanel() {
    this.renderCollection();
    this.collectionPanel.style.display = 'block';
  },
  
  closeCollectionPanel() {
    this.collectionPanel.style.display = 'none';
  },
  
  renderCollection() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏆 成就与图鉴
      </div>
    `;
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #ffd700;">
        🏅 成就解锁
        <span style="float: right; font-size: 14px; opacity: 0.8;">
          已解锁 ${this.unlocked.size} / ${this.countTotalAchievements()}
        </span>
      </div>
    `;
    
    for (const catKey in this.categories) {
      const cat = this.categories[catKey];
      
      html += `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">
            ${cat.icon} ${cat.name}
          </div>
      `;
      
      cat.achievements.forEach(ach => {
        const isUnlocked = this.unlocked.has(ach.id);
        
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${isUnlocked ? '#4CAF50' : '#666'};">
            <div>
              <div style="font-weight: bold; ${isUnlocked ? '' : 'opacity: 0.5;'}">
                ${isUnlocked ? '✅' : '🔒'} ${ach.name}
              </div>
              <div style="font-size: 12px; opacity: 0.7;">${ach.desc}</div>
            </div>
            <div style="font-size: 12px; color: #ffd700;">
              +${ach.reward} 成就点
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
      <div style="font-size: 18px; font-weight: bold; margin: 20px 0 15px 0; color: #87ceeb;">
        📚 图鉴收藏
      </div>
    `;
    
    for (const collKey in this.collections) {
      const coll = this.collections[collKey];
      const discoveredCount = coll.items.filter(i => i.discovered).length;
      
      html += `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            ${coll.name}
            <span style="float: right; font-size: 12px; opacity: 0.8;">
              ${discoveredCount} / ${coll.items.length}
            </span>
          </div>
      `;
      
      coll.items.forEach(item => {
        html += `
          <div style="display: inline-block; width: 45%; padding: 8px; margin: 2px; background: rgba(0,0,0,0.2); border-radius: 6px; text-align: center;">
            <div style="${item.discovered ? '' : 'filter: brightness(0);'}">
              ${item.discovered ? '🏛️' : '❓'}
            </div>
            <div style="font-size: 12px; margin-top: 5px; ${item.discovered ? '' : 'opacity: 0.5;'}">
              ${item.discovered ? item.name : '???'}
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="AchievementCollectionEnhancer.closeCollectionPanel()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer; font-size: 16px;">
          关闭
        </button>
      </div>
    `;
    
    this.collectionPanel.innerHTML = html;
  },
  
  countTotalAchievements() {
    let total = 0;
    for (const catKey in this.categories) {
      total += this.categories[catKey].achievements.length;
    }
    return total;
  },
  
  unlockAchievement(achId) {
    if (this.unlocked.has(achId)) return;
    
    this.unlocked.add(achId);
    this.saveProgress();
    
    let achName = '';
    for (const catKey in this.categories) {
      const ach = this.categories[catKey].achievements.find(a => a.id === achId);
      if (ach) {
        achName = ach.name;
        break;
      }
    }
    
    console.log('[Collection] 解锁成就:', achName);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.achievement(`解锁成就：${achName}`);
    }
  },
  
  discoverCollection(collKey, itemId) {
    const coll = this.collections[collKey];
    if (!coll) return;
    
    const item = coll.items.find(i => i.id === itemId);
    if (item && !item.discovered) {
      item.discovered = true;
      console.log('[Collection] 发现图鉴:', item.name);
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.info(`发现新图鉴：${item.name}`);
      }
    }
  }
};

window.AchievementCollectionEnhancer = AchievementCollectionEnhancer;

console.log('[Collection] 成就图鉴系统增强模块加载完成');
