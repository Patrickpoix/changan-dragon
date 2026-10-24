#!/usr/bin/env python3
"""LEGACY REJECTED-CONVERSION diagnostic only; prefer desktop_source_review_test.py.
Inspect actual acquired dragon geometry/PBR and derived inspection LODs.
Browser plugin not available; existing Python Playwright/Chromium. No game actor
or hero-design approval is inferred from successful rendering.
"""
import argparse,asyncio,datetime,hashlib,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1];BASE='assets/library/dragons/grab3d'
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=Path('/tmp/changan-mature-dragon-review'));args=p.parse_args();args.output.mkdir(parents=True,exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for legacy in [False,True]:
   page=await browser.new_page(viewport={'width':844 if legacy else 1120,'height':390 if legacy else 720});errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url))
   if legacy:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
   for kind in ['cartoon-dragon','chinese-dragon']:
    for file in (['inspection-lod.glb'] if legacy else ['source.glb','inspection-lod.glb']):
     await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../'+BASE+'/'+kind+'/'+file)
     await page.wait_for_function('__modelReview?.ready||__modelReview?.error',timeout=120000)
     audit=await page.evaluate('''()=>{const r=__modelReview;let invalid=0,materials=[],images=new Map(),skins=0; r.model.traverse(o=>{if(!o.isMesh)return;if(o.isSkinnedMesh)skins++;for(const k of ['position','normal'])for(const x of o.geometry.attributes[k]?.array??[])if(!Number.isFinite(x))invalid++;for(const m of [o.material].flat()){materials.push({name:m.name,roughness:m.roughness,metalness:m.metalness,normal:!!m.normalMap,base:!!m.map,roughnessMap:!!m.roughnessMap});for(const v of Object.values(m))if(v?.isTexture)images.set(v.uuid,{width:v.image?.width,height:v.image?.height,colorSpace:v.colorSpace});}});return {ready:r.ready,error:r.error,revision:THREE.REVISION,webgl2:r.renderer.capabilities.isWebGL2,invalid,triangles:r.triangles,bounds:r.bounds,skins,materials,images:[...images.values()],gl:r.renderer.getContext().getError()};}''')
     assert audit['ready'] and not audit['error'] and audit['invalid']==0 and audit['gl']==0,audit
     assert audit['revision']=='160' and audit['webgl2'] is not legacy and audit['skins']==0,audit
     assert all(m['base'] and m['normal'] for m in audit['materials']),audit
     if file.startswith('inspection'):assert 43000<=audit['triangles']<=46000 and all(t['width']<=1024 and t['height']<=1024 for t in audit['images']),audit
     else:assert audit['triangles']>790000,audit
     assert await page.locator('#clip').is_hidden() and await page.locator('#morph').is_hidden()
     label=kind+('-mobile' if legacy else '')+('-lod' if file.startswith('inspection') else '-source')
     await page.screenshot(path=str(args.output/(label+'.png')))
     for view in ['front','side','back','above']:
      await page.locator('[data-view='+view+']').click()
      if not legacy:await page.screenshot(path=str(args.output/(label+'-'+view+'.png')))
     await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey');await page.screenshot(path=str(args.output/(label+'-grey.png')));await page.locator('#grey').click()
     assert not errors and not failed,(errors,failed)
     results.append({'kind':kind,'file':file,'sha256':hashlib.sha256((ROOT/BASE/kind/file).read_bytes()).hexdigest(),'profile':'WebGL1 844x390' if legacy else 'modern 1120x720',**audit})
   await page.close()
  await browser.close()
 (args.output/'results.json').write_text(json.dumps({'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'browser':'Browser plugin not available; Chromium SwiftShader','scope':'2 actually acquired static source sculpts + 2 reduced inspection donors; no retopology, rig, hero conversion, city integration, physical phone or final style approval','origin':'Publisher discloses Meshy AI-assisted base and Blender clean-up; retained CC0 publisher license and original files','results':results,'errors':[],'final_art_accepted':False,'runtime_integrated':False},ensure_ascii=False,indent=2)+'\n');print('PASS 6 actual source/LOD loads and multi-view/grey ordinary PBR checks')
asyncio.run(main())
