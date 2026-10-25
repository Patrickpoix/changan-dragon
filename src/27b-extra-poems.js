/* ============================================================
   额外诗笺扩展 · 从12首增加到16首
   ============================================================ */

// 在世界构建完成后动态添加额外诗笺
function buildExtraPoems() {
  if (typeof poems === 'undefined') return;
  
  const extraPoems = [
    { place: '太极宫', line: '九天阊阖开宫殿，万国衣冠拜冕旒', x: 0, z: -340 },
    { place: '小雁塔', line: '窣堵凌霄汉，浮图出烟雾', x: -216, z: 349 },
    { place: '曲江亭', line: '曲江丝管日纷纷，半入江风半入云', x: 300, z: 262 },
    { place: '明德门', line: '千轮万蹄踏晓霜，五门开启纳朝阳', x: 0, z: 390 },
  ];
  
  extraPoems.forEach((data, idx) => {
    const i = poems.length;
    const group = new THREE.Group();
    
    // 诗笺卡片（宣纸色）
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xf5e6c8, side: THREE.DoubleSide })
    );
    group.add(card);
    
    // 金色光晕
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: 0xffd060,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    }));
    glow.scale.set(2.35, 2.35, 1);
    group.add(glow);
    
    group.position.set(data.x, 1.25, data.z);
    scene.add(group);
    
    poems.push({
      x: data.x,
      z: data.z,
      place: data.place,
      line: data.line,
      group: group,
      taken: false,
      phase: idx * 1.7
    });
  });
  
  // 更新诗笺计数器
  updatePoemCounter();
  buildCollectionList();
}

function makeGlowTexture() {
  if (makeGlowTexture.cache) return makeGlowTexture.cache;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,220,120,0.8)');
  grad.addColorStop(0.5, 'rgba(255,200,80,0.3)');
  grad.addColorStop(1, 'rgba(255,180,40,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  makeGlowTexture.cache = new THREE.CanvasTexture(c);
  return makeGlowTexture.cache;
}

// 在 buildWorld() 完成后调用
if (typeof buildWorld !== 'undefined') {
  const origBuildWorld = buildWorld;
  buildWorld = async function() {
    await origBuildWorld();
    buildExtraPoems();
  };
}
