// 演示场景：地面+建筑+树+灯笼
import * as THREE from 'three';

export function buildScene(scene){
  const lanterns=[];
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x8a7a5a,roughness:.95}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const colors=[0xb8956a,0xa08058,0xc4a878,0x907048];
  for(let i=0;i<12;i++){
    const w=6+Math.random()*8,h=5+Math.random()*8,d=6+Math.random()*6;
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:colors[i%4],roughness:.9}));
    const ang=(i/12)*Math.PI*2,r=25+Math.random()*15;
    b.position.set(Math.cos(ang)*r,h/2,Math.sin(ang)*r);b.castShadow=b.receiveShadow=true;scene.add(b);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.75,2.5,4),new THREE.MeshStandardMaterial({color:0x6a3a2a,roughness:.8}));
    roof.position.set(b.position.x,h+1.25,b.position.z);roof.rotation.y=Math.PI/4;scene.add(roof);
  }
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,4,8),new THREE.MeshStandardMaterial({color:0x4a3020}));
  trunk.position.y=2;scene.add(trunk);
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(2.5,8,6),new THREE.MeshStandardMaterial({color:0x6a8a3a}));
  canopy.position.y=5.5;scene.add(canopy);
  for(let i=0;i<8;i++){
    const ang=(i/8)*Math.PI*2;
    const lan=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),new THREE.MeshStandardMaterial({color:0xcc2222,emissive:0xff4422,emissiveIntensity:0}));
    lan.position.set(Math.cos(ang)*12,4.2,Math.sin(ang)*12);scene.add(lan);
    lanterns.push({mesh:lan,baseEmissive:2});
  }
  return{lanterns};
}
