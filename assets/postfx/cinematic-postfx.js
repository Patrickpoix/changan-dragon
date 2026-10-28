/* ============================================================
   电影级后处理增强 v1.0
   体积光、景深、动态模糊、胶片颗粒
   ============================================================ */

const CinematicPostFX = {
  
  createGodRays(sunPosition) {
    const godRayGeo = new THREE.PlaneGeometry(100, 100);
    const godRayMat = new THREE.MeshBasicMaterial({
      color: 0xfff0c0,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const rays = new THREE.Mesh(godRayGeo, godRayMat);
    rays.position.copy(sunPosition);
    rays.lookAt(0, 0, 0);
    
    return rays;
  },
  
  getDOFParams() {
    return {
      focusDistance: 50,
      focalLength: 35,
      bokehScale: 2.0,
      aperture: 0.0001
    };
  },
  
  getMotionBlurParams() {
    return {
      speed: 0.5,
      intensity: 0.3
    };
  },
  
  getFilmGrainParams() {
    return {
      intensity: 0.15,
      size: 1.5
    };
  },
  
  getColorGrade() {
    return {
      saturation: 1.1,
      contrast: 1.15,
      brightness: 1.05,
      shadowTint: new THREE.Color(0x1a2a4a),
      highlightTint: new THREE.Color(0xffe0b0)
    };
  },
  
  isSupported() {
    return typeof renderer !== 'undefined' && 
           renderer.capabilities.isWebGL2;
  }
};

window.CinematicPostFX = CinematicPostFX;

console.log('[Cinematic-PostFX] 电影级后处理参数配置加载完成');
