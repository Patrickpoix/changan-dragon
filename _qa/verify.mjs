import fs from 'node:fs';

const PORT = process.env.CDP_PORT || '9226';
const MOBILE = process.env.MOBILE === '1';
const PREFIX = process.env.PREFIX || 'verify';
const OUT_DIR = '_qa/shots';
fs.mkdirSync(OUT_DIR, { recursive: true });
const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = pages.find(p => p.type === 'page' && p.url.includes('changan-dragon'));
if (!page) throw new Error('page missing');

const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = [];
ws.onmessage = ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id) {
    const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); }
  } else events.push(msg);
};
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async name => {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(r.data, 'base64'));
};

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
try { await send('Page.bringToFront'); } catch (_) {}
if (MOBILE) {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}
await send('Page.reload', { ignoreCache: true });
for (let i = 0; i < 70; i++) {
  await sleep(500);
  try { if (await evaluate(`!!(window.__changan && window.__changan.state.ready)`)) break; } catch (_) {}
}
await sleep(1200);

const out = { viewport: await evaluate(`[innerWidth, innerHeight]`) };
out.boot = await evaluate(`(() => ({ ready: __changan.state.ready, fatal: !document.getElementById('errorOverlay').classList.contains('hidden'), startVisible: !document.getElementById('startScreen').classList.contains('hidden'), calls: __changan.drawCalls, children: __changan.scene.children.length }))()`);
await shot(PREFIX + '-start');

await evaluate(`document.getElementById('startBtn').click(); true`);
await sleep(1200);
out.started = await evaluate(`(() => ({ started: __changan.state.started, hud: !document.getElementById('hud').classList.contains('hidden'), startHidden: document.getElementById('startScreen').classList.contains('hidden'), speed: __changan.speed }))()`);
await sleep(3200);
out.idle = await evaluate(`(() => ({ calls: __changan.drawCalls, pos: __changan.player.group.position.toArray(), banner: document.getElementById('discoverName').textContent, bannerVisible: document.getElementById('discoverBanner').classList.contains('show') }))()`);
await shot(PREFIX + '-game');

// 相机四档
const cameras = [];
for (let i = 0; i < 4; i++) {
  await evaluate(`document.getElementById('cameraBtn').click(); true`);
  await sleep(500);
  cameras.push(await evaluate(`document.getElementById('cameraLabel').textContent`));
}
out.cameras = cameras;

// 诗笺：直接落到曲江池追加诗笺坐标（27c-extra-poems-2 为准），等待靠近检测后拾取
await evaluate(`(() => { const p = __changan.player.group.position; const gh = __changan.exploration.groundHeight(398, 346); p.set(398, Math.max(gh, 0.5), 346); return true; })()`);
await sleep(1600);
out.poemBefore = await evaluate(`(() => ({ near: __changan.state.nearPoem, interact: document.getElementById('interactBtn').classList.contains('visible'), count: __changan.state.poemsFound.size }))()`);
await evaluate(`document.getElementById('interactBtn').click(); true`);
await sleep(800);
out.poemAfter = await evaluate(`(() => ({ count: __changan.state.poemsFound.size, modal: !document.getElementById('modalLayer').classList.contains('hidden'), poemOpen: !document.getElementById('poemPanel').classList.contains('hidden'), title: document.getElementById('poemTitle').textContent, counter: document.getElementById('poemCount').textContent, stored: localStorage.getItem('changan-dragon-poems-v1') }))()`);
await shot(PREFIX + '-poem');
await evaluate(`document.querySelector('#poemPanel [data-close]').click(); true`);
await sleep(300);

// 诗囊
await evaluate(`document.getElementById('albumBtn').click(); true`);
await sleep(500);
out.collection = await evaluate(`(() => ({ open: !document.getElementById('collectionPanel').classList.contains('hidden'), rows: document.querySelectorAll('#collectionList .collection-item').length, unlocked: document.querySelectorAll('#collectionList .collection-item:not(.locked)').length }))()`);
await shot(PREFIX + '-collection');
await evaluate(`document.querySelector('#collectionPanel [data-close]').click(); true`);

// 昼夜
await evaluate(`document.getElementById('nightBtn').click(); true`);
await sleep(2800);
out.night = await evaluate(`(() => ({ target: __changan.state.nightTarget, value: __changan.state.nightT, sun: __changan.scene.children.find(o => o.isDirectionalLight)?.intensity, stars: __changan.scene.children.find(o => o.isPoints && o.material?.size === 2.2)?.material.opacity, button: document.getElementById('nightBtn').textContent }))()`);
await shot(PREFIX + '-night');

// 天气：按钮循环 晴→阴→雨，验证主循环驱动的雾/曝光/粒子
out.weather = {};
await evaluate(`document.getElementById('weatherBtn').click(); true`);
await sleep(2200);
out.weather.cloudy = await evaluate(`(() => ({ current: window.__weather.current, target: window.__weather.target, t: Math.round(window.__weather.t * 100) / 100, fogNear: Math.round(__changan.scene.fog.near * 100) / 100, particles: !!window.__weather.particles && window.__weather.particles.children === undefined }))()`);
await evaluate(`document.getElementById('weatherBtn').click(); true`);
await sleep(2200);
out.weather.rain = await evaluate(`(() => ({ current: window.__weather.current, target: window.__weather.target, t: Math.round(window.__weather.t * 100) / 100, fogNear: Math.round(__changan.scene.fog.near * 100) / 100, rainVisible: window.__weather.particles.visible }))()`);
await shot(PREFIX + '-weather-rain');
await evaluate(`document.getElementById('weatherBtn').click(); true`);
await sleep(2200);
out.weather.sunny = await evaluate(`(() => ({ current: window.__weather.current, target: window.__weather.target, rainVisible: window.__weather.particles.visible }))()`);

// 水域 / 桥 / 陆地碰撞判定
out.collision = await evaluate(`(() => ({ water: canStandAt(320, 300), island: canStandAt(354, 318), bridge: canStandAt(299, 339), river: canStandAt(-300, 470), plaza: canStandAt(0, 220) }))()`);

// 实际键盘骑行（无头浏览器帧率低，只验证方向与速度变化）
await evaluate(`document.getElementById('nightBtn').click(); true`);
await evaluate(`(() => { const p = __changan.player.group.position; const gh = __changan.exploration.groundHeight(0, 300); p.set(0, Math.max(gh, 0.5), 300); return true; })()`);
await sleep(500);
await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyW', key: 'w', windowsVirtualKeyCode: 87, nativeVirtualKeyCode: 87 });
await sleep(2600);
await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyW', key: 'w', windowsVirtualKeyCode: 87, nativeVirtualKeyCode: 87 });
await sleep(300);
out.ride = await evaluate(`(() => ({ pos: __changan.player.group.position.toArray(), speedText: document.getElementById('speedValue').textContent }))()`);

out.layout = await evaluate(`(() => ({ overflowX: document.documentElement.scrollWidth > innerWidth, overflowY: document.documentElement.scrollHeight > innerHeight, startPanel: (() => { const r = document.querySelector('.start-panel').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })(), map: (() => { const c = document.getElementById('minimap'); return [c.width, c.height]; })() }))()`);
out.webgl = await evaluate(`(() => { const gl=document.getElementById('scene').getContext('webgl2') || document.getElementById('scene').getContext('webgl'); return gl ? { version: gl.getParameter(gl.VERSION), renderer: gl.getParameter(gl.RENDERER) } : null; })()`);

const issues = events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Log.entryAdded' && ['error', 'warning'].includes(e.params?.entry?.level)));
out.issues = [...new Map(issues.map(e => [e.params?.entry?.text || e.params?.exceptionDetails?.text, e.params?.entry?.text || e.params?.exceptionDetails?.text])).values()];
console.log(JSON.stringify(out, null, 2));
fs.writeFileSync(`_qa/${PREFIX}.json`, JSON.stringify(out, null, 2));
ws.close();
