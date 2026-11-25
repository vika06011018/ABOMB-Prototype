(() => {
  const profile = document.querySelector('.personal-desktop-profile');
  const tabs = profile.querySelectorAll('[data-profile-tab]');
  function selectTab(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute('aria-pressed', String(active));
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
  }
  for (const tab of tabs) tab.addEventListener('click', () => selectTab(tab));
  document.querySelector('.desktop-account-entry').addEventListener('click', () => selectTab(tabs[0]));
  document.querySelector('.deposit-side [data-deposit-view="personal"]').addEventListener('click', () => selectTab(tabs[0]));
  window.addEventListener('hashchange', () => {
    if (location.hash === '#personal-center') selectTab(tabs[0]);
  });

  const {levels, groups, invitationOnly, rules} = vipProgram;
  const textElement = (tag, text) => Object.assign(document.createElement(tag), {textContent:text});
  const levelTrack = profile.querySelector('.profile-levels');
  for (const [index, name] of levels.entries()) {
    const item = textElement('li', name);
    if (index === 0) item.setAttribute('aria-current', 'step');
    levelTrack.append(item);
  }
  const benefits = ['升級禮金','每週好運紅包','介紹禮金','生日禮金','每日提領金額上限'];
  for (const [id, index] of [['profile-current-benefits',0], ['profile-next-benefits',1]]) {
    const list = document.getElementById(id);
    for (const label of benefits) {
      const row = groups.flatMap(group => group.rows).find(entry => entry[0].split('（')[0] === label);
      const value = row?.[index + 1];
      if (!value || value === '—') continue;
      const item = document.createElement('div');
      item.append(textElement('dt',label),textElement('dd',value));
      list.append(item);
    }
  }

  const table = profile.querySelector('.vip-comparison');
  for (const level of levels) {
    const heading = textElement('th', level);
    heading.scope = 'col';
    table.tHead.rows[0].append(heading);
  }
  {
    for (const group of groups) {
      const body = table.createTBody();
      const title = textElement('th',group.title);
      title.colSpan = levels.length + 1;
      title.scope = 'rowgroup';
      body.insertRow().append(title);
      for (const [label,...values] of group.rows) {
        const row = body.insertRow();
        const name = textElement('th',label);
        name.scope = 'row';
        row.append(name);
        for (const level of levels) {
          row.append(textElement('td', invitationOnly.includes(level) ? '邀請制' : values[levels.indexOf(level)] ?? '—'));
        }
      }
    }
  }
  for (const [title, description] of rules) {
    const item = document.createElement('li');
    item.append(textElement('strong',title),textElement('p',description));
    document.querySelector('#vip-rule-list').append(item);
  }
  document.querySelector('#profile-email-form').addEventListener('submit', event => {
    event.preventDefault();
    const status = document.querySelector('#profile-email-status');
    status.textContent = '示範模式，未寄送驗證信。';
    status.hidden = false;
  });
})();
