(() => {
  const view = document.querySelector('#referralView');
  const tabs = view.querySelectorAll('[data-ref]');
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const item of tabs) {
        const active = item === tab;
        item.setAttribute('aria-pressed', String(active));
        document.getElementById('ref-' + item.dataset.ref).hidden = !active;
      }
    });
  }
  const status = document.querySelector('#ref-status');
  async function copy(input, label) {
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = label + '已複製';
    } catch {
      input.focus();
      input.select();
      status.textContent = '已選取內容，可手動複製。';
    }
  }
  for (const button of view.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', () => copy(document.getElementById(button.dataset.copy),
      button.dataset.copy === 'ref-code' ? '推薦碼' : '推薦連結'));
  }
  const link = document.querySelector('#ref-url');
  document.querySelector('#ref-share').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({title:'BOMB 推薦好友', url:link.value});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    await copy(link, '推薦連結');
  });

  const start = document.querySelector('#ref-start');
  const end = document.querySelector('#ref-end');
  const result = document.querySelector('#ref-search-status');
  const shortcuts = view.querySelectorAll('[data-range]');
  const format = date => [date.getFullYear(), date.getMonth()+1, date.getDate()].map(n => String(n).padStart(2,'0')).join('-');
  function plusDays(date, count) {
    const next = new Date(date);
    next.setDate(next.getDate() + count);
    return next;
  }
  function setRange(key) {
    const now = new Date();
    const weekStart = plusDays(now, -((now.getDay()+6)%7));
    const yesterday = plusDays(now,-1);
    const ranges = {
      yesterday:[yesterday,yesterday], today:[now,now],
      'last-week':[plusDays(weekStart,-7),plusDays(weekStart,-1)],
      week:[weekStart,plusDays(weekStart,6)],
      month:[new Date(now.getFullYear(),now.getMonth(),1),new Date(now.getFullYear(),now.getMonth()+1,0)],
    };
    [start.value,end.value] = ranges[key].map(format);
    result.textContent = '';
    for (const button of shortcuts) button.setAttribute('aria-pressed',String(button.dataset.range === key));
  }
  for (const button of shortcuts) button.addEventListener('click', () => setRange(button.dataset.range));
  for (const input of [start,end]) input.addEventListener('input', () => {
    result.textContent = '';
    for (const button of shortcuts) button.setAttribute('aria-pressed','false');
  });
  document.querySelector('#ref-dates').addEventListener('submit', event => {
    event.preventDefault();
    result.textContent = start.value > end.value ? '結束日期須等於或晚於起始日期。' :
      `${start.value} 至 ${end.value}，查無回饋資料。`;
  });
  setRange('today');
})();
