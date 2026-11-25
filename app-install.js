(() => {
  const strip = document.querySelector('.app-install-strip');
  const dismissKey = 'bomb-app-install-dismissed';
  const isGuidePreview = new URLSearchParams(location.search).get('preview') === 'app-guide';
  let dismissed = false;

  function updateVisibility() {
    try {
      dismissed ||= sessionStorage.getItem(dismissKey) === 'yes';
    } catch {
      // Keep the close button usable when session storage is unavailable.
    }
    strip.hidden = dismissed || isGuidePreview;
  }

  strip.querySelector('.app-install-dismiss').addEventListener('click', () => {
    dismissed = true;
    updateVisibility();
    try {
      sessionStorage.setItem(dismissKey, 'yes');
    } catch {
      // The strip can still be closed on this page.
    }
  });

  updateVisibility();
  window.addEventListener('pageshow', updateVisibility);
})();
