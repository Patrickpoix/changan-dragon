import fs from 'node:fs';

const PORT = process.env.CDP_PORT || '9225';
const OUT = process.env.OUT || 'shot.png';
const START = process.env.START === '1';
const WAIT = Number(process.env.WAIT || 13000);

const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = pages.find(p => p.type === 'page' && p.url.includes('changan-dragon'));
if (!page) throw new Error('changan-dragon page not found');

const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = [];
ws.onmessage = ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id) {
    const p = pending.get(msg.id);
    if (p) {
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result);
    }
  } else events.push(msg);
};
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evalJS = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
  return r.result.value;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
if (process.env.MOBILE === '1') {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}
await send('Page.reload', { ignoreCache: true });
const deadline = Date.now() + Math.max(WAIT, 25000);
while (Date.now() < deadline) {
  await sleep(500);
  try {
    const ready = await evalJS(`!!(window.__changan && window.__changan.state.ready)`);
    if (ready) break;
  } catch (_) {}
}
await sleep(900);

if (START) {
  await evalJS(`document.getElementById('startBtn').click(); true`);
  await sleep(1500);
}

if (process.env.CAMERA) {
  const n = Number(process.env.CAMERA);
  for (let i = 0; i < n; i++) {
    await evalJS(`document.getElementById('cameraBtn').click(); true`);
    await sleep(250);
  }
  await sleep(900);
}
if (process.env.TELEPORT) {
  const [x, z, yaw] = process.env.TELEPORT.split(',').map(Number);
  await evalJS(`window.__changan.teleport(${x}, ${z}, ${Number.isFinite(yaw) ? yaw : Math.PI}); true`);
  await sleep(900);
}
if (process.env.NIGHT === '1') {
  await evalJS(`document.getElementById('nightBtn').click(); true`);
  await sleep(1800);
}
if (process.env.EVAL) {
  await evalJS(process.env.EVAL);
  await sleep(900);
}

const status = await evalJS(`(() => {
  const C = window.__changan;
  return {
    title: document.title,
    ready: !!(C && C.state.ready),
    started: !!(C && C.state.started),
    bootHidden: document.getElementById('bootScreen').classList.contains('hidden'),
    startVisible: !document.getElementById('startScreen').classList.contains('hidden'),
    fatal: !document.getElementById('errorOverlay').classList.contains('hidden'),
    fatalText: document.getElementById('errorText').textContent,
    calls: C && C.drawCalls,
    objects: C && C.scene.children.length,
    player: C && C.player && C.player.group.position.toArray(),
    poems: C && C.poems.length,
    speed: C && C.speed,
    size: [innerWidth, innerHeight],
    webgl: (() => { try { return !!document.getElementById('scene').getContext('webgl2'); } catch(e) { return String(e); } })()
  };
})()`);
console.log('STATUS ' + JSON.stringify(status));
const issueEvents = events.filter(e => ['Runtime.exceptionThrown', 'Runtime.consoleAPICalled', 'Log.entryAdded'].includes(e.method));
const uniqueEvents = [...new Map(issueEvents.map(e => {
  const text = e.params?.entry?.text || e.params?.args?.map(a => a.value || a.description).join(' ') || e.params?.exceptionDetails?.text || '';
  return [text, { method: e.method, type: e.params?.type, text }];
})).values()];
console.log('EVENTS ' + JSON.stringify(uniqueEvents, null, 2).slice(0, 12000));

if (START) {
  await evalJS(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); true`);
  await sleep(2600);
  await evalJS(`window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); true`);
  await sleep(400);
  const ride = await evalJS(`(() => { const C=window.__changan; return { pos:C.player.group.position.toArray(), speed:C.speed, calls:C.drawCalls, toast:document.getElementById('toast').textContent, banner:document.getElementById('discoverName').textContent }; })()`);
  console.log('RIDE ' + JSON.stringify(ride));
}

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
console.log('SHOT ' + OUT);
ws.close();
