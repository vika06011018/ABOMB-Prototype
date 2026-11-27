(() => {
  const key = 'bomb-site-settings';
  const themes = new Set(['original', 'red', 'navy', 'indigo', 'bronze', 'white', 'gold']);
  let settings = { theme: 'original', volume: 100, haptics: false };

  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (!stored) return;
      const theme = { d:'white', e:'white', f:'bronze', g:'white', h:'gold' }[stored.theme] ?? stored.theme;
      settings = {
        theme: themes.has(theme) ? theme : 'original',
        volume: Number.isInteger(stored.volume) && stored.volume >= 0 && stored.volume <= 100 ? stored.volume : 100,
        haptics: stored.haptics === true
      };
    } catch { /* Use the current settings when storage is unavailable. */ }
  }

  function applyTheme() {
    if (settings.theme === 'original') delete document.documentElement.dataset.siteTheme;
    else document.documentElement.dataset.siteTheme = settings.theme;
  }

  function applyVolume() {
    for (const media of document.querySelectorAll('audio,video')) {
      media.volume = settings.volume / 100;
    }
  }

  restore();
  applyTheme();
  const previewTheme = location.pathname.endsWith('/index.html') && window.parent !== window
    ? new URLSearchParams(location.search).get('theme-preview') : null;
  if (themes.has(previewTheme)) {
    settings.theme = previewTheme;
    applyTheme();
    return;
  }

  const initControls = () => {
    const preview = document.querySelector('#site-home-preview');
    const saveTheme = document.querySelector('#site-theme-save');
    const themeStatus = document.querySelector('#site-theme-status');
    let draftTheme = settings.theme;

    function refreshPreview() {
      if (!preview) return;
      const src = 'index.html?theme-preview=' + encodeURIComponent(draftTheme);
      if (preview.getAttribute('src') !== src) preview.setAttribute('src',src);
      saveTheme.disabled = draftTheme === settings.theme;
    }

    const volume = document.querySelector('#site-volume');
    const volumeOutput = document.querySelector('#site-volume-value');
    const haptics = document.querySelector('#site-haptics');
    const status = document.querySelector('#site-haptic-status');

    function refresh() {
      applyTheme();
      applyVolume();
      for (const option of document.querySelectorAll('[name="site-theme"]')) {
        option.checked = option.value === draftTheme;
      }
      if (volume) {
        volume.value = settings.volume;
        volumeOutput.textContent = settings.volume + '%';
      }
      if (haptics) haptics.checked = settings.haptics;
      refreshPreview();
    }

    function save() {
      try { localStorage.setItem(key, JSON.stringify(settings)); }
      catch { /* Preferences still work in the current page. */ }
      refresh();
    }

    document.querySelector('#site-theme-options')?.addEventListener('change', event => {
      if (!event.target.matches('[name="site-theme"]')) return;
      if (!themes.has(event.target.value)) return;
      draftTheme = event.target.value;
      themeStatus.textContent = draftTheme === settings.theme ? '' : '預覽中，尚未儲存。';
      refreshPreview();
    });
    saveTheme?.addEventListener('click', () => {
      settings.theme = draftTheme;
      save();
      themeStatus.textContent = '配色已儲存。';
    });
    volume?.addEventListener('input', () => {
      settings.volume = Number(volume.value);
      save();
    });
    let audioContext;
    document.querySelector('#site-volume-test')?.addEventListener('click', async () => {
      if (!window.AudioContext || settings.volume === 0) return;
      try {
        audioContext ??= new AudioContext();
        await audioContext.resume();
        const now = audioContext.currentTime;
        const tone = audioContext.createOscillator();
        const level = audioContext.createGain();
        tone.frequency.value = 520;
        level.gain.setValueAtTime(0, now);
        level.gain.linearRampToValueAtTime(settings.volume / 100 * 0.12, now + 0.03);
        level.gain.linearRampToValueAtTime(0, now + 0.28);
        tone.connect(level).connect(audioContext.destination);
        tone.start(now);
        tone.stop(now + 0.28);
      } catch { /* Sound preview is optional on browsers that block audio. */ }
    });
    haptics?.addEventListener('change', () => {
      settings.haptics = haptics.checked;
      save();
      if (settings.haptics && !navigator.vibrate?.(18)) {
        status.textContent = '此瀏覽器目前無法播放震動。';
      } else {
        status.textContent = '';
      }
    });
    document.addEventListener('click', event => {
      if (!settings.haptics || !matchMedia('(max-width:899px) and (pointer:coarse)').matches) return;
      if (!event.target.closest('button:not(:disabled),a[href],.deposit-tile')) return;
      navigator.vibrate?.(12);
    });
    document.addEventListener('play', event => {
      if (event.target.matches('audio,video')) event.target.volume = settings.volume / 100;
    }, true);
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      const wasSaved = draftTheme === settings.theme;
      restore();
      if (wasSaved) draftTheme = settings.theme;
      refresh();
    });
    window.addEventListener('pageshow', () => {
      const wasSaved = draftTheme === settings.theme;
      restore();
      if (wasSaved) draftTheme = settings.theme;
      refresh();
    });
    refresh();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initControls, { once:true });
  else initControls();
})();
