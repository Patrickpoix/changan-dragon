#!/usr/bin/env python3
"""Render/PBR/FOV regression: real walls, gate movement and camera projection.

Browser plugin not available; Playwright/Chromium software WebGL is used.
A changing FOV must not black out a planar wall when SAO is enabled. Pixel
statistics supplement actual screenshots; no phone performance is inferred.
"""
import argparse,asyncio,base64,io,json,tempfile
from PIL import Image
from pathlib import Path
import smoke_test as smoke
from playwright.async_api import async_playwright
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8877/dist/changan-dragon.html?quality=low')
parser.add_argument('--output',type=Path)
parser.add_argument('--profiles',nargs='+',choices=['modern','webgl1'],default=['modern','webgl1'])
args=parser.parse_args();out=args.output or Path(tempfile.mkdtemp(prefix='changan-rendering-'));out.mkdir(parents=True,exist_ok=True)
async def main():
 report={}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  try:
   for label in args.profiles:
    legacy=label=='webgl1';vp={'width':844 if legacy else 1120,'height':390 if legacy else 630}
    context=await browser.new_context(viewport=vp,is_mobile=legacy,has_touch=legacy,device_scale_factor=1)
    page=await context.new_page();page.set_default_timeout(90000);errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    url=args.url
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and r.url!=url else None)
    try:
     if legacy:await page.add_init_script("(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(name,...args){return name==='webgl2'?null:get.call(this,name,...args);};})();")
     await smoke.boot(page,url)
     walls=await page.evaluate('''() => {
       const result=[];scene.traverse(o=>{if(o.name==='tapered-citywall'){
         const p=o.geometry.attributes.position,uv=o.geometry.attributes.uv,bottom=[],top=[];
         for(let i=0;i<p.count;i++)(p.getY(i)>0?top:bottom).push([p.getX(i),p.getZ(i)]);
         const size=a=>[Math.max(...a.map(p=>p[0]))-Math.min(...a.map(p=>p[0])),Math.max(...a.map(p=>p[1]))-Math.min(...a.map(p=>p[1]))];
         result.push({bottom:size(bottom),top:size(top),uvSpan:Math.max(...uv.array)-Math.min(...uv.array),normal:o.material.normalMap?.image?.width,roughness:o.material.roughnessMap?.image?.width});
       }});return result;
     }''')
     assert len(walls)>=8,walls
     for w in walls:assert min(w['top'])<min(w['bottom'])*.95 and w['uvSpan']>10 and w['normal']>=512 and w['roughness']>=512,w
     await page.locator('#startBtn').click();await page.locator('#startScreen').wait_for(state='hidden');await page.locator('[data-mode="walk"]').click()
     await page.evaluate('__changan.teleport(0,397,Math.PI)');await page.keyboard.down('w')
     try:await page.evaluate('for(let i=0;i<150;i++)updateMovement(.05)')
     finally:await page.keyboard.up('w')
     gate=await page.evaluate('player.group.position.toArray()');assert gate[2]<376,gate
     assert await page.evaluate('Explore.roofAt(450,226)>11')
     await page.locator('#travelBtn').click();await page.locator('[data-place="6"]').click();await page.locator('#filmBtn').click()
     await smoke.frames(page,.1);await page.screenshot(path=str(out/(label+'-qujiang.png')))
     await context.set_offline(True);await page.evaluate("GameRendering.setQuality('high')");await smoke.frames(page,.1)
     rendering=await page.evaluate('GameRendering.getDiagnostics()');assert rendering['postprocessing'] is not legacy,rendering
     await page.screenshot(path=str(out/(label+'-high.png')))
     await page.evaluate('''() => {
       GAME.ready=false;player.group.visible=false;CityBotany.setFocus(null);
       camera.position.set(466,3.2,160);camera.lookAt(450,4,150);camera.fov=43;camera.updateProjectionMatrix();
     }''')
     projection=[]
     activeQuality='high'
     cases=[('high',43),('high',58),('high',35)]+([] if legacy else [('medium',43)])
     for quality,fov in cases:
      if quality!=activeQuality:
       await page.evaluate('quality=>GameRendering.setQuality(quality)',quality);activeQuality=quality
      await page.evaluate('fov=>{camera.fov=fov;camera.updateProjectionMatrix();}',fov)
      png=await page.evaluate("() => {GameRendering.render(0);return renderer.domElement.toDataURL('image/png');}")
      raw=base64.b64decode(png.split(',')[1]);(out/(label+'-'+quality+'-wall-fov-'+str(fov)+'.png')).write_bytes(raw)
      picture=Image.open(io.BytesIO(raw)).convert('RGB');w,h=picture.size
      rgb=picture.crop((int(w*.2),int(h*.15),int(w*.8),int(h*.8))).tobytes();count=len(rgb)//3
      black=sum(max(rgb[i:i+3])<8 for i in range(0,len(rgb),3))/count;luma=sum(rgb)/(3*count)
      stats={'quality':quality,'fov':fov,'blackFraction':black,'meanLuma':luma};projection.append(stats)
      if not legacy and fov==43:
       # This formerly invalid scene pixel became a visible black streak even
       # after containing the bloom spread. Output repair must restore it too.
       repaired=picture.getpixel((269,354));stats['repairedPixel']=repaired
       assert sum(repaired)/3>80,repaired
      assert black<.1 and luma>35,stats
     gl=await page.evaluate('renderer.getContext().getError()');assert gl==0 and not errors and not external,[gl,errors,external]
     report[label]={'passed':True,'viewport':vp,'walls':walls,'gateWalk':gate,'rendering':rendering,'projection':projection,'glError':gl,'errors':errors,'external':external}
     print(label,'PASS',flush=True)
    finally:
     (out/'results.json').write_text(json.dumps(report,indent=2));await context.close()
  finally:await browser.close()
 print(json.dumps(report),flush=True)
asyncio.run(main())
