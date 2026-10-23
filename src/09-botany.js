/* Editable branch-and-leaf geometry for willow, pine and flowering peach.
 * Shared near/far meshes retain open crowns instead of intersecting solid balls.
 * Foreground broadleaf trees are separately sourced, licensed GLB assets. */
const CityBotany = (() => {
  const V = THREE.Vector3;
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, side: THREE.DoubleSide });
  function geometry(kind, coarse = false) {
    const positions = [], colors = [], indices = [];
    let seed = kind === 'willow' ? 22071 : kind === 'peach' ? 16038 : 90331;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
    const colour = new THREE.Color(), bark = new THREE.Color(0x76533b);
    function point(v, color) {
      const i = positions.length / 3;
      positions.push(v.x, v.y, v.z); colors.push(color.r, color.g, color.b); return i;
    }
    function twig(points, radius) {
      const radial = coarse ? 4 : 6, base = positions.length / 3;
      points.forEach((p, j) => {
        const direction = points[Math.min(j + 1, points.length - 1)].clone().sub(points[Math.max(0, j - 1)]).normalize();
        const right = new V().crossVectors(direction, new V(0, 0, 1)).normalize();
        const up = new V().crossVectors(direction, right).normalize();
        const r = radius * (1 - j / points.length * 0.82);
        for (let k = 0; k < radial; k++) {
          const a = k / radial * TAU;
          point(p.clone().addScaledVector(right, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r), bark);
          if (j < points.length - 1) {
            const i = base + j * radial + k, n = base + j * radial + (k + 1) % radial;
            indices.push(i, i + radial, n, n, i + radial, n + radial);
          }
        }
      });
    }
    function leaf(p, direction, width, color) {
      const right = new V().crossVectors(direction, new V(0.23, 1, 0.15)).normalize().multiplyScalar(width);
      const normal = new V().crossVectors(right, direction).normalize().multiplyScalar(width * 0.24);
      const middle = p.clone().addScaledVector(direction, 0.5);
      const base = point(p, color), left = point(middle.clone().sub(right), color);
      const tip = point(p.clone().add(direction), color), rightIndex = point(middle.clone().add(right), color);
      const ridge = point(middle.add(normal), color);
      indices.push(base, left, ridge, left, tip, ridge, tip, rightIndex, ridge, rightIndex, base, ridge);
    }
    function blossom(p, scale) {
      const pink = new THREE.Color().setHSL(0.955 + random() * 0.035, 0.46, 0.69 + random() * 0.12);
      const spin = random() * TAU;
      for (let k = 0; k < (coarse ? 3 : 5); k++) {
        const a = spin + k / (coarse ? 3 : 5) * TAU;
        leaf(p, new V(Math.cos(a) * scale, 0.015, Math.sin(a) * scale), scale * 0.52, pink);
      }
    }
    const trunkH = kind === 'pine' ? 5.5 : 4.2;
    const trunk = [new V(0, 0, 0), new V(0.12, trunkH * 0.36, -0.05), new V(-0.12, trunkH * 0.72, 0.09), new V(0.12, trunkH + 0.3, 0)];
    twig(trunk, 0.23);
    const branches = coarse ? 5 : 8;
    for (let b = 0; b < branches; b++) {
      const angle = b / branches * TAU + random() * 0.42;
      const spread = kind === 'pine' ? 1.5 + random() * 0.8 : 1.9 + random() * 1.1;
      const y = kind === 'pine' ? 2.6 + b / branches * 3.5 : trunkH - 0.35 + random() * 1.0;
      const start = new V(0, kind === 'pine' ? y - 0.7 : trunkH * 0.58 + random() * 0.45, 0);
      const middle = new V(Math.cos(angle) * spread * 0.55, y - 0.2, Math.sin(angle) * spread * 0.55);
      const tip = new V(Math.cos(angle) * spread, y, Math.sin(angle) * spread);
      twig([start, middle, tip], 0.095);
      if (kind === 'willow') {
        for (let shoot = 0; shoot < (coarse ? 3 : 6); shoot++) {
          const u = 0.42 + shoot / (coarse ? 3 : 6) * 0.6;
          const root = start.clone().lerp(tip, u); root.y += Math.sin(u * Math.PI) * 0.35;
          const a = angle + (random() - 0.5) * 1.25, drop = 1.7 + random() * 1.65;
          const points = [];
          const stations = coarse ? 4 : 9;
          for (let j = 0; j <= stations; j++) {
            const t = j / stations, swing = Math.sin(t * Math.PI / 2) * 0.85;
            const p = root.clone().add(new V(Math.cos(a) * swing, -drop * t ** 1.3, Math.sin(a) * swing));
            points.push(p);
            if (j === 0) continue;
            colour.setHSL(0.23 + random() * 0.045, 0.36 + random() * 0.12, 0.30 + random() * 0.12);
            for (const side of [-1, 1]) leaf(p, new V(Math.cos(a + side * 0.8) * (coarse ? .24 : .13), -(coarse ? .65 : .24) - random() * .12, Math.sin(a + side * 0.8) * (coarse ? .24 : .13)), coarse ? .18 : .045, colour);
          }
          if (!coarse) twig(points, 0.014);
        }
      } else {
        const sprays = coarse ? 4 : 9;
        for (let k = 0; k < sprays; k++) {
          const t = 0.36 + k / sprays * 0.64, root = middle.clone().lerp(tip, t);
          const a = angle + (random() - 0.5) * 1.7;
          const end = root.clone().add(new V(Math.cos(a) * 0.6, 0.2 + random() * 0.45, Math.sin(a) * 0.6));
          if (!coarse) twig([root, end], 0.022);
          if (kind === 'peach') {
            for (let j = 0; j < (coarse ? 2 : 4); j++) blossom(root.clone().lerp(end, j / 4 + 0.2), (0.13 + random() * 0.06) * (coarse ? 2.5 : 1));
            leaf(end, new V(Math.cos(a) * (coarse ? .58 : .28), .08, Math.sin(a) * (coarse ? .58 : .28)), coarse ? .14 : .055, new THREE.Color(0x88a86b));
          } else {
            colour.setHSL(0.32 + random() * 0.025, 0.27, 0.27 + random() * 0.09);
            for (let j = 0; j < (coarse ? 5 : 12); j++) {
              const a = j / (coarse ? 5 : 12) * TAU;
              leaf(end, new V(Math.cos(a) * (coarse ? 1.05 : .55), .06 + random() * .17, Math.sin(a) * (coarse ? 1.05 : .55)), coarse ? .2 : .075, colour);
            }
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(indices); g.computeVertexNormals(); return g;
  }
  const batches = {};
  for (const kind of ['willow', 'peach', 'pine']) batches['botany' + kind] = new Batch(geometry(kind), material, { farGeometry: geometry(kind, true), nearDistance: 62, maxDistance: 260, cellSize: 64 });
  return { batches };
})();
