const demoMember = (() => {
  const stateKey = 'bomb-demo-member-state';
  const query = new URLSearchParams(location.search);
  const filePreview = location.protocol === 'file:';
  const accountRoute = location.pathname.endsWith('/deposit.html');
  const memberActions = new Set(['deposit', 'withdraw', 'transfer', 'personal', 'member']);

  function readGuestState() {
    if (filePreview) return query.get('member') === 'guest';
    try {
      return query.get('member') === 'guest' || localStorage.getItem(stateKey) === 'guest';
    } catch {
      return query.get('member') === 'guest';
    }
  }

  function guestUrl(href) {
    const url = new URL(href, location.href);
    url.searchParams.set('member', 'guest');
    return url.href;
  }

  function setGuest(isGuest) {
    try {
      if (isGuest) localStorage.setItem(stateKey, 'guest');
      else localStorage.removeItem(stateKey);
    } catch { /* The URL carries the guest state when storage is unavailable. */ }
    location.assign(isGuest ? guestUrl('index.html') : 'index.html');
  }

  function render() {
    const guest = readGuestState();
    if (guest && accountRoute) {
      location.replace(guestUrl('index.html'));
      return;
    }

    document.documentElement.classList.toggle('demo-guest', guest);
    const header = document.querySelector('.top-actions');
    let login = header?.querySelector('.demo-login');
    if (guest && header && !login) {
      login = document.createElement('button');
      login.type = 'button';
      login.className = 'outline-gold demo-login';
      login.textContent = '登入示範帳號';
      login.addEventListener('click', () => setGuest(false));
      header.prepend(login);
    }
    if (login) login.hidden = !guest;
  }

  document.addEventListener('click', event => {
    if (!readGuestState()) return;
    const control = event.target.closest('[data-action], a[href]');
    if (!control) return;
    if (memberActions.has(control.dataset.action) || (control.matches('a') && new URL(control.href).pathname.endsWith('/deposit.html'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.querySelector('.demo-login')?.focus();
      return;
    }

    // Local files can have separate storage buckets, so carry the state between preview pages.
    if (!filePreview) return;
    if (control.matches('a') && control.protocol === 'file:' && new URL(control.href).pathname.endsWith('.html')) {
      control.href = guestUrl(control.href);
    }
  }, true);

  window.addEventListener('pageshow', render);
  render();
  return {
    logout: () => setGuest(true),
    navigate(href) {
      location.assign(filePreview && readGuestState() ? guestUrl(href) : href);
    },
  };
})();
