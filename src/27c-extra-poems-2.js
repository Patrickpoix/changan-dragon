/* ============================================================
   诗笺扩展第二批 · 从16首增加到20首
   ============================================================ */

(function() {
  const morePoems = [
    { place: '西市', line: '胡姬春酒，一杯十千，与君同醉', x: -258, z: 20 },
    { place: '东市', line: '长安回望绣成堆，山顶千门次第开', x: 174, z: 20 },
    { place: '曲江池', line: '三月三日天气新，长安水边多丽人', x: 354, z: 318 },
    { place: '兴庆宫', line: '名花倾国两相欢，长得君王带笑看', x: 342, z: -152 },
  ];
  
  if (typeof poems === 'undefined') return;
  
  morePoems.forEach((data, idx) => {
    const i = poems.length;
    const group = new THREE.Group();
    
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xf5e6c8, side: THREE.DoubleSide })
    );
    group.add(card);
    
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
      phase: idx * 2.3 + 10
    });
  });
  
  if (typeof updatePoemCounter === 'function') updatePoemCounter();
  if (typeof buildCollectionList === 'function') buildCollectionList();
})();
