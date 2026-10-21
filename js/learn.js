import { $, el, today, addDays, diffDays, shuffle, plural, dayText } from './util.js';
import { check } from './text.js';
import { state, activeCards, doneCards, markCard, markLog, markSettings, streakOf, matchesFilter, tagCounts } from './store.js';

const SESSION_MAX = 20;
const INT = [0, 1, 3, 7, 14, 30];
const speechOk = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

let session = { queue: [], total: 0, cleared: 0, wrong: 0, ran: false, practice: false };
let flipped = false;
let lastSpoken = '';
let pending = null;
let wordsChanged = false;
let hooks = { onChange: () => {}, goWords: () => {} };
let active = () => true;

export const setWordsChanged = () => { wordsChanged = true; };
export const initLearn = (h, isActive) => { hooks = h; active = isActive; };

const dirsFor = (d) => (d === 'mix' ? ['eu', 'ue'] : [d]);
const studyCards = () => activeCards().filter((c) => matchesFilter(c, state.settings.filter));
const filterOn = () => state.settings.filter.kind !== 'all' || !!state.settings.filter.tag;

function pairsAll() {
  const out = [];
  const dirs = dirsFor(state.settings.dir);
  studyCards().forEach((c) => dirs.forEach((d) => out.push({ c: c, d: d, p: c[d] })));
  return out;
}

function uniqueCards(list) {
  const seen = new Set();
  return list.filter((x) => {
    if (seen.has(x.c.id)) return false;
    seen.add(x.c.id);
    return true;
  });
}

function introToday() {
  const i = state.settings.intro;
  return i && i.date === today() ? i.n : 0;
}

function bumpIntro() {
  const t = today();
  const i = state.settings.intro;
  state.settings.intro = { date: t, n: (i && i.date === t ? i.n : 0) + 1 };
  markSettings();
}

function bumpLog() {
  const t = today();
  state.log[t] = (state.log[t] || 0) + 1;
  markLog(t);
}

function counts() {
  const t = today();
  let due = 0;
  let fresh = 0;
  let seen = 0;
  pairsAll().forEach((x) => {
    if (!x.p) fresh++;
    else {
      seen++;
      if (x.p.d <= t) due++;
    }
  });
  const left = Math.max(0, state.settings.newPerDay - introToday());
  return { due: due, fresh: fresh, freshToday: Math.min(fresh, left), seen: seen };
}

export function buildQueue(practice) {
  const all = pairsAll();
  let picked = [];
  if (practice) {
    picked = uniqueCards(shuffle(all.filter((x) => x.p)).sort((a, b) => a.p.b - b.p.b)).slice(0, SESSION_MAX);
  } else {
    const t = today();
    const due = all
      .filter((x) => x.p && x.p.d <= t)
      .sort((a, b) => (a.p.d < b.p.d ? -1 : a.p.d > b.p.d ? 1 : a.p.b - b.p.b));
    const fresh = uniqueCards(shuffle(all.filter((x) => !x.p))).slice(0, Math.max(0, state.settings.newPerDay - introToday()));
    picked = uniqueCards(due.concat(fresh)).slice(0, SESSION_MAX);
  }
  const q = shuffle(picked).map((x) => ({ id: x.c.id, d: x.d }));
  session = { queue: q, total: q.length, cleared: 0, wrong: 0, ran: false, practice: !!practice };
  flipped = false;
  pending = null;
}

export function refreshIfWordsChanged() {
  if (wordsChanged) {
    wordsChanged = false;
    buildQueue(session.practice);
  }
}

function nextFor(p, g, isNew) {
  const b0 = p ? p.b : 0;
  if (g === 'know') {
    const b = isNew ? 2 : Math.min(5, b0 + 1);
    return { b: b, days: INT[b] };
  }
  if (g === 'almost') return { b: b0, days: 1 };
  return { b: 0, days: 0 };
}

function currentCard() {
  while (session.queue.length && !state.cards.some((x) => x.id === session.queue[0].id && !x.done)) session.queue.shift();
  const item = session.queue[0];
  if (!item) return null;
  return { item: item, c: state.cards.find((x) => x.id === item.id) };
}

function grade(g) {
  const cur = currentCard();
  if (!cur) return;
  const item = cur.item;
  const c = cur.c;
  if (session.practice) {
    if (g === 'again' && c[item.d]) {
      c[item.d] = { b: 0, d: today() };
      markCard(c);
    }
  } else {
    const isNew = !c[item.d];
    const nx = nextFor(c[item.d], g, isNew);
    c[item.d] = { b: nx.b, d: addDays(today(), nx.days) };
    markCard(c);
    if (isNew) bumpIntro();
  }
  bumpLog();
  session.queue.shift();
  if (g === 'again') {
    session.wrong++;
    session.queue.splice(Math.min(3, session.queue.length), 0, item);
  } else {
    session.cleared++;
  }
  if (!session.queue.length) session.ran = true;
  afterGrade();
}

function afterGrade() {
  flipped = false;
  pending = null;
  lastSpoken = '';
  $('answer').value = '';
  const card = $('card');
  card.classList.add('snap');
  renderLearn(true);
  void card.offsetWidth;
  card.classList.remove('snap');
}

export function setDone(id, val) {
  const c = state.cards.find((x) => x.id === id);
  if (!c) return 0;
  if (val) c.done = Date.now();
  else delete c.done;
  markCard(c);
  const before = session.queue.length;
  session.queue = session.queue.filter((x) => x.id !== id);
  wordsChanged = true;
  return before - session.queue.length;
}

export function dropFromQueue() {
  session.queue = session.queue.filter((x) => state.cards.some((c) => c.id === x.id));
  wordsChanged = true;
}

function moveCurrentToLearned() {
  const cur = currentCard();
  if (!cur) return;
  const removed = setDone(cur.c.id, true);
  session.total = Math.max(0, session.total - removed);
  if (!session.queue.length) session.ran = true;
  afterGrade();
}

export function renderHeader() {
  let ds = '';
  try {
    ds = new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    ds = today();
  }
  $('date').textContent = ds;
  const s = streakOf(state.log);
  $('chipStreak').replaceChildren('Серія: ', el('b', { text: s + ' ' + plural(s, 'день', 'дні', 'днів') }));
  $('chipToday').replaceChildren('Сьогодні: ', el('b', { text: String(state.log[today()] || 0) }));
}

export function renderStrip() {
  const c = counts();
  $('sDue').textContent = c.due;
  $('sNew').textContent = c.freshToday;
  $('sLearned').textContent = doneCards().length;
  $('practiceTop').hidden = c.seen === 0;
  hooks.onChange();
}

export function renderControls() {
  document.querySelectorAll('#dirSeg button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.dir === state.settings.dir));
  });
  document.querySelectorAll('#modeSeg button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.mode === state.settings.mode));
  });
  $('newPer').value = String(state.settings.newPerDay);
  $('fKind').value = state.settings.filter.kind;
  const sel = $('fTag');
  const kind = state.settings.filter.kind;
  const tags = tagCounts(activeCards().filter((c) => kind === 'all' || c.kind === kind));
  if (state.settings.filter.tag && !tags.some((t) => t[0] === state.settings.filter.tag)) state.settings.filter.tag = '';
  sel.replaceChildren(el('option', { value: '', text: 'Усі теми' }));
  tags.forEach((t) => sel.append(el('option', { value: t[0], text: t[0] + ' (' + t[1] + ')' })));
  sel.value = state.settings.filter.tag;
}

function nextDueText() {
  const t = today();
  let best = null;
  pairsAll().forEach((x) => {
    if (x.p && x.p.d > t && (best === null || x.p.d < best)) best = x.p.d;
  });
  return best === null ? '' : dayText(diffDays(t, best));
}

function renderDone() {
  const c = counts();
  const act = studyCards();
  const avail = c.due + c.freshToday > 0;
  let text = '';
  let title = '';
  if (!state.cards.length) {
    title = 'Поки що порожньо';
    text = 'Додай перші слова у вкладці «Слова».';
  } else if (!act.length && filterOn() && activeCards().length) {
    title = 'У цій добірці немає слів';
    text = 'Зміни тип або тему вгорі.';
  } else if (!act.length) {
    title = 'Усі слова вже у вивчених';
    text = 'Додай нові у вкладці «Слова» або поверни щось із вивчених.';
  } else if (session.ran) {
    title = session.practice ? 'Тренування завершено' : 'Раунд завершено';
    text = 'Пройдено ' + session.total + ' ' + plural(session.total, 'картку', 'картки', 'карток') +
      (session.wrong ? ', довелося повторити ' + session.wrong + ' ' + plural(session.wrong, 'раз', 'рази', 'разів') + '.' : ' без жодного повтору.');
  } else {
    title = 'На сьогодні все';
  }
  if (!avail && act.length) {
    const nd = nextDueText();
    if (c.fresh > 0 && c.freshToday === 0) text += (text ? ' ' : '') + 'Ліміт нових слів на сьогодні вичерпано. Збільш його вгорі, якщо хочеш ще.';
    if (nd) text += (text ? ' ' : '') + 'Наступне повторення: ' + nd + '.';
  }
  $('doneTitle').textContent = title;
  $('doneText').textContent = text;
  $('moreBtn').hidden = !avail;
  const pb = $('practiceBtn');
  pb.hidden = c.seen === 0;
  pb.textContent = session.ran ? 'Повторити ще раз' : 'Повторити слова';
  pb.className = 'btn' + (avail ? '' : ' primary');
}

export function renderLearn(focusInput) {
  renderStrip();
  renderHeader();
  const cur = currentCard();
  const stage = $('stage');
  const done = $('done');
  if (!cur) {
    stage.hidden = true;
    done.hidden = false;
    renderDone();
    return;
  }
  done.hidden = true;
  stage.hidden = false;
  const item = cur.item;
  const c = cur.c;
  const eu = item.d === 'eu';
  const front = eu ? { lang: 'English', text: c.en, code: 'en' } : { lang: 'Українська', text: c.uk, code: 'uk' };
  const back = eu ? { lang: 'Українська', text: c.uk, code: 'uk' } : { lang: 'English', text: c.en, code: 'en' };
  $('frontLang').textContent = front.lang;
  $('frontWord').textContent = front.text;
  $('frontWord').lang = front.code;
  $('backLang').textContent = back.lang;
  $('backWord').textContent = back.text;
  $('backWord').lang = back.code;
  $('backEx').textContent = c.ex || '';
  $('backEx').hidden = !c.ex;
  $('card').classList.toggle('is-flipped', flipped);
  $('front').setAttribute('aria-hidden', String(flipped));
  $('back').setAttribute('aria-hidden', String(!flipped));
  $('bar').style.width = (session.total ? Math.min(100, (session.cleared / session.total) * 100) : 0) + '%';
  $('left').textContent = 'Залишилось ' + session.queue.length;
  $('practiceTag').hidden = !session.practice;

  const type = state.settings.mode === 'type';
  $('typeForm').hidden = !(type && !pending);
  $('answer').lang = eu ? 'uk' : 'en';
  $('verdict').hidden = !pending;
  $('nextRow').hidden = !pending;
  $('grades').hidden = type || !flipped;
  $('speak').hidden = !speechOk || (!eu && !flipped);
  $('moveBtn').hidden = !flipped;

  const enVisible = eu !== flipped;
  const spokeKey = item.id + item.d + flipped;
  if (enVisible && spokeKey !== lastSpoken) {
    lastSpoken = spokeKey;
    speak(c.en);
  }

  if (pending) {
    const v = $('verdict');
    v.className = 'verdict ' + (pending.res === 'exact' ? 'ok' : pending.res === 'near' ? 'near' : 'bad');
    if (pending.res === 'exact') v.textContent = 'Правильно.';
    else if (pending.res === 'near') v.textContent = 'Майже, є дрібна помилка. Правильно: ' + pending.target;
    else if (pending.res === 'skip') v.textContent = 'Правильна відповідь: ' + pending.target;
    else v.textContent = 'Не збіглося. Правильно: ' + pending.target;
  }

  if (flipped && !type) {
    if (session.practice) {
      $('gAgain').textContent = 'ще раз сьогодні';
      $('gAlmost').textContent = 'без змін';
      $('gKnow').textContent = 'без змін';
    } else {
      const p = c[item.d];
      const isNew = !p;
      $('gAgain').textContent = dayText(nextFor(p, 'again', isNew).days);
      $('gAlmost').textContent = dayText(nextFor(p, 'almost', isNew).days);
      $('gKnow').textContent = dayText(nextFor(p, 'know', isNew).days);
    }
  }

  let hint = '';
  if (type) hint = pending ? 'Enter — далі' : 'Enter — перевірити';
  else hint = flipped ? '1 — не знаю · 2 — майже · 3 — знаю (або стрілки ← ↓ →)' : 'Пробіл або клік — перевернути';
  $('hint').textContent = hint;

  if (pending) $('nextBtn').focus();
  else if (focusInput && type) $('answer').focus();
}

function speak(text) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    s.speak(u);
  } catch (e) { }
}

export function startPractice() {
  buildQueue(true);
  hooks.showLearn();
  renderLearn(true);
}

export function bindLearn() {
  document.querySelectorAll('#dirSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      state.settings.dir = b.dataset.dir;
      markSettings();
      buildQueue();
      renderControls();
      renderLearn(true);
    });
  });
  document.querySelectorAll('#modeSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      state.settings.mode = b.dataset.mode;
      flipped = false;
      pending = null;
      markSettings();
      renderControls();
      const card = $('card');
      card.classList.add('snap');
      renderLearn(true);
      void card.offsetWidth;
      card.classList.remove('snap');
    });
  });
  $('newPer').addEventListener('change', () => {
    state.settings.newPerDay = Number($('newPer').value) || 10;
    markSettings();
    buildQueue();
    renderLearn(true);
  });
  const onFilter = () => {
    state.settings.filter = { kind: $('fKind').value, tag: $('fTag').value };
    renderControls();
    markSettings();
    buildQueue();
    renderLearn(true);
  };
  $('fKind').addEventListener('change', onFilter);
  $('fTag').addEventListener('change', onFilter);
  $('practiceTop').addEventListener('click', startPractice);
  $('practiceBtn').addEventListener('click', startPractice);
  $('moveBtn').addEventListener('click', moveCurrentToLearned);
  $('goWords').addEventListener('click', () => hooks.goWords());
  $('card').addEventListener('click', () => {
    if (state.settings.mode === 'flip' && session.queue.length) {
      flipped = !flipped;
      renderLearn();
    }
  });
  document.querySelectorAll('#grades button').forEach((b) => {
    b.addEventListener('click', () => grade(b.dataset.g));
  });
  $('nextBtn').addEventListener('click', () => { if (pending) grade(pending.g); });
  $('moreBtn').addEventListener('click', () => {
    buildQueue();
    renderLearn(true);
  });
  $('speak').addEventListener('click', () => {
    const cur = currentCard();
    if (cur) speak(cur.c.en);
  });

  $('typeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const cur = currentCard();
    if (!cur || pending) return;
    const target = cur.item.d === 'eu' ? cur.c.uk : cur.c.en;
    const res = check($('answer').value, target);
    if (res === null) {
      $('answer').focus();
      return;
    }
    pending = { res: res, g: res === 'wrong' ? 'again' : 'know', target: target };
    flipped = true;
    renderLearn();
  });
  $('skipBtn').addEventListener('click', () => {
    const cur = currentCard();
    if (!cur || pending) return;
    pending = { res: 'skip', g: 'again', target: cur.item.d === 'eu' ? cur.c.uk : cur.c.en };
    flipped = true;
    renderLearn();
  });

  document.addEventListener('keydown', (e) => {
    if (!active() || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ($('stage').hidden || !session.queue.length) return;
    const onBtn = tag === 'BUTTON';
    if (state.settings.mode === 'flip') {
      if (!flipped) {
        if ((e.key === ' ' || e.key === 'Enter') && !onBtn) {
          e.preventDefault();
          flipped = true;
          renderLearn();
        }
      } else {
        const map = { '1': 'again', ArrowLeft: 'again', '2': 'almost', ArrowDown: 'almost', '3': 'know', ArrowRight: 'know' };
        if (map[e.key]) {
          e.preventDefault();
          grade(map[e.key]);
        } else if ((e.key === ' ' || e.key === 'Enter') && !onBtn) {
          e.preventDefault();
          flipped = false;
          renderLearn();
        }
      }
    } else if (pending && (e.key === ' ' || e.key === 'Enter') && !onBtn) {
      e.preventDefault();
      grade(pending.g);
    }
  });
}
