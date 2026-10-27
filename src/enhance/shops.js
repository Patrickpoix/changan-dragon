/* ============================================================
   商店系统增强 — 东西两市
   v1: 商店、交易、经济系统
   ============================================================ */

(function() {
  'use strict';
  
  let gold = 100;
  let shops = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Shops] 开始增强商店系统...']);
    
    loadGold();
    setupShops();
    setupShopUI();
    
    console.log('[Shops] ✓ 商店系统增强完成');
  }
  
  // 加载金币
  function loadGold() {
    try {
      const saved = localStorage.getItem('changan-dragon-gold');
      if (saved) {
        gold = parseInt(saved);
        console.log('[Shops] 金币已加载: ' + gold + ' 文');
      }
    } catch(e) {
      console.warn('[Shops] 加载金币失败', e);
    }
  }
  
  // 保存金币
  function saveGold() {
    try {
      localStorage.setItem('changan-dragon-gold', gold.toString());
    } catch(e) {
      console.warn('[Shops] 保存金币失败', e);
    }
  }
  
  // 设置商店
  function setupShops() {
    shops = [
      {
        id: 'wine-shop',
        name: '胡姬酒肆',
        type: 'food',
        items: [
          { id: 'rice-wine', name: '米酒', price: 10, icon: '🍶' },
          { id: 'grape-wine', name: '葡萄酒', price: 50, icon: '🍷' },
          { id: 'craft-food', name: '胡饼', price: 5, icon: '🥮' }
        ]
      },
      {
        id: 'book-shop',
        name: '文房四宝',
        type: 'goods',
        items: [
          { id: 'brush', name: '湖笔', price: 30, icon: '🖌️' },
          { id: 'ink', name: '徽墨', price: 25, icon: '🖋️' },
          { id: 'paper', name: '宣纸', price: 15, icon: '📜' }
        ]
      },
      {
        id: 'clothes-shop',
        name: '锦绣成衣',
        type: 'clothes',
        items: [
          { id: 'silk-robe', name: '丝绸长袍', price: 200, icon: '👘' },
          { id: 'hat', name: '幞头', price: 50, icon: '🎩' },
          { id: 'shoes', name: '云头履', price: 30, icon: '👞' }
        ]
      }
    ];
    
    console.log('[Shops] 商店已设置，共 ' + shops.length + ' 家');
  }
  
  // 商店UI
  function setupShopUI() {
    // B键打开商店
    document.addEventListener('keydown', (e) => {
      if (e.key === 'b' || e.key === 'B') {
        showShopsList();
      }
    });
    
    console.log('[Shops] 商店UI已就绪，按B打开');
  }
  
  // 显示商店列表
  function showShopsList() {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '400px';
    
    let shopsHTML = '';
    shops.forEach(shop => {
      shopsHTML += `
        <div style="padding: 15px; margin: 10px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px; cursor: pointer;" onclick="window.GameShops.openShop('${shop.id}')">
          <h4 style="color: #ffd700; margin-bottom: 5px;">🏪 ${shop.name}</h4>
          <p style="color: #999; font-size: 13px;">${shop.items.length} 件商品</p>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🏪 长安城商店</h3>
      <p style="color: #ffd700; text-align: center; margin-bottom: 15px;">💰 你的金币: ${gold} 文</p>
      <div style="max-height: 350px; overflow-y: auto;">
        ${shopsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button id="closeShopsBtn" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">关闭</button>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeShopsBtn').onclick = () => {
      menu.remove();
    };
  }
  
  // 打开商店
  function openShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    // 关闭之前的菜单
    document.querySelectorAll('div[style*="z-index: 1000"]').forEach(el => el.remove());
    
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.95)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '400px';
    
    let itemsHTML = '';
    shop.items.forEach(item => {
      itemsHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: rgba(139, 69, 19, 0.2); border-radius: 6px;">
          <span style="color: #ffd700; font-size: 16px;">${item.icon} ${item.name}</span>
          <span style="color: #ffd700;">${item.price} 文</span>
          <button onclick="window.GameShops.buy('${item.id}', ${item.price})" style="padding: 6px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">购买</button>
        </div>
      `;
    });
    
    menu.innerHTML = `
      <h3 style="color: #ffd700; text-align: center; margin-bottom: 15px; font-family: serif;">🏪 ${shop.name}</h3>
      <p style="color: #ffd700; text-align: center; margin-bottom: 15px;">💰 金币: ${gold} 文</p>
      <div style="max-height: 300px; overflow-y: auto;">
        ${itemsHTML}
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <button onclick="window.GameShops.showList()" style="padding: 8px 25px; background: linear-gradient(180deg, #8b4513, #654321); color: #ffd700; border: 1px solid #ffd700; border-radius: 4px; cursor: pointer;">返回</button>
      </div>
    `;
    
    document.body.appendChild(menu);
  }
  
  // 购买物品
  function buy(itemId, price) {
    if (gold >= price) {
      gold -= price;
      saveGold();
      showToast('购买成功！');
      // 重新打开商店
      // openShop(currentShopId);
    } else {
      showToast('金币不足！');
    }
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
  window.GameShops = {
    openShop: openShop,
    buy: buy,
    showList: showShopsList,
    getGold: () => gold,
    addGold: (amount) => { gold += amount; saveGold(); }
  };
})();
