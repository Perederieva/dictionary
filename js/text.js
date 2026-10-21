export const norm = (s) => String(s || '')
  .toLowerCase()
  .replace(/[’`ʼ]/g, "'")
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[.,;!?"“”]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export function lev(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function slashVariants(part) {
  const segs = part.split('/').map((s) => s.trim()).filter(Boolean);
  const out = segs.slice();
  if (segs.length < 2) return out;
  const toks = segs.map((s) => s.split(/\s+/));
  const pre = toks[0].slice(0, -1);
  const post = toks[toks.length - 1].slice(1);
  toks.forEach((t, i) => {
    const core = i === 0 ? t.slice(-1) : i === toks.length - 1 ? t.slice(0, 1) : t;
    out.push(pre.concat(core, post).join(' '));
    out.push(core.concat(post).join(' '));
    out.push(pre.concat(core).join(' '));
  });
  return out;
}

export function variants(text) {
  const set = new Set();
  const add = (s) => {
    const v = norm(s);
    if (v) set.add(v);
  };
  const src = String(text);
  add(src);
  add(src.replace(/\//g, ' '));
  src.split(/[,;]/).forEach((part) => {
    if (part.indexOf('/') === -1) add(part);
    else slashVariants(part).forEach(add);
  });
  Array.from(set).forEach((v) => {
    if (v.indexOf('to ') === 0) set.add(v.slice(3));
  });
  return Array.from(set);
}

export function check(input, target) {
  const a = norm(input);
  if (!a) return null;
  const vs = variants(target);
  if (vs.indexOf(a) !== -1) return 'exact';
  if (vs.some((v) => Math.min(v.length, a.length) >= 5 && lev(a, v) <= 1)) return 'near';
  return 'wrong';
}

export function parseBulk(text) {
  const out = [];
  text.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const m = line.match(/^(.*?)(?:\t|\s+[-–—=:]\s+|\s*=\s*|\s*;\s*)(.+)$/);
    if (!m) return;
    let a = m[1].trim();
    let b = m[2].trim();
    const cyr = /[а-яіїєґ]/i;
    if (cyr.test(a) && !cyr.test(b)) {
      const t = a;
      a = b;
      b = t;
    }
    if (a && b) out.push([a, b]);
  });
  return out;
}

const SKIP = new Set(['sb', 'sth', 'smb', 'smth', 'somebody', 'something', 'someone', "one's", 'oneself', 'etc']);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function stemPattern(w) {
  if (w.length < 4) return esc(w) + "(?:s|es|ed|d|ing)?";
  let s = w;
  if (/e$/.test(s)) s = s.slice(0, -1);
  else if (/y$/.test(s)) s = s.slice(0, -1);
  return esc(s) + "[a-z']*";
}

export function findCloze(en, ex) {
  if (!en || !ex) return null;
  const words = norm(en).split(/[\s/]+/).filter((w) => w && !SKIP.has(w));
  if (words[0] === 'to' && words.length > 1) words.shift();
  if (!words.length) return null;
  const gap = "(?:\\s+[A-Za-z']+){0,3}?\\s+";
  const tries = [words.map(stemPattern).join(gap)];
  if (words.length > 1) tries.push("[A-Za-z']+\\s+" + words.slice(1).map(stemPattern).join(gap));
  for (const body of tries) {
    const re = new RegExp("\\b" + body + "\\b", 'i');
    const m = re.exec(ex);
    if (m) return { before: ex.slice(0, m.index), blank: m[0], after: ex.slice(m.index + m[0].length) };
  }
  return null;
}
