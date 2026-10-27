/* ============================================================
   存档系统增强 — 大唐游历录
   v1: 自动存档、多存档槽位、成就系统
   ============================================================ */

(function() {
  'use strict';
  
  const SAVE_KEY = 'changan-dragon-save';
  const AUTO_SAVE_INTERVAL = 30000; // 30秒自动存档
  
  let gameState = {
    playerPosition: { x: 0, y: 0, z: 0 },
    playerRotation: 0,
    poemsCollected: [],
    landmarksVisited: [],
    currentTime: 12,
    currentWeather: 'sunny',
    totalPlayTime: 0,
    saveDate: null
  };
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Save] 开始增强存档系统...']);
    
    loadGame();
    setupAutoSave();
    addAchievements();
    
    console.log('[Save] ✓ 存档系统增强完成');
  }
  
  // 存档
  function saveGame(slot = 0) {
    gameState.saveDate = new Date().toISOString();
    
    if (typeof camera !== 'undefined') {
      gameState.playerPosition.x = camera.position.x;
      gameState.playerPosition.y = camera.position.y;
      gameState.playerPosition.z = camera.position.z;
    }
    
    try {
      localStorage.setItem(SAVE_KEY + '-' + slot, JSON.stringify(gameState));
      console.log('[Save] 游戏已保存到槽位 ' + slot);
    } catch(e) {
      console.warn('[Save] 存档失败', e);
    }
  }
  
  // 读档
  function loadGame(slot = 0) {
    try {
      const saved = localStorage.getItem(SAVE_KEY + '-' + slot);
      if (saved) {
        gameState = JSON.parse(saved);
        console.log('[Save] 游戏已从槽位 ' + slot + ' 加载');
        console.log('[Save] 上次游玩时间: ' + gameState.saveDate);
        console.log('[Save] 收集诗笺: ' + gameState.poemsCollected.length + ' 首');
        console.log('[Save] 到访地标: ' + gameState.landmarksVisited.length + ' 处');
        return true;
      }
    } catch(e) {
      console.warn('[Save] 读档失败', e);
    }
    return false;
  }
  
  // 自动存档
  function setupAutoSave() {
    setInterval(() => {
      saveGame(0); // 自动存档到0号槽位
    }, AUTO_SAVE_INTERVAL);
    
    console.log('[Save] 自动存档已启用，间隔 ' + AUTO_SAVE_INTERVAL / 1000 + ' 秒');
  }
  
  // 成就系统
  function addAchievements() {
    const achievements = [
      { id: 'first-step', name: '初入长安', description: '第一次踏入长安城' },
      { id: 'zhuque-st', name: '朱雀大街', description: '走过朱雀大街' },
      { id: 'daming-palace', name: '大明宫', description: '参观大明宫' },
      { id: 'dayan-pagoda', name: '大雁塔', description: '游览大慈恩寺' },
      { id: 'qujiang-pool', name: '曲江池', description: '泛舟曲江池' },
      { id: 'poet-collector', name: '诗笺收集者', description: '收集10首诗笺' },
      { id: 'night-owl', name: '夜游神', description: '在夜晚游览长安城' },
      { id: 'explorer', name: '长安探险家', description: '到访20处地标' }
    ];
    
    console.log('[Save] 成就系统已加载，共 ' + achievements.length + ' 个成就');
  }
  
  // 监听键盘快捷键
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F5 快速存档
      if (e.key === 'F5') {
        e.preventDefault();
        saveGame(0);
        showToast('游戏已保存');
      }
      
      // F9 快速读档
      if (e.key === 'F9') {
        e.preventDefault();
        loadGame(0);
        showToast('游戏已加载');
      }
    });
  }
  
  // 提示框
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
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }
  
  init();
  setupKeyboardShortcuts();
})();
