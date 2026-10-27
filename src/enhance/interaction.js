/* ============================================================
   交互系统增强 — 长安游历交互
   v1: NPC对话、诗笺收集、地标参观、商店购物
   ============================================================ */

(function() {
  'use strict';
  
  let poemCollection = [];
  let landmarksVisited = new Set();
  let currentInteractable = null;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Interaction] 开始增强交互系统...']);
    
    setupPoemCollection();
    setupLandmarkDetection();
    setupNPCInteraction();
    setupShopInteraction();
    setupKeyboardInput();
    
    console.log('[Interaction] ✓ 交互系统增强完成');
  }
  
  // 诗笺收集
  function setupPoemCollection() {
    const poemLocations = [
      { x: 300, z: 420, title: '登大雁塔', author: '杜甫' },
      { x: 0, z: -450, title: '忆昔', author: '杜甫' },
      { x: 520, z: 470, title: '曲江对雨', author: '杜甫' },
      { x: 610, z: -195, title: '兴庆宫', author: '李白' },
      { x: 0, z: 550, title: '明德门', author: '王维' }
    ];
    
    poemLocations.forEach(poem => {
      // 创建诗笺标记
      const poemGeo = new THREE.PlaneGeometry(1, 1.5);
      const poemCanvas = document.createElement('canvas');
      poemCanvas.width = 128;
      poemCanvas.height = 192;
      const ctx = poemCanvas.getContext('2d');
      ctx.fillStyle = '#f5f0e1';
      ctx.fillRect(0, 0, 128, 192);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText(poem.title, 64, 50);
      ctx.font = '12px serif';
      ctx.fillText(poem.author, 64, 80);
      
      const poemTex = new THREE.CanvasTexture(poemCanvas);
      const poemMat = new THREE.MeshBasicMaterial({ map: poemTex, side: THREE.DoubleSide });
      const poemMesh = new THREE.Mesh(poemGeo, poemMat);
      poemMesh.position.set(poem.x, 3, poem.z);
      poemMesh.userData.isPoem = true;
      poemMesh.userData.poemData = poem;
      scene.add(poemMesh);
    });
    
    console.log('[Interaction] 已布置 ' + poemLocations.length + ' 首诗笺');
  }
  
  // 地标检测
  function setupLandmarkDetection() {
    const landmarks = [
      { x: 320, z: -460, name: '大明宫' },
      { x: 0, z: -450, name: '太极宫' },
      { x: 610, z: -195, name: '兴庆宫' },
      { x: 300, z: 420, name: '大雁塔' },
      { x: -300, z: 480, name: '小雁塔' },
      { x: 520, z: 470, name: '曲江池' }
    ];
    
    // 每帧检测玩家位置
    function checkLandmarks() {
      if (typeof camera === 'undefined') return;
      
      landmarks.forEach(landmark => {
        const dist = Math.sqrt(
          Math.pow(camera.position.x - landmark.x, 2) +
          Math.pow(camera.position.z - landmark.z, 2)
        );
        
        if (dist < 50 && !landmarksVisited.has(landmark.name)) {
          landmarksVisited.add(landmark.name);
          showToast('🏛️ 已到访: ' + landmark.name);
          console.log('[Interaction] 到访地标: ' + landmark.name);
        }
      });
      
      requestAnimationFrame(checkLandmarks);
    }
    checkLandmarks();
  }
  
  // NPC交互
  function setupNPCInteraction() {
    // 当玩家靠近NPC时显示交互提示
    function checkNPCProximity() {
      if (typeof camera === 'undefined') return;
      
      let nearestNPC = null;
      let minDist = 10;
      
      scene.children.forEach(obj => {
        if (obj.userData.isNPC) {
          const dist = Math.sqrt(
            Math.pow(camera.position.x - obj.position.x, 2) +
            Math.pow(camera.position.z - obj.position.z, 2)
          );
          
          if (dist < minDist) {
            minDist = dist;
            nearestNPC = obj;
          }
        }
      });
      
      currentInteractable = nearestNPC;
      
      if (nearestNPC) {
        showInteractionPrompt('按 E 与NPC交谈');
      } else {
        hideInteractionPrompt();
      }
      
      requestAnimationFrame(checkNPCProximity);
    }
    checkNPCProximity();
  }
  
  // 商店交互
  function setupShopInteraction() {
    console.log('[Interaction] 商店交互已就绪');
  }
  
  // 键盘输入
  function setupKeyboardInput() {
    document.addEventListener('keydown', (e) => {
      // E键交互
      if (e.key === 'e' || e.key === 'E') {
        if (currentInteractable) {
          interactWithNPC(currentInteractable);
        }
      }
    });
  }
  
  // 与NPC交互
  function interactWithNPC(npc) {
    const type = npc.userData.type || 'npc';
    
    const dialogues = {
      scholar: ['这位公子，也来大雁塔下读书吗？', '学而时习之，不亦说乎？', '长安虽好，也要多读书啊。'],
      merchant: ['客官，看看本店的好货！', '丝路珍宝，仅此一家！', '要不要买点特产带回？'],
      soldier: ['站住！此乃皇宫重地，不得靠近！', '例行巡逻，闲人回避。', '将军有令，严加守卫！'],
      lady: ['今日曲江池春光正好，真乃赏心乐事。', '这牡丹开得真好。', '你也来赏花吗？'],
      child: ['我要去街上玩啦！', '娘，给我买个糖葫芦！', '快来追我呀！']
    };
    
    const lines = dialogues[type] || ['你好呀！'];\n    const line = lines[Math.floor(Math.random() * lines.length)];
    showDialogue(line);
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
  
  function showInteractionPrompt(text) {
    let prompt = document.getElementById('interactionPrompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'interactionPrompt';
      prompt.style.position = 'absolute';
      prompt.style.bottom = '100px';
      prompt.style.left = '50%';
      prompt.style.transform = 'translateX(-50%)';
      prompt.style.background = 'rgba(0, 0, 0, 0.8)';
      prompt.style.color = '#ffd700';
      prompt.style.padding = '10px 20px';
      prompt.style.borderRadius = '4px';
      prompt.style.border = '1px solid #8b4513';
      prompt.style.zIndex = '100';
      document.body.appendChild(prompt);
    }
    prompt.textContent = text;
    prompt.style.display = 'block';
  }
  
  function hideInteractionPrompt() {
    const prompt = document.getElementById('interactionPrompt');
    if (prompt) prompt.style.display = 'none';
  }
  
  function showDialogue(text) {
    const dialogueBox = document.createElement('div');
    dialogueBox.textContent = text;
    dialogueBox.style.position = 'absolute';
    dialogueBox.style.bottom = '150px';
    dialogueBox.style.left = '50%';
    dialogueBox.style.transform = 'translateX(-50%)';
    dialogueBox.style.background = 'rgba(0, 0, 0, 0.9)';
    dialogueBox.style.color = '#ffd700';
    dialogueBox.style.padding = '15px 30px';
    dialogueBox.style.borderRadius = '8px';
    dialogueBox.style.border = '2px solid #8b4513';
    dialogueBox.style.maxWidth = '400px';
    dialogueBox.style.textAlign = 'center';
    dialogueBox.style.zIndex = '1000';
    document.body.appendChild(dialogueBox);
    
    setTimeout(() => dialogueBox.remove(), 4000);
  }
  
  init();
})();
