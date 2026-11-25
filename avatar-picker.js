(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'avatar-dialog';
  dialog.setAttribute('aria-labelledby', 'avatar-picker-title');
  dialog.innerHTML = `<form>
    <h2 id="avatar-picker-title">更換頭像</h2>
    <fieldset class="avatar-options" aria-label="選擇頭像"></fieldset>
    <div class="avatar-dialog-actions">
      <button type="button" class="outline-gold" data-avatar-cancel>取消</button>
      <button class="goldbtn" type="submit">確認更換</button>
    </div>
  </form>`;
  const gallery = dialog.querySelector('.avatar-options');
  const choices = [null, ...memberAvatar.options.keys()];
  for (const choice of choices) {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'avatar';
    radio.value = String(choice);
    const portrait = document.createElement('img');
    portrait.src = memberAvatar.url(choice);
    portrait.alt = '';
    const caption = document.createElement('span');
    caption.textContent = choice === null ? '預設頭像' : memberAvatar.options[choice];
    label.append(radio, portrait, caption);
    gallery.append(label);
  }
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  for (const button of document.querySelectorAll('[data-avatar-picker]')) {
    button.addEventListener('click', () => {
      form.elements.avatar.value = String(memberAvatar.selected);
      dialog.showModal();
    });
  }
  dialog.querySelector('[data-avatar-cancel]').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    memberAvatar.save(JSON.parse(form.elements.avatar.value));
    dialog.close();
  });
})();
