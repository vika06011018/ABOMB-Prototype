(() => {
  const view = document.querySelector('#withdrawView');
  const get = id => view.querySelector('#withdraw-' + id);
  const form = get('form');
  const amount = get('amount');
  const error = get('amount-error');
  const submit = get('submit');
  const destination = get('destination');
  const methods = view.querySelectorAll('[data-withdraw-method]');
  const remainingTurnover = 0; // Eligible sample so the prototype can demonstrate confirmation.
  const demoUsdtRate = 33.65;
  const paidFee = 30;
  const minAmount = 1000;
  const maxAmount = 100000;
  const amountStep = 100;
  const memberTier = vipProgram.levels[0];
  const benefits = vipProgram.groups.find(group => group.title === '提領權益').rows;
  const freeByTier = benefits.find(row => row[0] === '每日免費提領次數');
  const freeLimit = Number.parseInt(freeByTier[vipProgram.levels.indexOf(memberTier) + 1],10) || 0;
  // Prototype policy until the platform supplies its separate daily total limit.
  const totalLimit = Math.max(1,freeLimit);
  const quotaKey = 'bomb-demo-withdraw-quota-demo001';
  const calendar = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei', dateStyle:'short'});
  const format = new Intl.NumberFormat('zh-TW');
  let usage = null;
  let method = 'bank';

  function currentUsage() {
    const today = calendar.format(new Date());
    try {
      const saved = JSON.parse(localStorage.getItem(quotaKey));
      if (saved?.day === today) return saved;
    } catch {}
    return usage?.day === today ? usage : {day:today, used:0, freeUsed:0};
  }

  function feeFor(current) {
    return current.freeUsed < freeLimit ? 0 : paidFee;
  }

  function formatAmountInput() {
    const raw = amount.value.replaceAll(',', '');
    if (!/^\d+$/.test(raw)) return;
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (formatted === amount.value) return;

    const digitsBeforeCaret = amount.value.slice(0, amount.selectionStart).replaceAll(',', '').length;
    let caret = 0;
    let digitsSeen = 0;
    while (digitsSeen < digitsBeforeCaret) {
      if (formatted[caret] !== ',') digitsSeen += 1;
      caret += 1;
    }
    amount.value = formatted;
    amount.setSelectionRange(caret, caret);
  }

  function refreshAmount() {
    const current = currentUsage();
    const fee = feeFor(current);
    get('used').textContent = current.used + '/' + totalLimit;
    get('free').textContent = current.freeUsed + '/' + freeLimit;
    get('fee-value').textContent = format.format(fee) + ' 點';
    const raw = amount.value.replaceAll(',', '');
    const value = Number(raw);
    let message = '';
    if (amount.value) {
      if (!/^\d+$/.test(raw)) message = '請輸入有效的提領點數。';
      else if (value < minAmount) message = '提領點數至少需 ' + format.format(minAmount) + ' 點。';
      else if (value > maxAmount) message = '提領點數上限為 ' + format.format(maxAmount) + ' 點。';
      else if (value % amountStep !== 0) message = '請輸入 ' + format.format(amountStep) + ' 的倍數。';
    }
    amount.setCustomValidity(message);
    error.textContent = message;
    error.hidden = !message;
    if (message) amount.setAttribute('aria-invalid','true');
    else amount.removeAttribute('aria-invalid');
    get('confirm').textContent = amount.validity.valid
      ? method === 'bank'
        ? format.format(Math.max(0,value - fee)) + ' 點'
        : format.format(value / demoUsdtRate) + ' USDT'
      : '—';
    submit.disabled = remainingTurnover > 0 || current.used >= totalLimit || !form.checkValidity();
  }

  function setMethod(nextMethod) {
    method = nextMethod;
    const bank = method === 'bank';
    for (const button of methods) button.setAttribute('aria-pressed',String(button.dataset.withdrawMethod === method));
    get('rate').hidden = bank;
    get('fee').hidden = !bank;
    get('u-note').hidden = bank;
    get('confirm-label').textContent = bank ? '實際提領' : 'U 實際提領';
    get('destination-label').firstChild.textContent = bank ? '銀行帳戶 ' : 'USDT 錢包 ';
    destination.replaceChildren(new Option(bank ? '請選擇銀行帳戶' : '請選擇 USDT 錢包',''));
    destination.add(bank
      ? new Option(demoVerifiedBankAccount.bank + '｜' + demoVerifiedBankAccount.number,'demo-bank')
      : new Option('示範 USDT 錢包（TRC20）','demo-usdt'));
    refreshAmount();
  }

  for (const button of methods) button.addEventListener('click', () => setMethod(button.dataset.withdrawMethod));
  amount.addEventListener('input', formatAmountInput);
  form.addEventListener('input', refreshAmount);
  form.addEventListener('change', refreshAmount);
  form.addEventListener('reset', () => requestAnimationFrame(refreshAmount));
  window.addEventListener('pageshow', refreshAmount);
  window.addEventListener('storage', event => {
    if (event.key === quotaKey) refreshAmount();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const current = currentUsage();
    if (remainingTurnover > 0 || current.used >= totalLimit || !form.reportValidity()) return;
    usage = {day:current.day, used:current.used + 1, freeUsed:current.freeUsed + Number(current.freeUsed < freeLimit)};
    try { localStorage.setItem(quotaKey,JSON.stringify(usage)); } catch {}
    refreshAmount();
    showModal('提領確認','示範提領已受理，本次未送出正式提領申請。');
  });
  setMethod('bank');
})();
