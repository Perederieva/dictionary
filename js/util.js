export const $ = (id) => document.getElementById(id);

export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const today = () => ymd(new Date());

export const addDays = (s, n) => {
  const p = s.split('-').map(Number);
  return ymd(new Date(p[0], p[1] - 1, p[2] + n));
};

export const diffDays = (a, b) => {
  const x = a.split('-').map(Number);
  const y = b.split('-').map(Number);
  return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 86400000);
};

export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
};

export const plural = (n, one, few, many) => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
};

export const dayText = (n) => {
  if (n === 0) return 'ще раз сьогодні';
  if (n === 1) return 'завтра';
  return 'через ' + n + ' ' + plural(n, 'день', 'дні', 'днів');
};

export const agoText = (day) => {
  if (!day) return 'ще не вчили';
  const n = diffDays(day, today());
  if (n <= 0) return 'сьогодні';
  if (n === 1) return 'вчора';
  return n + ' ' + plural(n, 'день', 'дні', 'днів') + ' тому';
};

export const randomKey = () => {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  let s = '';
  a.forEach((x) => { s += String.fromCharCode(x); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach((k) => {
      const v = attrs[k];
      if (v === false || v == null) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
  }
  const add = (c) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(add); return; }
    n.append(c.nodeType ? c : document.createTextNode(c));
  };
  kids.forEach(add);
  return n;
}

export function kindCounts(sel, cards, labels) {
  const n = { all: cards.length, word: 0, phrase: 0 };
  cards.forEach((c) => { n[c.kind === 'phrase' ? 'phrase' : 'word']++; });
  Array.from(sel.options).forEach((o) => {
    if (labels[o.value]) o.textContent = labels[o.value] + ' (' + n[o.value] + ')';
  });
}

export function bars(c) {
  return ['eu', 'ue'].map((d) => {
    const p = c[d];
    const b = p ? p.b : 0;
    const wrap = el('span', {
      class: 'lvl',
      role: 'img',
      'aria-label': (d === 'eu' ? 'EN → UA: ' : 'UA → EN: ') + (p ? b + ' з 5' : 'нове')
    }, el('i', { text: d === 'eu' ? 'EN→UA' : 'UA→EN' }));
    for (let i = 1; i <= 5; i++) wrap.append(el('b', { class: i <= b ? 'on' : '' }));
    return wrap;
  });
}

export function armDelete(btn, label, fn) {
  let armed = false;
  let timer = null;
  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      btn.textContent = 'Точно?';
      btn.classList.add('armed');
      timer = setTimeout(() => {
        armed = false;
        btn.textContent = label;
        btn.classList.remove('armed');
      }, 3000);
    } else {
      clearTimeout(timer);
      armed = false;
      btn.classList.remove('armed');
      btn.textContent = label;
      fn();
    }
  });
}

export async function copyText(text, node) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    if (node) {
      const r = document.createRange();
      r.selectNodeContents(node);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
    return false;
  }
}

const SVGNS = 'http://www.w3.org/2000/svg';
const ICONS = {
  dots: '<circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>'
};

export function icon(name, size) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size || 18));
  s.setAttribute('height', String(size || 18));
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '2');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  const tpl = new DOMParser().parseFromString('<svg xmlns="' + SVGNS + '">' + ICONS[name] + '</svg>', 'image/svg+xml');
  Array.from(tpl.documentElement.childNodes).forEach((n) => s.append(document.importNode(n, true)));
  return s;
}

let openMenu = null;

function closeMenu() {
  if (!openMenu) return;
  openMenu.menu.hidden = true;
  openMenu.btn.setAttribute('aria-expanded', 'false');
  openMenu = null;
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (openMenu && !openMenu.wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

export function actionsMenu(items, label) {
  const list = items.filter(Boolean);
  const btn = el('button', { type: 'button', class: 'more', 'aria-label': label || 'Дії зі словом', 'aria-expanded': 'false', 'aria-haspopup': 'true' }, icon('dots', 18));
  const menu = el('div', { class: 'menu', role: 'menu' }, list);
  menu.hidden = true;
  const wrap = el('div', { class: 'acts' }, btn, menu);
  btn.addEventListener('click', () => {
    const was = !menu.hidden;
    closeMenu();
    if (was) return;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    openMenu = { wrap: wrap, menu: menu, btn: btn };
  });
  list.forEach((b) => {
    b.setAttribute('role', 'menuitem');
    if (!b.classList.contains('del')) b.addEventListener('click', () => closeMenu());
  });
  return wrap;
}

export function markOn(sel, def) {
  sel.classList.toggle('on', sel.value !== def);
}
