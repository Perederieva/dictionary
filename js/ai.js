import { CONFIG } from './config.js';
import { state, tagCounts } from './store.js';

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

export async function enrich(items, want, signal) {
  let res;
  try {
    res = await fetch(base + '/functions/v1/ai', {
      method: 'POST',
      headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        k: state.key,
        items: items,
        tags: tagCounts().map((t) => t[0]).slice(0, 80),
        want: want
      }),
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
  const list = Array.isArray(data && data.results) ? data.results : [];
  return items.map((_, i) => {
    const r = list[i] || {};
    const tags = (Array.isArray(r.tags) ? r.tags : [])
      .map((t) => String(t || '').trim().toLowerCase())
      .filter((t) => t && t.length <= 30)
      .slice(0, 3);
    return { kind: r.kind === 'phrase' ? 'phrase' : 'word', tags: tags, ex: typeof r.ex === 'string' ? r.ex.trim().slice(0, 300) : '' };
  });
}

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
    const r = (await enrich([{ en: en, uk: o.uk.value.trim(), ex: ex }], { tags: true, ex: !ex }))[0];
    const cur = o.meta.get();
    o.meta.set({ kind: r.kind, tags: Array.from(new Set(cur.tags.concat(r.tags))).slice(0, 10) });
    if (r.ex && !o.ex.value.trim()) o.ex.value = r.ex;
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
