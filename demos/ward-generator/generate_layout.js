#!/usr/bin/env node
// 龙游长安 108坊布局生成器
// 考古坐标：原点外郭城西南角，X东向正，Z北向正。Three.js worldZ = -archZ
'use strict';
const fs = require('fs');
const path = require('path');

const CITY = { minX: 0, maxX: 9721, minZ: 0, maxZ: 8652 };
const ZHUQUE = { centerX: 4860, width: 150 };
const IMPERIAL = { minX: 3450, maxX: 6270, minZ: 5316, maxZ: 7160 };
const PALACE = { minX: 3450, maxX: 6270, minZ: 7160, maxZ: 8652 };

// 街东坊名（万年县）由北向南8排由西向东6列
const EAST = [
  [{n:'务本坊',t:'L'},{n:'平康坊',t:'I'},{n:'宣阳坊',t:'B'},{n:'崇仁坊',t:'B'},{n:'胜业坊',t:'C'},{n:'道政坊',t:'F'}],
  [{n:'安义坊',t:'H'},{n:'长庆坊',t:'H'},{n:'宜平坊',t:'H'},{n:'东市',t:'F',m:1},{n:'长乐坊',t:'C'},{n:'永嘉坊',t:'B'}],
  [{n:'光福坊',t:'H'},{n:'亲仁坊',t:'B'},{n:'永宁坊',t:'B'},{n:'永兴坊',t:'H'},{n:'靖恭坊',t:'H'},{n:'永兴东',t:'H'}],
  [{n:'晋昌坊',t:'E',pagoda:1,temple:1},{n:'大宁坊',t:'C'},{n:'安邑坊',t:'H'},{n:'宣平坊',t:'E'},{n:'昇平坊',t:'H'},{n:'修政坊',t:'H'}],
  [{n:'通善坊',t:'H'},{n:'升道坊',t:'H'},{n:'敦化坊',t:'H'},{n:'立政坊',t:'H'},{n:'曲江池',t:'J',lake:1},{n:'芙蓉园',t:'J'}],
  [{n:'昭国坊',t:'H'},{n:'慈惠坊',t:'H'},{n:'曲池坊',t:'J'},{n:'敦义坊',t:'H'},{n:'安城坊',t:'H'},{n:'崇让坊',t:'H'}],
  [{n:'启夏坊',t:'H'},{n:'齐干坊',t:'H'},{n:'大统坊',t:'H'},{n:'安德坊',t:'H'},{n:'宜城坊',t:'H'},{n:'归义坊',t:'H'}],
  [{n:'崇化坊',t:'H'},{n:'永乐坊',t:'H'},{n:'横水坊',t:'H'},{n:'布政南',t:'H'},{n:'修文坊',t:'H'},{n:'敦教坊',t:'H'}],
];
// 街西坊名（长安县）
const WEST = [
  [{n:'顺义坊',t:'A'},{n:'布政坊',t:'A'},{n:'延寿坊',t:'G',hui:1},{n:'崇义坊',t:'G',hui:1},{n:'丰邑坊',t:'K'},{n:'群贤坊',t:'H'}],
  [{n:'开化坊',t:'E',pagoda:1,temple:1},{n:'靖善坊',t:'D',temple:1},{n:'西市',t:'G',m:1,hui:1},{n:'太平坊',t:'B'},{n:'通轨坊',t:'H'},{n:'居德坊',t:'H'}],
  [{n:'光德坊',t:'B'},{n:'来庭坊',t:'H'},{n:'睦德坊',t:'H'},{n:'延福坊',t:'H'},{n:'濠河坊',t:'H'},{n:'普德坊',t:'H'}],
  [{n:'崇业坊',t:'D',temple:1,taoist:1},{n:'弘业坊',t:'H'},{n:'丰财坊',t:'K'},{n:'金城坊',t:'H'},{n:'延康坊',t:'H'},{n:'延平坊',t:'H'}],
  [{n:'永安坊',t:'H'},{n:'嘉会坊',t:'H'},{n:'永平坊',t:'H'},{n:'昭国西',t:'H'},{n:'义和坊',t:'H'},{n:'修真坊',t:'H'}],
  [{n:'怀德坊',t:'H'},{n:'长寿坊',t:'H'},{n:'崇贤坊',t:'H'},{n:'普宁坊',t:'H'},{n:'义宁坊',t:'H'},{n:'居德西',t:'H'}],
  [{n:'安仁坊',t:'E'},{n:'丰乐坊',t:'H'},{n:'清平坊',t:'H'},{n:'择善坊',t:'H'},{n:'通济坊',t:'H'},{n:'永阳坊',t:'D',temple:1}],
  [{n:'丰和坊',t:'H'},{n:'延祚坊',t:'H'},{n:'崇德里',t:'H'},{n:'积善坊',t:'H'},{n:'居贤坊',t:'H'},{n:'太平西',t:'H'}],
];

function build() {
  const wards = []; let id = 0;
  const rows = 8, rowStreet = 35, rowMargin = 40;
  const wardDepth = (IMPERIAL.minZ - (rows-1)*rowStreet - 2*rowMargin) / rows;
  // 街东 X[4935,9721] 6列
  const eEdge = ZHUQUE.centerX + ZHUQUE.width/2;
  const eW = (CITY.maxX - eEdge - 5*60 - 2*50) / 6;
  for (let r=0;r<rows;r++){
    const cr = rows-1-r;
    const z1 = rowMargin + cr*(wardDepth+rowStreet), z2 = z1+wardDepth;
    for (let c=0;c<6;c++){
      const x1 = eEdge+50+c*(eW+60), x2 = x1+eW;
      const info = EAST[r][c];
      wards.push({id:id++, name:info.n, type:info.t, bbox:[Math.round(x1),Math.round(z1),Math.round(x2),Math.round(z2)], center:[Math.round((x1+x2)/2),Math.round((z1+z2)/2)], size:{w:Math.round(x2-x1),d:Math.round(z2-z1)}, side:'east', isMarket:!!info.m, isTemple:!!info.temple, hasPagoda:!!info.pagoda, isLake:!!info.lake, isHui:!!info.hui, seed:10000+id*137});
    }
  }
  // 街西 X[0,4785] 6列
  const wEdge = ZHUQUE.centerX - ZHUQUE.width/2;
  const wW = (wEdge - 5*60 - 2*50) / 6;
  for (let r=0;r<rows;r++){
    const cr = rows-1-r;
    const z1 = rowMargin + cr*(wardDepth+rowStreet), z2 = z1+wardDepth;
    for (let c=0;c<6;c++){
      const x2 = wEdge-50-c*(wW+60), x1 = x2-wW;
      const info = WEST[r][c];
      wards.push({id:id++, name:info.n, type:info.t, bbox:[Math.round(x1),Math.round(z1),Math.round(x2),Math.round(z2)], center:[Math.round((x1+x2)/2),Math.round((z1+z2)/2)], size:{w:Math.round(x2-x1),d:Math.round(z2-z1)}, side:'west', isMarket:!!info.m, isTemple:!!info.temple, hasPagoda:!!info.pagoda, isHui:!!info.hui, seed:10000+id*137});
    }
  }
  return wards;
}

const wards = build();
const out = {
  meta: { city:'唐长安城', generated:'2026-10-25', cityBounds:[0,0,9721,8652], zhuqueAve:{centerX:4860,width:150}, wardCount:wards.length },
  specialZones: [
    {name:'宫城(太极宫)',type:'PALACE',bbox:[3450,7160,6270,8652]},
    {name:'皇城',type:'IMPERIAL',bbox:[3450,5316,6270,7160]},
    {name:'大明宫',type:'DAMING',bbox:[5200,7800,9800,10600]},
    {name:'曲江池',type:'QUJIANG',bbox:[8000,0,9600,1400]},
    {name:'朱雀大街',type:'ROAD',bbox:[4785,0,4935,5316]},
  ],
  wards: wards
};
fs.writeFileSync(path.join(__dirname,'data','wards.json'), JSON.stringify(out,null,2));
console.log('Generated', wards.length, 'wards');
