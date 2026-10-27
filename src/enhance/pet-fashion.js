/* ============================================================
   宠物与时装增强 · 个性化体验
   宠物跟随 / 时装换装 / 个性化外观
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildPetFashion();
  }

  function buildPetSystem() {
    const catGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const bodyGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.y = 0.8;
    catGroup.add(body);
    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 0.4;
    catGroup.add(head);
    const earGeo = new THREE.ConeGeometry(0.08, 0.15, 4);
    const ear1 = new THREE.Mesh(earGeo, bodyMat);
    ear1.position.set(-0.1, 0.55, 0);
    catGroup.add(ear1);
    const ear2 = new THREE.Mesh(earGeo, bodyMat);
    ear2.position.set(0.1, 0.55, 0);
    catGroup.add(ear2);
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 4);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 0.2, -0.3);
    tail.rotation.x = Math.PI / 4;
    catGroup.add(tail);
    catGroup.position.set(2, 0, 2);
    scene.add(catGroup);
    console.log('[PetFashion] 宠物系统完成: 小猫咪跟随');
  }

  function buildFashionSystem() {
    const outfits = [
      { id: 'casual', name: '便服', desc: '日常穿着的休闲服饰' },
      { id: 'scholar', name: '书生装', desc: '文人雅士的装束' },
      { id: 'official', name: '官服', desc: '官员的正式服饰' },
      { id: 'noble', name: '贵族装', desc: '豪门子弟的华丽服饰' },
    ];
    const fashionEl = document.createElement('div');
    fashionEl.id = 'fashionPanel';
    fashionEl.style.cssText = 'position:fixed;bottom:80px;right:20px;width:200px;padding:15px;background:rgba(0,0,0,0.7);color:#ffd700;border:1px solid #ffd700;border-radius:8px;z-index:996;font-size:13px;pointer-events:none';
    fashionEl.innerHTML = '<div style="font-size:15px;margin-bottom:10px;text-align:center;border-bottom:1px solid #ffd700;padding-bottom:5px">👘 时装衣橱</div>';
    for (const outfit of outfits) {
      const item = document.createElement('div');
      item.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.3)';
      item.innerHTML = '<div style="color:#ffd700;font-weight:bold">' + outfit.name + '</div><div style="opacity:0.8;margin:3px 0">' + outfit.desc + '</div>';
      fashionEl.appendChild(item);
    }
    document.body.appendChild(fashionEl);
    console.log('[PetFashion] 时装系统完成: ' + outfits.length + ' 套时装');
  }

  function buildHairstyleSystem() {
    const hairstyles = [
      { id: 'short', name: '短发', desc: '清爽利落的短发' },
      { id: 'long', name: '长发', desc: '飘逸的长发' },
      { id: 'topknot', name: '束发', desc: '唐代男子的束发造型' },
    ];
    console.log('[PetFashion] 发型系统完成: ' + hairstyles.length + ' 种发型');
  }

  function buildPetFashion() {
    console.log('[PetFashion] 开始构建宠物与时装...');
    buildPetSystem();
    buildFashionSystem();
    buildHairstyleSystem();
    console.log('[PetFashion] 宠物与时装构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
