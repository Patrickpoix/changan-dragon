// 昼夜循环控制器 24h=20min现实
import * as THREE from 'three';

export class DayNightCycle {
  constructor(scene, skyMaterial, dirLight, hemiLight, lanterns=[]) {
    this.scene=scene; this.skyMat=skyMaterial; this.dirLight=dirLight; this.hemi=hemiLight; this.lanterns=lanterns;
    this.gameTime=12.0; this.dayLengthSec=20*60; this.auto=true;
    this.keys=[
      {h:0,sun:0,sunI:0,hemiS:0x0a1428,hemiG:0x050810,hemiI:.15,fog:0x0a1020},
      {h:6,sun:0xff9a55,sunI:.6,hemiS:0x5a4a6a,hemiG:0x2a2030,hemiI:.5,fog:0xc88060},
      {h:8,sun:0xffe8c0,sunI:1.2,hemiS:0x80a0d0,hemiG:0x405060,hemiI:.8,fog:0xb0c0d0},
      {h:12,sun:0xffffff,sunI:1.5,hemiS:0x90b8e8,hemiG:0x506070,hemiI:1.0,fog:0xc8d8e8},
      {h:18,sun:0xff7a30,sunI:.7,hemiS:0x6a4050,hemiG:0x302028,hemiI:.5,fog:0xd87040},
      {h:20,sun:0,sunI:0,hemiS:0x0a1428,hemiG:0x050810,hemiI:.15,fog:0x0a1020},
      {h:24,sun:0,sunI:0,hemiS:0x0a1428,hemiG:0x050810,hemiI:.15,fog:0x0a1020},
    ];
  }
  _sample(h){
    const k=this.keys;
    for(let i=0;i<k.length-1;i++){
      if(h>=k[i].h&&h<=k[i+1].h){
        const t=(h-k[i].h)/(k[i+1].h-k[i].h);const a=k[i],b=k[i+1];
        return{sun:new THREE.Color(a.sun).lerp(new THREE.Color(b.sun),t),sunI:THREE.MathUtils.lerp(a.sunI,b.sunI,t),hemiS:new THREE.Color(a.hemiS).lerp(new THREE.Color(b.hemiS),t),hemiG:new THREE.Color(a.hemiG).lerp(new THREE.Color(b.hemiG),t),hemiI:THREE.MathUtils.lerp(a.hemiI,b.hemiI,t),fog:new THREE.Color(a.fog).lerp(new THREE.Color(b.fog),t)};
      }
    }
    return{sun:new THREE.Color(),sunI:0,hemiS:new THREE.Color(),hemiG:new THREE.Color(),hemiI:0,fog:new THREE.Color()};
  }
  _sunDir(h){const a=((h-6)/12)*Math.PI;return{dir:new THREE.Vector3(Math.cos(a),Math.sin(a),.2).normalize(),elev:Math.sin(a)};}
  setTime(h){this.gameTime=((h%24)+24)%24;}
  update(dt,t){
    if(this.auto)this.gameTime=(this.gameTime+dt*(24/this.dayLengthSec))%24;
    const h=this.gameTime;const s=this._sample(h);const{dir:sd,elev}=this._sunDir(h);
    this.dirLight.color.copy(s.sun);this.dirLight.intensity=s.sunI;this.dirLight.position.copy(sd).multiplyScalar(100);
    this.hemi.color.copy(s.hemiS);this.hemi.groundColor.copy(s.hemiG);this.hemi.intensity=s.hemiI;
    if(this.scene.fog)this.scene.fog.color.copy(s.fog);
    return{hour:h,sunElev:elev};
  }
  bloomIntensity(festival){
    const night=1-Math.max(0,Math.min(1,(this._sunDir(this.gameTime).elev+.1)/.2));
    return THREE.MathUtils.lerp(0,.8,night)+(festival?1.2:0);
  }
}
