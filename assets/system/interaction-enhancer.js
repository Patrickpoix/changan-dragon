/* ============================================================
   交互系统增强 v2.0
   点击交互、景点提示、诗笺收集
   ============================================================ */

const InteractionEnhancer = {
  
  interactables: [],
  
  raycaster: new THREE.Raycaster(),
  
  mouse: new THREE.Vector2(),
  
  selectedObject: null,
  
  tooltip: null,
  
  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.createTooltip();
    this.setupEventListeners();
    
    console.log('[Interaction] 交互系统初始化完成');
  },
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: absolute;
      display: none;
      background: rgba(0, 0, 0, 0.8);
      color: #ffd700;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: serif;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      border: 1px solid #d4af37;
    `;
    document.body.appendChild(this.tooltip);
  },
  
  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.tooltip.style.left = e.clientX + 10 + 'px';
      this.tooltip.style.top = e.clientY + 10 + 'px';
    });
    
    document.addEventListener('click', (e) => {
      this.handleClick();
    });
  },
  
  addInteractable(object, data) {
    object.userData.interactive = true;
    object.userData.data = data;
    this.interactables.push(object);
  },
  
  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const intersects = this.raycaster.intersectObjects(this.interactables, true);
    
    if (intersects.length > 0) {
      let object = intersects[0].object;
      
      while (object && !object.userData.interactive) {
        object = object.parent;
      }
      
      if (object && object.userData.interactive) {
        this.onInteract(object);
      }
    }
  },
  
  onInteract(object) {
    const data = object.userData.data;
    
    if (data.type === 'landmark') {
      this.showLandmarkInfo(data);
    } else if (data.type === 'poem') {
      this.collectPoem(data);
    } else if (data.type === 'npc') {
      this.talkToNPC(data);
    }
  },
  
  showLandmarkInfo(data) {
    console.log('[Interaction] 景点:', data.name);
    
    this.tooltip.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${data.name}</div>
      <div style="font-size: 12px;">${data.description}</div>
    `;
    this.tooltip.style.display = 'block';
    
    if (window.GAME) {
      if (!GAME.visitedLandmarks) GAME.visitedLandmarks = [];
      if (!GAME.visitedLandmarks.includes(data.id)) {
        GAME.visitedLandmarks.push(data.id);
        console.log('[Interaction] 新景点已解锁:', data.name);
      }
    }
    
    setTimeout(() => {
      this.tooltip.style.display = 'none';
    }, 3000);
  },
  
  collectPoem(data) {
    console.log('[Interaction] 收集诗笺:', data.title);
    
    this.tooltip.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">获得诗笺</div>
      <div style="font-size: 14px;">《${data.title}》</div>
    `;
    this.tooltip.style.display = 'block';
    
    if (window.GAME) {
      if (!GAME.collectedPoems) GAME.collectedPoems = [];
      GAME.collectedPoems.push(data.id);
    }
    
    if (data.object) {
      data.object.visible = false;
    }
    
    setTimeout(() => {
      this.tooltip.style.display = 'none';
    }, 3000);
  },
  
  talkToNPC(data) {
    console.log('[Interaction] 对话:', data.name);
    
    this.tooltip.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${data.name}</div>
      <div style="font-size: 14px;">${data.dialogue}</div>
    `;
    this.tooltip.style.display = 'block';
    
    setTimeout(() => {
      this.tooltip.style.display = 'none';
    }, 4000);
  },
  
  update() {
    if (!this.camera) return;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);
    
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }
};

window.InteractionEnhancer = InteractionEnhancer;

console.log('[Interaction] 交互系统增强模块加载完成');
