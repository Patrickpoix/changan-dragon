#!/usr/bin/env node
/**
 * 龙游长安 · 单坊程序化生成器
 * 输入：坊 bbox [x1,z1,x2,z2]、功能类型、随机种子
 * 输出：该坊内所有物体实例 JSON（建筑/坊墙/坊门/树/灯笼/NPC）
 * 种子化随机：mulberry32，同 seed 同结果。
 */
'use strict';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = n => Math.round(n * 100) / 100;

function gatePositions(bbox, isLarge) {
  const [x1, z1, x2, z2] = bbox;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const gates = [{ side: 'W', pos: cz }, { side: 'E', pos: cz }];
  if (isLarge) { gates.push({ side: 'N', pos: cx }, { side: 'S', pos: cx }); }
  return gates;
}

function buildWallObjects(bbox, isLarge) {
  const [x1, z1, x2, z2] = bbox;
  const objects = [];
  const segLen = 10;
  const gates = gatePositions(bbox, isLarge);
  const gateHalfW = 7;
  for (const z of [z1, z2]) {
    for (let x = x1; x < x2; x += segLen) {
      const cx = x + segLen / 2;
      const inGate = gates.some(g => (g.side === 'N' || g.side === 'S') && Math.abs(g.pos - cx) < gateHalfW);
      if (!inGate) objects.push({ type: 'wall', pos: [r2(cx), 0, r2(z)], rotY: 0, scale: 1 });
    }
  }
  for (const x of [x1, x2]) {
    for (let z = z1; z < z2; z += segLen) {
      const cz = z + segLen / 2;
      const inGate = gates.some(g => (g.side === 'E' || g.side === 'W') && Math.abs(g.pos - cz) < gateHalfW);
      if (!inGate) objects.push({ type: 'wall', pos: [r2(x), 0, r2(cz)], rotY: 90, scale: 1 });
    }
  }
  return { objects, gates };
}

function buildTrees(bbox) {
  const [x1, z1, x2, z2] = bbox;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const trees = [];
  const off = 5, gap = 5;
  for (let x = x1 + off; x < x2 - off; x += gap) {
    trees.push([r2(x), r2(z1 + off)], [r2(x), r2(z2 - off)]);
  }
  for (let z = z1 + off; z < z2 - off; z += gap) {
    trees.push([r2(x1 + off), r2(z)], [r2(x2 - off), r2(z)]);
  }
  for (let x = x1 + off; x < x2 - off; x += gap) {
    if (Math.abs(x - cx) > 10) trees.push([r2(x), r2(cz - 8)], [r2(x), r2(cz + 8)]);
  }
  for (let z = z1 + off; z < z2 - off; z += gap) {
    if (Math.abs(z - cz) > 10) trees.push([r2(cx - 8), r2(z)], [r2(cx + 8), r2(z)]);
  }
  return trees.map(p => ({ pos: [p[0], 0, p[1]], species: 'pagoda_tree' }));
}

function buildNPCs(bbox, wardType, rng) {
  const [x1, z1, x2, z2] = bbox;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const npcs = [];
  const densityMap = { H: 15, B: 6, C: 4, D: 10, E: 12, F: 25, G: 35, I: 30, K: 5, L: 8, J: 20 };
  const count = densityMap[wardType] || 10;
  for (let i = 0; i < count; i++) {
    const onH = rng() < 0.5;
    const px = onH ? (x1 + 20 + rng() * (x2 - x1 - 40)) : cx + (rng() - 0.5) * 20;
    const pz = onH ? cz + (rng() - 0.5) * 20 : (z1 + 20 + rng() * (z2 - z1 - 40));
    npcs.push({ pos: [r2(px), 0, r2(pz)], path: [[r2(px-20), r2(pz)], [r2(px+20), r2(pz)]] });
  }
  return npcs;
}

function generateWard({ name, pinyin, bbox, wardType, seed, isTemple=false, hasPagoda=false }) {
  const rng = mulberry32(seed);
  const [x1, z1, x2, z2] = bbox;
  const w = x2 - x1, d = z2 - z1;
  const isLarge = w > 600 || d > 600;

  const wallData = buildWallObjects(bbox, isLarge);
  const buildings = [];
  // 简化建筑生成：按坊类型密度放置占位盒子
  const blockW = (x2 - x1 - 30) / 2, blockD = (z2 - z1 - 30) / 2;
  for (let bx = 0; bx < 2; bx++) {
    for (let bz = 0; bz < 2; bz++) {
      const ox = x1 + 15 + bx * (blockW + 15);
      const oz = z1 + 15 + bz * (blockD + 15);
      const count = wardType === 'H' ? 8 + Math.floor(rng()*6) :
                    wardType === 'F' || wardType === 'G' ? 12 + Math.floor(rng()*8) :
                    wardType === 'B' || wardType === 'C' ? 2 : 4;
      for (let i = 0; i < count; i++) {
        buildings.push({
          type: 'building',
          pos: [r2(ox + 10 + rng() * (blockW - 20)), 0, r2(oz + 10 + rng() * (blockD - 20))],
          rotY: [0, 90, 180, 270][Math.floor(rng()*4)],
          scale: 0.8 + rng() * 0.4,
        });
      }
    }
  }

  return {
    ward: pinyin || name, name, bbox,
    size: { w: r2(w), d: r2(d) }, seed, wardType,
    objects: [...wallData.objects, ...buildings],
    npcs: buildNPCs(bbox, wardType, rng),
    trees: buildTrees(bbox),
    lanterns: [],
  };
}

module.exports = { generateWard, mulberry32 };
