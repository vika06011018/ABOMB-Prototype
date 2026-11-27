(() => {
  const list = document.querySelector('.promo-list');
  const items = [...list.querySelectorAll('details')];
  for (const item of items) {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      for (const sibling of items) if (sibling !== item) sibling.open = false;
    });
  }
  const filters = [...document.querySelectorAll('.promo-filters button')];
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
      for (const item of items) {
        item.hidden = filter.dataset.filter !== 'all' && item.dataset.promoCategory !== filter.dataset.filter;
        if (item.hidden) item.open = false;
      }
    });
  }
  const home = document.querySelector('.primary-menu [data-action="home"]');
  home?.classList.remove('selected');
  const desktop = document.querySelector('.primary-menu [data-action="promo"]');
  desktop?.setAttribute('aria-current','page');
  const tabs = document.querySelectorAll('.mobile-bottom button');
  for (const button of tabs) {
    const active = button.dataset.action === 'promo';
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  }
})();
