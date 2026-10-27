/* ============================================================
   龙游长安 · 游戏主循环 / 操控 / 镜头 / 昼夜 / 诗笺
   v7 性能优化：
   - GAME.ready后后台预编译材质（利用用户读开始界面的几秒）
   - startGame()里renderer.compile()变为近无操作
   v6 性能优化：
   - 移除enhance模块加载的100ms setTimeout固定延迟
   v5 性能优化：
   - startGame() 改为异步：先显示加载提示，让浏览器绘制后再执行PMREM/编译
   ============================================================ */

'use strict';

const UI = {
  boot: $('#bootScreen'), bootStatus: $('#bootStatus'),
  start: $('#startScreen'), startBtn: $('#startBtn'), startHelp: $('#startHelpBtn'), startControls: $('#startControls'),
  hud: $('#hud'), poemBadge: $('#poemBadge'), poemCount: $('#poemCount'),
  minimap: $('#minimap'), minimapWrap: $('#minimapWrap'), mapHint: $('#mapHint'),
  banner: $('#discoverBanner'), bannerName: $('#discoverName'), bannerDesc: $('#discoverDesc'),
  toast: $('#toast'), joystick: $('#joystick'), joyKnob: $('.joy-knob'),
  speedValue: $('#speedValue'), speedCard: $('#speedCard'),
  interact: $('#interactBtn'), cameraBtn: $('#cameraBtn'), cameraLabel: $('#cameraLabel'),
  boostBtn: $('#boostBtn'), bellBtn: $('#bellBtn'), albumBtn: $('#albumBtn'),
  nightBtn: $('#nightBtn'), soundBtn: $('#soundBtn'), helpBtn: $('#helpBtn'), fullBtn: $('#fullBtn'),
  modal: $('#modalLayer'), poemPanel: $('#poemPanel'), helpPanel: $('#helpPanel'), collectionPanel: $('#collectionPanel'),
  poemTitle: $('#poemTitle'), poemPlace: $('#poemPlace'), poemLine: $('#poemLine'), poemIndex: $('#poemIndex'),
  collectionList: $('#collectionList'), collectionComplete: $('#collectionComplete'), travelPanel: $('#travelPanel'),
};

const GAME = {
  ready: false,
  started: false,
  modalOpen: false,
  nightTarget: 0,
  nightT: 0,
  time: 0,
  lastFrame: performance.now(),
  currentPlace: '',
  placeSince: 0,
  lastBanner: '',
  bannerHideAt: 0,
  toastHideAt: 0,
  lastWaterToast: -99,
  boosted: false,
  mapAge: 0,
  discovered: new Set(),
  poemsFound: new Set(),
  preCompiled: false,
};

const STORAGE_POEMS = 'changan-dragon-poems-v1';
const MAX_SPEED = 14.2;
const BOOST_SPEED = 21;
const REVERSE_SPEED = 3.6;

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

function bootStatus(text) {
  if (UI.bootStatus) UI.bootStatus.textContent = text;
}

let _toastTimer = 0;
function toast(text, ms = 2200) {
  if (!UI.toast) return;
  UI.toast.textContent = text;
  UI.toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => UI.toast.classList.remove('show'), ms);
}

function showBanner(name, desc, ms = 3600) {
  if (!UI.banner) return;
  UI.bannerName.textContent = name;
  UI.bannerDesc.textContent = desc || '';
  UI.banner.classList.remove('show');
  requestAnimationFrame(() => UI.banner.classList.add('show'));
  GAME.bannerHideAt = performance.now() + ms;
}

function loadCollectedPoems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_POEMS) || '[]');
    if (Array.isArray(saved)) saved.forEach(i => {
      if (Number.isInteger(i) && i >= 0 && i < poems.length) GAME.poemsFound.add(i);
    });
  } catch (_) {}
}

function saveCollectedPoems() {
  try { localStorage.setItem(STORAGE_POEMS, JSON.stringify([...GAME.poemsFound])); } catch (_) {}
}

function restorePoems() {
  poems.forEach((p, i) => {
    p.group.visible=!p.taken&&!Explore.film;
    p.taken = GAME.poemsFound.has(i);
    p.group.visible = !p.taken;
  });
  updatePoemCounter();
  buildCollectionList();
}

const Sound = {
  ctx: null, master: null, enabled: true, ambientTimer: 0, ambientStep: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.enabled ? 0.55 : 0; this.master.connect(this.ctx.destination); return true; } catch (_) { return false; }
  },
  tone(freq, start, dur, gain = 0.08, type = 'sine') {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(gain, start + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(this.master); o.start(start); o.stop(start + dur + 0.03);
  },
  bell() { if (!this.enabled || !this.init()) return; const t = this.ctx.currentTime; [880,1318.5,1760,2637].forEach((f,i) => this.tone(f, t+i*0.018, 0.9-i*0.12, 0.055/(i+1), i?'sine':'triangle')); },
  chime() { if (!this.enabled || !this.init()) return; const t = this.ctx.currentTime; [523.25,659.25,783.99,1046.5].forEach((f,i) => this.tone(f, t+i*0.075, 1.0, 0.045)); },
  async setEnabled(on) {
    this.enabled = on; if (on) this.init();
    if (this.master && this.ctx) { const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.linearRampToValueAtTime(on?0.55:0.0001, t+0.18); }
    if (UI.soundBtn) { UI.soundBtn.textContent = on?'声':'静'; UI.soundBtn.classList.toggle('active', on); }
    if (on) this.scheduleAmbient(); else clearTimeout(this.ambientTimer);
  },
  scheduleAmbient() {
    clearTimeout(this.ambientTimer);
    if (!this.enabled || !GAME.started || document.hidden) return;
    this.ambientTimer = setTimeout(() => {
      if (!this.enabled || !GAME.started) return;
      this.init(); if (!this.ctx) return;
      const scale = [293.66,329.63,392.0,440.0,523.25,587.33,659.25];
      const t = this.ctx.currentTime; const base = this.ambientStep++;
      const notes = [scale[base%scale.length], scale[(base+2)%scale.length], scale[(base+4)%scale.length]];
      notes.forEach((f,i) => this.tone(f, t+i*0.32, 2.2, i===0?0.024:0.014, 'triangle'));
      if (base%3===0) this.tone(146.83, t, 3.4, 0.012, 'sine');
      this.scheduleAmbient();
    }, 5200 + Math.random()*2600);
  },
};

const Cam = {
  modes: [{label:'追随',key:'chase'},{label:'侧拍',key:'side'},{label:'鸟瞰',key:'aerial'},{label:'环游',key:'orbit'}],
  mode: 0, userYaw: 0, orbitYaw: 0.45, pitch: 0.1, zoom: 0.9, fov: 55,
  look: new THREE.Vector3(0,1.8,420), dragging: false, lastX: 0, lastY: 0, autoOrbit: 0,
  clearPosition(look, desired) {
    const delta = desired.clone().sub(look); const distance = delta.length();
    if (distance < 0.1) return desired;
    const steps = Math.max(12, Math.ceil(distance/0.6)); const probe = new THREE.Vector3();
    for (let i = 1; i <= steps; i++) {
      const t = i/steps, p = probe.copy(look).addScaledVector(delta, t);
      const candidates = colliderGrid.get(Math.floor(p.x/CELL)+','+Math.floor(p.z/CELL)) || [];
      const blocked = candidates.some(c => p.x>c.minX-.35&&p.x<c.maxX+.35&&p.z>c.minZ-.35&&p.z<c.maxZ+.35&&p.y<Math.max(3,Explore.roofAt(p.x,p.z))+.4);
      if (blocked) return look.clone().addScaledVector(delta, Math.max(0.08, t-.75/distance));
    }
    return desired;
  },
  resolvePosition(look, desired) {
    let best=this.clearPosition(look,desired), distance=best.distanceTo(look);
    if(distance>=2.6) return best;
    const offset=desired.clone().sub(look), radius=Math.max(4,Math.hypot(offset.x,offset.z));
    const angle=Math.atan2(offset.x,offset.z);
    for(const lift of [0,1.6]) for(const turn of [.65,-.65,1.2,-1.2,Math.PI]) {
      const candidate=new THREE.Vector3(look.x+Math.sin(angle+turn)*radius, desired.y+lift, look.z+Math.cos(angle+turn)*radius);
      const safe=this.clearPosition(look,candidate), available=safe.distanceTo(look);
      if(available>distance){best=safe;distance=available;}
      if(distance>=radius*.72) return best;
    }
    return best;
  },
  cycle() { this.mode=(this.mode+1)%this.modes.length; this.userYaw=0; if(UI.cameraLabel) UI.cameraLabel.textContent=this.modes[this.mode].label; toast('镜头 · '+this.modes[this.mode].label,1500); },
  update(dt, player, immediate=false) {
    const p=player.group.position, yaw=player.yaw||0, mode=this.modes[this.mode].key;
    let desired=new THREE.Vector3(), look=new THREE.Vector3(p.x,2.0+p.y,p.z), lambda=4.4;
    if(mode==='chase'){const angle=yaw+Math.PI+this.userYaw,d=8.4*this.zoom,h=2.8+Math.sin(this.pitch)*d*.28;desired.set(p.x+Math.sin(angle)*d*.92,p.y+h,p.z+Math.cos(angle)*d*.92);look.x+=Math.sin(yaw)*3.4;look.z+=Math.cos(yaw)*3.4;look.y=p.y+1.65;this.userYaw=damp(this.userYaw,0,.32,dt);lambda=4.8;}
    else if(mode==='side'){const angle=yaw+Math.PI*.36+this.userYaw,d=6.9*this.zoom;desired.set(p.x+Math.sin(angle)*d,p.y+2.65+Math.sin(this.pitch)*1.6,p.z+Math.cos(angle)*d);look.x+=Math.sin(yaw)*.7;look.z+=Math.cos(yaw)*.7;look.y=p.y+1.35;lambda=3.8;}
    else if(mode==='aerial'){this.autoOrbit+=dt*.08;const angle=yaw+Math.PI+this.userYaw+this.autoOrbit,d=11.5*this.zoom;desired.set(p.x+Math.sin(angle)*d,p.y+17.5*this.zoom,p.z+Math.cos(angle)*d);look.x+=Math.sin(yaw)*9;look.z+=Math.cos(yaw)*9;lambda=2.7;}
    else{this.autoOrbit+=dt*.16;const angle=this.orbitYaw+this.autoOrbit,d=13.6*this.zoom;desired.set(p.x+Math.sin(angle)*d,p.y+7.4+Math.sin(this.pitch)*7.0,p.z+Math.cos(angle)*d);lambda=3.0;}
    const anchor=new THREE.Vector3(p.x,p.y+2.45,p.z);
    look=this.clearPosition(anchor,look); desired=this.resolvePosition(look,desired); desired.y=Math.max(desired.y,.8);
    if(immediate){camera.position.copy(desired);this.look.copy(look);}else{camera.position.lerp(desired,1-Math.exp(-lambda*dt));this.look.lerp(look,1-Math.exp(-6.5*dt));}
    this.look.copy(this.clearPosition(anchor,this.look)); camera.position.copy(this.resolvePosition(this.look,camera.position)); camera.lookAt(this.look);
    const targetFov=56+(GAME.boosted?4.2:0); this.fov=damp(this.fov,targetFov,3.4,dt);
    if(Math.abs(camera.fov-this.fov)>.01){camera.fov=this.fov;camera.updateProjectionMatrix();}
  },
  drag(dx,dy){if(this.modes[this.mode].key==='orbit')this.orbitYaw-=dx*.005;else this.userYaw-=dx*.0045;this.pitch=clamp(this.pitch+dy*.0035,-.06,.78);},
  zoomBy(f){this.zoom=clamp(this.zoom*f,.62,2.15);},
};

const Input = { keys:Object.create(null), joyX:0, joyY:0, touchBoost:false, joyPointer:null, pointers:new Map(), pinching:false, pinchDist:0 };

function bindKeyboard() {
  const blocked=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);
  window.addEventListener('keydown',e=>{
    if(blocked.has(e.code))e.preventDefault(); if(e.repeat)return;
    if(e.code==='Escape'){if(Explore.film)Explore.stopFilm();else closeModal();return;}
    if(!GAME.started||GAME.modalOpen)return;
    if(Explore.film&&!['KeyN','KeyM'].includes(e.code))return;
    Input.keys[e.code]=true;
    if(e.code==='KeyC')Cam.cycle(); else if(e.code==='KeyB')ringBell();
    else if(e.code==='KeyE'&&Explore.mode!=='fly')tryPickup();
    else if(e.code==='KeyN')toggleNight(); else if(e.code==='KeyL')openCollection();
    else if(e.code==='KeyH'||e.code==='Slash')openHelp();
    else if(e.code==='KeyM')Sound.setEnabled(!Sound.enabled);
  });
  window.addEventListener('keyup',e=>{Input.keys[e.code]=false;});
  window.addEventListener('blur',()=>Explore.resetInput());
}

function axes(){let t=0,s=0;if(Input.keys.KeyW||Input.keys.ArrowUp)t+=1;if(Input.keys.KeyS||Input.keys.ArrowDown)t-=1;if(Input.keys.KeyA||Input.keys.ArrowLeft)s+=1;if(Input.keys.KeyD||Input.keys.ArrowRight)s-=1;t+=Input.joyY;s-=Input.joyX;return{throttle:clamp(t,-1,1),steer:clamp(s,-1,1)};}

function bindJoystick() {
  const el=UI.joystick; if(!el)return;
  const update=e=>{const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len),nx=dx*k,ny=dy*k;Input.joyX=nx/max;Input.joyY=-ny/max;UI.joyKnob.style.transform=`translate(${nx}px,${ny}px)`;};
  const reset=()=>{Input.joyX=Input.joyY=0;Input.joyPointer=null;el.classList.remove('active');UI.joyKnob.style.transform='translate(0px,0px)';};
  el.addEventListener('pointerdown',e=>{if(Input.joyPointer!==null||!GAME.started||GAME.modalOpen||Explore.film)return;Input.joyPointer=e.pointerId;el.classList.add('active');el.setPointerCapture(e.pointerId);update(e);e.preventDefault();});
  el.addEventListener('pointermove',e=>{if(Input.joyPointer===e.pointerId){update(e);e.preventDefault();}});
  el.addEventListener('pointerup',e=>{if(Input.joyPointer===e.pointerId)reset();});
  el.addEventListener('pointercancel',reset); el.addEventListener('lostpointercapture',reset);
}

function bindViewGestures() {
  canvas.addEventListener('pointerdown',e=>{
    if(GAME.modalOpen||Explore.film)return;
    Input.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); canvas.setPointerCapture?.(e.pointerId);
    if(Input.pointers.size===1){Cam.dragging=true;Cam.lastX=e.clientX;Cam.lastY=e.clientY;}
    else if(Input.pointers.size===2){const pts=[...Input.pointers.values()];Input.pinching=true;Input.pinchDist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);Cam.dragging=false;}
  });
  window.addEventListener('pointermove',e=>{
    if(!Input.pointers.has(e.pointerId))return; Input.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(Input.pointers.size===1&&Cam.dragging){Cam.drag(e.clientX-Cam.lastX,e.clientY-Cam.lastY);Cam.lastX=e.clientX;Cam.lastY=e.clientY;}
    else if(Input.pointers.size===2&&Input.pinching){const pts=[...Input.pointers.values()];const d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(Input.pinchDist>0)Cam.zoomBy(Input.pinchDist/Math.max(1,d));Input.pinchDist=d;}
  });
  const end=e=>{Input.pointers.delete(e.pointerId);if(Input.pointers.size<2)Input.pinching=false;if(Input.pointers.size===0)Cam.dragging=false;else if(Input.pointers.size===1){const r=[...Input.pointers.values()][0];Cam.lastX=r.x;Cam.lastY=r.y;Cam.dragging=true;}};
  window.addEventListener('pointerup',end); window.addEventListener('pointercancel',end);
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(Explore.film||GAME.modalOpen)return;Cam.zoomBy(e.deltaY>0?1.08:.925);},{passive:false});
}

function bindHold(el,onDown,onUp) {
  if(!el)return; let heldPointer=null;
  el.addEventListener('pointerdown',e=>{e.preventDefault();if(heldPointer!==null||!GAME.started||GAME.modalOpen||Explore.film)return;heldPointer=e.pointerId;el.setPointerCapture?.(e.pointerId);el.classList.add('held');onDown();});
  const up=e=>{if(heldPointer===null||(e&&e.pointerId!==undefined&&e.pointerId!==heldPointer))return;heldPointer=null;el.classList.remove('held');onUp();};
  el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.addEventListener('lostpointercapture',up);
  window.addEventListener('blur',()=>up()); document.addEventListener('visibilitychange',()=>{if(document.hidden)up();});
}

function updatePoemCounter(){const n=GAME.poemsFound.size;if(UI.poemCount)UI.poemCount.textContent=String(n);if(UI.poemBadge)UI.poemBadge.classList.toggle('complete',n>=poems.length);}
function buildCollectionList(){
  if(!UI.collectionList)return;UI.collectionList.innerHTML='';
  poems.forEach((p,i)=>{const got=GAME.poemsFound.has(i);const row=document.createElement('div');row.className='collection-item'+(got?'':' locked');row.innerHTML=`<span class="num">${String(i+1).padStart(2,'0')}</span><span class="place">${got?escapeHTML(p.place):'未寻得'}</span><span class="line">${got?escapeHTML(p.line):'••••••••'}</span>`;UI.collectionList.appendChild(row);});
  if(UI.collectionComplete)UI.collectionComplete.classList.toggle('hidden',GAME.poemsFound.size<poems.length);
}
function escapeHTML(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

let modalReturnFocus=null;
function openModal(panel){if(!panel||!UI.modal||Explore.film)return;modalReturnFocus=document.activeElement;Explore.resetInput();GAME.modalOpen=true;[UI.poemPanel,UI.helpPanel,UI.collectionPanel,UI.travelPanel].forEach(p=>p?.classList.add('hidden'));panel.classList.remove('hidden');UI.modal.classList.remove('hidden');panel.querySelector('button')?.focus?.();}
function closeModal(){if(!UI.modal||!GAME.modalOpen)return;GAME.modalOpen=false;UI.modal.classList.add('hidden');Explore.resetInput();modalReturnFocus?.focus?.();modalReturnFocus=null;}
function openPoem(i){const p=poems[i];if(!p)return;UI.poemTitle.textContent=p.place;UI.poemPlace.textContent='长安 · 诗笺';UI.poemLine.textContent=p.line;UI.poemIndex.textContent=`诗囊 ${GAME.poemsFound.size} / ${poems.length} 枚`;openModal(UI.poemPanel);}
function openHelp(){if(!GAME.started)return;openModal(UI.helpPanel);}
function openCollection(){if(!GAME.started)return;buildCollectionList();openModal(UI.collectionPanel);}

function nearestPoem(){if(Explore.mode==='fly')return -1;const p=player.group.position;let best=-1,bestD=4.8;poems.forEach((poem,i)=>{if(poem.taken)return;const d=Math.hypot(poem.x-p.x,poem.z-p.z);if(d<bestD){bestD=d;best=i;}});return best;}
function tryPickup(){if(!GAME.started||GAME.modalOpen)return;const i=nearestPoem();if(i<0)return;const p=poems[i];p.taken=true;p.group.visible=false;GAME.poemsFound.add(i);saveCollectedPoems();updatePoemCounter();buildCollectionList();Sound.chime();UI.interact.classList.remove('visible');openPoem(i);if(GAME.poemsFound.size===poems.length)setTimeout(()=>toast('诗笺尽收 · 长安春风入袖',4200),600);}

function bindUI() {
  UI.startBtn?.addEventListener('click',startGame);
  UI.startHelp?.addEventListener('click',()=>{openModal(UI.helpPanel);});
  UI.cameraBtn?.addEventListener('click',()=>{ensureAudio();Cam.cycle();});
  UI.bellBtn?.addEventListener('click',ringBell); UI.albumBtn?.addEventListener('click',openCollection);
  UI.poemBadge?.addEventListener('click',openCollection); UI.helpBtn?.addEventListener('click',openHelp);
  UI.nightBtn?.addEventListener('click',toggleNight);
  UI.soundBtn?.addEventListener('click',()=>{ensureAudio();Sound.setEnabled(!Sound.enabled);if(Sound.enabled)toast('丝竹声起',1200);});
  UI.interact?.addEventListener('click',tryPickup); UI.fullBtn?.addEventListener('click',toggleFullscreen);
  UI.minimapWrap?.addEventListener('click',()=>UI.minimapWrap.classList.toggle('expanded'));
  UI.modal?.addEventListener('click',e=>{if(e.target===UI.modal||e.target.closest('[data-close]'))closeModal();});
  bindHold(UI.boostBtn,()=>{Input.touchBoost=true;ensureAudio();},()=>{Input.touchBoost=false;});
}

function toggleFullscreen(){if(!document.fullscreenElement){const req=document.documentElement.requestFullscreen?.();if(req)req.catch(()=>toast('当前浏览器不允许全屏',1800));}else document.exitFullscreen?.().catch(()=>{});}
function ensureAudio(){if(!Sound.enabled)return;if(Sound.init()&&Sound.ctx?.state==='suspended')Sound.ctx.resume().catch(()=>{});}
function ringBell(){if(!GAME.started)return;player.ring();Sound.bell();}

const GRADE={dayExposure:1.15,nightExposure:0.92,dayFogNear:60,dayFogFar:600,nightFogNear:95,nightFogFar:590};
const Colors={
  dayTop:new THREE.Color(0x85b6ce),dayHorizon:new THREE.Color(0xf8e3c8),daySun:new THREE.Color(0xffc95e),
  nightTop:new THREE.Color(0x071b3b),nightHorizon:new THREE.Color(0x3e4c84),nightSun:new THREE.Color(0xdbe9ff),
  dayFog:new THREE.Color(0xe8d8b8),nightFog:new THREE.Color(0x1b2746),
  dayDeep:new THREE.Color(0x2e6c70),nightDeep:new THREE.Color(0x0e4c70),
  dayShallow:new THREE.Color(0x78b4aa),nightShallow:new THREE.Color(0x2c7891),
  dayHemi:new THREE.Color(0xfff3d8),nightHemi:new THREE.Color(0x9bb7ef),
  daySunLight:new THREE.Color(0xffe6bd),nightSunLight:new THREE.Color(0xaecaff),
  dayRim:new THREE.Color(0xffb98f),nightRim:new THREE.Color(0x5b78c9),
};

function toggleNight(){if(!GAME.started)return;GAME.nightTarget=GAME.nightTarget>.5?0:1;const on=GAME.nightTarget>.5;if(UI.nightBtn){UI.nightBtn.textContent=on?'☀':'☾';UI.nightBtn.title=on?'切换白昼':'切换夜晚';UI.nightBtn.classList.toggle('active',on);}toast(on?'月升长安 · 满城灯火':'晨光再临 · 长安如画',1700);}

function updateDayNight(dt) {
  GAME.nightT=damp(GAME.nightT,GAME.nightTarget,2.1,dt);const n=GAME.nightT;
  skyUniforms.night.value=n; skyUniforms.topColor.value.copy(Colors.dayTop).lerp(Colors.nightTop,n);
  skyUniforms.horizonColor.value.copy(Colors.dayHorizon).lerp(Colors.nightHorizon,n); skyUniforms.sunColor.value.copy(Colors.daySun).lerp(Colors.nightSun,n);
  scene.fog.color.copy(Colors.dayFog).lerp(Colors.nightFog,n); scene.fog.near=lerp(GRADE.dayFogNear,GRADE.nightFogNear,n); scene.fog.far=lerp(GRADE.dayFogFar,GRADE.nightFogFar,n);
  starMat.opacity=n*.92; hemi.intensity=lerp(.42,.28,n); hemi.color.copy(Colors.dayHemi).lerp(Colors.nightHemi,n);
  ambient.intensity=lerp(.06,.12,n); sun.intensity=lerp(2.2,.32,n); sun.color.copy(Colors.daySunLight).lerp(Colors.nightSunLight,n);
  rim.color.copy(Colors.dayRim).lerp(Colors.nightRim,n); rim.intensity=lerp(.27,.19,n);
  GameRendering.setExposure(lerp(GRADE.dayExposure,GRADE.nightExposure,n));
  MAT.lantern.emissiveIntensity=lerp(.35,3.8,n); MAT.window.emissiveIntensity=lerp(0,2.1,n); MAT.lanternGlow.opacity=lerp(.2,.75,n);
  waterUniforms.deep.value.copy(Colors.dayDeep).lerp(Colors.nightDeep,n); waterUniforms.shallow.value.copy(Colors.dayShallow).lerp(Colors.nightShallow,n);
  waterUniforms.sunColor.value.copy(sun.color); waterUniforms.sunDir.value.copy(sun.position).sub(sun.target.position).normalize();
  if(fireflies)fireflies.pts.material.opacity=n*.95; if(stars)stars.visible=n>.015;
  if(window.__nightLights)for(const light of window.__nightLights)light.intensity=(light.userData.baseIntensity||.5)*n;
}

const OUTSIDE_SPOTS=[
  {id:'mingde-outside',name:'明德门外',x:0,z:430,radius:85,desc:'春风从南边来，催着车轮向长安城去。'},
  {id:'fields',name:'城南田畴',x:-220,z:520,radius:190,desc:'麦浪起伏，远山如黛，城外也是好风光。'},
  {id:'qujiang-east',name:'芙蓉园东岸',x:452,z:330,radius:55,desc:'柳丝拂水，杏花如雪，曲江春色正浓。'},
];
const PLACE_DESCS={
  '西市':'胡姬酒肆、波斯邸与骆驼商队，西域风物汇于一处。','东市':'四方珍奇皆所积集，绫锦珠玉，香气盈街。',
  '朱雀大街':'长安城的中央天街，车马如流，直通明德门。','大明宫':'千宫之宫，丹凤门五门洞开，含元殿高踞龙首原。',
  '兴庆宫':'龙池碧波，沉香亭畔牡丹盛放，花萼相辉。','曲江池':'曲江潋滟，画舫徐行，长安春色尽在此间。',
  '大雁塔':'大慈恩寺内七层砖塔，塔影入云，铃铎随风。','小雁塔':'荐福寺古塔，晨钟声闻十里。',
  '太极宫':'大唐正宫，朱墙金脊，气象肃穆。','明德门':'长安外郭城正南门，五门洞并列。',
};

function getPlace(x,z){
  if(z>385&&Math.abs(x)<90)return OUTSIDE_SPOTS[0];
  let best=null,bestD=Infinity;
  for(const l of landmarks){const d=Math.hypot(l.x-x,l.z-z);if(d<(l.radius||30)+12&&d<bestD){best=l;bestD=d;}}
  if(best)return{id:best.id,name:best.name,desc:best.desc||PLACE_DESCS[best.name]||''};
  for(const s of OUTSIDE_SPOTS){const d=Math.hypot(s.x-x,s.z-z);if(d<s.radius)return s;}
  if(x>=CITY.x0&&x<=CITY.x1&&z>=CITY.z0&&z<=CITY.z1){
    let ward=null,wd=Infinity;
    for(const w of wards){const dx=Math.abs(x-w.x),dz=Math.abs(z-w.z);if(dx<w.w/2+2&&dz<w.d/2+2){const d=dx+dz;if(d<wd){wd=d;ward=w;}}}
    if(ward)return{id:'ward-'+ward.name,name:ward.name,desc:'坊墙之内，炊烟与花影相间，寻常巷陌也有长安故事。'};
    return{id:'city',name:'长安城',desc:'一百零八坊，街衢如棋局，处处皆是盛唐风物。'};
  }
  return{id:'outskirts',name:'长安郊野',desc:'田野开阔，山色青青，慢慢骑也是一种自在。'};
}

function updatePlace(dt){
  if(!GAME.started||GAME.modalOpen)return;
  const p=player.group.position;GAME.placeSince+=dt;if(GAME.placeSince<.4)return;GAME.placeSince=0;
  const place=getPlace(p.x,p.z);const now=performance.now();
  if(place.id!==GAME.currentPlace){GAME.currentPlace=place.id;if(place.id!==GAME.lastBanner&&now>(GAME.bannerHideAt||0)+800){GAME.lastBanner=place.id;GAME.discovered.add(place.id);showBanner(place.name,place.desc);}}
}

const Move={speed:0,steer:0,yaw:Math.PI,bob:0,bridgeY:0,blockedUntil:0};

function pointOnBridge(x,z){
  let closest=Infinity,height=null;
  for(const b of bridgeZones){const pts=b.points;
    for(let i=0;i<pts.length-1;i++){const[x1,z1]=pts[i],[x2,z2]=pts[i+1];const vx=x2-x1,vz=z2-z1,l2=vx*vx+vz*vz||1,along=((x-x1)*vx+(z-z1)*vz)/l2;
      if(b.squareEnds&&(along<0||along>1))continue;const t=clamp(along,0,1);const px=x1+vx*t,pz=z1+vz*t;const distance=Math.hypot(x-px,z-pz);
      if(distance<(b.halfWidth||1.9)-.1&&distance<closest){closest=distance;height=b.heights?lerp(b.heights[i],b.heights[i+1],t):(b.y??.36);}}}
  return height;
}

function inPolygon(x,z,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const[ax,az]=points[i],[bx,bz]=points[j];if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;}return inside;}
function isLand(x,z){return landZones.some(l=>x>=l.x0&&x<=l.x1&&z>=l.z0&&z<=l.z1);}
function isWaterPoint(x,z){for(const w of waterZones){if(x>=w.x0&&x<=w.x1&&z>=w.z0&&z<=w.z1&&inPolygon(x,z,w.points))return true;}for(const r of waterRects)if(x>r.minX&&x<r.maxX&&z>r.minZ&&z<r.maxZ)return true;return false;}
function canStandAt(x,z){if(pointOnBridge(x,z)!==null||isLand(x,z))return true;return !isWaterPoint(x,z);}

function groundHeightAt(x,z){
  let height=pointOnBridge(x,z)??(isLand(x,z)?.18:0);
  if(Math.abs(x)<13&&Math.abs(z)<390)height=Math.max(height,.015+.055*(1-(x/13)**2),Math.abs(x)<3.8?.075:0);
  const patches=groundPatchGrid.size?groundPatchGrid.get(Math.floor(x/CELL)+','+Math.floor(z/CELL))||[]:groundPatches;
  for(const patch of patches)if(x>=patch.x0&&x<=patch.x1&&z>=patch.z0&&z<=patch.z1)height=Math.max(height,patch.height);
  return height;
}

function updateMovement(dt) {
  if(Explore.film)return;
  const a=axes();const boosting=(Input.keys.ShiftLeft||Input.keys.ShiftRight||Input.keys.Space||Input.touchBoost)&&a.throttle>.1;
  GAME.boosted=boosting;
  if(Explore.mode==='fly'){Explore.updateFlight(dt,a,boosting);UI.speedValue.textContent=String(Math.round(Math.abs(Move.speed)*3.6));UI.speedCard.classList.toggle('boost',boosting);UI.boostBtn.classList.toggle('held',boosting||Input.touchBoost);UI.interact.classList.remove('visible');GAME.nearPoem=-1;return;}
  const maxF=Explore.mode==='walk'?(boosting?8:4.5):boosting?BOOST_SPEED:MAX_SPEED;
  let target=0;if(a.throttle>.03)target=maxF*a.throttle;else if(a.throttle<-.03)target=-REVERSE_SPEED*Math.abs(a.throttle);
  if(target!==0){const delta=target-Move.speed;const rate=(target*Move.speed<0||Math.abs(target)<Math.abs(Move.speed))?11.5:5.6+(boosting?3.4:0);Move.speed+=Math.sign(delta)*Math.min(Math.abs(delta),rate*dt);}
  else{const decel=4.2*dt;if(Move.speed>0)Move.speed=Math.max(0,Move.speed-decel);else Move.speed=Math.min(0,Move.speed+decel);}
  const speedFac=clamp(Math.abs(Move.speed)/4.2,0,1);const steerRate=1.85*(.42+speedFac*.58)*(Move.speed<-.15?-1:1);
  Move.steer=damp(Move.steer,a.steer,8,dt);Move.yaw+=Move.steer*steerRate*dt*(Math.abs(Move.speed)>.15?1:.25);
  const oldX=player.group.position.x,oldZ=player.group.position.z;
  const nx=clamp(oldX+Math.sin(Move.yaw)*Move.speed*dt,WORLD.x0+2,WORLD.x1-2);
  const nz=clamp(oldZ+Math.cos(Move.yaw)*Move.speed*dt,WORLD.z0+2,WORLD.z1-2);
  const stepUp=groundHeightAt(nx,nz)-groundHeightAt(oldX,oldZ);
  if(canStandAt(nx,nz)&&stepUp<=.7){player.group.position.x=nx;player.group.position.z=nz;}
  else{Move.speed*=-.08;if(performance.now()-GAME.lastWaterToast>2600){GAME.lastWaterToast=performance.now();toast(stepUp>.7?'台基较高，请从正面台阶慢行':'水光潋滟，还是从桥上过吧',1900);}}
  const beforeX=player.group.position.x,beforeZ=player.group.position.z;
  if(resolveCollisions(player.group.position,1.05)){Move.speed*=.55;if(Math.hypot(player.group.position.x-beforeX,player.group.position.z-beforeZ)>.6)GAME.blockedUntil=performance.now()+350;}
  if(!canStandAt(player.group.position.x,player.group.position.z)){player.group.position.x=oldX;player.group.position.z=oldZ;Move.speed=0;}
  const groundY=groundHeightAt(player.group.position.x,player.group.position.z);
  player.group.position.y=damp(player.group.position.y,groundY,12,dt);player.group.rotation.y=Move.yaw;player.group.rotation.z=damp(player.group.rotation.z,-Move.steer*clamp(Math.abs(Move.speed)/9,0,1)*.105,9,dt);
  player.yaw=Move.yaw;player.update(dt,Move.speed,Move.steer,boosting,Explore.mode);
  if(Explore.safeGround(player.group.position.x,player.group.position.z))Explore.lastSafe.copy(player.group.position);
  UI.speedValue.textContent=String(Math.round(Math.abs(Move.speed)*3.6));UI.speedCard.classList.toggle('boost',boosting);UI.boostBtn.classList.toggle('held',boosting||Input.touchBoost);
  const idx=nearestPoem();UI.interact.classList.toggle('visible',idx>=0&&!GAME.modalOpen);GAME.nearPoem=idx;
}

const MapView={
  bounds:{x0:WORLD.x0,x1:WORLD.x1,z0:WORLD.z0,z1:WORLD.z1},scale:1,ox:0,oy:0,
  setup(){const c=UI.minimap;const s=Math.min(c.width/(this.bounds.x1-this.bounds.x0),c.height/(this.bounds.z1-this.bounds.z0));this.scale=s*.94;this.ox=c.width/2-(this.bounds.x0+this.bounds.x1)/2*this.scale;this.oy=c.height/2-(this.bounds.z0+this.bounds.z1)/2*this.scale;},
  x(x){return this.ox+x*this.scale;},y(z){return this.oy+z*this.scale;},
  draw(playerPos,yaw){
    const c=UI.minimap,ctx=c.getContext('2d');if(!ctx)return;if(!this.scale)this.setup();
    const W=c.width,H=c.height;ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#bfe8cf');bg.addColorStop(1,'#e8e0b7');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,244,208,.55)';ctx.fillRect(this.x(CITY.x0),this.y(CITY.z0),(CITY.x1-CITY.x0)*this.scale,(CITY.z1-CITY.z0)*this.scale);
    ctx.fillStyle='#3fbfc0';
    for(const w of waterZones){ctx.beginPath();w.points.forEach(([x,z],i)=>{if(i)ctx.lineTo(this.x(x),this.y(z));else ctx.moveTo(this.x(x),this.y(z));});ctx.closePath();ctx.fill();}
    for(const r of waterRects){ctx.fillRect(this.x(r.minX),this.y(r.minZ),(r.maxX-r.minX)*this.scale,(r.maxZ-r.minZ)*this.scale);}
    for(const w of wards){ctx.fillStyle=w.type==='market'?'#e8a84d':'#e8d9b8';ctx.fillRect(this.x(w.x-w.w/2),this.y(w.z-w.d/2),Math.max(1,w.w*this.scale),Math.max(1,w.d*this.scale));}
    for(const m of marketDefs){ctx.fillStyle='rgba(220,125,52,.9)';ctx.fillRect(this.x(m.x-m.w/2),this.y(m.z-m.d/2),m.w*this.scale,m.d*this.scale);}
    ctx.strokeStyle='rgba(255,250,230,.94)';
    for(const r of roads){ctx.lineWidth=Math.max(.7,(r.axis==='z'?r.w:r.d)*this.scale*.72);ctx.beginPath();if(r.axis==='z'){ctx.moveTo(this.x(r.x),this.y(-380));ctx.lineTo(this.x(r.x),this.y(380));}else{ctx.moveTo(this.x(-450),this.y(r.z));ctx.lineTo(this.x(450),this.y(r.z));}ctx.stroke();}
    ctx.strokeStyle='#a97c52';ctx.lineWidth=1.6;ctx.strokeRect(this.x(CITY.x0),this.y(CITY.z0),(CITY.x1-CITY.x0)*this.scale,(CITY.z1-CITY.z0)*this.scale);
    for(const l of landmarks){const x=this.x(l.x),y=this.y(l.z);ctx.fillStyle='#c94a3d';ctx.beginPath();ctx.arc(x,y,l.id==='qujiang'?3:2.2,0,TAU);ctx.fill();if(['大明宫','太极宫','兴庆宫','大雁塔','曲江池','西市','东市','明德门'].includes(l.name)){ctx.fillStyle='rgba(72,54,35,.82)';ctx.font='600 8px "KaiTi",serif';ctx.textAlign='center';ctx.fillText(l.name,x,y-5);}}
    poems.forEach(p=>{if(p.taken)return;const x=this.x(p.x),y=this.y(p.z);ctx.fillStyle='rgba(255,211,90,.22)';ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();ctx.fillStyle='#f1b932';ctx.beginPath();ctx.arc(x,y,2.3,0,TAU);ctx.fill();});
    const px=this.x(playerPos.x),py=this.y(playerPos.z);ctx.save();ctx.translate(px,py);ctx.rotate(-yaw+Math.PI);ctx.fillStyle='#fff8db';ctx.strokeStyle='#b23e31';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-7.2);ctx.lineTo(5,5.3);ctx.lineTo(0,3.2);ctx.lineTo(-5,5.3);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    ctx.fillStyle='rgba(94,55,38,.68)';ctx.font='700 10px "KaiTi",serif';ctx.textAlign='center';ctx.fillText('北',W-13,14);
  },
};

function animate(now) {
  requestAnimationFrame(animate);
  const dt=Math.min(.05,Math.max(.001,(now-GAME.lastFrame)/1000));GAME.lastFrame=now;GAME.time+=dt;const t=GAME.time;
  if(GAME.ready){
    if(!GAME.started){
      const p=player.group.position,a=player.yaw+.35+Math.sin(t*.08)*.15,r=8.8+Math.sin(t*.12)*.3;
      const anchor=new THREE.Vector3(p.x,p.y+1.8,p.z);
      const frameOffset=innerWidth>innerHeight?4.3:0;
      const look=Cam.clearPosition(anchor,new THREE.Vector3(p.x-frameOffset*Math.cos(a),p.y+1.55,p.z+frameOffset*Math.sin(a)));
      const desired=new THREE.Vector3(p.x+Math.sin(a)*r,p.y+3.1+Math.sin(t*.12)*.1,p.z+Math.cos(a)*r);
      camera.position.copy(Cam.resolvePosition(look,desired));camera.lookAt(look);camera.fov=48;camera.updateProjectionMatrix();
      player.update(dt,0,0,false,Explore.mode);
      updateNPCs(dt,t,player.group.position);updateBoats(dt,t);updateNature(dt,t);
    } else {
      if(!GAME.modalOpen)updateMovement(dt);else{UI.speedValue.textContent='0';player.update(dt,0,0,false,Explore.mode);}
      if(Explore.film)Explore.updateFilm(dt);else Cam.update(dt,player);
      updateNPCs(dt,t,player.group.position);updateBoats(dt,t);updateNature(dt,t);updatePlace(dt);updateDayNight(dt);
      if(!Explore.film){sun.target.position.set(player.group.position.x,0,player.group.position.z);sun.position.set(player.group.position.x+125,105,player.group.position.z+75);}
      GAME.mapAge+=dt;
      if(GAME.mapAge>.18&&UI.minimap){GAME.mapAge=0;MapView.draw(player.group.position,Move.yaw);if(UI.mapHint)UI.mapHint.textContent=`诗笺 ${GAME.poemsFound.size} / ${poems.length}`;}
      if(GAME.bannerHideAt&&performance.now()>GAME.bannerHideAt){UI.banner.classList.remove('show');GAME.bannerHideAt=0;}
    }
    waterUniforms.time.value=t;WorldAssets.update(dt);poemAnimate(t);updateLanternFlicker(t);
    sky.position.copy(camera.position);stars.position.copy(camera.position);skyUniforms.time.value=t;
  }
  Session.tick();WaterSurface.update(dt,GAME.nightT);CityBotany.setFocus(GAME.started&&!Explore.film?player.group.position:null);GameRendering.render(dt);
}

function poemAnimate(t){poems.forEach((p,i)=>{if(p.taken||!p.group.visible)return;p.group.position.y=1.25+Math.sin(t*1.8+p.phase)*.15;p.group.rotation.y=t*.85+p.phase;const glow=p.group.children[p.group.children.length-1];if(glow&&glow.isSprite){const s=2.35+Math.sin(t*2.1+i)*.3;glow.scale.set(s,s,1);}});}
function updateLanternFlicker(t){if(MAT.lantern)MAT.lantern.emissiveIntensity+=Math.sin(t*1.7)*.00035;}

let player=null;

async function buildWorld() {
  installMaterials();SurfaceLibrary.architecture();
  const stages=[
    ['铺开长安的街巷…',()=>{buildGround();buildRoads();}],
    ['筑起一百零八坊…',()=>buildWards()],
    ['点起东西市的烟火…',()=>{buildMarket(-258,-14,140,108,'西市',false);buildMarket(174,-14,140,108,'东市',true);}],
    ['合拢外郭城墙…',()=>addCityWalls()],
    ['描画宫阙飞檐…',()=>{buildImperialCity();buildDamingPalace();}],
    ['种下兴庆宫的牡丹…',()=>{buildXingqing();buildPagodas();}],
    ['引一泓曲江春水…',()=>{buildQujiang();buildOutskirts();clipRoadsForWater();}],
    ['唤来商贾、行人和画舫…',()=>{buildStreetLife();spawnWorldLife();}],
    ['雕琢斗拱、阁楼与石栏…',()=>buildArchitecturalDetails()],
    ['把所有飞檐装进一台木车…',()=>{Object.values(B).forEach(b=>b?.build?.());wardSigns.build();shopSigns.build();}],
  ];
  for(let i=0;i<stages.length;i++){bootStatus(stages[i][0]);await nextFrame();stages[i][1]();}
  bootStatus('陈设陶器、藤篮与市井器物…');
  WorldAssets.populate().then(assets=>{if(assets.failures.length)console.warn('[Assets] '+assets.failures.length+' 个本地素材未能载入（不影响启动）：'+assets.failures.map(f=>f.id).join('、'));}).catch(err=>console.warn('[Assets] 素材加载失败:',err));
  buildColliderHash();Explore.buildRoofGrid();
  bootStatus('小青龙正在试车铃…');await nextFrame();
  player=createDragonBike();player.group.position.set(0,groundHeightAt(0,352),352);player.group.rotation.y=Math.PI;player.yaw=Math.PI;
  LegacySkinning.prepareScene(player.group);scene.add(player.group);Move.yaw=Math.PI;
  loadCollectedPoems();restorePoems();Session.restore();MapView.setup();MapView.draw(player.group.position,Move.yaw);updateDayNight(.016);
  GameRendering.refreshScene();
  GAME.ready=true;
  if(UI.boot)UI.boot.classList.add('hidden');if(UI.start)UI.start.classList.remove('hidden');
  if(UI.soundBtn)UI.soundBtn.classList.toggle('active',Sound.enabled);
  if(UI.startControls){UI.startControls.innerHTML=isTouch?'<span><span class="keycap">左</span>摇杆漫游</span><span><span class="keycap">下</span>步行 / 骑行 / 飞行</span><span><span class="keycap">拖</span>环视与缩放</span>':'<span><span class="keycap">WASD</span>漫游</span><span><span class="keycap">1/2/3</span>移动方式</span><span><span class="keycap">C</span>换镜头</span><span><span class="keycap">P</span>赏景</span>';}
  // enhance 模块在 GAME.ready 后直接动态加载
  const enhanceScripts=['src/enhance/performance.js','src/enhance/landmarks.js','src/enhance/vegetation.js','src/enhance/water.js','src/enhance/night-light.js','src/enhance/outside.js'];
  for(const src of enhanceScripts){const s=document.createElement('script');s.src=src;s.onerror=()=>console.warn('[Boot] enhance 模块加载失败: '+src);document.head.appendChild(s);}
  // v7: GAME.ready后后台预编译材质——利用用户看开始界面的几秒，startGame()里compile()就近瞬时
  requestIdleCallback?.(()=>{try{renderer.compile(scene,camera);GAME.preCompiled=true;}catch(_){}},{timeout:4000});
}

async function startGame() {
  if(!GAME.ready||GAME.started)return;GAME.started=true;
  if(UI.startBtn){UI.startBtn.disabled=true;UI.startBtn.textContent='正在进入长安城…';}
  await nextFrame();await nextFrame();
  try{GameRendering.upgradeToFullQuality();GameRendering.setQuality(params.get('quality')||Session.preferences.quality||'auto');}catch(e){console.warn('[Rendering] 升级质量失败:',e);}
  // v7: 如果后台已预编译则跳过，否则立即编译
  if(!GAME.preCompiled){try{renderer.compile(scene,camera);}catch(_){}}
  const openingPlace=getPlace(player.group.position.x,player.group.position.z);
  GAME.currentPlace=openingPlace.id;GAME.placeSince=-1.8;GAME.lastBanner=openingPlace.id;GAME.discovered.add(openingPlace.id);
  if(UI.start){UI.start.classList.add('leaving');setTimeout(()=>{UI.start.classList.add('hidden');UI.start.classList.remove('leaving');},480);}
  if(UI.hud)UI.hud.classList.remove('hidden');UI.speedValue.textContent='0';
  if(UI.cameraLabel)UI.cameraLabel.textContent=Cam.modes[Cam.mode].label;
  Cam.update(.016,player,true);ensureAudio();Sound.scheduleAmbient();Sound.chime();player.ring();
  setTimeout(()=>{if(!GAME.started)return;showBanner(Session.hasResume?openingPlace.name:'明德门 · 朱雀大街',Session.hasResume?openingPlace.desc:'走入市井，骑过春风，或乘云看尽万家。',3000);toast('随时切换步行、骑行、飞行，或打开「赏景」',3000);},650);
}

async function boot() {
  try{
    bootStatus('正在准备笔墨纸砚…');
    bindUI();bindKeyboard();bindJoystick();bindViewGestures();Explore.init();
    renderer.setSize(innerWidth,innerHeight);
    GameRendering.init({renderer,scene,camera,quality:'low',fastStart:true,exposure:1.06,environmentIntensity:.48});
    const qualitySelect=$('#qualitySelect');qualitySelect.value=GameRendering.getDiagnostics().requestedQuality;
    qualitySelect.addEventListener('change',()=>{GameRendering.setQuality(qualitySelect.value);Session.save();});
    window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,MAX_DPR));GameRendering.resize(innerWidth,innerHeight,renderer.getPixelRatio());});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(Sound.ambientTimer);else Sound.scheduleAmbient();});
    await new Promise(requestAnimationFrame);await buildWorld();requestAnimationFrame(animate);
  }catch(err){console.error(err);window.__showFatal?.(err?.stack||String(err));bootStatus('城门没有打开：'+(err?.message||err));}
}

window.__changan={
  scene,renderer,camera,poems,landmarks,wards,
  get player(){return player;},get state(){return GAME;},get speed(){return Move.speed;},
  get drawCalls(){return renderer.info.render.calls;},get rendering(){return GameRendering.getDiagnostics();},get exploration(){return Explore;},
  start:startGame,
  teleport(x,z,yaw=Math.PI){if(!player)return;player.group.position.set(x,0,z);Explore.resetInput();Move.yaw=player.yaw=yaw;player.group.rotation.set(0,yaw,0);Cam.update(.016,player,true);},
  setNight(on){GAME.nightTarget=on?1:0;GAME.nightT=on?1:0;updateDayNight(.016);},
  rebuild(){Object.values(B).forEach(b=>b?.build?.());Explore.buildRoofGrid();if(typeof buildColliderHash==='function')buildColliderHash();if(typeof GameRendering!=='undefined'&&typeof GameRendering.refreshScene==='function')GameRendering.refreshScene();return'batches + colliderGrid + roofGrid + rendering rebuilt';},
};

boot();