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

const ABBR = {
  sth: 'something',
  smth: 'something',
  sb: 'somebody',
  smb: 'somebody',
  smbd: 'somebody',
  smwh: 'somewhere',
  swh: 'somewhere'
};
const ABBR_RE = new RegExp('\\b(' + Object.keys(ABBR).join('|') + ')\\b', 'gi');

export function expandAbbr(text) {
  return String(text || '')
    .replace(/\bo\.\s?s\.(?![a-z])/gi, 'oneself')
    .replace(ABBR_RE, (m) => ABBR[m.toLowerCase()]);
}

const canonWords = (v) => v.split(' ').map((w) => w.replace(/^someone/, 'somebody')).join(' ');
export const canon = (s) => canonWords(norm(expandAbbr(s)));

export function check(input, target) {
  const a = canon(input);
  if (!a) return null;
  const vs = Array.from(new Set(variants(expandAbbr(target)).map(canonWords)));
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

const SKIP = new Set(['sb', 'sth', 'smb', 'smth', 'smbd', 'somebody', 'something', 'someone', "one's", 'oneself', 'etc', 'doing', 'smwh', 'somewhere']);
const LIGHT = new Set(['to', 'be', 'a', 'an', 'the', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'up', 'out', 'off', 'about', 'into', 'as', 'and', 'or']);
const BE = "(?:be|is|am|are|was|were|been|being|'s|'m|'re)";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const IRREGULAR = [
  'arise arose arisen',
  'awake awoke awoken',
  'bear bore born borne',
  'beat beat beaten',
  'become became',
  'begin began begun',
  'bend bent',
  'bet bet',
  'bind bound',
  'bite bit bitten',
  'bleed bled',
  'blow blew blown',
  'break broke broken',
  'breed bred',
  'bring brought',
  'build built',
  'burn burnt',
  'burst burst',
  'buy bought',
  'catch caught',
  'choose chose chosen',
  'cling clung',
  'come came',
  'cost cost',
  'creep crept',
  'cut cut',
  'deal dealt',
  'dig dug',
  'do did done does',
  'draw drew drawn',
  'dream dreamt',
  'drink drank drunk',
  'drive drove driven',
  'eat ate eaten',
  'fall fell fallen',
  'feed fed',
  'feel felt',
  'fight fought',
  'find found',
  'flee fled',
  'fly flew flown flies',
  'forbid forbade forbidden',
  'forget forgot forgotten',
  'forgive forgave forgiven',
  'freeze froze frozen',
  'get got gotten',
  'give gave given',
  'go went gone goes',
  'grind ground',
  'grow grew grown',
  'hang hung',
  'have had has',
  'hear heard',
  'hide hid hidden',
  'hit hit',
  'hold held',
  'hurt hurt',
  'keep kept',
  'kneel knelt',
  'know knew known',
  'lay laid',
  'lead led',
  'lean leant',
  'leap leapt',
  'learn learnt',
  'leave left',
  'lend lent',
  'let let',
  'lie lay lain lying',
  'light lit',
  'lose lost',
  'make made',
  'mean meant',
  'meet met',
  'mislead misled',
  'mistake mistook mistaken',
  'overcome overcame',
  'oversleep overslept',
  'overtake overtook overtaken',
  'pay paid',
  'prove proven',
  'put put',
  'quit quit',
  'read read',
  'ride rode ridden',
  'ring rang rung',
  'rise rose risen',
  'run ran',
  'say said says',
  'see saw seen',
  'seek sought',
  'sell sold',
  'send sent',
  'set set',
  'sew sewed sewn',
  'shake shook shaken',
  'shed shed',
  'shine shone',
  'shoot shot',
  'show showed shown',
  'shrink shrank shrunk',
  'shut shut',
  'sing sang sung',
  'sink sank sunk',
  'sit sat',
  'sleep slept',
  'slide slid',
  'speak spoke spoken',
  'speed sped',
  'spell spelt',
  'spend spent',
  'spill spilt',
  'spin spun',
  'spit spat',
  'split split',
  'spread spread',
  'spring sprang sprung',
  'stand stood',
  'steal stole stolen',
  'stick stuck',
  'sting stung',
  'stink stank stunk',
  'strike struck',
  'strive strove striven',
  'swear swore sworn',
  'sweep swept',
  'swim swam swum',
  'swing swung',
  'take took taken',
  'teach taught',
  'tear tore torn',
  'tell told',
  'think thought',
  'throw threw thrown',
  'understand understood',
  'undertake undertook undertaken',
  'upset upset',
  'wake woke woken',
  'wear wore worn',
  'weave wove woven',
  'weep wept',
  'win won',
  'wind wound',
  'withdraw withdrew withdrawn',
  'write wrote written'
];
const IRR = new Map();
IRREGULAR.forEach((line) => {
  const forms = line.split(' ');
  IRR.set(forms[0], forms);
});

function stemPattern(w) {
  if (w === 'be') return BE;
  if (IRR.has(w)) {
    const forms = IRR.get(w);
    const base = forms[0];
    const extra = /e$/.test(base) ? esc(base.slice(0, -1)) + 'ing' : esc(base) + "(?:s|es|ing|" + esc(base.slice(-1)) + "ing)";
    return '(?:' + forms.map(esc).concat(extra).join('|') + ')';
  }
  if (w.length < 4) return esc(w) + "(?:s|es|ed|d|ing)?";
  let s = w;
  if (/e$/.test(s)) s = s.slice(0, -1);
  else if (/y$/.test(s)) s = s.slice(0, -1);
  return esc(s) + "[a-z']*";
}

function tryMatch(words, ex) {
  const gap = "(?:\\s+[A-Za-z']+){0,3}?\\s+";
  const body = words.map(stemPattern).join(gap);
  const re = new RegExp("\\b" + body + "\\b", 'i');
  const m = re.exec(ex);
  if (!m) return null;
  return { before: ex.slice(0, m.index), blank: m[0], after: ex.slice(m.index + m[0].length) };
}

export function findCloze(en, ex) {
  if (!en || !ex) return null;
  const words = norm(expandAbbr(en)).split(/[\s/]+/).filter((w) => w && !SKIP.has(w));
  while ((words[0] === 'to' || words[0] === 'be') && words.length > 1) words.shift();
  if (!words.length) return null;
  const n = words.length;
  for (let len = n; len >= 1; len--) {
    for (let i = 0; i + len <= n; i++) {
      const part = words.slice(i, i + len);
      if (part.every((w) => LIGHT.has(w))) continue;
      const r = tryMatch(part, ex);
      if (r) return r;
    }
  }
  return null;
}
