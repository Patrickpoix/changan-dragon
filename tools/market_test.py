#!/usr/bin/env python3
"""Walk the market streets and enter all inner shops in a real browser.

Browser plugin not available: uses the existing Playwright/Chromium workflow.
Only entrance fixtures are teleported; the movement solver must reach each
goal. Screenshots supplement these checks and need human visual inspection.
Software WebGL and phone-sized viewports do not establish phone GPU performance.
"""
import argparse
import asyncio
import hashlib
import json
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright
import smoke_test as smoke

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', default='http://127.0.0.1:8877/dist/changan-dragon.html?quality=low')
parser.add_argument('--output', type=Path)
args = parser.parse_args()
out = args.output or Path(tempfile.mkdtemp(prefix='changan-market-'))
out.mkdir(parents=True, exist_ok=True)


async def walk(page, targets):
    await page.keyboard.down('w')
    try:
        result = await page.evaluate('''targets => {
          const visited=[];
          for (const [x,z] of targets) {
            Move.speed=0;Move.steer=0;
            let steps=0;
            while(Math.hypot(player.group.position.x-x,player.group.position.z-z)>.38 && steps++<900) {
              Move.yaw=Math.atan2(x-player.group.position.x,z-player.group.position.z);
              updateMovement(.025);
            }
            const position=player.group.position.toArray();
            visited.push({target:[x,z],position,steps,error:Math.hypot(position[0]-x,position[2]-z)});
            if(steps>=900)break;
          }
          Move.speed=0;return visited;
        }''', targets)
    finally:
        await page.keyboard.up('w')
    assert len(result) == len(targets) and all(v['error'] < .4 for v in result), result
    return result


async def main():
    report = {'url': args.url, 'browser': 'Playwright; Browser plugin not available', 'passed':False}
    if '/dist/' in args.url:
        bundle=(Path(__file__).resolve().parents[1]/'dist/changan-dragon.html').read_bytes()
        report['bundle']={'bytes':len(bundle),'sha256':hashlib.sha256(bundle).hexdigest()}
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
            args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        context = await browser.new_context(viewport={'width':844,'height':390},
            is_mobile=True,has_touch=True,device_scale_factor=1)
        page = await context.new_page()
        page.set_default_timeout(120000)
        errors, external = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('request', lambda r: external.append(r.url) if
            r.url.startswith(('http:', 'https:')) and r.url != args.url and '/dist/' in args.url else None)
        try:
            await smoke.boot(page,args.url)
            print('BOOT PASS',flush=True)
            assert await page.title() == '龙游长安 · 漫游盛唐'
            await page.locator('#startBtn').click()
            await page.locator('#startScreen').wait_for(state='hidden')
            await smoke.visible_controls(page)
            await page.locator('[data-mode="walk"]').click()
            # Freeze camera/time only for repeatable fixtures; call the real
            # movement/collision/player functions and keep WebGL rendering.
            await page.evaluate('GAME.ready=false;CityBotany.setFocus(null)')
            streets = {}
            for name,cx in [('west',-258),('east',174)]:
                await page.evaluate('x=>__changan.teleport(x+7.4,36,Math.PI)',cx)
                streets[name] = await walk(page,[[cx+7.4,21],[cx+7.4,-3],
                    [cx+35,-6],[cx+35,-22],[cx+7.4,-22],[cx+7.4,-49]])
                print(name,'STREETS PASS',flush=True)
            shops = await page.evaluate('innerMarketShops')
            assert len(shops) == 8
            entrances = []
            for i,shop in enumerate(shops):
                points = await page.evaluate('''s=>{
                  const c=Math.cos(s.ry),n=Math.sin(s.ry),lx=s.w*.35;
                  return [s.d/2+4,s.d/2-2].map(lz=>[s.x+lx*c+lz*n,s.z-lx*n+lz*c]);
                }''',shop)
                await page.evaluate('v=>__changan.teleport(v[0],v[1],v[2])',points[0]+[shop['ry']+3.141592653589793])
                reached = await walk(page,[points[1]])
                assert abs(reached[0]['position'][1] - .55) < .06, reached
                entrances.append({'shop':shop,'walk':reached})
            report.update(streets=streets,entrances=entrances)
            print('8 SHOP ENTRANCES PASS',flush=True)
            report['assets'] = await page.evaluate('({sources:__changanAssets.sourceModels.length,failures:__changanAssets.failures,animals:WorldAssets.getAnimalState().length,crowd:cityCrowd.count,galleryPatrons:B.galleryPatrons.items.length})')
            assert not report['assets']['failures'] and report['assets']['animals'] == 8,report['assets']
            report['scaleAudit']=await page.evaluate('''() => {
              scene.updateMatrixWorld(true);
              const size=o=>new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).toArray();
              return {dragon:size(player.dragon.group),headIncludingHorns:size(player.dragon.head),
                adultMaleMesh:size(npcs.find(n=>!n.opt.child&&!n.opt.woman&&!n.opt.foreign).mesh),
                adultFemaleMesh:size(npcs.find(n=>n.opt.woman&&!n.opt.child).mesh)};
            }''')
            # Actual fixed camera photographs, with the sun's shadow volume
            # centred on the pictured market rather than the distant start.
            await page.set_viewport_size({'width':1120,'height':630})
            await page.evaluate('''() => {
              player.group.visible=false;
              UI.banner.classList.remove('show');UI.toast.classList.remove('show');
              UI.speedValue.textContent='0';MapView.draw(new THREE.Vector3(-258,0,-14),Math.PI);
              sun.target.position.set(-258,0,-14);sun.position.set(-133,105,61);
              CityBotany.setFocus(null);
            }''')
            for name,pos,target in [
                ('inner-street',[-251,3.4,24],[-259,4,-46]),
                ('gallery',[-251,6.2,-43],[-239.5,5.9,-37]),
                ('market-above',[-221,27,30],[-258,2,-14]),
            ]:
                await page.evaluate('v=>{camera.position.fromArray(v[0]);camera.lookAt(...v[1]);camera.fov=50;camera.updateProjectionMatrix();GameRendering.render(0);}',[pos,target])
                await page.screenshot(path=str(out/(name+'.png')))
            # Restore the normal game loop and verify mobile mode/film controls.
            await page.set_viewport_size({'width':844,'height':390})
            await page.evaluate('GAME.ready=true;player.group.visible=true;__changan.teleport(-250.6,19,Math.PI);Cam.mode=0;Cam.update(.016,player,true)')
            await smoke.frames(page,.1)
            await page.locator('[data-mode="bike"]').click()
            assert await page.evaluate('Explore.mode') == 'bike'
            await page.locator('[data-mode="fly"]').click()
            await page.wait_for_function('player.group.position.y>20')
            await page.locator('#filmBtn').click()
            assert await page.evaluate('Explore.film')
            await page.locator('#filmExit').click()
            assert not await page.evaluate('Explore.film')
            await page.locator('[data-mode="walk"]').click()
            assert await page.evaluate('Explore.mode') == 'walk'
            await smoke.visible_controls(page)
            await page.screenshot(path=str(out/'mobile-follow.png'))
            if '/dist/' in args.url:
                await context.set_offline(True)
            await page.evaluate("GameRendering.setQuality('medium')")
            await smoke.frames(page,.1)
            await page.screenshot(path=str(out/'mobile-medium.png'))
            report['rendering'] = await page.evaluate('GameRendering.getDiagnostics()')
            report['glError'] = await page.evaluate('renderer.getContext().getError()')
            report.update(errors=errors,external=external)
            assert not errors and not external and report['glError'] == 0,report
            report['passed']=True
            print('MOBILE / MODES / FILM / OFFLINE MEDIUM PASS',flush=True)
        finally:
            (out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
            await context.close()
            await browser.close()


asyncio.run(main())
