/* Official Three Water: actual planar scene reflection in detailed modes.
 * The inexpensive shader remains available for phone power/thermal budgets.
 * v2: 结构精修 — 更自然的波纹、更真实的颜色、更柔和的高光
 */
const WaterSurface = (() => {
  const lakes = [];
  let normals;
  
  // v2: 更精细的法线贴图 — 更自然的波纹
  function normalTexture() {
    if (normals) return normals;
    const size = 256, bytes = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = x / size * TAU, v = y / size * TAU;
      // v2: 多层叠加的波纹 — 更自然
      const nx = Math.sin(u * 3 + Math.cos(v * 2)) * 0.16 
        + Math.sin(v * 7 + u * 4) * 0.07
        + Math.sin(u * 11 + v * 9) * 0.03
        + Math.sin(v * 13 - u * 7) * 0.02;
      const ny = Math.cos(v * 4 + Math.sin(u * 3)) * 0.16 
        + Math.cos(u * 9 - v * 3) * 0.06
        + Math.cos(u * 15 + v * 11) * 0.03
        + Math.sin(v * 17 + u * 5) * 0.02;
      const offset = (x + y * size) * 4;
      bytes[offset] = (nx * 0.5 + 0.5) * 255;
      bytes[offset + 1] = (ny * 0.5 + 0.5) * 255;
      bytes[offset + 2] = 255; bytes[offset + 3] = 255;
    }
    normals = new THREE.DataTexture(bytes, size, size);
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    normals.magFilter = normals.minFilter = THREE.LinearFilter;
    normals.needsUpdate = true;
    return normals;
  }
  
  return {
    create(geometry, fallback, radius) {
      const Water = window.ChanganRenderingAddons?.Water;
      if (!Water || radius < 50) return new THREE.Mesh(geometry, fallback);
      const water = new Water(geometry, {
        textureWidth: 512, textureHeight: 512, // v2: 更高分辨率
        waterNormals: normalTexture(),
        sunDirection: new THREE.Vector3(0.5, 0.8, 0.35).normalize(),
        sunColor: 0xfff0d0, // v2: 更暖的阳光
        waterColor: 0x2d6b70, // v2: 更深的水色
        distortionScale: 2.2, // v2: 更明显的波纹
        fog: true,
      });
      const detailed = water.material, reflect = water.onBeforeRender;
      water.userData.screenSpaceAO = false;
      water.onBeforeRender = function (...args) {
        if (water.material === detailed) reflect.apply(this, args);
      };
      lakes.push({ water, detailed, fallback });
      this.update(0, 0);
      return water;
    },
    update(dt, night) {
      const quality = GameRendering.getDiagnostics().quality;
      for (const lake of lakes) {
        lake.water.material = quality === 'low' || !renderer.capabilities.isWebGL2 ? lake.fallback : lake.detailed;
        const uniforms = lake.detailed.uniforms;
        uniforms.time.value += Math.min(dt, 0.05);
        // v2: 更自然的水色渐变
        uniforms.waterColor.value.setHex(0x2d6b70).lerp(new THREE.Color(0x0a2535), night || 0);
        uniforms.sunColor.value.copy(sun.color);
        uniforms.sunDirection.value.copy(sun.position).sub(sun.target.position).normalize();
      }
    },
    getState() {
      return { lakes: lakes.length, reflective: lakes.filter(lake => lake.water.material === lake.detailed).length };
    },
  };
})();
