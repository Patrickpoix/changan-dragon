/* ============================================================
   环境音景增强 · 长安昼夜环境声
   ============================================================ */

const AmbientSoundscape = {
  ctx: null,
  master: null,
  started: false,
  
  // 音程：宫调式（唐代雅乐）
  scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33],
  
  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.3;
    this.master.connect(this.ctx.destination);
    return true;
  },
  
  playNote(freq, duration, volume = 0.05, type = 'sine') {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.1);
  },
  
  playMelody(night = false) {
    if (!this.ctx || !this.master) return;
    
    // 随机选3-5个音符，组成五声音阶旋律
    const count = 3 + Math.floor(Math.random() * 3);
    let step = Math.floor(Math.random() * this.scale.length);
    
    for (let i = 0; i < count; i++) {
      const note = this.scale[step % this.scale.length];
      const dur = 1.5 + Math.random() * 2;
      const vol = night ? 0.03 : 0.045;
      
      setTimeout(() => this.playNote(note, dur, vol, 'sine'), i * 800);
      
      // 偶尔加一个五度和声
      if (Math.random() > 0.6) {
        const harmony = note * 1.5;
        setTimeout(() => this.playNote(harmony, dur * 0.8, vol * 0.5, 'triangle'), i * 800 + 200);
      }
      
      step += Math.random() > 0.5 ? 1 : -1;
      step = Math.max(0, Math.min(this.scale.length - 1, step));
    }
  },
  
  start() {
    if (this.started) return;
    if (!this.init()) return;
    this.started = true;
    
    const loop = () => {
      if (!GAME.started) return;
      this.playMelody(GAME.nightT > 0.5);
      setTimeout(loop, 4000 + Math.random() * 3000);
    };
    loop();
  },
};

// 游戏开始后启动环境音景
if (typeof startGame === 'function') {
  const origStart = startGame;
  startGame = function() {
    origStart();
    AmbientSoundscape.start();
  };
}
