/* ============================================================
   游戏交互系统 · 景点提示/诗笺收集/移动模式
   ============================================================ */

class GameInteractionSystem {
  constructor() {
    this.poemCollection = [];
    this.currentMode = 'walk'; // walk / ride / fly
    this.spots = [
      { name: '朱雀大街', x: 0, z: 0, poem: '百千家似围棋局，十二街如种菜畦。' },
      { name: '大明宫', x: 0, z: -100, poem: '九天阊阖开宫殿，万国衣冠拜冕旒。' },
      { name: '大雁塔', x: 200, z: 100, poem: '塔势如涌出，孤高耸天宫。' },
      { name: '曲江池', x: -100, z: 200, poem: '曲江水满花千树，有底忙时不肯来。' },
      { name: '兴庆宫', x: 100, z: -200, poem: '花萼楼前雨露新，长安城里太平人。' },
    ];
    this.visitedSpots = new Set();
  },

  // 检查景点靠近
  checkSpots() {
    if (typeof camera === 'undefined') return;
    const playerPos = camera.position;

    for (const spot of this.spots) {
      const dist = Math.sqrt(
        Math.pow(playerPos.x - spot.x, 2) +
        Math.pow(playerPos.z - spot.z, 2)
      );

      // 靠近景点时显示提示
      if (dist < 50 && !this.visitedSpots.has(spot.name)) {
        this.showSpotTip(spot);
        this.visitedSpots.add(spot.name);
      }
    }
  },

  // 显示景点提示
  showSpotTip(spot) {
    // 创建提示UI
    const tip = document.createElement('div');
    tip.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: #f0e6d2;
      padding: 20px 40px;
      border-radius: 8px;
      border: 2px solid #d4af37;
      font-family: "Ma Shan Zheng", serif;
      font-size: 24px;
      text-align: center;
      z-index: 1000;
      animation: fadeIn 1s;
    `;
    tip.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 10px;">${spot.name}</div>
      <div style="font-size: 18px; color: #d4af37;">${spot.poem}</div>
    `;
    document.body.appendChild(tip);

    // 3秒后消失
    setTimeout(() => {
      tip.style.opacity = '0';
      tip.style.transition = 'opacity 1s';
      setTimeout(() => tip.remove(), 1000);
    }, 3000);

    // 收集诗笺
    this.poemCollection.push(spot);
    console.log(`[GameInteractionSystem] 发现景点：${spot.name}，收集诗笺`);
  },

  // 切换移动模式
  toggleMode() {
    const modes = ['walk', 'ride', 'fly'];
    const currentIdx = modes.indexOf(this.currentMode);
    this.currentMode = modes[(currentIdx + 1) % modes.length];

    // 显示模式提示
    const modeNames = { walk: '步行', ride: '骑行', fly: '飞行' };
    console.log(`[GameInteractionSystem] 切换到${modeNames[this.currentMode]}模式`);

    // 调整速度
    if (typeof playerSpeed !== 'undefined') {
      const speeds = { walk: 5, ride: 15, fly: 30 };
      playerSpeed = speeds[this.currentMode];
    }
  },

  // 键盘快捷键
  initKeyboard() {
    document.addEventListener('keydown', (e) => {
      // G键：景点直达
      if (e.key === 'g' || e.key === 'G') {
        this.toggleMode();
      }
      // E键：拾取诗笺
      if (e.key === 'e' || e.key === 'E') {
        this.checkSpots();
      }
    });
  },

  init() {
    this.initKeyboard();
    console.log('[GameInteractionSystem] 游戏交互系统初始化完成');
  },
}

// 全局实例
let gameInteraction = null;

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    gameInteraction = new GameInteractionSystem();
    gameInteraction.init();
  };
}
