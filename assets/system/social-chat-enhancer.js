/* ============================================================
   好友聊天组队公会社交系统增强 v2.0
   好友列表、聊天、组队、公会社交
   ============================================================ */

const SocialChatEnhancer = {
  
  friends: [
    { id: 'libai', name: '李白', level: 60, online: true, status: '曲江池饮酒中' },
    { id: 'dufu', name: '杜甫', level: 58, online: true, status: '长安城漫游中' },
    { id: 'wangwei', name: '王维', level: 57, online: false, status: '昨天在线' },
    { id: 'baijuyi', name: '白居易', level: 55, online: false, status: '3天前在线' },
  ],
  
  chatHistory: [
    { from: '李白', text: '贤弟，来曲江池喝酒？', time: '10:30' },
    { from: '我', text: '好啊，马上到！', time: '10:31' },
    { from: '杜甫', text: '两位贤弟，等等我！', time: '10:32' },
  ],
  
  party: ['我', '李白', '杜甫'],
  
  socialPanel: null,
  
  currentTab: 'friends',
  
  init() {
    this.createSocialPanel();
    console.log('[Social] 好友聊天组队公会社交系统初始化完成');
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
  
  showSocialPanel() {
    this.renderSocialPanel();
    this.socialPanel.style.display = 'block';
  },
  
  closeSocialPanel() {
    this.socialPanel.style.display = 'none';
  },
  
  renderSocialPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        💬 社交系统
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">
        <button onclick="SocialChatEnhancer.setTab('friends')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'friends' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'friends' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          好友 (${this.friends.length})
        </button>
        <button onclick="SocialChatEnhancer.setTab('chat')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'chat' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'chat' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          聊天
        </button>
        <button onclick="SocialChatEnhancer.setTab('party')" style="flex: 1; padding: 8px; background: ${this.currentTab === 'party' ? '#d4af37' : 'rgba(0,0,0,0.3)'}; color: ${this.currentTab === 'party' ? '#000' : '#ffd700'}; border: none; border-radius: 4px; cursor: pointer;">
          组队 (${this.party.length})
        </button>
      </div>
    `;
    
    if (this.currentTab === 'friends') {
      this.friends.forEach(friend => {
        html += `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${friend.online ? '#4CAF50' : '#666'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${friend.online ? '#4CAF50' : '#666'};"\u003e</div>
                <div>
                  <div style="font-weight: bold;">${friend.name}</div>
                  <div style="font-size: 12px; opacity: 0.7;">Lv.${friend.level} · ${friend.status}</div>
                </div>
              </div>
              <button onclick="SocialChatEnhancer.sendMessage('${friend.name}')" style="padding: 5px 10px; background: ${friend.online ? '#d4af37' : '#666'}; border: none; color: #000; border-radius: 4px; cursor: ${friend.online ? 'pointer' : 'not-allowed'};">
                发送消息
              </button>
            </div>
          </div>
        `;
      });
    } else if (this.currentTab === 'chat') {
      html += `
        <div style="height: 300px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; overflow-y: auto; margin-bottom: 15px;">
      `;
      
      this.chatHistory.forEach(msg => {
        const isMe = msg.from === '我';
        html += `
          <div style="margin-bottom: 10px; ${isMe ? 'text-align: right;' : ''}">
            <div style="display: inline-block; max-width: 70%; padding: 8px 12px; background: ${isMe ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.3)'}; border-radius: 8px;">
              <div style="font-size: 11px; opacity: 0.6; margin-bottom: 3px;">${msg.from} · ${msg.time}</div>
              <div>${msg.text}</div>
            </div>
          </div>
        `;
      });
      
      html += `
        </div>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="chatInput" placeholder="输入消息..." style="flex: 1; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; border-radius: 6px; color: #ffd700; font-size: 14px;">
          <button onclick="SocialChatEnhancer.sendChat()" style="padding: 10px 20px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer;">
            发送
          </button>
        </div>
      `;
    } else {
      html += `
        <div style="margin-bottom: 15px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">当前队伍 (${this.party.length}人)</div>
      `;
      
      this.party.forEach(member => {
        html += `
          <div style="padding: 8px; margin-bottom: 5px; background: rgba(0,0,0,0.15); border-radius: 4px; display: flex; justify-content: space-between;">
            <span>${member}</span>
            ${member === '我' ? '<span style="color: #d4af37;">(队长)</span>' : ''}
          </div>
        `;
      });
      
      html += `
          <div style="margin-top: 15px; text-align: center;">
            <button style="padding: 8px 16px; background: #4CAF50; border: none; color: #fff; border-radius: 4px; cursor: pointer;">
              邀请好友
            </button>
          </div>
        </div>
      `;
    }
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="SocialChatEnhancer.closeSocialPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.socialPanel.innerHTML = html;
  },
  
  setTab(tab) {
    this.currentTab = tab;
    this.renderSocialPanel();
  },
  
  sendMessage(friendName) {
    console.log('[Social] 发送消息给:', friendName);
    
    this.currentTab = 'chat';
    this.renderSocialPanel();
  },
  
  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.chatHistory.push({
      from: '我',
      text: input.value,
      time: time,
    });
    
    console.log('[Social] 发送消息:', input.value);
    
    this.renderSocialPanel();
  }
};

window.SocialChatEnhancer = SocialChatEnhancer;

console.log('[Social] 好友聊天组队公会社交系统增强模块加载完成');
