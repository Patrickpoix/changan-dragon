// Reusable *technical* asset pool for region streaming. The asset catalogue
// remains the only source of IDs, provenance and quality decisions.
//
// The first consumer creates/loads a resource; all concurrent consumers reuse
// its exact object. A scope releases only its own references. The last owner
// disposes the shared resource; in-flight orphan loads are aborted or disposed
// if the loader ignores cancellation. Never clone an expensive source per chunk.
export class SharedResourceRegistry {
  constructor() {
    this.entries = new Map();
    this.created = 0;
    this.disposed = 0;
    this.hits = 0;
  }

  _lease(key, entry) {
    let released = false;
    // Every consumer gets its own lifecycle-aware promise. The shared load may
    // finish after this scope leaves (or after the last owner disposes it), but
    // a departed consumer must never receive a reference to a freed GPU asset.
    const ready = entry.ready.then(value => {
      if (released) {
        const error = new Error('Asset lease released before ready: ' + key);
        error.name = 'AbortError';
        throw error;
      }
      return value;
    });
    // A consumer may close its scope without ever awaiting the returned lease.
    // The promise still rejects for callers that do await it, without producing
    // process-wide unhandled rejection noise when nobody observes it.
    ready.catch(() => {});
    return {
      get value() { return entry.value; },
      ready,
      release: () => {
        if (released) return;
        released = true;
        if (--entry.refs > 0) return;
        if (this.entries.get(key) === entry) this.entries.delete(key);
        entry.active = false;
        if (entry.state === 'loading') {
          entry.controller?.abort();
        } else if (entry.state === 'ready') {
          entry.disposer(entry.value);
          this.disposed++;
        }
      },
    };
  }

  acquire(key, factory, disposer = () => {}) {
    if (typeof key !== 'string' || !key || typeof factory !== 'function' ||
        typeof disposer !== 'function') throw new TypeError('Invalid asset lease');
    let entry = this.entries.get(key);
    if (entry) {
      if (entry.state !== 'ready') {
        throw new Error('Cannot acquire synchronously while an asset is loading: ' + key);
      }
      this.hits++;
      entry.refs++;
      return this._lease(key, entry);
    }
    const value = factory();
    if (value && typeof value.then === 'function') {
      throw new TypeError('Use acquireAsync for asynchronous assets');
    }
    entry = {value, refs: 1, state: 'ready', active: true, disposer,
      ready: Promise.resolve(value)};
    this.entries.set(key, entry);
    this.created++;
    return this._lease(key, entry);
  }

  acquireAsync(key, loader, disposer = () => {}) {
    if (typeof key !== 'string' || !key || typeof loader !== 'function' ||
        typeof disposer !== 'function') throw new TypeError('Invalid async asset lease');
    let entry = this.entries.get(key);
    if (entry) {
      this.hits++;
      entry.refs++;
      return this._lease(key, entry);
    }
    const controller = new AbortController();
    entry = {refs: 1, state: 'loading', active: true, disposer, controller};
    this.entries.set(key, entry);
    this.created++;
    entry.ready = Promise.resolve().then(() => loader({signal: controller.signal}))
      .then(value => {
        if (!entry.active) {
          disposer(value);
          this.disposed++;
          return value;
        }
        entry.value = value;
        entry.state = 'ready';
        return value;
      }, error => {
        entry.state = 'failed';
        if (this.entries.get(key) === entry) this.entries.delete(key);
        entry.active = false;
        throw error;
      });
    // Releasing a scope before a loader rejects must not cause an unhandled
    // rejection. A caller awaiting .ready still observes the original error.
    entry.ready.catch(() => {});
    return this._lease(key, entry);
  }

  scope() {
    const leases = [];
    let closed = false;
    return {
      get: (key, factory, disposer) => {
        if (closed) throw new Error('Asset scope already released');
        const lease = this.acquire(key, factory, disposer);
        leases.push(lease);
        return lease.value;
      },
      load: (key, loader, disposer) => {
        if (closed) throw new Error('Asset scope already released');
        const lease = this.acquireAsync(key, loader, disposer);
        leases.push(lease);
        return lease.ready;
      },
      release: () => {
        if (closed) return;
        closed = true;
        for (let i = leases.length - 1; i >= 0; i--) leases[i].release();
        leases.length = 0;
      },
    };
  }

  stats() {
    return {
      liveAssets: this.entries.size,
      references: [...this.entries.values()].reduce((s, e) => s + e.refs, 0),
      pendingLoads: [...this.entries.values()].filter(e => e.state === 'loading').length,
      created: this.created, disposed: this.disposed, cacheHits: this.hits,
    };
  }
}
