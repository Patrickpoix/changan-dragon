/* ============================================================
   音频系统增强 v2.0
   环境音效、背景音乐、空间音频
   ============================================================ */

const AudioEnhancer = {
  
  audioContext: null,
  
  sounds: {},
  
  init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[Audio] 音频系统初始化成功');
    } catch (e) {
      console.warn('[Audio] 音频系统初始化失败:', e);
    }
  },
  
  createWindSound(duration = 2) {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return null;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.1;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    return source;
  },
  
  createRainSound(duration = 3) {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return null;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.08;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    return source;
  },
  
  createBirdChirp() {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.1);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
    
    return oscillator;
  },
  
  createBellSound(frequency = 200, duration = 3) {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return oscillator;
  },
  
  setListenerPosition(x, y, z) {
    if (!this.audioContext) return;
    
    const listener = this.audioContext.listener;
    if (listener.positionX) {
      listener.positionX.value = x;
      listener.positionY.value = y;
      listener.positionZ.value = z;
    }
  }
};

window.AudioEnhancer = AudioEnhancer;

console.log('[Audio] 音频系统增强模块加载完成');
