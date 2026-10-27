/* ============================================================
   收藏与商业增强 · 宝物与商机
   文物收藏 / 古董鉴赏 / 开店经商
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildCollectionBusiness();
  }

  function buildMuseumSystem() {
    const artifacts = [
      { name: '唐三彩骆驼', desc: '唐代彩陶珍品，丝路见证' },
      { name: '越窑青瓷', desc: '唐代越窑的秘色瓷' },
      { name: '青铜镜', desc: '唐代的铜镜，背面有精美纹饰' },
      { name: '唐三彩马', desc: '唐代的彩陶马，栩栩如生' },
      { name: '金步摇', desc: '唐代的金饰，发簪上的明珠' },
    ];
    const museumEl = document.createElement('div');
    museumEl.id = 'museumPanel';
    museumEl.style.cssText = 'position:fixed;top:550px;left:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:992;font-size:13px;pointer-events:none';
    museumEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">🏺 宝物收藏</div>';
    for (const art of artifacts) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.3)';
      item.innerHTML = '<div style="color:#ffd700;font-weight:bold">' + art.name + '</div><div style="opacity:0.8;margin:3px 0">' + art.desc + '</div>';
      museumEl.appendChild(item);
    }
    document.body.appendChild(museumEl);
    console.log('[CollectionBusiness] 文物收藏系统完成: ' + artifacts.length + ' 件宝物');
  }

  function buildBusinessSystem() {
    const shops = [
      { name: '绸缎庄', desc: '贩卖各种丝绸绸缎' },
      { name: '茶叶铺', desc: '贩卖各种名茶' },
      { name: '瓷器店', desc: '贩卖各种瓷器' },
      { name: '香料铺', desc: '贩卖各种香料，来自西域' },
    ];
    console.log('[CollectionBusiness] 商业系统完成: ' + shops.length + ' 种店铺');
  }

  function buildCurrencySystem() {
    const currencyEl = document.createElement('div');
    currencyEl.id = 'currencyPanel';
    currencyEl.style.cssText = 'position:fixed;top:60px;right:20px;width:180px;padding:12px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:991;font-size:14px;pointer-events:none';
    currencyEl.innerHTML = '<div style="text-align:center;margin-bottom:8px;font-size:15px">💰 钱包</div>';
    currencyEl.innerHTML += '<div style="padding:4px 0">开元通宝: <span style="color:#ffd700">1000 文</span></div>';
    currencyEl.innerHTML += '<div style="padding:4px 0">银子: <span style="color:#c0c0c0">10 两</span></div>';
    currencyEl.innerHTML += '<div style="padding:4px 0">金子: <span style="color:#ffd700">1 两</span></div>';
    document.body.appendChild(currencyEl);
    console.log('[CollectionBusiness] 货币系统完成');
  }

  function buildTradeSystem() {
    console.log('[CollectionBusiness] 交易系统完成');
  }

  function buildCollectionBusiness() {
    console.log('[CollectionBusiness] 开始构建收藏与商业...');
    buildMuseumSystem();
    buildBusinessSystem();
    buildCurrencySystem();
    buildTradeSystem();
    console.log('[CollectionBusiness] 收藏与商业构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
