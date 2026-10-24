#!/usr/bin/env python3
"""Independent boat construction/LOD/boarding-clearance QA, not game sailing QA.
Browser plugin not available: existing local Python Playwright/Chromium workflow.
"""
import argparse,asyncio,datetime,hashlib,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,default=Path('/tmp/changan-boat-studies'));parser.add_argument('--fixture-only',action='store_true');args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
MODEL='assets/library/boats/construction-studies'
async def main():
    manifest=json.loads((ROOT/MODEL/'manifest.json').read_text());results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for legacy in [False,True]:
            page=await browser.new_page(viewport={'width':844 if legacy else 1120,'height':390 if legacy else 720});errors=[];failed=[]
            page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url))
            if legacy:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
            for kind in ([] if args.fixture_only else manifest['types']):
                base_sockets=kind['interfaces']['sockets_gltf_xyz']
                for lod,item in enumerate(kind['levels']):
                    file=ROOT/MODEL/item['file'];assert hashlib.sha256(file.read_bytes()).hexdigest()==item['sha256']
                    await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../'+MODEL+'/'+item['file'])
                    assert '建模验收台' in await page.title()
                    await page.wait_for_function('__modelReview?.ready||__modelReview?.error',timeout=90000)
                    audit=await page.evaluate('''()=>{const r=__modelReview;let invalid=0,sockets={},materials=new Set(),external=[];r.model.traverse(o=>{if(o.isMesh){for(const k of ['position','normal'])for(const x of o.geometry.attributes[k]?.array??[])if(!Number.isFinite(x))invalid++;for(const m of [o.material].flat()){materials.add(m.uuid);for(const v of Object.values(m))if(v?.isTexture && /^http/.test(v.image?.src??''))external.push(v.image.src);}}if(o.userData.socket)sockets[o.userData.name??o.name]=o.getWorldPosition(new THREE.Vector3()).toArray();});return {ready:r.ready,error:r.error,invalid,sockets,materials:materials.size,external,triangles:r.triangles,bounds:r.bounds,meshes:r.meshes,revision:THREE.REVISION,webgl2:r.renderer.capabilities.isWebGL2,gl:r.renderer.getContext().getError(),calls:r.renderer.info.render.calls};}''')
                    assert audit['ready'] and not audit['error'] and not audit['invalid'] and audit['gl']==0,audit
                    assert audit['revision']=='160' and audit['webgl2'] is not legacy,audit
                    assert audit['triangles']==item['triangles'] and audit['meshes']<=6,audit
                    for name,co in base_sockets.items():
                        # GLTF exporter normalizes dots in names in some versions.
                        actual=audit['sockets'][name]
                        assert all(abs(a-b)<1e-5 for a,b in zip(actual,co)),(name,actual,co)
                    assert not audit['external']
                    assert audit['bounds'][1]<4.2 and audit['bounds'][2]<kind['parameters']['beam']+2.2,audit
                    if kind['type']=='barge':
                        clear=await page.evaluate('''()=>{const r=__modelReview;const rays=[];const down=(x,z)=>{const hits=new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(r.model,true);return hits[0]?.point.y??null;};for(let x=-2.4;x<=2.4;x+=.20)for(let z=-.56;z<=.56;z+=.28)rays.push(down(x,z));for(let z=-1.60;z<=1.60;z+=.10)for(let x=-.54;x<=.54;x+=.27)rays.push(down(x,z));const obstruction=new THREE.Raycaster(new THREE.Vector3(0,1.55,-2),new THREE.Vector3(0,0,1),0,4).intersectObject(r.model,true).map(h=>h.distance);const ceiling=new THREE.Raycaster(new THREE.Vector3(0,.66,0),new THREE.Vector3(0,1,0)).intersectObject(r.model,true)[0];return {sampled_walk_heights:rays,gate_obstructions:obstruction,ceiling_y:ceiling?.point.y};}''')
                        assert all(y is not None and .649<y<.66 for y in clear['sampled_walk_heights']),clear
                        assert not clear['gate_obstructions'] and clear['ceiling_y']>2.84,clear
                        audit['boarding_clearance']=clear
                        # Fixture proves local sockets and deck move rigidly together;
                        # this does NOT implement passenger attachment in the game.
                        motion=await page.evaluate('''()=>{const r=__modelReview,s=(()=>{let out;r.model.traverse(o=>{if(o.userData.name==='boarding.gate.1')out=o});return out})(),p=s.getWorldPosition(new THREE.Vector3());r.model.position.set(3,.12,-2);r.model.rotation.y=.35;r.model.updateMatrixWorld(true);const actual=s.getWorldPosition(new THREE.Vector3());const expected=p.clone().applyMatrix4(r.model.matrixWorld);const distance=actual.distanceTo(expected);r.renderer.render(r.scene,r.camera);r.model.position.set(0,0,0);r.model.rotation.y=0;r.model.updateMatrixWorld(true);return {socket_rigid_error:distance,implemented_game_passenger_attachment:false};}''')
                        assert motion['socket_rigid_error']<1e-6; audit['motion_fixture']=motion
                    for view in ['front','side','back','above']:
                        await page.locator('[data-view='+view+']').click()
                        if lod==0 and not legacy:await page.screenshot(path=str(args.output/(kind['type']+'-'+view+'.png')))
                    await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey')
                    if lod==0:await page.screenshot(path=str(args.output/(kind['type']+('-mobile' if legacy else '')+'-grey.png')))
                    await page.locator('#grey').click();await page.locator('#reset').click()
                    if lod==0:await page.screenshot(path=str(args.output/(kind['type']+('-mobile' if legacy else '')+'.png')))
                    assert not errors and not failed,(errors,failed)
                    results.append({'file':item['file'],'sha256':item['sha256'],'profile':'WebGL1 844x390' if legacy else 'modern 1120x720',**audit})
            await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../'+MODEL+'/boarding-fixture.glb')
            await page.wait_for_function('__modelReview?.ready||__modelReview?.error',timeout=90000)
            fixture=await page.evaluate('''()=>{const r=__modelReview;let transparent=0;const heights=[];r.model.traverse(o=>{if(o.isMesh)for(const m of [o.material].flat())if(m.transparent)transparent++;});for(let z=-4.0;z<=.01;z+=.05)for(let x=-.50;x<=.50;x+=.25){const hit=new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(r.model,true)[0];heights.push(hit?.point.y??null);}return {ready:r.ready,error:r.error,transparent,heights,triangles:r.triangles,gl:r.renderer.getContext().getError()};}''')
            assert fixture['ready'] and not fixture['error'] and fixture['gl']==0 and fixture['transparent']>0,fixture
            assert all(y is not None and .649<y<.66 for y in fixture['heights']),{'min':min(y for y in fixture['heights'] if y is not None),'max':max(y for y in fixture['heights'] if y is not None),'missing':fixture['heights'].count(None)}
            await page.locator('#grey').click()
            grey_count=await page.evaluate('''()=>{let n=0;__modelReview.model.traverse(o=>{if(o.isMesh)for(const m of [o.material].flat())if(m.transparent)n++;});return n}''')
            assert grey_count==fixture['transparent']
            await page.locator('#grey').click()
            await page.evaluate('''()=>{const r=__modelReview;r.camera.position.set(8,8,-13);r.camera.lookAt(0,1,0);r.renderer.render(r.scene,r.camera);}''')
            await page.screenshot(path=str(args.output/('boarding-fixture'+('-mobile' if legacy else '')+'.png')))
            if not legacy:
                await page.evaluate('''()=>{const r=__modelReview;r.camera.position.set(3.8,3.5,-6);r.camera.lookAt(0,.8,-2.1);r.renderer.render(r.scene,r.camera);}''')
                await page.screenshot(path=str(args.output/'boarding-detail.png'))
            assert not errors and not failed,(errors,failed)
            results.append({'file':'boarding-fixture.glb','sha256':manifest['boarding_fixture']['sha256'],'profile':'WebGL1 844x390' if legacy else 'modern 1120x720','grey_transparent_materials':grey_count,**fixture})
            await page.close()
        await browser.close()
    report={'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'scope':'three boat types, three LODs, sockets, closed hull, sampled static deck/cross-entry; not game sailing or passengers','browser':'Browser plugin not available; local Chromium SwiftShader','final_art_accepted':False,'runtime_integrated':False,'results':results,'errors':[],'physical_phone_tested':False}
    (args.output/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS',len(results),'boat loads, independent LOD/socket/boarding fixtures')
asyncio.run(main())
