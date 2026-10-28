/* ============================================================
   NPC系统增强 v2.0
   NPC生成、对话、巡逻、生活气息
   ============================================================ */

const NPCSystemEnhancer = {
  
  npcs: [],
  
  npcGenerator: null,
  
  init() {
    console.log('[NPC] NPC系统初始化完成');
  },
  
  spawnNPC(type, x, z, name) {
    let npc;
    
    if (typeof TangCharacterBuilder !== 'undefined') {
      switch (type) {
        case 'official':
          npc = TangCharacterBuilder.createOfficial(1);
          break;
        case 'lady':
          npc = TangCharacterBuilder.createLady(1);
          break;
        case 'merchant':
          npc = TangCharacterBuilder.createMerchant(1);
          break;
        case 'commoner':
        default:
          npc = TangCharacterBuilder.createCommoner(1);
      }
    } else {
      npc = this.createSimpleNPC(type);
    }
    
    npc.position.set(x, 0, z);
    npc.userData = {
      type: 'npc',
      npcType: type,
      name: name || '路人',
      dialogue: this.getRandomDialogue(type),
      patrolRadius: 5,
      patrolCenter: { x: x, z: z },
    };
    
    this.npcs.push(npc);
    
    if (window.GAME?.scene) {
      GAME.scene.add(npc);
    }
    
    return npc;
  },
  
  createSimpleNPC(type) {
    const group = new THREE.Group();
    
    const bodyColors = {
      official: 0x4a6b8a,
      lady: 0xffb7c5,
      merchant: 0x8b6f47,
      commoner: 0x8b7355,
    };
    
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: bodyColors[type] || bodyColors.commoner })
    );
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);
    
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xf0d0b0 })
    );
    head.position.y = 1.6;
    group.add(head);
    
    return group;
  },
  
  getRandomDialogue(type) {
    const dialogues = {
      official: [
        '今日天气甚好，适合出游。',
        '大人请了，今日可去曲江池一游？',
      ],
      lady: [
        '今日的桃花开得正好。',
        '听说西市新到了一批丝绸。',
      ],
      merchant: [
        '客官，看看上好的唐三彩！',
        '西域来的新奇货物，看看吧！',
      ],
      commoner: [
        '今天的人可真多啊。',
        '听说大明宫今天有宴席。',
      ],
    };
    
    const typeDialogues = dialogues[type] || dialogues.commoner;
    return typeDialogues[Math.floor(Math.random() * typeDialogues.length)];
  },
  
  spawnStreetNPCs(count, xMin, xMax, zMin, zMax) {
    const types = ['official', 'lady', 'merchant', 'commoner'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const x = xMin + Math.random() * (xMax - xMin);
      const z = zMin + Math.random() * (zMax - zMin);
      
      this.spawnNPC(type, x, z);
    }
    
    console.log(`[NPC] 生成了 ${count} 个街区NPC`);
  },
  
  update(deltaTime, time) {
    this.npcs.forEach(npc => {
      if (!npc.userData.patrolRadius) return;
      
      const center = npc.userData.patrolCenter;
      const radius = npc.userData.patrolRadius;
      
      const angle = time * 0.5 + npc.position.x;
      npc.position.x = center.x + Math.sin(angle) * radius;
      npc.position.z = center.z + Math.cos(angle) * radius * 0.5;
      
      npc.rotation.y = angle + Math.PI / 2;
    });
  },
  
  talkToNPC(npc) {
    const data = npc.userData;
    
    console.log(`[NPC] 与 ${data.name} 对话: ${data.dialogue}`);
    
    if (window.InteractionEnhancer) {
      InteractionEnhancer.talkToNPC({
        name: data.name,
        dialogue: data.dialogue,
      });
    }
  }
};

window.NPCSystemEnhancer = NPCSystemEnhancer;

console.log('[NPC] NPC系统增强模块加载完成');
