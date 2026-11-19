const catalog = document.documentElement.classList.contains("catalog-route") && document.querySelector('.catalog');
const categoryGroups = [
  ['視訊', ['BOMB 真人百家','BOMB 柏青 SLOT','MT 真人','DG 真人','T9 真人','WM 真人','WINNER 真人','OG 真人','SA 真人']],
  ['電子', ['RSG 電子','QT 電子','BNG 電子','ZG 電子','TAG 電子']],
  ['彩票', ['WINNER 彩票','GC 彩票','DB 彩票']],
  ['棋牌', ['DB 棋牌','高登棋牌','GR 棋牌','BOYAA 棋牌']],
  ['體育', ['熊貓體育','限時活動','SUPER 體育','鑫寶體育','Live 體育','WE 體育']],
  ['捕魚', ['ZG 捕魚','RSG 捕魚','DB 捕魚','GR 捕魚','博雅捕魚','S PLUS 捕魚','TAG 捕魚']]
];

if (catalog) {
  const categories = catalog.querySelector('.catalog-categories');
  const results = catalog.querySelector('.catalog-results');
  const search = catalog.querySelector('input');
  const empty = catalog.querySelector('.catalog-empty');

  categoryGroups.forEach(([name, entries], group) => {
    categories.insertAdjacentHTML('beforeend',
      `<button type="button" data-group="${group}"><img src="assets/catalog/category-${group}.webp" alt="">${name}</button>`);
    results.insertAdjacentHTML('beforeend', `<section class="catalog-group" id="catalog-${group}" aria-labelledby="catalog-heading-${group}">
      <h2 id="catalog-heading-${group}"><img src="assets/catalog/category-${group}.webp" alt=""> ${name}</h2>
      <div class="catalog-entries">${entries.map((entry, index) => {
        const featured = group === 0 && index < 2;
        const videoArt = ['hero-baccarat', 'hero-slot'];
        const art = (group === 0 && videoArt[index]) || `${group}-${index}`;
        const logo = group === 0 ? `<img src="assets/catalog/logo-${index}.webp" alt="">` : '';
        return `<article class="catalog-card${featured ? ' catalog-featured' : ''}" data-entry="${entry}">
          <img class="catalog-art" src="assets/${featured ? 'catalog' : 'desktop-lobby'}/${art}.webp" alt="" loading="${featured ? 'eager' : 'lazy'}">
          <footer><strong>${logo}<span>${entry}</span></strong><button type="button" aria-label="立即遊玩 ${entry}">立即遊玩 ›</button></footer>
        </article>`;
      }).join('')}</div>
    </section>`);
  });

  const buttons = [...categories.querySelectorAll('button')];
  const groups = [...results.children];
  const header = document.querySelector('.top');
  const dock = document.querySelector('.mobile-bottom');
  function updateCurrentCategory() {
    const visible = groups.filter(group => !group.hidden);
    const top = header.getBoundingClientRect().bottom + 10;
    const dockTop = dock.getClientRects().length ? dock.getBoundingClientRect().top : window.innerHeight;
    const available = Math.max(0, dockTop - top - 12);
    catalog.style.setProperty('--catalog-top', `${top}px`);
    catalog.style.setProperty('--catalog-rail-height', `${available}px`);
    const activationLine = top + Math.min(96, available * 0.2);
    const scrollingElement = document.scrollingElement;
    const atBottom = scrollingElement.scrollTop > 0 &&
      scrollingElement.scrollHeight - scrollingElement.clientHeight - scrollingElement.scrollTop <= 2;
    const current = atBottom ? visible.at(-1) :
      (visible.findLast(group => group.getBoundingClientRect().top <= activationLine) ?? visible[0]);
    buttons.forEach((button, index) => {
      if (groups[index] === current) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  }

  function applySearch() {
    const query = search.value.trim().toLocaleLowerCase();
    groups.forEach((group, index) => {
      const cards = [...group.querySelectorAll('.catalog-card')];
      cards.forEach(card => { card.hidden = !card.dataset.entry.toLocaleLowerCase().includes(query); });
      group.hidden = cards.every(card => card.hidden);
      buttons[index].disabled = group.hidden;
    });
    empty.hidden = groups.some(group => !group.hidden);
    updateCurrentCategory();
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => {
    groups[index].scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
  }));
  document.addEventListener('scroll', updateCurrentCategory, {passive:true});
  window.addEventListener('resize', updateCurrentCategory);
  search.addEventListener('input', applySearch);
  results.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    showModal(button.closest('.catalog-card').dataset.entry, '遊戲入口示意，正式連結待提供。');
  });
  applySearch();
}
