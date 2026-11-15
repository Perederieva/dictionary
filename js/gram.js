import { $, el, today, addDays, shuffle, plural } from './util.js';
import { state, markGram, activeCards, setGramAi } from './store.js';
import { aiGram, aiMessage, withRetry } from './ai.js';
import { TOPICS, LEVEL } from './gram-b1.js';
import { RULES } from './grammar.js';

const INT = [1, 2, 4, 8, 16, 32];
const MASTER = 3;
const PER = 8;
const MIX = 10;

let view = 'list';
let topicId = '';
let quiz = null;
let aiBusy = null;
let aiNote = '';

const topicOf = (id) => TOPICS.find((t) => t.id === id);
const recOf = (id) => state.gram[id] || null;

export function gramStatus(id) {
  const r = recOf(id);
  if (!r) return 'new';
  if (r.d <= today()) return 'due';
  return r.b >= MASTER ? 'done' : 'learn';
}

export function gramSummary() {
  let done = 0;
  let learn = 0;
  let due = 0;
  TOPICS.forEach((t) => {
    const r = recOf(t.id);
    if (!r) return;
    if (r.b >= MASTER) done++;
    else learn++;
    if (r.d <= today()) due++;
  });
  return { total: TOPICS.length, done: done, learn: learn, due: due };
}

const LABEL = { new: 'Нова', learn: 'Вчу', done: 'Засвоєно', due: 'Повторити' };

const contract = [
  [/\bwon't\b/g, ['will not']],
  [/\bcan't\b/g, ['cannot']],
  [/\bshan't\b/g, ['shall not']],
  [/n't\b/g, [' not']],
  [/'m\b/g, [' am']],
  [/'re\b/g, [' are']],
  [/'ve\b/g, [' have']],
  [/'ll\b/g, [' will']],
  [/'s\b/g, [' is', ' has']],
  [/'d\b/g, [' would', ' had']]
];

function expand(s) {
  let out = [String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/\bcan not\b/g, 'cannot').replace(/[.!?,;:]+/g, ' ')];
  contract.forEach(([re, alts]) => {
    const next = [];
    out.forEach((x) => {
      if (!x.match(re)) {
        next.push(x);
        return;
      }
      alts.forEach((a) => next.push(x.replace(re, a)));
    });
    out = next.slice(0, 16);
  });
  return out.map((x) => x.replace(/\s+/g, ' ').trim());
}

export function gramCheck(input, answers) {
  const mine = expand(input).filter(Boolean);
  if (!mine.length) return null;
  return answers.some((a) => expand(a).some((x) => mine.indexOf(x) !== -1));
}

function record(id, right, total) {
  const prev = recOf(id) || { b: 0, d: today(), n: 0, ok: 0 };
  const r = Object.assign({}, prev);
  const score = total ? right / total : 0;
  r.n = (prev.n || 0) + total;
  r.ok = (prev.ok || 0) + right;
  const same = !!(prev.at && prev.at === today() && recOf(id));
  r.at = today();
  if (same) {
    if (score < 0.5) r.d = addDays(today(), 1);
  } else if (score >= 0.8) {
    r.b = Math.min((prev.b || 0) + 1, INT.length - 1);
    r.d = addDays(today(), INT[r.b - 1] || 1);
  } else if (score >= 0.5) {
    r.b = prev.b || 0;
    r.d = addDays(today(), 1);
  } else {
    r.b = Math.max((prev.b || 0) - 1, 0);
    r.d = addDays(today(), 1);
  }
  state.gram[id] = r;
  return r;
}

function prepare(t, q) {
  const item = Object.assign({ tid: t.id }, q);
  if (q.k === 'p') item.opts = shuffle(q.o.map((x, i) => ({ t: x, ok: i === 0 })));
  return item;
}

const aiOf = (id) => (Array.isArray(state.gramAi[id]) ? state.gramAi[id] : []);
const bankOf = (t) => t.q.concat(aiOf(t.id).map((x) => Object.assign({ ai: true }, x)));

function startTopic(id, list) {
  const t = topicOf(id);
  if (!t) return;
  const src = list || shuffle(bankOf(t)).slice(0, PER);
  quiz = { items: src.map((q) => prepare(t, q)), i: 0, res: [], tid: id, ans: null };
  view = 'quiz';
  render();
  window.scrollTo(0, 0);
}

async function makeAi(t, btn, note) {
  if (aiBusy) return;
  aiBusy = t.id;
  aiNote = '';
  const t0 = Date.now();
  let wait = '';
  btn.disabled = true;
  const tick = () => { btn.textContent = (wait || 'ШІ складає вправи') + '… ' + Math.round((Date.now() - t0) / 1000) + ' с'; };
  tick();
  const timer = setInterval(tick, 1000);
  const words = shuffle(activeCards().map((c) => c.en)).slice(0, 8);
  const bank = bankOf(t);
  const samples = shuffle(bank.map((q) => q.s)).slice(0, 10);
  let fresh = [];
  let msg = '';
  try {
    const got = await withRetry((sg) => aiGram(t, samples, words, 8, sg), null, (sec) => { wait = 'ШІ зайнятий, пробую ще раз через ' + sec + ' с'; tick(); });
    const have = new Set(bank.map((q) => q.s.toLowerCase()));
    fresh = got.filter((q) => q && q.s && !have.has(String(q.s).toLowerCase())).map((q) => q.k === 'p' ? { k: 'p', s: q.s, o: q.o, w: q.w || '' } : { k: 't', s: q.s, a: q.a, w: q.w || '' });
    if (!fresh.length) msg = 'ШІ не дав придатних вправ. Спробуй ще раз.';
  } catch (e) {
    msg = aiMessage(e);
  }
  clearInterval(timer);
  aiBusy = null;
  if (fresh.length) {
    try {
      const ok = await setGramAi(t.id, aiOf(t.id).concat(fresh).slice(-60));
      if (!ok) aiNote = 'Вправи збережено лише на цьому пристрої: виконай міграцію 011 у Supabase.';
    } catch (e) {
      aiNote = 'Не вдалося зберегти вправи на сервері, вони є лише на цьому пристрої.';
    }
    if (view === 'topic' && topicId === t.id) startTopic(t.id, fresh.map((x) => Object.assign({ ai: true }, x)));
    return;
  }
  aiNote = msg;
  if (view === 'topic' && topicId === t.id) render();
}

async function dropAi(q, btn) {
  const list = aiOf(q.tid).filter((x) => x.s !== q.s);
  btn.disabled = true;
  try {
    await setGramAi(q.tid, list);
    btn.textContent = 'Вправу прибрано';
  } catch (e) {
    btn.textContent = 'Прибрано на цьому пристрої';
  }
}

function startMix() {
  const due = TOPICS.filter((t) => gramStatus(t.id) === 'due');
  if (!due.length) return;
  const per = Math.max(2, Math.ceil(MIX / due.length));
  let items = [];
  due.forEach((t) => { items = items.concat(shuffle(bankOf(t)).slice(0, per).map((q) => prepare(t, q))); });
  quiz = { items: shuffle(items).slice(0, Math.max(MIX, due.length * 2)), i: 0, res: [], tid: '', ans: null };
  view = 'quiz';
  render();
}

function finish() {
  const by = new Map();
  quiz.items.forEach((q, i) => {
    const x = by.get(q.tid) || { r: 0, n: 0 };
    x.n++;
    if (quiz.res[i] && quiz.res[i].ok) x.r++;
    by.set(q.tid, x);
  });
  quiz.after = [];
  by.forEach((x, id) => quiz.after.push({ id: id, r: record(id, x.r, x.n) }));
  markGram();
  view = 'result';
  render();
}

function answer(ok, given) {
  if (!quiz || quiz.ans) return;
  quiz.ans = { ok: ok, given: given };
  quiz.res[quiz.i] = quiz.ans;
  render();
}

function next() {
  if (!quiz || !quiz.ans) return;
  quiz.i++;
  quiz.ans = null;
  if (quiz.i >= quiz.items.length) finish();
  else render();
}

function sentence(q, fill, bad) {
  const parts = q.s.split('___');
  if (parts.length === 1) return el('p', { class: 'gq', lang: 'en', text: q.s });
  const kids = [];
  parts.forEach((p, i) => {
    kids.push(p);
    if (i === parts.length - 1) return;
    if (fill !== undefined && parts.length === 2) {
      if (bad) kids.push(el('s', { class: 'gbad', text: bad }), ' ');
      kids.push(el('b', { class: 'gfill', text: fill }));
    } else kids.push(el('span', { class: 'ggap', text: '_____' }));
  });
  return el('p', { class: 'gq', lang: 'en' }, kids);
}

function backBtn(text, fn) {
  const b = el('button', { type: 'button', class: 'act gback', text: '← ' + text });
  b.addEventListener('click', fn);
  return b;
}

function renderList() {
  const s = gramSummary();
  const kids = [el('div', { class: 'pagehead' }, el('h2', null, 'Граматика ', el('span', { text: LEVEL })))];
  const bar = el('div', { class: 'gbar', role: 'img', 'aria-label': 'Засвоєно ' + s.done + ' з ' + s.total + ', вчу ' + s.learn });
  [['gb-done', s.done], ['gb-learn', s.learn], ['gb-new', s.total - s.done - s.learn]].forEach(([c, n]) => {
    const i = el('i', { class: c, hidden: !n });
    i.style.flexGrow = String(n);
    bar.append(i);
  });
  kids.push(el('div', { class: 'box gsum' },
    el('p', { class: 'gsumt' }, el('b', { text: String(s.done) }), ' з ' + s.total + ' ' + plural(s.total, 'теми', 'тем', 'тем') + ' засвоєно'),
    bar,
    el('ul', { class: 'glegend' },
      el('li', null, el('i', { class: 'sw', 'data-k': 'done' }), 'Засвоєно ', el('b', { text: String(s.done) })),
      el('li', null, el('i', { class: 'sw', 'data-k': 'mid' }), 'Вчу ', el('b', { text: String(s.learn) })),
      el('li', null, el('i', { class: 'sw', 'data-k': 'new' }), 'Нові ', el('b', { text: String(s.total - s.done - s.learn) }))
    ),
    el('p', { class: 'note', text: 'Тема засвоєна після трьох успішних підходів у різні дні (від 80% правильних).' })
  ));
  if (s.due) {
    const b = el('button', { type: 'button', class: 'btn primary', id: 'gMix', text: 'Повторити' });
    b.addEventListener('click', startMix);
    kids.push(el('div', { class: 'box gdue' }, el('p', null, 'Час повторити ', el('b', { text: s.due + ' ' + plural(s.due, 'тему', 'теми', 'тем') })), b));
  }
  const list = el('ol', { class: 'glist' }, TOPICS.map((t, i) => {
    const st = gramStatus(t.id);
    const b = el('button', { type: 'button', class: 'gitem', 'data-id': t.id },
      el('span', { class: 'gnum', text: String(i + 1) }),
      el('span', { class: 'gtxt' }, el('span', { class: 'gt', text: t.t }), el('span', { class: 'gs', text: t.s })),
      el('span', { class: 'gst', 'data-s': st, text: LABEL[st] })
    );
    b.addEventListener('click', () => {
      topicId = t.id;
      aiNote = '';
      view = 'topic';
      render();
      window.scrollTo(0, 0);
    });
    return el('li', null, b);
  }));
  kids.push(el('section', { class: 'group' }, el('h3', { text: 'Теми рівня ' + LEVEL }), list));
  kids.push(el('section', { class: 'group' }, el('h3', { text: 'Довідник' }), el('div', { class: 'folds' }, RULES.map((r) => el('details', { class: 'fold' },
    el('summary', null, el('span', { class: 'fw', text: r.t })),
    r.p.map((x) => el('p', { class: 'ft', text: x })),
    el('ul', { class: 'fex', lang: 'en' }, r.ex.map((x) => el('li', { text: x })))
  )))));
  return kids;
}

function renderTopic() {
  const t = topicOf(topicId);
  if (!t) {
    view = 'list';
    return renderList();
  }
  const r = recOf(t.id);
  const st = gramStatus(t.id);
  const go = el('button', { type: 'button', class: 'btn primary', id: 'gStart', text: r ? 'Вправи ще раз' : 'Почати вправи' });
  go.addEventListener('click', () => startTopic(t.id));
  const nAi = aiOf(t.id).length;
  const pool = t.q.length + ' ' + plural(t.q.length, 'вправа', 'вправи', 'вправ') + (nAi ? ' + ' + nAi + ' від ШІ' : '');
  const info = (r ? 'Правильних ' + Math.round((r.ok / Math.max(r.n, 1)) * 100) + '% з ' + r.n + ' · ' + (st === 'due' ? 'час повторити' : 'наступне повторення ' + r.d.split('-').reverse().slice(0, 2).join('.')) + ' · ' : '') + 'У підході ' + PER + ' з ' + pool;
  const aiBtn = el('button', { type: 'button', class: 'btn ai-only', id: 'gAi', text: 'Нові вправи від ШІ' });
  aiBtn.addEventListener('click', () => makeAi(t, aiBtn));
  if (aiBusy === t.id) {
    aiBtn.disabled = true;
    aiBtn.textContent = 'ШІ складає вправи…';
  }
  return [
    backBtn('Усі теми', () => { view = 'list'; render(); }),
    el('div', { class: 'gtopic' },
      el('h2', { text: t.t }),
      el('span', { class: 'gst', 'data-s': st, text: LABEL[st] })
    ),
    el('div', { class: 'box gbox' }, t.rule.map((p) => el('p', { class: 'grule', text: p }))),
    el('section', { class: 'group' }, el('h3', { text: 'Приклади' }), el('ul', { class: 'box gex' }, t.ex.map((e) => el('li', null, el('span', { class: 'gen', lang: 'en', text: e[0] }), el('span', { class: 'guk', text: e[1] }))))),
    el('section', { class: 'group' }, el('h3', { text: 'Типові помилки' }), el('ul', { class: 'box gerr' }, t.err.map((e) => el('li', null, el('s', { lang: 'en', text: e[0] }), el('span', { lang: 'en', text: e[1] }))))),
    el('div', { class: 'gstart' }, go, aiBtn, aiNote ? el('p', { class: 'aistatus ai-only' }, el('span', { class: 'aitext err', text: aiNote })) : null, el('p', { class: 'note', text: info }))
  ];
}

function renderQuiz() {
  const q = quiz.items[quiz.i];
  const t = topicOf(q.tid);
  const a = quiz.ans;
  const kids = [];
  const stop = backBtn(quiz.tid ? 'До теми' : 'Усі теми', () => {
    view = quiz.tid ? 'topic' : 'list';
    quiz = null;
    render();
  });
  kids.push(el('div', { class: 'gqhead' }, stop, el('span', { class: 'gcount', text: (quiz.i + 1) + ' / ' + quiz.items.length })));
  const fill = el('i');
  fill.style.width = ((quiz.i + (a ? 1 : 0)) / quiz.items.length) * 100 + '%';
  kids.push(el('div', { class: 'gprog' }, fill));
  const card = el('div', { class: 'box gcard' }, el('p', { class: 'glabel', text: t.t + (q.ai ? ' · ШІ' : '') }));
  const right = q.k === 'p' ? q.o[0] : q.a[0];
  if (a) card.append(sentence(q, right, a.ok ? '' : a.given));
  else card.append(sentence(q));
  kids.push(card);
  if (q.k === 'p') {
    kids.push(el('div', { class: 'choices gopts' }, q.opts.map((o, i) => {
      const b = el('button', { type: 'button', class: 'choice', lang: 'en' }, el('span', { class: 'n', text: String(i + 1) }), el('span', { text: o.t }));
      if (a) {
        b.setAttribute('aria-disabled', 'true');
        if (o.ok) b.classList.add('ok');
        else if (a.given === o.t) b.classList.add('bad');
        else b.hidden = true;
      } else b.addEventListener('click', () => answer(o.ok, o.t));
      return b;
    })));
  } else if (!a) {
    const inp = el('input', { type: 'text', id: 'gAns', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', lang: 'en', placeholder: 'Пропущена форма', enterkeyhint: 'done' });
    const check = el('button', { type: 'button', class: 'btn primary', text: 'Перевірити' });
    const skip = el('button', { type: 'button', class: 'btn', text: 'Не знаю' });
    const go = () => {
      const v = inp.value.trim();
      if (!v) {
        inp.focus();
        return;
      }
      answer(gramCheck(v, q.a), v);
    };
    check.addEventListener('click', go);
    skip.addEventListener('click', () => answer(false, ''));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    kids.push(el('div', { class: 'typebox' }, inp, check, skip));
    setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { } }, 30);
  }
  if (a) {
    kids.push(el('div', { class: 'verdict gverd ' + (a.ok ? 'ok' : 'bad') },
      el('p', null, el('b', { text: a.ok ? 'Правильно.' : a.given ? 'Не зовсім.' : 'Правильна відповідь:' }), !a.ok ? ' ' : '', !a.ok && a.given ? 'Правильно: ' : '', !a.ok ? el('b', { lang: 'en', text: right }) : ''),
      q.w ? el('p', { class: 'gwhy', text: q.w }) : null
    ));
    if (aiNote && quiz.i === 0 && quiz.items.every((x) => x.ai)) kids.push(el('p', { class: 'note', text: aiNote }));
    if (q.ai) {
      const d = el('button', { type: 'button', class: 'act gdrop', text: 'Вправа з помилкою? Прибрати її' });
      d.addEventListener('click', () => dropAi(q, d));
      kids.push(d);
    }
    const n = el('button', { type: 'button', class: 'btn primary', id: 'gNext', text: quiz.i + 1 >= quiz.items.length ? 'Результат' : 'Далі' });
    n.addEventListener('click', next);
    kids.push(el('div', { class: 'next' }, n));
    setTimeout(() => { try { n.focus({ preventScroll: true }); } catch (e) { } }, 30);
  }
  return kids;
}

function renderResult() {
  const ok = quiz.res.filter((x) => x && x.ok).length;
  const n = quiz.items.length;
  const pct = Math.round((ok / Math.max(n, 1)) * 100);
  const kids = [];
  const head = pct >= 80 ? 'Чудово!' : pct >= 50 ? 'Непогано' : 'Варто повторити';
  const notes = quiz.after.map((x) => {
    const t = topicOf(x.id);
    const when = x.r.d === addDays(today(), 1) ? 'завтра' : x.r.d.split('-').reverse().slice(0, 2).join('.');
    return el('li', null, el('span', { text: t.t }), el('span', { class: 'gst', 'data-s': gramStatus(x.id), text: LABEL[gramStatus(x.id)] }), el('span', { class: 'gs', text: 'Повторення: ' + when }));
  });
  kids.push(el('div', { class: 'box gres' },
    el('h2', { text: head }),
    el('p', { class: 'gscore' }, el('b', { text: ok + ' з ' + n }), ' правильно · ' + pct + '%'),
    el('ul', { class: 'gafter' }, notes)
  ));
  const wrong = quiz.items.map((q, i) => ({ q: q, a: quiz.res[i] })).filter((x) => !x.a || !x.a.ok);
  if (wrong.length) {
    kids.push(el('section', { class: 'group' }, el('h3', { text: 'Помилки' }), el('ul', { class: 'box gerr gmiss' }, wrong.map((x) => {
      const right = x.q.k === 'p' ? x.q.o[0] : x.q.a[0];
      return el('li', null, sentence(x.q, right, x.a && x.a.given ? x.a.given : ''), el('span', { class: 'gs', text: x.q.w }));
    }))));
  }
  const again = el('button', { type: 'button', class: 'btn', text: 'Ще раз' });
  again.addEventListener('click', () => (quiz.tid ? startTopic(quiz.tid) : startMix()));
  const back = el('button', { type: 'button', class: 'btn primary', text: 'До тем' });
  back.addEventListener('click', () => { view = 'list'; quiz = null; render(); });
  kids.push(el('div', { class: 'gacts' }, back, quiz.tid || gramSummary().due ? again : null));
  return kids;
}

function render() {
  const box = $('gBody');
  if (!box) return;
  let kids;
  if (view === 'quiz' && quiz) kids = renderQuiz();
  else if (view === 'result' && quiz) kids = renderResult();
  else if (view === 'topic') kids = renderTopic();
  else {
    view = 'list';
    kids = renderList();
  }
  box.replaceChildren(...kids);
}

export function renderGram() {
  render();
}

export function gramTeacherBlock() {
  const s = gramSummary();
  const started = TOPICS.filter((t) => recOf(t.id));
  const kids = [el('p', { class: 'note' }, 'Граматика ' + LEVEL + ': засвоєно ', el('b', { text: s.done + ' з ' + s.total }), s.learn ? ', вчить ' + s.learn : '')];
  if (started.length) {
    kids.push(el('ul', { class: 'box gerr gteach' }, started.map((t) => {
      const r = recOf(t.id);
      const st = gramStatus(t.id);
      return el('li', null, el('span', { text: t.t }), el('span', { class: 'gs' }, el('span', { class: 'gst', 'data-s': st, text: LABEL[st] }), ' ' + Math.round((r.ok / Math.max(r.n, 1)) * 100) + '% правильних'));
    })));
  } else kids.push(el('p', { class: 'note', text: 'Ще не починала.' }));
  return el('section', { class: 'group' }, el('h3', { text: 'Граматика' }), kids);
}
