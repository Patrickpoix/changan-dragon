/* Real, locally bundled CC0 models. All instances share the imported meshes and
   PBR textures; each source is decoded once. No runtime network or CDN access. */
const WorldAssets = (() => {
  'use strict';
  const templates = new Map();
  let pending = null;
  let result = null;
  let imported = null;
  const errors = [], treePlacements = [], animals = [];
  const animalPoint = new THREE.Vector3(), animalTangent = new THREE.Vector3();

  function decodeBase64(encoded) {
    const raw = atob(encoded);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes.buffer;
  }

  function loadModel(entry) {
    return new Promise((resolve, reject) => {
      const Loader = window.ChanganRenderingAddons?.GLTFLoader;
      if (!Loader) return reject(new Error('Local GLTFLoader is unavailable'));
      const loader = new Loader();
      loader.parse(decodeBase64(entry.base64), '', gltf => {
        try {
          const source = gltf.scene;
          if (!source) throw new Error('GLB has no scene');
          source.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(source);
          const dimensions = box.getSize(new THREE.Vector3());
          if (![dimensions.x, dimensions.y, dimensions.z].every(Number.isFinite) || dimensions.y <= 0.001) {
            throw new Error('GLB has invalid physical bounds');
          }
          // Center horizontally and place the source floor on y=0 while keeping
          // the authored glTF orientation, materials, UVs and handle geometry.
          const origin = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
          const normalized = new THREE.Group();
          normalized.name = 'source-' + entry.id;
          source.position.sub(origin);
          normalized.add(source);
          const seen = new Set();
          let meshes = 0, triangles = 0;
          source.traverse(object => {
            if (!object.isMesh) return;
            meshes++;
            triangles += object.geometry.index ? object.geometry.index.count / 3 : object.geometry.attributes.position.count / 3;
            object.castShadow = !entry.id.startsWith('food_');
            object.receiveShadow = true;
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
              if (!material || seen.has(material)) continue;
              seen.add(material);
              // Preserve source albedo. Wicker and pottery remain physically
              // rough under the shared sunset environment rather than metallic.
              material.envMapIntensity = 0.72;
              if (typeof material.roughness === 'number') material.roughness = Math.max(0.55, material.roughness);
              for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
                if (material[key]) material[key].anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
              }
              if (entry.id === 'tree_small_02' && /leaves/i.test(material.name)) {
                material.transparent=false;material.alphaTest=.35;material.depthWrite=true;material.roughness=.9;
              }
              material.needsUpdate = true;
            }
          });
          if (!meshes) throw new Error('GLB contains no renderable meshes');
          const template = { root: normalized, dimensions, meshes, triangles, entry, animations:gltf.animations||[],variants:[] };
          templates.set(entry.id, template);
          if (['rock_moss_set_01', 'fern_02', 'grass_bermuda_01','food_pears_asian_01'].includes(entry.id)) {
            // These sources are presentation sheets. Normalize each authored
            // node independently instead of cloning the catalogue arrangement.
            source.traverse(object => {
              if (!object.isMesh) return;
              const node = object.clone(true); node.position.set(0,0,0);
              const bounds = new THREE.Box3().setFromObject(node), size = bounds.getSize(new THREE.Vector3());
              const variant = new THREE.Group();
              node.position.sub(new THREE.Vector3((bounds.min.x+bounds.max.x)/2,bounds.min.y,(bounds.min.z+bounds.max.z)/2));
              variant.add(node);
              templates.set(object.name,{root:variant,dimensions:size,meshes:1,entry,variant:true});
              template.variants.push(object.name);
            });
          }
          // Decoding is cached by populate(); keep the shared geometry/images,
          // rather than another multi-megabyte encoded copy on small phones.
          if(!Object.isFrozen(entry)) entry.base64='';
          resolve(template);
        } catch (error) { reject(error); }
      }, reject);
    });
  }

  function place(modelId, x, y, z, height, yaw, label, pitch=0) {
    const template = templates.get(modelId);
    if (!template) return false;
    if(y<.3&&['ceramic_pot','wooden_bucket_01','chinese_stool','wicker_basket_01','wooden_bowl_02'].includes(template.entry.id))y=Math.max(y,groundHeightAt(x,z));
    const instance = template.root.clone(true);
    instance.name = label;
    instance.position.set(x, y, z);
    instance.scale.setScalar(height / template.dimensions.y);
    instance.rotation.y = yaw;
    if(pitch) {
      instance.rotation.set(pitch,yaw,0,'YXZ');instance.updateMatrixWorld(true);
      const floor=new THREE.Box3().setFromObject(instance).min.y;
      instance.position.y+=y-floor;
    }
    instance.userData.importedAsset = template.entry.id;
    instance.userData.source = template.entry.source;
    instance.userData.license = template.entry.license;
    instance.userData.detailDistance = template.entry.id.startsWith('food_') ? 32 : template.entry.id === 'tree_small_02' ? 200 : template.entry.id === 'grass_bermuda_01' ? 65 : template.entry.id === 'fern_02' ? 85 : 120;
    instance.userData.detailCenter = new THREE.Vector3(x, y + height / 2, z);
    instance.userData.detailRadius = height * 1.5;
    imported.add(instance);
    if (template.entry.id === 'tree_small_02') {
      treePlacements.push({x,y,z,height});
      addCollider(x-.27,x+.27,z-.27,z+.27,'tree-trunk');
      const radius=height*.36;
      flightObstacles.push({x0:x-radius,x1:x+radius,z0:z-radius,z1:z+radius,top:y+height});
    }
    if (template.entry.id === 'rock_moss_set_01') {
      const scale = height / template.dimensions.y;
      const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
      const hw = (template.dimensions.x*c+template.dimensions.z*s)*scale*.43;
      const hd = (template.dimensions.z*c+template.dimensions.x*s)*scale*.43;
      addCollider(x-hw,x+hw,z-hd,z+hd,'shore-rock');
      flightObstacles.push({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,top:y+height});
    }
    return true;
  }

  function populateMarkets() {
    // Goods live beside the outer shop counters, inside the market walls. The
    // central twelve-metre cross streets and gate approaches stay unobstructed.
    // Each shop receives an intentionally uneven merchant's group, not a grid.
    let count = 0;
    const offsets = [-0.32, -0.1, 0.13, 0.35];
    for (const [marketIndex, market] of marketDefs.entries()) {
      for (const [row, indexes] of [[-1, [0, 2]], [1, [1, 3]]]) {
        for (const index of indexes) {
          const shopX = market.x + offsets[index] * market.w;
          const shopZ = market.z + row * (market.d / 2 - 10);
          const yaw = row < 0 ? 0 : Math.PI;
          const c = Math.cos(yaw), s = Math.sin(yaw);
          const merchantSide = (index + marketIndex) % 2 ? -1 : 1;
          const local = (lx, lz) => [shopX + lx * c + lz * s, shopZ - lx * s + lz * c];
          const cluster = [
            ['ceramic_pot', merchantSide * 6.95, 7.65, 0.72, 0.22 + index * 0.3],
            ['ceramic_pot', merchantSide * 6.62, 8.62, 0.48, -0.38 + marketIndex * 0.4],
            ['wicker_basket_01', merchantSide * 5.88, 9.42, 0.17, 0.16 - index * 0.17],
          ];
          for (const [modelId, lx, lz, height, turn] of cluster) {
            const [x, z] = local(lx, lz);
            if (place(modelId, x, 0.04, z, height, yaw + turn,
              `${market.name}-merchant-${row}-${index}-${modelId}-${count}`)) count++;
          }
          const details = [
            ['wooden_bowl_02', merchantSide * .65, 8.42, 0.18, 1.37],
            ['wooden_bucket_01', merchantSide * 6.8, 10.2, 0.66, 0.04],
            ['chinese_stool', -merchantSide * 5.6, 8.7, 0.52, 0.04],
          ];
          for (const [modelId, lx, lz, height, y] of details) {
            const [x, z] = local(lx, lz);
            if (place(modelId, x, y, z, height, yaw, `${market.name}-${index}-${row}-${modelId}`)) count++;
          }
          const [gx,gz]=local(merchantSide*1.9,8.45);
          if(place('food_ginger_01',gx,1.37,gz,.18,yaw+.7,'counter-ginger-'+market.name+'-'+row+'-'+index,Math.PI/2))count++;
        }
      }
    }
    // A few carefully composed foreground groups make the opening street as
    // tangible as the markets. Keep the central roadway fully clear.
    for (const side of [-1, 1]) {
      for (const [modelId, x, z, height] of [
        ['ceramic_pot', 17.7, 355, 0.65],
        ['ceramic_pot', 18.3, 356.2, 0.45],
        ['wooden_bucket_01', 18.1, 340.2, 0.7],
        ['wicker_basket_01', 17.5, 342, 0.18],
        ['chinese_stool', 20.1, 362, 0.56],
      ]) if (place(modelId, x * side, 0.04, z, height, side * 0.35, 'avenue-' + side + '-' + modelId + '-' + z)) count++;
    }
    // Real scanned stone silhouettes break the smooth lawn/water boundary.
    SHORE_ROCK_SPOTS.forEach(([x,z,height],i)=>{
      const variant='rock_moss_set_01_rock'+String(i%6+1).padStart(2,'0');
      if(!place(variant,x,-.18,z,height,i*1.29,'qujiang-shore-rock-'+i)) throw new Error('Missing reviewed rock node: '+variant);
      count++;
    });
    for (const [x,z,height,yaw] of MATURE_TREE_SPOTS) {
      if(!place('tree_small_02',x,groundHeightAt(x,z),z,height,yaw,'authored-canopy-'+x+'-'+z)) throw new Error('Missing reviewed tree asset');
      count++;
    }
    return count;
  }

  function populateGardenEdges() {
    let count = 0;
    // Set dressing frames rocks and tree roots; the boardwalk, bridge, shop
    // entrances and landing areas retain their checked clear walking space.
    const gardens = [[279,324],[301,273],[405,283],[421,333],[410,351],[384,373],[329,373],[309,357],[325,252],[423,280],[419,346],[295,369],...shorePlantSpots];
    gardens.forEach(([x,z], i) => {
      const offsets = [[0,0],[-.55,.42],[.72,-.28],[1.22,.6]];
      offsets.forEach(([dx,dz],j) => {
        const px=x+dx,pz=z+dz,ground=groundHeightAt(px,pz);
        if (!canStandAt(px,pz) || ground > .35) return;
        const fern=j===0, id=fern ? 'fern_02_'+['a','b','c','d'][i%4] : 'grass_bermuda_01_medium_'+['a','c','e'][(i+j)%3];
        if (!place(id,px,ground-.015,pz,fern ? .48+(i%3)*.05 : .26+(j%2)*.09,i*1.9+j,'garden-edge-'+i+'-'+j)) throw new Error('Missing reviewed garden variant: '+id);
        count++;
      });
    });
    return count;
  }

  function populateFoodDisplays() {
    let count=0;
    foodDisplays.forEach((display,i)=>{
      const source=templates.get(display.id);
      const id=source?.variants.length?source.variants[i%source.variants.length]:display.id;
      if(!place(id,display.x,display.y,display.z,display.height,display.yaw,'market-fruit-'+i))throw new Error('Missing reviewed fruit: '+display.id);
      count++;
    });
    return count;
  }

  function populateAnimals() {
    const clone = window.ChanganRenderingAddons?.cloneSkeleton;
    if (!clone) throw new Error('The official local skeleton cloner is unavailable');
    const clear=(x,z)=>canStandAt(x,z) && groundHeightAt(x,z)<.3 && !colliders.some(c=>x>c.minX-.7&&x<c.maxX+.7&&z>c.minZ-.7&&z<c.maxZ+.7);
    function spawn(id, x, z, height, clipName, curve=null, phase=0) {
      const template=templates.get(id);
      if(!template || !clear(x,z)) return false;
      const root=clone(template.root);
      root.name=id+'-'+animals.length;root.position.set(x,groundHeightAt(x,z),z);
      root.scale.setScalar(height/template.dimensions.y);
      root.userData.importedAsset=id;root.userData.detailDistance=160;
      root.userData.detailCenter=new THREE.Vector3(x,height/2,z);root.userData.detailRadius=curve?curve.getLength()/2:height;
      const mixer=new THREE.AnimationMixer(root),clips=template.animations;
      const clip=clips.find(c=>c.name.split('|').pop()===clipName);
      if(!clip) throw new Error('The original animal clip is missing: '+id+'/'+clipName);
      const action=mixer.clipAction(clip);action.play();action.time=phase*clip.duration;
      // Each clone owns its complete bone tree; meshes and coat buffers stay shared.
      imported.add(root);
      animals.push({root,mixer,action,curve,phase,length:curve?curve.getLength():0,speed:1.05,id,clip:clipName});
      return true;
    }
    let count=0;
    for(const [points,height] of [
      [[[-5.2,270],[-5.2,314],[-3.8,314],[-3.8,270]],2.15],
      [[[4.2,336],[4.2,362],[5.8,362],[5.8,336]],2.02],
    ]) {
      // Long, narrow Catmull loops bulge through nearby stalls. Explicit straight
      // stretches and rounded end turns keep the full animal route in its lane.
      const [a,b,c,d]=points.map(([x,z])=>new THREE.Vector3(x,0,z));
      const bend=(c.x-b.x)*2/3,curve=new THREE.CurvePath();
      curve.add(new THREE.LineCurve3(a,b));
      curve.add(new THREE.CubicBezierCurve3(b,b.clone().add(new THREE.Vector3(0,0,bend)),c.clone().add(new THREE.Vector3(0,0,bend)),c));
      curve.add(new THREE.LineCurve3(c,d));
      curve.add(new THREE.CubicBezierCurve3(d,d.clone().add(new THREE.Vector3(0,0,-bend)),a.clone().add(new THREE.Vector3(0,0,-bend)),a));
      if(Array.from({length:120},(_,i)=>curve.getPointAt(i/120)).some(p=>!clear(p.x,p.z))) continue;
      for(const phase of [.1,.58]) {
        const p=curve.getPointAt(phase);
        if(spawn('quaternius_horse',p.x,p.z,height,'Walk',curve,phase)) count++;
      }
    }
    for(const [x,z,clip] of [[282,-156,'Eating'],[286,-175,'Idle']]) if(spawn('quaternius_deer',x,z,1.35,clip,null,.3)) count++;
    for(const market of marketDefs) if(spawn('quaternius_horse',market.x-34,market.z+8,2.05,'Idle',null,.7)) count++;
    return count;
  }

  function update(dt) {
    for(const a of animals) {
      a.mixer.update(Math.min(.05,Math.max(0,dt)));
      if(!a.curve) continue;
      a.phase=(a.phase+dt*a.speed/a.length)%1;
      a.curve.getPointAt(a.phase,animalPoint);a.curve.getTangentAt(a.phase,animalTangent);
      a.root.position.set(animalPoint.x,groundHeightAt(animalPoint.x,animalPoint.z),animalPoint.z);
      a.root.rotation.y=Math.atan2(animalTangent.x,animalTangent.z);
    }
  }

  function batchRepeatedProps() {
    // Repetition shares draw calls as well as buffers. Keep spatial cells small
    // enough to cull the separate districts, including the new ground cover.
    imported.updateMatrixWorld(true);
    const cells = new Map();
    imported.traverse(mesh => {
      if (!mesh.isMesh || mesh.isSkinnedMesh) return;
      let owner=mesh.parent;
      while(owner && !owner.userData.importedAsset) owner=owner.parent;
      const p=new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      const key=mesh.geometry.uuid+'/'+materials.map(m=>m.uuid).join(',')+'/'+Math.floor(p.x/64)+','+Math.floor(p.z/64);
      if(!cells.has(key)) cells.set(key,{meshes:[],distance:owner?.userData.detailDistance||120});
      cells.get(key).meshes.push(mesh);
    });
    let meshInstances=0;
    for(const {meshes,distance} of cells.values()) {
      meshInstances+=meshes.length;
      if(meshes.length<2) continue;
      const first=meshes[0], batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
      batch.name='imported-'+first.name+'-instances';
      meshes.forEach((mesh,i)=>batch.setMatrixAt(i,mesh.matrixWorld));
      batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
      batch.computeBoundingSphere();
      batch.userData.detailDistance=distance;
      batch.userData.detailCenter=batch.boundingSphere.center.clone();
      batch.userData.detailRadius=batch.boundingSphere.radius;
      imported.add(batch);
      for(const mesh of meshes) mesh.removeFromParent();
    }
    // Individual placement wrappers become empty after their meshes are
    // instanced. Their logical count is retained in diagnostics; the render
    // traversal need not visit hundreds of empty scene branches every frame.
    for(const root of [...imported.children]) {
      if(root.isMesh) continue;
      let renderable=false;root.traverse(object=>{if(object.isMesh)renderable=true;});
      if(!renderable)root.removeFromParent();
    }
    return meshInstances;
  }

  async function populateOnce() {
    if (typeof RUNTIME_MODELS === 'undefined') throw new Error('Local assets/runtime-models.js was not loaded');
    const entries = Object.values(RUNTIME_MODELS);
    if (!entries.length) throw new Error('The local model bundle contains no assets');
    const loaded = await Promise.allSettled(entries.map(loadModel));
    loaded.forEach((outcome, index) => {
      if (outcome.status !== 'rejected') return;
      const failure = { id: entries[index].id, message: String(outcome.reason?.message || outcome.reason) };
      errors.push(failure);
      console.error('[WorldAssets] Failed to decode local model ' + failure.id, outcome.reason);
    });
    if (!templates.size) throw new Error('All local 3D models failed to decode: ' + errors.map(error => error.id + ': ' + error.message).join('; '));
    imported = new THREE.Group();
    imported.name = 'imported-props';
    imported.userData.assetPipeline = 'Local GLB / shared PBR geometry / CC0 Poly Haven';
    const count = populateMarkets() + populateGardenEdges() + populateFoodDisplays() + populateAnimals();
    const meshInstances = batchRepeatedProps();
    LegacySkinning.prepareScene(imported);
    scene.add(imported);
    const sourceModels = [...templates.values()].filter(template=>!template.variant).map(template => ({
      id: template.entry.id, source: template.entry.source, license: template.entry.license,authors:template.entry.authors||template.entry.author,
      triangles: template.triangles, meshes: template.meshes,
      dimensions: template.dimensions.toArray(), bytes: template.entry.bytes,
    }));
    let meshes = 0;
    imported.traverse(object => { if (object.isMesh) meshes++; });
    result = { count, meshes, meshInstances, sourceModels, treePlacements,
      animals:animals.map(a=>({id:a.id,clip:a.clip,moving:!!a.curve,position:a.root.position.toArray()})),failures: errors.slice() };
    window.__changanAssets = result;
    return result;
  }

  return Object.freeze({
    populate() {
      // Build stages may ask twice; never duplicate imported instances or parses.
      if (!pending) pending = populateOnce();
      return pending;
    },
    getResult() { return result; },
    getAnimalState() {
      return animals.map(a=>{
        let skin=null;a.root.traverse(o=>{if(o.isSkinnedMesh)skin=o;});
        return {id:a.id,clip:a.clip,moving:!!a.curve,time:a.mixer.time,phase:a.phase,position:a.root.position.toArray(),
          skeleton:skin?.skeleton.uuid,bones:skin?.skeleton.bones.length||0,
          pose:skin?.skeleton.bones.reduce((sum,b,i)=>sum+(b.quaternion.x+b.quaternion.y*.37+b.quaternion.z*.71)*(i+1),0)||0};
      });
    },
    update,
  });
})();
