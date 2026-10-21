import { $, today } from './util.js';
import { norm } from './text.js';
import { api } from './api.js';
import { state, flush, load } from './store.js';

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
let hooks = { onDone: () => {} };

export const initBackup = (h) => { hooks = h; };

function exportData() {
  return {
    app: 'slovnychok',
    version: 1,
    exported: new Date().toISOString(),
    cards: state.cards.map((c) => ({
      en: c.en,
      uk: c.uk,
      ex: c.ex || '',
      ipa: c.ipa || '',
      note: c.note || '',
      hw: !!c.hw,
      kind: c.kind,
      tags: c.tags,
      by: c.by,
      created: c.t,
      eu: c.eu || null,
      ue: c.ue || null,
      done: c.done ? new Date(c.done).toISOString() : null,
      lapses: c.lapses || 0
    })),
    log: state.log
  };
}

function download(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const okStr = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

function okLevel(p) {
  return p && Number.isInteger(p.b) && p.b >= 0 && p.b <= 5 && typeof p.d === 'string' && DAY_RE.test(p.d) ? p : null;
}

function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'slovnychok' || !Array.isArray(data.cards)) throw new Error('format');
  return data;
}

async function restore(data, onProgress) {
  await flush();
  const seen = new Set(state.cards.map((c) => norm(c.en)));
  const fresh = [];
  let skipped = 0;
  data.cards.forEach((c) => {
    if (!c || !okStr(c.en, 200) || !okStr(c.uk, 300)) return;
    const k = norm(c.en);
    if (seen.has(k)) {
      skipped++;
      return;
    }
    seen.add(k);
    fresh.push(c);
  });
  const patches = [];
  for (let i = 0; i < fresh.length; i += 200) {
    onProgress('Додаю слова: ' + Math.min(i + 200, fresh.length) + ' з ' + fresh.length + '…');
    const part = fresh.slice(i, i + 200);
    const rows = await api.addCards(state.key, part.map((c) => ({
      en: c.en.trim(),
      uk: c.uk.trim(),
      ex: typeof c.ex === 'string' ? c.ex.slice(0, 300) : '',
      ipa: typeof c.ipa === 'string' ? c.ipa.slice(0, 100) : '',
      hw: c.hw === true,
      kind: c.kind === 'phrase' ? 'phrase' : 'word',
      tags: Array.isArray(c.tags) ? c.tags.filter((t) => typeof t === 'string').slice(0, 10) : []
    })));
    const ids = new Map(rows.map((r) => [norm(r.en), r.id]));
    part.forEach((c) => {
      const id = ids.get(norm(c.en));
      const eu = okLevel(c.eu);
      const ue = okLevel(c.ue);
      const done = typeof c.done === 'string' && !isNaN(Date.parse(c.done)) ? c.done : null;
      const lapses = Number.isInteger(c.lapses) && c.lapses > 0 ? Math.min(c.lapses, 1000) : 0;
      if (!id || (!eu && !ue && !done && !lapses)) return;
      patches.push({ id: id, eu_b: eu ? eu.b : null, eu_d: eu ? eu.d : null, ue_b: ue ? ue.b : null, ue_d: ue ? ue.d : null, done_at: done, lapses: lapses });
    });
  }
  for (let i = 0; i < patches.length; i += 100) {
    onProgress('Відновлюю прогрес…');
    await api.saveProgress(state.key, patches.slice(i, i + 100));
  }
  const log = data.log && typeof data.log === 'object' ? data.log : {};
  const t = today();
  const oldest = new Date(Date.now() - 390 * 86400000).toISOString().slice(0, 10);
  for (const day of Object.keys(log)) {
    const n = Number(log[day]);
    if (!DAY_RE.test(day) || day > t || day < oldest || !Number.isInteger(n) || n <= 0) continue;
    if (n > (state.log[day] || 0)) await api.saveLog(state.key, day, Math.min(n, 100000));
  }
  await load(state.key);
  return { added: fresh.length, skipped: skipped };
}

export function bindBackup() {
  $('backupSave').addEventListener('click', async () => {
    await flush();
    download('slovnychok-' + today() + '.json', JSON.stringify(exportData(), null, 1));
    $('backupMsg').textContent = 'Копію збережено. Тримай файл у надійному місці: у ньому всі твої слова.';
  });
  $('backupFile').addEventListener('change', async () => {
    const input = $('backupFile');
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    const msg = $('backupMsg');
    let data;
    try {
      data = parseBackup(await file.text());
    } catch (e) {
      msg.textContent = 'Це не схоже на копію Словничка.';
      return;
    }
    $('backupLoad').classList.add('busy');
    try {
      const r = await restore(data, (t) => { msg.textContent = t; });
      msg.textContent = 'Готово. Додано слів: ' + r.added + (r.skipped ? ', уже були: ' + r.skipped : '') + '.';
      hooks.onDone();
    } catch (e) {
      msg.textContent = e.code === 'network' ? 'Немає з\'єднання. Спробуй ще раз.' : 'Не вдалося відновити. Частину слів могло бути додано, спробуй ще раз: дублікати пропустяться.';
    }
    $('backupLoad').classList.remove('busy');
  });
}
