const depositForm = document.querySelector('#depositForm');
const depositAmount = document.querySelector('#depositAmount');
const amountFields = document.querySelector('#depositAmountFields');
const unboundPanel = document.querySelector('#depositUnbound');
const depositView = document.querySelector('#depositView');
const bindingView = document.querySelector('#depositBindingView');
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

function updateAccountView(focusHeading) {
  const binding = location.hash === '#bind-bank-card';
  depositView.hidden = binding;
  bindingView.hidden = !binding;
  for (const link of document.querySelectorAll('.deposit-layout nav [data-deposit-view]')) {
    if (link.dataset.depositView === (binding ? 'binding' : 'deposit')) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
  if (focusHeading) {
    document.querySelector('.deposit-mobile-menu').open = false;
    const heading = (binding ? bindingView : depositView).querySelector('h1');
    heading.focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
}

window.addEventListener('hashchange', () => updateAccountView(true));
updateAccountView(false);
