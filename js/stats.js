import { $, el, today, addDays, plural } from './util.js';
import { state, streakOf, setCardAi } from './store.js';
import { RULES } from './grammar.js';

const WEEKS = 15;
const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
let picked = '';

const reps = (n) => n + ' ' + plural(n, 'повторення', 'повторення', 'повторень');

function dayLabel(d) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long' });
  } catch (e) {
    return d;
  }
}

function bestStreak(log) {
  const days = Object.keys(log).filter((d) => log[d] > 0).sort();
  let best = 0;
  let run = 0;
  let prev = '';
  days.forEach((d) => {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  });
  return best;
}

function levelOf(n, goal) {
  if (!n) return 0;
  const g = goal || 20;
  if (n < g / 2) return 1;
  if (n < g) return 2;
  if (n < g * 2) return 3;
  return 4;
}

function tile(label, value) {
  return el('div', { class: 'stat' }, el('span', { text: label }), el('strong', { text: String(value) }));
}

function renderTiles() {
  const t = today();
  let week = 0;
  for (let i = 0; i < 7; i++) week += state.log[addDays(t, -i)] || 0;
  let total = 0;
  Object.keys(state.log).forEach((d) => { total += state.log[d] || 0; });
  $('stTiles').replaceChildren(
    tile('Серія днів', streakOf(state.log)),
    tile('Найдовша серія', bestStreak(state.log)),
    tile('За 7 днів', week),
    tile('За 4 місяці', total)
  );
}

function renderCalendar() {
  const t = today();
  const goal = Number(state.settings.goal) || 0;
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const start = addDays(t, -dow - (WEEKS - 1) * 7);
  const grid = $('stCal');
  const months = $('stMonths');
  grid.replaceChildren();
  months.replaceChildren();
  let lastMonth = '';
  for (let w = 0; w < WEEKS; w++) {
    const first = addDays(start, w * 7);
    const m = first.slice(0, 7);
    let label = '';
    if (m !== lastMonth) {
      lastMonth = m;
      try {
        label = new Date(first + 'T12:00:00').toLocaleDateString('uk-UA', { month: 'short' }).replace('.', '');
      } catch (e) {
        label = first.slice(5, 7);
      }
    }
    months.append(el('span', { text: label }));
    const col = el('div', { class: 'calcol' });
    for (let d = 0; d < 7; d++) {
      const day = addDays(first, d);
      if (day > t) {
        col.append(el('span', { class: 'cell off', 'aria-hidden': 'true' }));
        continue;
      }
      const n = state.log[day] || 0;
      const b = el('button', { type: 'button', class: 'cell' + (day === t ? ' today' : '') + (day === picked ? ' sel' : ''), 'data-l': String(levelOf(n, goal)), 'data-day': day, 'aria-label': dayLabel(day) + ': ' + reps(n), title: dayLabel(day) + ': ' + reps(n) });
      col.append(b);
    }
    grid.append(col);
  }
  const day = picked || t;
  const n = state.log[day] || 0;
  $('stCalInfo').textContent = dayLabel(day) + ': ' + reps(n) + (goal && day === t ? ' з ' + goal : '');
}

const LEVELS = [
  { k: 'new', t: 'Нові', hint: 'ще не вчила' },
  { k: 'low', t: 'Початок', hint: 'рівень 0–1' },
  { k: 'mid', t: 'У процесі', hint: 'рівень 2–3' },
  { k: 'high', t: 'Майже знаю', hint: 'рівень 4–5' },
  { k: 'done', t: 'Вивчені', hint: 'у вкладці «Вивчені»' }
];

function renderLevels() {
  const n = { new: 0, low: 0, mid: 0, high: 0, done: 0 };
  state.cards.forEach((c) => {
    if (c.done) n.done++;
    else if (!c.eu && !c.ue) n.new++;
    else {
      const b = Math.max(c.eu ? c.eu.b : 0, c.ue ? c.ue.b : 0);
      if (b <= 1) n.low++;
      else if (b <= 3) n.mid++;
      else n.high++;
    }
  });
  const total = state.cards.length;
  $('stLevelsTitle').textContent = 'Слова за рівнем: ' + total;
  $('stBar').replaceChildren(...LEVELS.filter((l) => n[l.k] > 0).map((l) => el('span', { class: 'seg-l', 'data-k': l.k, style: 'flex-grow:' + n[l.k], title: l.t + ': ' + n[l.k] })));
  $('stLegend').replaceChildren(...LEVELS.map((l) => el('li', null,
    el('span', { class: 'sw', 'data-k': l.k, 'aria-hidden': 'true' }),
    el('span', { class: 'lt' }, l.t, el('small', { text: l.hint })),
    el('strong', { text: String(n[l.k]) }),
    el('span', { class: 'pc', text: total ? Math.round((n[l.k] / total) * 100) + '%' : '' })
  )));
  $('stBar').hidden = !total;
}

function renderMistakes() {
  const list = [];
  state.cards.forEach((c) => {
    Object.keys(c.whys || {}).forEach((k) => list.push({ c: c, k: k, text: c.whys[k] }));
  });
  const box = $('stMistakes');
  $('stMistakesTitle').textContent = 'Мої помилки' + (list.length ? ': ' + list.length : '');
  if (!list.length) {
    box.replaceChildren(el('p', { class: 'note', text: state.ai === false ? 'Тут збираються пояснення помилок від ШІ. У цьому словнику ШІ вимкнено.' : 'Тут збиратимуться пояснення, які ти отримуєш кнопкою «Чому так?» після помилки у вправах.' }));
    return;
  }
  box.replaceChildren(...list.reverse().map((m) => {
    const parts = m.k.split(' > ');
    const rm = el('button', { type: 'button', class: 'mini', text: 'Прибрати' });
    rm.addEventListener('click', async () => {
      rm.disabled = true;
      const whys = Object.assign({}, m.c.whys);
      delete whys[m.k];
      try {
        await setCardAi(m.c.id, { whys: whys });
        renderMistakes();
      } catch (e) {
        rm.disabled = false;
      }
    });
    return el('details', { class: 'fold' },
      el('summary', null, el('span', { class: 'fw', lang: 'en', text: m.c.en }), el('span', { class: 'fs' }, el('s', { lang: 'en', text: parts[0] || '' }), ' → ', el('b', { lang: 'en', text: parts[1] || '' }))),
      el('p', { class: 'ft', text: m.text }),
      rm
    );
  }));
}

function renderRules() {
  const box = $('stRules');
  if (box.childNodes.length) return;
  box.replaceChildren(...RULES.map((r) => el('details', { class: 'fold' },
    el('summary', null, el('span', { class: 'fw', text: r.t })),
    r.p.map((x) => el('p', { class: 'ft', text: x })),
    el('ul', { class: 'fex', lang: 'en' }, r.ex.map((x) => el('li', { text: x })))
  )));
}

export function renderStats() {
  renderTiles();
  renderCalendar();
  renderLevels();
  renderMistakes();
  renderRules();
}

export function bindStats() {
  $('stCal').addEventListener('click', (e) => {
    const b = e.target.closest('.cell[data-day]');
    if (!b) return;
    picked = b.dataset.day === picked ? '' : b.dataset.day;
    renderCalendar();
  });
  $('stDow').replaceChildren(...DOW.map((d, i) => el('span', { text: i % 2 === 0 ? d : '' })));
}
