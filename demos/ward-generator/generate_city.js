#!/usr/bin/env node
/**
 * 全城批量生成器
 * 复用 generate_ward.js 的 generateWard()，遍历 108 坊。
 * 特殊区域（东市/西市/曲江池 ward）跳过生成器，引用 special-areas/ 桩文件。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { generateWard } = require('./generate_ward.js');

const OUT_DIR = path.join(__dirname, 'output');
const WARDS_ALL_DIR = path.join(OUT_DIR, 'wards_all');
const SPECIAL_DIR = path.join(OUT_DIR, 'special-areas');

const t0 = Date.now();
const wardsJSON = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'wards.json'), 'utf8'));

// ---------- 12 外郭城门 ----------
// 考古坐标：X∈[0,9721] 东向，Z∈[0,8652] 北向；南墙 Z=0，北墙 Z=8652。
const GATES = [
  { name: '明德门', side: 'S', pos: [4860, 0], note: '外郭城南墙中轴正门，5 门道' },
  { name: '启夏门', side: 'S', pos: [8000, 0], note: '南墙东门，通往南郊祭天' },
  { name: '安化门', side: 'S', pos: [1720, 0], note: '南墙西门' },
  { name: '光化门', side: 'N', pos: [1450, 8652], note: '北墙西门' },
  { name: '景耀门', side: 'N', pos: [3950, 8652], note: '北墙中门，宫城西侧' },
  { name: '芳林门', side: 'N', pos: [6200, 8652], note: '北墙东门，入禁苑' },
  { name: '通化门', side: 'E', pos: [9721, 7100], note: '东墙北门，通往潼关大道' },
  { name: '春明门', side: 'E', pos: [9721, 4320], note: '东墙中门，近兴庆宫' },
  { name: '延兴门', side: 'E', pos: [9721, 1500], note: '东墙南门，近曲江' },
  { name: '开远门', side: 'W', pos: [0, 7100], note: '西墙北门，丝绸之路起点' },
  { name: '金光门', side: 'W', pos: [0, 4320], note: '西墙中门，过西市' },
  { name: '延平门', side: 'W', pos: [0, 1500], note: '西墙南门，通往昆明池' },
];

// ---------- 主流程 ----------
const wardsIndex = [];
let totalObjects = 0, totalNpcs = 0, totalTrees = 0, totalLanterns = 0;
let generated = 0, skipped = 0;
const typeStats = {};

for (const w of wardsJSON.wards) {
  if (w.isMarket || w.isLake) {
    skipped++;
    let ref;
    if (w.pinyin === 'dongshi') ref = 'special-areas/dongshi.json';
    else if (w.pinyin === 'xishi') ref = 'special-areas/xishi.json';
    else if (w.isLake) ref = 'special-areas/qujiang.json';
    wardsIndex.push({
      id: w.id, name: w.name, pinyin: w.pinyin,
      type: w.type, typeName: w.typeName,
      bbox: w.bbox, center: w.center, seed: w.seed,
      file: ref, isPlaceholder: true,
      objects: 0, npcs: 0,
    });
    typeStats[w.typeName] = typeStats[w.typeName] || { count: 0, objects: 0, npcs: 0 };
    typeStats[w.typeName].count++;
    continue;
  }

  const result = generateWard({
    name: w.name, pinyin: w.pinyin, bbox: w.bbox,
    wardType: w.type, seed: w.seed,
    isTemple: w.isTemple, hasPagoda: w.hasPagoda,
  });
  const fname = `ward_${String(w.id).padStart(3, '0')}_${w.pinyin}.json`;
  const fpath = path.join(WARDS_ALL_DIR, fname);
  fs.writeFileSync(fpath, JSON.stringify(result, null, 2));

  generated++;
  totalObjects += result.objects.length;
  totalNpcs += result.npcs.length;
  totalTrees += result.trees.length;
  totalLanterns += result.lanterns.length;

  wardsIndex.push({
    id: w.id, name: w.name, pinyin: w.pinyin,
    type: w.type, typeName: w.typeName,
    bbox: w.bbox, center: w.center, seed: w.seed,
    file: `wards_all/${fname}`, isPlaceholder: false,
    objects: result.objects.length, npcs: result.npcs.length,
    trees: result.trees.length, lanterns: result.lanterns.length,
  });

  typeStats[w.typeName] = typeStats[w.typeName] || { count: 0, objects: 0, npcs: 0 };
  typeStats[w.typeName].count++;
  typeStats[w.typeName].objects += result.objects.length;
  typeStats[w.typeName].npcs += result.npcs.length;
}

const cityIndex = {
  meta: {
    city: '唐长安城（隋大兴城）',
    coordinateSystem: '考古坐标，原点在外郭城西南角，X 东向正，Z 北向正',
    cityBounds: [0, 0, 9721, 8652],
    wardCount: 108,
    generatedWards: generated,
    skippedWards: skipped,
  },
  zhuqueAvenue: { name: '朱雀大街', centerX: 4860, width: 150, bbox: [4785, 0, 4935, 5316] },
  gates: GATES,
  wards: wardsIndex,
  stats: { totalObjects, totalNpcs, totalTrees, totalLanterns, typeStats },
};

fs.writeFileSync(path.join(OUT_DIR, 'city_index.json'), JSON.stringify(cityIndex, null, 2));
console.log(`✓ 生成完成，坊: ${generated}, 跳过: ${skipped}, 物体: ${totalObjects}, NPC: ${totalNpcs}`);
