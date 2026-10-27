/* ============================================================
   探索系统增强 — 漫步盛唐长安
   v1: 飞行模式、快速旅行、地图标记、探索成就
   ============================================================ */

(function() {
  'use strict';
  
  let flyMode = false;
  let flySpeed = 5;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Explore] 开始增强探索系统...']);
    
    setupFlyMode();
    setupFastTravel();
    setupMapMarkers();
    setupExplorationAchievements();
    
    console.log('[Explore] ✓ 探索系统增强完成');
  }
  
  // 飞行模式
  function setupFlyMode() {
    document.addEventListener('keydown', (e) => {
      // F键切换飞行模式
      if (e.key === 'f' || e.key === 'F') {
        flyMode = !flyMode;
        showToast(flyMode ? '✈️ 飞行模式已开启' : '🚶 步行模式');
        console.log('[Explore] 飞行模式: ' + flyMode);
      }
      
      // 飞行模式下空格上升，Shift下降
      if (flyMode) {
        if (e.key === ' ') {
          if (typeof camera !== 'undefined') {
            camera.position.y += flySpeed;
          }
        }
        if (e.key === 'Shift') {
          if (typeof camera !== 'undefined') {
            camera.position.y -= flySpeed;
          }
        }
      }
    });
    
    console.log('[Explore] 飞行模式已就绪，按F切换');
  }
  
  // 快速旅行
  function setupFastTravel() {
    const travelPoints = [
      { x: 0, z: 550, name: '明德门' },
      { x: 0, z: -450, name: '太极宫' },
      { x: 320, z: -460, name: '大明宫' },
      { x: 300, z: 420, name: '大雁塔' },
      { x: 520, z: 470, name: '曲江池' },
      { x: 610, z: -195, name: '兴庆宫' }
    ];
    
    // T键打开快速旅行菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        showFastTravelMenu(travelPoints);
      }
    });
    
    console.log('[Explore] 快速旅行已就绪，按T打开菜单');
  }
  
  // 地图标记
  function setupMapMarkers() {
    const markers = [
      { x: 320, z: -460, type: 'palace' },
      { x: 0, z: -450, type: 'palace' },
      { x: 610, z: -195, type: 'palace' },
      { x: 300, z: 420, type: 'tower' },
      { x: -300, z: 480, type: 'tower' },
      { x: 520, z: 470, type: 'lake' },
      { x: 0, z: 550, type: 'gate' },
      { x: 150, z: -100, type: 'market' },
      { x: -150, z: -100, type: 'market' }
    ];
    
    markers.forEach(marker => {
      // 创建地图标记
      const markerGeo = new THREE.SphereGeometry(0.5, 6, 4);
      let markerColor;
      switch(marker.type) {
        case 'palace': markerColor = 0xffd700; break;
        case 'tower': markerColor = 0xff6644; break;
        case 'lake': markerColor = 0x4488ff; break;
        case 'gate': markerColor = 0xff4444; break;
        case 'market': markerColor = 0x44ff44; break;
        default: markerColor = 0xffffff;
      }
      
      const markerMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.5
      });
      
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(marker.x, 5, marker.z);
      markerMesh.userData.isMarker = true;
      markerMesh.userData.markerType = marker.type;
      scene.add(markerMesh);
    });
    
    console.log('[Explore] 已添加 ' + markers.length + ' 个地图标记');
  }
  
  // 探索成就
  function setupExplorationAchievements() {
    const achievements = [
      { id: 'explorer-1', name: '初入长安', condition: '踏入长安城' },
      { id: 'explorer-2', name: '朱雀大街', condition: '走过朱雀大街' },
      { id: 'explorer-3', name: '皇宫禁地', condition: '参观大明宫' },
      { id: 'explorer-4', name: '雁塔题名', condition: '登上大雁塔' },
      { id: 'explorer-5', name: '曲江泛舟', condition: '游览曲江池' },
      { id: 'explorer-6', name: '长安通', condition: '到访所有地标' }
    ];
    
    console.log('[Explore] 探索成就已加载，共 ' + achievements.length + ' 个');
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
    setTimeout(() => toast.remove(), 3000);
  }
  
  function showFastTravelMenu(points) {
    // 创建菜单
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0, 0, 0, 0.9)';
    menu.style.border = '2px solid #8b4513';
    menu.style.borderRadius = '8px';
    menu.style.padding = '20px';
    menu.style.zIndex = '1000';
    
    const title = document.createElement('h3');
    title.textContent = '📍 快速旅行';
    title.style.color = '#ffd700';
    title.style.fontFamily = 'serif';
    title.style.marginBottom = '15px';
    menu.appendChild(title);
    
    points.forEach(point => {
      const btn = document.createElement('button');
      btn.textContent = point.name;
      btn.style.display = 'block';
      btn.style.width = '200px';
      btn.style.margin = '5px 0';
      btn.style.padding = '8px';
      btn.style.background = 'linear-gradient(180deg, #8b4513, #654321)';
      btn.style.border = '1px solid #ffd700';
      btn.style.color = '#ffd700';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      
      btn.onclick = () => {
        if (typeof camera !== 'undefined') {
          camera.position.set(point.x, 20, point.z);
          showToast('已传送到: ' + point.name);
        }
        menu.remove();
      };
      
      menu.appendChild(btn);
    });
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => menu.remove();
    menu.appendChild(closeBtn);
    
    document.body.appendChild(menu);
  }
  
  init();
})();
