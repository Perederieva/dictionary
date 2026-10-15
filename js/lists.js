import { $, el, plural, bars, armDelete } from './util.js';
import { norm, parseBulk } from './text.js';
import { state, activeCards, doneCards, addCards, removeCards, tagCounts } from './store.js';
import { makeMeta, editForm, tagsRow } from './meta.js';
import { setDone, dropFromQueue, setWordsChanged, renderStrip } from './learn.js';

let hooks = { onChange: () => {}, setSync: () => {} };
export const initLists = (h) => { hooks = h; };

const hit = (c, q) => !q || c.en.toLowerCase().indexOf(q) !== -1 || c.uk.toLowerCase().indexOf(q) !== -1;
const hasDup = (cards, en) => cards.some((c) => norm(c.en) === norm(en));

function refreshLists() {
  renderWords();
  renderLearned();
  renderStrip();
}

async function removeOne(id) {
  try {
    await removeCards([id]);
  } catch (e) {
    hooks.setSync('error');
    return;
  }
  dropFromQueue();
  refreshLists();
}

let addMeta = null;
let bulkMeta = null;

function rowFor(c, kind) {
  const edit = el('button', { type: 'button', class: 'act', text: 'Редагувати' });
  const li = el('li', { class: 'row' });
  edit.addEventListener('click', () => {
    li.replaceChildren(editForm(c, (saved) => {
      if (saved) {
        setWordsChanged();
        refreshLists();
      } else {
        li.replaceWith(rowFor(c, kind));
      }
    }));
  });
  const del = el('button', { type: 'button', class: 'act del', text: 'Видалити' });
  armDelete(del, 'Видалити', () => removeOne(c.id));
  const move = el('button', { type: 'button', class: 'act', text: kind === 'learned' ? 'Повернути до вивчення' : 'У вивчені' });
  move.addEventListener('click', () => {
    setDone(c.id, kind !== 'learned');
    refreshLists();
  });
  li.append(
    el('div', { class: 'en', lang: 'en' }, c.en, c.by === 't' ? el('span', { class: 'tag t', text: 'від вчителя' }) : null),
    el('div', { class: 'acts' }, edit, move, del),
    el('div', { class: 'uk', lang: 'uk', text: c.uk }),
    c.ex ? el('div', { class: 'sample', lang: 'en', text: c.ex }) : null,
    tagsRow(c),
    el('div', { class: 'meta' }, bars(c))
  );
  return li;
}

function renderTagFilter() {
  const sel = $('wTag');
  const cur = sel.value;
  sel.replaceChildren(el('option', { value: '', text: 'Усі теми' }));
  tagCounts(activeCards()).forEach((t) => sel.append(el('option', { value: t[0], text: t[0] + ' (' + t[1] + ')' })));
  sel.value = Array.from(sel.options).some((o) => o.value === cur) ? cur : '';
}

export function renderWords() {
  const q = ($('find').value || '').toLowerCase().trim();
  const list = $('list');
  list.replaceChildren();
  renderTagFilter();
  const wk = $('wKind').value;
  const wt = $('wTag').value;
  const all = activeCards().filter((c) => (wk === 'all' || c.kind === wk) && (!wt || c.tags.indexOf(wt) !== -1));
  const cards = all.slice().reverse().filter((c) => hit(c, q));
  if (!cards.length) {
    list.append(el('li', { class: 'empty', text: all.length ? 'Нічого не знайдено.' : 'Тут поки порожньо. Додай слова вище.' }));
  }
  cards.forEach((c) => list.append(rowFor(c, 'words')));
  $('count').textContent = q ? cards.length + ' з ' + all.length : all.length + ' ' + plural(all.length, 'слово', 'слова', 'слів');
  const starters = activeCards().filter((c) => c.s).length;
  $('starterRow').hidden = !starters;
  const btn = $('dropStarter');
  if (starters && !btn.classList.contains('armed')) btn.textContent = 'Прибрати стартові слова (' + starters + ')';
  hooks.onChange();
}

export function renderLearned() {
  const q = ($('findDone').value || '').toLowerCase().trim();
  const list = $('doneList');
  list.replaceChildren();
  const all = doneCards();
  const cards = all.slice().sort((a, b) => b.done - a.done).filter((c) => hit(c, q));
  if (!cards.length) {
    list.append(el('li', { class: 'empty', text: all.length ? 'Нічого не знайдено.' : 'Тут поки порожньо. Переноси сюди слова кнопкою «У вивчені».' }));
  }
  cards.forEach((c) => list.append(rowFor(c, 'learned')));
  $('countDone').textContent = q ? cards.length + ' з ' + all.length : all.length + ' ' + plural(all.length, 'слово', 'слова', 'слів');
  hooks.onChange();
}

function bindStarterDrop() {
  const btn = $('dropStarter');
  let armed = false;
  let timer = null;
  btn.addEventListener('click', async () => {
    if (!armed) {
      armed = true;
      btn.classList.add('armed');
      btn.textContent = 'Точно прибрати?';
      timer = setTimeout(() => {
        armed = false;
        btn.classList.remove('armed');
        renderWords();
      }, 3000);
      return;
    }
    clearTimeout(timer);
    armed = false;
    btn.classList.remove('armed');
    const ids = state.cards.filter((c) => c.s && !c.done).map((c) => c.id);
    try {
      for (let i = 0; i < ids.length; i += 200) await removeCards(ids.slice(i, i + 200));
    } catch (e) {
      hooks.setSync('error');
    }
    dropFromQueue();
    refreshLists();
  });
}

export function bindLists() {
  addMeta = makeMeta();
  bulkMeta = makeMeta();
  $('addMeta').replaceChildren(addMeta.node);
  $('bulkMeta').replaceChildren(bulkMeta.node);
  $('wKind').addEventListener('change', renderWords);
  $('wTag').addEventListener('change', renderWords);
  $('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const en = $('inEn').value.trim();
    const uk = $('inUk').value.trim();
    const ex = $('inEx').value.trim();
    const msg = $('addMsg');
    if (!en || !uk) {
      msg.textContent = 'Потрібні обидва поля: слово й переклад.';
      return;
    }
    if (hasDup(state.cards, en)) {
      msg.textContent = 'Таке слово вже є в списку.';
      return;
    }
    const btn = $('addBtn');
    btn.disabled = true;
    msg.textContent = 'Додаю…';
    try {
      const m = addMeta.get();
      await addCards([{ en: en, uk: uk, ex: ex, kind: m.kind, tags: m.tags }]);
      setWordsChanged();
      msg.textContent = 'Додано: ' + en;
      $('inEn').value = '';
      $('inUk').value = '';
      $('inEx').value = '';
      $('inEn').focus();
      refreshLists();
    } catch (err) {
      msg.textContent = 'Не вдалося додати. Спробуй ще раз.';
    }
    btn.disabled = false;
  });

  $('bulkBtn').addEventListener('click', async () => {
    const msg = $('bulkMsg');
    const parsed = parseBulk($('bulk').value);
    if (!parsed.length) {
      msg.textContent = 'Не знайшов жодного рядка у форматі «слово — переклад».';
      return;
    }
    const seen = new Set(state.cards.map((c) => norm(c.en)));
    let dup = 0;
    const rows = parsed.filter((r) => {
      const k = norm(r[0]);
      if (seen.has(k)) { dup++; return false; }
      seen.add(k);
      return true;
    }).slice(0, 200);
    if (!rows.length) {
      msg.textContent = 'Усі ці слова вже є.';
      return;
    }
    const btn = $('bulkBtn');
    btn.disabled = true;
    msg.textContent = 'Додаю…';
    try {
      const m = bulkMeta.get();
      const added = await addCards(rows.map((r) => ({ en: r[0], uk: r[1], kind: m.kind, tags: m.tags })));
      setWordsChanged();
      $('bulk').value = '';
      msg.textContent = 'Додано: ' + added.length + (dup ? ', вже були: ' + dup : '') + '.';
      refreshLists();
    } catch (err) {
      msg.textContent = 'Не вдалося додати. Спробуй ще раз.';
    }
    btn.disabled = false;
  });

  $('find').addEventListener('input', renderWords);
  $('findDone').addEventListener('input', renderLearned);
  bindStarterDrop();
}
