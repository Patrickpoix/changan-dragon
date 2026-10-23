#!/usr/bin/env python3
# Focused recovery QA; Browser connector unavailable, using local Playwright/Chromium.
import asyncio,json,pathlib,argparse,datetime
from playwright.async_api import async_playwright
parser=argparse.ArgumentParser();parser.add_argument('--models',choices=['recovered','authored'],default='recovered');parser.add_argument('--output',default='/tmp/changan-resource-review');args=parser.parse_args()
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=pathlib.Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
MODEL_DIR='authored-studies' if args.models=='authored' else 'studies'
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for mobile in [False,True]:
   page=await browser.new_page(viewport={'width':844 if mobile else 1120,'height':390 if mobile else 720});errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
   if mobile:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
   for name in ['street','willow','pine','blossom']:
    for lod in range(3):
     file=f'{name}-lod{lod}.glb'
     await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../assets/library/vegetation/'+MODEL_DIR+'/'+file)
     await page.wait_for_function('window.__modelReview?.ready || window.__modelReview?.error',timeout=60000)
     r=await page.evaluate('''() => {const r=__modelReview;const box=new THREE.Box3().setFromObject(r.model);let max=0;for(let x of [box.min.x,box.max.x])for(let y of [box.min.y,box.max.y])for(let z of [box.min.z,box.max.z]){const q=new THREE.Vector3(x,y,z).project(r.camera);max=Math.max(max,Math.abs(q.x),Math.abs(q.y));}return {ready:r.ready,error:r.error,triangles:r.triangles,bounds:r.bounds,gl:r.renderer.getContext().getError(),webgl2:r.renderer.capabilities.isWebGL2,maxProjectedCorner:max};}''')
     assert r['ready'] and not r['error'] and r['gl']==0 and r['maxProjectedCorner']<1,r
     if mobile:assert not r['webgl2']
     for view in ['front','side','back','above']:
      await page.locator('[data-view='+view+']').click()
     await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey');await page.locator('#grey').click();await page.locator('#reset').click()
     if lod==0 and not mobile:await page.screenshot(path=str(OUT/(name+'.png')))
     results.append({'model':file,'mode':'WebGL1 844x390' if mobile else 'modern 1120x720',**r})
   # Real browser file input, replacement, grey restoration, invalid input protection.
   await page.locator('#file').set_input_files(str(ROOT/'assets/library/architecture/timber-shop/runtime.glb'))
   await page.wait_for_function("__modelReview.ready && __modelReview.source==='runtime.glb'")
   await page.locator('#grey').click()
   await page.locator('#file').set_input_files(str(ROOT/'assets/library/vegetation/studies/street-lod2.glb'))
   await page.wait_for_function("__modelReview.ready && __modelReview.source==='street-lod2.glb'")
   assert await page.evaluate('__modelReview.grey')
   await page.locator('#grey').click()
   await page.locator('#file').set_input_files({'name':'broken.glb','mimeType':'model/gltf-binary','buffer':b'bad file'})
   await page.locator('#error').wait_for(state='visible')
   assert await page.evaluate("__modelReview.ready && __modelReview.model && __modelReview.source==='street-lod2.glb'")
   assert not errors,errors
   await page.close()
  await browser.close()
 (OUT/'results.json').write_text(json.dumps({'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'scope':args.models+' studies and model review only','browser':'Chromium SwiftShader; not physical phone validation','checks':['24 GLB loads','GL error 0','bounds inside viewport','front/side/back/above controls','grey toggle','actual local file input and model replacement','invalid file preserves previous model'],'results':results,'page_console_errors':[],'final_art_accepted':False,'runtime_integrated':False},ensure_ascii=False,indent=2)+'\n')
 print('PASS',len(results),'loads; modern + forced WebGL1, local file replacement and invalid input')
asyncio.run(main())
