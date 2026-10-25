#!/usr/bin/env python3
"""From a fresh GitHub checkout: python demos/tang-street-study/smoke_test.py.
Uses software Chromium only; the screenshots are not hardware or art acceptance.
"""
import json, math, threading, subprocess
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'demos'/'tang-street-study'/'qa-evidence'
class Silent(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def run():
    OUT.mkdir(parents=True,exist_ok=True)
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Silent,directory=str(ROOT)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    data={'source':'fresh GitHub main checkout; software Chromium WebGL','source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'views':{},'exceptions':[],'http_errors':[]}
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-features=Vulkan'])
            page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
            page.on('pageerror',lambda e:data['exceptions'].append(str(e)))
            page.on('console',lambda m:data['exceptions'].append('console: '+m.text) if m.type=='error' else None)
            page.on('response',lambda r:data['http_errors'].append(str(r.status)+' '+r.url) if r.status>=400 else None)
            url=f'http://127.0.0.1:{server.server_port}/demos/tang-street-study/'
            page.goto(url,wait_until='domcontentloaded',timeout=50000)
            page.wait_for_function('() => window.__tangStreet?.ready === true',timeout=95000)
            page.wait_for_timeout(1300)
            data['loaded']=page.evaluate('() => ({assets:window.__tangStreet.loaded,models:window.__tangStreet.modelBounds,errors:window.__tangStreet.errors,triangles:window.__tangStreet.renderer.info.render.triangles,drawCalls:window.__tangStreet.renderer.info.render.calls})')
            if len(data['loaded']['models'])<10:raise AssertionError('Less than 10 real model instances')
            if data['loaded']['triangles']<100000:raise AssertionError('Unexpected empty/highly simplified scene')
            if data['loaded']['errors']:raise AssertionError(data['loaded']['errors'])
            for view in ['street','quarter','roof','detail']:
                page.get_by_role('button',name={'street':'街道视角','quarter':'斜俯','roof':'屋顶与院落','detail':'檐下近景'}[view]).click()
                page.wait_for_timeout(600)
                path=OUT/(view+'.png')
                page.screenshot(path=str(path),animations='disabled')
                data['views'][view]={'camera':page.evaluate('window.__tangStreet.camera.position.toArray()'),'screenshot':path.name}
            page.get_by_role('button',name='街道视角').click()
            start=page.evaluate('window.__tangStreet.camera.position.toArray()')
            page.keyboard.down('w');page.wait_for_timeout(1500);page.keyboard.up('w')
            after=page.evaluate('window.__tangStreet.camera.position.toArray()')
            data['movement']={'before':start,'after':after}
            assert math.dist(start,after)>.8,'WASD camera did not move even after low-frame compensation'
            page.get_by_role('button',name='傍晚光线').click()
            data['dusk']=page.get_by_role('button',name='正午光线').count()==1
            assert data['dusk']
            if data['exceptions'] or data['http_errors']:raise AssertionError('Browser errors')
            browser.close()
        data['status']='pass'
    except Exception as ex:
        data['status']='fail';data['failure']=str(ex)
    finally:
        server.shutdown();server.server_close()
        (OUT/'results.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps(data,ensure_ascii=False,indent=2)[:12000])
    if data['status']!='pass':raise SystemExit(1)

if __name__=='__main__':run()
