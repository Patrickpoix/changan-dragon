/* ============================================================
   聊天系统增强 — 长安夜话
   v1: 聊天、频道、表情
   ============================================================ */

(function() {
  'use strict';
  
  let chatHistory = [];
  let currentChannel = 'world';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Chat] 开始增强聊天系统...']);
    
    loadChat();
    setupChatUI();
    addWelcomeMessages();
    
    console.log('[Chat] ✓ 聊天系统增强完成');
  }
  
  // 加载聊天
  function loadChat() {
    try {
      const saved = localStorage.getItem('changan-dragon-chat');
      if (saved) {
        chatHistory = JSON.parse(saved);
        console.log('[Chat] 聊天已加载，共 ' + chatHistory.length + ' 条消息');
      }
    } catch(e) {
      console.warn('[Chat] 加载聊天失败', e);
    }
  }
  
  // 保存聊天
  function saveChat() {
    try {
      localStorage.setItem('changan-dragon-chat', JSON.stringify(chatHistory.slice(-100)));
    } catch(e) {
      console.warn('[Chat] 保存聊天失败', e);
    }
  }
  
  // 聊天UI
  function setupChatUI() {
    // Enter键打开聊天输入
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        showChatInput();
      }
    });
    
    console.log('[Chat] 聊天UI已就绪，按Enter打开');
  }
  
  // 添加欢迎消息
  function addWelcomeMessages() {
    if (chatHistory.length === 0) {
      chatHistory = [
        { channel: 'system', user: '系统', message: '欢迎来到长安城！', time: Date.now() },
        { channel: 'world', user: '李白', message: '今朝有酒今朝醉，明日愁来明日愁。', time: Date.now() },
        { channel: 'world', user: '杜甫', message: '会当凌绝顶，一览众山小。', time: Date.now() }
      ];
      saveChat();
      console.log('[Chat] 已添加欢迎消息');
    }
  }
  
  // 显示聊天输入
  function showChatInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '输入消息...';
    input.style.position = 'absolute';
    input.style.bottom = '20px';
    input.style.left = '50%';
    input.style.transform = 'translateX(-50%)';
    input.style.width = '400px';
    input.style.padding = '10px';
    input.style.background = 'rgba(0, 0, 0, 0.8)';
    input.style.color = '#ffd700';
    input.style.border = '1px solid #8b4513';
    input.style.borderRadius = '4px';
    input.style.zIndex = '1000';
    
    document.body.appendChild(input);
    input.focus();
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const message = input.value.trim();
        if (message) {
          sendMessage(message);
        }
        input.remove();
      } else if (e.key === 'Escape') {
        input.remove();
      }
    };
  }
  
  // 发送消息
  function sendMessage(message) {
    chatHistory.push({
      channel: currentChannel,
      user: '我',
      message: message,
      time: Date.now()
    });
    saveChat();
    console.log('[Chat] 发送消息: ' + message);
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
  window.GameChat = {
    sendMessage: sendMessage,
    getHistory: () => [...chatHistory],
    setChannel: (channel) => { currentChannel = channel; }
  };
})();
