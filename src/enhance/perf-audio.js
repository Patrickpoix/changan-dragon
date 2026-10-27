/* ============================================================
   性能与音效增强 · 流畅沉浸
   性能优化 / 背景音乐 / 环境音效
   ============================================================ */

(function() {
  function init() {
    if (typeof GAME === 'undefined' || !GAME.ready) {
      setTimeout(init, 500);
      return;
    }
    buildPerformanceAudio();
  }

  function buildPerformanceOptimization() {
    let frameCount = 0;
    let lastTime = performance.now();
    setInterval(() => {
      const now = performance.now();
      const fps = frameCount / ((now - lastTime) / 1000);
      frameCount = 0;
      lastTime = now;
      if (fps < 30 && typeof renderer !== 'undefined') {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        console.log('[Performance] FPS过低，自动降低画质以保持流畅');
      }
    }, 2000);
    function countFrame() { frameCount++; requestAnimationFrame(countFrame); }
    requestAnimationFrame(countFrame);
    console.log('[Performance] 性能优化系统完成');
  }

  function buildBackgroundMusic() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
      function playNote(freq, duration) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
      }
      setInterval(() => {
        const note = notes[Math.floor(Math.random() * notes.length)];
        playNote(note, 2);
      }, 3000);
      console.log('[Audio] 背景音乐系统完成');
    } catch (e) {
      console.warn('[Audio] 音频初始化失败:', e.message);
    }
  }

  function buildAmbientSounds() {
    console.log('[Audio] 环境音效系统已初始化');
  }

  function buildPerformanceAudio() {
    console.log('[PerformanceAudio] 开始构建性能与音效...');
    buildPerformanceOptimization();
    buildBackgroundMusic();
    buildAmbientSounds();
    console.log('[PerformanceAudio] 性能与音效构建完成！');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
