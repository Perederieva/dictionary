import { $, el, today, plural, agoText, bars, armDelete, actionsMenu } from './util.js';
import { parseBulk, norm } from './text.js';
import { state, load, addCards, removeCards, streakOf, setCardMark } from './store.js';
import { makeMeta, editForm, tagsRow } from './meta.js';
import { suggestInto, exampleInto } from './ai.js';
import { isLeech } from './learn.js';

let hooks = { setSync: () => {} };
export const initTeacher = (h) => { hooks = h; };

function stat(label, value) {
  return el('div', { class: 'stat' }, el('span', { text: label }), el('strong', { text: String(value) }));
}

function weakWords() {
  const out = [];
  state.cards.filter((c) => !c.done).forEach((c) => {
    const bs = [];
    if (c.eu) bs.push({ d: 'EN → UA', b: c.eu.b });
    if (c.ue) bs.push({ d: 'UA → EN', b: c.ue.b });
    if (!bs.length) return;
    bs.sort((a, b) => a.b - b.b);
    const leech = isLeech(c);
    if (bs[0].b <= 1 || leech) out.push({ c: c, d: bs[0].d, b: bs[0].b, leech: leech });
  });
  out.sort((a, b) => (b.leech ? b.c.lapses : -1) - (a.leech ? a.c.lapses : -1) || a.b - b.b);
  return out.slice(0, 8);
}

function addBlock() {
  const inEn = el('input', { id: 'tEn', type: 'text', lang: 'en', autocapitalize: 'none', spellcheck: 'false' });
  const inUk = el('input', { id: 'tUk', type: 'text', lang: 'uk' });
  const inEx = el('input', { id: 'tEx', type: 'text', lang: 'en', spellcheck: 'false' });
  const inIpa = el('input', { id: 'tIpa', type: 'text', spellcheck: 'false', autocapitalize: 'none', maxlength: '100', placeholder: 'напр. /ˈθʌrəli/' });
  const inNote = el('input', { id: 'tNote', type: 'text', maxlength: '300', placeholder: 'напр. зверни увагу на прийменник' });
  const inHw = el('input', { id: 'tHw', type: 'checkbox' });
  const msg = el('span', { class: 'msg', role: 'status' });
  const btn = el('button', { type: 'submit', class: 'btn primary', text: 'Додати слово' });
  const aiBtn = el('button', { type: 'button', class: 'btn', text: 'Підказати (ШІ)' });
  const exBtn = el('button', { type: 'button', class: 'btn sm', text: 'Згенерувати' });
  const bulk = el('textarea', { id: 'tBulk', rows: '4', spellcheck: 'false', placeholder: 'thoroughly — ретельно\nto overcome — подолати' });
  const bulkMsg = el('span', { class: 'msg', role: 'status' });
  const bulkBtn = el('button', { type: 'button', class: 'btn', text: 'Додати все' });
  const metaAdd = makeMeta();
  const metaBulk = makeMeta();

  const form = el('form', { class: 'form', autocomplete: 'off' },
    el('div', { class: 'row2' },
      el('label', { for: 'tEn' }, 'English', inEn),
      el('label', { for: 'tUk' }, 'Українська', inUk)
    ),
    el('label', { for: 'tIpa' }, 'Транскрипція (необов\'язково)', inIpa),
    el('label', { for: 'tEx' }, 'Приклад речення (необов\'язково)', el('span', { class: 'with-btn' }, inEx, exBtn)),
    el('label', { for: 'tNote' }, 'Нотатка для учениці (необов\'язково)', inNote),
    el('label', { class: 'inline check', for: 'tHw' }, inHw, 'Домашнє завдання'),
    metaAdd.node,
    el('div', { class: 'actions' }, btn, aiBtn, msg)
  );

  exBtn.addEventListener('click', () => exampleInto({ en: inEn, uk: inUk, ex: inEx, msg: msg, btn: exBtn }));
  aiBtn.addEventListener('click', () => suggestInto({ en: inEn, uk: inUk, ex: inEx, ipa: inIpa, meta: metaAdd, msg: msg, btn: aiBtn, done: 'Підказки підставлено, перевір їх перед додаванням.' }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const en = inEn.value.trim();
    const uk = inUk.value.trim();
    const ex = inEx.value.trim();
    if (!en || !uk) { msg.textContent = 'Потрібні обидва поля.'; return; }
    if (state.cards.some((c) => norm(c.en) === norm(en))) { msg.textContent = 'Таке слово вже є.'; return; }
    btn.disabled = true;
    msg.textContent = 'Додаю…';
    try {
      const m = metaAdd.get();
      await addCards([{ en: en, uk: uk, ex: ex, ipa: inIpa.value.trim(), note: inNote.value.trim(), hw: inHw.checked, kind: m.kind, tags: m.tags }]);
      renderTeacher();
    } catch (err) {
      msg.textContent = 'Не вдалося додати.';
      btn.disabled = false;
    }
  });

  bulkBtn.addEventListener('click', async () => {
    const seen = new Set(state.cards.map((c) => norm(c.en)));
    const rows = parseBulk(bulk.value).filter((r) => {
      const k = norm(r[0]);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 200);
    if (!rows.length) { bulkMsg.textContent = 'Нових рядків немає.'; return; }
    bulkBtn.disabled = true;
    bulkMsg.textContent = 'Додаю…';
    try {
      const m = metaBulk.get();
      await addCards(rows.map((r) => ({ en: r[0], uk: r[1], kind: m.kind, tags: m.tags })));
      renderTeacher();
    } catch (err) {
      bulkMsg.textContent = 'Не вдалося додати.';
      bulkBtn.disabled = false;
    }
  });

  return el('div', { class: 'block' },
    el('h2', { text: 'Додати слова' }),
    form,
    el('details', { class: 'bulk' },
      el('summary', { text: 'Додати списком' }),
      el('p', { class: 'note', text: 'По одному слову на рядок: слово — переклад.' }),
      el('label', { for: 'tBulk' }, 'Список', bulk),
      el('p', { class: 'note', text: 'Тип і теми нижче застосуються до всіх слів зі списку.' }),
      metaBulk.node,
      el('div', { class: 'actions' }, bulkBtn, bulkMsg)
    )
  );
}

function markForm(c, li) {
  const note = el('textarea', { maxlength: '300', 'aria-label': 'Нотатка', placeholder: 'Нотатка для учениці' });
  note.value = c.note || '';
  const hw = el('input', { type: 'checkbox' });
  hw.checked = !!c.hw;
  const msg = el('span', { class: 'msg', role: 'status' });
  const save = el('button', { type: 'button', class: 'btn primary sm', text: 'Зберегти' });
  const cancel = el('button', { type: 'button', class: 'btn sm', text: 'Скасувати' });
  save.addEventListener('click', async () => {
    save.disabled = true;
    msg.textContent = 'Зберігаю…';
    try {
      await setCardMark(c.id, { note: note.value, hw: hw.checked });
      renderTeacher();
    } catch (e) {
      msg.textContent = 'Не вдалося зберегти.';
      save.disabled = false;
    }
  });
  cancel.addEventListener('click', () => li.replaceWith(row(c)));
  return el('div', { class: 'mark-ed' },
    el('b', { lang: 'en', text: c.en }),
    note,
    el('label', { class: 'inline check' }, hw, 'Домашнє завдання'),
    el('div', { class: 'actions' }, save, cancel, msg)
  );
}

function row(c) {
  const items = [];
  const li = el('li', { class: 'row' });
  const mark = el('button', { type: 'button', class: 'act', text: c.note || c.hw ? 'Змінити нотатку' : 'Нотатка' });
  mark.addEventListener('click', () => li.replaceChildren(markForm(c, li)));
  items.push(mark);
  if (c.by === 't') {
    const edit = el('button', { type: 'button', class: 'act', text: 'Редагувати' });
    edit.addEventListener('click', () => {
      li.replaceChildren(editForm(c, (saved) => {
        if (saved) renderTeacher();
        else li.replaceWith(row(c));
      }));
    });
    items.push(edit);
    const del = el('button', { type: 'button', class: 'act del', text: 'Видалити' });
    armDelete(del, 'Видалити', async () => {
      try {
        await removeCards([c.id]);
        renderTeacher();
      } catch (e) {
        hooks.setSync('error');
      }
    });
    items.push(del);
  }
  li.append(...[
    el('div', { class: 'en', lang: 'en' }, c.en, c.ipa ? el('span', { class: 'ipa', text: c.ipa }) : null, c.done ? el('span', { class: 'tag', text: 'вивчене' }) : null, c.by === 't' ? el('span', { class: 'tag t', text: 'моє' }) : null, c.hw ? el('span', { class: 'tag hw', text: 'домашнє' }) : null, isLeech(c) ? el('span', { class: 'tag leech', text: 'пастка' }) : null),
    actionsMenu(items),
    el('div', { class: 'uk', lang: 'uk', text: c.uk }),
    c.ex ? el('div', { class: 'sample', lang: 'en', text: c.ex }) : null,
    c.note ? el('div', { class: 'tnote', text: 'Нотатка: ' + c.note }) : null,
    tagsRow(c),
    el('div', { class: 'meta' }, bars(c))
  ].filter(Boolean));
  return li;
}

export function renderTeacher() {
  const body = $('tBody');
  const active = state.cards.filter((c) => !c.done);
  const days = Object.keys(state.log).filter((d) => state.log[d] > 0).sort();
  const s = streakOf(state.log);
  const weak = weakWords();
  const list = el('ul', { class: 'list' });
  state.cards.slice().reverse().forEach((c) => list.append(row(c)));
  if (!state.cards.length) list.append(el('li', { class: 'empty', text: 'Поки що немає слів.' }));
  body.replaceChildren(
    el('div', { class: 'strip four' },
      stat('Серія', s + ' ' + plural(s, 'день', 'дні', 'днів')),
      stat('Сьогодні', state.log[today()] || 0),
      stat('Вчить', active.length),
      stat('Вивчені', state.cards.length - active.length)
    ),
    el('p', { class: 'note', text: 'Остання активність: ' + agoText(days[days.length - 1]) }),
    el('div', { class: 'block' },
      el('h2', { text: 'Слабкі слова' }),
      weak.length
        ? el('ul', { class: 'weak' }, weak.map((w) => el('li', null, el('b', { text: w.c.en }), el('span', { text: w.c.uk + ' · ' + (w.leech ? 'пастка, «не знаю» ' + w.c.lapses + ' ' + plural(w.c.lapses, 'раз', 'рази', 'разів') : w.d) }))))
        : el('p', { class: 'note', text: 'Поки що немає слів, з якими часто помиляються.' })
    ),
    addBlock(),
    el('h2', { class: 'stname', text: 'Усі слова' }),
    list
  );
}

export function bindTeacher() {
  $('tRefresh').addEventListener('click', async () => {
    $('tRefresh').disabled = true;
    try {
      await load(state.key);
      renderTeacher();
    } catch (e) {
      hooks.setSync('error');
    }
    $('tRefresh').disabled = false;
  });
}
