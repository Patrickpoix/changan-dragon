/* ============================================================
   初始化保障 · 统一生命周期调度器（v4 错误追踪）
   v4: 失败不再被静默标记为完成；GAME.initErrors记录失败模块；
       rebuild()失败也记录；提供重试接口 __enhance.retry(owner)
   v3: 支持动态注册
   ============================================================ */

(function() {
  'use strict';

  const registry = {
    queue: [],
    started: false,
    _pendingDynamic: false,
    successes: [],
    failures: [],
    rebuildFailed: false,

    register(owner, fn, priority) {
      this.queue.push({ owner: owner || 'anonymous', fn, priority: priority || 100, done: false });
      if (this.started) this._pendingDynamic = true;
    },

    retry(owner) {
      const task = this.queue.find(t => t.owner === owner && t.failed);
      if (!task) return false;
      task.failed = false;
      task.error = null;
      this.failures = this.failures.filter(f => f.owner !== owner);
      try {
        task.fn();
        task.done = true;
        this.successes.push(owner);
        console.log('[SafeInit] ↻ 重试成功: ' + owner);
      } catch (err) {
        task.failed = true;
        task.error = err;
        this.failures.push({ owner, error: err });
        console.warn('[SafeInit] ✗ 重试仍失败: ' + owner, err);
      }
      this._updateStatus();
      return true;
    },

    _updateStatus() {
      if (typeof GAME !== 'undefined') {
        GAME.initErrors = this.failures.map(f => ({ owner: f.owner, error: String(f.error && f.error.message || f.error) }));
        GAME.fullyReady = this.failures.length === 0 && !this.rebuildFailed;
        GAME.initStats = {
          total: this.queue.length,
          success: this.successes.length,
          failed: this.failures.length,
          rebuildFailed: this.rebuildFailed,
        };
      }
    },

    start() {
      if (this.started) return;
      this.started = true;
      this.queue.sort((a, b) => a.priority - b.priority);
      let i = 0;
      const step = () => {
        if (i >= this.queue.length) {
          if (this._pendingDynamic) {
            this._pendingDynamic = false;
            this.queue.sort((a, b) => a.priority - b.priority);
            requestAnimationFrame(step);
            return;
          }
          console.log('[SafeInit] 增强模块生命周期完成: 成功=' + this.successes.length + ' 失败=' + this.failures.length);
          if (this.successes.length) console.log('[SafeInit] 成功: ' + this.successes.join(', '));
          if (this.failures.length) console.warn('[SafeInit] 失败: ' + this.failures.map(f => f.owner + '(' + (f.error && f.error.message || f.error) + ')').join(', '));

          try {
            if (typeof window !== 'undefined' && window.__changan && typeof window.__changan.rebuild === 'function') {
              window.__changan.rebuild();
              console.log('[SafeInit] ✓ 批处理增量重建完成');
            }
          } catch (err) {
            this.rebuildFailed = true;
            console.warn('[SafeInit] ✗ 批处理增量重建失败:', err);
          }

          this._updateStatus();
          return;
        }
        const task = this.queue[i++];
        try {
          task.fn();
          task.done = true;
          this.successes.push(task.owner);
          console.log('[SafeInit] ✓ ' + task.owner);
        } catch (err) {
          task.failed = true;
          task.error = err;
          this.failures.push({ owner: task.owner, error: err });
          console.warn('[SafeInit] ✗ ' + task.owner + ' 初始化失败:', err);
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  };

  window.__enhance = registry;

  if (Array.isArray(window.__enhancePending)) {
    window.__enhancePending.forEach(t => registry.register(t.owner, t.fn, t.priority));
    window.__enhancePending = [];
  }

  function waitReady() {
    if (typeof GAME !== 'undefined' && GAME.ready) {
      registry.start();
    } else {
      setTimeout(waitReady, 100);
    }
  }

  window.addEventListener('load', () => setTimeout(waitReady, 50));
  waitReady();
})();