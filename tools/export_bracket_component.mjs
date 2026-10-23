#!/usr/bin/env node
// Export the already licensed miniLibs-derived component for the modeling tool.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const prefix=process.env.CHANGAN_RENDERING_BUILD_PREFIX||'/workspace/.environment/changan-rendering';
const require=createRequire(path.join(prefix,'package.json'));
const THREE=require('three');
const source=fs.readFileSync(path.join(root,'src/10-world.js'),'utf8');
const start=source.indexOf('function miniLibsBracketGeometry()');
const end=source.indexOf('const POTTERY_PROFILE',start);
if(start<0||end<0)throw new Error('The reviewed bracket source could not be located');
const geo=new Function('THREE',source.slice(start,end)+';return miniLibsBracketGeometry();')(THREE);
geo.computeBoundingBox();
const out=path.join(root,'assets/library/architecture/timber-shop');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'bracket-component.json'),JSON.stringify({
  source:'miniLibs / EMPTY (2023), MIT; existing project port in src/10-world.js',
  license:'../../../../vendor/miniLibs-LICENSE.txt',
  positions:Array.from(geo.attributes.position.array),
  bounds:{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()},
}));
console.log('Exported licensed bracket component',geo.attributes.position.count/3,'triangles');
