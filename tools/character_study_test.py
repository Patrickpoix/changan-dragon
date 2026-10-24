#!/usr/bin/env python3
"""Real r160 skin/morph/gesture/prop and review controls QA; not game NPC approval.
Browser plugin not available; uses existing local Python Playwright/Chromium.
"""
import asyncio,argparse,hashlib,json,datetime
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,default=Path('/tmp/changan-natural-characters'));args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
async def main():
 report={'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'browser':'Browser plugin not available; local Chromium SwiftShader','scope':'Natural character construction studies, real skin/morph/gesture/prop and review controls; no game deployment, phone GPU or final art approval','final_art_accepted':False,'runtime_integrated':False,'results':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for legacy in [False,True]:
   page=await browser.new_page(viewport={'width':844 if legacy else 1120,'height':390 if legacy else 720});errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url))
   if legacy:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
   for kind in ['male','female']:
    await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../assets/library/characters/tang-studies/'+kind+'.glb');assert '建模验收台' in await page.title()
    await page.wait_for_function('__modelReview?.ready||__modelReview?.error',timeout=90000)
    audit=await page.evaluate('''()=>{const r=__modelReview;let invalid=0,skins=0,weightError=0,boneCount=new Set(),morphs=[],materials=new Set();r.model.traverse(o=>{if(!o.isMesh)return;for(const a of ['position','normal'])for(const v of o.geometry.attributes[a]?.array??[])if(!Number.isFinite(v))invalid++;for(const m of [o.material].flat())materials.add(m.uuid);if(o.isSkinnedMesh){skins++;boneCount.add(o.skeleton.bones.length);const w=o.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)weightError=Math.max(weightError,Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1));}if(o.morphTargetDictionary)morphs.push(Object.keys(o.morphTargetDictionary));});return {ready:r.ready,error:r.error,invalid,skins,boneCounts:[...boneCount],weightError,morphs,materialCount:materials.size,triangles:r.triangles,bounds:r.bounds,revision:THREE.REVISION,webgl2:r.renderer.capabilities.isWebGL2,legacy:LegacySkinning.getStatus(),gl:r.renderer.getContext().getError()};}''')
    assert audit['ready'] and not audit['error'] and audit['invalid']==0 and audit['gl']==0,audit
    assert audit['revision']=='160' and audit['webgl2'] is not legacy and audit['skins']>5 and max(audit['boneCounts'])<=65,audit
    assert audit['weightError']<1e-5 and audit['bounds'][1]<2.0,audit
    assert set(audit['morphs'][0])=={'Blink','Smile','Speak','BrowRaise'},audit
    if legacy:assert audit['legacy']['enabled'] and audit['legacy']['meshes']>=audit['skins']
    poses={}
    for clip in ['OfferTray','InspectFabric']:
     await page.locator('#clip').select_option(clip)
     samples=[]
     for t in [0,.5,1]:
      await page.locator('#scrub').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',str(t))
      sample=await page.evaluate('''()=>{const r=__modelReview,names=['wrist.L','wrist.R','activity_tray','activity_fabric'],out={};r.model.updateMatrixWorld(true);r.model.traverse(o=>{const name=o.userData.name??o.name;if(names.includes(name))out[name]={p:o.getWorldPosition(new THREE.Vector3()).toArray(),scale:o.getWorldScale(new THREE.Vector3()).toArray()};});return {time:r.mixer.time,bones:out,gl:r.renderer.getContext().getError()};}''')
      assert sample['gl']==0 and len(sample['bones'])==4,sample;samples.append(sample)
     assert samples[0]['bones']['wrist.L']['p']!=samples[1]['bones']['wrist.L']['p'] or samples[0]['bones']['wrist.R']['p']!=samples[1]['bones']['wrist.R']['p'],samples
     active='activity_tray' if clip=='OfferTray' else 'activity_fabric';inactive='activity_fabric' if clip=='OfferTray' else 'activity_tray'
     assert min(samples[0]['bones'][active]['scale'])>.9 and max(samples[0]['bones'][inactive]['scale'])<.001,samples[0]
     assert max(abs(a-b) for a,b in zip(samples[0]['bones']['wrist.L']['p'],samples[-1]['bones']['wrist.L']['p']))<.003,samples
     poses[clip]=samples
     await page.locator('#scrub').evaluate('(e)=>{e.value=.5;e.dispatchEvent(new Event("input",{bubbles:true}))}')
     await page.screenshot(path=str(args.output/(kind+('-mobile' if legacy else '')+'-'+clip+'.png')))
    # Actual play/pause controls, then verify paused clock remains unchanged.
    await page.locator('#play').click();await page.wait_for_function('__modelReview.mixer.time>.1');await page.locator('#play').click();time=await page.evaluate('__modelReview.mixer.time');await page.wait_for_timeout(150);assert await page.evaluate('__modelReview.mixer.time')==time
    for view in ['front','side','back','above']:await page.locator('[data-view='+view+']').click()
    await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey');await page.screenshot(path=str(args.output/(kind+('-mobile' if legacy else '')+'-grey.png')));await page.locator('#grey').click()
    # Source morph changes actual vertex positions; no overlay or face sprite.
    morph=[]
    for name in ['Blink','Smile','Speak','BrowRaise']:
     await page.locator('#morph').select_option(name)
     state=await page.evaluate('''()=>{let out;__modelReview.model.traverse(o=>{if(o.morphTargetDictionary?.Blink===undefined)return;const index=o.morphTargetDictionary[document.querySelector('#morph').value];let d=0;const target=o.geometry.morphAttributes.position[index];for(let i=0;i<target.count;i++)d=Math.max(d,Math.abs(target.getX(i)),Math.abs(target.getY(i)),Math.abs(target.getZ(i)));out={name:document.querySelector('#morph').value,influence:o.morphTargetInfluences[index],maxAttribute:d};});return out}''')
     assert state['influence']>0 and state['maxAttribute']>0,state;morph.append(state)
     if not legacy:
      await page.evaluate('''()=>{const r=__modelReview;r.camera.position.set(.32,1.65,.9);r.camera.lookAt(0,1.53,0);r.renderer.render(r.scene,r.camera);}''')
      await page.screenshot(path=str(args.output/(kind+'-'+name+'.png')))
    await page.locator('#morph').select_option('');await page.locator('#reset').click();await page.locator('#grey').click()
    # Replacement releases skeletons; animated controls disappear for static file.
    await page.locator('#file').set_input_files(str(ROOT/'assets/library/architecture/timber-shop/runtime.glb'));await page.wait_for_function("__modelReview.source==='runtime.glb'&&__modelReview.ready")
    assert await page.locator('#clip').is_hidden() and await page.locator('#morph').is_hidden() and await page.evaluate('__modelReview.grey')
    assert not errors and not failed,(errors,failed)
    audit.update({'type':kind,'profile':'WebGL1 844x390' if legacy else 'modern 1120x720','sha256':hashlib.sha256((ROOT/'assets/library/characters/tang-studies'/(kind+'.glb')).read_bytes()).hexdigest(),'poses':poses,'morph_checks':morph,'errors':errors.copy(),'failed_requests':failed.copy()});report['results'].append(audit)
   await page.close()
  await browser.close()
 (args.output/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS 4 natural character loads, 2 real gesture/prop clips, 4 morphs, grey, playback/scrub, static replacement')
asyncio.run(main())
