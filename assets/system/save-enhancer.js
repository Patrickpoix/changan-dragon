/* ============================================================
   存档系统增强 v2.0
   自动存档、手动存档、云存档
   ============================================================ */

const SaveSystemEnhancer = {
  
  version: '2.0.0',
  
  slots: 3,
  
  currentSlot: 0,
  
  autoSaveInterval: 30000,
  
  autoSaveTimer: null,
  
  init() {
    this.loadSaveData();
    this.startAutoSave();
    console.log('[Save] 存档系统初始化完成，版本:', this.version);
  },
  
  save(slot = this.currentSlot) {
    const saveData = {
      version: this.version,
      timestamp: Date.now(),
      player: {
        position: window.GAME?.playerPosition || { x: 0, y: 0, z: 0 },
        rotation: window.GAME?.playerRotation || 0,
        mode: window.GAME?.moveMode || 'walk',
      },
      gameState: {
        timeOfDay: window.GAME?.timeOfDay || 0.5,
        weather: window.GAME?.weather || 'sunny',
        visitedLandmarks: window.GAME?.visitedLandmarks || [],
        collectedPoems: window.GAME?.collectedPoems || [],
      },
      progress: window.GAME?.progress || {},
    };
    
    try {
      localStorage.setItem(`changan_save_${slot}`, JSON.stringify(saveData));
      console.log(`[Save] 存档成功 - 槽位 ${slot}`);
      return true;
    } catch (e) {
      console.error('[Save] 存档失败:', e);
      return false;
    }
  },
  
  load(slot = this.currentSlot) {
    try {
      const data = localStorage.getItem(`changan_save_${slot}`);
      if (!data) {
        console.log(`[Save] 槽位 ${slot} 无存档`);
        return null;
      }
      
      const saveData = JSON.parse(data);
      console.log(`[Save] 读档成功 - 槽位 ${slot}`);
      return saveData;
    } catch (e) {
      console.error('[Save] 读档失败:', e);
      return null;
    }
  },
  
  delete(slot) {
    try {
      localStorage.removeItem(`changan_save_${slot}`);
      console.log(`[Save] 存档已删除 - 槽位 ${slot}`);
      return true;
    } catch (e) {
      console.error('[Save] 删除存档失败:', e);
      return false;
    }
  },
  
  getSaveInfo(slot) {
    const data = this.load(slot);
    if (!data) return null;
    
    return {
      timestamp: new Date(data.timestamp).toLocaleString(),
      version: data.version,
      position: data.player.position,
    };
  },
  
  startAutoSave() {
    if (this.autoSaveTimer) return;
    
    this.autoSaveTimer = setInterval(() => {
      this.save(this.currentSlot);
      console.log('[Save] 自动存档完成');
    }, this.autoSaveInterval);
    
    console.log('[Save] 自动存档已启动，间隔:', this.autoSaveInterval / 1000, '秒');
  },
  
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('[Save] 自动存档已停止');
    }
  },
  
  loadSaveData() {
    for (let i = 0; i < this.slots; i++) {
      const info = this.getSaveInfo(i);
      if (info) {
        console.log(`[Save] 槽位 ${i}:`, info.timestamp);
      }
    }
  }
};

window.SaveSystemEnhancer = SaveSystemEnhancer;

console.log('[Save] 存档系统增强模块加载完成');
