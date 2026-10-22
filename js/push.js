import { $, el } from './util.js';
import { CONFIG } from './config.js';
import { api } from './api.js';
import { state } from './store.js';

const base = String(CONFIG.SUPABASE_URL || '').replace(/\/+$/, '');
const fnUrl = base + '/functions/v1/push';

const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIos = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const tz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Kyiv';
  } catch (e) {
    return 'Europe/Kyiv';
  }
};
const pad = (n) => String(n).padStart(2, '0');

function bytes(b64) {
  const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function fail(code) {
  const e = new Error(code);
  e.code = code;
  return e;
}

async function publicKey() {
  let res;
  try {
    res = await fetch(fnUrl, { headers: { apikey: CONFIG.SUPABASE_KEY } });
  } catch (e) {
    throw fail('network');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.publicKey) throw fail(res.status === 404 ? 'not_installed' : (data && data.error) || 'server');
  return data.publicKey;
}

async function registration() {
  return await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(fail('no_sw')), 8000))
  ]);
}

const MESSAGES = {
  network: 'Немає з\'єднання. Спробуй ще раз.',
  not_installed: 'Сповіщення ще не налаштовані в Supabase (див. README).',
  not_configured: 'У Supabase не задано ключі VAPID (див. README).',
  no_sw: 'Онови сторінку й спробуй ще раз.',
  expired: 'Підписка застаріла. Вимкни й увімкни сповіщення знову.',
  not_subscribed: 'Спершу увімкни сповіщення.'
};

const message = (e) => MESSAGES[e && e.code] || 'Не вдалося. Спробуй ще раз.';

export function mountPush(box, role) {
  const student = role === 's';
  const hour = el('select', { 'aria-label': 'Час' });
  for (let h = 0; h < 24; h++) hour.append(el('option', { value: String(h), text: pad(h) + ':00' }));
  hour.value = student ? '19' : '21';
  const on = el('button', { type: 'button', class: 'btn sm primary', text: 'Увімкнути' });
  const off = el('button', { type: 'button', class: 'btn sm', text: 'Вимкнути' });
  const test = el('button', { type: 'button', class: 'btn sm', text: 'Надіслати тестове' });
  const msg = el('span', { class: 'msg', role: 'status' });
  let sub = null;

  box.replaceChildren(
    el('p', { class: 'note', text: student
      ? 'Щодня в обраний час нагадаю, якщо ти ще не повторювала слова, і скажу, скільки їх чекає.'
      : 'Щодня в обраний час надішлю підсумок: чи займалась учениця, скільки повторень і які слова.' }),
    el('div', { class: 'actions' }, el('label', { class: 'inline' }, 'Щодня о', hour), on, off, test),
    el('div', { class: 'actions' }, msg)
  );

  function show(enabled) {
    on.hidden = enabled;
    off.hidden = !enabled;
    test.hidden = !enabled;
  }

  async function subscribe() {
    const j = sub.toJSON();
    await api.pushSubscribe(state.key, j.endpoint, j.keys.p256dh, j.keys.auth, tz(), Number(hour.value));
  }

  async function refresh() {
    show(false);
    if (!supported()) {
      on.disabled = true;
      hour.disabled = true;
      msg.textContent = isIos() && !standalone()
        ? 'На iPhone сповіщення працюють лише у встановленому застосунку: Safari → «Поділитися» → «На початковий екран».'
        : 'Цей браузер не підтримує сповіщення.';
      return;
    }
    if (Notification.permission === 'denied') {
      msg.textContent = 'Сповіщення заборонені для цього сайту. Дозволь їх у налаштуваннях телефона чи браузера.';
      return;
    }
    try {
      const reg = await registration();
      sub = await reg.pushManager.getSubscription();
      if (!sub) {
        msg.textContent = '';
        return;
      }
      const st = await api.pushStatus(state.key, sub.endpoint);
      if (st) {
        hour.value = String(st.hour);
        show(true);
        msg.textContent = 'Увімкнено на цьому пристрої.';
      } else {
        msg.textContent = '';
      }
    } catch (e) {
      msg.textContent = '';
    }
  }

  on.addEventListener('click', async () => {
    const asked = Notification.requestPermission();
    on.disabled = true;
    msg.textContent = 'Вмикаю…';
    try {
      const perm = await asked;
      if (perm !== 'granted') {
        msg.textContent = 'Без дозволу на сповіщення нагадування не прийдуть.';
        on.disabled = false;
        return;
      }
      const reg = await registration();
      sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(await publicKey()) });
      await subscribe();
      show(true);
      msg.textContent = 'Увімкнено. Щодня о ' + pad(Number(hour.value)) + ':00.';
    } catch (e) {
      msg.textContent = message(e);
    }
    on.disabled = false;
  });

  hour.addEventListener('change', async () => {
    if (on.hidden && sub) {
      try {
        await subscribe();
        msg.textContent = 'Час змінено: щодня о ' + pad(Number(hour.value)) + ':00.';
      } catch (e) {
        msg.textContent = message(e);
      }
    }
  });

  off.addEventListener('click', async () => {
    off.disabled = true;
    try {
      if (sub) {
        await api.pushUnsubscribe(state.key, sub.endpoint);
        await sub.unsubscribe();
      }
      sub = null;
      show(false);
      msg.textContent = 'Сповіщення вимкнено на цьому пристрої.';
    } catch (e) {
      msg.textContent = message(e);
    }
    off.disabled = false;
  });

  test.addEventListener('click', async () => {
    if (!sub) return;
    test.disabled = true;
    msg.textContent = 'Надсилаю…';
    try {
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', k: state.key, endpoint: sub.endpoint })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw fail((data && data.error) || (res.status === 404 ? 'not_installed' : 'server'));
      msg.textContent = 'Надіслано. Сповіщення має з\'явитися за кілька секунд.';
    } catch (e) {
      msg.textContent = message(e);
    }
    test.disabled = false;
  });

  refresh();
  return { refresh: refresh };
}
