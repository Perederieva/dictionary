const KEY = 'slovnychok.ui';

export function getPrefs() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    return {};
  }
}

export function setPref(name, value) {
  const p = getPrefs();
  p[name] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch (e) { }
}

export function clearPrefs() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) { }
}
