/* ============================================================
   初始化保障 · 统一生命周期调度器（v3 动态注册支持）
   enhance模块通过 __enhance.register() 注册初始化任务，
   由本调度器在 GAME.ready 后按优先级分帧执行（RAF，非固定延迟）。
   v3：支持动态注册 —— start() 后新注册的任务也会被分帧执行。
       原因：boot.js v3 把 enhance 模块移出首屏加载清单，
       改为 buildWorld() 完成后动态加载，因此调度器必须支持运行时注册。
   v2：500ms×8=4s 固定串行延迟 → requestAnimationFrame 分帧。
   ============================================================ */

(function() {
  'use strict';

  // 统一注册表（全局唯一入口）
  const registry = {
    queue: [],
    started: false,
    _pendingDynamic: false,
    register(owner, fn, priority) {
      this.queue.push({ owner: owner || 'anonymous', fn, priority: priority || 100 });
      // v3：如果已经开始执行，标记有待处理的动态任务
      // step() 会在完成当前批次后检查此标志并继续执行
      if (this.started) this._pendingDynamic = true;
    },
    start() {
      if (this.started) return;
      this.started = true;
      this.queue.sort((a, b) => a.priority - b.priority);
      let i = 0;
      const done = [];
      const step = () => {
        if (i >= this.queue.length) {
          // v3：检查是否有动态注册的新任务
          if (this._pendingDynamic) {
            this._pendingDynamic = false;
            // 重新排序新任务（按优先级）
            this.queue.sort((a, b) => a.priority - b.priority);
            requestAnimationFrame(step);
            return;
          }
          console.log('[SafeInit] 增强模块生命周期完成: ' + done.join(' → '));
          // 增强模块在批处理首次构建之后追加的物体（如城外行道树）不会自动
          // 进入已构建的实例网格；统一重建批处理实例并刷新碰撞哈希。
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
        // 分帧执行：每帧一个模块，避免同帧卡顿
        requestAnimationFrame(step);
      };
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
