export const CATS = ['подорожі', 'транспорт', 'робота', 'навчання', 'гроші', 'покупки', 'їжа', 'побут', 'здоров\'я', 'емоції', 'характер', 'стосунки', 'спілкування', 'дозвілля', 'природа', 'технології', 'час'];

const SET = new Set(CATS);
const extra = new Set();

export const isCat = (t) => SET.has(t);

export const normTag = (t) => String(t || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 30);

export function setExtraTags(list) {
  extra.clear();
  (list || []).forEach((t) => {
    const v = normTag(t);
    if (v && !SET.has(v)) extra.add(v);
  });
}

export function addExtraTag(t) {
  const v = normTag(t);
  if (v && !SET.has(v)) extra.add(v);
  return v;
}

export const tagOptions = () => CATS.concat(Array.from(extra).sort((a, b) => a.localeCompare(b, 'uk')));

export function cleanTags(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((t) => {
    const v = normTag(t);
    if ((SET.has(v) || extra.has(v)) && out.indexOf(v) === -1) out.push(v);
  });
  return out.slice(0, 3);
}
