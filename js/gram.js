import { $, el, today, addDays, shuffle, plural } from './util.js';
import { state, markGram, activeCards, setGramAi } from './store.js';
import { aiGram, aiMessage, withRetry } from './ai.js';
import { TOPICS, LEVEL, GROUPS } from './gram-b1.js';
import { RULES, RULE_GROUPS } from './grammar.js';
import { VIS } from './gram-vis.js';
import { MORE } from './gram-more.js';

const INT = [1, 2, 4, 8, 16, 32];
const MASTER = 3;
const PER = 8;
const MIX = 10;
const TEST = 20;
const FINAL = 30;

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
  if (q.k === 'o') {
    item.words = q.s.split(/\s+/).filter(Boolean);
    let ord = shuffle(item.words.map((w, i) => i));
    if (ord.every((v, i) => v === i)) ord = ord.reverse();
    item.ord = ord;
    item.line = [];
  }
  return item;
}

const aiOf = (id) => (Array.isArray(state.gramAi[id]) ? state.gramAi[id] : []);
const bankOf = (t) => t.q.concat(MORE[t.id] || [], aiOf(t.id).map((x) => Object.assign({ ai: true }, x)));

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

const tests = () => (state.gram._t && typeof state.gram._t === 'object' ? state.gram._t : {});

function startTest(gid) {
  const ids = gid === 'all' ? TOPICS.map((t) => t.id) : (GROUPS.find((g) => g.id === gid) || { ids: [] }).ids;
  const size = gid === 'all' ? FINAL : TEST;
  const per = Math.max(1, Math.ceil(size / ids.length));
  let items = [];
  ids.forEach((id) => {
    const t = topicOf(id);
    if (t) items = items.concat(shuffle(bankOf(t)).slice(0, per).map((q) => prepare(t, q)));
  });
  quiz = { items: shuffle(items).slice(0, size), i: 0, res: [], tid: '', test: gid, ans: null };
  view = 'quiz';
  render();
  window.scrollTo(0, 0);
}

function finish() {
  if (quiz.test) {
    const ok = quiz.res.filter((x) => x && x.ok).length;
    const pct = Math.round((ok / Math.max(quiz.items.length, 1)) * 100);
    const all = Object.assign({}, tests());
    const prev = all[quiz.test] || {};
    all[quiz.test] = { best: Math.max(prev.best || 0, pct), last: pct, at: today(), n: (prev.n || 0) + 1 };
    state.gram._t = all;
    quiz.after = [];
    markGram();
    view = 'result';
    render();
    return;
  }
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
  const kids = [];
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
  let num = 0;
  const item = (t) => {
    num++;
    const st = gramStatus(t.id);
    const b = el('button', { type: 'button', class: 'gitem', 'data-id': t.id },
      el('span', { class: 'gnum', text: String(num) }),
      el('span', { class: 'gtxt' }, el('span', { class: 'gt', lang: 'en', text: t.t }), el('span', { class: 'gs', text: t.s })),
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
  };
  const testItem = (gid, title, size) => {
    const r = tests()[gid];
    const b = el('button', { type: 'button', class: 'gitem gtest', 'data-test': gid },
      el('span', { class: 'gnum gtn', text: '✎' }),
      el('span', { class: 'gtxt' }, el('span', { class: 'gt', text: title }), el('span', { class: 'gs', text: size + ' питань з усіх тем' + (gid === 'all' ? '' : ' групи') + (r ? ' · найкраще ' + r.best + '%' : '') }))
    );
    if (r) b.append(el('span', { class: 'gst', 'data-s': r.best >= 80 ? 'done' : 'learn', text: r.last + '%' }));
    b.addEventListener('click', () => startTest(gid));
    return el('li', null, b);
  };
  GROUPS.forEach((g) => {
    const ts = g.ids.map(topicOf).filter(Boolean);
    const done = ts.filter((t) => gramStatus(t.id) === 'done').length;
    kids.push(el('section', { class: 'group' },
      el('h3', null, g.t, el('span', { class: 'gcnt', text: done + ' / ' + ts.length })),
      el('ol', { class: 'glist' }, ts.map(item), testItem(g.id, 'Тест: ' + g.t, TEST))
    ));
  });
  kids.push(el('section', { class: 'group' }, el('h3', { text: 'Підсумок рівня ' + LEVEL }), el('ol', { class: 'glist' }, testItem('all', 'Підсумковий тест ' + LEVEL, FINAL))));
  const fold = (r) => el('details', { class: 'fold' },
    el('summary', null, el('span', { class: 'fw', text: r.t })),
    r.p.map((x) => el('p', { class: 'ft' }, rich(x))),
    el('ul', { class: 'fex', lang: 'en' }, r.ex.map((x) => el('li', { text: x })))
  );
  kids.push(el('section', { class: 'group gcheat' },
    el('h3', { text: 'Шпаргалка' }),
    el('p', { class: 'note', text: 'Дрібні правила поза темами: як пишуться слова і які прийменники ставити.' }),
    RULE_GROUPS.map((g) => el('div', { class: 'gcheatg' }, el('p', { class: 'gcheath', text: g.t }), el('div', { class: 'folds' }, RULES.filter((r) => r.g === g.id).map(fold))))
  ));
  return kids;
}

const SVG = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, ...kids) {
  const n = document.createElementNS(SVG, tag);
  Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
  kids.forEach((c) => { if (c != null) n.append(c.nodeType ? c : document.createTextNode(c)); });
  return n;
}

function timeline(spec) {
  const Y = 40;
  const s = sv('svg', { viewBox: '0 0 320 68', class: 'tl', role: 'img', 'aria-label': spec.c });
  s.append(
    sv('line', { x1: 8, y1: Y, x2: 304, y2: Y, class: 'tl-axis' }),
    sv('path', { d: 'M304 ' + (Y - 4) + ' L312 ' + Y + ' L304 ' + (Y + 4) + ' Z', class: 'tl-head' }),
    sv('line', { x1: 200, y1: Y - 7, x2: 200, y2: Y + 7, class: 'tl-now' }),
    sv('text', { x: 8, y: 62, class: 'tl-t' }, 'минуле'),
    sv('text', { x: 200, y: 62, 'text-anchor': 'middle', class: 'tl-t tl-tn' }, 'зараз'),
    sv('text', { x: 312, y: 62, 'text-anchor': 'end', class: 'tl-t' }, 'майбутнє')
  );
  const xs = [];
  spec.m.forEach((m) => {
    xs.push(m.x);
    if (m.x2) xs.push(m.x2);
    if (m.k === 'dot') {
      s.append(sv('circle', { cx: m.x, cy: Y, r: m.big ? 6 : 4.5, class: 'tl-m' }));
      if (m.n) s.append(sv('text', { x: m.x, y: Y - 11, 'text-anchor': 'middle', class: 'tl-n' }, m.n));
    } else if (m.k === 'wave') {
      let d = 'M' + m.x + ' ' + (Y - 6);
      for (let x = m.x; x < m.x2; x += 10) d += ' q2.5 -5 5 0 t5 0';
      s.append(sv('path', { d: d, class: 'tl-w' }));
      s.append(sv('line', { x1: m.x, y1: Y, x2: m.x2, y2: Y, class: 'tl-span' }));
    } else if (m.k === 'arc') {
      const mid = (m.x + m.x2) / 2;
      s.append(sv('path', { d: 'M' + m.x + ' ' + Y + ' Q' + mid + ' ' + (Y - 30) + ' ' + m.x2 + ' ' + (Y - 2), class: 'tl-arc' }));
      s.append(sv('circle', { cx: m.x, cy: Y, r: 4.5, class: 'tl-m' }));
      s.append(sv('path', { d: 'M' + (m.x2 - 7) + ' ' + (Y - 9) + ' L' + m.x2 + ' ' + (Y - 1) + ' L' + (m.x2 - 9) + ' ' + (Y - 1), class: 'tl-arc' }));
    } else if (m.k === 'ref') {
      s.append(sv('line', { x1: m.x, y1: Y - 22, x2: m.x, y2: Y + 8, class: 'tl-ref' }));
    } else if (m.k === 'stop') {
      s.append(sv('path', { d: 'M' + (m.x - 5) + ' ' + (Y - 5) + ' L' + (m.x + 5) + ' ' + (Y + 5) + ' M' + (m.x + 5) + ' ' + (Y - 5) + ' L' + (m.x - 5) + ' ' + (Y + 5), class: 'tl-stop' }));
    } else if (m.k === 'alt') {
      s.append(sv('path', { d: 'M' + m.x + ' ' + Y + ' Q' + (m.x + 30) + ' ' + (Y - 20) + ' ' + m.x2 + ' ' + (Y - 15), class: 'tl-alt' }));
      s.append(sv('circle', { cx: m.x2, cy: Y - 15, r: 4.5, class: 'tl-altd' }));
    }
  });
  if (spec.l) {
    const c = Math.min(Math.max((Math.min(...xs) + Math.max(...xs)) / 2, 110), 210);
    s.append(sv('text', { x: c, y: 11, 'text-anchor': 'middle', class: 'tl-l', lang: 'en' }, spec.l));
  }
  return el('figure', { class: 'tlbox' }, el('figcaption', { text: spec.c }), s);
}

function formula(str) {
  const out = [];
  const re = /\{(\w) ([^}]+)\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(el('span', { class: 'fk fk-' + m[1], text: m[2] }));
    last = re.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function checkBlock(items) {
  const box = el('div', { class: 'gchk' });
  const state2 = items.map(() => null);
  const draw = () => {
    box.replaceChildren(...items.map((q, qi) => {
      const opts = q._o || (q._o = shuffle(q.o.map((t, i) => ({ t: t, ok: i === 0 }))));
      const a = state2[qi];
      const row = el('div', { class: 'gchk-i' }, sentence(q, a ? q.o[0] : undefined, a && !a.ok ? a.t : ''));
      row.append(el('div', { class: 'gchk-o' }, opts.map((o) => {
        const b = el('button', { type: 'button', class: 'bw', lang: 'en', text: o.t });
        if (a) {
          b.disabled = true;
          if (o.ok) b.classList.add('ok');
          else if (a.t === o.t) b.classList.add('bad');
        } else b.addEventListener('click', () => { state2[qi] = o; draw(); });
        return b;
      })));
      if (a) row.append(el('p', { class: 'gchk-w ' + (a.ok ? 'ok' : 'bad'), text: (a.ok ? '✓ ' : '✗ ') + q.w }));
      return row;
    }));
  };
  draw();
  return box;
}

const TERM = /\b((?:Present|Past|Future) (?:Perfect Continuous|Perfect Simple|Perfect|Simple|Continuous)(?: Passive)?|(?:Zero|First|Second|Third) Conditional|question tag)\b/g;

function latin(run) {
  const out = [];
  let last = 0;
  let m;
  TERM.lastIndex = 0;
  while ((m = TERM.exec(run))) {
    if (m.index > last) out.push(el('i', { class: 'rx', lang: 'en', text: run.slice(last, m.index) }));
    out.push(el('b', { class: 'rt', lang: 'en', text: m[1] }));
    last = TERM.lastIndex;
  }
  if (last < run.length) out.push(el('i', { class: 'rx', lang: 'en', text: run.slice(last) }));
  return out.filter((n) => n.textContent.trim() || n.className === 'rt');
}

function rich(text) {
  const out = [];
  const re = /«([^»]*[A-Za-z][^»]*)»|[A-Za-z\u00C0-\u024F0-9'’\/+\-.,!?…():; ]*[A-Za-z][A-Za-z\u00C0-\u024F0-9'’\/+\-.,!?…():; ]*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (!m[0]) {
      re.lastIndex++;
      continue;
    }
    if (m[1] !== undefined) {
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push('«', el('s', { class: 'rw', lang: 'en', text: m[1] }), '»');
      last = re.lastIndex;
      continue;
    }
    const raw = m[0];
    const lead = raw.match(/^[\s.,;:!?)\/+\-–]*/)[0];
    const trail = raw.match(/[\s(:;,\/+–-]*$/)[0];
    const core = raw.slice(lead.length, raw.length - trail.length);
    if (!/[A-Za-z]/.test(core)) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(lead, ...latin(core), trail);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderTopic() {
  const t = topicOf(topicId);
  if (!t) {
    view = 'list';
    return renderList();
  }
  const r = recOf(t.id);
  const st = gramStatus(t.id);
  const vis = VIS[t.id];
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
    vis && vis.vs ? el('section', { class: 'group' }, el('h3', { text: 'Коли що вживати' }), el('div', { class: 'gvs' + (vis.vs.length > 2 ? ' three' : '') }, vis.vs.map((v) => el('div', { class: 'gv' },
      el('p', { class: 'gvh', lang: 'en', text: v.h }),
      v.d ? el('p', { class: 'gvd', text: v.d }) : null,
      el('div', { class: 'gvm', lang: 'en' }, v.m.map((x) => el('span', { text: x }))),
      v.e ? el('p', { class: 'gve', lang: 'en', text: v.e }) : null
    )))) : null,
    vis && vis.tl ? el('section', { class: 'group' }, el('h3', { text: 'Схема' }), el('div', { class: 'box gtl' }, vis.tl.map(timeline))) : null,
    vis && vis.f ? el('section', { class: 'group' }, el('h3', { text: 'Формула' }), el('div', { class: 'box gf' },
      vis.f.map((r) => el('div', { class: 'gfr' }, el('span', { class: 'gfl', text: r[0] }), el('span', { class: 'gfx', lang: 'en' }, formula(r[1])))),
      el('p', { class: 'gfleg' }, el('span', { class: 'fk fk-s', text: 'хто' }), el('span', { class: 'fk fk-a', text: 'допоміжне' }), el('span', { class: 'fk fk-m', text: 'дієслово' }), el('span', { class: 'fk fk-w', text: 'маркер' }))
    )) : null,
    el('section', { class: 'group' }, el('h3', { text: 'Пояснення' }), el('div', { class: 'box gbox' }, t.rule.map((p) => el('p', { class: 'grule' }, rich(p))))),
    el('section', { class: 'group' }, el('h3', { text: 'Приклади' }), el('ul', { class: 'box gex' }, t.ex.map((e) => el('li', null, el('span', { class: 'gen', lang: 'en', text: e[0] }), el('span', { class: 'guk', text: e[1] }))))),
    el('section', { class: 'group' }, el('h3', { text: 'Типові помилки' }), el('ul', { class: 'box gerr' }, t.err.map((e) => el('li', null, el('s', { lang: 'en', text: e[0] }), el('span', { lang: 'en', text: e[1] }))))),
    vis && vis.chk ? el('section', { class: 'group' }, el('h3', { text: 'Перевір себе' }), checkBlock(vis.chk)) : null,
    el('div', { class: 'gstart' }, go, aiBtn, aiNote ? el('p', { class: 'aistatus ai-only' }, el('span', { class: 'aitext err', text: aiNote })) : null, el('p', { class: 'note', text: info }))
  ];
}

const KIND = { e: 'Знайди помилку', o: 'Склади речення', r: 'Перебудуй речення', y: 'Правильно чи ні?' };
const bare = (x) => String(x || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:"«»]/g, '').replace(/\s+/g, ' ').trim();

function rightText(q) {
  if (q.k === 'p') return q.o[0];
  if (q.k === 't') return q.a[0];
  if (q.k === 'e') return q.fix === '—' ? 'прибрати «' + q.bad + '»' : q.bad + ' → ' + q.fix;
  if (q.k === 'o') return q.s;
  if (q.k === 'r') return q.p.replace('___', q.a[0]).replace(/^\s+/, '');
  return q.ok ? 'Речення правильне' : q.fix;
}

function badSpan(q) {
  const toks = q.s.split(/\s+/);
  const want = q.bad.split(/\s+/).map(bare);
  for (let i = 0; i + want.length <= toks.length; i++) {
    if (want.every((w, j) => bare(toks[i + j]) === w)) return [i, i + want.length - 1];
  }
  return [-1, -1];
}

function stripPrompt(v, p) {
  const pre = bare(p.split('___')[0]);
  const x = bare(v);
  return pre && x.indexOf(pre) === 0 ? x.slice(pre.length).trim() : v;
}

function typeBox(placeholder, onGo) {
  const inp = el('input', { type: 'text', id: 'gAns', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', lang: 'en', placeholder: placeholder, enterkeyhint: 'done' });
  const check = el('button', { type: 'button', class: 'btn primary', text: 'Перевірити' });
  const skip = el('button', { type: 'button', class: 'btn', text: 'Не знаю' });
  const go = () => {
    const v = inp.value.trim();
    if (!v) {
      inp.focus();
      return;
    }
    onGo(v);
  };
  check.addEventListener('click', go);
  skip.addEventListener('click', () => answer(false, ''));
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { } }, 30);
  return el('div', { class: 'typebox' }, inp, check, skip);
}

function renderQuiz() {
  const q = quiz.items[quiz.i];
  const t = topicOf(q.tid);
  const a = quiz.ans;
  const kids = [];
  const stop = backBtn(quiz.tid ? 'До теми' : quiz.test ? 'Вийти з тесту' : 'Усі теми', () => {
    view = quiz.tid ? 'topic' : 'list';
    quiz = null;
    render();
  });
  kids.push(el('div', { class: 'gqhead' }, stop, el('span', { class: 'gcount', text: (quiz.i + 1) + ' / ' + quiz.items.length })));
  const fill = el('i');
  fill.style.width = ((quiz.i + (a ? 1 : 0)) / quiz.items.length) * 100 + '%';
  kids.push(el('div', { class: 'gprog' }, fill));
  const card = el('div', { class: 'box gcard' }, el('p', { class: 'glabel', lang: 'en', text: t.t + (q.ai ? ' · AI' : '') }));
  if (KIND[q.k]) card.append(el('p', { class: 'gkind', text: KIND[q.k] }));
  const right = rightText(q);
  kids.push(card);

  if (q.k === 'p' || q.k === 't') {
    card.append(a ? sentence(q, right, a.ok ? '' : a.given) : sentence(q));
  }
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
  } else if (q.k === 't' && !a) {
    kids.push(typeBox('Пропущена форма', (v) => answer(gramCheck(v, q.a), v)));
  } else if (q.k === 'e') {
    const span = badSpan(q);
    card.append(el('div', { class: 'gtoks', lang: 'en' }, q.s.split(/\s+/).map((w, i) => {
      const inSpan = i >= span[0] && i <= span[1];
      const b = el('button', { type: 'button', class: 'bw', text: w });
      if (a) {
        b.disabled = true;
        if (inSpan) b.classList.add('bad');
        else if (a.given === String(i)) b.classList.add('pick');
      } else b.addEventListener('click', () => answer(inSpan, String(i)));
      return b;
    })));
    if (a) card.append(el('p', { class: 'gfix', lang: 'en' }, el('s', { text: q.bad }), ' → ', el('b', { text: q.fix === '—' ? '(прибрати)' : q.fix })));
    if (!a) kids.push(el('p', { class: 'note', text: 'Натисни на слово з помилкою.' }));
  } else if (q.k === 'o') {
    card.append(el('p', { class: 'gq guk2', text: q.uk }));
    const line = el('div', { class: 'bline' }, q.line.map((wi, pos) => {
      const b = el('button', { type: 'button', class: 'bw', lang: 'en', text: q.words[wi] });
      if (a) {
        b.disabled = true;
        b.classList.add(a.ok || bare(q.words[wi]) === bare(q.words[pos]) ? 'ok' : 'bad');
      } else b.addEventListener('click', () => { q.line.splice(pos, 1); render(); });
      return b;
    }));
    kids.push(line);
    if (!a) {
      if (q.line.length < q.words.length) kids.push(el('div', { class: 'bpool' }, q.ord.map((wi) => {
        const b = el('button', { type: 'button', class: 'bw', lang: 'en', text: q.words[wi] });
        if (q.line.indexOf(wi) !== -1) {
          b.disabled = true;
          b.classList.add('used');
        } else b.addEventListener('click', () => { q.line.push(wi); render(); });
        return b;
      })));
      const check = el('button', { type: 'button', class: 'btn primary', text: 'Перевірити' });
      check.disabled = q.line.length !== q.words.length;
      check.addEventListener('click', () => {
        const mine = q.line.map((wi) => q.words[wi]).join(' ');
        answer(bare(mine) === bare(q.s), mine);
      });
      const skip = el('button', { type: 'button', class: 'btn', text: 'Не знаю' });
      skip.addEventListener('click', () => answer(false, ''));
      kids.push(el('div', { class: 'bacts' }, check, skip));
    }
  } else if (q.k === 'r') {
    card.append(el('p', { class: 'gq', lang: 'en', text: q.s }));
    const pre = q.p.split('___')[0];
    if (a) card.append(el('p', { class: 'gq gpr', lang: 'en' }, '→ ', pre, el('b', { class: 'gfill', text: q.a[0] })));
    else card.append(el('p', { class: 'gq gpr', lang: 'en' }, '→ ', pre, el('span', { class: 'ggap', text: '_____' })));
    if (!a) kids.push(typeBox('Продовж речення', (v) => answer(gramCheck(stripPrompt(v, q.p), q.a), v)));
  } else if (q.k === 'y') {
    card.append(el('p', { class: 'gq', lang: 'en', text: q.s }));
    if (a && !q.ok) card.append(el('p', { class: 'gfix', lang: 'en' }, '✓ ', el('b', { text: q.fix })));
    if (!a) {
      const yes = el('button', { type: 'button', class: 'btn gyes', text: '✓ Правильно' });
      const no = el('button', { type: 'button', class: 'btn gno', text: '✗ Є помилка' });
      yes.addEventListener('click', () => answer(q.ok === true, 'yes'));
      no.addEventListener('click', () => answer(q.ok !== true, 'no'));
      kids.push(el('div', { class: 'bacts' }, yes, no));
    }
  }

  if (a) {
    const head = a.ok ? 'Правильно.' : a.given ? 'Не зовсім.' : 'Правильна відповідь:';
    const showRight = !a.ok && (q.k === 'p' || q.k === 't' || q.k === 'o' || q.k === 'r');
    kids.push(el('div', { class: 'verdict gverd ' + (a.ok ? 'ok' : 'bad') },
      el('p', null, el('b', { text: head }), showRight ? ' ' : '', showRight && a.given ? 'Правильно: ' : '', showRight ? el('b', { lang: 'en', text: right }) : ''),
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
  let notes = quiz.after.map((x) => {
    const t = topicOf(x.id);
    const when = x.r.d === addDays(today(), 1) ? 'завтра' : x.r.d.split('-').reverse().slice(0, 2).join('.');
    return el('li', null, el('span', { text: t.t }), el('span', { class: 'gst', 'data-s': gramStatus(x.id), text: LABEL[gramStatus(x.id)] }), el('span', { class: 'gs', text: 'Повторення: ' + when }));
  });
  if (quiz.test) {
    const by = new Map();
    quiz.items.forEach((q, i) => {
      const x = by.get(q.tid) || { r: 0, n: 0 };
      x.n++;
      if (quiz.res[i] && quiz.res[i].ok) x.r++;
      by.set(q.tid, x);
    });
    notes = Array.from(by.entries()).sort((x, y) => x[1].r / x[1].n - y[1].r / y[1].n).map(([id, x]) => {
      const t = topicOf(id);
      const st = x.r === x.n ? 'done' : x.r / x.n >= 0.5 ? 'learn' : 'due';
      const b = el('button', { type: 'button', class: 'act gtopicl', text: t.t });
      b.addEventListener('click', () => { topicId = id; view = 'topic'; quiz = null; render(); window.scrollTo(0, 0); });
      return el('li', null, b, el('span', { class: 'gst', 'data-s': st, text: x.r + ' з ' + x.n }));
    });
  }
  kids.push(el('div', { class: 'box gres' },
    el('h2', { text: head }),
    quiz.test ? el('p', { class: 'gs', text: (quiz.test === 'all' ? 'Підсумковий тест ' + LEVEL : 'Тест: ' + (GROUPS.find((g) => g.id === quiz.test) || {}).t) + ' · найкраще ' + (tests()[quiz.test] || {}).best + '%' }) : null,
    el('p', { class: 'gscore' }, el('b', { text: ok + ' з ' + n }), ' правильно · ' + pct + '%'),
    el('ul', { class: 'gafter' }, notes)
  ));
  const wrong = quiz.items.map((q, i) => ({ q: q, a: quiz.res[i] })).filter((x) => !x.a || !x.a.ok);
  if (wrong.length) {
    kids.push(el('section', { class: 'group' }, el('h3', { text: 'Помилки' }), el('ul', { class: 'box gerr gmiss' }, wrong.map((x) => {
      const right = rightText(x.q);
      if (x.q.k === 'p' || x.q.k === 't') return el('li', null, sentence(x.q, right, x.a && x.a.given ? x.a.given : ''), el('span', { class: 'gs', text: x.q.w }));
      return el('li', null, el('p', { class: 'gq', lang: 'en', text: x.q.k === 'o' ? x.q.uk : x.q.s }), el('span', { class: 'gok', lang: 'en', text: '✓ ' + right }), el('span', { class: 'gs', text: x.q.w }));
    }))));
  }
  const again = el('button', { type: 'button', class: 'btn', text: 'Ще раз' });
  again.addEventListener('click', () => (quiz.test ? startTest(quiz.test) : quiz.tid ? startTopic(quiz.tid) : startMix()));
  const back = el('button', { type: 'button', class: 'btn primary', text: 'До тем' });
  back.addEventListener('click', () => { view = 'list'; quiz = null; render(); });
  kids.push(el('div', { class: 'gacts' }, back, quiz.tid || quiz.test || gramSummary().due ? again : null));
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
  box.replaceChildren(...kids.filter((k) => k != null));
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
  const tr = tests();
  const done = GROUPS.concat([{ id: 'all', t: 'Підсумковий тест ' + LEVEL }]).filter((g) => tr[g.id]);
  if (done.length) kids.push(el('ul', { class: 'box gerr gteach' }, done.map((g) => el('li', null, el('span', { text: g.id === 'all' ? g.t : 'Тест: ' + g.t }), el('span', { class: 'gs', text: 'останній ' + tr[g.id].last + '% · найкращий ' + tr[g.id].best + '% · спроб ' + tr[g.id].n })))));
  return el('section', { class: 'group' }, el('h3', { text: 'Граматика' }), kids);
}
