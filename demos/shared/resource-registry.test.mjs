import test from 'node:test';
import assert from 'node:assert/strict';
import {SharedResourceRegistry} from './resource-registry.mjs';

test('regions share exact GPU objects, and only the final release disposes', () => {
  const pool = new SharedResourceRegistry(), a = pool.scope(), b = pool.scope();
  let created = 0, disposed = 0;
  const make = () => ({identity: ++created});
  const drop = () => { disposed++; };
  const first = a.get('material/wood-CC0', make, drop);
  const second = b.get('material/wood-CC0', make, drop);
  assert.strictEqual(first, second);
  assert.equal(created, 1);
  assert.equal(pool.stats().references, 2);
  a.release();
  assert.equal(disposed, 0);
  assert.equal(pool.stats().liveAssets, 1);
  b.release();
  b.release();
  assert.equal(disposed, 1);
  assert.equal(pool.stats().liveAssets, 0);
});

test('the same source loads once across simultaneous regions', async () => {
  const pool = new SharedResourceRegistry(), a = pool.scope(), b = pool.scope();
  let loads = 0, disposed = 0;
  const load = async () => { loads++; return {mesh: 'unique-object'}; };
  const free = () => { disposed++; };
  const [one, two] = await Promise.all([
    a.load('model/courtyard-gate', load, free),
    b.load('model/courtyard-gate', load, free),
  ]);
  assert.strictEqual(one, two);
  assert.equal(loads, 1);
  a.release();
  assert.equal(disposed, 0);
  b.release();
  assert.equal(disposed, 1);
});

test('orphan asynchronous assets are aborted and late results disposed', async () => {
  const pool = new SharedResourceRegistry(), scope = pool.scope();
  let signal, resolve, disposed = 0;
  const pending = scope.load('model/stale', ({signal: s}) => {
    signal = s;
    return new Promise(r => { resolve = r; });
  }, () => { disposed++; });
  await Promise.resolve(); // start the deferred loader
  scope.release();
  assert.equal(signal.aborted, true);
  assert.equal(pool.stats().liveAssets, 0);
  resolve({late: true}); // loader intentionally ignores the abort
  await assert.rejects(pending, {name: 'AbortError'});
  assert.equal(disposed, 1);
});

test('released region cannot receive another region’s in-flight GPU asset', async () => {
  const pool = new SharedResourceRegistry(), departed = pool.scope(), active = pool.scope();
  let finish, loads = 0, disposed = 0;
  const load = () => {
    loads++;
    return new Promise(resolve => { finish = resolve; });
  };
  const disposer = () => { disposed++; };
  const obsolete = departed.load('shared/roof', load, disposer);
  const current = active.load('shared/roof', load, disposer);
  await Promise.resolve();
  assert.equal(loads, 1, 'only one network/decoder task may run');
  departed.release();
  assert.equal(pool.stats().references, 1);
  const resource = {gpuTexture: true};
  finish(resource);
  await assert.rejects(obsolete, {name: 'AbortError'});
  assert.strictEqual(await current, resource);
  assert.equal(disposed, 0, 'active region still owns resource');
  active.release();
  assert.equal(disposed, 1);
});

test('failed loading is evicted and can retry without stale references', async () => {
  const pool = new SharedResourceRegistry(), a = pool.scope();
  await assert.rejects(a.load('model/fail', async () => {
    throw new Error('network offline');
  }), /network offline/);
  assert.equal(pool.stats().liveAssets, 0);
  a.release();
  const b = pool.scope();
  const value = await b.load('model/fail', async () => 42);
  assert.equal(value, 42);
  b.release();
  assert.equal(pool.stats().liveAssets, 0);
});

test('closed scopes cannot reacquire resources', () => {
  const pool = new SharedResourceRegistry(), a = pool.scope();
  a.release();
  assert.throws(() => a.get('foo', () => ({})), /released/);
});
