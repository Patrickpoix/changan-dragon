/* 小青龙模型：直立双足 Q 版幼龙。
 *
 * 造型依据是 docs/concept-dragon-turnaround.png：1.25m 高的直立幼龙，
 * 头约占身高三分之一、大眼、奶油色腹甲与吻部、环颈鬃叶、双分叉鹿角、
 * 短手臂、粗后腿、奶油色尾尖，以及一条红围巾。
 *
 * 关键做法：
 * - 躯干竖直放样，腹面顶点色过渡到奶油色，底部收成臀部而不是切平的筒；
 * - 颈是独立的一小段放样，把躯干与头连起来，围巾围在颈上而不是悬空；
 * - 头是大颅骨 + 低而宽的奶油吻部，眼窝凸起、眉骨抬起；
 * - 鬃由"鬃底 + 三层宽叶"组成，叶片互相叠压，读成一圈蓬松的鬃；
 * - 腹甲是贴着腹面曲率的横向弧形甲片，不是竖条；
 * - 后腿粗短、脚掌奶油色带三趾，前臂短，手有三指与爪；
 * - 尾巴从髋后向上弯出，末端奶油色扇羽。
 *
 * 本文件只产出几何与动画，不创建材质；材质由调用方传入，便于全项目共享。
 */
(() => {
  'use strict';

  const T = THREE;
  const TAU = Math.PI * 2;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /* 一维 Catmull-Rom 取样：轮廓站点的宽/高/中心随参数平滑变化。 */
  function sampleSeries(values, t) {
    const count = values.length;
    if (count === 1) return values[0];
    const scaled = clamp(t, 0, 1) * (count - 1);
    const i1 = clamp(Math.floor(scaled), 0, count - 1);
    const i0 = Math.max(0, i1 - 1);
    const i2 = Math.min(count - 1, i1 + 1);
    const i3 = Math.min(count - 1, i1 + 2);
    const v0 = values[i0];
    const v1 = values[i1];
    const v2 = values[i2];
    const v3 = values[i3];
    const u = scaled - i1;
    const u2 = u * u;
    const u3 = u2 * u;
    return 0.5 * (
      2 * v1
      + (-v0 + v2) * u
      + (2 * v0 - 5 * v1 + 4 * v2 - v3) * u2
      + (-v0 + 3 * v1 - 3 * v2 + v3) * u3
    );
  }

  /* 沿站点放样成一张连续曲面。X 轴固定为左右方向，环不会在弯折处翻面。 */
  function loftStations(stations, { rings = 48, radial = 36, colors = null } = {}) {
    const points = stations.map((s) => new T.Vector3(0, s.y, s.z));
    const curve = new T.CatmullRomCurve3(points, false, 'centripetal');
    const widths = stations.map((s) => s.w);
    const heights = stations.map((s) => s.h);
    const flats = stations.map((s) => (s.flat === undefined ? 1 : s.flat));

    const positions = [];
    const uvs = [];
    const indices = [];
    const vertexColors = [];
    const color = new T.Color();

    for (let row = 0; row <= rings; row++) {
      const t = row / rings;
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const axisX = new T.Vector3(1, 0, 0);
      const axisY = new T.Vector3().crossVectors(tangent, axisX).normalize();
      const width = sampleSeries(widths, t);
      const height = sampleSeries(heights, t);
      const flat = sampleSeries(flats, t);

      for (let column = 0; column <= radial; column++) {
        const angle = (column / radial) * TAU;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = Math.sign(cos) * Math.pow(Math.abs(cos), 0.88) * width;
        const ySign = Math.sign(sin) || 1;
        const yMagnitude = Math.pow(Math.abs(sin), sin < 0 ? 0.96 : 0.84);
        const y = (sin < 0 ? -height * flat : height) * ySign * yMagnitude;
        const vertex = center.clone()
          .addScaledVector(axisX, x)
          .addScaledVector(axisY, y);
        positions.push(vertex.x, vertex.y, vertex.z);
        uvs.push(column / radial, t);
        if (colors) {
          const { base, belly, top } = colors;
          // 腹面的奶油色：从腹中线向两侧渐变，边界不要收得太窄，
          // 否则正前方会留下一条细白线，读成拉链。
          const bellyMix = Math.pow(clamp(-sin, 0, 1), 1.9);
          const topMix = Math.pow(clamp(sin, 0, 1), 1.6);
          color.copy(base).lerp(top, topMix * 0.24).lerp(belly, bellyMix * 0.86);
          vertexColors.push(color.r, color.g, color.b);
        }
        if (row < rings && column < radial) {
          const a = row * (radial + 1) + column;
          const b = a + 1;
          const c = a + radial + 1;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }

    const start = curve.getPoint(0);
    const end = curve.getPoint(1);
    const startCenter = positions.length / 3;
    positions.push(start.x, start.y, start.z);
    uvs.push(0.5, 0);
    if (colors) vertexColors.push(colors.base.r, colors.base.g, colors.base.b);
    const endCenter = positions.length / 3;
    positions.push(end.x, end.y, end.z);
    uvs.push(0.5, 1);
    if (colors) vertexColors.push(colors.base.r, colors.base.g, colors.base.b);
    for (let column = 0; column < radial; column++) {
      indices.push(startCenter, column + 1, column);
      const lastBase = rings * (radial + 1);
      indices.push(endCenter, lastBase + column, lastBase + column + 1);
    }

    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    if (colors) {
      geometry.setAttribute('color', new T.Float32BufferAttribute(vertexColors, 3));
    }
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return { geometry, curve };
  }

  /* 锥形管：角、眉、围巾、指爪用。 */
  function taperedTube(points, radii, material, { segments = 24, radial = 10 } = {}) {
    const curve = new T.CatmullRomCurve3(points, false, 'centripetal');
    const frames = curve.computeFrenetFrames(segments, false);
    const positions = [];
    const uvs = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const radius = sampleSeries(radii, t);
      for (let j = 0; j <= radial; j++) {
        const angle = (j / radial) * TAU;
        const vertex = point.clone()
          .addScaledVector(frames.normals[i], Math.cos(angle) * radius)
          .addScaledVector(frames.binormals[i], Math.sin(angle) * radius);
        positions.push(vertex.x, vertex.y, vertex.z);
        uvs.push(t, j / radial);
        if (i < segments && j < radial) {
          const a = i * (radial + 1) + j;
          const b = a + 1;
          const c = a + radial + 1;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new T.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, curve };
  }

  /* 叶片：鬃叶、尾羽、背脊小鳞共用一片带厚度的叶形几何。 */
  function bladeGeometry({ width = 0.5, length = 1.0, thickness = 0.10 } = {}) {
    const shape = new T.Shape();
    shape.moveTo(0, -0.08);
    shape.bezierCurveTo(-0.42, 0.08, -0.36, 0.58, 0, 1);
    shape.bezierCurveTo(0.36, 0.58, 0.42, 0.08, 0, -0.08);
    const geometry = new T.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: thickness * 0.5,
      bevelThickness: thickness * 0.35,
      steps: 1,
      curveSegments: 6,
    });
    geometry.translate(0, 0, -thickness / 2);
    geometry.scale(width, length, 1);
    geometry.computeVertexNormals();
    return geometry;
  }

  /* 批量实例化叶片。 */
  function bladeInstances(entries, material, geometry, layer) {
    const mesh = new T.InstancedMesh(geometry, material, entries.length);
    const matrix = new T.Matrix4();
    const basis = new T.Matrix4();
    const quaternion = new T.Quaternion();
    const scale = new T.Vector3();
    const yAxis = new T.Vector3();
    const zAxis = new T.Vector3();
    const xAxis = new T.Vector3();
    const color = new T.Color();
    entries.forEach((entry, index) => {
      yAxis.copy(entry.direction).normalize();
      zAxis.copy(entry.normal);
      zAxis.addScaledVector(yAxis, -zAxis.dot(yAxis));
      if (zAxis.lengthSq() < 1e-5) zAxis.set(0, 0, 1);
      zAxis.normalize();
      xAxis.crossVectors(yAxis, zAxis).normalize();
      basis.makeBasis(xAxis, yAxis, zAxis);
      quaternion.setFromRotationMatrix(basis);
      scale.set(entry.width, entry.length, entry.thickness || 0.3);
      matrix.compose(entry.position, quaternion, scale);
      mesh.setMatrixAt(index, matrix);
      color.setHex(entry.color === undefined ? 0xffffff : entry.color);
      mesh.setColorAt(index, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    if (layer !== undefined) mesh.layers.set(layer);
    return mesh;
  }

  /* ---------------------------------------------------------------- 躯干 */

  /* 竖直放样的梨形躯干：底部收成臀部、腹部最鼓、胸口收、颈根细。
   * 总高约 0.72 局部单位，最终 0.78 缩放。 */
  const TORSO = [
    { z: 0.000, y: 0.300, w: 0.086, h: 0.082 },
    { z: 0.000, y: 0.330, w: 0.168, h: 0.156 },
    { z: -0.006, y: 0.386, w: 0.238, h: 0.212 },
    { z: -0.012, y: 0.460, w: 0.278, h: 0.244 },
    { z: -0.010, y: 0.548, w: 0.290, h: 0.252 },
    { z: 0.000, y: 0.640, w: 0.284, h: 0.246 },
    { z: 0.012, y: 0.730, w: 0.262, h: 0.232 },
    { z: 0.020, y: 0.812, w: 0.228, h: 0.208 },
    { z: 0.024, y: 0.884, w: 0.190, h: 0.178 },
    { z: 0.024, y: 0.942, w: 0.156, h: 0.152 },
  ];

  /* 颈：从躯干顶连到头，短而粗，围巾围在这一段上。 */
  const NECK = [
    { z: 0.020, y: 0.930, w: 0.156, h: 0.152 },
    { z: 0.026, y: 0.978, w: 0.150, h: 0.146 },
    { z: 0.034, y: 1.028, w: 0.148, h: 0.144 },
    { z: 0.040, y: 1.074, w: 0.152, h: 0.148 },
  ];

  const TORSO_COLORS = {
    base: new T.Color(0x5c9d86),
    belly: new T.Color(0xefe3c2),
    top: new T.Color(0x3d8573),
  };

  function buildBody(materials, layer) {
    const torso = loftStations(TORSO, { rings: 64, radial: 44, colors: TORSO_COLORS });
    applyBellyBands(torso.geometry);
    const neck = loftStations(NECK, { rings: 16, radial: 36, colors: TORSO_COLORS });
    const mesh = new T.Mesh(torso.geometry, materials.body);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    mesh.name = 'dragon-torso';
    const neckMesh = new T.Mesh(neck.geometry, materials.body);
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    neckMesh.layers.set(layer);
    neckMesh.name = 'dragon-neck';
    return { mesh, neckMesh, torsoCurve: torso.curve, neckCurve: neck.curve };
  }

  /* 腹甲分节：不做独立甲片几何，直接在躯干顶点色上压出横向明暗带。
   * 之前用独立弧带几何，边缘在体表外露成一片片白卡片；改成分节色带后，
   * 腹甲与躯干是同一张曲面，近看不会再出现浮在体外的薄片。 */
  function applyBellyBands(geometry) {
    const colorAttr = geometry.attributes.color;
    if (!colorAttr) return;
    const pos = geometry.attributes.position;
    const color = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // 只在腹面（+Z 前侧）压带，背侧不动。
      const front = clamp((z - 0.02) / 0.22, 0, 1);
      if (front <= 0.01) continue;
      color.fromBufferAttribute(colorAttr, i);
      // 每 0.052 一段，段间用 smoothstep 过渡，避免硬边。
      const phase = (y - 0.36) / 0.052;
      const band = Math.abs(phase - Math.round(phase));
      const groove = 1 - Math.pow(1 - clamp(band / 0.5, 0, 1), 2);
      const shade = 0.90 + 0.10 * groove;
      color.multiplyScalar(1 - (1 - shade) * front);
      colorAttr.setXYZ(i, color.r, color.g, color.b);
    }
    colorAttr.needsUpdate = true;
  }

  /* ---------------------------------------------------------------- 头脸 */

  /* 鳞片不靠独立几何片：贴片在凸面上必然在轮廓处翘出毛边（已实测）。
   * 改为程序化鳞片法线贴图，铺在同一份躯干/头材质上——近看有鳞序，
   * 轮廓仍然干净。贴图只生成一次，全项目共享。 */
  const SCALE_NORMAL_CACHE = { texture: null };

  function scaleNormalTexture() {
    if (SCALE_NORMAL_CACHE.texture) return SCALE_NORMAL_CACHE.texture;
    const SIZE = 512;
    const ROWS = 8;
    const COLUMNS = 8;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(SIZE, SIZE);
    const data = image.data;
    // 每片鳞是一个上凸的半球面：法线由鳞心向外倾斜，边缘回落为平面。
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const cellW = SIZE / COLUMNS;
        const cellH = SIZE / ROWS;
        const row = Math.floor(y / cellH);
        const offset = (row % 2) * cellW * 0.5;
        const localX = ((x + offset) % cellW) / cellW;
        const localY = (y % cellH) / cellH;
        // 鳞形：上缘平、下缘圆，横向略窄。
        const dx = (localX - 0.5) * 2.0;
        const dy = (localY - 0.35) * 2.2;
        const radial = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const dome = Math.cos(radial * Math.PI * 0.5);
        const nx = dx * dome * 0.62;
        const ny = dy * dome * 0.62;
        const nz = Math.sqrt(Math.max(0.02, 1 - nx * nx - ny * ny));
        const i = (y * SIZE + x) * 4;
        data[i] = Math.round((nx * 0.5 + 0.5) * 255);
        data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        data[i + 2] = Math.round(nz * 255);
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // 鳞片要细：repeat 太小会变成一颗颗凸起的球。
    texture.repeat.set(7, 9);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    SCALE_NORMAL_CACHE.texture = texture;
    return texture;
  }

  /* 躯干鳞/头鳞的几何贴片已撤销：凸面上必然翘边。这里只保留贴图入口，
   * 由调用方把它挂到躯干/头材质上（见 window.ChanganDragonModel）。 */

  /* 头：颅骨是一颗偏扁的球，吻是另一颗宽而短的椭球，从颅骨前下方长出，
   * 两者之间用一道鼻梁过渡。这样侧影是"圆颅 + 短吻"两段弧，
   * 而不是一个球拖出一条锥形长坡。 */
  const HEAD = [
    { z: -0.26, y: 0.030, w: 0.132, h: 0.124 },
    { z: -0.18, y: 0.048, w: 0.204, h: 0.186 },
    { z: -0.10, y: 0.054, w: 0.248, h: 0.222 },
    { z: -0.02, y: 0.050, w: 0.262, h: 0.232 },
    { z: 0.05, y: 0.040, w: 0.252, h: 0.220 },
    { z: 0.11, y: 0.024, w: 0.226, h: 0.190 },
    { z: 0.16, y: 0.004, w: 0.190, h: 0.152 },
    { z: 0.20, y: -0.020, w: 0.150, h: 0.116 },
    { z: 0.23, y: -0.042, w: 0.108, h: 0.082 },
  ];

  const HEAD_COLORS = {
    base: new T.Color(0x5c9d86),
    belly: new T.Color(0xefe3c2),
    top: new T.Color(0x3d8573),
  };

  function buildHead(materials, layer) {
    const head = new T.Group();
    head.name = 'dragon-head';

    const upper = loftStations(HEAD, { rings: 60, radial: 40, colors: HEAD_COLORS });
    const skullGeometry = upper.geometry;
    const pos = skullGeometry.attributes.position;
    const colorAttr = skullGeometry.attributes.color;
    const topColor = new T.Color(0x3d8573);
    const creamColor = new T.Color(0xf2e6c6);
    const color = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const absX = Math.abs(x);
      const side = Math.sign(x) || 1;
      // 眼窝外凸、眉骨抬起、颊部收窄：大眼坐在凸起的眼窝上。
      const socket = Math.exp(-(((absX - 0.200) / 0.072) ** 2))
        * Math.exp(-(((z - 0.020) / 0.074) ** 2))
        * Math.exp(-(((y - 0.048) / 0.068) ** 2));
      const brow = Math.exp(-(((absX - 0.176) / 0.082) ** 2))
        * Math.exp(-(((z + 0.060) / 0.084) ** 2))
        * Math.exp(-(((y - 0.136) / 0.062) ** 2));
      const cheek = Math.exp(-(((absX - 0.238) / 0.072) ** 2))
        * Math.exp(-(((z + 0.010) / 0.128) ** 2))
        * Math.exp(-(((y + 0.030) / 0.086) ** 2));
      pos.setX(i, x + side * (socket * 0.014 - cheek * 0.008));
      pos.setY(i, y + brow * 0.014 + socket * 0.010);
      pos.setZ(i, z - socket * 0.004);
      if (colorAttr) {
        color.fromBufferAttribute(colorAttr, i);
        // 奶油色只涂在吻部下沿：z > 0.12 且 y < -0.06 的一条窄带。
        // 之前用 y < 0.02，把整个前半张脸（含两颊）都涂成了浅色，
        // 近看像戴了一张白色面具。
        const snout = smoothstepValue(0.10, 0.22, z);
        const under = smoothstepValue(-0.02, -0.10, y);
        const creamMix = snout * under;
        color.lerp(creamColor, creamMix * 0.90);
        const topMix = clamp((y + 0.02) / 0.26, 0, 1);
        color.lerp(topColor, topMix * 0.26 * (1 - creamMix));
        colorAttr.setXYZ(i, color.r, color.g, color.b);
      }
    }
    skullGeometry.computeVertexNormals();
    const skull = new T.Mesh(skullGeometry, materials.body);
    skull.castShadow = true;
    skull.receiveShadow = true;
    skull.layers.set(layer);
    head.add(skull);

    // 吻：宽而扁的一段，覆盖脸的下半部。颜色用与颅骨同一份皮肤材质，
    // 由顶点色区分——独立浅色球会在脸上贴出一块"白口罩"。
    const muzzle = new T.Mesh(new T.SphereGeometry(1, 32, 24), materials.body);
    muzzle.scale.set(0.150, 0.082, 0.115);
    muzzle.position.set(0, -0.070, 0.180);
    muzzle.castShadow = true;
    muzzle.receiveShadow = true;
    muzzle.layers.set(layer);
    // 顶点色：吻部整体压成奶油色，边缘略深，和颅骨自然衔接。
    const muzzleColor = new T.Color(0xe9d9b6);
    const mPos = muzzle.geometry.attributes.position;
    const mColors = new Float32Array(mPos.count * 3);
    for (let i = 0; i < mPos.count; i++) {
      const v = mPos.getY(i);
      const shade = 0.82 + 0.18 * clamp((v + 1) / 2, 0, 1);
      mColors[i * 3] = muzzleColor.r * shade;
      mColors[i * 3 + 1] = muzzleColor.g * shade;
      mColors[i * 3 + 2] = muzzleColor.b * shade;
    }
    muzzle.geometry.setAttribute('color', new THREE.Float32BufferAttribute(mColors, 3));
    head.add(muzzle);

    // 鼻梁：从眉骨连到吻根的一道窄脊，把"圆颅"和"圆吻"缝起来，
    // 避免两颗球各长各的、侧面看出接缝。
    const bridge = new T.Mesh(new T.SphereGeometry(1, 20, 16), materials.body);
    bridge.scale.set(0.062, 0.052, 0.120);
    bridge.position.set(0, 0.006, 0.128);
    bridge.castShadow = true;
    bridge.layers.set(layer);
    head.add(bridge);

    // 下巴：吻部下沿的圆钝面，让嘴部有厚度。
    const chin = new T.Mesh(new T.SphereGeometry(1, 22, 16), materials.cream);
    chin.scale.set(0.096, 0.044, 0.086);
    chin.position.set(0, -0.128, 0.176);
    chin.castShadow = true;
    chin.layers.set(layer);
    head.add(chin);

    // 鼻头：吻端两枚鼻孔，不再放一颗圆鼻球——圆鼻球会让脸读成猪。
    for (const side of [-1, 1]) {
      const nostril = new T.Mesh(new T.SphereGeometry(0.0105, 12, 10), materials.nostril);
      nostril.scale.set(1.2, 1.5, 0.45);
      nostril.position.set(side * 0.030, -0.052, 0.286);
      nostril.layers.set(layer);
      head.add(nostril);
    }

    // 笑口：沿吻侧一条上扬的弧线，读作"笑眯眯"。
    const smile = taperedTube(
      [
        new T.Vector3(-0.132, -0.104, 0.176),
        new T.Vector3(-0.070, -0.124, 0.232),
        new T.Vector3(0, -0.130, 0.252),
        new T.Vector3(0.070, -0.124, 0.232),
        new T.Vector3(0.132, -0.104, 0.176),
      ],
      [0.005, 0.010, 0.012, 0.010, 0.005],
      materials.lip,
      { segments: 24, radial: 6 },
    );
    smile.mesh.layers.set(layer);
    head.add(smile.mesh);

    // 口腔与舌头：笑口内侧一小片暗红 + 粉色舌。
    const mouthInner = new T.Mesh(new T.SphereGeometry(1, 18, 12), materials.mouth);
    mouthInner.scale.set(0.076, 0.030, 0.026);
    mouthInner.position.set(0, -0.116, 0.238);
    mouthInner.layers.set(layer);
    head.add(mouthInner);
    const tongue = new T.Mesh(new T.SphereGeometry(1, 16, 12), materials.tongue);
    tongue.scale.set(0.050, 0.014, 0.018);
    tongue.position.set(0, -0.122, 0.242);
    tongue.layers.set(layer);
    head.add(tongue);
    // 两颗小尖牙：从笑口上缘露出来。
    for (const side of [-1, 1]) {
      const fang = new T.Mesh(new T.ConeGeometry(0.009, 0.022, 7), materials.cream);
      fang.rotation.x = Math.PI;
      fang.position.set(side * 0.054, -0.104, 0.228);
      fang.castShadow = true;
      fang.layers.set(layer);
      head.add(fang);
    }

    return { head, skull };
  }

  function smoothstepValue(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* 大眼：眼白 + 大琥珀虹膜 + 圆瞳 + 两点高光 + 上眼睑 + 睫毛。
   * 眼位在颅侧偏前，朝前约 25°，正面能看见两只眼。 */
  function buildEye(side, materials, layer) {
    const group = new T.Group();
    // 眼位：颅骨前缘、朝前约 20°，正面能同时看到两只大眼。
    group.position.set(side * 0.196, 0.070, 0.078);
    group.rotation.y = side * 0.18;
    group.rotation.z = side * -0.04;

    const blink = new T.Group();
    group.add(blink);

    const eyeball = new T.Mesh(new T.SphereGeometry(0.104, 26, 20), materials.eyeWhite);
    eyeball.scale.set(1.0, 1.05, 0.90);
    blink.add(eyeball);

    const iris = new T.Mesh(new T.SphereGeometry(0.086, 24, 18), materials.eyeAmber);
    iris.scale.set(1.0, 1.03, 0.54);
    iris.position.set(0, 0, 0.046);
    blink.add(iris);

    const pupil = new T.Mesh(new T.SphereGeometry(0.048, 18, 14), materials.pupil);
    pupil.scale.set(1.0, 1.06, 0.38);
    pupil.position.set(0, 0, 0.080);
    blink.add(pupil);

    const catchA = new T.Mesh(new T.SphereGeometry(0.018, 10, 8), materials.catchlight);
    catchA.position.set(side * -0.028, 0.034, 0.088);
    blink.add(catchA);
    const catchB = new T.Mesh(new T.SphereGeometry(0.009, 8, 6), materials.catchlight);
    catchB.position.set(side * 0.024, -0.030, 0.090);
    blink.add(catchB);

    // 上眼睑：压在眼球上缘，让眼神温和而不是瞪眼。
    const upperLid = taperedTube(
      [
        new T.Vector3(-0.108, 0.042, 0.010),
        new T.Vector3(-0.034, 0.100, 0.046),
        new T.Vector3(0.052, 0.094, 0.048),
        new T.Vector3(0.114, 0.034, 0.014),
      ],
      [0.016, 0.034, 0.032, 0.010],
      materials.lid,
      { segments: 16, radial: 8 },
    );
    blink.add(upperLid.mesh);

    // 下眼睑：一条浅色窄边。
    const lowerLid = taperedTube(
      [
        new T.Vector3(-0.100, -0.056, 0.012),
        new T.Vector3(0, -0.092, 0.048),
        new T.Vector3(0.098, -0.048, 0.014),
      ],
      [0.008, 0.018, 0.008],
      materials.cream,
      { segments: 14, radial: 6 },
    );
    blink.add(lowerLid.mesh);

    // 睫毛：上眼睑外侧三根短睫毛，是概念图里明显的一笔。
    for (let i = 0; i < 3; i++) {
      const t = i / 2;
      const lash = taperedTube(
        [
          new T.Vector3(side * (0.094 - t * 0.058), 0.056 - t * 0.014, 0.012),
          new T.Vector3(side * (0.146 - t * 0.066), 0.094 - t * 0.010, 0.006),
        ],
        [0.0055, 0.0012],
        materials.pupil,
        { segments: 6, radial: 4 },
      );
      blink.add(lash.mesh);
    }

    group.traverse((node) => {
      if (node.isMesh) node.layers.set(layer);
    });
    return { group, blink };
  }

  /* 耳：侧面一对圆耳，内耳偏粉。 */
  function buildEar(side, materials, layer) {
    const group = new T.Group();
    // 耳要小、贴在颊侧后方，不能做成一对向外支棱的大耳片。
    group.position.set(side * 0.244, 0.086, -0.086);
    group.rotation.set(0.10, side * 0.24, side * -0.36);
    const outer = new T.Mesh(new T.SphereGeometry(1, 18, 14), materials.body);
    outer.scale.set(0.040, 0.062, 0.026);
    outer.castShadow = true;
    outer.layers.set(layer);
    group.add(outer);
    const inner = new T.Mesh(new T.SphereGeometry(1, 14, 12), materials.ear);
    inner.scale.set(0.024, 0.044, 0.012);
    inner.position.z = 0.016;
    inner.layers.set(layer);
    group.add(inner);
    return group;
  }

  /* 鹿角：奶油色，主枝向上后掠，两处分叉，根部有环纹。 */
  function buildHorns(materials, layer) {
    const group = new T.Group();
    for (const side of [-1, 1]) {
      const main = taperedTube(
        [
          new T.Vector3(side * 0.100, 0.228, -0.056),
          new T.Vector3(side * 0.116, 0.312, -0.036),
          new T.Vector3(side * 0.138, 0.392, -0.004),
          new T.Vector3(side * 0.160, 0.452, 0.048),
          new T.Vector3(side * 0.166, 0.494, 0.104),
        ],
        [0.036, 0.030, 0.024, 0.017, 0.006],
        materials.horn,
        { segments: 20, radial: 9 },
      );
      group.add(main.mesh);
      const forkA = taperedTube(
        [
          new T.Vector3(side * 0.122, 0.344, -0.022),
          new T.Vector3(side * 0.156, 0.386, -0.084),
          new T.Vector3(side * 0.162, 0.416, -0.148),
        ],
        [0.018, 0.012, 0.004],
        materials.horn,
        { segments: 12, radial: 7 },
      );
      group.add(forkA.mesh);
      const forkB = taperedTube(
        [
          new T.Vector3(side * 0.146, 0.420, 0.022),
          new T.Vector3(side * 0.204, 0.462, 0.010),
          new T.Vector3(side * 0.238, 0.490, -0.032),
        ],
        [0.016, 0.010, 0.004],
        materials.horn,
        { segments: 12, radial: 7 },
      );
      group.add(forkB.mesh);
      // 角根环纹：两道细环，读作鹿角的分节。
      for (let i = 0; i < 2; i++) {
        const ring = new T.Mesh(new T.TorusGeometry(0.030 - i * 0.004, 0.006, 6, 16), materials.horn);
        ring.position.set(side * (0.104 + i * 0.008), 0.248 + i * 0.036, -0.050 + i * 0.008);
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = side * 0.14;
        ring.castShadow = true;
        ring.layers.set(layer);
        group.add(ring);
      }
    }
    group.traverse((node) => {
      if (node.isMesh) node.layers.set(layer);
    });
    return group;
  }

  /* 鬃：先铺一层鬃底（覆盖颅后，避免看到秃颅），再铺三层宽叶，
   * 叶与叶互相叠压，向后掠。额顶一撮、两颊各两片。 */
  function buildMane(materials, layer) {
    const group = new T.Group();

    // 鬃底：只包住颅后，不能盖到额顶——盖上去会变成一块浅色圆顶。
    const base = new T.Mesh(
      new T.SphereGeometry(1, 26, 20, 0, TAU, 0, Math.PI * 0.62),
      materials.maneBase,
    );
    base.scale.set(0.268, 0.242, 0.220);
    base.position.set(0, 0.010, -0.170);
    base.rotation.x = Math.PI / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    base.layers.set(layer);
    group.add(base);

    const entries = [];
    // 叶片压薄：厚度 0.13 的叶叠三层，侧看会连成一块厚板。
    const geometry = bladeGeometry({ width: 0.52, length: 1.0, thickness: 0.055 });
    const center = new T.Vector3(0, 0.040, -0.052);
    // 三圈叶：贴着颅后向后铺，叶尖朝后，不外扩。
    // 之前 yawSpan 太宽、叶片太大，侧看像两排白色的鳍插在头上。
    const rows = [
      { count: 11, yawSpan: 0.80, pitch: -0.22, radius: 0.98, size: 0.150, color: 0x3f8875 },
      { count: 9, yawSpan: 0.70, pitch: -0.34, radius: 1.03, size: 0.128, color: 0x59a08a },
      { count: 7, yawSpan: 0.60, pitch: -0.46, radius: 1.07, size: 0.108, color: 0x8dc2a8 },
    ];
    for (const row of rows) {
      for (let i = 0; i < row.count; i++) {
        const u = row.count === 1 ? 0 : (i / (row.count - 1) - 0.5) * 2;
        const yaw = u * row.yawSpan;
        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);
        const dir = new T.Vector3(
          sinYaw * 0.300 * row.radius,
          row.pitch * 0.280 + cosYaw * 0.150 * row.radius,
          -cosYaw * 0.292 * row.radius,
        );
        const point = center.clone().add(dir);
        const outward = new T.Vector3(
          sinYaw * 0.62,
          row.pitch + 0.06,
          -cosYaw * 0.86,
        ).normalize();
        entries.push({
          position: point,
          // 叶尖朝后、略向下：鬃是脑后一片向后掠的叶，不是放射的冠。
          direction: outward.clone().add(new T.Vector3(0, -0.10, -0.42)).normalize(),
          normal: new T.Vector3(-sinYaw * 0.44, 0.16, cosYaw * 0.86).normalize(),
          width: row.size * 0.72,
          length: row.size,
          thickness: 0.10,
          color: (i + Math.round(row.pitch * 12)) % 5 === 0 ? 0xefe3c2 : row.color,
        });
      }
    }
    // 额顶一撮短鬃，压在眉骨上方。
    for (let i = 0; i < 5; i++) {
      const u = (i / 4 - 0.5) * 2;
      entries.push({
        position: new T.Vector3(u * 0.092, 0.232 - Math.abs(u) * 0.028, 0.026),
        direction: new T.Vector3(u * 0.44, 0.74, -0.50).normalize(),
        normal: new T.Vector3(u * 0.30, 0.58, 0.76).normalize(),
        width: 0.062,
        length: 0.118 - Math.abs(u) * 0.024,
        thickness: 0.26,
        color: i % 2 === 0 ? 0xefe3c2 : 0x59a08a,
      });
    }
    // 两颊各一片短鬃，贴着脸向后。
    for (const side of [-1, 1]) {
      entries.push({
        position: new T.Vector3(side * 0.238, 0.010, -0.030),
        direction: new T.Vector3(side * 0.34, -0.12, -0.94).normalize(),
        normal: new T.Vector3(side * 0.34, 0.16, 0.92).normalize(),
        width: 0.062,
        length: 0.128,
        thickness: 0.24,
        color: 0x59a08a,
      });
    }
    group.add(bladeInstances(entries, materials.mane, geometry, layer));
    return group;
  }

  /* 眉：眼上方两道短奶油眉，是概念图上很明显的表情细节。 */
  function buildBrows(materials, layer) {
    const group = new T.Group();
    for (const side of [-1, 1]) {
      const brow = taperedTube(
        [
          new T.Vector3(side * 0.136, 0.166, 0.092),
          new T.Vector3(side * 0.206, 0.188, 0.066),
          new T.Vector3(side * 0.262, 0.164, 0.024),
        ],
        [0.007, 0.011, 0.004],
        materials.cream,
        { segments: 12, radial: 5 },
      );
      group.add(brow.mesh);
    }
    group.traverse((node) => {
      if (node.isMesh) node.layers.set(layer);
    });
    return group;
  }

  /* ---------------------------------------------------------------- 四肢 */

  /* 后腿：粗短，髋→膝→踝连续放样；脚掌奶油色，三趾带爪，底面切在 y=0。 */
  function buildLeg(side, materials, layer) {
    const pivot = new T.Group();
    const hipY = 0.372;
    pivot.position.set(side * 0.138, hipY, -0.010);

    const reach = hipY;
    const stations = [
      { z: 0.0, y: 0.0, w: 0.120, h: 0.128 },
      { z: 0.014, y: -reach * 0.28, w: 0.112, h: 0.120 },
      { z: 0.024, y: -reach * 0.54, w: 0.094, h: 0.100 },
      { z: 0.028, y: -reach * 0.78, w: 0.080, h: 0.084 },
      { z: 0.030, y: -reach * 0.92, w: 0.078, h: 0.076 },
    ];
    const { geometry } = loftStations(stations, { rings: 24, radial: 20 });
    const mesh = new T.Mesh(geometry, materials.limb);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    pivot.add(mesh);

    // 脚掌：奶油色，前伸，底面切在局部 y=0。
    const footHeight = 0.068;
    const foot = new T.Mesh(new T.SphereGeometry(1, 22, 16), materials.cream);
    foot.scale.set(0.096, footHeight, 0.146);
    foot.position.set(0, -reach + footHeight, 0.052);
    foot.castShadow = true;
    foot.receiveShadow = true;
    foot.layers.set(layer);
    pivot.add(foot);

    // 三趾 + 小爪。
    for (const toe of [-1, 0, 1]) {
      const toeMesh = new T.Mesh(new T.SphereGeometry(1, 14, 10), materials.cream);
      toeMesh.scale.set(0.034, 0.034, 0.054);
      toeMesh.position.set(toe * 0.052, -reach + 0.032, 0.148);
      toeMesh.castShadow = true;
      toeMesh.layers.set(layer);
      pivot.add(toeMesh);
      const claw = new T.Mesh(new T.ConeGeometry(0.013, 0.042, 7), materials.claw);
      claw.rotation.x = Math.PI / 2 - 0.16;
      claw.position.set(toe * 0.052, -reach + 0.026, 0.194);
      claw.castShadow = true;
      claw.layers.set(layer);
      pivot.add(claw);
    }

    pivot.userData.hipY = hipY;
    pivot.userData.side = side;
    return pivot;
  }

  /* 前臂：短，肩→肘→腕连续放样；手是奶油色小圆掌，三指带爪。 */
  function buildArm(side, materials, layer) {
    const pivot = new T.Group();
    const shoulderY = 0.782;
    pivot.position.set(side * 0.208, shoulderY, 0.036);
    pivot.rotation.z = side * 0.16;

    // 肩头：埋在躯干里的一团肌肉，让手臂与身体之间没有"切管口"。
    const shoulder = new T.Mesh(new T.SphereGeometry(1, 18, 14), materials.limb);
    shoulder.scale.set(0.086, 0.090, 0.084);
    shoulder.position.set(side * -0.014, 0.010, 0);
    shoulder.castShadow = true;
    shoulder.layers.set(layer);
    pivot.add(shoulder);

    const stations = [
      { z: 0.0, y: -0.010, w: 0.068, h: 0.072 },
      { z: 0.012, y: -0.072, w: 0.062, h: 0.066 },
      { z: 0.028, y: -0.132, w: 0.052, h: 0.056 },
      { z: 0.042, y: -0.178, w: 0.048, h: 0.052 },
    ];
    const { geometry } = loftStations(stations, { rings: 16, radial: 16 });
    const mesh = new T.Mesh(geometry, materials.limb);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    pivot.add(mesh);

    // 手掌
    const hand = new T.Mesh(new T.SphereGeometry(1, 16, 12), materials.cream);
    hand.scale.set(0.058, 0.062, 0.052);
    hand.position.set(0, -0.202, 0.054);
    hand.castShadow = true;
    hand.layers.set(layer);
    pivot.add(hand);

    // 三指 + 爪
    for (const finger of [-1, 0, 1]) {
      const tip = new T.Mesh(new T.SphereGeometry(1, 10, 8), materials.cream);
      tip.scale.set(0.020, 0.020, 0.034);
      tip.position.set(finger * 0.034, -0.230, 0.078);
      tip.layers.set(layer);
      pivot.add(tip);
      const claw = new T.Mesh(new T.ConeGeometry(0.009, 0.026, 6), materials.claw);
      claw.rotation.x = Math.PI / 2 - 0.30;
      claw.position.set(finger * 0.034, -0.238, 0.106);
      claw.layers.set(layer);
      pivot.add(claw);
    }

    pivot.userData.side = side;
    return pivot;
  }

  /* ---------------------------------------------------------------- 尾巴 */

  /* 尾巴：从髋后向后上方弯出，末端奶油色扇羽；根粗尖细，带背脊小鳞。 */
  function buildTail(materials, layer) {
    const group = new T.Group();
    group.position.set(0, 0.372, -0.186);
    const stations = [
      { z: 0.000, y: 0.000, w: 0.140, h: 0.138 },
      { z: -0.096, y: -0.024, w: 0.120, h: 0.118 },
      { z: -0.200, y: -0.012, w: 0.096, h: 0.096 },
      { z: -0.304, y: 0.020, w: 0.074, h: 0.074 },
      { z: -0.398, y: 0.072, w: 0.054, h: 0.054 },
      { z: -0.470, y: 0.146, w: 0.036, h: 0.036 },
      { z: -0.512, y: 0.228, w: 0.020, h: 0.020 },
    ];
    const { geometry, curve } = loftStations(stations, {
      rings: 36,
      radial: 26,
      colors: {
        base: new T.Color(0x5c9d86),
        belly: new T.Color(0xefe3c2),
        top: new T.Color(0x3d8573),
      },
    });
    const mesh = new T.Mesh(geometry, materials.body);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    group.add(mesh);

    // 尾羽：末端五片奶油色扇羽，向外散开。
    const entries = [];
    const blade = bladeGeometry({ width: 0.34, length: 1.0, thickness: 0.10 });
    const tip = curve.getPoint(1);
    const tipTangent = curve.getTangent(1).normalize();
    for (let i = 0; i < 5; i++) {
      const u = i / 4 - 0.5;
      const spread = u * 1.5;
      entries.push({
        position: tip.clone().addScaledVector(tipTangent, -0.010),
        direction: tipTangent.clone().multiplyScalar(0.55)
          .add(new T.Vector3(Math.sin(spread) * 0.9, 0.30 + Math.cos(spread) * 0.25, 0))
          .normalize(),
        normal: new T.Vector3(0, 0.55, 0.84).normalize(),
        width: 0.048 + Math.cos(spread) * 0.010,
        length: 0.190 - Math.abs(u) * 0.048,
        thickness: 0.24,
        color: i % 2 === 0 ? 0xf6ecd0 : 0xefe3c2,
      });
    }
    group.add(bladeInstances(entries, materials.mane, blade, layer));

    // 背脊小鳞：沿尾巴上缘一列小片。
    const ridgeEntries = [];
    for (let i = 0; i < 9; i++) {
      const t = 0.06 + (i / 8) * 0.78;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const radius = sampleSeries(stations.map((s) => s.h), t);
      ridgeEntries.push({
        position: point.clone().add(new T.Vector3(0, radius * 0.96, 0)),
        direction: tangent.clone().multiplyScalar(-1)
          .add(new T.Vector3(0, 0.72, 0)).normalize(),
        normal: new T.Vector3(0, 1, 0),
        width: 0.038,
        length: 0.074 - i * 0.004,
        thickness: 0.24,
        color: i % 3 === 0 ? 0xefe3c2 : 0x59a08a,
      });
    }
    group.add(bladeInstances(ridgeEntries, materials.mane, bladeGeometry({ width: 0.40, length: 1.0, thickness: 0.10 }), layer));
    return group;
  }

  /* ---------------------------------------------------------------- 围巾 */

  /* 红围巾：绕颈一圈的布带（前低后高，不是水平圆环）+ 侧结 + 两条长飘带。
   * 飘带向后飘，末端有起伏，是概念图上最显眼的动作元素。 */
  function buildScarf(materials, layer) {
    const group = new T.Group();
    const centerY = 1.000;
    const points = [];
    const segments = 44;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const a = -Math.PI * 0.94 + u * Math.PI * 1.88;
      // 前低后高：脖子上的布自然往下垂。
      const dip = 0.026 * Math.cos(a) * -1;
      points.push(new T.Vector3(
        Math.cos(a) * 0.176,
        centerY + dip + Math.sin(a * 2) * 0.004,
        Math.sin(a) * 0.158,
      ));
    }
    const loop = taperedTube(points, new Array(segments + 1).fill(0.022), materials.scarf, {
      segments,
      radial: 8,
    });
    loop.mesh.layers.set(layer);
    group.add(loop.mesh);

    // 围巾：颈根一圈布带 + 侧结；飘带挂在颈后、贴背垂下。
    const knot = new T.Mesh(new T.SphereGeometry(1, 14, 10), materials.scarf);
    knot.scale.set(0.050, 0.044, 0.040);
    knot.position.set(0.132, centerY - 0.030, 0.086);
    knot.castShadow = true;
    knot.layers.set(layer);
    group.add(knot);

    // 两条长飘带：从颈后垂下并向身后飘，布面竖直，不能横在胸前当围兜。
    const ribbons = [];
    for (const [side, length, width, tilt] of [[1, 0.62, 0.14, 0.10], [-1, 0.50, 0.115, -0.06]]) {
      const ribbon = new T.Mesh(
        new T.PlaneGeometry(width, length, 5, 14),
        materials.scarf,
      );
      const pos = ribbon.geometry.attributes.position;
      const halfW = width / 2;
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getX(i) + halfW) / width;
        const v = (pos.getY(i) + length / 2) / length;
        pos.setZ(i,
          Math.sin(u * Math.PI) * 0.018
          + Math.sin(v * Math.PI * 2.2 + side) * 0.030 * v,
        );
      }
      ribbon.geometry.computeVertexNormals();
      // 挂在颈后、贴着背侧垂下：z 放在躯干背面之外，避免绕到胸前。
      ribbon.position.set(side * 0.058, centerY - 0.230, -0.250);
      ribbon.rotation.set(0.20 + tilt, side * 0.22, side * 0.10);
      ribbon.castShadow = true;
      ribbon.layers.set(layer);
      group.add(ribbon);
      ribbons.push(ribbon);
    }
    return { group, ribbons };
  }

  /* ---------------------------------------------------------------- 装配 */

  function create({ materials, layer = 0, scale = 0.78 } = {}) {
    const root = new T.Group();
    root.name = 'player-dragon';
    root.scale.setScalar(scale);
    const visual = new T.Group();
    root.add(visual);

    const body = buildBody(materials, layer);
    visual.add(body.mesh);
    visual.add(body.neckMesh);

    const headGroup = new T.Group();
    // 头坐落在颈顶：颈顶 y≈1.074，头心 y≈1.210。
    headGroup.position.set(0, 1.210, 0.018);
    visual.add(headGroup);
    const headParts = buildHead(materials, layer);
    headGroup.add(headParts.head);
    headGroup.add(buildMane(materials, layer));
    headGroup.add(buildBrows(materials, layer));

    const eyelids = [];
    for (const side of [-1, 1]) {
      const eye = buildEye(side, materials, layer);
      headGroup.add(eye.group);
      eyelids.push(eye.blink);
      headGroup.add(buildEar(side, materials, layer));
    }
    headGroup.add(buildHorns(materials, layer));

    const legs = [buildLeg(-1, materials, layer), buildLeg(1, materials, layer)];
    legs.forEach((leg) => visual.add(leg));

    const arms = [buildArm(-1, materials, layer), buildArm(1, materials, layer)];
    arms.forEach((arm) => visual.add(arm));

    const tail = buildTail(materials, layer);
    visual.add(tail);

    const scarf = buildScarf(materials, layer);
    visual.add(scarf.group);

    const motion = { phase: 0, blink: 0, wave: 0 };
    function dampTo(current, target, lambda, dt) {
      return current + (target - current) * (1 - Math.exp(-lambda * dt));
    }

    function update(dt, time, speed, mode, steer) {
      const moving = Math.min(1, Math.abs(speed) / 2.8);
      motion.phase += dt * (mode === 'fly' ? 2.6 : 5.6 + moving * 3.4);
      motion.wave += dt * 1.6;

      // 身体：走路时轻微上下与左右摆，飞行时整体前倾。
      const bob = mode === 'fly'
        ? Math.sin(motion.phase) * 0.030
        : Math.abs(Math.sin(motion.phase)) * 0.024 * moving;
      visual.position.y = bob;
      visual.rotation.x = dampTo(visual.rotation.x, mode === 'fly' ? 0.62 : 0, 5, dt);
      visual.rotation.z = dampTo(visual.rotation.z, steer * (mode === 'fly' ? 0.22 : 0.06), 5, dt);

      // 头：走路时点头，飞行时抬头看前方。
      headGroup.rotation.x = dampTo(
        headGroup.rotation.x,
        (mode === 'fly' ? -0.42 : 0.02) + Math.sin(motion.phase * 2) * 0.014 * moving,
        6,
        dt,
      );
      headGroup.rotation.y = Math.sin(time * 0.7) * 0.06 + steer * 0.14;
      headGroup.rotation.z = Math.sin(motion.phase) * 0.020 * moving;

      // 后腿：交替迈步；飞行时收起并后摆。
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        const phase = i * Math.PI;
        const swing = mode === 'fly'
          ? -0.62
          : Math.sin(motion.phase + phase) * 0.46 * moving;
        leg.rotation.x = dampTo(leg.rotation.x, swing, 9, dt);
        leg.rotation.z = mode === 'fly' ? leg.userData.side * 0.10 : 0;
      }

      // 手臂：与后腿反相摆动；飞行时张开。
      for (let i = 0; i < arms.length; i++) {
        const arm = arms[i];
        const phase = i * Math.PI + Math.PI;
        const swing = mode === 'fly'
          ? -0.85
          : Math.sin(motion.phase + phase) * 0.34 * moving;
        arm.rotation.x = dampTo(arm.rotation.x, swing, 9, dt);
        arm.rotation.z = dampTo(
          arm.rotation.z,
          mode === 'fly' ? arm.userData.side * 0.85 : arm.userData.side * 0.16,
          7,
          dt,
        );
      }

      // 尾巴：左右摆 + 上下轻摆，飞行时抬高。
      tail.rotation.y = Math.sin(time * 1.8) * 0.16 + steer * 0.18;
      tail.rotation.x = dampTo(
        tail.rotation.x,
        (mode === 'fly' ? -0.34 : 0) + Math.sin(time * 1.2) * 0.05,
        5,
        dt,
      );

      // 围巾飘带：随速度与风向摆动。
      for (let i = 0; i < scarf.ribbons.length; i++) {
        const ribbon = scarf.ribbons[i];
        const sway = Math.sin(motion.wave + i * 1.7);
        ribbon.rotation.x = 0.20 + sway * 0.12 + moving * 0.18 + (mode === 'fly' ? 0.30 : 0);
        ribbon.rotation.y = (i === 0 ? 0.20 : -0.20) + sway * 0.10;
        ribbon.rotation.z = (i === 0 ? 0.10 : -0.10) + Math.sin(motion.wave * 0.8 + i) * 0.06;
      }

      // 眨眼：约 4 秒一次，眼睑整体压合。
      motion.blink += dt;
      if (motion.blink > 4.2) motion.blink = 0;
      const lid = motion.blink > 4.02 ? 0.10 : 1;
      eyelids.forEach((node) => { node.scale.y = lid; });
    }

    root.traverse((node) => node.layers.set(layer));
    visual.userData.body = body.mesh;
    return {
      root,
      visual,
      head: headGroup,
      legs,
      arms,
      tail,
      update,
      headWorld: new T.Vector3(),
    };
  }

  window.ChanganDragonModel = { create, bladeGeometry, taperedTube, scaleNormalTexture };
})();
