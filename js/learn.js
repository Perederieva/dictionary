import { $, el, today, addDays, diffDays, shuffle, plural, dayText, kindCounts, icon, markOn } from './util.js';
import { check, norm, canon, findCloze, expandAbbr, diffAnswer } from './text.js';
import { state, activeCards, doneCards, markCard, markLog, markSettings, streakOf, matchesFilter, tagCounts, lessonCounts, setCardDef, setCardAi } from './store.js';
import { getPrefs, setPref } from './prefs.js';
import { aiStory, aiExplain, aiExample, aiOrder, enrich, aiMessage, withRetry } from './ai.js';

const SESSION_MAX = 20;
const touch = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: none)').matches;
const INT = [0, 1, 3, 7, 14, 30];
const speechOk = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

let session = { queue: [], total: 0, cleared: 0, wrong: 0, ran: false, practice: false, hard: false, auto: 0 };
let board = null;
const shownEx = new WeakMap();
const ROT_KEY = 'slovnychok.exrot';
let whyFor = '';
let storyCtrl = null;
const MIXABLE = ['type', 'cloze', 'choice', 'listen', 'build'];
const MIX_LABEL = { type: 'Писати', cloze: 'Речення', choice: 'Вибір', listen: 'Диктант', build: 'Скласти речення' };
const autoSound = () => getPrefs().sound !== false;
let choiceFor = { key: '', opts: [] };
let flipped = false;
let lastSpoken = '';
let pending = null;
let build = null;
let buildDragged = false;
let wordsChanged = false;
let hooks = { onChange: () => {}, goWords: () => {} };
let active = () => true;

export const setWordsChanged = () => { wordsChanged = true; };
export const initLearn = (h, isActive) => { hooks = h; active = isActive; };

const dirsFor = (d) => (state.settings.mode === 'cloze' || state.settings.mode === 'listen' || state.settings.mode === 'build' ? ['ue'] : d === 'mix' ? ['eu', 'ue'] : [d]);
const mixList = () => {
  const list = (state.settings.mix || []).filter((m) => MIXABLE.indexOf(m) !== -1 && (m !== 'listen' || speechOk));
  return list.length ? list : ['type'];
};

function assignMode(c) {
  const m = state.settings.mode;
  if (m !== 'mix') return m;
  const ok = mixList().filter((x) => (x !== 'cloze' || hasCloze(c)) && (x !== 'build' || hasBuild(c)));
  return ok.length ? ok[Math.floor(Math.random() * ok.length)] : 'type';
}

const modeNow = () => {
  const q = session.queue[0];
  return q && q.m ? q.m : state.settings.mode;
};
const bestOf = (c) => Math.max(c.eu ? c.eu.b : 0, c.ue ? c.ue.b : 0);
export const isLeech = (c) => (c.lapses || 0) >= 5 && bestOf(c) < 4;
const isHard = (x) => !!x.p && (x.p.b <= 1 || isLeech(x.c));
export const hardCount = () => uniqueCards(pairsAll().filter(isHard)).length;
const studyCards = () => activeCards().filter((c) => matchesFilter(c, state.settings.filter) && (state.settings.mode !== 'cloze' || hasCloze(c)) && (state.settings.mode !== 'build' || hasBuild(c)));
const filterOn = () => state.settings.filter.kind !== 'all' || !!state.settings.filter.tag || !!state.settings.filter.hw || !!state.settings.filter.lesson;
const newLimit = () => (state.settings.filter.lesson ? Infinity : Math.max(0, state.settings.newPerDay - introToday()));

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
  const left = newLimit();
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
    const lim = newLimit();
    const fresh = uniqueCards(shuffle(all.filter((x) => !x.p))).slice(0, lim === Infinity ? SESSION_MAX : lim);
    picked = uniqueCards(due.concat(fresh)).slice(0, SESSION_MAX);
  }
  const q = shuffle(picked).map((x) => ({ id: x.c.id, d: x.d, m: assignMode(x.c) }));
  session = { queue: q, total: q.length, cleared: 0, wrong: 0, ran: false, practice: !!practice, hard: practice === 'hard', auto: 0 };
  board = null;
  build = null;
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

function applyGrade(item, c, g) {
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
  const at = session.queue.indexOf(item);
  if (at !== -1) session.queue.splice(at, 1);
  if (g === 'again') {
    session.wrong++;
    session.queue.splice(Math.min(3, session.queue.length), 0, item);
  } else {
    session.cleared++;
  }
  if (!session.queue.length) session.ran = true;
}

function grade(g) {
  const cur = currentCard();
  if (!cur) return;
  applyGrade(cur.item, cur.c, g);
  afterGrade();
}

function afterGrade() {
  flipped = false;
  pending = null;
  build = null;
  lastSpoken = '';
  $('answer').value = '';
  const card = $('card');
  const box = $('flipBox');
  card.classList.add('snap');
  box.classList.remove('fly', 'spring', 'enter', 'drag');
  delete box.dataset.lean;
  box.style.transform = '';
  delete box.dataset.g;
  renderLearn(true);
  void card.offsetWidth;
  card.classList.remove('snap');
  box.classList.add('enter');
}

function bindSwipe() {
  const card = $('card');
  const box = $('flipBox');
  let drag = null;
  let moved = false;
  let frame = 0;
  const lean = (dx, dy) => (Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'again' : 'know') : dy > 0 ? 'almost' : '');
  const dirOf = (dx, dy) => {
    const g = lean(dx, dy);
    if (g === 'almost') return dy > 70 ? g : '';
    return g && Math.abs(dx) > 70 ? g : '';
  };
  const clear = () => {
    delete box.dataset.g;
    delete box.dataset.lean;
    box.classList.remove('drag');
  };
  card.addEventListener('pointerdown', (e) => {
    if (modeNow() !== 'flip' || !flipped || !session.queue.length) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.edge, .mini')) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, dx: 0, dy: 0 };
    moved = false;
    box.classList.remove('spring', 'enter');
  });
  card.addEventListener('dragstart', (e) => e.preventDefault());
  card.addEventListener('touchmove', (e) => {
    if (drag) e.preventDefault();
  }, { passive: false });
  card.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = Math.max(-40, e.clientY - drag.y);
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) {
      moved = true;
      box.classList.add('drag');
      try { card.setPointerCapture(e.pointerId); } catch (err) { }
    }
    drag.dx = dx;
    drag.dy = dy;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!drag) return;
      box.style.transform = 'translate3d(' + drag.dx + 'px,' + drag.dy + 'px,0) rotate(' + (drag.dx / 18) + 'deg)';
      box.dataset.lean = lean(drag.dx, drag.dy);
      const g = dirOf(drag.dx, drag.dy);
      if (g) box.dataset.g = g;
      else delete box.dataset.g;
    });
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = Math.max(-40, e.clientY - drag.y);
    drag = null;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (!moved) return;
    const g = e.type === 'pointerup' ? dirOf(dx, dy) : '';
    if (!g) {
      clear();
      box.classList.add('spring');
      box.style.transform = '';
      return;
    }
    const w = window.innerWidth;
    const to = g === 'again' ? 'translate3d(' + (-w * 1.2) + 'px,' + dy + 'px,0) rotate(-24deg)'
      : g === 'know' ? 'translate3d(' + (w * 1.2) + 'px,' + dy + 'px,0) rotate(24deg)'
      : 'translate3d(' + dx + 'px,' + (window.innerHeight * .8) + 'px,0)';
    box.classList.add('fly');
    box.style.transform = to;
    setTimeout(() => grade(g), 240);
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
  card.addEventListener('click', (e) => {
    if (moved) {
      moved = false;
      e.stopImmediatePropagation();
      return;
    }
    const b = e.target.closest('.edge');
    if (b && flipped) {
      e.stopImmediatePropagation();
      grade(b.dataset.swipe);
    }
  }, true);
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
  const goal = Number(state.settings.goal) || 0;
  const chip = $('chipToday');
  chip.replaceChildren(icon(goal ? 'target' : 'check', 16), goal ? n + '/' + goal : String(n));
  chip.classList.toggle('met', !!goal && n >= goal);
  chip.style.setProperty('--goal', goal ? Math.min(100, Math.round((n / goal) * 100)) + '%' : '0%');
  chip.classList.toggle('goal', !!goal);
  chip.setAttribute('aria-label', 'Сьогодні: ' + n + ' ' + plural(n, 'повторення', 'повторення', 'повторень') + (goal ? ', ціль ' + goal : ''));
  chip.title = goal ? 'Повторень сьогодні / ціль на день' : 'Повторень сьогодні';
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
  document.querySelectorAll('#modeSeg [data-mode], #modeMenu [data-mode]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.mode === state.settings.mode));
    b.setAttribute('aria-checked', String(b.dataset.mode === state.settings.mode));
  });
  const extraOn = document.querySelector('#modeMenu [data-mode="' + state.settings.mode + '"]');
  $('modeMoreLabel').textContent = extraOn ? extraOn.textContent : 'Ще';
  $('modeMore').setAttribute('aria-pressed', String(!!extraOn));
  $('newPer').value = String(state.settings.newPerDay);
  $('goalSel').value = String(Number(state.settings.goal) || 0);
  document.querySelectorAll('#modeMenu [data-mode="listen"]').forEach((b) => { b.hidden = !speechOk; });
  document.querySelectorAll('#mixMenu [data-m="listen"]').forEach((b) => { b.closest('label').hidden = !speechOk; });
  $('soundBox').checked = autoSound();
  const mode = state.settings.mode;
  $('dirSeg').hidden = mode === 'cloze' || mode === 'listen' || mode === 'build';
  $('mixToggle').hidden = mode !== 'mix';
  const mx = mixList();
  const mxNames = MIXABLE.filter((m) => mx.indexOf(m) !== -1).map((m) => MIX_LABEL[m]);
  $('mixLabel').textContent = 'Вправи (' + mxNames.length + ')';
  $('mixToggle').setAttribute('aria-label', 'Вправи в міксі: ' + mxNames.join(', '));
  document.querySelectorAll('#mixMenu input').forEach((b) => {
    b.checked = mx.indexOf(b.dataset.m) !== -1;
    b.disabled = b.checked && mx.length <= 1;
  });
  const hintOn = state.ai !== false && (mode === 'cloze' || (mode === 'mix' && mx.indexOf('cloze') !== -1));
  $('hintSel').hidden = !hintOn;
  $('hintSel').value = state.settings.clozeHint === 'def' ? 'def' : 'uk';
  markOn($('hintSel'), 'uk');
  const ls = $('fLesson');
  const lessons = lessonCounts(activeCards());
  if (state.settings.filter.lesson && !lessons.some((x) => x[0] === state.settings.filter.lesson)) state.settings.filter.lesson = '';
  ls.replaceChildren(el('option', { value: '', text: 'Усі уроки' }), ...lessons.slice(0, 60).map((x) => el('option', { value: x[0], text: lessonName(x[0]) + ' (' + x[1] + ')' })));
  ls.value = state.settings.filter.lesson;
  markOn(ls, '');
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
  $('modeBanner').hidden = true;
  const c = counts();
  const act = studyCards();
  const avail = c.due + c.freshToday > 0;
  let text = '';
  let title = '';
  if (!state.cards.length) {
    title = 'Поки що порожньо';
    text = 'Додай перші слова у вкладці «Слова».';
  } else if (!act.length && state.settings.mode === 'cloze' && activeCards().length) {
    title = 'Немає слів із прикладами';
    text = 'Для режиму «Речення» потрібен приклад речення, у якому трапляється саме це слово. Додай приклади у вкладці «Слова» (можна кнопкою ШІ).';
  } else if (!act.length && state.settings.mode === 'build' && activeCards().length) {
    title = 'Немає слів із прикладами';
    text = 'Для вправи «Скласти речення» потрібен приклад речення щонайменше з чотирьох слів. Додай приклади у вкладці «Слова» (можна кнопкою ШІ).';
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
  if (!cur || pending || modeNow() !== 'choice') return;
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
  if (modeNow() !== 'cloze') return null;
  const ex = exFor(session.queue[0], c, true);
  return ex ? findCloze(c.en, ex) : null;
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
  let mode = item.m || state.settings.mode;
  const bd = mode === 'build' ? buildFor(item, c) : null;
  if (mode === 'build' && !bd) {
    mode = 'type';
    item.m = 'type';
  }
  $('stage').dataset.mode = mode;
  $('bar').style.width = (session.total ? Math.min(100, (session.cleared / session.total) * 100) : 0) + '%';
  $('left').textContent = 'Залишилось ' + session.queue.length;
  $('modeBanner').hidden = !session.practice;
  $('modeBannerText').textContent = session.hard ? 'Складні слова: ті, які ти часто забуваєш' : 'Тренування: усі слова підряд, розклад не змінюється';
  if (mode === 'pairs') {
    renderPairs();
    $('hint').textContent = touch ? '' : 'Обери слово і його переклад';
    $('moveBtn').hidden = true;
    return;
  }
  const listen = mode === 'listen';
  const eu = item.d === 'eu' && !listen;
  const cz = clozeFor(c);
  const front = eu ? { lang: 'English', text: c.en, code: 'en' } : { lang: 'Українська', text: c.uk, code: 'uk' };
  const back = eu ? { lang: 'Українська', text: c.uk, code: 'uk' } : { lang: 'English', text: c.en, code: 'en' };
  const fw = $('frontWord');
  $('defGen').hidden = true;
  $('listenBig').hidden = !listen;
  $('backTr').textContent = listen ? c.uk : '';
  $('backTr').hidden = !listen;
  if (listen) {
    $('frontLang').textContent = 'Диктант';
    fw.textContent = '';
    fw.classList.remove('cloze');
    $('frontHint').textContent = 'Послухай і напиши англійською';
    $('frontHint').hidden = false;
  } else if (bd) {
    $('frontLang').textContent = 'Склади речення';
    fw.textContent = c.uk;
    fw.lang = 'uk';
    fw.classList.remove('cloze');
    $('frontHint').textContent = c.en;
    $('frontHint').lang = 'en';
    $('frontHint').hidden = false;
  } else if (cz) {
    $('frontLang').textContent = 'Встав пропущене';
    fw.replaceChildren(cz.before, el('span', { class: 'gap', text: '_____' }), cz.after);
    fw.lang = 'en';
    fw.classList.add('cloze');
    const useDef = state.settings.clozeHint === 'def' && state.ai !== false;
    $('frontHint').textContent = useDef ? (c.def ? maskDef(c.def, c.en) : '') : c.uk;
    $('frontHint').lang = useDef ? 'en' : 'uk';
    $('frontHint').hidden = useDef && !c.def;
    $('defGen').hidden = !(useDef && !c.def);
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
  const exAll = exList(c);
  const memo = shownEx.get(item);
  const exNow = memo && memo.back && exAll.indexOf(memo.back) !== -1 ? memo.back : cz ? exFor(item, c, true) : exFor(item, c, false);
  $('backEx').textContent = exNow;
  $('backEx').hidden = !exNow;
  $('exNew').textContent = exAll.length ? 'Ще приклад' : 'Згенерувати приклад';
  $('exCount').textContent = exAll.length > 1 ? 'прикладів: ' + exAll.length : '';
  $('exCount').hidden = exAll.length < 2;
  $('frontIpa').textContent = c.ipa || '';
  $('frontIpa').hidden = !(eu && !cz && !listen && c.ipa);
  $('backIpa').textContent = c.ipa || '';
  $('backIpa').hidden = !(!eu && c.ipa);
  const ft = [];
  if (c.kind === 'phrase') ft.push(el('span', { class: 'k', text: 'фраза' }));
  if (c.hw) ft.push(el('span', { text: 'домашнє' }));
  c.tags.slice(0, 3).forEach((t) => ft.push(el('span', { text: t })));
  $('frontTags').replaceChildren(...(cz || listen || bd ? [] : ft));
  $('backNote').textContent = c.note ? 'Нотатка вчительки: ' + c.note : '';
  $('backNote').hidden = !c.note;
  $('card').classList.toggle('is-flipped', flipped);
  $('front').setAttribute('aria-hidden', String(flipped));
  $('back').setAttribute('aria-hidden', String(!flipped));

  const type = mode === 'type' || mode === 'cloze' || listen;
  const choice = mode === 'choice';
  $('typeForm').hidden = !(type && !pending);
  $('answer').lang = eu ? 'uk' : 'en';
  $('answer').placeholder = cz ? 'Пропущене слово' : listen ? 'Що почула' : 'Введи переклад';
  $('choices').hidden = !choice;
  if (choice) renderChoices(c, eu);
  $('build').hidden = !bd;
  if (bd) renderBuild();
  $('verdict').hidden = !pending || choice;
  const whyKey = pending ? c.id + '|' + (pending.input || '') : '';
  if (whyKey !== whyFor) {
    whyFor = whyKey;
    $('whyStatus').hidden = true;
    const saved = pending && pending.input ? (c.whys || {})[whyMemo(pending)] : '';
    $('whyText').textContent = saved || '';
    $('whyText').hidden = !saved;
    $('whyBtn').hidden = !!saved;
    $('whyBtn').disabled = false;
  }
  $('whyBox').hidden = !(pending && !choice && (pending.res === 'wrong' || pending.res === 'near') && pending.input);
  const ord = !!(bd && pending && pending.mine);
  $('orderBox').hidden = !(ord && (pending.res === 'wrong' || pending.aiText));
  if (ord) {
    $('orderOk').hidden = pending.res !== 'wrong';
    $('orderAi').hidden = pending.res !== 'wrong' || !!pending.aiText;
    $('orderText').textContent = pending.aiText || '';
    $('orderText').hidden = !pending.aiText;
  }
  if (!$('orderStatus').classList.contains('busy')) $('orderStatus').hidden = true;
  $('nextRow').hidden = !pending;
  $('grades').hidden = type || choice || !!bd;
  $('speak').hidden = !speechOk || (listen ? !flipped : !eu && !flipped);
  $('moveBtn').hidden = !flipped;

  const enVisible = listen ? !flipped : eu !== flipped;
  const spokeKey = item.id + item.d + mode + flipped;
  if (enVisible && spokeKey !== lastSpoken && (autoSound() || listen)) {
    lastSpoken = spokeKey;
    speak((cz || bd) && flipped ? exNow : c.en, 450);
  }

  if (pending) {
    const v = $('verdict');
    v.className = 'verdict ' + (pending.res === 'exact' ? 'ok' : pending.res === 'near' ? 'near' : 'bad');
    if (pending.note) v.textContent = pending.note;
    else if (pending.res === 'exact') v.textContent = 'Правильно.';
    else if (pending.res === 'near') v.textContent = 'Майже, є дрібна помилка. Правильно: ' + pending.target;
    else if (pending.res === 'skip') v.textContent = 'Правильна відповідь: ' + pending.target;
    else v.textContent = 'Не збіглося. Правильно: ' + pending.target;
    const df = (pending.res === 'near' || pending.res === 'wrong') && pending.input ? diffAnswer(pending.input, pending.targets) : null;
    if (df) {
      const line = (label, parts) => el('span', { class: 'dline' }, el('span', { class: 'dlab', text: label }), el('span', { class: 'dtext' }, ...parts.map((p) => el('span', { class: 'd-' + p.k, text: p.t }))));
      v.append(line('Ти', df.mine), line('Треба', df.right));
    }
  }

  let hint = '';
  if (touch) hint = '';
  else if (choice) hint = pending ? 'Enter — далі' : 'Обери варіант: клік або 1–4';
  else if (bd) hint = pending ? 'Enter — далі' : 'Натискай слова у правильному порядку';
  else if (type) hint = pending ? 'Enter — далі' : 'Enter — перевірити';
  else hint = flipped ? '1 — не знаю · 2 — майже · 3 — знаю (або стрілки ← ↓ →)' : 'Пробіл або клік — перевернути';
  $('hint').textContent = hint;

  if (touch) return;
  if (pending) $('nextBtn').focus();
  else if (focusInput && type) $('answer').focus();
}

let speakTimer = 0;

function speak(text, delay) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    clearTimeout(speakTimer);
    speakTimer = setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(expandAbbr(text));
        u.lang = 'en-US';
        u.rate = 0.9;
        s.speak(u);
      } catch (e) { }
    }, delay === undefined ? 120 : delay);
  } catch (e) { }
}

export function startPractice() {
  buildQueue(true);
  enterSpecial();
}

function enterSpecial() {
  hooks.showLearn();
  $('learnMore').hidden = true;
  $('moreToggle').setAttribute('aria-expanded', 'false');
  renderLearn(true);
  $('stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function bindLearn() {
  bindSwipe();
  bindBuildDrag();
  document.querySelectorAll('#dirSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      state.settings.dir = b.dataset.dir;
      markSettings();
      buildQueue();
      renderControls();
      renderLearn(true);
    });
  });
  document.querySelectorAll('#modeSeg [data-mode], #modeMenu [data-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      closePops();
      const poolKey = () => JSON.stringify(dirsFor(state.settings.dir)) + (state.settings.mode === 'cloze' || state.settings.mode === 'build' ? state.settings.mode : '');
      const before = poolKey();
      state.settings.mode = b.dataset.mode;
      flipped = false;
      pending = null;
      board = null;
      build = null;
      markSettings();
      if (before !== poolKey()) buildQueue();
      else session.queue.forEach((q) => {
        const c = state.cards.find((x) => x.id === q.id);
        q.m = c ? assignMode(c) : state.settings.mode;
      });
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
    state.settings.filter = { kind: $('fKind').value, tag: $('fTag').value, hw: $('fHw').checked, lesson: $('fLesson').value };
    renderControls();
    markSettings();
    buildQueue();
    renderLearn(true);
  };
  $('fKind').addEventListener('change', onFilter);
  $('fTag').addEventListener('change', onFilter);
  $('fHw').addEventListener('change', onFilter);
  $('fLesson').addEventListener('change', onFilter);
  $('goalSel').addEventListener('change', () => {
    state.settings.goal = Number($('goalSel').value) || 0;
    markSettings();
    renderHeader();
  });
  $('soundBox').addEventListener('change', () => {
    setPref('sound', $('soundBox').checked);
    if (!$('soundBox').checked) {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }
  });
  document.querySelectorAll('#mixMenu input').forEach((b) => {
    b.addEventListener('change', () => {
      const cur = mixList();
      const on = cur.indexOf(b.dataset.m) !== -1;
      if (on && cur.length <= 1) {
        b.checked = true;
        return;
      }
      state.settings.mix = on ? cur.filter((x) => x !== b.dataset.m) : cur.concat(b.dataset.m);
      markSettings();
      buildQueue();
      renderControls();
      renderLearn(true);
    });
  });
  $('hintSel').addEventListener('change', () => {
    state.settings.clozeHint = $('hintSel').value;
    markSettings();
    renderControls();
    renderLearn();
  });
  $('modeMore').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePop($('modeMore'), $('modeMenu'));
  });
  $('mixToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePop($('mixToggle'), $('mixMenu'));
  });
  $('mixMenu').addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closePops);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePops(); });
  window.addEventListener('resize', closePops);
  window.addEventListener('scroll', closePops, { passive: true });
  $('defGen').addEventListener('click', async (e) => {
    e.stopPropagation();
    const cur = currentCard();
    if (!cur) return;
    const btn = $('defGen');
    const stop = loading(btn, 'Пишу пояснення');
    try {
      const r = await withRetry((sg) => enrich([{ en: cur.c.en, uk: cur.c.uk, ex: cur.c.ex, want: { def: true } }], { def: true }, sg), null, (sec) => stop.wait(sec));
      if (r[0] && r[0].def) await setCardDef(cur.c.id, r[0].def);
      stop();
    } catch (err) {
      stop(aiMessage(err));
      return;
    }
    renderLearn();
  });
  $('exNew').addEventListener('click', async (e) => {
    e.stopPropagation();
    const cur = currentCard();
    if (!cur) return;
    const c = cur.c;
    const item = cur.item;
    const btn = $('exNew');
    const stop = loading(btn, 'Пишу приклад');
    try {
      const ex = await withRetry((sg) => aiExample(Object.assign({}, c, { ex: $('backEx').textContent || c.ex }), sg), null, (sec) => stop.wait(sec));
      if (ex && exList(c).indexOf(ex) === -1) {
        const exs = (c.exs || []).concat(ex).slice(-8);
        await setCardAi(c.id, { exs: exs });
      }
      if (ex) shownEx.set(item, Object.assign(shownEx.get(item) || {}, { back: ex }));
      stop();
    } catch (err) {
      stop(aiMessage(err));
      return;
    }
    renderLearn();
  });
  $('whyBtn').addEventListener('click', async () => {
    const cur = currentCard();
    if (!cur || !pending) return;
    const c = cur.c;
    const p = pending;
    const btn = $('whyBtn');
    const out = $('whyText');
    const st = $('whyStatus');
    btn.disabled = true;
    out.hidden = true;
    const key = whyFor;
    const stop = statusLine(st, 'ШІ пояснює помилку');
    try {
      const text = await withRetry((sg) => aiExplain(c, { expected: p.target, answer: p.input, shown: $('frontWord').textContent + ' ' + $('frontHint').textContent }, sg), null, (sec) => stop.wait(sec));
      stop();
      if (key !== whyFor) return;
      out.textContent = text || 'ШІ не дав пояснення.';
      out.hidden = false;
      btn.hidden = true;
      if (text) {
        const whys = Object.assign({}, c.whys || {});
        whys[whyMemo(p)] = text;
        const keys = Object.keys(whys);
        while (keys.length > 20) delete whys[keys.shift()];
        setCardAi(c.id, { whys: whys }).catch(() => {});
      }
    } catch (err) {
      stop(aiMessage(err));
      btn.disabled = false;
    }
  });
  $('storyBtn').addEventListener('click', makeStory);
  $('storyClose').addEventListener('click', () => {
    if (storyCtrl) storyCtrl.abort();
    $('storyBox').hidden = true;
  });
  $('pairs').addEventListener('click', (e) => {
    const b = e.target.closest('.pair');
    if (b) pickPair(b);
  });
  $('build').addEventListener('click', (e) => {
    const b = e.target.closest('.bw');
    if (!b || !build || pending || b.disabled || buildDragged) return;
    const i = Number(b.dataset.i);
    const at = build.line.indexOf(i);
    if (at === -1) build.line.push(i);
    else build.line.splice(at, 1);
    renderBuild();
  });
  $('buildCheck').addEventListener('click', () => {
    if (!build || pending || build.line.length !== build.words.length) return;
    const right = norm(build.line.map((i) => build.words[i]).join(' ')) === norm(build.words.join(' '));
    pending = { res: right ? 'exact' : 'wrong', g: right ? 'know' : 'again', target: build.src, mine: build.line.map((i) => build.words[i]).join(' ') };
    flipped = true;
    renderLearn();
  });
  $('orderOk').addEventListener('click', () => {
    if (!pending || !pending.mine || pending.res !== 'wrong') return;
    pending.res = 'exact';
    pending.g = 'know';
    pending.note = 'Зараховано як правильну відповідь.';
    renderLearn();
  });
  $('orderAi').addEventListener('click', async () => {
    const cur = currentCard();
    if (!cur || !pending || !pending.mine || pending.res !== 'wrong') return;
    const p = pending;
    const btn = $('orderAi');
    btn.disabled = true;
    const stop = statusLine($('orderStatus'), 'ШІ перевіряє речення');
    try {
      const r = await withRetry((sg) => aiOrder(cur.c, p.target, p.mine, sg), null, (sec) => stop.wait(sec));
      stop();
      btn.disabled = false;
      if (pending !== p) return;
      p.aiText = r.text || (r.ok ? 'Такий порядок слів теж правильний.' : 'ШІ вважає, що такий порядок слів неправильний.');
      if (r.ok) {
        p.res = 'exact';
        p.g = 'know';
        p.note = 'ШІ: такий порядок теж правильний. Зараховано.';
      }
      renderLearn();
    } catch (err) {
      stop(err && err.code === 'bad_request' ? 'Для цієї перевірки треба оновити функцію ai в Supabase.' : aiMessage(err));
      btn.disabled = false;
    }
  });
  $('buildSkip').addEventListener('click', () => {
    if (!build || pending) return;
    pending = { res: 'skip', g: 'again', target: build.src };
    flipped = true;
    renderLearn();
  });
  $('listenBig').addEventListener('click', (e) => {
    e.stopPropagation();
    const cur = currentCard();
    if (cur) speak(cur.c.en, 0);
  });
  $('moreToggle').addEventListener('click', () => {
    const open = $('learnMore').hidden;
    $('learnMore').hidden = !open;
    $('moreToggle').setAttribute('aria-expanded', String(open));
  });
  $('practiceTop').addEventListener('click', startPractice);
  $('hardBtn').addEventListener('click', () => {
    buildQueue('hard');
    enterSpecial();
  });
  $('modeBannerExit').addEventListener('click', () => {
    buildQueue();
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
    if (modeNow() === 'flip' && session.queue.length) {
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
    const target = cz ? cz.blank : cur.item.d === 'eu' && modeNow() !== 'listen' ? cur.c.uk : cur.c.en;
    const order = { exact: 3, near: 2, wrong: 1 };
    let res = check($('answer').value, target);
    if (cz && res !== null) {
      const alt = check($('answer').value, cur.c.en);
      if (order[alt] > order[res]) res = alt;
      const a = canon($('answer').value);
      const full = canon(cz.blank + ' ' + cz.after);
      const pre = canon(cz.before + ' ' + cz.blank);
      if (res !== 'exact' && a.indexOf(canon(cz.blank)) !== -1 && ((full + ' ').indexOf(a + ' ') === 0 || (' ' + pre).endsWith(' ' + a))) res = 'exact';
    }
    if (res === null) {
      $('answer').focus();
      return;
    }
    pending = { res: res, g: res === 'wrong' ? 'again' : 'know', target: target, input: $('answer').value, targets: cz ? [cz.blank, cur.c.en] : [target] };
    flipped = true;
    renderLearn();
  });
  $('skipBtn').addEventListener('click', () => {
    const cur = currentCard();
    if (!cur || pending) return;
    const cz = clozeFor(cur.c);
    pending = { res: 'skip', g: 'again', target: cz ? cz.blank : cur.item.d === 'eu' && modeNow() !== 'listen' ? cur.c.uk : cur.c.en };
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
    if (modeNow() === 'pairs') return;
    if (modeNow() === 'flip') {
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
    } else if (modeNow() === 'choice' && !pending && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pickChoice(Number(e.key) - 1);
    } else if (pending && (e.key === ' ' || e.key === 'Enter') && !onBtn) {
      e.preventDefault();
      grade(pending.g);
    }
  });
}

export function lessonName(d) {
  try {
    const t = new Date(d + 'T12:00:00');
    return 'Урок ' + t.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  } catch (e) {
    return 'Урок ' + d;
  }
}

function renderPairs() {
  if (!board || board.items.some((it) => session.queue.indexOf(it) === -1 && !board.done.has(it))) {
    const items = [];
    const seen = new Set();
    for (const q of session.queue) {
      if (items.length >= 5) break;
      if (seen.has(q.id) || !state.cards.some((c) => c.id === q.id)) continue;
      seen.add(q.id);
      items.push(q);
    }
    board = { items: items, en: shuffle(items.slice()), uk: shuffle(items.slice()), sel: null, done: new Set(), miss: new Set() };
  }
  const card = (it) => state.cards.find((c) => c.id === it.id);
  const btn = (it, side) => {
    const c = card(it);
    const b = el('button', { type: 'button', class: 'pair', 'data-side': side, 'data-i': String(board.items.indexOf(it)), lang: side, text: side === 'en' ? c.en : c.uk });
    if (board.done.has(it)) {
      b.classList.add('ok');
      b.disabled = true;
    }
    if (board.sel && board.sel.it === it && board.sel.side === side) b.classList.add('sel');
    return b;
  };
  $('pairs').replaceChildren(
    el('div', { class: 'pcol' }, ...board.en.map((it) => btn(it, 'en'))),
    el('div', { class: 'pcol' }, ...board.uk.map((it) => btn(it, 'uk')))
  );
}

function pickPair(b) {
  if (!board || b.disabled) return;
  const it = board.items[Number(b.dataset.i)];
  const side = b.dataset.side;
  if (!board.sel || board.sel.side === side) {
    board.sel = { it: it, side: side };
    if (side === 'en' && autoSound()) speak(state.cards.find((c) => c.id === it.id).en, 0);
    renderPairs();
    return;
  }
  const first = board.sel.it;
  const firstSide = board.sel.side;
  board.sel = null;
  if (first === it) {
    board.done.add(it);
    renderPairs();
    if (board.done.size === board.items.length) {
      const fin = board.items.slice();
      const miss = board.miss;
      board = null;
      setTimeout(() => {
        fin.forEach((x) => {
          const c = state.cards.find((y) => y.id === x.id);
          if (c) applyGrade(x, c, miss.has(x) ? 'again' : 'know');
        });
        renderLearn();
      }, 350);
    }
    return;
  }
  board.miss.add(first);
  renderPairs();
  const bad = $('pairs').querySelectorAll('.pair[data-side="' + firstSide + '"][data-i="' + board.items.indexOf(first) + '"], .pair[data-side="' + side + '"][data-i="' + board.items.indexOf(it) + '"]');
  bad.forEach((x) => x.classList.add('bad'));
  setTimeout(() => bad.forEach((x) => x.classList.remove('bad')), 500);
}

function maskDef(def, en) {
  let out = def;
  String(en).toLowerCase().split(/[^a-z']+/).filter((w) => w.length >= 4).forEach((w) => {
    const root = w.slice(0, Math.max(4, w.length - 2)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp('\\b' + root + "[a-z']*", 'gi'), '…');
  });
  return out;
}

function exList(c) {
  const out = [];
  [c.ex].concat(c.exs || []).forEach((x) => {
    const v = String(x || '').trim();
    if (v && out.indexOf(v) === -1) out.push(v);
  });
  return out;
}

function splitSentence(s) {
  const w = String(s || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return w;
  w[w.length - 1] = w[w.length - 1].replace(/[.!?…]+$/, '');
  if (!/^I(['’]|$)/.test(w[0])) w[0] = w[0].charAt(0).toLowerCase() + w[0].slice(1);
  return w.filter(Boolean);
}

function okBuild(s) {
  const n = splitSentence(s).length;
  return n >= 4 && n <= 14;
}

function hasBuild(c) {
  return exList(c).some(okBuild);
}

function buildFor(item, c) {
  if (build && build.item === item && exList(c).indexOf(build.src) !== -1) return build;
  const list = exList(c).filter(okBuild);
  if (!list.length) return null;
  const src = list[Math.floor(Math.random() * list.length)];
  const words = splitSentence(src);
  const order = shuffle(words.map((w, i) => i));
  if (order.every((v, i) => v === i)) order.reverse();
  build = { item: item, src: src, words: words, order: order, line: [] };
  shownEx.set(item, Object.assign(shownEx.get(item) || {}, { back: src }));
  return build;
}

function bindBuildDrag() {
  const line = $('buildLine');
  let d = null;
  const place = (e) => {
    d.el.style.transform = '';
    const r = d.el.getBoundingClientRect();
    d.el.style.transform = 'translate(' + (e.clientX - d.ox - r.left) + 'px,' + (e.clientY - d.oy - r.top) + 'px)';
  };
  $('build').addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.bw');
    if (!b || b.disabled || pending || !build || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const r = b.getBoundingClientRect();
    d = { src: b, el: b, pool: !line.contains(b), id: e.pointerId, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, on: false };
  });
  document.addEventListener('pointermove', (e) => {
    if (!d || e.pointerId !== d.id) return;
    if (!d.on) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return;
      d.on = true;
      if (d.pool) {
        d.el = d.src.cloneNode(true);
        d.src.classList.add('used');
        line.append(d.el);
      }
      d.el.classList.add('drag');
    }
    const others = Array.from(line.querySelectorAll('.bw')).filter((t) => t !== d.el);
    d.el.style.transform = '';
    let hit = false;
    for (const t of others) {
      const r = t.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) continue;
      hit = true;
      const before = !!(d.el.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
      const mid = r.left + r.width / 2;
      if (before && e.clientX > mid) t.after(d.el);
      else if (!before && e.clientX < mid) t.before(d.el);
      break;
    }
    if (!hit && others.length) {
      const last = others[others.length - 1];
      const r = last.getBoundingClientRect();
      if (line.lastElementChild !== d.el && (e.clientY > r.bottom || (e.clientY >= r.top && e.clientX > r.right))) line.append(d.el);
    }
    place(e);
  });
  const end = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const was = d;
    d = null;
    if (!was.on) return;
    buildDragged = true;
    setTimeout(() => { buildDragged = false; }, 80);
    if (!build) return;
    if (was.pool) {
      const r = line.getBoundingClientRect();
      const inside = e.type === 'pointerup' && e.clientX >= r.left - 12 && e.clientX <= r.right + 12 && e.clientY >= r.top - 12 && e.clientY <= r.bottom + 12;
      if (!inside) was.el.remove();
    }
    build.line = Array.from(line.querySelectorAll('.bw')).map((x) => Number(x.dataset.i));
    renderBuild();
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

function renderBuild() {
  const b = build;
  const chip = (i) => el('button', { type: 'button', class: 'bw', 'data-i': String(i), lang: 'en', text: b.words[i] });
  $('buildLine').replaceChildren(...b.line.map((i, pos) => {
    const x = chip(i);
    if (pending) {
      x.disabled = true;
      x.classList.add(pending.res === 'exact' || norm(b.words[i]) === norm(b.words[pos]) ? 'ok' : 'bad');
    }
    return x;
  }));
  $('buildPool').replaceChildren(...b.order.map((i) => {
    const x = chip(i);
    if (b.line.indexOf(i) !== -1) {
      x.classList.add('used');
      x.disabled = true;
    }
    return x;
  }));
  $('buildPool').hidden = !!pending || b.line.length === b.words.length;
  $('buildActs').hidden = !!pending;
  $('buildCheck').disabled = b.line.length !== b.words.length;
}

function hasCloze(c) {
  return exList(c).some((x) => !!findCloze(c.en, x));
}

function readRot() {
  try {
    const v = JSON.parse(localStorage.getItem(ROT_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    return {};
  }
}

function writeRot(v) {
  try {
    localStorage.setItem(ROT_KEY, JSON.stringify(v));
  } catch (e) { }
}

function exFor(item, c, needCloze) {
  if (!item) return c.ex || '';
  const memo = shownEx.get(item) || {};
  const slot = needCloze ? 'cloze' : 'plain';
  if (memo[slot] && exList(c).indexOf(memo[slot]) !== -1) return memo[slot];
  let list = exList(c);
  if (needCloze) list = list.filter((x) => !!findCloze(c.en, x));
  if (!list.length) return '';
  let pick = '';
  if (!needCloze && memo.cloze && list.indexOf(memo.cloze) !== -1) pick = memo.cloze;
  else if (needCloze && memo.plain && list.indexOf(memo.plain) !== -1) pick = memo.plain;
  else {
    const rot = readRot();
    const n = rot[c.id] || 0;
    pick = list[n % list.length];
    rot[c.id] = n + 1;
    writeRot(rot);
  }
  memo[slot] = pick;
  shownEx.set(item, memo);
  return pick;
}

function whyMemo(p) {
  return (canon(p.input) + ' > ' + canon(p.target)).slice(0, 120);
}

function ticker(render) {
  const t0 = Date.now();
  let note = '';
  const tick = () => render(Math.round((Date.now() - t0) / 1000), note);
  tick();
  const id = setInterval(tick, 1000);
  return {
    wait: (sec) => {
      note = 'ШІ зайнятий, пробую ще раз через ' + sec + ' с';
      tick();
    },
    stop: () => clearInterval(id)
  };
}

function loading(btn, label) {
  const old = btn.dataset.label || btn.textContent;
  btn.dataset.label = old;
  btn.disabled = true;
  btn.classList.add('loading');
  const t = ticker((sec, note) => { btn.textContent = (note || label) + '… ' + sec + ' с'; });
  const stop = (msg) => {
    t.stop();
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.textContent = msg || old;
    if (msg) setTimeout(() => { if (!btn.classList.contains('loading')) btn.textContent = old; }, 6000);
  };
  stop.wait = t.wait;
  return stop;
}

function statusLine(node, label, extra) {
  node.hidden = false;
  node.classList.add('busy');
  const text = el('span', { class: 'aitext' });
  node.replaceChildren(el('span', { class: 'spin', 'aria-hidden': 'true' }), text, ...(extra ? [extra] : []));
  const t = ticker((sec, note) => { text.textContent = (note || label) + '… ' + sec + ' с'; });
  const stop = (msg) => {
    t.stop();
    node.classList.remove('busy');
    if (msg) node.replaceChildren(el('span', { class: 'aitext err', text: msg }));
    else node.hidden = true;
  };
  stop.wait = t.wait;
  return stop;
}

async function makeStory() {
  if (storyCtrl) return;
  const ids = [];
  session.queue.forEach((q) => { if (ids.indexOf(q.id) === -1) ids.push(q.id); });
  let cards = ids.map((id) => state.cards.find((c) => c.id === id)).filter(Boolean);
  if (cards.length < 6) {
    const more = activeCards().filter((c) => cards.indexOf(c) === -1).sort((a, b) => bestOf(a) - bestOf(b));
    cards = cards.concat(shuffle(more.slice(0, 20)));
  }
  cards = cards.slice(0, 8);
  if (!cards.length) return;
  const box = $('storyBox');
  const btn = $('storyBtn');
  box.hidden = false;
  $('storyTitle').textContent = 'Історія з твоїх слів';
  $('storyText').replaceChildren();
  $('storyQ').replaceChildren();
  $('storyMsg').textContent = 'Слова: ' + cards.map((c) => c.en).join(', ');
  storyCtrl = new AbortController();
  const ctrl = storyCtrl;
  const cancel = el('button', { type: 'button', class: 'mini', text: 'Скасувати' });
  cancel.addEventListener('click', () => ctrl.abort());
  const stop = statusLine($('storyStatus'), 'ШІ пише історію', cancel);
  const stopBtn = loading(btn, 'Пишу історію');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const st = await withRetry((sg) => aiStory(cards, sg), ctrl.signal, (sec) => {
      stop.wait(sec);
      stopBtn.wait(sec);
    });
    if (!st || !st.text) throw Object.assign(new Error('empty'), { code: 'provider' });
    stop();
    $('storyTitle').textContent = st.title || 'Історія';
    const parts = String(st.text).split(/\*\*(.+?)\*\*/g);
    $('storyText').replaceChildren(...parts.map((t, i) => (i % 2 ? el('mark', { text: plainEntry(t) }) : t)));
    $('storyQ').replaceChildren(...(st.questions || []).map((q) => el('li', null, el('span', { text: q.q }), el('details', null, el('summary', { text: 'Відповідь' }), el('p', { text: q.a })))));
    $('storyMsg').textContent = 'Слова: ' + cards.map((c) => c.en + ' — ' + c.uk).join('; ');
  } catch (err) {
    stop(err.code === 'aborted' ? 'Скасовано.' : aiMessage(err));
  }
  stopBtn();
  btn.textContent = 'Нова історія';
  btn.dataset.label = 'Нова історія';
  storyCtrl = null;
}

function closePops() {
  document.querySelectorAll('.pop').forEach((m) => { m.hidden = true; });
  ['modeMore', 'mixToggle'].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.setAttribute('aria-expanded', 'false');
  });
}

function togglePop(btn, menu) {
  const open = menu.hidden;
  closePops();
  if (!open) return;
  const r = btn.getBoundingClientRect();
  menu.hidden = false;
  const w = menu.offsetWidth;
  menu.style.top = Math.round(r.bottom + 6) + 'px';
  menu.style.left = Math.round(Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w))) + 'px';
  btn.setAttribute('aria-expanded', 'true');
}

const PLACEHOLDERS = /\b(sth|smth|sb|smb|smbd|somebody|something|someone|somewhere|swh|smwh|doing|one's|oneself)\b/gi;

function plainEntry(t) {
  let v = String(t).replace(/\([^)]*\)/g, ' ');
  v = v.replace(/([A-Za-z']+)(?:\/[A-Za-z']+)+/g, '$1');
  v = v.replace(PLACEHOLDERS, ' ');
  v = v.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  return v || String(t);
}
