const depositForm = document.querySelector('#depositForm');
const depositAmount = document.querySelector('#depositAmount');
const amountFormat = new Intl.NumberFormat('zh-TW');

document.querySelector('.mobile-bottom [data-action="deposit"]').setAttribute('aria-current', 'page');

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
  const fields = new FormData(depositForm);
  showModal('儲值資料確認', `${fields.get('channel')} · NT$ ${amountFormat.format(depositAmount.valueAsNumber)}。此為原型預覽，尚未串接金流。`);
});

for (const button of document.querySelectorAll('[data-account-label]')) {
  button.addEventListener('click', () => {
    showModal(button.dataset.accountLabel, '此功能待正式串接。');
  });
}
