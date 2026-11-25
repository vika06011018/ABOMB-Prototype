{
  const desktop = matchMedia('(min-width:900px)');
  const lobby = document.querySelector('#desktop-games');
  const menu = document.querySelector('.primary-menu');
  const home = menu.querySelector('[data-action="home"]');
  const top = document.querySelector('.top');
  const names = ['視訊', '電子', '彩票', '棋牌', '捕魚', '體育'];
  const ids = ['live', 'slots', 'lottery', 'table', 'fish', 'sports'];
  const buttons = names.map(name => menu.querySelector(`[data-category="${name}"]`));
  const isLobby = Boolean(lobby);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => motion.matches ? 'instant' : 'smooth';

  function activate(index) {
    home.classList.toggle('selected', index < 0 && !document.body.classList.contains('deposit-page'));
    buttons.forEach((button, position) => {
      button.classList.toggle('selected', position === index);
      if (position === index) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  }

  function card(group, index, title) {
    const featured = group === 0 && index < 2;
    const asset = featured ? ['hero-baccarat', 'hero-slot'][index] : `${group}-${index}`;
    const logo = group === 0 && !featured ? `<img src="assets/catalog/logo-${index}.webp" alt="">` : '';
    return `<article class="desktop-game-card${featured ? ' desktop-game-featured' : ''}">
      <img class="desktop-game-art" src="assets/${featured ? 'catalog' : 'desktop-lobby'}/${asset}.webp" alt="" loading="${featured ? 'eager' : 'lazy'}">
      <div class="desktop-game-caption">${featured ? '' : `<strong>${logo}${title}</strong>`}
        <button type="button" data-desktop-entry="${title}" aria-label="立即遊玩 ${title}">立即遊玩 ▶</button>
      </div>
    </article>`;
  }

  let sections = [];

  function updateScroll() {
    if (!desktop.matches || !isLobby || lobby.hidden) return;
    const headerBottom = top.getBoundingClientRect().bottom;
    lobby.style.setProperty('--desktop-games-offset', `${Math.max(0, headerBottom) + 16}px`);
    let current = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= headerBottom + 110) current = index;
    });
    const scroller = document.scrollingElement;
    if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) current = sections.length - 1;
    activate(current);
  }

  function render() {
    if (!isLobby || !desktop.matches) {
      document.documentElement.classList.remove('desktop-games-route');
      if (lobby) lobby.hidden = true;
      activate(-1);
      return;
    }

    if (!lobby.hasChildNodes()) {
      lobby.innerHTML = names.map((name, index) => {
        const group = categoryGroups.findIndex(([label]) => label === name);
        return `<section class="desktop-game-section" id="games-${ids[index]}" aria-labelledby="title-${ids[index]}">
          ${index ? '<div class="desktop-game-divider" aria-hidden="true"><i></i></div>' : ''}
          <h2 id="title-${ids[index]}">${name}</h2>
          <div class="desktop-game-grid">${categoryGroups[group][1].map((entry, item) => card(group, item, entry)).join('')}</div>
        </section>`;
      }).join('');
    }
    sections = ids.map(id => lobby.querySelector('#games-' + id));

    document.documentElement.classList.add('desktop-games-route');
    document.title = '遊戲大廳｜BOMB 娛樂平台';
    lobby.hidden = false;
    updateScroll();
    const section = sections.find(item => '#' + item.id === location.hash);
    if (section) section.scrollIntoView({block:'start', behavior:'instant'});
  }

  menu.addEventListener('click', event => {
    if (!desktop.matches) return;
    const button = event.target.closest('button');
    const index = buttons.indexOf(button);
    if (index < 0 && !(isLobby && button === home)) return;
    event.stopPropagation();
    if (button === home) {
      demoMember.navigate('index.html');
    } else if (!isLobby) {
      demoMember.navigate('desktop-games.html' + (index ? '#games-' + ids[index] : ''));
    } else {
      activate(index);
      history.replaceState(null, '', '#games-' + ids[index]);
      sections[index].scrollIntoView({block:'start', behavior:'instant'});
    }
  });

  lobby?.addEventListener('click', event => {
    const button = event.target.closest('[data-desktop-entry]');
    if (button) showModal(button.dataset.desktopEntry, '遊戲入口示意，正式連結待提供。');
  });
  window.addEventListener('scroll', updateScroll, {passive:true});
  window.addEventListener('resize', updateScroll);
  desktop.addEventListener('change', render);
  render();
}
