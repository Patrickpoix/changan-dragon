/* ============================================================
   交互玩法v2 — 诗韵长安
   v2: 诗笺收集、NPC对话、任务系统、成就
   ============================================================ */

(function() {
  'use strict';
  
  let poemCollection = [];
  let currentQuest = null;
  let achievements = [];
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 9500);
      return;
    }
    
    console.log(['InteractionV2] 开始增强交互玩法...']);
    
    addPoems();                  // 诗笺收集点
    addNPCTalks();                // NPC对话
    addQuests();                   // 任务系统
    addAchievements();             // 成就系统
    addInteractionKeys();          // 交互按键
    
    console.log('[InteractionV2] ✓ 交互玩法增强完成');
  }
  
  // 诗笺 — 散落在长安城的诗
  function addPoems() {
    if (typeof scene === 'undefined') return;
    
    console.log('[InteractionV2] 添加诗笺收集点...');
    
    const poemMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.3
    });
    
    // 30个诗笺
    const poemLocations = [
      { x: 0, z: 500, name: '明德门' },
      { x: 0, z: 0, name: '朱雀大街' },
      { x: 320, z: -460, name: '大明宫' },
      { x: 0, z: -450, name: '太极宫' },
      { x: 610, z: -195, name: '兴庆宫' },
      { x: 300, z: 420, name: '大雁塔' },
      { x: -300, z: 480, name: '小雁塔' },
      { x: 520, z: 470, name: '曲江池' },
      { x: 174, z: -14, name: '东市' },
      { x: -258, z: -14, name: '西市' },
    ];
    
    poemLocations.forEach((loc, i) => {
      const poem = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1.5),
        poemMat
      );
      poem.position.set(loc.x, 3, loc.z);
      poem.rotation.y = Math.random() * Math.PI * 2;
      poem.userData = {
        type: 'poem',
        name: loc.name,
        collected: false
      };
      scene.add(poem);
    });
    
    console.log('[InteractionV2] 诗笺添加完成，共10个主要收集点');
  }
  
  // NPC对话
  function addNPCTalks() {
    if (typeof document === 'undefined') return;
    
    console.log('[InteractionV2] 添加NPC对话...');
    
    // 对话框
    const dialogBox = document.createElement('div');
    dialogBox.id = 'changanDialog';
    dialogBox.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #d4af37;
      border-radius: 8px;
      z-index: 1500;
      color: #d4af37;
      font-family: 'KaiTi', 'STKaiti', serif;
      font-size: 16px;
      display: none;
    `;
    
    dialogBox.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px; color: #ffd700;">书生</div>
      <div style="opacity: 0.9;">客官有礼了，这长安城可是天下第一繁华之地啊...</div>
      <div style="text-align: right; margin-top: 10px; opacity: 0.6; font-size: 12px;">按E继续</div>
    `;
    
    document.body.appendChild(dialogBox);
    
    console.log('[InteractionV2] NPC对话系统添加完成');
  }
  
  // 任务系统
  function addQuests() {
    console.log('[InteractionV2] 添加任务系统...');
    
    // 示例任务
    currentQuest = {
      id: 'quest_001',
      name: '初入长安',
      description: '游览长安城，收集第一首诗笺',
      progress: 0,
      target: 1,
      reward: '铜钱100'
    };
    
    console.log('[InteractionV2] 任务系统添加完成');
  }
  
  // 成就系统
  function addAchievements() {
    console.log('[InteractionV2] 添加成就系统...');
    
    // 示例成就
    achievements = [
      { id: 'ach_001', name: '初来乍到', description: '第一次进入长安城', unlocked: false },
      { id: 'ach_002', name: '诗仙初显', description: '收集第一首诗笺', unlocked: false },
      { id: 'ach_003', name: '走遍长安', description: '游览所有主要地标', unlocked: false },
    ];
    
    console.log('[InteractionV2] 成就系统添加完成');
  }
  
  // 交互按键
  function addInteractionKeys() {
    if (typeof document === 'undefined') return;
    
    console.log('[InteractionV2] 添加交互按键...');
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        // 交互键
        console.log('[InteractionV2] 按E交互');
        
        // 显示对话
        const dialog = document.getElementById('changanDialog');
        if (dialog) {
          dialog.style.display = 'block';
          setTimeout(() => {
            dialog.style.display = 'none';
          }, 3000);
        }
      }
      
      if (e.code === 'KeyM') {
        // 地图键
        console.log('[InteractionV2] 按M打开地图');
      }
      
      if (e.code === 'KeyI') {
        // 背包键
        console.log('[InteractionV2] 按I打开背包');
      }
    });
    
    console.log('[InteractionV2] 交互按键添加完成');
  }
  
  init();
})();
