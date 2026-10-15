import { el } from './util.js';
import { updateCard, tagCounts } from './store.js';

const PRESETS = ['подорожі', 'бізнес', 'робота', 'повсякденне', 'їжа', 'технології', 'здоров\'я', 'емоції', 'навчання'];
let uid = 0;

export const KIND_LABEL = { word: 'Слово', phrase: 'Фразове дієслово / колокація' };

export function makeMeta(initial) {
  const init = initial || {};
  const id = 'tagopts' + (++uid);
  let tags = (init.tags || []).slice();

  const kind = el('select', { 'aria-label': 'Тип' },
    el('option', { value: 'word', text: KIND_LABEL.word }),
    el('option', { value: 'phrase', text: KIND_LABEL.phrase })
  );
  kind.value = init.kind === 'phrase' ? 'phrase' : 'word';

  const list = el('datalist', { id: id });
  const input = el('input', { type: 'text', list: id, maxlength: '30', autocomplete: 'off', placeholder: 'напр. подорожі, Enter щоб додати', 'aria-label': 'Тема' });
  const chips = el('div', { class: 'chips' });

  function refresh() {
    const have = new Set(tags);
    const names = new Set(PRESETS);
    tagCounts().forEach((t) => names.add(t[0]));
    list.replaceChildren();
    Array.from(names).filter((n) => !have.has(n)).sort((a, b) => a.localeCompare(b, 'uk')).forEach((n) => list.append(el('option', { value: n })));
  }

  function render() {
    chips.replaceChildren();
    tags.forEach((t) => {
      const b = el('button', { type: 'button', class: 'tchip', 'aria-label': 'Прибрати тему ' + t, text: t + ' ×' });
      b.addEventListener('click', () => {
        tags = tags.filter((x) => x !== t);
        render();
        refresh();
      });
      chips.append(b);
    });
  }

  function commit() {
    const v = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
    input.value = '';
    if (!v || v.length > 30 || tags.length >= 10 || tags.indexOf(v) !== -1) return;
    tags.push(v);
    render();
    refresh();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  });
  input.addEventListener('change', commit);
  input.addEventListener('focus', refresh);

  render();
  refresh();

  const node = el('div', { class: 'meta-ed' },
    el('div', { class: 'row2' },
      el('label', null, 'Тип', kind),
      el('label', null, 'Теми', input, list)
    ),
    chips
  );

  return {
    node: node,
    get: () => {
      commit();
      return { kind: kind.value, tags: tags.slice() };
    },
    set: (v) => {
      kind.value = v.kind === 'phrase' ? 'phrase' : 'word';
      tags = (v.tags || []).slice();
      render();
      refresh();
    }
  };
}

export function tagsRow(c) {
  if (c.kind !== 'phrase' && !c.tags.length) return null;
  return el('div', { class: 'tags' },
    c.kind === 'phrase' ? el('span', { class: 'tg k', text: 'фраза' }) : null,
    c.tags.map((t) => el('span', { class: 'tg', text: t }))
  );
}

export function editForm(c, onDone) {
  const en = el('input', { type: 'text', lang: 'en', value: c.en, maxlength: '200', spellcheck: 'false', 'aria-label': 'English' });
  const uk = el('input', { type: 'text', lang: 'uk', value: c.uk, maxlength: '300', 'aria-label': 'Українська' });
  const ex = el('input', { type: 'text', lang: 'en', value: c.ex || '', maxlength: '300', spellcheck: 'false', 'aria-label': 'Приклад речення' });
  const meta = makeMeta({ kind: c.kind, tags: c.tags });
  const msg = el('span', { class: 'msg', role: 'status' });
  const save = el('button', { type: 'submit', class: 'btn primary sm', text: 'Зберегти' });
  const cancel = el('button', { type: 'button', class: 'btn sm', text: 'Скасувати' });
  const form = el('form', { class: 'form edit', autocomplete: 'off' },
    el('div', { class: 'row2' },
      el('label', null, 'English', en),
      el('label', null, 'Українська', uk)
    ),
    el('label', null, 'Приклад речення', ex),
    meta.node,
    el('div', { class: 'actions' }, save, cancel, msg)
  );
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = meta.get();
    if (!en.value.trim() || !uk.value.trim()) {
      msg.textContent = 'Потрібні обидва поля: слово й переклад.';
      return;
    }
    save.disabled = true;
    msg.textContent = 'Зберігаю…';
    try {
      await updateCard(c.id, { en: en.value, uk: uk.value, ex: ex.value, kind: m.kind, tags: m.tags });
      onDone(true);
    } catch (err) {
      msg.textContent = 'Не вдалося зберегти.';
      save.disabled = false;
    }
  });
  cancel.addEventListener('click', () => onDone(false));
  return form;
}
