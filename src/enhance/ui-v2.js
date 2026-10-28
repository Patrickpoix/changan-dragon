/* ============================================================
   UI界面v2 — 盛唐古风UI
   v2: HUD、菜单、地图、背包、设置
   ============================================================ */

(function() {
  'use strict';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 8000);
      return;
    }
    
    console.log(['UIV2] 开始增强UI界面...']);
    
    addHUD();                   // 游戏HUD
    addMainMenu();              // 主菜单
    addMinimap();               // 小地图
    addBackpack();              // 背包
    addSettings();              // 设置面板
    
    console.log('[UIV2] ✓ UI界面增强完成');
  }
  
  // 游戏HUD — 左上角状态栏
  function addHUD() {
    if (typeof document === 'undefined') return;
    
    console.log('[UIV2] 添加游戏HUD...');
    
    // HUD容器
    const hud = document.createElement('div');
    hud.id = 'changanHUD';
    hud.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      font-family: 'KaiTi', 'STKaiti', serif;
      color: #d4af37;
      text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
      pointer-events: none;
    `;
    
    hud.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">龙游长安</div>
      <div style="font-size: 14px; opacity: 0.8;">位置：朱雀大街</div>
      <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">时辰：巳时</div>
      <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">诗笺：0/30</div>
    `;
    
    document.body.appendChild(hud);
    
    console.log('[UIV2] 游戏HUD添加完成');
  }
  
  // 主菜单 — 右上角按钮
  function addMainMenu() {
    if (typeof document === 'undefined') return;
    
    console.log('[UIV2] 添加主菜单...');
    
    const menu = document.createElement('div');
    menu.id = 'changanMenu';
    menu.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    `;
    
    const buttons = ['地图', '背包', '任务', '设置'];
    buttons.forEach(text => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText = `
        padding: 8px 16px;
        background: rgba(139, 0, 0, 0.8);
        border: 1px solid #d4af37;
        color: #d4af37;
        font-family: 'KaiTi', 'STKaiti', serif;
        font-size: 14px;
        cursor: pointer;
        border-radius: 4px;
      `;
      btn.onmouseover = () => btn.style.background = 'rgba(139, 0, 0, 1)';
      btn.onmouseout = () => btn.style.background = 'rgba(139, 0, 0, 0.8)';
      menu.appendChild(btn);
    });
    
    document.body.appendChild(menu);
    
    console.log('[UIV2] 主菜单添加完成');
  }
  
  // 小地图 — 右下角
  function addMinimap() {
    if (typeof document === 'undefined') return;
    
    console.log('[UIV2] 添加小地图...');
    
    const minimap = document.createElement('div');
    minimap.id = 'changanMinimap';
    minimap.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 150px;
      height: 150px;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid #d4af37;
      border-radius: 8px;
      z-index: 1000;
      overflow: hidden;
    `;
    
    minimap.innerHTML = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 10px; height: 10px; background: #ff4444; border-radius: 50%;"></div>
      <div style="position: absolute; top: 5px; left: 5px; color: #d4af37; font-size: 10px;">长安图</div>
    `;
    
    document.body.appendChild(minimap);
    
    console.log('[UIV2] 小地图添加完成');
  }
  
  // 背包 — 左下角
  function addBackpack() {
    if (typeof document === 'undefined') return;
    
    console.log('[UIV2] 添加背包...');
    
    const backpack = document.createElement('div');
    backpack.id = 'changanBackpack';
    backpack.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 200px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #d4af37;
      border-radius: 8px;
      z-index: 1000;
      color: #d4af37;
      font-family: 'KaiTi', 'STKaiti', serif;
      font-size: 14px;
    `;
    
    backpack.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">行囊</div>
      <div style="opacity: 0.8;">诗笺：0</div>
      <div style="opacity: 0.8; margin-top: 5px;">铜钱：0</div>
      <div style="opacity: 0.8; margin-top: 5px;">道具：0</div>
    `;
    
    document.body.appendChild(backpack);
    
    console.log('[UIV2] 背包添加完成');
  }
  
  // 设置面板
  function addSettings() {
    if (typeof document === 'undefined') return;
    
    console.log('[UIV2] 添加设置面板...');
    
    const settings = document.createElement('div');
    settings.id = 'changanSettings';
    settings.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #d4af37;
      border-radius: 8px;
      z-index: 2000;
      color: #d4af37;
      font-family: 'KaiTi', 'STKaiti', serif;
      display: none;
    `;
    
    settings.innerHTML = `
      <div style="font-size: 20px; text-align: center; margin-bottom: 15px;">设置</div>
      <div style="margin-bottom: 10px;
        <label>画质：</label>
        <select style="background: #333; color: #d4af37; border: 1px solid #d4af37;">
          <option>高</option>
          <option>中</option>
          <option>低</option>
        </select>
      </div>
      <div style="margin-bottom: 10px;
        <label>音量：</label>
        <input type="range" min="0" max="100" value="50">
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button style="padding: 5px 20px; background: #8b0000; color: #d4af37; border: 1px solid #d4af37; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(settings);
    
    console.log('[UIV2] 设置面板添加完成');
  }
  
  init();
})();
