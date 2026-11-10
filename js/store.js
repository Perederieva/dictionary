import { canon, variants, canonWords } from './text.js';
import { cleanTags, setExtraTags } from './cats.js';
import { api } from './api.js';
import { STARTER } from './starter.js';
import { today, addDays } from './util.js';

export const state = { role: null, key: null, settings: {}, cards: [], log: {}, offline: false };

const SNAP = 'slovnychok.snap';

const dirtyCards = new Set();
const dirtyLog = new Set();
let dirtySettings = false;
let flushTimer = null;
let flushing = false;
let onSync = () => {};
let persistTimer = null;
const inflight = { cards: new Set(), log: new Set(), settings: false };

export const setSyncHandler = (fn) => { onSync = fn; };
export const activeCards = () => state.cards.filter((c) => !c.done);
export const doneCards = () => state.cards.filter((c) => c.done);
export const hasDirty = () => dirtyCards.size > 0 || dirtyLog.size > 0 || dirtySettings;

export function fromRow(r) {
  const raw = Array.isArray(r.tags) ? r.tags.slice(0, 10) : [];
  const c = { id: r.id, en: r.en, uk: r.uk, ex: r.ex || '', s: r.starter ? 1 : 0, by: r.added_by, t: r.created_at, kind: r.kind === 'phrase' ? 'phrase' : 'word', raw: raw, tags: [], lapses: r.lapses || 0, ipa: r.ipa || '', note: r.note || '', hw: !!r.hw, def: r.def || '' };
  cleanCard(c);
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
    done_at: c.done ? new Date(c.done).toISOString() : null,
    lapses: c.lapses || 0
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

function writeSnap() {
  if (!state.key) return;
  const snap = {
    key: state.key,
    role: state.role,
    ai: state.ai,
    settings: state.settings,
    cards: state.cards,
    log: state.log,
    dirty: {
      cards: Array.from(new Set([...dirtyCards, ...inflight.cards])),
      log: Array.from(new Set([...dirtyLog, ...inflight.log])),
      settings: dirtySettings || inflight.settings
    },
    at: Date.now()
  };
  try {
    localStorage.setItem(SNAP, JSON.stringify(snap));
  } catch (e) { }
}

export function persistNow() {
  clearTimeout(persistTimer);
  writeSnap();
}

export function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(writeSnap, 300);
}

function readSnap(key) {
  try {
    const s = JSON.parse(localStorage.getItem(SNAP) || 'null');
    return s && s.key === key && Array.isArray(s.cards) ? s : null;
  } catch (e) {
    return null;
  }
}

export function clearSnap() {
  clearTimeout(persistTimer);
  try {
    localStorage.removeItem(SNAP);
  } catch (e) { }
}

function restoreDirty(snap) {
  const d = snap.dirty || {};
  (d.cards || []).forEach((id) => dirtyCards.add(id));
  (d.log || []).forEach((day) => dirtyLog.add(day));
  if (d.settings) dirtySettings = true;
}

function mergeLocal(snap) {
  const d = snap.dirty || {};
  const local = new Map(snap.cards.map((c) => [c.id, c]));
  (d.cards || []).forEach((id) => {
    const mine = local.get(id);
    const c = state.cards.find((x) => x.id === id);
    if (!mine || !c) return;
    ['eu', 'ue', 'done', 'lapses'].forEach((f) => {
      if (mine[f] === undefined) delete c[f];
      else c[f] = mine[f];
    });
  });
  (d.log || []).forEach((day) => {
    state.log[day] = Math.max(state.log[day] || 0, (snap.log && snap.log[day]) || 0);
  });
  if (d.settings && snap.settings) {
    const tk = state.settings.tkey;
    state.settings = Object.assign({}, state.settings, snap.settings);
    if (tk) state.settings.tkey = tk;
    else delete state.settings.tkey;
  }
  restoreDirty(snap);
}

function cleanCard(c) {
  const raw = Array.isArray(c.raw) ? c.raw : c.tags || [];
  c.tags = cleanTags(raw);
  if (raw.length !== c.tags.length) c.oldTags = true;
  else delete c.oldTags;
}

export function retagAll() {
  const list = (state.settings.myTags || []).slice();
  state.cards.forEach((c) => {
    if (c.by === 't') (c.raw || []).forEach((t) => list.push(t));
  });
  setExtraTags(list);
  state.cards.forEach(cleanCard);
}

function applyState(key, role, settings, cards, log) {
  state.key = key;
  state.role = role;
  state.settings = Object.assign({ dir: 'eu', mode: 'flip', newPerDay: 10, intro: { date: '', n: 0 }, seeded: false, goal: 20, mix: ['type', 'choice', 'listen', 'cloze'] }, settings || {});
  state.settings.filter = Object.assign({ kind: 'all', tag: '', hw: false, lesson: '' }, state.settings.filter || {});
  state.cards = cards;
  state.log = log;
  retagAll();
  if (typeof document !== 'undefined') document.body.classList.toggle('no-ai', state.ai === false);
}

export async function load(key) {
  const snap = readSnap(key);
  let d;
  try {
    d = await api.getState(key);
  } catch (e) {
    if (e.code !== 'network' || !snap) throw e;
    state.ai = snap.ai !== false;
    applyState(key, snap.role, snap.settings, snap.cards, snap.log || {});
    state.offline = true;
    if (snap.role === 's') restoreDirty(snap);
    if (hasDirty()) schedule(1000);
    return;
  }
  state.offline = false;
  const log = {};
  (d.log || []).forEach((r) => { log[r.day] = r.n; });
  state.ai = d.ai !== false;
  applyState(key, d.role, d.settings, (d.cards || []).map(fromRow), log);
  if (snap && snap.role === 's' && d.role === 's') mergeLocal(snap);
  if (hasDirty()) schedule();
  persist();
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

export function markCard(c) { dirtyCards.add(c.id); schedule(); persist(); }
export function markLog(day) { dirtyLog.add(day); schedule(); persist(); }
export function markSettings() { dirtySettings = true; schedule(); persist(); }

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
  ids.forEach((id) => inflight.cards.add(id));
  days.forEach((d) => inflight.log.add(d));
  inflight.settings = settings;
  let i = 0;
  let j = 0;
  let offline = false;
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
    offline = e.code === 'network';
    ids.slice(i).forEach((id) => dirtyCards.add(id));
    days.slice(j).forEach((d) => dirtyLog.add(d));
    if (settings) dirtySettings = true;
  }
  inflight.cards.clear();
  inflight.log.clear();
  inflight.settings = false;
  flushing = false;
  if (!failed) state.offline = false;
  persist();
  onSync(failed ? (offline ? 'offline' : 'error') : 'saved');
  if (failed) schedule(8000);
}

export async function addCards(items) {
  const rows = await api.addCards(state.key, items);
  const added = rows.map(fromRow);
  state.cards.push(...added);
  retagAll();
  persist();
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
    c.raw = Array.isArray(row.tags) ? row.tags.slice(0, 10) : [];
    cleanCard(c);
    c.ipa = row.ipa || '';
    c.def = row.def || '';
  }
  persist();
  return c;
}

export async function setCardMark(id, f) {
  const row = await api.markCard(state.key, id, f);
  const c = state.cards.find((x) => x.id === id);
  if (c) {
    c.note = row.note || '';
    c.hw = !!row.hw;
  }
  persist();
  return c;
}

export async function setCardDef(id, def) {
  const row = await api.setDef(state.key, id, def);
  const c = state.cards.find((x) => x.id === id);
  if (c) c.def = row.def || '';
  persist();
  return c;
}

export function matchesFilter(c, f) {
  if (f.kind !== 'all' && c.kind !== f.kind) return false;
  if (f.tag && c.tags.indexOf(f.tag) === -1) return false;
  if (f.hw && !c.hw) return false;
  if (f.lesson && lessonOf(c) !== f.lesson) return false;
  return true;
}

export function lessonOf(c) {
  if (!c.t) return '';
  const d = new Date(c.t);
  if (isNaN(d)) return '';
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export function lessonCounts(cards) {
  const m = new Map();
  (cards || state.cards).forEach((c) => {
    const k = lessonOf(c);
    if (k) m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export function findDup(en, exceptId) {
  const key = canon(en);
  if (!key) return null;
  return state.cards.find((c) => c.id !== exceptId && (canon(c.en) === key || variants(c.en).map(canonWords).indexOf(key) !== -1)) || null;
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
  persist();
}

export async function rotateTeacher(newKey) {
  await api.rotateTeacher(state.key, newKey);
  state.settings.tkey = newKey;
  persist();
}
