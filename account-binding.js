(() => {
  const view = document.querySelector('#depositBindingView');
  const heading = view.querySelector('h1');
  const caption = view.querySelector('#bind-caption');
  const column = view.querySelector('#bind-column');
  const rows = view.querySelector('#bind-rows');
  const list = view.querySelector('#bind-list');
  const flow = view.querySelector('#bind-flow');
  const notice = view.querySelector('#bind-notice');
  const identity = view.querySelector('#bind-identity');
  const identityStatus = view.querySelector('#bind-identity-status');
  const nationalId = view.querySelector('#bind-id');
  const addImage = view.querySelector('#bind-add-image');
  const bankForm = view.querySelector('#bind-bank');
  const bankName = bankForm.querySelector('#bank-name');
  const bankId = bankForm.querySelector('#bank-id');
  const bankFiles = bankForm.querySelectorAll('input[type="file"]');
  const bankAdd = view.querySelector('#bind-add-bank');
  const steps = view.querySelector('#bind-steps');
  const nameColumn = view.querySelector('#bind-name-column');
  const bankAccounts = [{bank:'示範銀行 A', suffix:'12345', verified:true}];
  const forms = [...view.querySelectorAll('[data-bind-form]')];
  const tabs = [...view.querySelectorAll('[data-bind-tab]')];
  const store = view.querySelector('#bind-store-select');
  const channels = document.querySelector('#depositForm');
  const entry = document.querySelector('#depositUnbound a');
  const methods = {
    bank: ['綁定銀行卡','銀行帳戶清單','帳號後五碼'],
    credit: ['綁定信用卡','信用卡','卡片後五碼'],
    usdt: ['綁定USDT','USDT','錢包地址末五碼'],
    store: ['綁定超商','超商','店家代號'],
  };
  const addImages = {bank:'bank', credit:'card', usdt:'usdt', store:'7-eleven'};
  let kind = 'bank';
  let completedIdentity = false;
  let identityOnly = false;
  let selectedChannel = null;
  const completed = new Set();
  const stateKey = 'bomb-demo-binding-identity-v2';

  try { completedIdentity = sessionStorage.getItem(stateKey) === 'complete'; } catch {}

  function syncEntry() {
    const selected = channels.querySelector('[name="channel"]:checked');
    const nextKind = selected?.dataset.bindKind ?? 'bank';
    entry.href = '#bind-bank-card?type=' + nextKind;
  }

  function showList(nextKind) {
    resetBankForm();
    kind = Object.hasOwn(methods,nextKind) ? nextKind : 'bank';
    [heading.textContent,caption.textContent,column.textContent] = methods[kind];
    const bank = kind === 'bank';
    view.classList.toggle('bank-binding', bank);
    nameColumn.textContent = bank ? '銀行名稱' : '名稱';
    bankAdd.hidden = !bank;
    view.querySelector('#bind-add').hidden = bank;
    view.querySelector('#bind-identity-entry').hidden = bank;
    addImage.src = `assets/deposit/${addImages[kind]}.webp`;
    for (const tab of tabs) tab.setAttribute('aria-pressed',String(tab.dataset.bindTab === kind));
    list.hidden = false;
    flow.hidden = true;
    identityOnly = false;
    notice.textContent = '';
    rows.replaceChildren();
    if (bank) {
      for (const account of bankAccounts) {
        const row = rows.insertRow();
        row.setAttribute('role','row');
        const name = row.insertCell();
        const number = row.insertCell();
        const status = row.insertCell();
        for (const cell of [name,number,status]) cell.setAttribute('role','cell');
        name.textContent = account.bank;
        number.textContent = `••••• ${account.suffix}`;
        const badge = document.createElement('span');
        badge.className = account.verified ? 'bank-status verified' : 'bank-status';
        badge.textContent = account.verified ? '✓ 已驗證' : '待審核';
        status.append(badge);
      }
      return;
    }
    const row = rows.insertRow();
    if (completed.has(kind)) {
      for (const value of ['示範綁定','•••••','示範完成']) row.insertCell().textContent = value;
    } else {
      const cell = row.insertCell();
      cell.colSpan = 3;
      cell.textContent = '尚未綁定';
    }
  }

  function resetBankForm() {
    bankForm.reset();
    for (const field of [bankName, bankId, ...bankFiles]) field.setCustomValidity('');
  }

  function syncRoute() {
    const [route, search] = location.hash.slice(1).split('?');
    resetBankForm();
    identity.reset();
    nationalId.setCustomValidity('');
    for (const form of forms) form.reset();
    if (route !== 'bind-bank-card') return;
    const nextKind = new URLSearchParams(search).get('type');
    if (!nextKind || channels.querySelector('[name="channel"]:checked')?.dataset.bindKind !== nextKind) selectedChannel = null;
    showList(nextKind);
  }

  function showStep(step) {
    list.hidden = true;
    flow.hidden = false;
    bankForm.hidden = true;
    steps.hidden = false;
    identity.hidden = step !== 1;
    identityStatus.hidden = !completedIdentity;
    for (const form of forms) form.hidden = step !== 2 || form.id !== 'bind-' + kind;
    const [one,two] = view.querySelectorAll('.bind-steps li');
    one.removeAttribute('aria-current');
    two.removeAttribute('aria-current');
    (step === 1 ? one : two).setAttribute('aria-current','step');
    const activeForm = step === 1 ? identity : view.querySelector('#bind-' + kind);
    activeForm.querySelector('input,select').focus();
  }

  channels.addEventListener('change', syncEntry);
  channels.addEventListener('reset', () => requestAnimationFrame(syncEntry));
  window.addEventListener('pageshow', syncEntry);
  entry.addEventListener('click', () => { selectedChannel = channels.querySelector('[name="channel"]:checked'); });
  window.addEventListener('hashchange', syncRoute);
  for (const tab of tabs) tab.addEventListener('click', () => {
    const nextKind = tab.dataset.bindTab;
    selectedChannel = null;
    const nextHash = '#bind-bank-card?type=' + nextKind;
    if (location.hash === nextHash) showList(nextKind);
    else location.hash = nextHash;
  });
  view.querySelector('#bind-identity-entry').addEventListener('click', () => {
    identityOnly = true;
    showStep(1);
  });
  view.querySelector('#bind-review-identity').addEventListener('click', () => showStep(1));
  bankAdd.addEventListener('click', () => {
    resetBankForm();
    list.hidden = true;
    flow.hidden = false;
    steps.hidden = true;
    identity.hidden = true;
    for (const form of forms) form.hidden = true;
    bankForm.hidden = false;
    bankName.focus();
  });
  view.querySelector('#bind-add').addEventListener('click', () => {
    for (const form of forms) form.reset();
    if (kind === 'store' && selectedChannel) {
      if (selectedChannel.value.startsWith('711')) store.value = '711';
      if (selectedChannel.value.startsWith('全家')) store.value = 'family';
    }
    showStep(completedIdentity ? 2 : 1);
  });
  view.querySelector('#bind-back').addEventListener('click', () => {
    identity.reset();
    nationalId.setCustomValidity('');
    for (const form of forms) form.reset();
    showList(kind);
    (kind === 'bank' ? bankAdd : view.querySelector('#bind-add')).focus();
  });
  function validateNationalId(nationalId) {
    const value = nationalId.value.trim().replace(/[a-z]/g, letter => letter.toUpperCase());
    nationalId.value = value;
    if (!/^[A-Z][0-9]{9}$/.test(value)) {
      nationalId.setCustomValidity('請輸入 1 個英文字母及 9 位數字的國民身分證字號。');
      return false;
    }
    if (!/^[12]$/.test(value[1])) {
      nationalId.setCustomValidity('國民身分證字號的第一位數字須為 1 或 2。');
      return false;
    }
    const areaCode = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'.indexOf(value[0]) + 10;
    let sum = Math.floor(areaCode / 10) + (areaCode % 10) * 9;
    for (let i = 1; i < 9; i++) sum += Number(value[i]) * (9 - i);
    const valid = (sum + Number(value[9])) % 10 === 0;
    nationalId.setCustomValidity(valid ? '' : '身分證字號檢查碼不符，請確認後再試。');
    return valid;
  }

  nationalId.addEventListener('input', () => {
    nationalId.setCustomValidity('');
    nationalId.value = nationalId.value.replace(/[a-z]/g, letter => letter.toUpperCase());
  });
  identity.addEventListener('submit', event => {
    event.preventDefault();
    const name = view.querySelector('#bind-name');
    if (!name.value.trim()) {
      name.setCustomValidity('請填寫示範姓名。');
      name.reportValidity();
      return;
    }
    if (!validateNationalId(nationalId)) {
      nationalId.reportValidity();
      return;
    }
    completedIdentity = true;
    try { sessionStorage.setItem(stateKey,'complete'); } catch {}
    if (identityOnly) {
      identity.reset();
      showList(kind);
      notice.textContent = '示範身分資料已確認。';
      view.querySelector('#bind-identity-entry').focus();
    } else {
      showStep(2);
    }
  });
  view.querySelector('#bind-name').addEventListener('input', event => event.target.setCustomValidity(''));
  for (const field of [bankName, bankId]) field.addEventListener('input', () => field.setCustomValidity(''));
  for (const fileInput of bankFiles) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      const accepted = ['image/jpeg','image/png','image/webp'];
      const valid = !file || accepted.includes(file.type);
      fileInput.setCustomValidity(valid ? '' : '請選擇 JPG、PNG 或 WebP 圖片。');
    });
  }
  bankForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!bankName.value.trim()) {
      bankName.setCustomValidity('請填寫示範姓名。');
      bankName.reportValidity();
      return;
    }
    if (!validateNationalId(bankId)) {
      bankId.reportValidity();
      return;
    }
    const bank = bankForm.elements.bank.value;
    const suffix = bankForm.elements.account.value.slice(-5);
    bankAccounts.unshift({bank, suffix, verified:false});
    showList('bank');
    notice.textContent = '示範認證已送出，可在清單查看待審核狀態。';
    bankAdd.focus();
  });
  for (const form of forms) form.addEventListener('submit', event => {
    event.preventDefault();
    completed.add(kind);
    identity.reset();
    nationalId.setCustomValidity('');
    form.reset();
    showList(kind);
    notice.textContent = '示範綁定完成。';
  });
  for (const link of view.querySelectorAll('[data-store-link]')) {
    link.addEventListener('click', () => { store.value = link.dataset.storeLink; });
  }
  view.querySelector('#bind-branch').addEventListener('click', () => {
    showModal('分行代碼查詢','原型請使用示範代碼 000。');
  });
  syncEntry();
  syncRoute();
})();
