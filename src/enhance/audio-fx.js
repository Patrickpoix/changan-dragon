/* ============================================================
   音效音乐增强 — 盛唐长安声景
   v1: 背景音乐、环境音效、交互音效
   ============================================================ */

(function() {
  'use strict';
  
  let audioContext = null;
  let bgmPlaying = false;
  
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    
    console.log(['Audio] 开始增强音效音乐效果...']);
    
    initAudioContext();
    startBGM();
    addAmbientSounds();
    addInteractionSounds();
    
    console.log('[Audio] ✓ 音效音乐效果增强完成');
  }
  
  // 初始化音频上下文
  function initAudioContext() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[Audio] 音频上下文初始化成功');
    } catch(e) {
      console.warn('[Audio] 音频上下文初始化失败', e);
    }
  }
  
  // 背景音乐
  function startBGM() {
    if (!audioContext || bgmPlaying) return;
    
    // 简单的五声音阶循环
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C D E G A
    let noteIndex = 0;
    
    setInterval(() => {
      if (!bgmPlaying) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = notes[noteIndex];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
      
      noteIndex = (noteIndex + 1) % notes.length;
    }, 800);
    
    bgmPlaying = true;
    console.log('[Audio] 背景音乐开始播放');
  }
  
  // 环境音效
  function addAmbientSounds() {
    // 鸟鸣声
    setInterval(() => {
      if (Math.random() > 0.7) {
        playBirdSound();
      }
    }, 3000);
    
    // 风声
    // 水流声
  }
  
  // 交互音效
  function addInteractionSounds() {
    // 点击音效
    document.addEventListener('click', () => {
      playClickSound();
    });
    
    // 拾取音效
    // 开门音效
  }
  
  // 工具函数
  function playBirdSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(4000, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }
  
  function playClickSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  init();
})();
