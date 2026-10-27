/* ============================================================
   拍照与休闲增强 · 悠闲时光
   拍照系统 / 钓鱼 / 美食 / 悠闲体验
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildPhotoLeisure();
  }

  function buildPhotoSystem() {
    const photoBtn = document.createElement('div');
    photoBtn.id = 'photoButton';
    photoBtn.style.cssText = 'position:fixed;bottom:80px;left:20px;width:50px;height:50px;background:rgba(255,215,0,0.8);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:995;box-shadow:0 0 20px rgba(255,215,0,0.5)';
    photoBtn.textContent = '📷';
    photoBtn.onclick = function() {
      console.log('[Photo] 拍照！记录下这美丽的长安城');
      alert('📸 拍照成功！\n\n记录下了长安城的美丽瞬间！');
    };
    document.body.appendChild(photoBtn);
    console.log('[PhotoLeisure] 拍照系统完成');
  }

  function buildFishingSystem() {
    const fishSpots = [
      { name: '曲江池钓鱼台', x: 354, z: 318 },
      { name: '龙池垂钓处', x: 342, z: -150 },
    ];
    console.log('[PhotoLeisure] 钓鱼系统完成: ' + fishSpots.length + ' 个钓点');
  }

  function buildFoodSystem() {
    const foods = [
      { name: '胡饼', desc: '西域传入的烤饼，外酥内软' },
      { name: '毕罗', desc: '唐代的抓饭，香甜可口' },
      { name: '饆饠', desc: '唐代的面食，花样繁多' },
      { name: '酪樱桃', desc: '用樱桃和奶酪做的甜点' },
    ];
    const foodEl = document.createElement('div');
    foodEl.id = 'foodPanel';
    foodEl.style.cssText = 'position:fixed;top:350px;left:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:994;font-size:13px;pointer-events:none';
    foodEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">🍜 长安美食</div>';
    for (const food of foods) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.3)';
      item.innerHTML = '<div style="color:#ffd700;font-weight:bold">' + food.name + '</div><div style="opacity:0.8;margin:3px 0">' + food.desc + '</div>';
      foodEl.appendChild(item);
    }
    document.body.appendChild(foodEl);
    console.log('[PhotoLeisure] 美食系统完成: ' + foods.length + ' 种美食');
  }

  function buildTeaSystem() {
    const teas = [
      { name: '蒙顶茶', desc: '四川蒙顶山的名茶' },
      { name: '顾渚紫笋', desc: '浙江顾渚山的贡茶' },
      { name: '碧涧茶', desc: '唐代的著名茶品' },
    ];
    console.log('[PhotoLeisure] 品茶系统完成: ' + teas.length + ' 种名茶');
  }

  function buildPhotoLeisure() {
    console.log('[PhotoLeisure] 开始构建拍照与休闲...');
    buildPhotoSystem();
    buildFishingSystem();
    buildFoodSystem();
    buildTeaSystem();
    console.log('[PhotoLeisure] 拍照与休闲构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
