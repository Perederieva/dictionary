import { $, el, today, addDays, diffDays, shuffle, plural, dayText, kindCounts, icon, markOn } from './util.js';
import { check, norm, findCloze, expandAbbr } from './text.js';
import { state, activeCards, doneCards, markCard, markLog, markSettings, streakOf, matchesFilter, tagCounts } from './store.js';

const SESSION_MAX = 20;
const touch = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: none)').matches;
const INT = [0, 1, 3, 7, 14, 30];
const speechOk = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

let session = { queue: [], total: 0, cleared: 0, wrong: 0, ran: false, practice: false, hard: false, auto: 0 };
let choiceFor = { key: '', opts: [] };
let flipped = false;
let lastSpoken = '';
let pending = null;
let wordsChanged = false;
let hooks = { onChange: () => {}, goWords: () => {} };
let active = () => true;

export const setWordsChanged = () => { wordsChanged = true; };
export const initLearn = (h, isActive) => { hooks = h; active = isActive; };

const dirsFor = (d) => (state.settings.mode === 'cloze' ? ['ue'] : d === 'mix' ? ['eu', 'ue'] : [d]);
const bestOf = (c) => Math.max(c.eu ? c.eu.b : 0, c.ue ? c.ue.b : 0);
export const isLeech = (c) => (c.lapses || 0) >= 5 && bestOf(c) < 4;
const isHard = (x) => !!x.p && (x.p.b <= 1 || isLeech(x.c));
export const hardCount = () => uniqueCards(pairsAll().filter(isHard)).length;
const studyCards = () => activeCards().filter((c) => matchesFilter(c, state.settings.filter));
const filterOn = () => state.settings.filter.kind !== 'all' || !!state.settings.filter.tag || !!state.settings.filter.hw;

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
  if (practice === 'hard') {
    picked = uniqueCards(shuffle(all.filter(isHard)).sort((a, b) => a.p.b - b.p.b)).slice(0, SESSION_MAX);
  } else if (practice) {
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
  session = { queue: q, total: q.length, cleared: 0, wrong: 0, ran: false, practice: !!practice, hard: practice === 'hard', auto: 0 };
  flipped = false;
  pending = null;
}

export function refreshIfWordsChanged() {
  if (wordsChanged) {
    wordsChanged = false;
    buildQueue(session.hard ? 'hard' : session.practice);
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
      c.lapses = (c.lapses || 0) + 1;
      markCard(c);
    }
  } else {
    const prev = c[item.d];
    const isNew = !prev;
    if (g === 'again' && !isNew) c.lapses = (c.lapses || 0) + 1;
    const nx = nextFor(prev, g, isNew);
    c[item.d] = { b: nx.b, d: addDays(today(), nx.days) };
    if (g === 'know' && prev && prev.b === 5 && dirsFor(state.settings.dir).every((d) => c[d] && c[d].b === 5)) {
      c.done = Date.now();
      session.auto++;
    }
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
  const n = state.log[today()] || 0;
  $('chipStreak').replaceChildren(icon('flame', 16), String(s));
  $('chipStreak').setAttribute('aria-label', 'Серія: ' + s + ' ' + plural(s, 'день', 'дні', 'днів'));
  $('chipStreak').title = 'Серія днів поспіль';
  $('chipToday').replaceChildren(icon('check', 16), String(n));
  $('chipToday').setAttribute('aria-label', 'Сьогодні: ' + n + ' ' + plural(n, 'повторення', 'повторення', 'повторень'));
  $('chipToday').title = 'Повторень сьогодні';
}

export function renderStrip() {
  const c = counts();
  $('sDue').textContent = c.due;
  $('sNew').textContent = c.freshToday;
  $('sLearned').textContent = doneCards().length;
  $('practiceTop').hidden = c.seen === 0;
  const h = hardCount();
  $('hardBtn').hidden = h === 0;
  $('hardBtn').textContent = 'Складні слова (' + h + ')';
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
  $('dirSeg').hidden = state.settings.mode === 'cloze';
  $('fKind').value = state.settings.filter.kind;
  const sel = $('fTag');
  const kind = state.settings.filter.kind;
  const tags = tagCounts(activeCards().filter((c) => kind === 'all' || c.kind === kind));
  if (state.settings.filter.tag && !tags.some((t) => t[0] === state.settings.filter.tag)) state.settings.filter.tag = '';
  sel.replaceChildren(el('option', { value: '', text: 'Усі теми' }));
  tags.forEach((t) => sel.append(el('option', { value: t[0], text: t[0] + ' (' + t[1] + ')' })));
  sel.value = state.settings.filter.tag;
  const anyHw = activeCards().some((c) => c.hw);
  if (!anyHw) state.settings.filter.hw = false;
  $('fHwBox').hidden = !anyHw;
  $('fHw').checked = !!state.settings.filter.hw;
  const f = state.settings.filter;
  kindCounts($('fKind'), activeCards().filter((c) => (!f.tag || c.tags.indexOf(f.tag) !== -1) && (!f.hw || c.hw)), { all: 'Усе', word: 'Слова', phrase: 'Фрази' });
  markOn($('fKind'), 'all');
  markOn($('fTag'), '');
  $('fHwBox').classList.toggle('on', !!f.hw);
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
    title = session.hard ? 'Складні слова повторено' : session.practice ? 'Тренування завершено' : 'Раунд завершено';
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
  if (session.auto) text += (text ? ' ' : '') + 'Автоматично перенесено у вивчені: ' + session.auto + ' ' + plural(session.auto, 'слово', 'слова', 'слів') + ' (рівень 5 і правильна відповідь через місяць).';
  $('doneTitle').textContent = title;
  $('doneText').textContent = text;
  $('moreBtn').hidden = !avail;
  const pb = $('practiceBtn');
  pb.hidden = c.seen === 0;
  pb.textContent = session.ran ? 'Повторити ще раз' : 'Повторити слова';
  pb.className = 'btn' + (avail ? '' : ' primary');
}

function choiceOptions(c, eu) {
  const key = c.id + (eu ? 'eu' : 'ue');
  if (choiceFor.key === key) return choiceFor.opts;
  const target = eu ? c.uk : c.en;
  const seen = new Set([norm(target)]);
  const pool = shuffle(state.cards.filter((x) => x.id !== c.id));
  pool.sort((x, y) => (x.kind === c.kind ? 0 : 1) - (y.kind === c.kind ? 0 : 1));
  const opts = [target];
  for (const x of pool) {
    if (opts.length >= 4) break;
    const t = eu ? x.uk : x.en;
    if (seen.has(norm(t))) continue;
    seen.add(norm(t));
    opts.push(t);
  }
  choiceFor = { key: key, opts: shuffle(opts), target: target };
  return choiceFor.opts;
}

function renderChoices(c, eu) {
  const box = $('choices');
  const opts = choiceOptions(c, eu);
  box.replaceChildren(...opts.map((t, i) => {
    const b = el('button', { type: 'button', class: 'choice', 'data-i': String(i), lang: eu ? 'uk' : 'en' }, el('span', { class: 'n', text: String(i + 1) }), el('span', { text: t }));
    if (pending) {
      b.setAttribute('aria-disabled', 'true');
      if (t === choiceFor.target) b.classList.add('ok');
      else if (pending.picked === i) b.classList.add('bad');
      else b.hidden = true;
    }
    return b;
  }));
}

function pickChoice(i) {
  const cur = currentCard();
  if (!cur || pending || state.settings.mode !== 'choice') return;
  const t = choiceFor.opts[i];
  if (t === undefined) return;
  const right = t === choiceFor.target;
  pending = { res: right ? 'exact' : 'wrong', g: right ? 'know' : 'again', target: choiceFor.target, picked: i };
  flipped = true;
  renderLearn();
}

function goNext() {
  if (pending) grade(pending.g);
}

function clozeFor(c) {
  return state.settings.mode === 'cloze' ? findCloze(c.en, c.ex) : null;
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
  const mode = state.settings.mode;
  const eu = item.d === 'eu';
  const cz = clozeFor(c);
  const front = eu ? { lang: 'English', text: c.en, code: 'en' } : { lang: 'Українська', text: c.uk, code: 'uk' };
  const back = eu ? { lang: 'Українська', text: c.uk, code: 'uk' } : { lang: 'English', text: c.en, code: 'en' };
  const fw = $('frontWord');
  if (cz) {
    $('frontLang').textContent = 'Встав пропущене';
    fw.replaceChildren(cz.before, el('span', { class: 'gap', text: '_____' }), cz.after);
    fw.lang = 'en';
    fw.classList.add('cloze');
    $('frontHint').textContent = c.uk;
    $('frontHint').hidden = false;
  } else {
    $('frontLang').textContent = front.lang;
    fw.textContent = front.text;
    fw.lang = front.code;
    fw.classList.remove('cloze');
    $('frontHint').hidden = true;
  }
  $('backLang').textContent = back.lang;
  $('backWord').textContent = back.text;
  $('backWord').lang = back.code;
  $('backEx').textContent = c.ex || '';
  $('backEx').hidden = !c.ex;
  $('frontIpa').textContent = c.ipa || '';
  $('frontIpa').hidden = !(eu && !cz && c.ipa);
  $('backIpa').textContent = c.ipa || '';
  $('backIpa').hidden = !(!eu && c.ipa);
  const ft = [];
  if (c.kind === 'phrase') ft.push(el('span', { class: 'k', text: 'фраза' }));
  if (c.hw) ft.push(el('span', { text: 'домашнє' }));
  c.tags.slice(0, 3).forEach((t) => ft.push(el('span', { text: t })));
  $('frontTags').replaceChildren(...(cz ? [] : ft));
  $('backNote').textContent = c.note ? 'Нотатка вчительки: ' + c.note : '';
  $('backNote').hidden = !c.note;
  $('card').classList.toggle('is-flipped', flipped);
  $('front').setAttribute('aria-hidden', String(flipped));
  $('back').setAttribute('aria-hidden', String(!flipped));
  $('bar').style.width = (session.total ? Math.min(100, (session.cleared / session.total) * 100) : 0) + '%';
  $('left').textContent = 'Залишилось ' + session.queue.length;
  $('practiceTag').hidden = !session.practice;
  $('practiceTag').textContent = session.hard ? 'Складні слова' : 'Тренування';

  const type = mode === 'type' || mode === 'cloze';
  $('stage').dataset.mode = mode;
  const choice = mode === 'choice';
  $('typeForm').hidden = !(type && !pending);
  $('answer').lang = eu ? 'uk' : 'en';
  $('answer').placeholder = cz ? 'Пропущене слово' : 'Введи переклад';
  $('choices').hidden = !choice;
  if (choice) renderChoices(c, eu);
  $('verdict').hidden = !pending || choice;
  $('nextRow').hidden = !pending;
  $('grades').hidden = type || choice || !flipped;
  $('speak').hidden = !speechOk || (!eu && !flipped);
  $('moveBtn').hidden = !flipped;

  const enVisible = eu !== flipped;
  const spokeKey = item.id + item.d + flipped;
  if (enVisible && spokeKey !== lastSpoken) {
    lastSpoken = spokeKey;
    speak(cz && flipped ? c.ex : c.en);
  }

  if (pending) {
    const v = $('verdict');
    v.className = 'verdict ' + (pending.res === 'exact' ? 'ok' : pending.res === 'near' ? 'near' : 'bad');
    if (pending.res === 'exact') v.textContent = 'Правильно.';
    else if (pending.res === 'near') v.textContent = 'Майже, є дрібна помилка. Правильно: ' + pending.target;
    else if (pending.res === 'skip') v.textContent = 'Правильна відповідь: ' + pending.target;
    else v.textContent = 'Не збіглося. Правильно: ' + pending.target;
  }

  if (flipped && !type && !choice) {
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
  if (touch) hint = pending ? 'Свайп вліво — далі' : !choice && !type && !flipped ? 'Торкнись картки, щоб перевернути' : '';
  else if (choice) hint = pending ? 'Enter — далі' : 'Обери варіант: клік або 1–4';
  else if (type) hint = pending ? 'Enter — далі' : 'Enter — перевірити';
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
    const u = new SpeechSynthesisUtterance(expandAbbr(text));
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
      const wasCloze = state.settings.mode === 'cloze';
      state.settings.mode = b.dataset.mode;
      flipped = false;
      pending = null;
      markSettings();
      if (wasCloze !== (state.settings.mode === 'cloze')) buildQueue();
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
    state.settings.filter = { kind: $('fKind').value, tag: $('fTag').value, hw: $('fHw').checked };
    renderControls();
    markSettings();
    buildQueue();
    renderLearn(true);
  };
  $('fKind').addEventListener('change', onFilter);
  $('fTag').addEventListener('change', onFilter);
  $('fHw').addEventListener('change', onFilter);
  $('moreToggle').addEventListener('click', () => {
    const open = $('learnMore').hidden;
    $('learnMore').hidden = !open;
    $('moreToggle').setAttribute('aria-expanded', String(open));
  });
  $('practiceTop').addEventListener('click', startPractice);
  $('hardBtn').addEventListener('click', () => {
    buildQueue('hard');
    hooks.showLearn();
    renderLearn(true);
  });
  $('choices').addEventListener('click', (e) => {
    const b = e.target.closest('.choice');
    if (!b) return;
    if (pending) goNext();
    else pickChoice(Number(b.dataset.i));
  });
  let sx = 0;
  let sy = 0;
  $('stage').addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    sx = t.clientX;
    sy = t.clientY;
  }, { passive: true });
  $('stage').addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if (pending && dx < -60 && Math.abs(dy) < Math.abs(dx) / 2) goNext();
  }, { passive: true });
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
  $('nextBtn').addEventListener('click', goNext);
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
    const cz = clozeFor(cur.c);
    const target = cz ? cz.blank : cur.item.d === 'eu' ? cur.c.uk : cur.c.en;
    const order = { exact: 3, near: 2, wrong: 1 };
    let res = check($('answer').value, target);
    if (cz && res !== null) {
      const alt = check($('answer').value, cur.c.en);
      if (order[alt] > order[res]) res = alt;
    }
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
    const cz = clozeFor(cur.c);
    pending = { res: 'skip', g: 'again', target: cz ? cz.blank : cur.item.d === 'eu' ? cur.c.uk : cur.c.en };
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
    } else if (state.settings.mode === 'choice' && !pending && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pickChoice(Number(e.key) - 1);
    } else if (pending && (e.key === ' ' || e.key === 'Enter') && !onBtn) {
      e.preventDefault();
      grade(pending.g);
    }
  });
}
