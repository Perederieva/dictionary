import { api } from './api.js';
import { STARTER } from './starter.js';
import { today, addDays } from './util.js';

export const state = { role: null, key: null, settings: {}, cards: [], log: {} };

const dirtyCards = new Set();
const dirtyLog = new Set();
let dirtySettings = false;
let flushTimer = null;
let flushing = false;
let onSync = () => {};

export const setSyncHandler = (fn) => { onSync = fn; };
export const activeCards = () => state.cards.filter((c) => !c.done);
export const doneCards = () => state.cards.filter((c) => c.done);
export const hasDirty = () => dirtyCards.size > 0 || dirtyLog.size > 0 || dirtySettings;

export function fromRow(r) {
  const c = { id: r.id, en: r.en, uk: r.uk, ex: r.ex || '', s: r.starter ? 1 : 0, by: r.added_by, t: r.created_at, kind: r.kind === 'phrase' ? 'phrase' : 'word', tags: Array.isArray(r.tags) ? r.tags : [] };
  if (r.done_at) c.done = Date.parse(r.done_at);
  if (r.eu_b !== null && r.eu_b !== undefined && r.eu_d) c.eu = { b: r.eu_b, d: r.eu_d };
  if (r.ue_b !== null && r.ue_b !== undefined && r.ue_d) c.ue = { b: r.ue_b, d: r.ue_d };
  return c;
}

function progressPatch(c) {
  return {
    id: c.id,
    eu_b: c.eu ? c.eu.b : null,
    eu_d: c.eu ? c.eu.d : null,
    ue_b: c.ue ? c.ue.b : null,
    ue_d: c.ue ? c.ue.d : null,
    done_at: c.done ? new Date(c.done).toISOString() : null
  };
}

export function streakOf(log) {
  let d = today();
  let n = 0;
  if (!(log[d] > 0)) d = addDays(d, -1);
  while (log[d] > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export async function load(key) {
  const d = await api.getState(key);
  state.key = key;
  state.role = d.role;
  state.settings = Object.assign({ dir: 'eu', mode: 'flip', newPerDay: 10, intro: { date: '', n: 0 }, seeded: false }, d.settings || {});
  state.settings.filter = Object.assign({ kind: 'all', tag: '' }, state.settings.filter || {});
  state.cards = (d.cards || []).map(fromRow);
  state.log = {};
  (d.log || []).forEach((r) => { state.log[r.day] = r.n; });
}

export async function seedIfNeeded() {
  if (state.role !== 's' || state.settings.seeded) return;
  if (!state.cards.length) {
    const rows = await api.addCards(state.key, STARTER.map((r) => ({ en: r[0], uk: r[1], ex: r[2], kind: r[3] || 'word', starter: true })));
    state.cards = rows.map(fromRow);
  }
  state.settings.seeded = true;
  markSettings();
}

function schedule(delay) {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, delay === undefined ? 500 : delay);
}

export function markCard(c) { dirtyCards.add(c.id); schedule(); }
export function markLog(day) { dirtyLog.add(day); schedule(); }
export function markSettings() { dirtySettings = true; schedule(); }

export async function flush() {
  if (state.role !== 's' || !state.key) return;
  if (flushing) { schedule(300); return; }
  if (!hasDirty()) return;
  flushing = true;
  onSync('saving');
  let failed = false;
  const ids = Array.from(dirtyCards);
  const days = Array.from(dirtyLog);
  let settings = dirtySettings;
  dirtyCards.clear();
  dirtyLog.clear();
  dirtySettings = false;
  let i = 0;
  let j = 0;
  try {
    for (; i < ids.length; i += 100) {
      const patches = ids.slice(i, i + 100).map((id) => state.cards.find((c) => c.id === id)).filter(Boolean).map(progressPatch);
      if (patches.length) await api.saveProgress(state.key, patches);
    }
    for (; j < days.length; j++) await api.saveLog(state.key, days[j], state.log[days[j]] || 0);
    if (settings) {
      const s = Object.assign({}, state.settings);
      delete s.tkey;
      await api.saveSettings(state.key, s);
      settings = false;
    }
  } catch (e) {
    failed = true;
    ids.slice(i).forEach((id) => dirtyCards.add(id));
    days.slice(j).forEach((d) => dirtyLog.add(d));
    if (settings) dirtySettings = true;
  }
  flushing = false;
  onSync(failed ? 'error' : 'saved');
  if (failed) schedule(8000);
}

export async function addCards(items) {
  const rows = await api.addCards(state.key, items);
  const added = rows.map(fromRow);
  state.cards.push(...added);
  return added;
}

export async function updateCard(id, f) {
  const row = await api.updateCard(state.key, id, f);
  const c = state.cards.find((x) => x.id === id);
  if (c) {
    c.en = row.en;
    c.uk = row.uk;
    c.ex = row.ex || '';
    c.kind = row.kind === 'phrase' ? 'phrase' : 'word';
    c.tags = row.tags || [];
  }
  return c;
}

export function matchesFilter(c, f) {
  if (f.kind !== 'all' && c.kind !== f.kind) return false;
  if (f.tag && c.tags.indexOf(f.tag) === -1) return false;
  return true;
}

export function tagCounts(cards) {
  const m = new Map();
  (cards || state.cards).forEach((c) => c.tags.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
  return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'uk'));
}

export async function removeCards(ids) {
  await api.deleteCards(state.key, ids);
  const set = new Set(ids);
  state.cards = state.cards.filter((c) => !set.has(c.id));
  ids.forEach((id) => dirtyCards.delete(id));
}

export async function rotateTeacher(newKey) {
  await api.rotateTeacher(state.key, newKey);
  state.settings.tkey = newKey;
}
