/* ============================================================
   性能优化 v2.0
   LOD分级 + 实例化 + 阴影优化
   ============================================================ */

const PerformanceOptimizer = {
  
  LODConfig: {
    tree: {
      near: 50,
      mid: 150,
      far: 300,
    },
    building: {
      near: 100,
      mid: 300,
      far: 600,
    },
    npc: {
      near: 30,
      mid: 80,
      far: 150,
    }
  },
  
  createLOD(nearModel, midModel, farModel, config) {
    const lod = new THREE.LOD();
    
    lod.addLevel(nearModel, 0);
    lod.addLevel(midModel, config.mid);
    lod.addLevel(farModel, config.far);
    
    return lod;
  },
  
  instancingTrees(treePositions, treeGeometry, treeMaterial) {
    const count = treePositions.length;
    const instancedMesh = new THREE.InstancedMesh(
      treeGeometry,
      treeMaterial,
      count
    );
    
    const matrix = new THREE.Matrix4();
    
    treePositions.forEach((pos, i) => {
      matrix.setPosition(pos.x, pos.y || 0, pos.z);
      instancedMesh.setMatrixAt(i, matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    
    return instancedMesh;
  },
  
  optimizeShadows(light, camera, scene) {
    const updateShadowCamera = () => {
      const shadowCam = light.shadow.camera;
      
      shadowCam.position.copy(camera.position);
      shadowCam.position.y += 50;
      
      shadowCam.left = -200;
      shadowCam.right = 200;
      shadowCam.top = 200;
      shadowCam.bottom = -200;
      
      shadowCam.updateProjectionMatrix();
    };
    
    let frameCount = 0;
    const originalUpdate = scene.onBeforeRender || (() => {});
    scene.onBeforeRender = function(renderer, scene, camera) {
      frameCount++;
      if (frameCount % 10 === 0) {
        updateShadowCamera();
      }
      originalUpdate.call(this, renderer, scene, camera);
    };
    
    return updateShadowCamera;
  },
  
  frustumCulling(obj, maxDistance) {
    obj.frustumCulled = true;
    obj.userData.maxDistance = maxDistance;
    
    return obj;
  },
  
  getPerformanceStats(renderer) {
    const info = renderer.info;
    
    return {
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    };
  }
};

window.PerformanceOptimizer = PerformanceOptimizer;

console.log('[Performance] 性能优化模块加载完成');
