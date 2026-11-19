{
  const footer = document.querySelector('.footer');
  const dock = document.querySelector('.mobile-bottom');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.setAttribute('aria-label', '回到頁首');
  button.hidden = true;
  document.body.append(button);

  function positionBackToTop() {
    const height = window.innerHeight;
    const bottom = Math.min(height - 16,
      footer?.getClientRects().length ? footer.getBoundingClientRect().top - 12 : height,
      dock?.getClientRects().length ? dock.getBoundingClientRect().top - 14 : height);
    button.style.setProperty('--top-button-bottom', `${height - bottom}px`);
    button.hidden = window.scrollY < 200 || bottom < 60;
  }

  button.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  window.addEventListener('scroll', positionBackToTop, {passive:true});
  window.addEventListener('resize', positionBackToTop);
  positionBackToTop();
}
