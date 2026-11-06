// Project content lives in index.html so it remains available without JavaScript.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const EASE = 'cubic-bezier(.2,.7,0,1)';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, t) => from + (to - from) * t;

// All scroll-linked work runs in one animation frame.
let frame = 0;
function requestFrame() {
  if (!frame) frame = requestAnimationFrame(tick);
}

/* ---------- Header: the hero name shrinks and docks into the top bar ---------- */
const topbar = document.querySelector('.topbar');
const hero = document.querySelector('.hero');
const heroName = document.querySelector('.mast__name');
const heroNameText = document.querySelector('.mast__nameText');
const barName = document.querySelector('.topbar__name');
let dock = { dx: 0, scale: 1, distance: 1 };
let heroHeight = 0;
let headerHeight = 0;
let lastHeaderY = -1;

function measureDock() {
  heroNameText.style.transform = '';
  lastHeaderY = -1;
  const from = heroNameText.getBoundingClientRect();
  const to = barName.getBoundingClientRect();
  // The name keeps scrolling with the page, so it reaches the bar after exactly this distance.
  const distance = from.top + window.scrollY + from.height / 2 - (to.top + to.height / 2);
  dock = {
    dx: to.left + to.width / 2 - (from.left + from.width / 2),
    scale: parseFloat(getComputedStyle(barName).fontSize) / parseFloat(getComputedStyle(heroName).fontSize),
    distance: Math.max(1, distance),
  };
  heroHeight = hero.offsetHeight;
  headerHeight = topbar.offsetHeight;
}

function updateHeader(y) {
  if (y === lastHeaderY) return;
  lastHeaderY = y;
  const progress = clamp(y / dock.distance, 0, 1);
  if (!reduceMotion.matches) {
    heroNameText.style.transform = `translate3d(${dock.dx * progress}px, 0, 0) scale(${lerp(1, dock.scale, progress)})`;
  }
  const docked = progress >= 1;
  heroName.classList.toggle('is-docked', docked);
  topbar.classList.toggle('is-named', docked);
  topbar.classList.toggle('is-solid', y > heroHeight - headerHeight);
}

/* ---------- About: blocks stagger in as they enter the viewport ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

/* ---------- Sections: animate the disclosure height instead of snapping ---------- */
document.querySelectorAll('.section-disclosure').forEach((details) => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.section-content');
  let animation = null;

  summary.addEventListener('click', (event) => {
    if (reduceMotion.matches) return;
    event.preventDefault();

    const closing = details.open && !details.classList.contains('is-closing');
    // Read the in-flight size first so a reversed click continues from where it is.
    const startHeight = content.getBoundingClientRect().height;
    const startOpacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
    if (animation) animation.cancel();

    details.classList.toggle('is-closing', closing);
    if (!closing) details.open = true;
    const endHeight = closing ? 0 : content.getBoundingClientRect().height;

    // Anything past one viewport is offscreen, so capping keeps tall sections from rushing.
    const cap = window.innerHeight;
    content.style.overflow = 'clip';
    animation = content.animate({
      height: [`${Math.min(startHeight, cap)}px`, `${Math.min(endHeight, cap)}px`],
      opacity: [startOpacity, closing ? 0 : 1],
    }, { duration: 500, easing: EASE, fill: 'forwards' });

    animation.onfinish = () => {
      if (closing) {
        details.open = false;
        details.classList.remove('is-closing');
      }
      animation.cancel();
      animation = null;
      content.style.overflow = '';
    };
  });
});

/* ---------- Projects: focus carousel driven by page scroll (desktop) or swipe (rail) ---------- */
const showcase = (() => {
  const root = document.getElementById('showcase');
  const grid = document.getElementById('tiles');
  const stage = root.querySelector('.showcase__stage');
  const heading = root.closest('.section-disclosure').querySelector('summary');
  const progress = root.querySelector('.showcase__progress');
  const progressBar = root.querySelector('.showcase__progressBar');
  const pinnedQuery = window.matchMedia('(min-width: 900px) and (min-height: 600px)');
  // Avoid recalculating card transforms and blur while the hero is onscreen.
  let stageVisible = false;
  new IntersectionObserver(([entry]) => {
    stageVisible = entry.isIntersecting;
    if (stageVisible) requestFrame();
  }, { rootMargin: '150px 0px' }).observe(stage);

  let items = [];
  let mode = '';
  let target = 0; // focus position the scroll asks for
  let focus = 0; // rendered focus position, eased toward target
  let shown = 0; // index of the centred card
  let step = 1; // page scroll per card when pinned
  let spacing = 0; // horizontal distance between pinned cards
  let pitch = 1; // rail scroll per card
  let trackTop = 0;
  let pinTop = 0;
  let lastTime = 0;
  let settleTimer = 0;

  const isLaidOut = () => root.getClientRects().length > 0;
  const startY = () => trackTop - pinTop;

  function setMode() {
    mode = pinnedQuery.matches && !reduceMotion.matches ? 'pinned' : 'rail';
    root.classList.add('is-ready');
    root.classList.toggle('is-pinned', mode === 'pinned');
    root.classList.toggle('is-rail', mode === 'rail');
    items.forEach((tile) => {
      tile.style.transform = tile.style.filter = tile.style.opacity = tile.style.zIndex = '';
    });
    measure();
    focus = target;
    render();
  }

  function measure() {
    if (!isLaidOut() || !items.length) return;
    if (mode === 'pinned') {
      // Keep the stage directly below its sticky section heading.
      root.style.setProperty('--section-head-h', heading.offsetHeight + 'px');
      // Match the actual sticky offset so the last card reaches page bottom exactly.
      pinTop = parseFloat(getComputedStyle(stage).top);
      step = Math.round(window.innerHeight * 0.42);
      root.style.setProperty('--travel', (items.length - 1) * step + 'px');
      trackTop = root.getBoundingClientRect().top + window.scrollY;
      spacing = items[0].offsetWidth * 0.9;
    } else {
      root.style.removeProperty('--travel');
      pitch = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
    }
    readTarget();
  }

  function readTarget() {
    const last = items.length - 1;
    if (last < 1) {
      target = 0;
    } else if (mode === 'pinned') {
      target = clamp((window.scrollY - startY()) / (last * step), 0, 1) * last;
    } else {
      target = clamp(grid.scrollLeft / pitch, 0, last);
    }
  }

  function update(now) {
    if (!stageVisible || !isLaidOut() || !items.length) return;
    readTarget();
    if (mode === 'pinned') {
      // Ease toward the scroll position so chunky wheel steps still glide.
      const dt = now - lastTime > 100 ? 16 : now - lastTime;
      focus = lerp(focus, target, 1 - Math.exp(-dt / 90));
      if (Math.abs(target - focus) < 0.001) focus = target;
      else requestFrame();
    } else {
      focus = target;
    }
    lastTime = now;
    render();
  }

  function render() {
    const still = reduceMotion.matches;
    items.forEach((tile, index) => {
      const offset = index - focus;
      const distance = Math.abs(offset);
      let transform;
      let opacity;
      if (mode === 'pinned') {
        transform = `translateX(${(offset * spacing).toFixed(1)}px) scale(${(1 - Math.min(distance, 3) * 0.13).toFixed(3)})`;
        opacity = clamp(1 - distance * 0.3, 0, 1);
      } else {
        transform = still ? '' : `scale(${(1 - Math.min(distance, 1) * 0.08).toFixed(3)})`;
        opacity = still ? 1 : 1 - Math.min(distance, 1) * 0.35;
      }
      const blur = still ? 0 : Math.min(distance, 2.5) * 2.4;
      tile.style.transform = transform;
      tile.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
      tile.style.opacity = opacity.toFixed(3);
      tile.style.zIndex = String(100 - Math.round(distance * 10));
      tile.classList.toggle('is-focus', distance < 0.5);
    });

    const last = items.length - 1;
    progressBar.style.transform = `scaleX(${last > 0 ? clamp(focus / last, 0, 1) : 1})`;
    shown = clamp(Math.round(focus), 0, Math.max(last, 0));
  }

  function go(index) {
    index = clamp(index, 0, items.length - 1);
    const behavior = reduceMotion.matches ? 'auto' : 'smooth';
    if (mode === 'pinned') {
      window.scrollTo({ top: startY() + index * step, behavior });
    } else {
      grid.scrollTo({ left: index * pitch, behavior });
    }
  }

  // When scrolling stops between two cards, glide to the nearest one.
  function scheduleSettle() {
    if (mode !== 'pinned') return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const last = items.length - 1;
      const raw = (window.scrollY - startY()) / (last * step);
      if (last < 1 || raw <= 0 || raw >= 1) return;
      const nearest = Math.round(raw * last);
      if (Math.abs(nearest - raw * last) > 0.01) go(nearest);
    }, 160);
  }

  function refresh() {
    items = [...grid.querySelectorAll('.tile')].filter((tile) => !tile.hidden);
    measure();
    if (mode === 'pinned') {
      if (window.scrollY > startY()) window.scrollTo({ top: startY(), behavior: 'instant' });
      target = 0;
      // Slide the new set in from the right.
      focus = reduceMotion.matches ? 0 : -1.2;
    } else {
      grid.scrollLeft = 0;
      target = focus = 0;
    }
    requestFrame();
  }

  grid.addEventListener('scroll', requestFrame, { passive: true });

  // A side card comes to the centre first; only the centred card opens its link.
  grid.addEventListener('click', (event) => {
    const tile = event.target.closest('.tile');
    const index = items.indexOf(tile);
    if (index !== -1 && index !== Math.round(focus)) {
      event.preventDefault();
      go(index);
    }
  });

  grid.addEventListener('focusin', (event) => {
    const index = items.indexOf(event.target.closest('.tile'));
    if (index !== -1 && index !== Math.round(target)) go(index);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = clamp(shown + (event.key === 'ArrowRight' ? 1 : -1), 0, items.length - 1);
    if (document.activeElement.classList.contains('tile')) items[index].focus({ preventScroll: true });
    go(index);
  });

  pinnedQuery.addEventListener('change', setMode);
  reduceMotion.addEventListener('change', setMode);

  items = [...grid.querySelectorAll('.tile')];
  progress.hidden = false;
  setMode();

  return { measure, update, refresh, scheduleSettle };
})();

/* ---------- Filters ---------- */
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
    showcase.refresh();
  });
});

filters.hidden = false;

/* ---------- Frame loop and layout ---------- */
function tick(now) {
  frame = 0;
  updateHeader(window.scrollY);
  showcase.update(now);
}

window.addEventListener('scroll', () => {
  requestFrame();
  showcase.scheduleSettle();
}, { passive: true });

function relayout() {
  measureDock();
  showcase.measure();
  requestFrame();
}
window.addEventListener('resize', relayout);
reduceMotion.addEventListener('change', () => {
  heroNameText.style.transform = '';
  relayout();
});
// The display font can finish loading after the first docking measurement.
if (document.fonts) document.fonts.ready.then(relayout);
// Opening a section moves everything below it, so remeasure whenever the content resizes.
// (body is pinned to 100% height, so watch main instead.)
new ResizeObserver(() => {
  showcase.measure();
  requestFrame();
}).observe(document.getElementById('main-content'));
relayout();

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
