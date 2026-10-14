import { $, armDelete, copyText, randomKey } from './util.js';
import { state, rotateTeacher } from './store.js';

export const linkFor = (key) => location.origin + location.pathname + '#k=' + key;

export function renderAccess() {
  $('myLink').textContent = linkFor(state.key);
  const tk = state.settings.tkey;
  $('teacherLink').textContent = tk ? linkFor(tk) : 'Немає. Створи нове посилання нижче.';
  $('copyTeacher').hidden = !tk;
}

export function bindAccess() {
  $('copyMine').addEventListener('click', async () => {
    const ok = await copyText(linkFor(state.key), $('myLink'));
    $('myMsg').textContent = ok ? 'Скопійовано.' : 'Посилання виділено, скопіюй його вручну.';
  });
  $('copyTeacher').addEventListener('click', async () => {
    const ok = await copyText(linkFor(state.settings.tkey), $('teacherLink'));
    $('teacherMsg').textContent = ok ? 'Скопійовано.' : 'Посилання виділено, скопіюй його вручну.';
  });
  armDelete($('newTeacher'), 'Створити нове посилання для вчителя', async () => {
    try {
      await rotateTeacher(randomKey());
      renderAccess();
      $('teacherMsg').textContent = 'Готово. Старе посилання вже не працює, надішли вчителю нове.';
    } catch (e) {
      $('teacherMsg').textContent = 'Не вдалося. Спробуй ще раз.';
    }
  });
}
