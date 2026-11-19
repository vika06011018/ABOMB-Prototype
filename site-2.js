

/* Drag & snap quick tools: a short tap keeps the original expand/collapse click. */
(() => {
  const floating = document.querySelector('.floating');
  const toggle = document.getElementById('floatToggle');
  const actions = document.getElementById('floatActions');
  if (!floating || !toggle || !actions) return;
  const desktop = window.matchMedia('(min-width:900px)');
  const key = 'bomb-floating-gift-position-v1';
  const gap = 10;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let saved = null;
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value && (value.side === 'left' || value.side === 'right') && Number.isFinite(value.y)) saved = value;
  } catch (_) { /* Storage unavailable: keep default position. */ }
  let side = saved?.side || 'right';
  let drag = null;
  let swallowClick = false;

  function place(x, y) {
    const width = floating.offsetWidth;
    const height = floating.offsetHeight;
    floating.style.right = 'auto';
    floating.style.left = `${clamp(x, gap, Math.max(gap, innerWidth - width - gap))}px`;
    floating.style.top = `${clamp(y, gap, Math.max(gap, innerHeight - height - gap))}px`;
  }
  function dock(chosenSide, y) {
    if (!desktop.matches) return;
    side = chosenSide;
    const width = floating.offsetWidth;
    place(side === 'left' ? gap : innerWidth - width - gap, y);
    const range = Math.max(0, innerHeight - floating.offsetHeight - gap * 2);
    const fraction = range ? (floating.getBoundingClientRect().top - gap) / range : 0;
    saved = {side, y: clamp(fraction, 0, 1)};
    try { localStorage.setItem(key, JSON.stringify(saved)); } catch (_) {}
  }
  function refresh() {
    if (!desktop.matches) {
      floating.style.left = '';
      floating.style.right = '';
      floating.style.top = '';
      return;
    }
    if (!saved) return;
    const range = Math.max(0, innerHeight - floating.offsetHeight - gap * 2);
    dock(saved.side, gap + saved.y * range);
  }
  toggle.addEventListener('pointerdown', event => {
    if (!desktop.matches || event.button !== 0 || !event.isPrimary) return;
    const rect = floating.getBoundingClientRect();
    drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY,
            left:rect.left, top:rect.top, moved:false};
    toggle.setPointerCapture?.(event.pointerId);
  });
  toggle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || !desktop.matches) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx,dy) < 7) return;
    drag.moved = true;
    floating.classList.add('is-dragging');
    place(drag.left + dx, drag.top + dy);
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
      const rect = floating.getBoundingClientRect();
      dock(rect.left + rect.width / 2 < innerWidth / 2 ? 'left' : 'right', rect.top);
      swallowClick = true;
    }
    floating.classList.remove('is-dragging');
    drag = null;
  }
  toggle.addEventListener('pointerup', release);
  toggle.addEventListener('pointercancel', release);
  // Capture phase blocks the normal expand/collapse handler only following a drag.
  toggle.addEventListener('click', event => {
    if (!swallowClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    swallowClick = false;
  }, true);
  // The panel becomes taller/shorter when toggled; keep the entire panel on-screen.
  toggle.addEventListener('click', () => {
    if (desktop.matches && saved) requestAnimationFrame(refresh);
  });
  window.addEventListener('resize', refresh, {passive:true});
  refresh();
})();
