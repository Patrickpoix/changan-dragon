// 程序化电影LUT（Data3DTexture）32^3立方体
import * as THREE from 'three';
const SIZE = 32;
export const LUT_PRESETS = {
  day: {contrast:1.08, lift:[.008,.012,.02], gamma:[1,1,.98], gain:[1.05,1.02,.98], shadowTint:[.86,.97,1.1], shadowAmt:.35, highlightTint:[1.1,1.01,.86], highlightAmt:.4, sat:1.06},
  dusk: {contrast:1.06, lift:[.018,.01,.004], gamma:[.96,.99,1.04], gain:[1.12,1,.82], shadowTint:[.82,.78,1.15], shadowAmt:.42, highlightTint:[1.16,.94,.66], highlightAmt:.5, sat:1.02},
  night: {contrast:1.16, lift:[0,.004,.014], gamma:[1.05,1.02,.96], gain:[1.05,.95,.85], shadowTint:[.72,.84,1.28], shadowAmt:.55, highlightTint:[1.22,.86,.48], highlightAmt:.55, sat:.96},
  rain: {contrast:.94, lift:[-.004,.002,.008], gamma:[1.04,1.02,.99], gain:[.94,.99,1.04], shadowTint:[.86,.96,1.08], shadowAmt:.3, highlightTint:[.88,1,1.08], highlightAmt:.35, sat:.62}
};
function clamp01(v){return v<0?0:v>1?1:v;}
function grade(r,g,b,p){
  let out=[p.contrast*(r-.5)+.5, p.contrast*(g-.5)+.5, p.contrast*(b-.5)+.5];
  const luma=.2126*out[0]+.7152*out[1]+.0722*out[2];
  const sm=1-Math.max(0,Math.min(1,luma/.55));
  out[0]+=p.lift[0]*sm; out[1]+=p.lift[1]*sm; out[2]+=p.lift[2]*sm;
  out=out.map((v,i)=>Math.pow(clamp01(v),1/p.gamma[i]));
  out[0]*=p.gain[0]; out[1]*=p.gain[1]; out[2]*=p.gain[2];
  const hm=Math.max(0,Math.min(1,(luma-.45)/.55));
  const sa=sm*p.shadowAmt, ha=hm*p.highlightAmt;
  out[0]*=1-sa+p.shadowTint[0]*sa; out[1]*=1-sa+p.shadowTint[1]*sa; out[2]*=1-sa+p.shadowTint[2]*sa;
  out[0]*=1-ha+p.highlightTint[0]*ha; out[1]*=1-ha+p.highlightTint[1]*ha; out[2]*=1-ha+p.highlightTint[2]*ha;
  const l2=.2126*out[0]+.7152*out[1]+.0722*out[2];
  out[0]=l2+(out[0]-l2)*p.sat; out[1]=l2+(out[1]-l2)*p.sat; out[2]=l2+(out[2]-l2)*p.sat;
  return [clamp01(out[0]),clamp01(out[1]),clamp01(out[2])];
}
export function createLUTTexture(key){
  const p=LUT_PRESETS[key]||LUT_PRESETS.dusk;
  const data=new Uint8Array(SIZE*SIZE*SIZE*4);
  let i=0;
  for(let z=0;z<SIZE;z++)for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const[r,g,b]=grade(x/(SIZE-1),y/(SIZE-1),z/(SIZE-1),p);
    data[i++]=r*255; data[i++]=g*255; data[i++]=b*255; data[i++]=255;
  }
  const t=new THREE.Data3DTexture(data,SIZE,SIZE,SIZE);
  t.format=THREE.RGBAFormat; t.type=THREE.UnsignedByteType;
  t.magFilter=t.minFilter=THREE.LinearFilter;
  t.wrapS=t.wrapT=t.wrapR=THREE.ClampToEdgeWrapping;
  t.needsUpdate=true; return t;
}
