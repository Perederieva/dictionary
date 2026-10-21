import { $, armDelete, copyText, randomKey, today } from './util.js';
import { api, configured } from './api.js';
import { state, load, seedIfNeeded, flush, hasDirty, setSyncHandler, activeCards, doneCards, clearSnap, persistNow } from './store.js';
import { initBackup, bindBackup } from './backup.js';
import { getPrefs, setPref, clearPrefs } from './prefs.js';
import { mountPush } from './push.js';
import { initLearn, bindLearn, buildQueue, refreshIfWordsChanged, renderLearn, renderControls, renderHeader, setWordsChanged } from './learn.js';
import { initLists, bindLists, renderWords, renderLearned } from './lists.js';
import { bindAccess, renderAccess, linkFor } from './access.js';
import { initTeacher, bindTeacher, renderTeacher } from './teacher.js';

const KEY_STORE = 'slovnychok.k';
const KEY_RE = /^[A-Za-z0-9_-]{32,128}$/;
const TABS = { learn: 'tabLearn', words: 'tabWords', learned: 'tabLearned', access: 'tabAccess' };
let tab = 'learn';
let bound = false;
let curKey = null;
let hiddenAt = 0;
let lastDay = today();
let resuming = false;
let pushUi = null;
const AWAY_MS = 5 * 60 * 1000;

const views = ['setup', 'hello', 'fatal', 'main'];
function showView(name) {
  views.forEach((v) => { $(v).hidden = v !== name; });
}

function readKey() {
  const m = location.hash.match(/^#k=([A-Za-z0-9_-]{32,128})$/);
  if (m) return m[1];
  try {
    const v = localStorage.getItem(KEY_STORE);
    if (v && KEY_RE.test(v)) return v;
  } catch (e) { }
  return null;
}

function rememberKey(k) {
  try { localStorage.setItem(KEY_STORE, k); } catch (e) { }
  try { history.replaceState(null, '', location.pathname + location.search + '#k=' + k); } catch (e) { }
}

function forgetKey() {
  try { localStorage.removeItem(KEY_STORE); } catch (e) { }
  clearSnap();
  clearPrefs();
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
}

async function signOut() {
  try { await flush(); } catch (e) { }
  forgetKey();
  location.reload();
}

function setSync(kind) {
  const student = state.role === 's';
  const t = {
    loading: 'Завантажую…',
    saving: 'Зберігаю…',
    saved: student ? 'Прогрес зберігається.' : 'Слова, які ти додаєш, зберігаються одразу.',
    error: 'Не вдалося зберегти. Спробую ще раз за кілька секунд.',
    offline: student ? 'Офлайн. Прогрес збережеться, щойно з\'явиться інтернет.' : 'Офлайн. Показано останні збережені дані.'
  };
  $('sync').textContent = t[kind] || '';
}

function renderTabs() {
  $('tabWords').textContent = 'Слова · ' + activeCards().length;
  $('tabLearned').textContent = 'Вивчені · ' + doneCards().length;
}

function setTab(name) {
  tab = name;
  setPref('tab', name);
  Object.keys(TABS).forEach((n) => {
    $(n).hidden = n !== name;
    $(TABS[n]).setAttribute('aria-selected', String(n === name));
  });
  if (name === 'learn') {
    renderControls();
    refreshIfWordsChanged();
    renderLearn(true);
  } else if (name === 'words') renderWords();
  else if (name === 'learned') renderLearned();
  else {
    renderAccess();
    if (pushUi) pushUi.refresh();
  }
}

function bindStudent() {
  if (bound) return;
  bound = true;
  initLearn({ onChange: renderTabs, goWords: () => { setTab('words'); $('inEn').focus(); }, showLearn: () => setTab('learn') }, () => tab === 'learn' && state.role === 's');
  initLists({ onChange: renderTabs, setSync: setSync });
  Object.keys(TABS).forEach((n) => $(TABS[n]).addEventListener('click', () => setTab(n)));
  bindLearn();
  bindLists();
  bindAccess();
  initBackup({ onDone: () => { setWordsChanged(); renderTabs(); } });
  bindBackup();
  pushUi = mountPush($('pushBox'), 's');
  armDelete($('forget'), 'Вийти на цьому пристрої', signOut);
}

function loadFailed(e) {
  if (e.code === 'invalid_key') {
    showView('fatal');
    return;
  }
  showView('main');
  $('content').hidden = true;
  $('loadErr').hidden = false;
  $('loadErrText').textContent = e.code === 'not_installed'
    ? 'База ще не налаштована: не знайдено функції. Виконай supabase/schema.sql у SQL Editor.'
    : 'Не вдалося завантажити дані. Перевір з\'єднання та спробуй ще раз.';
  setSync('error');
}

async function startApp(key) {
  curKey = key;
  showView('main');
  $('content').hidden = true;
  $('loadErr').hidden = true;
  $('sync').textContent = 'Завантажую…';
  try {
    await load(key);
    await seedIfNeeded();
  } catch (e) {
    loadFailed(e);
    return;
  }
  rememberKey(key);
  $('content').hidden = false;
  const student = state.role === 's';
  $('studentApp').hidden = !student;
  $('teacherApp').hidden = student;
  $('meters').hidden = !student;
  $('subtitle').textContent = student ? '' : 'Режим вчителя';
  if (student) {
    bindStudent();
    buildQueue();
    renderControls();
    renderHeader();
    const saved = getPrefs().tab;
    setTab(TABS[saved] ? saved : 'learn');
    setSync(state.offline ? 'offline' : hasDirty() ? 'saving' : 'saved');
  } else {
    if (!$('tRefresh').dataset.bound) {
      $('tRefresh').dataset.bound = '1';
      initTeacher({ setSync: setSync });
      bindTeacher();
      armDelete($('tForget'), 'Вийти на цьому пристрої', signOut);
      mountPush($('tPushBox'), 't');
    }
    renderHeader();
    renderTeacher();
    setSync(state.offline ? 'offline' : 'saved');
  }
}

async function resume(force) {
  if (resuming || !state.key || $('content').hidden) return;
  const newDay = today() !== lastDay;
  const away = hiddenAt > 0 && Date.now() - hiddenAt > AWAY_MS;
  if (!force && !newDay && !away) return;
  if (document.querySelector('form.edit')) return;
  resuming = true;
  lastDay = today();
  try {
    if (hasDirty()) await flush();
    if (!hasDirty()) await load(state.key);
  } catch (e) { }
  resuming = false;
  setSync(state.offline ? 'offline' : hasDirty() ? 'saving' : 'saved');
  if (state.role === 's') {
    setWordsChanged();
    renderTabs();
    setTab(tab);
  } else {
    renderHeader();
    renderTeacher();
  }
}

function bindHello() {
  $('helloForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('helloStart');
    const msg = $('helloMsg');
    btn.disabled = true;
    msg.textContent = 'Створюю…';
    try {
      const sk = randomKey();
      const tk = randomKey();
      await api.createSpace(sk, tk, $('helloCode').value, { tkey: tk });
      rememberKey(sk);
      curKey = sk;
      $('helloLink').textContent = linkFor(sk);
      $('helloStartBox').hidden = true;
      $('helloOpenBox').hidden = true;
      $('helloSaved').hidden = false;
    } catch (e) {
      msg.textContent = e.code === 'closed'
        ? 'Невірний код створення, або створення нових словників закрите.'
        : e.code === 'not_installed'
          ? 'База ще не налаштована: виконай supabase/schema.sql у SQL Editor.'
          : 'Не вдалося створити. Перевір з\'єднання та спробуй ще раз.';
      btn.disabled = false;
    }
  });
  $('helloCopy').addEventListener('click', async () => {
    const ok = await copyText(linkFor(curKey), $('helloLink'));
    $('helloCopyMsg').textContent = ok ? 'Скопійовано.' : 'Посилання виділено, скопіюй його вручну.';
  });
  $('helloGo').addEventListener('click', () => startApp(curKey));
  $('helloOpen').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('helloLinkIn').value.trim();
    const m = v.match(/#k=([A-Za-z0-9_-]{32,128})\s*$/) || v.match(/^([A-Za-z0-9_-]{32,128})$/);
    if (!m) {
      $('helloOpenMsg').textContent = 'Не бачу ключа в цьому посиланні. Скопіюй посилання повністю.';
      return;
    }
    startApp(m[1]);
  });
}

function boot() {
  if (!configured) {
    showView('setup');
    return;
  }
  setSyncHandler(setSync);
  bindHello();
  $('loadRetry').addEventListener('click', () => startApp(curKey));
  $('fatalForget').addEventListener('click', () => { forgetKey(); location.reload(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      if (hasDirty()) flush();
    } else {
      resume();
      hiddenAt = 0;
    }
  });
  window.addEventListener('pagehide', () => {
    persistNow();
    if (hasDirty()) flush();
  });
  window.addEventListener('online', async () => {
    if (hasDirty()) await flush();
    if (state.offline) resume(true);
  });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  const key = readKey();
  if (key) startApp(key);
  else showView('hello');
}

boot();
