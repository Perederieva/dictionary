import { $, armDelete, copyText, randomKey } from './util.js';
import { state, rotateTeacher } from './store.js';
import { getPrefs, setPref } from './prefs.js';

export const linkFor = (key) => location.origin + location.pathname + '#k=' + key;

export function renderAccess() {
  $('myLink').textContent = linkFor(state.key);
  const tk = state.settings.tkey;
  $('teacherLink').textContent = tk ? linkFor(tk) : 'Немає. Створи нове посилання нижче.';
  $('copyTeacher').hidden = !tk;
}

export function bindAccess() {
  $('copyMine').addEventListener('click', async () => {
    const ok = await copyText(linkFor(state.key), $('myLink'));
    $('myMsg').textContent = ok ? 'Скопійовано.' : 'Посилання виділено, скопіюй його вручну.';
  });
  $('copyTeacher').addEventListener('click', async () => {
    const ok = await copyText(linkFor(state.settings.tkey), $('teacherLink'));
    $('teacherMsg').textContent = ok ? 'Скопійовано.' : 'Посилання виділено, скопіюй його вручну.';
  });
  armDelete($('newTeacher'), 'Створити нове посилання для вчителя', async () => {
    try {
      await rotateTeacher(randomKey());
      renderAccess();
      $('teacherMsg').textContent = 'Готово. Старе посилання вже не працює, надішли вчителю нове.';
    } catch (e) {
      $('teacherMsg').textContent = 'Не вдалося. Спробуй ще раз.';
    }
  });
}

function themeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#2B5896');
}

export function applyTheme(value) {
  const v = value === 'light' || value === 'dark' ? value : 'system';
  if (v === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', v);
  document.querySelectorAll('#themeSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === v)));
  themeColor();
}

export function bindTheme() {
  applyTheme(getPrefs().theme);
  document.querySelectorAll('#themeSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      setPref('theme', b.dataset.theme === 'system' ? '' : b.dataset.theme);
      applyTheme(b.dataset.theme);
    });
  });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => themeColor();
    if (mq.addEventListener) mq.addEventListener('change', on);
    else if (mq.addListener) mq.addListener(on);
  }
}
