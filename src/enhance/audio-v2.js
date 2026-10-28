/* ============================================================
   音效音乐v2 — 盛唐雅乐
   v2: 古风音乐、环境音效、交互音效
   ============================================================ */

(function() {
  'use strict';
  
  let audioContext = null;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 8500);
      return;
    }
    
    console.log(['AudioV2] 开始增强音效音乐...']);
    
    // 用户交互后初始化音频
    document.addEventListener('click', initAudio, { once: true });
    
    addAmbientSounds();         // 环境音效
    addUISounds();               // UI音效
    
    console.log('[AudioV2] ✓ 音效音乐增强完成');
  }
  
  function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[AudioV2] 音频系统已初始化');
      playBackgroundMusic();
    } catch(e) {
      console.warn('[AudioV2] 音频初始化失败:', e);
    }
  }
  
  // 背景音乐 — 古风旋律
  function playBackgroundMusic() {
    if (!audioContext) return;
    
    console.log('[AudioV2] 播放背景音乐...');
    
    // 简单的五声音阶旋律
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C D E G A
    
    function playNote(freq, time, duration) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    }
    
    // 循环播放
    function playMelody() {
      if (!audioContext) return;
      
      const now = audioContext.currentTime;
      
      // 简单旋律
      for (let i = 0; i < 8; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        playNote(note, now + i * 0.5, 0.4);
      }
      
      setTimeout(playMelody, 4000);
    }
    
    playMelody();
  }
  
  // 环境音效
  function addAmbientSounds() {
    if (typeof scene === 'undefined') return;
    
    console.log('[AudioV2] 添加环境音效...');
    
    // 风声 — 用噪声模拟
    if (audioContext) {
      const bufferSize = audioContext.sampleRate * 2;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 0.3;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      const gain = audioContext.createGain();
      gain.gain.value = 0.1;
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      noise.start();
    }
    
    console.log('[AudioV2] 环境音效添加完成');
  }
  
  // UI音效
  function addUISounds() {
    if (typeof document === 'undefined') return;
    
    console.log('[AudioV2] 添加UI音效...');
    
    // 按钮点击音效
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' && audioContext) {
        playClickSound();
      }
    });
    
    console.log('[AudioV2] UI音效添加完成');
  }
  
  function playClickSound() {
    if (!audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
  }
  
  init();
})();
