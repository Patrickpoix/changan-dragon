/* ============================================================
   初始化保障 · 统一生命周期调度器
   enhance模块通过 __enhance.register() 注册初始化任务，
   由本调度器在 GAME.ready 后按优先级串行执行，
   取代各模块独立的固定延迟setTimeout（避免场景逐段弹出、
   加载顺序混乱和系统状态不一致）。
   加载顺序注意：本文件在 enhance 模块之后加载，因此增强模块
   若在注册时发现 __enhance 尚不存在，会先写入 __enhancePending，
   本文件随后接管。
   ============================================================ */

(function() {
  'use strict';

  // 统一注册表（全局唯一入口）
  const registry = {
    queue: [],
    running: false,
    started: false,
    register(owner, fn, priority) {
      this.queue.push({ owner: owner || 'anonymous', fn, priority: priority || 100 });
    },
    start() {
      if (this.started) return;
      this.started = true;
      this.queue.sort((a, b) => a.priority - b.priority);
      let i = 0;
      const done = [];
      const step = () => {
        if (i >= this.queue.length) {
          console.log('[SafeInit] 增强模块生命周期完成: ' + done.join(' → '));
          if (typeof GAME !== 'undefined') GAME.fullyReady = true;
          return;
        }
        const task = this.queue[i++];
        try {
          task.fn();
          done.push(task.owner);
          console.log('[SafeInit] ✓ ' + task.owner);
        } catch (err) {
          console.warn('[SafeInit] ✗ ' + task.owner + ' 初始化失败:', err);
          done.push(task.owner + '(失败)');
        }
        // 串行间隔：避免同一帧内全部初始化造成卡顿
        setTimeout(step, 500);
      };
      setTimeout(step, 300);
    }
  };

  window.__enhance = registry;

  // 接管在 __enhance 定义之前已经注册的 pending 任务
  if (Array.isArray(window.__enhancePending)) {
    window.__enhancePending.forEach(t => registry.register(t.owner, t.fn, t.priority));
    window.__enhancePending = [];
  }

  // 等待 GAME.ready 后启动（GAME.ready 在 30-main.js buildWorld 末尾设置）
  function waitReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      registry.start();
    } else {
      setTimeout(waitReady, 100);
    }
  }

  // 兜底：window load 后仍未就绪也检查一次
  window.addEventListener('load', () => setTimeout(waitReady, 50));
  waitReady();
})();