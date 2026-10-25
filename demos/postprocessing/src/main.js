// Recovery harness for the existing postprocessing pipeline, not the missing cloud original.
import * as THREE from 'three';
import {buildPostFX} from './post/Composer.js';

const hud=document.getElementById('hud');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bafc5);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
camera.position.set(18,14,36);camera.lookAt(0,6,0);
scene.add(new THREE.HemisphereLight(0xd6e2f3,0x594a3a,1.8));
const sun=new THREE.DirectionalLight(0xffdcb5,3);
sun.position.set(-15,35,15);scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x857965,roughness:.94}));
ground.rotation.x=-Math.PI/2;scene.add(ground);
for(let i=0;i<12;i++){
  const h=4+(i%4)*2.5;
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(3,h,3),
    new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(i/12,.31,.46),roughness:.65,metalness:i%3===0?.3:0}));
  mesh.position.set((i%6-2.5)*6,h/2,Math.floor(i/6)*9-3);
  scene.add(mesh);
}
const composer=buildPostFX({renderer,scene,camera,width:innerWidth,height:innerHeight});
let enabled=true,t=0;const clock=new THREE.Clock();
addEventListener('keydown',e=>{if(e.code==='KeyP')enabled=!enabled;});
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.resize(innerWidth,innerHeight);
});
function draw(){
  requestAnimationFrame(draw);
  t+=clock.getDelta();camera.position.x=Math.cos(t*.12)*36;camera.position.z=Math.sin(t*.12)*36;
  camera.lookAt(0,6,0);
  if(enabled)composer.composer.render();else renderer.render(scene,camera);
  hud.textContent='后处理独立技术样板 / 非正式唐代场景\nP: '+(enabled?'后处理':'直接渲染')+
    ' / DrawCalls '+renderer.info.render.calls+'\n现有SSAO/Bloom/Vignette/Film/FXAA已接线；LUT预设仍是研究代码';
}
draw();
