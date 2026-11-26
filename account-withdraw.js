(() => {
  const view = document.querySelector('#withdrawView');
  const form = view.querySelector('#withdraw-form');
  const amount = view.querySelector('#withdraw-amount');
  const error = view.querySelector('#withdraw-amount-error');
  const summary = view.querySelector('#withdraw-confirm');
  const submit = view.querySelector('#withdraw-submit');
  const turnover = view.querySelector('#withdraw-turnover');
  const rate = view.querySelector('#withdraw-rate');
  const destination = view.querySelector('#withdraw-destination');
  const destinationLabel = view.querySelector('#withdraw-destination-label');
  const methods = view.querySelectorAll('[data-withdraw-method]');
  const wallet = document.querySelector('#walletBtn .wallet-amount');
  const remainingTurnover = 2500;
  const demoUsdtRate = 32;
  const format = new Intl.NumberFormat('zh-TW');
  let method = 'bank';

  function refreshAmount() {
    const value = amount.valueAsNumber;
    let message = '';
    if (amount.validity.rangeUnderflow) message = '託售點數至少需 1,000 點。';
    else if (amount.validity.rangeOverflow) message = '託售點數上限為 100,000 點。';
    else if (amount.validity.stepMismatch) message = '請輸入 100 的倍數。';
    error.textContent = message;
    error.hidden = !message;
    if (message) amount.setAttribute('aria-invalid','true');
    else amount.removeAttribute('aria-invalid');
    summary.textContent = amount.validity.valid
      ? method === 'bank' ? format.format(value) + ' 點' : format.format(value / demoUsdtRate) + ' USDT'
      : '—';
    submit.disabled = remainingTurnover > 0 || !form.checkValidity();
  }

  function setMethod(nextMethod) {
    method = nextMethod;
    const bank = method === 'bank';
    for (const button of methods) button.setAttribute('aria-pressed',String(button.dataset.withdrawMethod === method));
    rate.hidden = bank;
    destinationLabel.firstChild.textContent = bank ? '銀行帳戶 ' : 'USDT 錢包 ';
    destination.replaceChildren(new Option(bank ? '請選擇銀行帳戶' : '請先綁定 USDT 錢包',''));
    if (bank) destination.add(new Option('示範銀行 A（末五碼 12345）','demo-bank'));
    refreshAmount();
  }

  view.querySelector('#withdraw-wallet').textContent = wallet.textContent.trim();
  turnover.textContent = remainingTurnover > 0
    ? '流水未達標，還差 ' + format.format(remainingTurnover) + ' 點'
    : '流水已達標';
  for (const button of methods) button.addEventListener('click', () => setMethod(button.dataset.withdrawMethod));
  form.addEventListener('input', refreshAmount);
  form.addEventListener('reset', () => requestAnimationFrame(refreshAmount));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (remainingTurnover > 0 || !form.reportValidity()) return;
    showModal('託售確認','此為示範流程，未送出正式託售申請。');
  });
  setMethod('bank');
})();
