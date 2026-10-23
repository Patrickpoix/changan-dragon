#!/usr/bin/env python3
"""Offline bundle, persistent session and walkable 3D surfaces acceptance check.

Serve the checkout first. Uses the same Chromium/Playwright prerequisites as smoke_test.py.
Physical-phone file handling and GPU performance are outside this cloud check.
"""
import argparse,asyncio,json,importlib.util,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8877/dist/changan-dragon.html')
parser.add_argument('--output',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
out=args.output or Path(tempfile.mkdtemp(prefix='changan-offline-'))
out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('smoke',root/'tools/smoke_test.py');smoke=importlib.util.module_from_spec(spec);spec.loader.exec_module(smoke)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  context=await browser.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=1,accept_downloads=True)
  page=await context.new_page();page.set_default_timeout(60000)
  errors=[];external=[];console_errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
  page.on('request',lambda r:external.append(r.url) if r.url.startswith(('https:','http:')) and r.url != args.url else None)
  await smoke.boot(page,args.url)
  result=await page.evaluate('''() => ({engine:__changanEngine,assets:__changanAssets,crowd:__changanCrowd,rendering:__changan.rendering,water:WaterSurface.getState()})''')
  print('OFFLINE_BOOT',json.dumps(result,ensure_ascii=False),flush=True)
  assert result['engine']['source']=='standalone' and len(result['assets']['sourceModels'])>=5 and result['crowd']['count']>=80
  await page.screenshot(path=str(out/'offline-entry.png'))
  await page.locator('#startBtn').click();await page.locator('#startScreen').wait_for(state='hidden')
  await smoke.visible_controls(page)
  await page.screenshot(path=str(out/'offline-landscape.png'))
  await page.locator('[data-mode="walk"]').click()
  surfaces={}
  # Position fixtures place the player at real entrances. Keyboard input and the
  # actual movement/collision solver must then carry it across each surface.
  for name,x,z,yaw,steps in [('gallery',329,280,1.5707963267948966,90),('pavilion',354,324,3.141592653589793,36),('barge',284,311,1.5707963267948966,78),('shop',-15,354.8,-1.5707963267948966,58)]:
   await page.evaluate('p => __changan.teleport(...p)',[x,z,yaw])
   await page.keyboard.down('w')
   await page.evaluate('steps => { for(let i=0;i<steps;i++) updateMovement(.05); }',steps)
   await page.keyboard.up('w')
   position=await page.evaluate('player.group.position.toArray()');surfaces[name]=position
   print('SURFACE',name,position,flush=True)
   if name=='gallery': assert position[0]>345 and abs(position[1]-.24)<.06,position
   if name=='pavilion': assert 315<position[2]<321 and abs(position[1]-.45)<.06,position
   if name=='barge': assert 298.1<position[0]<301 and abs(position[1]-1.11)<.07,position
   if name=='shop': assert position[0]<-24 and abs(position[1]-.55)<.08,position
  # Eighteen separate stair treads reach the actual palace terrace.
  await page.evaluate('__changan.teleport(150,-394.5,Math.PI); Explore.resetInput()')
  await page.keyboard.down('w')
  await page.evaluate('for(let i=0;i<240;i++) updateMovement(0.05)')
  await page.keyboard.up('w')
  stairs=await page.evaluate('player.group.position.toArray()');print('STAIRS',stairs,flush=True)
  assert stairs[1]>6.7 and stairs[2]<-409,stairs
  assert await page.evaluate('Explore.roofAt(216,283)>45')
  await page.evaluate('__changan.teleport(0,300,Math.PI); Explore.resetInput(); Cam.mode=1; Session.save()')
  await page.reload(wait_until='load');await page.wait_for_function('__changan?.state.ready',timeout=120000)
  resume=await page.evaluate('({mode:Explore.mode,pos:player.group.position.toArray(),camera:Cam.mode,resumed:Session.hasResume})');print('RESUME',resume,flush=True)
  assert resume['resumed'] and resume['mode']=='walk' and abs(resume['pos'][2]-300)<2 and resume['camera']==1,resume
  await page.locator('#startBtn').click();await page.locator('#startScreen').wait_for(state='hidden')
  await context.set_offline(True)
  await page.locator('#travelBtn').click();await page.locator('[data-place="6"]').click();await page.locator('#filmBtn').click()
  await page.evaluate("GameRendering.setQuality('high')")
  await page.wait_for_function('n => GameRendering.getDiagnostics().frameCount > n + 1 && WaterSurface.getState().reflective===1',arg=await page.evaluate('GameRendering.getDiagnostics().frameCount'),timeout=120000)
  await page.screenshot(path=str(out/'qujiang-reflection.png'))
  details=await page.evaluate('({rendering:__changan.rendering,water:WaterSurface.getState()})');print('REFLECTION',details,flush=True)
  assert details['rendering']['postprocessing'] and details['rendering']['antiAliasing']=='FXAA' and not details['rendering']['fallback']
  async with page.expect_download() as download:
   await page.locator('#filmPhoto').click()
  photo=await download.value;await photo.save_as(out/'offline-photo.png');assert (out/'offline-photo.png').stat().st_size>1024
  assert not errors and not external and not console_errors,{'errors':errors,'console':console_errors,'external':external}
  print('OFFLINE_RESULT',json.dumps({'passed':True,'stairs':stairs,'surfaces':surfaces,'resume':resume,'externalRequests':external,'pageErrors':errors},ensure_ascii=False),flush=True)
  (out/'results.json').write_text(json.dumps({'passed':True,'boot':result,'stairs':stairs,'surfaces':surfaces,'resume':resume,'rendering':details,'externalRequests':external,'errors':errors,'consoleErrors':console_errors},ensure_ascii=False,indent=2))
  print('Evidence:',out,flush=True)
  await browser.close()
asyncio.run(main())
