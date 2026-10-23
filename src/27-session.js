/* Local exploration session. Storage denial never prevents entering the city. */
const Session = (() => {
  const key = 'changan-dragon-session-v1';
  let saved = null, lastSaved = 0, resumed = false;
  try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
  if (!saved || saved.version !== 1 || typeof saved !== 'object') saved = null;
  const preferences = saved?.preferences || {};
  return {
    preferences,
    get hasResume() { return resumed; },
    restore() {
      Sound.enabled = preferences.sound !== false;
      UI.soundBtn.textContent = Sound.enabled ? '声' : '静';
      UI.soundBtn.classList.toggle('active', Sound.enabled);
      GAME.nightTarget = preferences.night ? 1 : 0;
      GAME.nightT = GAME.nightTarget;
      UI.nightBtn.textContent = GAME.nightTarget ? '☀' : '☾';
      UI.nightBtn.classList.toggle('active', !!GAME.nightTarget);
      if (!saved || !Array.isArray(saved.position) || saved.position.length !== 3 || !saved.position.every(Number.isFinite)) return;
      const [x, y, z] = saved.position;
      if (x < WORLD.x0 + 2 || x > WORLD.x1 - 2 || z < WORLD.z0 + 2 || z > WORLD.z1 - 2) return;
      const flying = saved.mode === 'fly';
      const ground = flying ? null : Explore.landing(x, z, 14);
      if (!flying && !ground) return;
      Explore.mode = flying ? 'fly' : saved.mode === 'walk' ? 'walk' : 'bike';
      player.group.position.copy(flying ? new THREE.Vector3(x, clamp(y, Explore.roofAt(x, z) + 4, 145), z) : ground);
      Explore.altitude = player.group.position.y;
      Move.yaw = Number.isFinite(saved.yaw) ? saved.yaw : Math.PI;
      player.yaw = Move.yaw; player.group.rotation.set(0, Move.yaw, 0);
      player.bike.group.visible = Explore.mode === 'bike';
      Cam.mode = Number.isInteger(saved.camera) ? clamp(saved.camera, 0, 3) : 0;
      Cam.zoom = Number.isFinite(saved.zoom) ? clamp(saved.zoom, 0.65, 1.9) : 1;
      Explore.refresh();
      resumed = true;
      UI.startBtn.textContent = '继续游城';
    },
    save() {
      if (!GAME.ready || !GAME.started || !player) return;
      const preferences = { sound: Sound.enabled, night: GAME.nightTarget > 0.5, quality: GameRendering.getDiagnostics().requestedQuality };
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, position: player.group.position.toArray(),
          yaw: Move.yaw, mode: Explore.mode, camera: Cam.mode, zoom: Cam.zoom, preferences }));
      } catch (_) {}
      lastSaved = GAME.time;
    },
    tick() { if (GAME.time - lastSaved > 8) this.save(); },
  };
})();
window.addEventListener('pagehide', () => Session.save());
document.addEventListener('visibilitychange', () => { if (document.hidden) Session.save(); });
