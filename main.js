// Project content lives in index.html so it remains available without JavaScript.
const filters = document.querySelector('.filters');
const filterButtons = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.tile');
const status = document.getElementById('project-status');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.lane !== filter;
      if (!card.hidden) visibleCount += 1;
    });

    const category = filter === 'all' ? '' : button.textContent.trim() + ' ';
    status.textContent = visibleCount + ' ' + category + (visibleCount === 1 ? 'project shown.' : 'projects shown.');
  });
});

filters.hidden = false;

// Navigation links reopen a collapsed destination before the browser scrolls.
function openSection(hash) {
  if (!['#about', '#projects'].includes(hash)) return;
  const disclosure = document.querySelector(hash + ' .section-disclosure');
  if (disclosure) disclosure.open = true;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => openSection(link.hash));
});
window.addEventListener('hashchange', () => openSection(window.location.hash));
openSection(window.location.hash);
