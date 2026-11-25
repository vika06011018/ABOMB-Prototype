const memberAvatar = (() => {
  const options = ['俐落西裝', '都會街頭', '沉穩眼鏡', '優雅長髮', '俐落短髮', '精緻盤髮'];
  const storageKey = 'bomb-demo-member-avatar';
  let selected = null;

  function url(index) {
    return options[index] && index !== null ? `assets/member-portraits/portrait-${index + 1}.webp` : 'assets/member-avatar.svg';
  }

  function render() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) selected = JSON.parse(stored);
    } catch {}
    for (const portrait of document.querySelectorAll('[data-member-avatar]')) portrait.src = url(selected);
  }

  render();
  window.addEventListener('pageshow', render);
  window.addEventListener('storage', event => {
    if (event.key === storageKey) render();
  });

  return {
    options, url,
    get selected() { return selected; },
    save(index) {
      selected = index;
      try { localStorage.setItem(storageKey, JSON.stringify(index)); } catch {}
      render();
    }
  };
})();
