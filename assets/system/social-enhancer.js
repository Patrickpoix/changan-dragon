/* ============================================================
   社交互动系统增强 v2.0
   好友、聊天、组队、公会
   ============================================================ */

const SocialSystemEnhancer = {
  
  friends: [
    { id: 1, name: '李白', level: 60, online: true, position: '曲江池' },
    { id: 2, name: '杜甫', level: 58, online: true, position: '大明宫' },
    { id: 3, name: '王维', level: 59, online: false, position: '辋川别业' },
    { id: 4, name: '白居易', level: 55, online: false, position: '履道坊' },
  ],
  
  channels: {
    world: { name: '世界', messages: [] },
    nearby: { name: '附近', messages: [] },
    guild: { name: '公会', messages: [] },
    private: { name: '私聊', messages: [] },
  },
  
  currentChannel: 'world',
  
  party: {
    members: [],
    leader: null,
  },
  
  socialPanel: null,
  
  init() {
    this.createSocialPanel();
    console.log('[Social] 社交系统初始化完成');
  },
  
  createSocialPanel() {
    this.socialPanel = document.createElement('div');
    this.socialPanel.style.cssText = `
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
    
    document.body.appendChild(this.socialPanel);
  },
  
  showSocialPanel(tab = 'friends') {
    this.renderSocialPanel(tab);
    this.socialPanel.style.display = 'block';
  },
  
  closeSocialPanel() {
    this.socialPanel.style.display = 'none';
  },
  
  renderSocialPanel(tab) {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        👥 社交中心
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="SocialSystemEnhancer.showSocialPanel('friends')" style="flex: 1; padding: 8px; background: ${tab === 'friends' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${tab === 'friends' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          好友
        </button>
        <button onclick="SocialSystemEnhancer.showSocialPanel('chat')" style="flex: 1; padding: 8px; background: ${tab === 'chat' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${tab === 'chat' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          聊天
        </button>
        <button onclick="SocialSystemEnhancer.showSocialPanel('party')" style="flex: 1; padding: 8px; background: ${tab === 'party' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${tab === 'party' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          组队
        </button>
        <button onclick="SocialSystemEnhancer.showSocialPanel('guild')" style="flex: 1; padding: 8px; background: ${tab === 'guild' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${tab === 'guild' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          公会
        </button>
      </div>
    `;
    
    if (tab === 'friends') {
      html += this.renderFriendsList();
    } else if (tab === 'chat') {
      html += this.renderChat();
    } else if (tab === 'party') {
      html += this.renderParty();
    } else if (tab === 'guild') {
      html += this.renderGuild();
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="SocialSystemEnhancer.closeSocialPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.socialPanel.innerHTML = html;
  },
  
  renderFriendsList() {
    let html = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">
        好友列表 (${this.friends.filter(f => f.online).length} 在线)
      </div>
    `;
    
    this.friends.forEach(friend => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${friend.online ? '#4CAF50' : '#666'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #d4af37; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;">
              ${friend.name[0]}
            </div>
            <div>
              <div style="font-weight: bold;">${friend.name}</div>
              <div style="font-size: 12px; opacity: 0.7;">
                Lv.${friend.level} · ${friend.online ? friend.position : '离线'}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="SocialSystemEnhancer.chatWith('${friend.name}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
              私聊
            </button>
            <button onclick="SocialSystemEnhancer.inviteToParty('${friend.name}')" style="padding: 5px 10px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">
              组队
            </button>
          </div>
        </div>
      `;
    });
    
    return html;
  },
  
  renderChat() {
    return `
      <div style="height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
        <div style="margin-bottom: 10px; color: #87ceeb;">[世界] 李白: 曲江池的荷花真美啊！</div>
        <div style="margin-bottom: 10px; color: #87ceeb;">[世界] 杜甫: 正是江南好风景，落花时节又逢君。</div>
        <div style="margin-bottom: 10px; color: #ffb6c1;">[附近] 小贩: 客官，看看上好的唐三彩！</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <input type="text" id="chat-input" placeholder="输入消息..." style="flex: 1; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 6px;">
        <button onclick="SocialSystemEnhancer.sendMessage()" style="padding: 10px 20px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer;">
          发送
        </button>
      </div>
    `;
  },
  
  renderParty() {
    return `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">⚔️</div>
        <div style="font-size: 18px; margin-bottom: 10px;">你还没有组队</div>
        <div style="opacity: 0.7; margin-bottom: 20px;">邀请好友一起探索长安城吧！</div>
        <button onclick="SocialSystemEnhancer.createParty()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer;">
          创建队伍
        </button>
      </div>
    `;
  },
  
  renderGuild() {
    return `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🏰</div>
        <div style="font-size: 18px; margin-bottom: 10px;">你还没有加入公会</div>
        <div style="opacity: 0.7; margin-bottom: 20px;">加入一个公会，和志同道合的朋友一起闯荡长安！</div>
        <button onclick="SocialSystemEnhancer.browseGuilds()" style="padding: 10px 30px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer;">
          浏览公会
        </button>
      </div>
    `;
  },
  
  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    console.log('[Social] 发送消息:', message);
    input.value = '';
  },
  
  chatWith(name) {
    console.log('[Social] 与', name, '私聊');
  },
  
  inviteToParty(name) {
    console.log('[Social] 邀请', name, '组队');
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.info('组队邀请', `已向 ${name} 发送组队邀请`);
    }
  },
  
  createParty() {
    console.log('[Social] 创建队伍');
  },
  
  browseGuilds() {
    console.log('[Social] 浏览公会');
  }
};

window.SocialSystemEnhancer = SocialSystemEnhancer;

console.log('[Social] 社交互动系统增强模块加载完成');
