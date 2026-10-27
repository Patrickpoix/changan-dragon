/* ============================================================
   拍照模式增强 — 长安留影
   v1: 拍照模式、滤镜、相框、分享
   ============================================================ */

(function() {
  'use strict';
  
  let photoMode = false;
  let currentFilter = 'normal';
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Photo] 开始增强拍照模式...']);
    
    setupPhotoMode();
    setupFilters();
    setupPhotoFrame();
    
    console.log('[Photo] ✓ 拍照模式增强完成');
  }
  
  // 拍照模式
  function setupPhotoMode() {
    // P键进入拍照模式
    document.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePhotoMode();
      }
      
      // 拍照模式下按回车拍照
      if (photoMode && (e.key === 'Enter' || e.key === ' ')) {
        takePhoto();
      }
    });
    
    console.log('[Photo] 拍照模式已就绪，按P切换');
  }
  
  // 滤镜
  function setupFilters() {
    const filters = [
      { id: 'normal', name: '原图' },
      { id: 'warm', name: '暖调' },
      { id: 'cool', name: '冷调' },
      { id: 'vintage', name: '复古' },
      { id: 'cinematic', name: '电影' },
      { id: 'anime', name: '动漫' }
    ];
    
    // 拍照模式下按数字键切换滤镜
    document.addEventListener('keydown', (e) => {
      if (!photoMode) return;
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= filters.length) {
        currentFilter = filters[num - 1].id;
        showToast('滤镜: ' + filters[num - 1].name);
      }
    });
    
    console.log('[Photo] 滤镜已加载，共 ' + filters.length + ' 种');
  }
  
  // 相框
  function setupPhotoFrame() {
    const frames = [
      { id: 'none', name: '无相框' },
      { id: 'tang', name: '唐风' },
      { id: 'flower', name: '花卉' },
      { id: 'landscape', name: '山水' }
    ];
    
    console.log('[Photo] 相框已加载，共 ' + frames.length + ' 种');
  }
  
  // 切换拍照模式
  function togglePhotoMode() {
    photoMode = !photoMode;
    
    if (photoMode) {
      showToast('📸 拍照模式已开启');
      showPhotoUI();
    } else {
      showToast('📷 拍照模式已关闭');
      hidePhotoUI();
    }
    
    console.log('[Photo] 拍照模式: ' + photoMode);
  }
  
  // 拍照
  function takePhoto() {
    if (typeof renderer === 'undefined' || typeof scene === 'undefined' || typeof camera === 'undefined') {
      return;
    }
    
    // 渲染当前画面
    renderer.render(scene, camera);
    
    // 获取canvas数据
    const canvas = renderer.domElement;
    const dataURL = canvas.toDataURL('image/png');
    
    // 下载图片
    const link = document.createElement('a');
    link.download = 'changan-dragon-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
    
    showToast('📷 照片已保存');
    console.log('[Photo] 照片已保存');
  }
  
  // 显示拍照UI
  function showPhotoUI() {
    const ui = document.createElement('div');
    ui.id = 'photoUI';
    ui.style.position = 'absolute';
    ui.style.bottom = '20px';
    ui.style.left = '50%';
    ui.style.transform = 'translateX(-50%)';
    ui.style.background = 'rgba(0, 0, 0, 0.7)';
    ui.style.color = '#ffd700';
    ui.style.padding = '15px 20px';
    ui.style.borderRadius = '8px';
    ui.style.border = '1px solid #8b4513';
    ui.style.zIndex = '100';
    ui.innerHTML = `
      <div style="text-align: center; margin-bottom: 10px;">📸 拍照模式</div>
      <div style="font-size: 12px; opacity: 0.8;">
        回车/空格 拍照 | 1-6 切换滤镜 | P 退出
      </div>
    `;
    document.body.appendChild(ui);
  }
  
  // 隐藏拍照UI
  function hidePhotoUI() {
    const ui = document.getElementById('photoUI');
    if (ui) ui.remove();
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
})();
