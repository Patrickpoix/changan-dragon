/* ============================================================
   初始化保障 · 统一生命周期调度器（v2 分帧调度）
   enhance模块通过 __enhance.register() 注册初始化任务，
   由本调度器在 GAME.ready 后按优先级分帧执行（RAF，非固定延迟），
   取代各模块独立的固定延迟setTimeout（避免场景逐段弹出、
   加载顺序混乱和系统状态不一致）。
   加载顺序注意：本文件在 enhance 模块之后加载，因此增强模块
   若在注册时发现 __enhance 尚不存在，会先写入 __enhancePending，
   本文件随后接管。
   v2：500ms×8=4s 固定串行延迟 → requestAnimationFrame 分帧，
       GAME.ready 后下一帧即开始，每帧一个模块，8 帧≈133ms 完成。
   ============================================================ */

(function() {
  'use strict';

  // 统一注册表（全局唯一入口）
  const registry = {
    queue: [],
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
          // 增强模块在批处理首次构建之后追加的物体（如城外行道树）不会自动
          // 进入已构建的实例网格；统一重建批处理实例并刷新碰撞哈希，
          // 保证“已登记即已渲染、已登记即已阻挡”，消除隐形碰撞与飞行穿模。
          try {
            if (typeof window !== 'undefined' && window.__changan && typeof window.__changan.rebuild === 'function') {
              window.__changan.rebuild();
              console.log('[SafeInit] ✓ 批处理增量重建完成（含增强模块新增物体）');
            }
          } catch (err) {
            console.warn('[SafeInit] 批处理增量重建失败:', err);
          }
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
        // 分帧执行：每帧一个模块，避免同帧卡顿，同时消除固定延迟。
        // 原 500ms×8=4s 固定等待 → 现在 8 帧≈133ms 完成，场景平滑加载。
        requestAnimationFrame(step);
      };
      // GAME.ready 已在 buildWorld 末尾同步置位，下一帧即开始第一个模块。
      requestAnimationFrame(step);
    }
  };

  window.__enhance = registry;

  // 接管在 __enhance 定义之前已经注册的 pending 任务
  if (Array.isArray(window.__enhancePending)) {
    window.__enhancePending.forEach(t => registry.register(t.owner, t.fn, t.priority));
    window.__enhancePending = [];
  }

  // 等待 GAME.ready 后启动（GAME.ready 在 30-main.js buildWorld 末尾设置）。
  // 这是合理的就绪等待（不是固定延迟初始化）：buildWorld 是 async 阶段序列，
  // 完成前增强模块不应运行。检测间隔保持 100ms，就绪后立即进入 RAF 分帧。
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
