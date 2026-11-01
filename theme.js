// Apply the theme before the stylesheet loads to avoid a light-theme flash.
(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme = null;
  let toggle;

  try {
    const value = localStorage.getItem('portfolio-theme');
    if (value === 'light' || value === 'dark') savedTheme = value;
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }

  function applyTheme() {
    const theme = savedTheme || (preference.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === 'dark' ? '#191817' : '#E8E3DC';
    if (toggle) {
      const action = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      toggle.setAttribute('aria-label', action);
      toggle.title = action;
    }
  }

  applyTheme();
  preference.addEventListener('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    toggle = document.getElementById('theme-toggle');
    applyTheme();
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('portfolio-theme', savedTheme);
      } catch {
        // Keep the selection for this page even if it cannot be saved.
      }
      applyTheme();
    });
  });
})();
