{
  const desktopViewport = matchMedia('(min-width:900px)');
  const desktopPage = Boolean(document.querySelector('#desktop-games'));
  // Match the order of the mobile category buttons, including sports before fish.
  const desktopSections = ['live', 'slots', 'lottery', 'table', 'sports', 'fish'];

  function syncGameViewport() {
    if (desktopViewport.matches === desktopPage) return;
    if (desktopPage) {
      const routeSection = document.querySelector('.primary-menu [aria-current="location"]')?.dataset.category;
      const categories = ['視訊', '電子', '彩票', '棋牌', '體育', '捕魚'];
      const index = routeSection ? categories.indexOf(routeSection) :
        desktopSections.indexOf(location.hash.slice(1).replace(/^games-/, ''));
      location.replace('all-games.html' + (index >= 0 ? '#catalog-' + index : ''));
    } else {
      const active = document.querySelector('.catalog-categories [aria-current="location"]');
      const index = active?.dataset.group ?? location.hash.match(/^#catalog-(\d+)$/)?.[1];
      const section = desktopSections[index];
      location.replace('desktop-games.html' + (section && section !== 'live' ? '#games-' + section : ''));
    }
  }

  desktopViewport.addEventListener('change', syncGameViewport);
  syncGameViewport();
}
