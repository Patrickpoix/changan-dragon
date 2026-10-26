/* ============================================================
   程序化音频系统 · 国风环境音景
   Web Audio API合成五声音阶环境音
   ============================================================ */

class ProceduralAudioSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.started = false;
  },

  // 初始化音频上下文（需要用户交互后才能启动）
  init() {
    // 等待用户首次点击后启动
    const startAudio = () => {
      if (this.started) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.started = true;

      // 启动环境音景
      this.startAmbient();
      this.startPentatonic();

      console.log('[ProceduralAudioSystem] 音频系统已启动');
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
  },

  // 环境风声（噪声+滤波）
  startAmbient() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  },

  // 五声音阶环境旋律（宫商角徵羽）
  startPentatonic() {
    // 五声音阶频率（C大调五声：C D E G A）
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00];

    const playNote = () => {
      if (!this.started) return;

      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3);

      // 下一个音符随机延迟
      setTimeout(playNote, 2000 + Math.random() * 4000);
    };

    // 延迟启动第一个音符
    setTimeout(playNote, 1000);
  },

  // 寺庙钟声
  playBell() {
    if (!this.started) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 220;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 5);
  },

  init() {
    this.init();
    console.log('[ProceduralAudioSystem] 程序化音频系统已初始化（点击页面启动）');
  },
}

// 全局实例
let proceduralAudio = null;

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    proceduralAudio = new ProceduralAudioSystem();
    proceduralAudio.init();
  };
}
