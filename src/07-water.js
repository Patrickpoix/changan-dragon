/* Official Three Water: actual planar scene reflection in detailed modes.
 * The inexpensive shader remains available for phone power/thermal budgets. */
const WaterSurface = (() => {
  const lakes = [];
  let normals;
  function normalTexture() {
    if (normals) return normals;
    const size = 128, bytes = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = x / size * TAU, v = y / size * TAU;
      const nx = Math.sin(u * 3 + Math.cos(v * 2)) * 0.16 + Math.sin(v * 7 + u * 4) * 0.07;
      const ny = Math.cos(v * 4 + Math.sin(u * 3)) * 0.16 + Math.cos(u * 9 - v * 3) * 0.06;
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
        textureWidth: 384, textureHeight: 384, waterNormals: normalTexture(),
        sunDirection: new THREE.Vector3(0.5, 0.8, 0.35).normalize(),
        sunColor: 0xffe8c2, waterColor: 0x39777b, distortionScale: 1.9, fog: true,
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
        uniforms.waterColor.value.setHex(0x39777b).lerp(new THREE.Color(0x102c40), night || 0);
        uniforms.sunColor.value.copy(sun.color);
        uniforms.sunDirection.value.copy(sun.position).sub(sun.target.position).normalize();
      }
    },
    getState() {
      return { lakes: lakes.length, reflective: lakes.filter(lake => lake.water.material === lake.detailed).length };
    },
  };
})();
