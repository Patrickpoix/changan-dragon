/* Shared real textile microdetail; all inputs embedded locally with CC0 grants. */
const SurfaceLibrary = (() => {
  const maps = {};
  const cache = new Map();
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
      // Keep the source's real mineral detail while reducing photographic
      // contrast that otherwise turns the entire stylized city into brown blocks.
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
      for (const [family, materials] of [['roof', [MAT.roof, MAT.roofGlazed]], ['plaster', [MAT.plaster, MAT.plasterWarm]]]) {
        const textures = {};
        for (const key of ['normal', 'roughness']) {
          const texture = new THREE.TextureLoader().load(SCENE_MATERIALS.architecture[family][key]);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(family === 'roof' ? 3 : 2, 2);
          texture.colorSpace = THREE.NoColorSpace;
          textures[key] = texture;
        }
        for (const material of materials) {
          material.normalMap = textures.normal;
          material.normalScale = new THREE.Vector2(family === 'roof' ? 0.62 : 0.13, family === 'roof' ? 0.62 : 0.13);
          material.roughnessMap = textures.roughness;
          material.needsUpdate = true;
        }
      }
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
      cache.set(color, material);
      return material;
    },
    awning(color) {
      const key='awning-'+color;
      if(cache.has(key)) return cache.get(key);
      // Original vector ornament, printed onto real cloth geometry. The source
      // CC0 textile normal/roughness maps still supply its fine weave.
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
          ctx.bezierCurveTo(r*.16,-r*.9,r*.46,-r*.6,0,0);ctx.stroke();ctx.restore();
        }
        ctx.beginPath();ctx.arc(x,y,r*.2,0,TAU);ctx.stroke();
      }
      for(let i=0;i<4;i++) medallion(32+i*64,111,20);
      for(let i=0;i<8;i++) medallion(16+i*32,230,8);
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
      map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      const material=this.cloth(color).clone();material.color.setHex(0xffffff);material.map=map;
      cache.set(key,material);return material;
    },
  };
})();
