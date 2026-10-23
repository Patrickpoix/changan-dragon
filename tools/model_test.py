#!/usr/bin/env python3
"""Inspect the full timber sample, including genuine gallery-floor clearance.

Browser plugin not available; uses installed Playwright/Chromium. This is a
development model check, not phone performance or final cinematic art approval.
"""
import argparse,asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8877/tools/model_review.html')
parser.add_argument('--output',type=Path)
args=parser.parse_args();out=args.output or Path(tempfile.mkdtemp(prefix='changan-model-'));out.mkdir(parents=True,exist_ok=True)

async def main():
 report={'browser':'Playwright; Browser plugin not available','finalArtAccepted':False}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  try:
   for label in ['modern','webgl1']:
    legacy=label=='webgl1';vp={'width':844 if legacy else 1120,'height':390 if legacy else 720}
    context=await browser.new_context(viewport=vp,is_mobile=legacy,has_touch=legacy,device_scale_factor=1)
    page=await context.new_page();page.set_default_timeout(90000);errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    try:
     if legacy:await page.add_init_script("(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(name,...args){return name==='webgl2'?null:get.call(this,name,...args);};})();")
     await page.goto(args.url,wait_until='load');await page.wait_for_function('__modelReview?.ready||__modelReview?.error')
     assert '建模验收台' in await page.title()
     data=await page.evaluate('''()=>{
      const r=__modelReview;let invalid=0;
      r.model.traverse(o=>{if(o.isMesh)for(const k of ['position','normal'])for(const x of o.geometry.attributes[k].array)if(!Number.isFinite(x))invalid++});
      // Cast below the main roof onto the upstairs circulation surface. The
      // waist eave must not protrude through the walkable gallery floor.
      const floors=[2.25,3.0,3.6].map(z=>{
        const ray=new THREE.Raycaster(new THREE.Vector3(.13,4.35,z),new THREE.Vector3(0,-1,0));
        const hit=ray.intersectObject(r.model,true)[0];
        return hit?{z,y:hit.point.y,material:hit.object.material.name}:null;
      });
      return {ready:r.ready,bounds:r.bounds,meshes:r.meshes,triangles:r.triangles,invalid,floors,webgl2:r.renderer.capabilities.isWebGL2};
     }''')
     assert data['ready'] and data['invalid']==0 and data['triangles']>10000,data
     assert data['webgl2'] is not legacy,data
     assert all(f and 3.90<f['y']<4.02 and 'tile' not in f['material'].lower() for f in data['floors']),data
     await page.screenshot(path=str(out/(label+'-three-quarter.png')))
     for name in ['front','side','back','above']:
      old=await page.evaluate('__modelReview.camera.position.toArray()')
      await page.locator('[data-view="'+name+'"]').click()
      assert await page.evaluate('__modelReview.camera.position.toArray()')!=old
      if not legacy:await page.screenshot(path=str(out/(name+'.png')))
     await page.locator('#reset').click();await page.locator('#grey').click()
     assert await page.evaluate('__modelReview.grey')
     await page.screenshot(path=str(out/(label+'-grey.png')))
     await page.locator('#grey').click();assert not await page.evaluate('__modelReview.grey')
     await page.locator('#grid').click();assert await page.locator('#grid').get_attribute('aria-pressed')=='true'
     data.update(glError=await page.evaluate('__modelReview.renderer.getContext().getError()'),errors=errors)
     assert data['glError']==0 and not errors,data
     data['passed']=True;report[label]=data;print(label,'MODEL CHECK PASS',flush=True)
    finally:
     (out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));await context.close()
  finally:await browser.close()

asyncio.run(main())
