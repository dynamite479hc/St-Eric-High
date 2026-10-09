// Mobile menu for every public page (hamburger + dropdown).
// Also adds "Learning Hub" to the menu, since its header button is
// hidden on phones to save space.
(function () {
  const nav = document.querySelector('header nav.links');
  const btn = document.querySelector('header .menu-btn');
  if (!nav || !btn) return;

  // Learning Hub entry inside the mobile menu
  if (!nav.querySelector('[data-learning-hub]')) {
    const a = document.createElement('a');
    a.href = 'learning-hub.html';
    a.textContent = '📘 Learning Hub';
    a.className = 'mobile-only';
    a.setAttribute('data-learning-hub', '');
    if (/learning-hub\.html$/.test(location.pathname)) a.classList.add('active');
    nav.appendChild(a);
  }

  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Menu');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '✕' : '☰';
  }
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 880) setMenu(false); });
})();
