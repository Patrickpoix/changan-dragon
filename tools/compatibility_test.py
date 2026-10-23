#!/usr/bin/env python3
"""Exercise the WebGL1 fallback with real rendering, rigs and film controls.

Browser plugin is unavailable in this environment; uses the same installed
Playwright/Chromium software renderer as smoke_test.py. This is an API fallback
check, not a physical old-phone performance measurement.
"""
import argparse,asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
import smoke_test as smoke

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8877/dist/changan-dragon.html?quality=low')
parser.add_argument('--output',type=Path)
args=parser.parse_args()
out=args.output or Path(tempfile.mkdtemp(prefix='changan-webgl1-'));out.mkdir(parents=True,exist_ok=True)

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  context=await browser.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=1)
  page=await context.new_page();page.set_default_timeout(90000)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
  await page.add_init_script("""(() => {
   const get=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(name,...args){return name==='webgl2'?null:get.call(this,name,...args);};
  })();""")
  await smoke.boot(page,args.url)
  capabilities=await page.evaluate('({webgl2:renderer.capabilities.isWebGL2,maxAttributes:renderer.capabilities.maxAttributes,legacy:LegacySkinning.getStatus()})')
  assert not capabilities['webgl2'] and capabilities['legacy']['enabled'] and capabilities['legacy']['meshes']>=9,capabilities
  await page.screenshot(path=str(out/'entry.png'))
  await page.locator('#startBtn').click();await page.locator('#startScreen').wait_for(state='hidden')
  await page.evaluate('Cam.mode=1;Cam.zoom=.72;Cam.update(.016,player,true)')
  await smoke.frames(page,.15)
  await page.screenshot(path=str(out/'dragon-and-rigs.png'))
  await page.locator('[data-mode="walk"]').click()
  await page.evaluate('() => {const p=shorePaths[0].points[80];__changan.teleport(p[0],p[1],Math.PI);Cam.mode=0;Cam.userYaw=0;Cam.zoom=.8;Cam.update(.016,player,true);}')
  await smoke.frames(page,.15)
  forest=await page.evaluate('CityBotany.getClearanceState()');assert forest['active'] and forest['foliageVertices']>0,forest
  await page.screenshot(path=str(out/'forest-clearance.png'))
  before=await page.evaluate('WorldAssets.getAnimalState()')
  await page.locator('[data-mode="fly"]').click();await page.wait_for_function('player.group.position.y>8')
  await smoke.frames(page,.3)
  after=await page.evaluate('WorldAssets.getAnimalState()')
  assert all(abs(a['pose']-b['pose'])>1e-5 for a,b in zip(before,after)),[before,after]
  await page.locator('#travelBtn').click();await page.locator('[data-place="6"]').click();await page.locator('#filmBtn').click()
  await page.evaluate("GameRendering.setQuality('high')")
  await smoke.frames(page,.15)
  await page.screenshot(path=str(out/'compatible-qujiang.png'))
  state=await page.evaluate('({rendering:__changan.rendering,water:WaterSurface.getState(),glError:renderer.getContext().getError()})')
  assert not state['rendering']['postprocessing'] and state['water']['reflective']==0 and state['glError']==0,state
  assert not errors,errors
  result={'passed':True,'capabilities':capabilities,'state':state,'errors':errors}
  (out/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
  print('WEBGL1_COMPATIBILITY_PASS',json.dumps(result,ensure_ascii=False),flush=True)
  await context.close();await browser.close()

asyncio.run(main())
