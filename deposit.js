const depositForm = document.querySelector('#depositForm');
const depositAmount = document.querySelector('#depositAmount');
const amountFields = document.querySelector('#depositAmountFields');
const unboundPanel = document.querySelector('#depositUnbound');
const depositView = document.querySelector('#depositView');
const bindingView = document.querySelector('#depositBindingView');
const amountFormat = new Intl.NumberFormat('zh-TW');

for (const button of depositForm.querySelectorAll('[data-add]')) {
  button.addEventListener('click', () => {
    depositAmount.value = (depositAmount.valueAsNumber || 0) + Number(button.dataset.add);
    depositAmount.focus();
  });
}

document.querySelector('#depositClear').addEventListener('click', () => {
  depositAmount.value = '';
  depositAmount.focus();
});

depositForm.addEventListener('submit', event => {
  event.preventDefault();
  if (amountFields.disabled) return;
  const fields = new FormData(depositForm);
  showModal('儲值資料確認', `${fields.get('channel')} · NT$ ${amountFormat.format(depositAmount.valueAsNumber)}。此為原型預覽，尚未串接金流。`);
});

for (const button of document.querySelectorAll('[data-account-label]')) {
  button.addEventListener('click', () => {
    showModal(button.dataset.accountLabel, '此功能待正式串接。');
  });
}

function updateChannel() {
  const requiresBinding = Boolean(depositForm.querySelector('[name="channel"]:checked[data-binding-required]'));
  amountFields.hidden = requiresBinding;
  amountFields.disabled = requiresBinding;
  unboundPanel.hidden = !requiresBinding;
}

depositForm.addEventListener('change', updateChannel);
depositForm.addEventListener('reset', () => requestAnimationFrame(updateChannel));
window.addEventListener('pageshow', updateChannel);
updateChannel();


const accountViews = {
  '#deposit-title': [depositView, 'deposit', '儲值'],
  '#bind-bank-card': [bindingView, 'binding', '綁定銀行卡'],
  '#transfer': [document.querySelector('#transferView'), 'transfer', '轉點'],
  '#withdraw': [document.querySelector('#withdrawView'), 'withdraw', '託售'],
  '#announcements': [document.querySelector('#announcementsView'), 'announcements', ''],
  '#messages': [document.querySelector('#messagesView'), 'messages', ''],
  '#referral': [document.querySelector('#referralView'), 'referral', ''],
  '#personal-center': [document.querySelector('#personalView'), 'personal', ''],
};
const accountMenu = document.querySelector('.deposit-mobile-menu');
const menuSummary = document.querySelector('#accountMenuSummary');
const accountLinks = document.querySelectorAll('.deposit-layout nav [data-deposit-view]');
const dock = document.querySelector('.mobile-bottom');
const depositTab = dock.querySelector('[data-action="deposit"]');
const memberTab = dock.querySelector('[data-action="personal"]');

function updateAccountView(focusHeading) {
  const [view, key, label] = accountViews[location.hash.split('?')[0]] ?? accountViews['#deposit-title'];
  for (const [panel] of Object.values(accountViews)) panel.hidden = panel !== view;
  for (const link of accountLinks) {
    if (link.dataset.depositView === key) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const personal = ['personal','announcements','messages','referral'].includes(key);
  accountMenu.hidden = personal;
  menuSummary.textContent = label ? `帳務中心 · ${label}` : '帳務中心';
  memberTab.classList.toggle('active', personal);
  depositTab.removeAttribute('aria-current');
  memberTab.removeAttribute('aria-current');
  (personal ? memberTab : depositTab).setAttribute('aria-current', 'page');
  if (focusHeading) {
    accountMenu.open = false;
    view.querySelector('h1').focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
}

window.addEventListener('hashchange', () => updateAccountView(true));
updateAccountView(false);

const transferStatus = document.querySelector('#transferStatus');
document.querySelector('[data-transfer-action="refresh"]').addEventListener('click', () => {
  transferStatus.hidden = false;
  transferStatus.textContent = '館別餘額已重新顯示（示範資料）。';
});
document.querySelector('[data-transfer-action="return"]').addEventListener('click', () => {
  transferStatus.hidden = false;
  transferStatus.textContent = '目前沒有可轉回的示範點數。';
});
