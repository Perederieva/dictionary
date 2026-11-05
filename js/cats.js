export const CATS = ['подорожі', 'транспорт', 'робота', 'навчання', 'гроші', 'покупки', 'їжа', 'побут', 'здоров\'я', 'емоції', 'характер', 'стосунки', 'спілкування', 'дозвілля', 'природа', 'технології', 'час'];

const SET = new Set(CATS);

export const isCat = (t) => SET.has(t);

export function cleanTags(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((t) => {
    const v = String(t || '').trim().toLowerCase();
    if (SET.has(v) && out.indexOf(v) === -1) out.push(v);
  });
  return out.slice(0, 3);
}
