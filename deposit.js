const depositForm = document.querySelector('#depositForm');
const depositAmount = document.querySelector('#depositAmount');
const amountFields = document.querySelector('#depositAmountFields');
const unboundPanel = document.querySelector('#depositUnbound');
const depositView = document.querySelector('#depositView');
const bindingView = document.querySelector('#depositBindingView');
const amountFormat = new Intl.NumberFormat('zh-TW');
const unboundLimit = unboundPanel.querySelector('[data-deposit-limit]');
const depositAmountError = document.querySelector('#deposit-input-error');

function refreshDepositAmount() {
  const {rangeUnderflow,rangeOverflow} = depositAmount.validity;
  const error = rangeUnderflow ? '儲值金額最低為 NT$ ' + amountFormat.format(Number(depositAmount.min))
    : rangeOverflow ? '儲值金額最高為 NT$ ' + amountFormat.format(Number(depositAmount.max)) : '';
  depositAmountError.textContent = error;
  depositAmountError.hidden = !error;
  if (error) depositAmount.setAttribute('aria-invalid','true');
  else depositAmount.removeAttribute('aria-invalid');
}
depositAmount.addEventListener('input', refreshDepositAmount);

for (const button of depositForm.querySelectorAll('[data-add]')) {
  button.addEventListener('click', () => {
    depositAmount.value = (depositAmount.valueAsNumber || 0) + Number(button.dataset.add);
    refreshDepositAmount();
    depositAmount.focus();
  });
}

document.querySelector('#depositClear').addEventListener('click', () => {
  depositAmount.value = '';
  refreshDepositAmount();
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
  const channel = depositForm.querySelector('[name="channel"]:checked');
  const requiresBinding = Boolean(channel?.hasAttribute('data-binding-required'));
  if (channel) {
    depositAmount.min = channel.dataset.min;
    depositAmount.max = channel.dataset.max;
    const min = amountFormat.format(Number(channel.dataset.min));
    const max = amountFormat.format(Number(channel.dataset.max));
    depositAmount.placeholder = min + ' ～ ' + max;
    unboundLimit.textContent = '本通道儲值金額 NT$ ' + min + ' ～ ' + max;
  }
  amountFields.hidden = requiresBinding;
  amountFields.disabled = requiresBinding;
  unboundPanel.hidden = !requiresBinding;
  refreshDepositAmount();
}

depositForm.addEventListener('change', updateChannel);
depositForm.addEventListener('reset', () => requestAnimationFrame(updateChannel));
window.addEventListener('pageshow', updateChannel);
updateChannel();


const accountViews = {
  '#deposit-title': [depositView, 'deposit'],
  '#bind-bank-card': [bindingView, 'binding'],
  '#transfer': [document.querySelector('#transferView'), 'transfer'],
  '#withdraw': [document.querySelector('#withdrawView'), 'withdraw'],
  '#announcements': [document.querySelector('#announcementsView'), 'announcements'],
  '#messages': [document.querySelector('#messagesView'), 'messages'],
  '#referral': [document.querySelector('#referralView'), 'referral'],
  '#personal-center': [document.querySelector('#personalView'), 'personal'],
};
const accountMenu = document.querySelector('.deposit-mobile-menu');
const accountLinks = document.querySelectorAll('.deposit-layout nav [data-deposit-view]');
const dock = document.querySelector('.mobile-bottom');
const depositTab = dock.querySelector('[data-action="deposit"]');
const memberTab = dock.querySelector('[data-action="personal"]');

function updateAccountView(focusHeading) {
  const [view, key] = accountViews[location.hash.split('?')[0]] ?? accountViews['#deposit-title'];
  for (const [panel] of Object.values(accountViews)) panel.hidden = panel !== view;
  for (const link of accountLinks) {
    if (link.dataset.depositView === key) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const personal = ['personal','announcements','messages','referral'].includes(key);
  accountMenu.hidden = personal;
  const profileTab = new URLSearchParams(location.hash.split('?')[1]).get('tab');
  document.querySelector('#personalView').classList.toggle('profile-is-open', key === 'personal' && Boolean(profileTab));
  memberTab.classList.toggle('active', personal);
  depositTab.removeAttribute('aria-current');
  memberTab.removeAttribute('aria-current');
  (personal ? memberTab : depositTab).setAttribute('aria-current', 'page');
  if (focusHeading) {
    view.querySelector('h1').focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
}

function openGuildPromotion() {
  document.querySelector('[data-account-label="公會推廣"]').click();
}

window.addEventListener('hashchange', event => {
  if (location.hash === '#guild-promotion') {
    history.replaceState(history.state, '', new URL(event.oldURL).hash || '#deposit-title');
    openGuildPromotion();
    return;
  }
  updateAccountView(true);
});
updateAccountView(false);
if (location.hash === '#guild-promotion') {
  history.replaceState(history.state, '', '#deposit-title');
  openGuildPromotion();
}

const transferStatus = document.querySelector('#transferStatus');
const transferGrid = document.querySelector('.transfer-grid');
const roomCards = new Map();

function addRoomReturn(card, name) {
  const balance = card.querySelector('span');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'outline-gold';
  button.dataset.roomReturn = name;
  button.textContent = '轉回';
  button.setAttribute('aria-label', '從' + name + '轉回點數');
  card.append(button);
  roomCards.set(name, {balance, button});
}

for (const card of transferGrid.children) {
  addRoomReturn(card, card.querySelector('strong').textContent);
}

function refreshTransferRooms() {
  for (const name of roomTransfer.activeRooms()) {
    if (roomCards.has(name)) continue;
    const card = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = name;
    card.append(title, document.createElement('span'));
    transferGrid.append(card);
    addRoomReturn(card, name);
  }
  for (const [name, {balance, button}] of roomCards) {
    const points = roomTransfer.balance(name);
    balance.textContent = roomTransfer.format(points) + ' 點';
    button.disabled = points === 0;
  }
}

transferGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-room-return]');
  if (button) roomTransfer.open(button.dataset.roomReturn, true);
});
function showTransferStatus(message) {
  transferStatus.hidden = false;
  transferStatus.textContent = message;
}
document.querySelector('[data-transfer-action="refresh"]').addEventListener('click', () => {
  refreshTransferRooms();
  showTransferStatus('已更新館別餘額。');
});
document.querySelector('[data-transfer-action="return"]').addEventListener('click', () => {
  const points = roomTransfer.returnAll();
  showTransferStatus(points ? '已轉回主錢包 ' + roomTransfer.format(points) + ' 點。' : '目前沒有可轉回的點數。');
});
window.addEventListener('bomb-room-balances', refreshTransferRooms);
window.addEventListener('pageshow', refreshTransferRooms);
refreshTransferRooms();
