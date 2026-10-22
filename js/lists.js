import { $, el, plural, bars, armDelete, kindCounts, actionsMenu, markOn } from './util.js';
import { norm, parseBulk } from './text.js';
import { state, activeCards, doneCards, addCards, removeCards, tagCounts, updateCard, setCardMark } from './store.js';
import { enrich, aiMessage, suggestInto, exampleInto } from './ai.js';
import { makeMeta, editForm, tagsRow } from './meta.js';
import { getPrefs, setPref } from './prefs.js';
import { setDone, dropFromQueue, setWordsChanged, renderStrip, isLeech } from './learn.js';

let hooks = { onChange: () => {}, setSync: () => {} };
export const initLists = (h) => { hooks = h; };

const hit = (c, q) => !q || c.en.toLowerCase().indexOf(q) !== -1 || c.uk.toLowerCase().indexOf(q) !== -1;
const hasDup = (cards, en) => cards.some((c) => norm(c.en) === norm(en));
const seen = (c) => !!(c.eu || c.ue);
const best = (c) => Math.max(c.eu ? c.eu.b : 0, c.ue ? c.ue.b : 0);
const score = (c) => (c.eu ? c.eu.b : 0) + (c.ue ? c.ue.b : 0);
const LEVEL = {
  all: () => true,
  new: (c) => !seen(c),
  hard: (c) => seen(c) && best(c) <= 1,
  mid: (c) => seen(c) && best(c) >= 2 && best(c) <= 3,
  good: (c) => seen(c) && best(c) >= 4,
  leech: (c) => isLeech(c)
};
const SORT = {
  added: (list) => list.slice().reverse(),
  most: (list) => list.slice().reverse().sort((a, b) => score(b) - score(a)),
  least: (list) => list.slice().reverse().sort((a, b) => score(a) - score(b)),
  az: (list) => list.slice().sort((a, b) => a.en.localeCompare(b.en, 'en'))
};

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
let wantTag = null;
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
  let unhw = null;
  if (c.hw) {
    unhw = el('button', { type: 'button', class: 'act', text: 'Зняти з домашнього' });
    unhw.addEventListener('click', async () => {
      unhw.disabled = true;
      try {
        await setCardMark(c.id, { hw: false });
        setWordsChanged();
        refreshLists();
      } catch (e) {
        unhw.disabled = false;
        hooks.setSync('error');
      }
    });
  }
  li.append(...[
    el('div', { class: 'en', lang: 'en' }, c.en, c.ipa ? el('span', { class: 'ipa', text: c.ipa }) : null, c.by === 't' ? el('span', { class: 'tag t', text: 'від вчителя' }) : null, c.hw ? el('span', { class: 'tag hw', text: 'домашнє' }) : null, isLeech(c) ? el('span', { class: 'tag leech', title: 'Часто забувається: «не знаю» ' + c.lapses + ' ' + plural(c.lapses, 'раз', 'рази', 'разів'), text: 'пастка' }) : null),
    actionsMenu([edit, move, unhw, del]),
    el('div', { class: 'uk', lang: 'uk', text: c.uk }),
    c.ex ? el('div', { class: 'sample', lang: 'en', text: c.ex }) : null,
    c.note ? el('div', { class: 'tnote', text: 'Нотатка вчительки: ' + c.note }) : null,
    tagsRow(c),
    el('div', { class: 'meta' }, bars(c))
  ].filter(Boolean));
  return li;
}

function renderTagFilter() {
  const sel = $('wTag');
  const cur = wantTag !== null ? wantTag : sel.value;
  wantTag = null;
  sel.replaceChildren(el('option', { value: '', text: 'Усі теми' }));
  const wk = $('wKind').value;
  tagCounts(activeCards().filter((c) => wk === 'all' || c.kind === wk)).forEach((t) => sel.append(el('option', { value: t[0], text: t[0] + ' (' + t[1] + ')' })));
  sel.value = Array.from(sel.options).some((o) => o.value === cur) ? cur : '';
}

export function renderWords() {
  const q = ($('find').value || '').toLowerCase().trim();
  const list = $('list');
  list.replaceChildren();
  renderTagFilter();
  const wk = $('wKind').value;
  const wt = $('wTag').value;
  const lvl = LEVEL[$('wLvl').value] || LEVEL.all;
  const sort = SORT[$('wSort').value] || SORT.added;
  const anyHw = activeCards().some((c) => c.hw);
  $('wHwBox').hidden = !anyHw;
  const whw = anyHw && $('wHw').checked;
  kindCounts($('wKind'), activeCards().filter((c) => (!wt || c.tags.indexOf(wt) !== -1) && lvl(c) && (!whw || c.hw)), { all: 'Усі', word: 'Слова', phrase: 'Фрази' });
  const all = activeCards().filter((c) => (wk === 'all' || c.kind === wk) && (!wt || c.tags.indexOf(wt) !== -1) && lvl(c) && (!whw || c.hw));
  const cards = sort(all).filter((c) => hit(c, q));
  markOn($('wKind'), 'all');
  markOn($('wTag'), '');
  markOn($('wLvl'), 'all');
  markOn($('wSort'), 'added');
  $('wHwBox').classList.toggle('on', whw);
  if (!cards.length) {
    list.append(el('li', { class: 'empty', text: all.length ? 'Нічого не знайдено.' : activeCards().length ? 'Немає слів із такими фільтрами.' : 'Тут поки порожньо. Додай слова вище.' }));
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

const AI_MAX = 50;

function bindAi() {
  const cache = new Map();
  let picks = [];
  let sug = [];
  let ctrl = null;

  $('aiEx1').addEventListener('click', () => exampleInto({ en: $('inEn'), uk: $('inUk'), ex: $('inEx'), msg: $('addMsg'), btn: $('aiEx1') }));
  $('aiSuggest').addEventListener('click', () => suggestInto({
    en: $('inEn'), uk: $('inUk'), ex: $('inEx'), ipa: $('inIpa'), meta: addMeta, msg: $('addMsg'), btn: $('aiSuggest'),
    done: 'Підказки підставлено, перевір їх перед додаванням.'
  }));

  const want = () => ({ tags: $('aiTags').checked, ex: $('aiEx').checked, ipa: $('aiIpa').checked });
  const needOf = (c, w) => ({ tags: w.tags && !c.tags.length, ex: w.ex && !c.ex, ipa: w.ipa && !c.ipa });
  const cachedFor = (c, n) => {
    const h = cache.get(c.id);
    if (!h || h.en !== c.en || h.uk !== c.uk) return null;
    return (!n.tags || h.need.tags) && (!n.ex || h.need.ex) && (!n.ipa || h.need.ipa) ? h : null;
  };
  const chosen = () => picks.filter((p) => p.box.checked).map((p) => p.c);

  function updateCount() {
    const n = chosen().length;
    const btn = $('aiRun');
    btn.textContent = 'Підготувати підказки' + (n ? ' (' + n + ')' : '');
    btn.disabled = n === 0 || n > AI_MAX;
    if (n > AI_MAX) $('aiMsg').textContent = 'За раз можна до ' + AI_MAX + ' слів, зараз вибрано ' + n + '.';
    else if (/^За раз/.test($('aiMsg').textContent)) $('aiMsg').textContent = '';
  }

  function renderPick() {
    if (ctrl) return;
    const w = want();
    const prev = new Map(picks.map((p) => [p.c.id, p.box.checked]));
    const list = $('aiPick');
    list.replaceChildren();
    picks = activeCards().slice().reverse().filter((c) => {
      const n = needOf(c, w);
      return n.tags || n.ex || n.ipa;
    }).map((c) => {
      const n = needOf(c, w);
      const box = el('input', { type: 'checkbox', 'aria-label': 'Вибрати ' + c.en });
      box.checked = !!prev.get(c.id);
      box.addEventListener('change', updateCount);
      const what = 'немає: ' + [n.tags ? 'тем' : '', n.ex ? 'прикладу' : '', n.ipa ? 'транскрипції' : ''].filter(Boolean).join(', ') + (cachedFor(c, n) ? ' · підказка готова' : '');
      list.append(el('li', { class: 'pick' }, el('label', { class: 'inline' }, box, el('span', { class: 'en', lang: 'en', text: c.en }), el('span', { class: 'need', text: what }))));
      return { c: c, box: box };
    });
    $('aiPickRow').hidden = !picks.length;
    if (!w.tags && !w.ex && !w.ipa) $('aiMsg').textContent = 'Обери, що заповнювати.';
    else if (!picks.length) $('aiMsg').textContent = 'Усім словам уже нічого не бракує.';
    else if (/^(Обери|Усім)/.test($('aiMsg').textContent)) $('aiMsg').textContent = '';
    updateCount();
  }

  function setRunning(on) {
    $('aiRun').hidden = on;
    $('aiStop').hidden = !on;
    $('aiTags').disabled = on;
    $('aiEx').disabled = on;
    $('aiIpa').disabled = on;
    $('aiAll').disabled = on;
    $('aiNone').disabled = on;
    picks.forEach((p) => { p.box.disabled = on; });
  }

  function showSuggestions(cards, w, note) {
    $('aiList').replaceChildren();
    sug = [];
    cards.forEach((c) => {
      const n = needOf(c, w);
      const h = cachedFor(c, n);
      if (!h) return;
      const useTags = n.tags && h.tags.length > 0;
      const useEx = n.ex && !!h.ex;
      const useIpa = n.ipa && !!h.ipa;
      if (!useTags && !useEx && !useIpa) return;
      sug.push({ c: c, kind: useTags ? h.kind : c.kind, tags: useTags ? h.tags : c.tags, ex: useEx ? h.ex : c.ex, ipa: useIpa ? h.ipa : c.ipa, box: null });
    });
    sug.forEach((s) => {
      s.box = el('input', { type: 'checkbox', 'aria-label': 'Застосувати для ' + s.c.en });
      s.box.checked = true;
      $('aiList').append(el('li', { class: 'row sug' },
        el('div', { class: 'en', lang: 'en' }, s.box, ' ', s.c.en, s.ipa ? el('span', { class: 'ipa', text: s.ipa }) : null),
        el('div', { class: 'uk', lang: 'uk', text: s.c.uk }),
        s.ex !== s.c.ex ? el('div', { class: 'sample', lang: 'en', text: s.ex }) : null,
        tagsRow({ kind: s.kind, tags: s.tags })
      ));
    });
    $('aiApplyRow').hidden = !sug.length;
    $('aiMsg').textContent = (note ? note + ' ' : '') + (sug.length ? 'Перевір підказки нижче й зніми позначки там, де не згодна.' : 'Нових підказок немає.');
  }

  $('aiBox').addEventListener('toggle', () => { if ($('aiBox').open) renderPick(); });
  $('aiTags').addEventListener('change', renderPick);
  $('aiEx').addEventListener('change', renderPick);
  $('aiIpa').addEventListener('change', renderPick);
  $('aiAll').addEventListener('click', () => {
    picks.forEach((p, i) => { p.box.checked = i < AI_MAX; });
    updateCount();
  });
  $('aiNone').addEventListener('click', () => {
    picks.forEach((p) => { p.box.checked = false; });
    updateCount();
  });
  $('aiStop').addEventListener('click', () => { if (ctrl) ctrl.abort(); });

  $('aiRun').addEventListener('click', async () => {
    const w = want();
    const cards = chosen().slice(0, AI_MAX);
    if (!cards.length) return;
    const ask = cards.filter((c) => !cachedFor(c, needOf(c, w)));
    ctrl = new AbortController();
    setRunning(true);
    $('aiList').replaceChildren();
    $('aiApplyRow').hidden = true;
    let note = '';
    let done = 0;
    for (let i = 0; i < ask.length; i += 10) {
      const part = ask.slice(i, i + 10);
      $('aiMsg').textContent = 'Питаю ШІ… ' + Math.min(i + 10, ask.length) + ' з ' + ask.length;
      try {
        const res = await enrich(part.map((c) => ({ en: c.en, uk: c.uk, ex: c.ex, want: needOf(c, w) })), w, ctrl.signal);
        part.forEach((c, k) => cache.set(c.id, Object.assign({ en: c.en, uk: c.uk, need: needOf(c, w) }, res[k])));
        done += part.length;
      } catch (e) {
        note = e.code === 'aborted'
          ? 'Зупинено. Оброблено ' + done + ' з ' + ask.length + '.'
          : 'Оброблено ' + done + ' з ' + ask.length + ': ' + aiMessage(e);
        break;
      }
    }
    ctrl = null;
    setRunning(false);
    showSuggestions(cards, w, note);
  });

  $('aiApply').addEventListener('click', async () => {
    const msg = $('aiMsg');
    const list = sug.filter((s) => s.box.checked);
    const btn = $('aiApply');
    btn.disabled = true;
    let ok = 0;
    let failed = false;
    for (const s of list) {
      msg.textContent = 'Застосовую ' + (ok + 1) + ' з ' + list.length + '…';
      try {
        await updateCard(s.c.id, { en: s.c.en, uk: s.c.uk, ex: s.ex, kind: s.kind, tags: s.tags, ipa: s.ipa });
        cache.delete(s.c.id);
        ok++;
      } catch (e) {
        failed = true;
        break;
      }
    }
    btn.disabled = false;
    $('aiList').replaceChildren();
    $('aiApplyRow').hidden = true;
    sug = [];
    setWordsChanged();
    refreshLists();
    picks.forEach((p) => { p.box.checked = false; });
    renderPick();
    msg.textContent = failed ? 'Не вдалося застосувати все. Застосовано: ' + ok + '.' : 'Застосовано: ' + ok + '.';
  });
}

export function setAddOpen(open) {
  $('addPanel').hidden = !open;
  $('addToggle').setAttribute('aria-expanded', String(open));
  $('addToggle').querySelector('span').textContent = open ? 'Закрити' : 'Додати';
  if (open) $('inEn').focus();
}

export function bindLists() {
  $('addToggle').addEventListener('click', () => setAddOpen($('addPanel').hidden));
  bindAi();
  addMeta = makeMeta();
  bulkMeta = makeMeta();
  $('addMeta').replaceChildren(addMeta.node);
  $('bulkMeta').replaceChildren(bulkMeta.node);
  const p = getPrefs();
  [['wKind', 'all'], ['wLvl', 'all'], ['wSort', 'added']].forEach(([id, def]) => {
    const sel = $(id);
    sel.value = p[id] || def;
    if (sel.selectedIndex < 0) sel.value = def;
  });
  wantTag = typeof p.wTag === 'string' ? p.wTag : null;
  $('wHw').checked = !!p.wHw;
  $('wHw').addEventListener('change', () => {
    setPref('wHw', $('wHw').checked);
    renderWords();
  });
  ['wKind', 'wTag', 'wLvl', 'wSort'].forEach((id) => {
    $(id).addEventListener('change', () => {
      setPref(id, $(id).value);
      renderWords();
    });
  });
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
      await addCards([{ en: en, uk: uk, ex: ex, ipa: $('inIpa').value.trim(), kind: m.kind, tags: m.tags }]);
      setWordsChanged();
      msg.textContent = 'Додано: ' + en;
      $('inEn').value = '';
      $('inUk').value = '';
      $('inEx').value = '';
      $('inIpa').value = '';
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
    const fresh = parsed.filter((r) => {
      const k = norm(r[0]);
      if (seen.has(k)) { dup++; return false; }
      seen.add(k);
      return true;
    });
    const rows = fresh.slice(0, 200);
    const rest = fresh.length - rows.length;
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
      $('bulk').value = rest ? fresh.slice(200).map((r) => r[0] + ' — ' + r[1]).join('\n') : '';
      msg.textContent = 'Додано: ' + added.length + (dup ? ', вже були: ' + dup : '') + '.' + (rest ? ' За раз можна до 200, решту (' + rest + ') залишено в полі, натисни ще раз.' : '');
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
