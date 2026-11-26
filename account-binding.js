(() => {
  const view = document.querySelector('#depositBindingView');
  const heading = view.querySelector('h1');
  const caption = view.querySelector('#bind-caption');
  const column = view.querySelector('#bind-column');
  const rows = view.querySelector('#bind-rows');
  const list = view.querySelector('#bind-list');
  const flow = view.querySelector('#bind-flow');
  const notice = view.querySelector('#bind-notice');
  const addImage = view.querySelector('#bind-add-image');
  const bankForm = view.querySelector('#bind-bank');
  const bankName = bankForm.querySelector('#bank-name');
  const bankId = bankForm.querySelector('#bank-id');
  const bankFiles = bankForm.querySelectorAll('input[type="file"]');
  const previews = new Map();
  const examples = view.querySelector('#bank-examples');
  view.querySelector('#bank-examples-open').addEventListener('click', () => examples.showModal());
  const bankAdd = view.querySelector('#bind-add-bank');
  const bankList = view.querySelector('#bank-account-list');
  const bankCards = view.querySelector('#bank-account-cards');
  const bankAccounts = [{bank:'示範銀行 A', suffix:'12345', verified:true, date:new Date(2024,8,10,12,58,20)}];
  const verifiedIdentity = Object.freeze(['示範會員','A123456789','0900000000']);
  const identityFields = [bankName, bankId, bankForm.elements.phone];
  const identityEditor = view.querySelector('#bank-identity-editor');
  const editForm = identityEditor.querySelector('form');
  const editButton = view.querySelector('#bank-edit-identity');
  const dateFormat = new Intl.DateTimeFormat('sv-SE',{dateStyle:'short',timeStyle:'medium'});
  const panels = [...view.querySelectorAll('[data-bind-panel]')];
  const add = view.querySelector('#bind-add');
  const submit = view.querySelector('#bind-submit');
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
  let selectedChannel = null;
  const completed = new Map();


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
    rows.closest('table').hidden = bank;
    bankList.hidden = !bank;
    view.querySelector('#bind-add').hidden = bank;
    addImage.src = `assets/deposit/${addImages[kind]}.webp`;
    for (const tab of tabs) tab.setAttribute('aria-pressed',String(tab.dataset.bindTab === kind));
    list.hidden = false;
    flow.hidden = true;
    notice.textContent = '';
    rows.replaceChildren();
    if (bank) {
      bankCards.replaceChildren();
      for (const account of bankAccounts) {
        const card = document.createElement('article');
        card.className = 'bank-account-card';
        const name = document.createElement('h3');
        const number = document.createElement('p');
        const date = document.createElement('p');
        const badge = document.createElement('span');
        name.textContent = account.bank;
        number.className = 'bank-card-number';
        number.textContent = `••••• ${account.suffix}`;
        date.className = 'bank-card-date';
        date.textContent = `${account.verified ? '綁卡日期' : '送出日期'} ${dateFormat.format(account.date)}`;
        badge.className = account.verified ? 'bank-status verified' : 'bank-status';
        badge.textContent = account.verified ? '✓ 已驗證' : '待審核';
        card.append(name,badge,number,date);
        bankCards.append(card);
      }
      return;
    }
    const row = rows.insertRow();
    if (completed.has(kind)) {
      for (const value of completed.get(kind)) row.insertCell().textContent = value;
    } else {
      const cell = row.insertCell();
      cell.colSpan = 3;
      cell.textContent = '尚未綁定';
    }
  }

  function clearPreview(input) {
    const previous = previews.get(input);
    if (!previous) return;
    previous.image.hidden = true;
    previous.image.removeAttribute('src');
    URL.revokeObjectURL(previous.url);
    previews.delete(input);
  }

  function resetBankForm() {
    for (const input of bankFiles) clearPreview(input);
    bankForm.reset();
    for (const field of [bankName, bankId, ...bankFiles]) field.setCustomValidity('');
  }

  function syncRoute() {
    const [route, search] = location.hash.slice(1).split('?');
    resetBankForm();
    if (route !== 'bind-bank-card') return;
    const nextKind = new URLSearchParams(search).get('type');
    if (!nextKind || channels.querySelector('[name="channel"]:checked')?.dataset.bindKind !== nextKind) selectedChannel = null;
    showList(nextKind);
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
  editButton.addEventListener('click', () => {
    for (const [index, key] of ['fullName','nationalId','phone'].entries()) {
      editForm.elements[key].value = verifiedIdentity[index];
    }
    identityEditor.showModal();
  });
  view.querySelector('#bank-edit-cancel').addEventListener('click', () => identityEditor.close());
  identityEditor.addEventListener('close', () => editForm.reset());
  editForm.addEventListener('submit', event => {
    event.preventDefault();
    showModal('身分資料未變更','若需更正已驗證的身分資料，請聯繫客服人員協助。',[
      ['返回編輯', () => document.querySelector('#modalWrap').close()],
      ['聯繫客服', () => {
        identityEditor.close();
        document.querySelector('#modalWrap').close();
        view.querySelector('#bind-bank .bind-overseas button').click();
      }]
    ]);
  });
  function openBindingForm() {
    resetBankForm();
    list.hidden = true;
    flow.hidden = false;
    bankForm.hidden = false;
    const verified = bankAccounts.some(account => account.verified);
    identityFields.forEach((field,index) => {
      field.readOnly = verified;
      if (verified) field.value = verifiedIdentity[index];
    });
    editButton.hidden = !verified;
    view.querySelector('#bank-identity-verified').hidden = !verified;
    const panel = panels.find(item => item.dataset.bindPanel === kind);
    for (const item of panels) item.disabled = item.hidden = item !== panel;
    if (kind === 'store' && selectedChannel) {
      if (selectedChannel.value.startsWith('711')) store.value = '711';
      if (selectedChannel.value.startsWith('全家')) store.value = 'family';
    }
    submit.textContent = kind === 'bank' ? '送出認證' : kind === 'usdt' ? '確認新增' : '確定';
    (verified ? panel.querySelector('input:not([type="file"]):not([readonly]),select') : bankName).focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
  bankAdd.addEventListener('click', openBindingForm);
  add.addEventListener('click', openBindingForm);
  const address = view.querySelector('#bind-wallet-address');
  const addressHint = view.querySelector('#wallet-address-hint');
  address.addEventListener('focus', () => { addressHint.hidden = false; });
  address.addEventListener('blur', () => { addressHint.hidden = true; });

  view.querySelector('#bind-back').addEventListener('click', () => {
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

  for (const field of [bankName, bankId]) field.addEventListener('input', () => field.setCustomValidity(''));
  for (const fileInput of bankFiles) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      const accepted = ['image/jpeg','image/png','image/webp'];
      const valid = !file || accepted.includes(file.type);
      fileInput.setCustomValidity(valid ? '' : '請選擇 JPG、PNG 或 WebP 圖片。');
      clearPreview(fileInput);
      if (valid && file) {
        const image = fileInput.closest('.bank-upload').querySelector('img');
        const url = URL.createObjectURL(file);
        previews.set(fileInput, {image,url});
        image.src = url;
        image.hidden = false;
        image.decode().catch(() => {
          if (previews.get(fileInput)?.url !== url) return;
          clearPreview(fileInput);
          fileInput.setCustomValidity('無法讀取這張圖片，請重新選擇。');
          fileInput.reportValidity();
        });
      }

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
    const fields = bankForm.elements;
    if (kind === 'bank') {
      bankAccounts.unshift({bank:bankCodeDirectory[fields.bank.value].name, suffix:fields.account.value.slice(-5), verified:false, date:new Date()});
    } else {
      const summaries = {
        usdt: () => [fields.walletName.value.trim(), '••••• ' + fields.walletAddress.value.slice(-5), '示範完成'],
        store: () => [store.selectedOptions[0].textContent, fields.storeCode.value, '示範完成'],
        credit: () => ['示範信用卡', '••••• ' + fields.creditNumber.value.slice(-5), '示範完成'],
      };
      completed.set(kind,summaries[kind]());
    }
    showList(kind);
    notice.textContent = kind === 'bank' ? '示範認證已送出，可在清單查看待審核狀態。' : '示範綁定完成。';
    (kind === 'bank' ? bankAdd : add).focus();
  });
  for (const link of view.querySelectorAll('[data-store-link]')) {
    link.addEventListener('click', () => { store.value = link.dataset.storeLink; });
  }
  const directory = view.querySelector('#bank-code-dialog');
  const search = view.querySelector('#bank-code-search');
  const results = view.querySelector('#bank-code-rows');
  const count = view.querySelector('#bank-code-count');
  const more = view.querySelector('#bank-code-more');
  const directoryRows = [];
  for (const [code, bank] of Object.entries(bankCodeDirectory).sort()) {
    bankForm.elements.bank.add(new Option(code + ' ' + bank.name, code));
    for (const [branch, name] of bank.branches) directoryRows.push({code, bank:bank.name, branch, name});
  }
  let matches = [];
  let shown = 0;

  function showDirectoryRows() {
    const batch = matches.slice(shown, shown + 100);
    for (const record of batch) {
      const row = results.insertRow();
      row.insertCell().textContent = record.code + ' ' + record.bank;
      row.insertCell().textContent = record.name;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'outline-gold';
      button.textContent = record.branch;
      button.addEventListener('click', () => {
        bankForm.elements.bank.value = record.code;
        bankForm.elements.branch.value = record.branch;
        directory.close();
      });
      row.insertCell().append(button);
    }
    shown += batch.length;
    count.textContent = `共 ${matches.length.toLocaleString()} 筆分行或分支資料，已顯示 ${shown.toLocaleString()} 筆。點代碼帶入表單。`;
    more.hidden = shown >= matches.length;
  }

  function filterDirectory() {
    const query = search.value.trim().replaceAll('台','臺').toLowerCase();
    matches = directoryRows.filter(row =>
      [row.code,row.bank,row.branch,row.name].some(value => value.replaceAll('台','臺').toLowerCase().includes(query))
    );
    shown = 0;
    results.replaceChildren();
    showDirectoryRows();
  }

  view.querySelector('#bind-branch').addEventListener('click', () => {
    search.value = bankForm.elements.bank.value;
    filterDirectory();
    directory.showModal();
    search.focus();
  });
  search.addEventListener('input', filterDirectory);
  more.addEventListener('click', showDirectoryRows);
  syncEntry();
  syncRoute();
})();
