#!/usr/bin/env python3
# Browser plugin unavailable; existing local Playwright workflow.
import asyncio,json,pathlib,datetime,hashlib
from playwright.async_api import async_playwright
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--output',default='/tmp/changan-preparation-qa');parser.add_argument('--model',default='assembly.glb',choices=['assembly.glb','natural-unified.glb']);args=parser.parse_args()
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=pathlib.Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for mobile in [False,True]:
   page=await b.new_page(viewport={'width':844 if mobile else 1120,'height':390 if mobile else 720});errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url))
   if mobile:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
   await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../assets/library/preparation-study/'+args.model)
   await page.wait_for_function('window.__modelReview?.ready || window.__modelReview?.error',timeout=120000)
   audit=await page.evaluate('''()=>{const r=__modelReview;let invalid=0,mask=0,helpers=[],textures=new Map(),actors={};r.model.traverse(o=>{if(o.isMesh){if(o.name.includes('Icosphere'))helpers.push(o.name);for(const a of ['position','normal'])for(const v of o.geometry.attributes[a]?.array??[])if(!Number.isFinite(v))invalid++;for(const m of [o.material].flat()){if(m.alphaTest)mask++;for(const v of Object.values(m))if(v?.isTexture)textures.set(v.uuid,{name:v.name,width:v.image?.width,height:v.image?.height,colorSpace:v.colorSpace});}}if(o.name.includes('resident')||o.name.includes('natural_connected_tailoring_static_pose')||o.name.includes('silhouette')||o.name.includes('bicycle')){const box=new THREE.Box3().setFromObject(o);actors[o.name]=box.getSize(new THREE.Vector3()).toArray();}});return {ready:r.ready,error:r.error,revision:THREE.REVISION,webgl2:r.renderer.capabilities.isWebGL2,invalid,mask,helpers,textures:[...textures.values()],actors,triangles:r.triangles,bounds:r.bounds,gl:r.renderer.getContext().getError(),render:r.renderer.info.render};}''')
   assert audit['ready'] and not audit['error'] and audit['invalid']==0 and audit['mask']>0 and audit['gl']==0,audit
   assert audit['revision']=='160'
   if args.model=='natural-unified.glb':
    assert not audit['helpers'],audit['helpers']
    people={name:size for name,size in audit['actors'].items() if 'natural_connected_tailoring_static_pose' in name}
    assert len(people)==2 and all(1.7<size[1]<1.9 and size[0]<1.0 and size[2]<1.0 for size in people.values()),people
   if mobile:assert not audit['webgl2']
   for v in ['front','side','back','above']:
    await page.locator('[data-view='+v+']').click();await page.screenshot(path=str(OUT/(('mobile-' if mobile else '')+v+'.png')))
   await page.locator('#grey').click()
   mask=await page.evaluate('''()=>{let n=0;__modelReview.model.traverse(o=>{if(o.isMesh)for(const m of [o.material].flat())if(m.alphaTest && m.map)n++;});return n;}''');assert mask==audit['mask']
   await page.screenshot(path=str(OUT/(('mobile-' if mobile else '')+'grey.png')))
   await page.locator('#grey').click();await page.locator('#grid').click();await page.locator('#reset').click()
   await page.screenshot(path=str(OUT/(('mobile-' if mobile else '')+'assembly.png')))
   # Human/dragon close-up: move actual camera; no surrogate scene.
   await page.evaluate('''()=>{const r=__modelReview;r.camera.position.set(2,2,7);r.camera.lookAt(-.7,.9,3.4);r.renderer.render(r.scene,r.camera);}''')
   await page.screenshot(path=str(OUT/(('mobile-' if mobile else '')+'characters.png')))
   assert not errors and not failed,(errors,failed)
   results.append({'mode':'WebGL1 844x390' if mobile else 'modern 1120x720',**audit,'grey_alpha_masks':mask,'errors':errors,'failed_requests':failed})
   await page.close()
  await b.close()
 (OUT/'results.json').write_text(json.dumps({'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'model':args.model,'sha256':hashlib.sha256((ROOT/'assets/library/preparation-study'/args.model).read_bytes()).hexdigest(),'browser':'Browser plugin not available; local Chromium SwiftShader','scope':'Independent preparation assembly; no physical phone or final art approval','results':results,'final_art_accepted':False,'runtime_integrated':False},ensure_ascii=False,indent=2)+'\n')
 print('PASS preparation assembly, 2 contexts, masks preserved in grey')
asyncio.run(main())
