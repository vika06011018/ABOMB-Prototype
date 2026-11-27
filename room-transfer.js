const roomTransfer = (() => {
  const key = 'bomb-demo-room-balances';
  const format = new Intl.NumberFormat('zh-TW');
  const initial = { wallet: 1000000, rooms: {} };
  let fallback = initial;
  const read = () => readPreference(key, fallback, value =>
    Number.isSafeInteger(value?.wallet) && value.wallet >= 0 && value.rooms &&
    Object.values(value.rooms).every(points => Number.isSafeInteger(points) && points >= 0));
  const pointsAt = (state, room) => Object.hasOwn(state.rooms, room) ? state.rooms[room] : 0;
  function save(state) {
    fallback = state;
    savePreference(key, state);
    window.dispatchEvent(new Event('bomb-room-balances'));
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'room-transfer';
  dialog.setAttribute('aria-labelledby', 'room-transfer-title');
  dialog.innerHTML = `
    <header><h2 id="room-transfer-title"></h2><button type="button" data-close aria-label="關閉">×</button></header>
    <form>
      <div class="room-transfer-direction">
        <div>轉出<strong data-from></strong><output data-available></output></div>
        <span aria-hidden="true">→</span>
        <div>轉入<strong data-to></strong><output data-destination></output></div>
      </div>
      <div class="room-transfer-amount">
        <input type="text" inputmode="numeric" aria-label="轉點金額" placeholder="請輸入轉帳金額">
        <button type="button" data-all>全額轉點</button>
      </div>
      <p role="status" data-status></p>
      <footer><button type="submit" data-confirm>確認轉點</button><button type="button" data-enter>進入遊戲</button></footer>
      <button type="button" data-favorite hidden></button>
    </form>`;
  document.body.append(dialog);
  const field = selector => dialog.querySelector(selector);
  const input = field('input');
  const status = field('[data-status]');
  let room, isReturn, favorite;

  function update() {
    const state = read();
    const balance = pointsAt(state, room);
    field('[data-available]').textContent = format.format(isReturn ? balance : state.wallet);
    field('[data-destination]').textContent = format.format(isReturn ? state.wallet : balance);
  }

  function open(name, returning = false, favoriteAction) {
    room = name;
    isReturn = returning;
    favorite = favoriteAction;
    field('h2').textContent = returning ? '轉回主錢包' : '快速轉點';
    field('[data-from]').textContent = returning ? room : '主錢包';
    field('[data-to]').textContent = returning ? '主錢包' : room;
    field('[data-enter]').hidden = returning;
    field('[data-favorite]').hidden = !favorite;
    field('[data-favorite]').textContent = favorite?.label ?? '';
    status.textContent = '';
    input.value = '';
    update();
    if (!dialog.open) dialog.showModal();
    input.focus();
  }

  field('[data-close]').addEventListener('click', () => dialog.close());
  field('[data-all]').addEventListener('click', () => {
    const state = read();
    input.value = format.format(isReturn ? pointsAt(state, room) : state.wallet);
    status.textContent = '';
  });
  input.addEventListener('input', () => { status.textContent = ''; });
  function showEntryPreview(message = '') {
    dialog.close();
    showModal(room, message + '遊戲入口預覽，正式遊戲房網址待提供。');
  }

  field('[data-enter]').addEventListener('click', () => {
    if (input.value.trim()) {
      field('form').requestSubmit();
      return;
    }
    if (pointsAt(read(), room) > 0) {
      showEntryPreview();
      return;
    }
    status.textContent = '請先輸入要轉入遊戲房的點數。';
    input.focus();
  });
  field('[data-favorite]').addEventListener('click', () => favorite?.run());
  field('form').addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.replaceAll(',', '').trim();
    const amount = Number(raw);
    const state = read();
    const balance = pointsAt(state, room);
    const available = isReturn ? balance : state.wallet;
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(amount) || amount <= 0) {
      status.textContent = '請輸入大於 0 的整數點數。';
      return;
    }
    if (amount > available) {
      status.textContent = '可轉出的點數不足。';
      update();
      return;
    }
    const delta = isReturn ? -amount : amount;
    save({ wallet: state.wallet - delta, rooms: { ...state.rooms, [room]: balance + delta } });
    input.value = '';
    update();
    const points = format.format(amount) + ' 點。';
    if (isReturn) status.textContent = '已轉回主錢包 ' + points;
    else showEntryPreview('已轉入 ' + points);
  });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    if (dialog.open) update();
    window.dispatchEvent(new Event('bomb-room-balances'));
  });
  function refreshWallet() {
    const label = '$ ' + format.format(read().wallet) + '.00';
    for (const element of document.querySelectorAll('[data-room-wallet]')) {
      element.textContent = label;
    }
  }
  window.addEventListener('bomb-room-balances', refreshWallet);
  window.addEventListener('pageshow', refreshWallet);
  refreshWallet();

  function returnAll() {
    const state = read();
    const total = Object.values(state.rooms).reduce((sum, points) => sum + points, 0);
    if (total) save({ wallet: state.wallet + total, rooms: {} });
    return total;
  }
  return {
    open,
    wallet: () => read().wallet,
    balance: name => pointsAt(read(), name),
    activeRooms: () => Object.keys(read().rooms).filter(name => pointsAt(read(), name) > 0),
    returnAll,
    format: points => format.format(points)
  };
})();
