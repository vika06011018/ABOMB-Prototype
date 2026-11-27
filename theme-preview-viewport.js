(() => {
  const viewport = document.querySelector('.settings-preview-viewport');
  if (!viewport) return;
  const frame = viewport.querySelector('iframe');
  const desktop = matchMedia('(min-width:900px)');
  function resize() {
    const width = viewport.clientWidth;
    if (!width) return;
    const frameWidth = desktop.matches ? Math.max(1200,width) : Math.min(480,width);
    const scale = Math.min(1,width / frameWidth);
    frame.style.width = frameWidth + 'px';
    frame.style.height = Math.round(viewport.clientHeight / scale) + 'px';
    frame.style.transform = 'scale(' + scale + ')';
    frame.style.marginInline = desktop.matches ? '0' : 'auto';
  }
  new ResizeObserver(resize).observe(viewport);
  desktop.addEventListener('change',resize);
  resize();
})();
