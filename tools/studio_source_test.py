#!/usr/bin/env python3
"""Focused r160 neutral-head and Web Audio decode proof, not character acceptance."""
import argparse,asyncio,json,pathlib
from playwright.async_api import async_playwright
parser=argparse.ArgumentParser();parser.add_argument('--output',default='/tmp/changan-studio-source-qa');args=parser.parse_args();OUT=pathlib.Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for mobile in [False,True]:
   page=await browser.new_page(viewport={'width':844 if mobile else 1120,'height':390 if mobile else 720});errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
   if mobile:await page.add_init_script("const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(n,...a){return n==='webgl2'?null:gc.call(this,n,...a)}")
   for name in ['snow','rain']:
    await page.goto('http://127.0.0.1:8877/tools/model_review.html?model=../assets/library/characters/blender-studio/'+name+'/head-study.glb')
    await page.wait_for_function('window.__modelReview?.ready || window.__modelReview?.error',timeout=90000)
    r=await page.evaluate('''()=>{const r=__modelReview;let invalid=0;r.model.traverse(o=>{if(o.isMesh)for(const v of o.geometry.attributes.position.array)if(!Number.isFinite(v))invalid++;});return {ready:r.ready,error:r.error,invalid,triangles:r.triangles,revision:THREE.REVISION,webgl2:r.renderer.capabilities.isWebGL2,gl:r.renderer.getContext().getError()};}''')
    assert r['ready'] and not r['error'] and r['invalid']==0 and r['gl']==0 and r['revision']=='160',r
    if mobile:assert not r['webgl2']
    for view in ['front','side','back','above']:await page.locator('[data-view='+view+']').click()
    await page.locator('#reset').click();await page.screenshot(path=str(OUT/(name+('-mobile' if mobile else '')+'.png')))
    await page.locator('#grey').click();assert await page.evaluate('__modelReview.grey');await page.locator('#grey').click()
    results.append({'source':name,'mode':'WebGL1 844x390' if mobile else 'modern 1120x720',**r})
   assert not errors,errors
   if not mobile:
    await page.evaluate('''()=>{const b=document.createElement('button');b.id='audio-proof';b.textContent='音频解码验证';b.style.cssText='position:fixed;left:20px;top:100px';document.body.append(b);b.onclick=async()=>{const ctx=new AudioContext();await ctx.resume();const results=[];for(const name of ['wind','water','wood-wheel','distant-bell','earth-step']){const raw=await fetch('../assets/library/environment-audio/'+name+'.wav').then(r=>r.arrayBuffer());const buf=await ctx.decodeAudioData(raw);let peak=0;for(const v of buf.getChannelData(0))peak=Math.max(peak,Math.abs(v));results.push({name,seconds:buf.duration,sampleRate:buf.sampleRate,channels:buf.numberOfChannels,peak});}const src=ctx.createBufferSource();src.buffer=ctx.createBuffer(1,ctx.sampleRate/4,ctx.sampleRate);src.connect(ctx.destination);const start=ctx.currentTime;src.onended=async()=>{window.__audioProof={state:ctx.state,elapsed:ctx.currentTime-start,results};await ctx.close();};src.start();};}''')
    await page.locator('#audio-proof').click();await page.wait_for_function('window.__audioProof',timeout=30000);audio=await page.evaluate('__audioProof')
    assert audio['state']=='running' and audio['elapsed']>.1
    assert all(a['channels']==1 and a['seconds']>0 and .01<a['peak']<1 for a in audio['results'])
   await page.close()
  await browser.close()
 (OUT/'results.json').write_text(json.dumps({'checked_on':'2026-10-23','browser':'Browser plugin not available; Chromium SwiftShader','scope':'Static mature source topology conversions, r160 loader and audio decode/time progression','results':results,'audio':audio,'page_console_errors':[],'final_art_accepted':False,'semantic_audio_auditioned':False,'rig_export_accepted':False,'physical_phone_tested':False},ensure_ascii=False,indent=2)+'\n')
 print('PASS 4 static source loads + five Web Audio decodes + gesture-resumed clock')
asyncio.run(main())
