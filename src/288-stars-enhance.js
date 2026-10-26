/* ============================================================
   星空优化
   增强夜晚的星空效果
   ============================================================ */

(function() {
  'use strict';

  let initialized = false;

  function initStarsEnhance() {
    if (initialized) return;
    initialized = true;

    console.log('[StarsEnhance] 开始星空优化...');

    try {
      if (typeof scene === 'undefined') return;
      
      // 添加星星
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 500;
      const positions = new Float32Array(starCount * 3);
      
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = -500 + Math.random() * 1000;
        positions[i * 3 + 1] = 100 + Math.random() * 200;
        positions[i * 3 + 2] = -500 + Math.random() * 1000;
      }
      
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5,
        sizeAttenuation: true,
        fog: false
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      console.log('[StarsEnhance] 星空已添加（500颗星）');

      console.log('[StarsEnhance] 星空优化完成！');

    } catch(e) {
      console.warn('[StarsEnhance] 星空优化失败:', e);
    }
  }

  function checkReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      setTimeout(initStarsEnhance, 180000);
    } else {
      setTimeout(checkReady, 300);
    }
  }

  checkReady();

})();
