import { el } from './util.js';
import { norm } from './text.js';
import { state, updateCard } from './store.js';
import { CATS, cleanTags } from './cats.js';
import { suggestInto, exampleInto } from './ai.js';

let uid = 0;

export const KIND_LABEL = { word: 'Слово', phrase: 'Фразове дієслово / колокація' };

export function makeMeta(initial) {
  const init = initial || {};
  const name = 'kind' + (++uid);
  let tags = cleanTags(init.tags);

  const kind = el('select', { 'aria-label': 'Тип', name: name },
    el('option', { value: 'word', text: KIND_LABEL.word }),
    el('option', { value: 'phrase', text: KIND_LABEL.phrase })
  );
  kind.value = init.kind === 'phrase' ? 'phrase' : 'word';

  const note = el('span', { class: 'cnote', text: 'до 3' });
  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Теми' });

  function render() {
    chips.replaceChildren(...CATS.map((t) => {
      const on = tags.indexOf(t) !== -1;
      const b = el('button', { type: 'button', class: 'tchip' + (on ? ' on' : ''), 'aria-pressed': String(on), text: t });
      b.disabled = !on && tags.length >= 3;
      b.addEventListener('click', () => {
        tags = on ? tags.filter((x) => x !== t) : tags.concat(t).slice(0, 3);
        render();
      });
      return b;
    }));
  }

  render();

  const node = el('div', { class: 'meta-ed' },
    el('label', null, 'Тип', kind),
    el('div', { class: 'clabel' }, 'Теми ', note),
    chips
  );

  return {
    node: node,
    get: () => ({ kind: kind.value, tags: tags.slice() }),
    set: (v) => {
      kind.value = v.kind === 'phrase' ? 'phrase' : 'word';
      tags = cleanTags(v.tags);
      render();
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
  const ipa = el('input', { type: 'text', value: c.ipa || '', maxlength: '100', spellcheck: 'false', autocapitalize: 'none', placeholder: 'напр. /ˈθʌrəli/', 'aria-label': 'Транскрипція' });
  const meta = makeMeta({ kind: c.kind, tags: c.tags });
  const msg = el('span', { class: 'msg', role: 'status' });
  const save = el('button', { type: 'submit', class: 'btn primary sm', text: 'Зберегти' });
  const cancel = el('button', { type: 'button', class: 'btn sm', text: 'Скасувати' });
  const exBtn = el('button', { type: 'button', class: 'btn sm', text: 'Згенерувати' });
  const ai = el('button', { type: 'button', class: 'btn sm', text: 'Підказати (ШІ)' });
  const form = el('form', { class: 'form edit', autocomplete: 'off' },
    el('div', { class: 'row2' },
      el('label', null, 'English', en),
      el('label', null, 'Українська', uk)
    ),
    el('label', null, 'Транскрипція', ipa),
    el('label', null, 'Приклад речення', el('span', { class: 'with-btn' }, ex, exBtn)),
    meta.node,
    el('div', { class: 'actions' }, save, cancel, ai, msg)
  );
  exBtn.addEventListener('click', () => exampleInto({ en: en, uk: uk, ex: ex, msg: msg, btn: exBtn }));
  ai.addEventListener('click', () => suggestInto({ en: en, uk: uk, ex: ex, ipa: ipa, meta: meta, msg: msg, btn: ai, done: 'Підказки підставлено, перевір їх перед збереженням.' }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = meta.get();
    if (!en.value.trim() || !uk.value.trim()) {
      msg.textContent = 'Потрібні обидва поля: слово й переклад.';
      return;
    }
    if (state.cards.some((x) => x.id !== c.id && norm(x.en) === norm(en.value))) {
      msg.textContent = 'Таке слово вже є в списку.';
      return;
    }
    save.disabled = true;
    msg.textContent = 'Зберігаю…';
    try {
      await updateCard(c.id, { en: en.value, uk: uk.value, ex: ex.value, ipa: ipa.value, kind: m.kind, tags: m.tags });
      onDone(true);
    } catch (err) {
      msg.textContent = 'Не вдалося зберегти.';
      save.disabled = false;
    }
  });
  cancel.addEventListener('click', () => onDone(false));
  return form;
}
