// CMS sidebar: hide/show on desktop, slide-in drawer on phones.
(function () {
  const sidebar = document.querySelector('.sidebar');
  const topbar = document.querySelector('.topbar');
  const brandRow = document.querySelector('.sidebar .sb-brand');
  if (!sidebar || !topbar) return;

  const KEY = 'stericSidebarCollapsed';
  const isMobile = () => window.matchMedia('(max-width: 880px)').matches;
  const ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>';

  // icon in the sidebar header (hide / close)
  const hideBtn = document.createElement('button');
  hideBtn.className = 'sb-toggle'; hideBtn.type = 'button';
  hideBtn.title = 'Hide menu'; hideBtn.setAttribute('aria-label', 'Hide menu');
  hideBtn.innerHTML = ICON;
  if (brandRow) brandRow.appendChild(hideBtn);

  // icon in the top bar (show / open)
  const showBtn = document.createElement('button');
  showBtn.className = 'admin-menu-btn'; showBtn.type = 'button';
  showBtn.title = 'Show menu'; showBtn.setAttribute('aria-label', 'Show menu');
  showBtn.innerHTML = ICON;
  topbar.insertBefore(showBtn, topbar.firstChild);

  const backdrop = document.createElement('div');
  backdrop.className = 'admin-backdrop';
  document.body.appendChild(backdrop);

  function setDrawer(open) {
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
  }
  function setCollapsed(c) {
    document.body.classList.toggle('sb-collapsed', c);
    try { localStorage.setItem(KEY, c ? '1' : '0'); } catch (e) {}
  }

  hideBtn.addEventListener('click', () => { isMobile() ? setDrawer(false) : setCollapsed(true); });
  showBtn.addEventListener('click', () => { isMobile() ? setDrawer(!sidebar.classList.contains('open')) : setCollapsed(false); });
  backdrop.addEventListener('click', () => setDrawer(false));
  sidebar.addEventListener('click', e => { if (isMobile() && e.target.closest('a')) setDrawer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
  window.addEventListener('resize', () => { if (!isMobile()) setDrawer(false); });

  try { if (!isMobile() && localStorage.getItem(KEY) === '1') setCollapsed(true); } catch (e) {}
})();
