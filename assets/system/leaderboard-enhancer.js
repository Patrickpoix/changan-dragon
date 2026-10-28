/* ============================================================
   排行榜系统增强 v2.0
   排行榜、排名、称号、奖励
   ============================================================ */

const LeaderboardEnhancer = {
  
  categories: [
    { id: 'level', name: '等级榜', icon: '⚔️' },
    { id: 'wealth', name: '财富榜', icon: '💰' },
    { id: 'exploration', name: '探索榜', icon: '🗺️' },
    { id: 'achievement', name: '成就榜', icon: '🏆' },
  ],
  
  rankings: {
    level: [
      { rank: 1, name: '李白', level: 60, title: '诗仙' },
      { rank: 2, name: '杜甫', level: 58, title: '诗圣' },
      { rank: 3, name: '王维', level: 57, title: '诗佛' },
      { rank: 4, name: '白居易', level: 55, title: '诗魔' },
      { rank: 5, name: '我', level: 1, title: '新手' },
    ],
    wealth: [
      { rank: 1, name: '王元宝', level: 60, title: '长安首富' },
      { rank: 2, name: '邹凤炽', level: 58, title: '巨富' },
      { rank: 3, name: '我', level: 1, title: '小康' },
    ],
    exploration: [
      { rank: 1, name: '徐霞客', level: 60, title: '走遍天下' },
      { rank: 2, name: '我', level: 1, title: '初来乍到' },
    ],
    achievement: [
      { rank: 1, name: '李白', level: 60, title: '成就大师' },
      { rank: 2, name: '我', level: 1, title: '初学者' },
    ],
  },
  
  currentCategory: 'level',
  
  leaderboardPanel: null,
  
  init() {
    this.createLeaderboardPanel();
    console.log('[Leaderboard] 排行榜系统初始化完成');
  },
  
  createLeaderboardPanel() {
    this.leaderboardPanel = document.createElement('div');
    this.leaderboardPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
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
    
    document.body.appendChild(this.leaderboardPanel);
  },
  
  showLeaderboardPanel() {
    this.renderLeaderboardPanel();
    this.leaderboardPanel.style.display = 'block';
  },
  
  closeLeaderboardPanel() {
    this.leaderboardPanel.style.display = 'none';
  },
  
  renderLeaderboardPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏆 排行榜
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
    `;
    
    this.categories.forEach(cat => {
      html += `
        <button onclick="LeaderboardEnhancer.setCategory('${cat.id}')" style="flex: 1; padding: 8px; background: ${this.currentCategory === cat.id ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentCategory === cat.id ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          ${cat.icon} ${cat.name}
        </button>
      `;
    });
    
    html += `</div>`;
    
    const data = this.rankings[this.currentCategory];
    
    data.forEach(item => {
      const rankColors = {
        1: '#FFD700',
        2: '#C0C0C0',
        3: '#CD7F32',
      };
      
      const isMe = item.name === '我';
      
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: ${isMe ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.2)'}; border-radius: 6px; border-left: 4px solid ${rankColors[item.rank] || '#666'};">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 30px; text-align: center; font-weight: bold; color: ${rankColors[item.rank] || '#fff'};">
              ${item.rank}
            </div>
            <div>
              <div style="font-weight: bold; ${isMe ? 'color: #d4af37;' : ''}">${item.name}</div>
              <div style="font-size: 12px; opacity: 0.7;">${item.title}</div>
            </div>
          </div>
          <div style="font-weight: bold;">
            Lv.${item.level}
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="LeaderboardEnhancer.closeLeaderboardPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.leaderboardPanel.innerHTML = html;
  },
  
  setCategory(catId) {
    this.currentCategory = catId;
    this.renderLeaderboardPanel();
  }
};

window.LeaderboardEnhancer = LeaderboardEnhancer;

console.log('[Leaderboard] 排行榜系统增强模块加载完成');
