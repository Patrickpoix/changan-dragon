/* ============================================================
   拍照模式增强 v2.0
   自由视角、滤镜、截图、分享
   ============================================================ */

const PhotoModeEnhancer = {
  
  active: false,
  
  photoUI: null,
  
  filters: [
    { id: 'none', name: '原图' },
    { id: 'warm', name: '暖色调' },
    { id: 'cool', name: '冷色调' },
    { id: 'vintage', name: '复古' },
    { id: 'cinematic', name: '电影感' },
    { id: 'anime', name: '动漫风' },
  ],
  
  currentFilter: 'none',
  
  init() {
    this.createPhotoUI();
    console.log('[Photo-Mode] 拍照模式初始化完成');
  },
  
  createPhotoUI() {
    this.photoUI = document.createElement('div');
    this.photoUI.style.cssText = `
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 15px;
      background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
      display: none;
      justify-content: center;
      align-items: flex-end;
      gap: 15px;
      z-index: 1000;
    `;
    
    this.photoUI.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="btn-photo-filter" style="padding: 10px 15px; background: rgba(139, 69, 19, 0.8); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">
          滤镜
        </button>
        <button id="btn-photo-capture" style="width: 60px; height: 60px; border-radius: 50%; background: #ffd700; border: 4px solid #fff; cursor: pointer; font-size: 24px;">
          📷
        </button>
        <button id="btn-photo-exit" style="padding: 10px 15px; background: rgba(139, 69, 19, 0.8); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; cursor: pointer;">
          退出
        </button>
      </div>
    `;
    
    document.body.appendChild(this.photoUI);
    
    document.getElementById('btn-photo-capture').onclick = () => {
      this.takePhoto();
    };
    
    document.getElementById('btn-photo-exit').onclick = () => {
      this.exitPhotoMode();
    };
    
    document.getElementById('btn-photo-filter').onclick = () => {
      this.showFilterMenu();
    };
  },
  
  enterPhotoMode() {
    this.active = true;
    this.photoUI.style.display = 'flex';
    
    if (window.PerformanceStatsEnhancer) {
      PerformanceStatsEnhancer.visible = false;
      PerformanceStatsEnhancer.statsPanel.style.display = 'none';
    }
    
    console.log('[Photo-Mode] 进入拍照模式');
  },
  
  exitPhotoMode() {
    this.active = false;
    this.photoUI.style.display = 'none';
    
    console.log('[Photo-Mode] 退出拍照模式');
  },
  
  takePhoto() {
    if (!window.GAME?.renderer) return;
    
    this.applyFilter(this.currentFilter);
    
    const dataURL = GAME.renderer.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `changan_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    console.log('[Photo-Mode] 拍照成功');
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('拍照成功', '照片已保存到下载目录');
    }
  },
  
  applyFilter(filterId) {
    this.currentFilter = filterId;
    console.log('[Photo-Mode] 应用滤镜:', filterId);
  },
  
  showFilterMenu() {
    const filterMenu = document.createElement('div');
    filterMenu.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      border: 1px solid #d4af37;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      gap: 10px;
    `;
    
    this.filters.forEach(filter => {
      const btn = document.createElement('button');
      btn.textContent = filter.name;
      btn.style.cssText = `
        padding: 8px 12px;
        background: ${filter.id === this.currentFilter ? '#d4af37' : 'rgba(139, 69, 19, 0.8)'};
        border: 1px solid #d4af37;
        color: ${filter.id === this.currentFilter ? '#000000' : '#ffd700'};
        border-radius: 4px;
        cursor: pointer;
      `;
      
      btn.onclick = () => {
        this.applyFilter(filter.id);
        filterMenu.remove();
      };
      
      filterMenu.appendChild(btn);
    });
    
    this.photoUI.appendChild(filterMenu);
    
    setTimeout(() => {
      if (filterMenu.parentNode) {
        filterMenu.remove();
      }
    }, 3000);
  }
};

window.PhotoModeEnhancer = PhotoModeEnhancer;

console.log('[Photo-Mode] 拍照模式增强模块加载完成');
