const providerImagePaths = {
  "ATG": "assets/provider-marks/atg-official.png",
  "BOMB": "assets/catalog/logo-0.webp",
  "WINNER": "assets/catalog/logo-6.webp",
  "BNG": "assets/provider-marks/bng-official.png",
  "BOYAA": "assets/provider-marks/boyaa-official.png",
  "DB": "assets/provider-marks/db-symbol.png",
  "GC": "assets/provider-marks/gc.png",
  "GR": "assets/provider-marks/gr.png",
  "LIVE": "assets/provider-marks/live.png",
  "QT": "assets/provider-marks/qt-paw.svg",
  "RSG": "assets/provider-marks/rsg-official.svg",
  "S PLUS": "assets/provider-marks/s-plus.png",
  "SUPER": "assets/provider-marks/super-official.png",
  "TAG": "assets/provider-marks/tag-official.png",
  "WE": "assets/provider-marks/we.png",
  "ZG": "assets/provider-marks/zg-symbol.png",
  "博雅": "assets/provider-marks/boya-fishing-white.png",
  "熊貓": "assets/provider-marks/provider-18.png",
  "鑫寶": "assets/provider-marks/provider-19.png",
  "高登": "assets/provider-marks/provider-20.png"
};
const catalog = document.documentElement.classList.contains("catalog-route") && document.querySelector('.catalog');
const categoryGroups = [
  ['視訊', ['BOMB 真人百家','BOMB 柏青 SLOT','MT 真人','DG 真人','T9 真人','WM 真人','WINNER 真人','OG 真人','SA 真人']],
  ['電子', ['RSG 電子','QT 電子','BNG 電子','ZG 電子','TAG 電子','ATG 電子']],
  ['彩票', ['WINNER 彩票','GC 彩票','DB 彩票']],
  ['棋牌', ['DB 棋牌','高登棋牌','GR 棋牌','BOYAA 棋牌']],
  ['體育', ['熊貓體育','SUPER 體育','鑫寶體育','Live 體育','WE 體育']],
  ['捕魚', ['ZG 捕魚','RSG 捕魚','DB 捕魚','GR 捕魚','博雅捕魚','S PLUS 捕魚','TAG 捕魚']]
];

if (catalog) {
  const categories = catalog.querySelector('.catalog-categories');
  const results = catalog.querySelector('.catalog-results');
  const search = catalog.querySelector('input');
  const empty = catalog.querySelector('.catalog-empty');

  categoryGroups.forEach(([name, entries], group) => {
    const providerNames = [
      [], ['RSG', 'QT', 'BNG', 'ZG', 'TAG', 'ATG'], ['WINNER', 'GC', 'DB'],
      ['DB', '高登', 'GR', 'BOYAA'], ['熊貓', 'SUPER', '鑫寶', 'LIVE', 'WE'],
      ['ZG', 'RSG', 'DB', 'GR', '博雅', 'S PLUS', 'TAG']
    ][group];
    categories.insertAdjacentHTML('beforeend',
      `<button type="button" data-group="${group}"><img src="assets/catalog/category-${group}.webp" alt="">${name}</button>`);
    results.insertAdjacentHTML('beforeend', `<section class="catalog-group" id="catalog-${group}" aria-labelledby="catalog-heading-${group}">
      <h2 id="catalog-heading-${group}"><img src="assets/catalog/category-${group}.webp" alt=""> ${name}</h2>
      <div class="catalog-entries">${(group === 1 ? [5,0,2,3,4,1] : entries.map((_, index) => index)).map(index => {
        const entry = entries[index];
        const featured = group === 0 && index < 2;
        const videoArt = ['hero-baccarat', 'hero-slot'];
        const artIndex = group === 4 && index > 0 ? index + 1 : index;
        const art = (group === 0 && videoArt[index]) || `${group}-${artIndex}`;
        const logoPath = group === 0 ? `assets/catalog/logo-${index}.webp` : providerImagePaths[providerNames[index]];
        const bilingual = entry.match(/^([A-Za-z][A-Za-z0-9 ]*) (\p{Script=Han}.*)$/u);
        const roomName = bilingual
          ? `<span class="catalog-room-name"><span class="catalog-room-brand">${bilingual[1]}</span> <span class="catalog-room-label">${bilingual[2]}</span></span>`
          : `<span>${entry}</span>`;
        const logo = `<img class="provider-image" src="${logoPath}" alt="">`;
        const artPath = entry === 'ATG 電子' ? 'assets/lobby-banners/atg-warrior.webp' : `assets/${featured ? 'catalog' : 'desktop-lobby'}/${art}.webp`;
        const badge = {'熊貓體育':'足球焦點', 'ATG 電子':'彩金池'}[entry];
        return `<article class="catalog-card${featured ? ' catalog-featured' : ''}" data-entry="${entry}" data-provider="${group === 0 ? (['BOMB','BOMB','MT','DG','T9','WM','WINNER','OG','SA'][index]) : providerNames[index]}">
          <img class="catalog-art" src="${artPath}" alt="" loading="${featured ? 'eager' : 'lazy'}">
          ${badge ? `<span class="catalog-event-badge">${badge}</span>` : ''}
          <button type="button" class="catalog-heart" data-heart aria-label="收藏 ${entry}" aria-pressed="false">♡</button><footer><strong>${logo}${roomName}</strong><button type="button" aria-label="立即遊玩 ${entry}">立即遊玩 ›</button></footer>
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
  const roomKey = 'bomb-preview-favorites';
  const aliases = {'BOMB 真人百家':'baccarat','BOMB 柏青 SLOT':'pachinko','ATG 電子':'seth'};
  function refreshHearts() {
    const roomFavorites = readPreference(roomKey, [], Array.isArray);
    for (const button of results.querySelectorAll('[data-heart]')) {
      const entry = button.closest('.catalog-card').dataset.entry;
      const saved = aliases[entry] ? favorites.includes(aliases[entry]) : roomFavorites.includes(entry);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', (saved ? '取消收藏 ' : '收藏 ') + entry);
      button.textContent = saved ? '♥' : '♡';
    }
  }
  const savedDialog = document.querySelector('#saved-games-dialog');
  const savedList = savedDialog.querySelector('.saved-games-list');
  function renderSavedGames() {
    const entries = readPreference(roomKey, [], Array.isArray);
    const homeItems = games.filter(game => favorites.includes(game.id)).map(game => ({
      title:game.name, provider:homeProvider(game),
      art:originalFeaturedArt[game.id] ?? `assets/home-games/${game.id}.webp`,
      play:() => openGame(game),
      remove:() => {
        favorites = favorites.filter(id => id !== game.id);
        savePreference(favoritesKey, favorites);
      }
    }));
    const roomItems = [...results.querySelectorAll('.catalog-card')]
      .filter(card => entries.includes(card.dataset.entry) && !aliases[card.dataset.entry])
      .map(card => ({
        title:card.dataset.entry,
        provider:{name:card.dataset.provider, logo:card.querySelector('.provider-image').src},
        art:card.querySelector('.catalog-art').src,
        play:() => roomTransfer.open(card.dataset.entry),
        remove:() => savePreference(roomKey, entries.filter(entry => entry !== card.dataset.entry))
      }));
    const items = [...homeItems, ...roomItems];
    savedList.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.textContent = '目前沒有收藏。';
      savedList.append(empty);
      return;
    }
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'saved-game-card';
      card.innerHTML = '<img class="saved-game-art" alt=""><div><strong></strong><small></small><button class="saved-game-play" type="button">立即遊玩</button></div><button class="saved-game-remove" type="button">♥</button>';
      card.querySelector('.saved-game-art').src = item.art;
      card.querySelector('strong').textContent = item.title;
      const provider = card.querySelector('small');
      provider.textContent = item.provider?.name ?? '平台商待確認';
      if (item.provider?.logo) {
        const logo = document.createElement('img');
        logo.src = item.provider.logo;
        logo.alt = '';
        provider.prepend(logo);
      }
      card.querySelector('.saved-game-play').addEventListener('click', () => {
        savedDialog.close();
        item.play();
      });
      const remove = card.querySelector('.saved-game-remove');
      remove.setAttribute('aria-label', '取消收藏 ' + item.title);
      remove.addEventListener('click', () => {
        item.remove();
        refreshHearts();
        renderSavedGames();
        (savedList.querySelector('.saved-game-remove') ?? savedDialog.querySelector('form button')).focus();
      });
      savedList.append(card);
    }
  }
  catalog.querySelector('.catalog-favorites').addEventListener('click', () => {
    renderSavedGames();
    savedDialog.showModal();
  });
  refreshHearts();
  results.addEventListener('click', event => {
    const button = event.target.closest('button');
    const card = event.target.closest('.catalog-card');
    if (!card) return;
    const entry = card.dataset.entry;
    if (button?.hasAttribute('data-heart')) {
      const alias = aliases[entry];
      const key = alias ? favoritesKey : roomKey;
      const list = alias ? favorites : readPreference(roomKey, [], Array.isArray);
      const id = alias ?? entry;
      const next = list.includes(id) ? list.filter(value => value !== id) : [id, ...list];
      if (alias) favorites = next;
      savePreference(key, next);
      refreshHearts();
      return;
    }
    if (entry === 'ATG 電子') openGame(games.find(game => game.id === 'seth'));
    else roomTransfer.open(entry);
  });
  applySearch();
  const initialSection = groups.find(group => '#' + group.id === location.hash);
  if (initialSection) initialSection.scrollIntoView({block:'start', behavior:'instant'});
}
