/* ============================================================
   UI界面增强 — 国风美学界面
   v1: HUD、菜单、交互提示、加载界面
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['UI] 开始增强UI界面效果...']);
    
    enhanceHUD();
    enhanceMenu();
    enhanceLoadingScreen();
    addInteractionPrompts();
    
    console.log('[UI] ✓ UI界面效果增强完成');
  }
  
  // HUD增强
  function enhanceHUD() {
    // 小地图边框
    const minimap = document.getElementById('minimap');
    if (minimap) {
      minimap.style.border = '2px solid #8b4513';
      minimap.style.borderRadius = '8px';
      minimap.style.boxShadow = '0 0 10px rgba(139, 69, 19, 0.5)';
    }
    
    // 任务栏样式
    const questBar = document.getElementById('questBar');
    if (questBar) {
      questBar.style.background = 'rgba(0, 0, 0, 0.7)';
      questBar.style.border = '1px solid #8b4513';
      questBar.style.borderRadius = '4px';
      questBar.style.padding = '10px';
      questBar.style.color = '#ffd700';
      questBar.style.fontFamily = 'serif';
    }
  }
  
  // 菜单增强
  function enhanceMenu() {
    // 主菜单
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      mainMenu.style.background = 'linear-gradient(135deg, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.9))';
      mainMenu.style.border = '2px solid #ffd700';
    }
    
    // 按钮样式
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.style.background = 'linear-gradient(180deg, #8b4513, #654321)';
      btn.style.border = '1px solid #ffd700';
      btn.style.color = '#ffd700';
      btn.style.padding = '10px 20px';
      btn.style.margin = '5px';
      btn.style.borderRadius = '4px';
      btn.style.fontFamily = 'serif';
      btn.style.cursor = 'pointer';
    });
  }
  
  // 加载界面增强
  function enhanceLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.background = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      
      const loadingText = document.getElementById('loadingText');
      if (loadingText) {
        loadingText.style.color = '#ffd700';
        loadingText.style.fontFamily = 'serif';
        loadingText.style.fontSize = '24px';
        loadingText.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
      }
    }
  }
  
  // 交互提示
  function addInteractionPrompts() {
    // 添加一个简单的交互提示
    const prompt = document.createElement('div');
    prompt.id = 'interactionPrompt';
    prompt.style.position = 'absolute';
    prompt.style.bottom = '100px';
    prompt.style.left = '50%';
    prompt.style.transform = 'translateX(-50%)';
    prompt.style.background = 'rgba(0, 0, 0, 0.8)';
    prompt.style.color = '#ffd700';
    prompt.style.padding = '10px 20px';
    prompt.style.borderRadius = '4px';
    prompt.style.border = '1px solid #8b4513';
    prompt.style.fontFamily = 'serif';
    prompt.style.display = 'none';
    prompt.style.zIndex = '100';
    prompt.textContent = '按 E 交互';
    document.body.appendChild(prompt);
  }
  
  init();
})();
