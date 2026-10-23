/* Walkable, editable shore gardens follow the actual lake polygon. */
const shorePaths=[];
const shorePlantSpots=[];
function nearShorePath(x,z,extra=.7) {
  return shorePaths.some(path=>path.points.some((p,i)=>{
    if(!i)return false;const a=path.points[i-1],dx=p[0]-a[0],dz=p[1]-a[1];
    const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
    return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<path.halfWidth+extra;
  }));
}
function buildLakeGarden(lake) {
  const outline=lake.shape.getPoints().slice(0,40);
  const boundary=a=>{
    const index=((a/TAU)%1+1)%1*40,i=Math.floor(index),t=index-i;
    const p=outline[i],q=outline[(i+1)%40];
    return new THREE.Vector2(lerp(p.x,q.x,t),-lerp(p.y,q.y,t));
  };
  const points=[],vertices=[],uvs=[],indices=[],segments=224;
  for(let i=0;i<=segments;i++) {
    const a=lerp(-Math.PI*.42,Math.PI*.33,i/segments),edge=boundary(a);
    points.push(new THREE.Vector3(lake.cx+edge.x*1.105,.026,lake.cz+edge.y*1.105));
  }
  const railing=points.map(p=>new THREE.Vector3(lake.cx+(p.x-lake.cx)*1.065/1.105,.026,lake.cz+(p.z-lake.cz)*1.065/1.105));
  // Reserve the actual source-rock locations before asynchronous GLB loading.
  // Push the promenade outward around rocks, roots and the pavilion columns.
  const keepouts=[...SHORE_ROCK_SPOTS.map(([x,z,h])=>[x,z,h*2+2]),
    ...MATURE_TREE_SPOTS.map(([x,z])=>[x,z,2.5]),[405,278,7.4]];
  const offsets=points.map(p=>{
    const outward=new THREE.Vector3(p.x-lake.cx,0,p.z-lake.cz).normalize();let offset=0;
    for(const [x,z,r] of keepouts) {
      const dx=p.x-x,dz=p.z-z,projection=dx*outward.x+dz*outward.z,perpendicular=dx*dx+dz*dz-projection*projection;
      if(perpendicular<r*r)offset=Math.max(offset,Math.sqrt(r*r-perpendicular)-projection);
    }
    return offset;
  });
  points.forEach((p,i)=>{
    const offset=Math.max(offsets[i],(offsets[i-4]||0)*.75,(offsets[i+4]||0)*.75,(offsets[i-8]||0)*.4,(offsets[i+8]||0)*.4);
    p.addScaledVector(new THREE.Vector3(p.x-lake.cx,0,p.z-lake.cz).normalize(),offset);
  });
  shorePaths.push({points:points.map(p=>[p.x,p.z]),halfWidth:1.2});
  let distance=0;
  points.forEach((p,i)=>{
    const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
    const tangent=after.clone().sub(before).normalize(),normal=new THREE.Vector3(tangent.z,0,-tangent.x);
    if(i)distance+=p.distanceTo(before);
    for(const side of [-1,1]) {
      const v=p.clone().addScaledVector(normal,side*1.2);vertices.push(v.x,v.y,v.z);uvs.push((side+1)*.6,distance/3);
    }
    if(i<points.length-1)indices.push(i*2,i*2+2,i*2+1,i*2+1,i*2+2,i*2+3);
    if(i)groundPatches.push({x0:Math.min(before.x,p.x)-1.2,x1:Math.max(before.x,p.x)+1.2,z0:Math.min(before.z,p.z)-1.2,z1:Math.max(before.z,p.z)+1.2,height:.035});
    if(i%16===0) {
      const outward=new THREE.Vector3(p.x-lake.cx,0,p.z-lake.cz).normalize();
      const tree=p.clone().addScaledVector(outward,4.1);
      if(tree.x<443&&tree.z<390&&tree.z>267)addTree(tree.x,tree.z,i%48===0?'peach':'willow',1.18+(i%3)*.12);
      const planting=p.clone().addScaledVector(outward,2.15);
      shorePlantSpots.push([planting.x,planting.z]);
      // Low open timber rails frame the bank, with regular gaps toward water.
      // Rails follow the bank independently: a post on a detoured concave
      // promenade can otherwise intrude into the next stretch of path.
      const inward=railing[i];
      if(i%48!==0&&!SHORE_ROCK_SPOTS.some(([x,z,h])=>Math.hypot(x-inward.x,z-inward.z)<h*1.6)) {
        B.stone.add(inward.x,.34,inward.z,.3,.68,.3,0,0xc7b99b);
        addCollider(inward.x-.15,inward.x+.15,inward.z-.15,inward.z+.15,'shore-rail-post');
        B.stone.add(inward.x,.72,inward.z,.4,.12,.4,0,0xd5c6a9);
        if(i>=16) {
          const previous=railing[i-16];
          const dx=inward.x-previous.x,dz=inward.z-previous.z,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);
          for(const y of [.3,.58])B.trim.add((inward.x+previous.x)/2,y,(inward.z+previous.z)/2,.075,.075,len,angle,0x7b6043);
        }
      }
    }
  });
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const path=new THREE.Mesh(geometry,SurfaceLibrary.paving(0xc9c1a5));path.receiveShadow=true;path.name='qujiang-shore-garden-path';scene.add(path);
}
