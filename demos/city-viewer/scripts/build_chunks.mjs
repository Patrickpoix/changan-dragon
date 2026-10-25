// Rebuild disposable streaming payloads from the preserved per-slot JSON.
// These ARE NOT reconstructed bytes from Doubao's inaccessible cloud workspace.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const demo=path.resolve(here,'../..');
const source=path.resolve(demo,'ward-generator/output');
const target=process.argv[2] ? path.resolve(process.cwd(),process.argv[2]) : path.resolve(here,'../public/chunks');
// Regenerate from the single tracked source of truth on every build.
execFileSync(process.execPath,[path.join(demo,'ward-generator/generate_city.js')],{stdio:'inherit'});
const index=JSON.parse(fs.readFileSync(path.join(source,'city_index.json'),'utf8'));
if(index.meta.wardCount!==96||index.meta.generatedWards!==93||index.meta.missingSlots!==12){
  throw new Error('Refusing to label incomplete or inconsistent research data as full city data');
}
const groups=new Map();
for(const ward of index.wards){
  const cx=Math.floor(ward.center[0]/1000),cz=Math.floor(ward.center[1]/1000);
  const key=cx+'_'+cz;
  if(!groups.has(key))groups.set(key,[]);
  const detail=ward.isPlaceholder ? null : JSON.parse(fs.readFileSync(path.resolve(source,ward.file),'utf8'));
  groups.get(key).push({
    id:ward.id,name:ward.name,bbox:ward.bbox,center:ward.center,
    isPlaceholder:ward.isPlaceholder,objects:detail?.objects||[],
    trees:detail?.trees||[],npcs:detail?.npcs||[]
  });
}
fs.mkdirSync(target,{recursive:true});
const chunks=[];
for(const [key,entries] of [...groups].sort((a,b)=>a[0].localeCompare(b[0]))){
  const data={key,entries,coordinateSystem:'archX east, archZ north; renderer Z=-archZ',historicalVerified:false};
  fs.writeFileSync(path.join(target,key+'.json'),JSON.stringify(data));
  chunks.push({key,entryCount:entries.length,objectCount:entries.reduce((n,e)=>n+e.objects.length,0)});
}
const manifest={
  status:'RESEARCH_PROTOTYPE_ONLY',historicalVerified:false,sourceSlots:96,
  generatedSlots:93,specialPlaceholders:3,missingSlots:12,chunkSize:1000,chunks
};
fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Built',chunks.length,'streaming research chunks for',target,'from',index.wards.length,'slots');
