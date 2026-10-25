const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {out,build} = require('../generate_layout.js');
const {generateWard} = require('../generate_ward.js');

test('the inherited tables represent 96 experimental slots, not a fabricated 108',()=>{
  assert.equal(build().length,96);
  assert.equal(out.meta.wardCount,96);
  assert.equal(out.meta.missingSlots,12);
  assert.equal(out.wards.filter(w=>w.isMarket||w.isLake).length,3);
  assert.equal(new Set(out.wards.map(w=>w.id)).size,96);
  for(const w of out.wards)assert.ok(w.bbox[2]>w.bbox[0]&&w.bbox[3]>w.bbox[1]);
});
test('the recovered per-slot algorithm is reproducible',()=>{
  const w=out.wards[0],input={name:w.name,bbox:w.bbox,wardType:w.type,seed:w.seed};
  const a=generateWard(input);
  assert.deepEqual(a,generateWard(input));
  assert.notDeepEqual(a,generateWard({...input,seed:w.seed+1}));
});
test('generation creates 93 JSON records and three existing special-zone references',()=>{
  const base=path.resolve(__dirname,'..');
  execFileSync(process.execPath,[path.join(base,'generate_city.js')],{cwd:base});
  const outDir=path.join(base,'output');
  const index=JSON.parse(fs.readFileSync(path.join(outDir,'city_index.json'),'utf8'));
  assert.equal(index.meta.wardCount,96);
  assert.equal(index.meta.generatedWards,93);
  assert.equal(index.meta.skippedWards,3);
  assert.equal(index.meta.historicalVerified,false);
  assert.equal(index.wards.length,96);
  assert.equal(fs.readdirSync(path.join(outDir,'wards_all')).filter(x=>x.endsWith('.json')).length,93);
  for(const w of index.wards){
    const p=path.resolve(outDir,w.file);
    assert.ok(fs.existsSync(p),p);
    if(!w.isPlaceholder){
      const doc=JSON.parse(fs.readFileSync(p,'utf8'));
      assert.equal(doc.objects.length,w.objects);
      assert.equal(doc.npcs.length,w.npcs);
    }
  }
});
