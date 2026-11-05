import { state, updateCard } from './store.js';
import { enrich } from './ai.js';

let running = false;

export async function retagOld(onDone) {
  if (running || state.role !== 's' || state.offline) return;
  const list = state.cards.filter((c) => c.oldTags);
  if (!list.length) return;
  running = true;
  let changed = 0;
  try {
    for (let i = 0; i < list.length; i += 10) {
      const part = list.slice(i, i + 10);
      const res = await enrich(part.map((c) => ({ en: c.en, uk: c.uk, ex: c.ex, want: { tags: true, ex: false, ipa: false } })), { tags: true, ex: false, ipa: false });
      for (let k = 0; k < part.length; k++) {
        const c = part[k];
        const r = res[k];
        if (!r || !r.tags.length || !c.oldTags) continue;
        await updateCard(c.id, { en: c.en, uk: c.uk, ex: c.ex, kind: c.kind, tags: r.tags, ipa: c.ipa });
        changed++;
      }
    }
  } catch (e) { }
  running = false;
  if (changed && onDone) onDone();
}
