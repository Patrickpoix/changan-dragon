#!/usr/bin/env node
// Offline study generator. Tool dependencies: esbuild 0.25.12, three 0.167.1.
// node tools/prepare_vegetation_studies.mjs /path/to/tool-environment
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const deps=path.resolve(process.argv[2] || '/workspace/.environment/changan-tree-tools');
const require=createRequire(path.join(deps,'package.json'));
const esbuild=require('esbuild');
const source=path.join(root,'assets/library/vegetation/ez-tree-source');
const dest=path.join(root,'assets/library/vegetation/studies');
const revision='dcf309bd86bd521083d9c70f01f2de45fdc7c457';
const sha=b=>createHash('sha256').update(b).digest('hex');
function save(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});if(fs.existsSync(p)&&!fs.readFileSync(p).equals(Buffer.from(b)))throw Error('Preserving different existing file: '+p);fs.writeFileSync(p,b);}
function json(p,v){save(p,JSON.stringify(v,null,2)+'\n');}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'changan-trees-'));
try {
const entry=`export {Tree} from ${JSON.stringify(path.join(source,'src/lib/tree.js'))}; export * as THREE from 'three';`;
await esbuild.build({stdin:{contents:entry,resolveDir:deps},bundle:true,platform:'node',format:'cjs',outfile:path.join(temp,'core.cjs'),nodePaths:[path.join(deps,'node_modules')],logLevel:'warning'});
const {Tree,THREE:T}=require(path.join(temp,'core.cjs'));
const version=JSON.parse(fs.readFileSync(path.join(deps,'node_modules/three/package.json'))).version;
if(version!=='0.167.1')throw Error('Expected tool Three 0.167.1; got '+version);
const details=[{}, {sectionStride:3,segmentFactor:.75,leafStride:2,leafScale:1.25}, {sectionStride:6,segmentFactor:.4,leafStride:3,leafScale:1.3,billboard:'single'}];
// Explicit minimal GLB writer: indexed meshes, standard PBR, embedded author PNG.
function glb(geometries,png,leafColor){
 const chunks=[],views=[],accessors=[];let offset=0;
 function buffer(b,target){const pad=(4-b.length%4)%4;const index=views.length;views.push({buffer:0,byteOffset:offset,byteLength:b.length,...(target?{target}:{})});chunks.push(b,Buffer.alloc(pad));offset+=b.length+pad;return index;}
 function attr(a,type){const values=a.array;for(const v of values)if(!Number.isFinite(v))throw Error('Nonfinite attribute');let min,max;
  if(type==='VEC3'){min=[Infinity,Infinity,Infinity];max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.count;i++)for(let c=0;c<3;c++){min[c]=Math.min(min[c],values[i*3+c]);max[c]=Math.max(max[c],values[i*3+c]);}}
  const index=accessors.length;accessors.push({bufferView:buffer(Buffer.from(values.buffer,values.byteOffset,values.byteLength),34962),componentType:5126,count:a.count,type,...(min?{min,max}:{})});return index;
 }
 let triangles=0;const meshes=geometries.map((g,i)=>{
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;const idx=new Uint32Array(g.index.array);for(const v of idx)if(v>=p.count)throw Error('Index out of bounds');triangles+=idx.length/3;
  const attributes={POSITION:attr(p,'VEC3'),NORMAL:attr(n,'VEC3'),TEXCOORD_0:attr(uv,'VEC2')};const ix=accessors.length;accessors.push({bufferView:buffer(Buffer.from(idx.buffer),34963),componentType:5125,count:idx.length,type:'SCALAR'});
  return {primitives:[{attributes,indices:ix,material:i}]};
 });
 const imageView=buffer(png);const doc={asset:{version:'2.0',generator:'ChanganDragon vegetation study recovery'},scene:0,scenes:[{nodes:[0,1]}],nodes:[{mesh:0,name:'branches'},{mesh:1,name:'leaf cards'}],meshes,materials:[{name:'study bark tint',pbrMetallicRoughness:{baseColorFactor:[.27,.17,.09,1],metallicFactor:0,roughnessFactor:.93}},{name:'MIT leaf texture',doubleSided:true,alphaMode:'MASK',alphaCutoff:.5,pbrMetallicRoughness:{baseColorFactor:[...leafColor,1],baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:.85}}],textures:[{sampler:0,source:0}],samplers:[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}],images:[{bufferView:imageView,mimeType:'image/png'}],buffers:[{byteLength:offset}],bufferViews:views,accessors,extras:{status:'research_only',source_revision:revision,license:fs.readFileSync(path.join(source,'LICENSE'),'utf8'),wind:'static export; shader wind is not exported'}};
 const jb=Buffer.from(JSON.stringify(doc));const jp=Buffer.concat([jb,Buffer.alloc((4-jb.length%4)%4,32)]);const bin=Buffer.concat(chunks);const h=Buffer.alloc(20);h.write('glTF');h.writeUInt32LE(2,4);h.writeUInt32LE(28+jp.length+bin.length,8);h.writeUInt32LE(jp.length,12);h.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
 return {data:Buffer.concat([h,jp,bh,bin]),triangles};
}
const types=[['street','oak_small','oak',8,[.70,.83,.49]],['willow','ash_small','ash',9,[.65,.80,.40]],['pine','pine_small','pine',10,[.52,.68,.47]],['blossom','oak_small','oak',5,[1,.48,.60]]];
const records=[];
for(const [name,preset,leaf,height,color] of types){
 const tree=new Tree();const options=JSON.parse(fs.readFileSync(path.join(source,'src/lib/presets',preset+'.json')));
 options.seed=({street:413,willow:733,pine:11744,blossom:922})[name];options.bark.textured=false;
 if(name==='willow'){options.branch.force={direction:{x:0,y:-1,z:0},strength:.06};options.branch.angle['2']=95;options.branch.angle['3']=135;}
 tree.loadFromJson(options);
 const first=tree.createGeometry();first.branches.computeBoundingBox();first.leaves.computeBoundingBox();const box=first.branches.boundingBox.clone().union(first.leaves.boundingBox);const scale=height/(box.max.y-box.min.y);
 const png=fs.readFileSync(path.join(source,'src/app/public/textures/leaves',leaf+'.png'));
 if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Leaf image must be actual PNG, not Git LFS pointer');
 json(path.join(dest,name+'-options.json'),{preset,options,height,leaf,warning:'Approximate form research, not botanical reconstruction; blossom uses tinted oak leaves, not finished flower geometry.'});
 const levels=[];
 for(let lod=0;lod<3;lod++){
  const geo=lod===0?first:tree.createGeometry(details[lod]);const geometries=[geo.branches,geo.leaves];const b=new T.Box3();
  for(const g of geometries){g.translate(0,-box.min.y,0);g.scale(scale,scale,scale);g.computeBoundingBox();b.union(g.boundingBox);}
  const {data,triangles}=glb(geometries,png,color);const file=name+'-lod'+lod+'.glb';save(path.join(dest,file),data);levels.push({file,triangles,bytes:data.length,sha256:sha(data),bounds:{min:b.min.toArray(),max:b.max.toArray()},detail:details[lod]});
 }
 if(!(levels[0].triangles>levels[1].triangles&&levels[1].triangles>levels[2].triangles))throw Error('LOD reduction failed');
 records.push({type:name,levels});console.log(name,levels.map(l=>l.triangles));
}
json(path.join(dest,'manifest.json'),{status:'reconstructed_research_only',source_revision:revision,tool_three:version,runtime_three_unchanged:'r160',runtime_integrated:false,visual_accepted:false,browser_compatibility_accepted:false,notes:'Same seeded skeleton across LODs; leaf cards remain alpha-masked. Willow form approximate, blossom leaf tint placeholder; no wind exported.',types:records});
const files=[];function walk(dir){for(const name of fs.readdirSync(dir).sort()){const p=path.join(dir,name);if(fs.statSync(p).isDirectory())walk(p);else if(name!=='source-manifest.json'){const b=fs.readFileSync(p);if(name.endsWith('.png')){const pointer=fs.readFileSync(p+'.lfs-pointer','utf8');const expected=pointer.match(/oid sha256:([a-f0-9]+)/)?.[1],size=Number(pointer.match(/size (\d+)/)?.[1]);if(sha(b)!==expected||b.length!==size)throw Error('LFS verification failed: '+p);}files.push({file:path.relative(source,p),bytes:b.length,sha256:sha(b),url:(name.endsWith('.png')?'https://media.githubusercontent.com/media/':'https://raw.githubusercontent.com/')+'dgreenheck/ez-tree/'+revision+'/'+path.relative(source,p).replace(/\.lfs-pointer$/,'')});}}}walk(source);
json(path.join(source,'source-manifest.json'),{repository:'https://github.com/dgreenheck/ez-tree',revision,scope:'Unmodified src/lib, MIT license, README/package and four author leaf PNGs plus texture license; app and bark images omitted',files});
} finally {fs.rmSync(temp,{recursive:true,force:true});}
