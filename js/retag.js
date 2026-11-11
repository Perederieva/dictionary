import { state, updateCard } from './store.js';
import { enrichRetry, aiLock } from './ai.js';

const KEY = 'slovnychok.retag';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let running = false;

function readTried() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(v) ? v : []);
  } catch (e) {
    return new Set();
  }
}

function writeTried(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(set).slice(-2000)));
  } catch (e) { }
}

export async function retagOld(onDone) {
  if (running || state.role !== 's' || state.offline || state.ai === false) return;
  const tried = readTried();
  const list = state.cards.filter((c) => c.oldTags && !c.tags.length && !tried.has(c.id));
  if (!list.length) return;
  running = true;
  let changed = 0;
  try {
    for (let i = 0; i < list.length; i += 25) {
      while (aiLock.panel) await wait(2000);
      const part = list.slice(i, i + 25);
      const res = await enrichRetry(part.map((c) => ({ en: c.en, uk: c.uk, ex: c.ex, want: { tags: true, ex: false, ipa: false } })), { tags: true, ex: false, ipa: false });
      part.forEach((c) => tried.add(c.id));
      writeTried(tried);
      for (let k = 0; k < part.length; k++) {
        const c = part[k];
        const r = res[k];
        if (!r || !r.tags.length || !c.oldTags || c.tags.length) continue;
        await updateCard(c.id, { en: c.en, uk: c.uk, ex: c.ex, kind: c.kind, tags: r.tags, ipa: c.ipa });
        changed++;
      }
    }
  } catch (e) { }
  running = false;
  if (changed && onDone) onDone();
}
