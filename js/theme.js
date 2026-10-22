(function () {
  try {
    var p = JSON.parse(localStorage.getItem('slovnychok.ui') || '{}');
    if (p && (p.theme === 'light' || p.theme === 'dark')) document.documentElement.setAttribute('data-theme', p.theme);
  } catch (e) { }
})();
