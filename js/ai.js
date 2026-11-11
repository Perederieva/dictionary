import { CATS, cleanTags } from './cats.js';
import { CONFIG } from './config.js';
import { state } from './store.js';

const base = String(CONFIG.SUPABASE_URL || '').replace(/\/+$/, '');

function fail(code) {
  const e = new Error(code);
  e.code = code;
  return e;
}

export function aiMessage(e) {
  const m = {
    daily_limit: 'Денний ліміт запитів до ШІ вичерпано. Спробуй завтра.',
    provider_limit: 'Ліміт безкоштовного ШІ на зараз вичерпано. Спробуй за хвилину або пізніше.',
    not_installed: 'ШІ ще не підключено: див. розділ «Помічник ШІ» в README.',
    not_configured: 'ШІ ще не підключено: у Supabase не задано GEMINI_API_KEY.',
    model: 'Модель Gemini не знайдено. Задай іншу назву в секреті GEMINI_MODEL.',
    student_only: 'Підказки ШІ доступні лише в режимі учня.',
    provider_busy: 'Gemini зараз перевантажений. Спробуй за хвилину.',
    provider_auth: 'Gemini не прийняв ключ. Перевір GEMINI_API_KEY у Secrets.',
    bad_request: 'Запит до ШІ не пройшов перевірку.',
    invalid_key: 'Не вдалося підтвердити доступ. Онови сторінку.',
    network: 'Немає зв\'язку із сервером. Спробуй ще раз.'
  };
  return (m[e && e.code] || 'ШІ тимчасово недоступний. Спробуй ще раз.') + (e && e.status ? ' (' + e.status + ')' : '');
}

async function post(payload, signal) {
  let res;
  try {
    res = await fetch(base + '/functions/v1/ai', {
      method: 'POST',
      headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ k: state.key }, payload)),
      signal: signal
    });
  } catch (e) {
    throw fail(e && e.name === 'AbortError' ? 'aborted' : 'network');
  }
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    if (e && e.name === 'AbortError') throw fail('aborted');
    data = null;
  }
  if (!res.ok) {
    const err = fail((data && data.error) || (res.status === 404 ? 'not_installed' : 'server'));
    err.status = (data && data.status) || res.status;
    throw err;
  }
  return data || {};
}

const word = (c) => ({ en: c.en, uk: c.uk || '', ex: c.ex || '' });

export async function enrich(items, want, signal) {
  const data = await post({ items: items, tags: CATS, want: want }, signal);
  const list = Array.isArray(data.results) ? data.results : [];
  return items.map((_, i) => {
    const r = list[i] || {};
    const tags = cleanTags(r.tags);
    return { kind: r.kind === 'phrase' ? 'phrase' : 'word', tags: tags, ex: typeof r.ex === 'string' ? r.ex.trim().slice(0, 300) : '', ipa: typeof r.ipa === 'string' ? r.ipa.trim().slice(0, 100) : '', def: typeof r.def === 'string' ? r.def.trim().slice(0, 300) : '', more: Array.isArray(r.more) ? r.more.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 300)).slice(0, 3) : [] };
  });
}

export async function aiStory(cards, signal) {
  const data = await post({ task: 'story', words: cards.slice(0, 12).map(word) }, signal);
  return data.story || null;
}

export async function aiExplain(c, info, signal) {
  const data = await post({ task: 'explain', item: Object.assign(word(c), { expected: String(info.expected || '').slice(0, 300), answer: String(info.answer || '').slice(0, 300), shown: String(info.shown || '').slice(0, 400) }) }, signal);
  return String(data.text || '');
}

export async function aiExample(c, signal) {
  const data = await post({ task: 'example', item: word(c) }, signal);
  return String(data.ex || '');
}

export async function aiOrder(c, expected, answer, signal) {
  const data = await post({ task: 'order', item: Object.assign(word(c), { expected: String(expected || '').slice(0, 300), answer: String(answer || '').slice(0, 300) }) }, signal);
  return { ok: data.ok === true, text: String(data.text || '') };
}

export const aiLock = { panel: false };

const RETRY = ['provider_busy', 'provider_limit', 'network', 'server'];
const WAITS = [8, 20, 40];

function pause(sec, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) return reject(fail('aborted'));
    const t = setTimeout(resolve, sec * 1000);
    if (signal) signal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(fail('aborted'));
    }, { once: true });
  });
}

export async function withRetry(fn, signal, onWait) {
  for (let a = 0; ; a++) {
    try {
      return await fn(signal);
    } catch (e) {
      if (RETRY.indexOf(e.code) === -1 || a >= WAITS.length) throw e;
      if (e.code === 'network' && typeof navigator !== 'undefined' && navigator.onLine === false) throw e;
      if (onWait) onWait(WAITS[a], e);
      await pause(WAITS[a], signal);
    }
  }
}

export const enrichRetry = (items, want, signal, onWait) => withRetry((sg) => enrich(items, want, sg), signal, onWait);

export async function suggestInto(o) {
  const en = o.en.value.trim();
  if (!en) {
    o.msg.textContent = 'Спочатку введи англійське слово.';
    return;
  }
  o.btn.disabled = true;
  o.msg.textContent = 'Питаю ШІ…';
  try {
    const ex = o.ex.value.trim();
    const needIpa = !!o.ipa && !o.ipa.value.trim();
    const r = (await enrich([{ en: en, uk: o.uk.value.trim(), ex: ex }], { tags: true, ex: !ex, ipa: needIpa }))[0];
    const cur = o.meta.get();
    o.meta.set({ kind: r.kind, tags: cleanTags(r.tags.length ? r.tags : cur.tags) });
    if (r.ex && !o.ex.value.trim()) o.ex.value = r.ex;
    if (needIpa && r.ipa && !o.ipa.value.trim()) o.ipa.value = r.ipa;
    o.msg.textContent = o.done;
  } catch (e) {
    o.msg.textContent = aiMessage(e);
  }
  o.btn.disabled = false;
}

export async function exampleInto(o) {
  const en = o.en.value.trim();
  if (!en) {
    o.msg.textContent = 'Спочатку введи англійське слово.';
    return;
  }
  o.btn.disabled = true;
  o.msg.textContent = 'Пишу приклад…';
  try {
    const r = (await enrich([{ en: en, uk: o.uk.value.trim(), ex: '' }], { tags: false, ex: true }))[0];
    if (r.ex) {
      o.ex.value = r.ex;
      o.msg.textContent = 'Приклад готовий. Натисни ще раз, щоб отримати інший.';
    } else {
      o.msg.textContent = 'ШІ не зміг написати приклад. Спробуй ще раз.';
    }
  } catch (e) {
    o.msg.textContent = aiMessage(e);
  }
  o.btn.disabled = false;
}
