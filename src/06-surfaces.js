/* Shared real textile microdetail; all inputs embedded locally with CC0 grants. */
const SurfaceLibrary = (() => {
  const maps = {};
  const cache = new Map();
  const clothMaterials = []; // v2: track cloth materials for deferred normal map update
  function texture(name) {
    if (maps[name]) return maps[name];
    const source = typeof SCENE_MATERIALS !== 'undefined' && SCENE_MATERIALS.cloth[name];
    if (!source) return null;
    const map = new THREE.TextureLoader().load(source);
    map.colorSpace = THREE.NoColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(6, 4);
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return maps[name] = map;
  }
  return {
    softenStone(material) {
      material.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
          '#include <map_fragment>\n#ifdef USE_MAP\ndiffuseColor.rgb = mix(diffuse, diffuseColor.rgb, 0.34);\n#endif');
      };
      material.customProgramCacheKey = () => 'changan-soft-stone-v1';
      return material;
    },
    paving(color = 0xe4dfd0) {
      return this.softenStone(new THREE.MeshStandardMaterial({map:TEX.stone,bumpMap:TEX.stoneBump,bumpScale:0.015,color,roughness:0.94}));
    },
    architecture() {
      if (typeof SCENE_MATERIALS === 'undefined' || !SCENE_MATERIALS.architecture) return;
      for (const [family, materials] of [['roof', [MAT.roof, MAT.roofGlazed]], ['plaster', [MAT.plaster, MAT.plasterWarm]], ['earth', []]]) {
        const textures = {};
        for (const key of ['normal', 'roughness']) {
          const texture = new THREE.TextureLoader().load(SCENE_MATERIALS.architecture[family][key]);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(family==='earth'?1:family==='roof'?3:2,family==='earth'?1:2);
          texture.colorSpace = THREE.NoColorSpace;
          textures[key] = texture;
          maps[family+'-'+key]=texture;
        }
        for (const material of materials) {
          material.normalMap = textures.normal;
          material.normalScale = new THREE.Vector2(family === 'roof' ? 0.62 : 0.13, family === 'roof' ? 0.62 : 0.13);
          material.roughnessMap = textures.roughness;
          material.needsUpdate = true;
        }
      }
      // v4: 补绑pavingMaterial（25-exploration.js构建时MAT.plaster.normalMap为null）
      if (typeof window !== 'undefined' && window.__pavingMaterial) {
        window.__pavingMaterial.normalMap = maps['plaster-normal'];
        window.__pavingMaterial.normalScale = new THREE.Vector2(0.12, 0.12);
        window.__pavingMaterial.needsUpdate = true;
        console.log('[SurfaceLibrary] ✓ 铺路砖PBR法线补绑完成');
      }
    },
    // v2: Called after scene-materials.js loads to update cloth normal maps
    // on materials created earlier when SCENE_MATERIALS was undefined.
    refreshClothMaterials() {
      if (typeof SCENE_MATERIALS === 'undefined' || !SCENE_MATERIALS.cloth) return;
      const normal = texture('normal');
      const orm = texture('orm');
      if (!normal && !orm) return;
      for (const mat of clothMaterials) {
        if (normal && !mat.normalMap) { mat.normalMap = normal; mat.normalScale = new THREE.Vector2(0.17, 0.17); }
        if (orm && !mat.roughnessMap) mat.roughnessMap = orm;
        mat.needsUpdate = true;
      }
      // v3: personMat (20-character.js) is created with normalMap=null because
      // SurfaceLibrary.cloth() is called before SCENE_MATERIALS loads. It is not
      // in clothMaterials, so update it directly here.
      if (typeof personMat !== 'undefined') {
        if (normal && !personMat.normalMap) {
          personMat.normalMap = normal;
          personMat.normalScale = new THREE.Vector2(0.12, 0.12);
        }
        personMat.needsUpdate = true;
      }
      console.log('[SurfaceLibrary] ✓ 衣物PBR法线贴图补绑 (' + clothMaterials.length + '个材质 + personMat)');
    },
    rammedEarth() {
      if(cache.has('rammed-earth'))return cache.get('rammed-earth');
      const random=mulberry32(73310);
      const map=makeTexture(512,512,(ctx,w,h)=>{
        ctx.fillStyle='#c0b199';ctx.fillRect(0,0,w,h);
        for(let i=0;i<8;i++) {
          const y=i*h/8,gradient=ctx.createLinearGradient(0,y,0,y+h/8);
          gradient.addColorStop(0,'rgba(91,75,54,.08)');gradient.addColorStop(.16,'rgba(238,220,185,.035)');gradient.addColorStop(1,'rgba(126,104,73,.045)');
          ctx.fillStyle=gradient;ctx.fillRect(0,y,w,h/8);
          ctx.strokeStyle='rgba(114,94,65,.065)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,y);
          ctx.bezierCurveTo(w*.3,y+2,w*.7,y-2,w,y);ctx.stroke();
        }
        for(let i=0;i<9000;i++) {
          const x=random()*w,y=random()*h,size=.5+random()*2;
          ctx.fillStyle=random()>.5?'rgba(72,58,39,.035)':'rgba(244,230,206,.045)';ctx.fillRect(x,y,size,size);
        }
      });
      const material=new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:1,metalness:0,
        normalMap:maps['earth-normal'],normalScale:new THREE.Vector2(.24,.24),roughnessMap:maps['earth-roughness']});
      material.name='rammed-earth-with-CC0-clay-microdetail';cache.set('rammed-earth',material);return material;
    },
    cloth(color) {
      if (cache.has(color)) return cache.get(color);
      const material = new THREE.MeshPhysicalMaterial({
        color, roughness: 0.83, metalness: 0,
        normalMap: texture('normal'), normalScale: new THREE.Vector2(0.17, 0.17),
        roughnessMap: texture('orm'),
        sheen: 0.42, sheenColor: new THREE.Color(0xf2e6cf), sheenRoughness: 0.78,
        side: THREE.DoubleSide,
      });
      clothMaterials.push(material); // v2: track for deferred update
      cache.set(color, material);
      return material;
    },
    awning(color) {
      const key='awning-'+color;
      if(cache.has(key)) return cache.get(key);
      const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.fillRect(0,0,256,256);
      ctx.strokeStyle='#e9d1a0';ctx.lineWidth=1.4;ctx.globalAlpha=.62;
      for(const y of [10,17,205,213,246]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
      function medallion(x,y,r) {
        ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
        for(let i=0;i<8;i++) {
          const a=i*TAU/8;ctx.save();ctx.translate(x,y);ctx.rotate(a);
          ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-r*.46,-r*.6,-r*.16,-r*.9,0,-r*.94);
          ctx.bezierCurveTo(r*.16,-r*.9,r*.46,-r*.6,0,0);ctx.stroke();
        }
        ctx.beginPath();ctx.arc(x,y,r*.2,0,TAU);ctx.stroke();
      }
      for(let i=0;i<8;i++) medallion(32+i*64,111,20);
      for(let i=0;i<8;i++) medallion(16+i*32,230,8);
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
      map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      const material=this.cloth(color).clone();material.color.setHex(0xffffff);material.map=map;
      cache.set(key,material);return material;
    },
  };
})();
