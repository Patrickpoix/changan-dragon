#!/usr/bin/env python3
"""Validate boat footprints against actual lake geometry, bridges and other routes.

Browser plugin not available; uses installed Playwright/Chromium. Each complete
route is sampled, including the artist hull's transformed outline and oar sweep.
Screenshots are actual 3D renders. This is not a phone GPU performance test.
"""
import argparse,asyncio,base64,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
import smoke_test as smoke
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:8877/?quality=low')
parser.add_argument('--output',type=Path)
args=parser.parse_args();out=args.output or Path(tempfile.mkdtemp(prefix='changan-boats-'));out.mkdir(parents=True,exist_ok=True)

AUDIT=r'''() => {
 scene.updateMatrixWorld(true);
 const water=pondMeshes.map(m=>m.geometry.parameters.shapes.getPoints().map(p=>{
   const v=new THREE.Vector3(p.x,p.y,0).applyMatrix4(m.matrixWorld);return [v.x,v.z];
 }));
 const inside=(x,z,poly)=>{
   let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
     const [ax,az]=poly[i],[bx,bz]=poly[j];
     if((az>z)!=(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)yes=!yes;
   }return yes;
 };
 const convex=ps=>{
   ps=[...new Map(ps.map(p=>[p.map(x=>x.toFixed(5)).join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
   const half=p=>{const h=[];for(const v of p){while(h.length>1&&cross(h.at(-2),h.at(-1),v)<=1e-8)h.pop();h.push(v);}return h;};
   return half(ps).slice(0,-1).concat(half(ps.slice().reverse()).slice(0,-1));
 };
 const hulls=boats.map(b=>{
   const inverse=b.group.matrixWorld.clone().invert(),points=[];let minY=Infinity;
   b.group.traverse(m=>{if(m.userData.navigationHull){
     const positions=m.geometry.attributes.position,matrix=inverse.clone().multiply(m.matrixWorld);
     for(let i=0;i<positions.count;i++){
       const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(matrix);
       points.push([p.x,p.z]);minY=Math.min(minY,p.y);
     }
   }});
   const hull=convex(points),samples=[];
   for(let i=0;i<hull.length;i++) {
     const a=hull[i],c=hull[(i+1)%hull.length],n=Math.ceil(Math.hypot(a[0]-c[0],a[1]-c[1])/.5);
     for(let j=0;j<n;j++)samples.push([lerp(a[0],c[0],j/n),lerp(a[1],c[1],j/n)]);
   }
   if(b.spec.type==='boat')for(const side of [-1,1])for(const z of [-.9,-.3,.3])samples.push([side*2.45,z]);
   return {samples,minY,radius:Math.max(...samples.map(p=>Math.hypot(...p)))*b.group.scale.x};
 });
 const failures=[],routes=[];
 boats.forEach((b,k)=>{
   const h=hulls[k],scale=b.group.scale.x,positions=[];
   if(!h.samples.length)failures.push({name:b.spec.name,problem:'no physical hull'});
   const highestKeel=.1+h.minY*scale+(b.spec.moored?.012:.035)+.025*scale;
   if(highestKeel>=.04)failures.push({name:b.spec.name,problem:'floating keel',highestKeel});
   let firstFailure=null;
   for(let i=0;i<512;i++) {
     const t=i/512,p=b.spec.moored?new THREE.Vector3(...[b.spec.path[0][0],0,b.spec.path[0][1]]):b.curve.getPointAt(t);
     const direction=b.spec.moored?new THREE.Vector3(0,0,1):b.curve.getTangentAt(t);
     const norm=Math.hypot(direction.x,direction.z),dx=direction.x/norm,dz=direction.z/norm;
     positions.push([p.x,p.z]);
     if(b.spec.moored)continue; // Deliberately joins its boarding pier.
     for(const [x,z] of h.samples) {
       const wx=p.x+scale*(x*dz+z*dx),wz=p.z+scale*(-x*dx+z*dz);
       const problem=!water.some(poly=>inside(wx,wz,poly))?'bank':isLand(wx,wz)?'island':pointOnBridge(wx,wz)!==null?'bridge':null;
       if(problem&&!firstFailure)firstFailure={name:b.spec.name,problem,t,point:[wx,wz]};
     }
   }
   if(firstFailure)failures.push(firstFailure);
   routes.push({name:b.spec.name,positions,radius:h.radius,highestKeel,minLocalY:h.minY,hullSamples:h.samples.length});
 });
 const pairs=[];
 for(let i=0;i<routes.length;i++)for(let j=0;j<i;j++) {
   const a=routes[i],b=routes[j];let minimum=Infinity;
   // Every independent pair of phases, not only the current animation frame.
   for(let k=0;k<512;k+=2)for(let m=0;m<512;m+=2)minimum=Math.min(minimum,Math.hypot(a.positions[k][0]-b.positions[m][0],a.positions[k][1]-b.positions[m][1]));
   const gap=minimum-a.radius-b.radius;pairs.push({a:a.name,b:b.name,minimum,gap});
   if(gap<.35)failures.push({problem:'overlapping route envelopes',a:a.name,b:b.name,gap});
 }
 const shoreline={gridSamples:0,waterMismatches:[],pathObstructions:[],pathPoints:0};
 for(const poly of water) {
   const x0=Math.min(...poly.map(p=>p[0])),x1=Math.max(...poly.map(p=>p[0])),z0=Math.min(...poly.map(p=>p[1])),z1=Math.max(...poly.map(p=>p[1]));
   for(let i=0;i<61;i++)for(let j=0;j<61;j++) {
     const x=lerp(x0-3,x1+3,i/60),z=lerp(z0-3,z1+3,j/60);
     const visual=water.some(p=>inside(x,z,p));shoreline.gridSamples++;
     if(visual!==isWaterPoint(x,z)&&shoreline.waterMismatches.length<10)shoreline.waterMismatches.push([x,z]);
   }
 }
 for(const path of shorePaths)for(let i=1;i<path.points.length;i++) {
   const a=path.points[i-1],b=path.points[i],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.2);
   for(let j=0;j<=n;j++) {
     const x=lerp(a[0],b[0],j/n),z=lerp(a[1],b[1],j/n),p=new THREE.Vector3(x,0,z),before=p.clone();resolveCollisions(p,1.05);shoreline.pathPoints++;
     if(!canStandAt(x,z)||p.distanceTo(before)>.1||groundHeightAt(x,z)<.03)shoreline.pathObstructions.push({point:[x,z],shift:p.distanceTo(before),ground:groundHeightAt(x,z),colliders:colliders.filter(c=>x>c.minX-1.05&&x<c.maxX+1.05&&z>c.minZ-1.05&&z<c.maxZ+1.05).map(c=>c.tag)});
   }
 }
 if(shoreline.waterMismatches.length)failures.push({problem:'visible water differs from movement boundary',points:shoreline.waterMismatches});
 if(shoreline.pathObstructions.length)failures.push({problem:'obstructed shore promenade',points:shoreline.pathObstructions});
 return {boats:routes.map(({positions,...r})=>r),pairs,failures,shoreline,waterPolygons:water.map(p=>p.length),samplesPerRoute:512};
}'''

async def main():
 report={'url':args.url,'browser':'Playwright Chromium / Browser plugin not available','viewports':[[1120,630],[844,390]]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=await browser.new_page(viewport={'width':1120,'height':630},device_scale_factor=1);page.set_default_timeout(90000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
  try:
   await smoke.boot(page,args.url)
   report['navigation']=await page.evaluate(AUDIT)
   (out/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
   assert not report['navigation']['failures'],report['navigation']['failures']
   assert len(report['navigation']['boats'])==6 and all(b['minLocalY']<-.18 for b in report['navigation']['boats'])
   await page.locator('#startBtn').click();await page.locator('#startScreen').wait_for(state='hidden')
   await page.locator('[data-mode="walk"]').click()
   await page.evaluate('() => {const p=shorePaths[0].points[0];__changan.teleport(p[0],p[1],0);}')
   await page.keyboard.down('w')
   try:
    promenade=await page.evaluate('() => {\n      const path=shorePaths[0].points,trace=[],failed=[];\n      for(const [x,z] of path.slice(1)) {\n        let steps=0;\n        while(Math.hypot(player.group.position.x-x,player.group.position.z-z)>.35&&steps++<120) {\n          Move.yaw=Math.atan2(x-player.group.position.x,z-player.group.position.z);updateMovement(.05);\n        }\n        const distance=Math.hypot(player.group.position.x-x,player.group.position.z-z);\n        trace.push(player.group.position.toArray());if(distance>.65){failed.push({target:[x,z],distance,steps});break;}\n      }\n      Explore.resetInput();return {trace,failed};\n    }')
   finally:await page.keyboard.up('w')
   report['promenade']=promenade;assert not promenade['failed'],promenade['failed']
   before=await page.evaluate('boats.filter(b=>!b.spec.moored).map(b=>({position:b.group.position.toArray(),oars:b.group.userData.oars.map(o=>o.pivot.rotation.y)}))')
   await smoke.frames(page,.33)
   middle=await page.evaluate('boats.filter(b=>!b.spec.moored).map(b=>({position:b.group.position.toArray(),oars:b.group.userData.oars.map(o=>o.pivot.rotation.y)}))')
   await smoke.frames(page,.33)
   after=await page.evaluate('boats.filter(b=>!b.spec.moored).map(b=>({position:b.group.position.toArray(),oars:b.group.userData.oars.map(o=>o.pivot.rotation.y)}))')
   for a,m,b in zip(before,middle,after):
    assert sum(abs(x-y) for x,y in zip(a['position'],b['position']))>.01,(a,b)
    if a['oars']:assert max(a['oars'][0],m['oars'][0],b['oars'][0])-min(a['oars'][0],m['oars'][0],b['oars'][0])>.01,(a,m,b)
   report['motion']={'before':before,'middle':middle,'after':after,'passed':True}
   await page.locator('#travelBtn').click();await page.locator('[data-place="6"]').click();await page.locator('#filmBtn').click();await smoke.frames(page,.2)
   await page.screenshot(path=str(out/'qujiang-desktop.png'))
   await page.set_viewport_size({'width':844,'height':390});await smoke.frames(page,.15);await page.screenshot(path=str(out/'qujiang-landscape.png'))
   await page.locator('#filmExit').click()
   await page.set_viewport_size({'width':1120,'height':630})
   await page.evaluate('GAME.ready=false;player.group.visible=false')
   for label,kind in [('rowboat','boat'),('barge','painted')]:
    await page.evaluate('''kind=>{
      const b=boats.find(b=>b.spec.type===kind&&!b.spec.moored);b.group.userData.people.forEach(p=>p.visible=true);
      const eye=b.group.localToWorld(new THREE.Vector3(kind==='boat'?5:12,kind==='boat'?3.3:6,kind==='boat'?5:10));
      const look=b.group.localToWorld(new THREE.Vector3(0,kind==='boat'?.7:2.1,0));
      camera.position.copy(eye);camera.lookAt(look);camera.fov=43;camera.updateProjectionMatrix();
    }''',kind)
    png=await page.evaluate("() => {GameRendering.render(0);return renderer.domElement.toDataURL('image/png');}")
    (out/(label+'.png')).write_bytes(base64.b64decode(png.split(',')[1]))
   report['glError']=await page.evaluate('renderer.getContext().getError()');assert report['glError']==0
   assert not errors,errors
   report['passed']=True
  finally:
   report['errors']=errors;(out/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));await browser.close()
 print(json.dumps(report,ensure_ascii=False,indent=2))
asyncio.run(main())
