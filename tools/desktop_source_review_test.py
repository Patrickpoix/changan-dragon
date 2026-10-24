#!/usr/bin/env python3
"""Actual desktop full-resolution source review; no reduction or game release.
Browser plugin unavailable: use existing Playwright/Chromium SwiftShader.
"""
import asyncio,argparse,json,hashlib,datetime
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);args=p.parse_args();args.output.mkdir(parents=True,exist_ok=True)
SOURCES={k:f'assets/library/dragons/grab3d/{k}/source.glb' for k in ['cartoon-dragon','chinese-dragon']}
SOURCES.update({k:f'assets/library/curated-polyhaven/{k}/{k}_1k.gltf' for k in ['chinese_screen_panels','chinese_stool']})
async def main():
 results=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for width,height in [(1920,1200),(2560,1600)]:
   page=await browser.new_page(viewport={'width':width,'height':height});page.set_default_timeout(120000);errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:errors.append(r.url))
   for name,path in SOURCES.items():
    await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../'+path)
    await page.wait_for_function('window.__modelReview?.ready||window.__modelReview?.error',timeout=120000)
    audit=await page.evaluate('''()=>{const r=__modelReview;let maps=[],invalid=0,skins=0; r.model.traverse(o=>{if(!o.isMesh)return;if(o.isSkinnedMesh)skins++;for(const a of Object.values(o.geometry.attributes))for(const x of a.array)if(!Number.isFinite(x))invalid++;for(const m of [o.material].flat())for(const key of ['map','normalMap','roughnessMap','metalnessMap']){const t=m[key];if(t)maps.push({role:key,width:t.image.width,height:t.image.height})}});return {ready:r.ready,error:r.error,triangles:r.triangles,bounds:r.bounds,skins,maps,invalid,gl:r.renderer.getContext().getError(),revision:THREE.REVISION,drawingBuffer:[r.renderer.domElement.width,r.renderer.domElement.height]};}''')
    assert audit['ready'] and not audit['error'] and audit['invalid']==0 and audit['gl']==0,audit
    if 'dragon' in name:assert audit['triangles']>=799000 and max(t['width'] for t in audit['maps'])>=4096,audit
    assert audit['drawingBuffer']==[width,height],audit
    label=f'{name}-{width}'
    await page.screenshot(path=str(args.output/(label+'-threequarter.png')))
    for view in ['front','side','back','above']:
     await page.locator('[data-view='+view+']').click()
     if width==1920:await page.screenshot(path=str(args.output/(label+'-'+view+'.png')))
    await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey')
    if width==1920:await page.screenshot(path=str(args.output/(label+'-grey.png')))
    assert not errors,errors
    results.append({'source':path,'sha256':hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),'viewport':[width,height],**audit})
   await page.close()
  await browser.close()
 report={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Unchanged full-resolution acquired dragon sculpts and newly synced props; real desktop browser source review, not game integration or art approval','browser':'Chromium SwiftShader; Browser plugin unavailable; not hardware performance measurement','reduction_applied':False,'results':results,'errors':[],'runtime_integrated':False,'final_art_accepted':False}
 (args.output/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS 8 full-source desktop loads, original 800k/4K dragons, 1920x1200 and 2560x1600; multiview/grey, no GL or page errors')
asyncio.run(main())
