(() => {
  const desktop = matchMedia('(min-width:900px)');
  const bell = document.querySelector('#inboxBell');
  const menu = document.querySelector('#inboxMenu');
  const drop = bell.closest('.inbox-drop');
  const storageKey = 'bomb-inbox-read-v1';
  const inbox = {announcements: ['site-1','game-1','bank-1'], messages: ['personal-1']};

  function readStored() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  }
  let read = readStored();

  function updateDots() {
    const unread = Object.fromEntries(Object.entries(inbox).map(([type, ids]) => [type, ids.some(id => !read.has(id))]));
    for (const link of document.querySelectorAll('[data-unread-link]')) {
      const show = unread[link.dataset.unreadLink];
      link.querySelector('.inbox-dot').hidden = !show;
      link.querySelector('.inbox-sr').hidden = !show;
    }
    for (const item of document.querySelectorAll('[data-notice]')) {
      for (const mark of item.querySelectorAll('.inbox-dot,.inbox-sr')) mark.hidden = read.has(item.dataset.notice);
    }
    bell.querySelector('.unread').hidden = desktop.matches && !Object.values(unread).some(Boolean);
  }

  function showMenu(open) {
    menu.hidden = !open;
    menu.classList.toggle('open', open);
    if (desktop.matches) {
      bell.setAttribute('aria-controls', 'inboxMenu');
      bell.setAttribute('aria-expanded', String(open));
    } else {
      bell.removeAttribute('aria-controls');
      bell.removeAttribute('aria-expanded');
    }
  }

  bell.addEventListener('click', event => {
    if (!desktop.matches) return;
    event.stopPropagation();
    openMenu(null);
    showMenu(menu.hidden);
  });
  document.addEventListener('click', event => {
    if (!drop.contains(event.target) || event.target.closest('.inbox-menu a')) showMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      showMenu(false);
      bell.focus();
    }
  });
  desktop.addEventListener('change', () => { showMenu(false); updateDots(); });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      read = readStored();
      updateDots();
    }
  });
  window.addEventListener('pageshow', () => {
    for (const id of readStored()) read.add(id);
    updateDots();
  });
  for (const item of document.querySelectorAll('[data-notice]')) {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      for (const id of readStored()) read.add(id);
      read.add(item.dataset.notice);
      try { localStorage.setItem(storageKey, JSON.stringify([...read])); } catch {}
      updateDots();
    });
  }
  const filters = document.querySelectorAll('[data-inbox-filter]');
  for (const button of filters) {
    button.addEventListener('click', () => {
      const category = button.dataset.inboxFilter;
      for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
      for (const item of document.querySelectorAll('#announcementsView [data-notice]')) {
        item.hidden = category !== 'all' && item.dataset.category !== category;
      }
    });
  }
  showMenu(false);
  updateDots();
})();
