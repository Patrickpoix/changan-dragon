/* ============================================================
   UI界面增强 v2.0
   古风UI、按钮、面板、导航
   ============================================================ */

const UIEnhancer = {
  
  createButton(text, x, y, width = 120, height = 40) {
    const button = document.createElement('div');
    button.textContent = text;
    button.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      background: linear-gradient(180deg, #8b4513 0%, #6b3410 100%);
      border: 2px solid #d4af37;
      border-radius: 4px;
      color: #ffd700;
      font-family: serif;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    button.onmouseover = () => {
      button.style.background = 'linear-gradient(180deg, #a0522d 0%, #8b4513 100%)';
    };
    
    button.onmouseout = () => {
      button.style.background = 'linear-gradient(180deg, #8b4513 0%, #6b3410 100%)';
    };
    
    return button;
  },
  
  createPanel(x, y, width, height) {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      background: rgba(139, 69, 19, 0.9);
      border: 2px solid #d4af37;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      padding: 10px;
      color: #ffd700;
      font-family: serif;
    `;
    
    return panel;
  },
  
  createTitle(text, x, y, fontSize = 24) {
    const title = document.createElement('div');
    title.textContent = text;
    title.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: ${fontSize}px;
      color: #ffd700;
      font-family: serif;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    `;
    
    return title;
  },
  
  createNavBar(y = 20) {
    const nav = document.createElement('div');
    nav.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: ${y}px;
      display: flex;
      gap: 20px;
      background: rgba(139, 69, 19, 0.8);
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 8px 20px;
    `;
    
    const items = ['首页', '地图', '任务', '背包', '设置'];
    
    items.forEach((item, index) => {
      const link = document.createElement('div');
      link.textContent = item;
      link.style.cssText = `
        color: #ffd700;
        font-family: serif;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
      `;
      
      link.onmouseover = () => {
        link.style.background = 'rgba(255, 215, 0, 0.2)';
      };
      
      link.onmouseout = () => {
        link.style.background = 'transparent';
      };
      
      nav.appendChild(link);
    });
    
    return nav;
  },
  
  createMinimap(x, y, size = 150) {
    const minimap = document.createElement('canvas');
    minimap.width = size;
    minimap.height = size;
    minimap.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      border: 2px solid #d4af37;
      border-radius: 4px;
      background: rgba(0,0,0,0.5);
    `;
    
    const ctx = minimap.getContext('2d');
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    return minimap;
  }
};

window.UIEnhancer = UIEnhancer;

console.log('[UI] UI界面增强模块加载完成');
