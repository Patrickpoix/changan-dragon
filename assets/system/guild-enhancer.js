/* ============================================================
   帮派系统增强 v2.0
   帮派创建、管理、成员、帮战
   ============================================================ */

const GuildSystemEnhancer = {
  
  myGuild: null,
  
  guildList: [
    { id: 1, name: '青莲剑派', leader: '李白', level: 5, members: 128, desc: '以诗剑闻名的门派' },
    { id: 2, name: '少林寺', leader: '玄奘', level: 8, members: 256, desc: '禅宗祖庭，武术圣地' },
    { id: 3, name: '武当派', leader: '张三丰', level: 6, members: 180, desc: '太极功夫，道家圣地' },
  ],
  
  guildPanel: null,
  
  init() {
    this.createGuildPanel();
    console.log('[Guild] 帮派系统初始化完成');
  },
  
  createGuildPanel() {
    this.guildPanel = document.createElement('div');
    this.guildPanel.style.cssText = `
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
    
    document.body.appendChild(this.guildPanel);
  },
  
  showGuildPanel() {
    this.renderGuildPanel();
    this.guildPanel.style.display = 'block';
  },
  
  closeGuildPanel() {
    this.guildPanel.style.display = 'none';
  },
  
  renderGuildPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏰 帮派系统
      </div>
    `;
    
    if (this.myGuild) {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">我的帮派</div>
          <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid #d4af37;">
            <div style="font-size: 18px; font-weight: bold; color: #ffd700;">${this.myGuild.name}</div>
            <div style="margin-top: 8px; opacity: 0.8;">
              帮主：${this.myGuild.leader} · 等级：Lv.${this.myGuild.level} · 成员：${this.myGuild.members}
            </div>
            <div style="margin-top: 8px; opacity: 0.7;">${this.myGuild.desc}</div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">帮派列表</div>
      `;
      
      this.guildList.forEach(guild => {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid #d4af37;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; color: #ffd700;">${guild.name}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">
                  帮主：${guild.leader} · Lv.${guild.level} · ${guild.members}人
                </div>
              </div>
              <button onclick="GuildSystemEnhancer.joinGuild(${guild.id})" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                加入
              </button>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="GuildSystemEnhancer.closeGuildPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.guildPanel.innerHTML = html;
  },
  
  joinGuild(guildId) {
    const guild = this.guildList.find(g => g.id === guildId);
    if (!guild) return;
    
    console.log('[Guild] 加入帮派:', guild.name);
    
    this.myGuild = guild;
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('加入成功', `你加入了 ${guild.name}！`);
    }
    
    this.renderGuildPanel();
  }
};

window.GuildSystemEnhancer = GuildSystemEnhancer;

console.log('[Guild] 帮派系统增强模块加载完成');
