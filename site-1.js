const originalFeaturedArt = {
  baccarat: "assets/desktop-exclusive-baccarat.webp"
};

'use strict';

const $ = (selector) => document.querySelector(selector);
const games = [
  ['baccarat', 'Bomb 真人百家', '今天 14:26', '視訊'],
  ['pachinko', '小丑2', '今天 12:03', '電子'],
  ['fish', '黃金捕魚', '昨天 22:37', '捕魚'],
  ['slots', '經典老虎機', '昨天 19:15', '電子'],
  ['sports', '足球', '昨天 16:40', '體育'],
  ['lottery', '六合彩', '01/10 23:06', '彩票'],
  ['mahjong', '正宗十六張麻將', '01/10 20:48', '棋牌'],
  ['poker', '德州撲克', '01/09 21:32', '棋牌'],
  ['shark', '電子捕魚', '01/09 18:17', '捕魚'],
  ['thor', '雷神之鎚', '', '電子'],
  ['seth', '戰神賽特', '', '電子']
].map(([id, name, time, category]) => ({id, name, time, category}));

function readPreference(key, fallback, validate) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private or file browsing may disable storage. */ }
}

const favoritesKey = 'bomb-demo-favorites-featured-six';
const homeGameIds = ['thor','seth','mahjong','sports','baccarat','pachinko'];
let favorites = [...new Set(readPreference(favoritesKey, homeGameIds, Array.isArray))]
  .filter((id) => games.some((game) => game.id === id));

const labels = [
  '首頁', '視訊', '電子', '彩票', '棋牌', '捕魚', '體育', '優惠',
  '全部遊戲', '儲值', '優惠活動', '會員中心', '平台獨家', '玩過', '收藏',
  '推薦好友', '查看更多', '立即遊戲', '快速進入', '查看詳情', '最近遊玩', '關閉'
];

const languages = {
  '繁中': ['zh-Hant', labels],
  '简中': ['zh-Hans', ['首页','视讯','电子','彩票','棋牌','捕鱼','体育','优惠','全部游戏','充值','优惠活动','会员中心','平台独家','玩过','我的最爱','推荐好友','查看更多','立即游戏','快速进入','查看详情','最近游玩','关闭']],
  EN: ['en', ['Home','Live','Slots','Lottery','Cards','Fishing','Sports','Offers','All games','Deposit','Offers','Account','Exclusives','Recent','Favorites','Refer friends','See more','Play now','Play','Details','Last played','Close']],
  VI: ['vi', ['Trang chủ','Trực tiếp','Slot','Xổ số','Bài','Câu cá','Thể thao','Ưu đãi','Tất cả','Nạp tiền','Ưu đãi','Tài khoản','Độc quyền','Đã chơi','Yêu thích','Mời bạn','Xem thêm','Chơi ngay','Vào chơi','Chi tiết','Chơi gần đây','Đóng']],
  '日本語': ['ja', ['ホーム','ライブ','スロット','宝くじ','カード','釣り','スポーツ','特典','全ゲーム','入金','特典','会員','限定','プレイ履歴','お気に入り','友達紹介','もっと見る','今すぐ遊ぶ','プレイ','詳細','最終プレイ','閉じる']],
  'ไทย': ['th', ['หน้าหลัก','สด','สล็อต','ลอตเตอรี่','ไพ่','ตกปลา','กีฬา','โปรโมชัน','เกมทั้งหมด','ฝากเงิน','โปรโมชัน','บัญชี','เกมพิเศษ','เล่นล่าสุด','เกมโปรด','ชวนเพื่อน','ดูเพิ่ม','เล่นเลย','เข้าเกม','รายละเอียด','เล่นล่าสุด','ปิด']]
};

const textNodes = [];
const labelPattern = /^(\s*)([^›]+?)(\s*›?\s*)$/;
document.querySelectorAll('.primary-menu button,.mobile-bottom button,.mobile-bottom strong,.deposit-mini,.section-heading,.section-link,.feature .goldbtn,.referral-copy .goldbtn,#modalClose').forEach((element) => {
  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const match = node.textContent.match(labelPattern);
    if (match && labels.includes(match[2])) textNodes.push({node, match});
  }
});
let locale = readPreference('bomb-home-language', '繁中', (value) => Object.hasOwn(languages, value));
function translate(label) {
  return languages[locale][1][labels.indexOf(label)] ?? label;
}

function homeProvider(game) {
  if (game.id === 'baccarat' || game.id === 'pachinko') {
    return {name:'BOMB', logo:`assets/catalog/logo-${game.id === 'baccarat' ? 0 : 1}.webp`};
  }
  if (game.id === 'seth') return {name:'ATG', logo:'assets/provider-marks/atg-official.png'};
  const providers = {
    thor: ['RSG', 'rsg-official.svg'],
    mahjong: ['高登棋牌', 'provider-20.png'],
    sports: ['SUPER 體育', 'super-official.png']
  };
  const mark = providers[game.id];
  return mark ? {name:mark[0], logo:`assets/provider-marks/${mark[1]}`} : null;
}

const recentProviders = [
  {id:'thor', title:'RSG 電子', art:'assets/desktop-lobby/1-0.webp', desktop:'slots', mobile:1},
  {id:'seth', title:'ATG 電子', art:'assets/lobby-banners/atg-warrior.webp', desktop:'slots', mobile:1},
  {id:'mahjong', title:'高登棋牌', art:'assets/desktop-lobby/3-1.webp', desktop:'table', mobile:3}
];

function openRecentProvider(provider) {
  demoMember.navigate(matchMedia('(min-width: 900px)').matches
    ? `desktop-games.html#games-${provider.desktop}`
    : `all-games.html#catalog-${provider.mobile}`);
}

function createCard(game, isFavorite, provider) {
  const title = provider?.title ?? game.name;
  const card = document.createElement('button');
  card.type = 'button';
  card.className = isFavorite ? 'favorite-card neon' : 'game-card neon';
  const action = isFavorite
    ? `<span class="goldbtn">${translate('快速進入')} ›</span>`
    : '<span class="play-dot" aria-hidden="true">▶</span>';
  const art = provider?.art ?? originalFeaturedArt[game.id] ?? `assets/home-games/${game.id}.webp`;
  const homeMark = homeProvider(game);
  card.innerHTML = `<picture><img class="game-art" src="${art}" alt=""></picture><span class="game-info"><strong>${homeMark ? `<img class="home-provider-image" src="${homeMark.logo}" alt="${homeMark.name}">` : ''}<span>${title}</span></strong></span>${action}`;
  if (isFavorite) {
    card.dataset.cover = game.id;
    card.style.setProperty('--cover', `url("${art}")`);
  }
  card.addEventListener('click', () => provider ? openRecentProvider(provider) : openGame(game));
  const wrap = document.createElement('div');
  wrap.className = 'home-card-wrap';
  const heart = document.createElement('button');
  heart.type = 'button';
  heart.className = 'home-heart';
  const saved = favorites.includes(game.id);
  heart.setAttribute('aria-pressed', String(saved));
  heart.setAttribute('aria-label', (saved ? '取消收藏 ' : '收藏 ') + title);
  heart.textContent = saved ? '♥' : '♡';
  heart.addEventListener('click', () => {
    favorites = saved ? favorites.filter(id => id !== game.id) : [game.id, ...favorites];
    savePreference(favoritesKey, favorites);
    renderRecent();
    renderFavorites();
  });
  const play = document.createElement('span');
  play.className = 'home-play';
  if (provider) {
    const desktopLabel = document.createElement('span');
    desktopLabel.className = 'home-play-desktop';
    desktopLabel.textContent = translate('立即遊戲');
    const mobileLabel = document.createElement('span');
    mobileLabel.className = 'home-play-mobile';
    mobileLabel.textContent = '前往館別';
    play.append(desktopLabel, mobileLabel);
  } else {
    play.textContent = translate('立即遊戲');
  }
  wrap.append(card, heart, play);
  return wrap;
}

function renderFavorites() {
  const grid = $('#favoriteGrid');
  if (!grid) return;
  grid.replaceChildren(...favorites.slice(0,6).map((id) => createCard(games.find((game) => game.id === id), true)));
  if (!favorites.length) {
    const text = document.createElement('p');
    text.textContent = '可從「玩過」加入收藏。';
    grid.append(text);
  }
}

function renderRecent() {
  const cards = recentProviders.map(provider => createCard(games.find(game => game.id === provider.id), false, provider));
  $('#recentGrid')?.replaceChildren(...cards);
}
function setLanguage(language) {
  locale = language;
  document.documentElement.lang = languages[locale][0];
  $('#languageLabel').textContent = locale;
  for (const {node, match} of textNodes) node.textContent = match[1] + translate(match[2]) + match[3];
  for (const button of $('#languageMenu').querySelectorAll('button')) {
    const selected = button.dataset.lang === locale;
    button.setAttribute('aria-pressed', String(selected));
    if (selected) $('#languageFlag').src = button.querySelector('.language-flag').src;
  }
  renderRecent();
  renderFavorites();
  savePreference('bomb-home-language', locale);
}

const modal = $('#modalWrap');
const closeButton = $('#modalClose');
const secondary = $('#modalSecondary');
let onSecondary;
let returnFocus;

function showModal(title, message, items = [], secondaryAction) {
  $('#modalTitle').textContent = title;
  $('#modalText').textContent = message;
  const list = document.createElement('div');
  list.className = 'modal-content-list';
  for (const [label, action] of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action);
    list.append(button);
  }
  $('#modalContent').replaceChildren(list);
  secondary.hidden = !secondaryAction;
  secondary.textContent = secondaryAction?.label ?? '';
  onSecondary = secondaryAction?.run;
  if (!modal.open) {
    returnFocus = document.activeElement;
    modal.showModal();
  }
  closeButton.focus();
}

function openGame(game) {
  const isFavorite = favorites.includes(game.id);
  showModal(game.name, '原型互動。遊戲入口等待正式網址。', [], {
    label: isFavorite ? '取消最愛' : '加入最愛',
    run: () => {
      favorites = isFavorite ? favorites.filter((id) => id !== game.id) : [game.id, ...favorites];
      savePreference(favoritesKey, favorites);
      renderRecent();
      renderFavorites();
      openGame(game);
    }
  });
}

function openHomeGameList(title, ids, isRecent = false) {
  const items = ids.map(id => games.find(game => game.id === id)).filter(Boolean);
  showModal(translate(title), isRecent ? '近7天遊戲過' : (items.length ? '' : '目前沒有收藏的遊戲。'));
  if (!items.length) return;

  const grid = document.createElement('div');
  grid.className = 'home-modal-cards';
  for (const game of items) {
    const provider = isRecent ? recentProviders.find(item => item.id === game.id) : null;
    const name = provider?.title ?? game.name;
    const art = provider?.art ?? originalFeaturedArt[game.id] ?? `assets/home-games/${game.id}.webp`;
    const mark = homeProvider(game);
    const card = document.createElement('article');
    card.className = 'home-modal-card';
    card.innerHTML = `<img class="home-modal-art" src="${art}" alt="">
      <div class="home-modal-card-copy">
        ${mark ? `<img class="home-modal-logo" src="${mark.logo}" alt="">` : ''}
        <strong>${name}</strong>
        <button type="button" aria-label="立即遊戲 ${name}">立即遊戲 ›</button>
      </div>`;
    card.querySelector('button').addEventListener('click', () => {
      if (provider) openRecentProvider(provider);
      else openGame(game);
    });
    grid.append(card);
  }
  $('#modalContent').replaceChildren(grid);
}

function openCatalog(category) {
  const items = games.filter((game) => !category || game.category === category);
  showModal(category ?? translate('全部遊戲'), '選擇遊戲可查看入口與收藏狀態。', items.map((game) => [
    game.name + (favorites.includes(game.id) ? ' ★' : ''),
    () => openGame(game)
  ]));
}

const announcements = [
  ['系統公告', '11/12 02:00–04:00 為設計圖中的例行維護示意時段。'],
  ['限時活動', '「儲值加碼」為原型公告，活動日期與資格等待正式公布。'],
  ['VIP 專屬禮遇', '正式優惠與適用條件等待平台提供。']
];

const placeholder = (title, text) => () => showModal(title, '原型互動。' + text);

function openAppGuide(os) {
  demoMember.navigate(os ? `app-guide.html#${os}` : 'app-guide.html');
}

const isCatalogPage = document.documentElement.classList.contains('catalog-route');
if (isCatalogPage) {
  document.title = '全部遊戲｜BOMB 娛樂平台';
  document.querySelector('.catalog').hidden = false;
  document.querySelector('.mobile-bottom [data-action="home"]').classList.remove('active');
  const catalogTab = document.querySelector('.mobile-bottom [data-action="all"]');
  catalogTab.classList.add('active');
  catalogTab.setAttribute('aria-current', 'page');
}

const isDepositPage = document.body.classList.contains('deposit-page');

function openAccountView(hash = '#deposit-title') {
  if (isDepositPage) {
    location.hash = hash;
  } else {
    location.assign(hash === '#deposit-title' ? 'deposit.html' : 'deposit.html' + hash);
  }
}

const actions = {
  home: () => (isDepositPage || isCatalogPage || document.querySelector('#desktop-games')) ? demoMember.navigate('index.html') : window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}),
  all: () => { if (!isCatalogPage) demoMember.navigate('all-games.html'); },
  recent: () => openHomeGameList('玩過', recentProviders.map(provider => provider.id), true),
  favorites: () => openHomeGameList('收藏', favorites),
  referral: () => showModal('推薦好友', '依序取得推薦資訊、分享給好友並確認活動條件。', [
    ['1　取得推薦資訊', placeholder('取得推薦資訊', '正式推薦連結等待會員服務提供。')],
    ['2　分享給好友', placeholder('分享給好友', '可於取得正式連結後傳送給好友。')],
    ['3　確認活動條件', placeholder('確認活動條件', '獎勵及資格等待活動公告。')]
  ]),
  deposit: () => openAccountView(),
  withdraw: () => openAccountView('#withdraw'),
  transfer: () => openAccountView('#transfer'),
  personal: () => openAccountView('#personal-center'),
  logout: () => demoMember.logout(),
  promo: () => showModal('優惠活動', '活動內容為原型示範。', announcements.slice(1).map(([title, message]) => [title, () => showModal(title, message)])),
  notifications: () => showModal('通知中心', '未讀通知為原型示範。', [[announcements[0][0], () => showModal(...announcements[0])]]),
  announcements: () => showModal('最新公告', '選擇要閱讀的公告。', announcements.map(([title, message]) => [title, () => showModal(title,message)])),
  member: () => showModal('會員中心', '會員資料等待正式串接。', [['收藏', () => showModal('收藏', '管理已收藏遊戲。', favorites.map((id) => {
    const game = games.find((item) => item.id === id);
    return [game.name, () => openGame(game)];
  }))]]),
  help: placeholder('客服中心', '正式客服管道等待提供。'),
  android: () => openAppGuide('android'),
  ios: () => openAppGuide('ios'),
  'app-guide': () => openAppGuide(),
  about: placeholder('關於我們', '正式平台資訊等待提供。'),
  terms: placeholder('使用條款', '正式使用條款等待提供。'),
  privacy: placeholder('隱私政策', '正式隱私政策等待提供。')
};

const menus = [
  ['#memberMenuButton', '#memberMenu'],
  ['#walletBtn', '#walletMenu'],
  ['#languageBtn', '#languageMenu']
].map(([button, menu]) => [$(button), $(menu)]).filter(([button, menu]) => button && menu);

function openMenu(activeMenu) {
  for (const [button, menu] of menus) {
    menu.classList.toggle('open', menu === activeMenu);
    button.setAttribute('aria-expanded', String(menu === activeMenu));
  }
}
for (const [button, menu] of menus) {
  button.addEventListener('click', () => {
    openMenu(menu.classList.contains('open') ? null : menu);
  });
}

document.addEventListener('keydown', event => {
  const activeMenu = menus.find(([, menu]) => menu.classList.contains('open'));
  if (event.key === 'Escape' && activeMenu) {
    openMenu(null);
    activeMenu[0].focus();
  }
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-game], [data-action], [data-category], [data-lang]');
  if (target?.closest('.dropdown') || !event.target.closest('.top-drop')) openMenu(null);
  if (!target) return;
  if (target.dataset.game) {
    openGame(games.find((game) => game.name === target.dataset.game));
  } else if (target.dataset.category) {
    openCatalog(target.dataset.category);
  } else if (target.dataset.lang) {
    setLanguage(target.dataset.lang);
    $('#languageBtn').focus();
  } else {
    if (target.matches('a')) event.preventDefault();
    actions[target.dataset.action]?.();
  }
});

closeButton.addEventListener('click', () => modal.close());
secondary.addEventListener('click', () => onSecondary?.());
modal.addEventListener('close', () => {
  if (returnFocus?.isConnected) returnFocus.focus();
  else $('#recentGrid .game-card')?.focus();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || modal.open) return;
  const activeMenu = menus.find(([,menu]) => menu.classList.contains('open'));
  openMenu(null);
  activeMenu?.[0].focus();
});



setLanguage(locale);

const hero = $('#hero');
if (hero) {
  const slideCopy = [
    ['多元遊戲 一站暢玩', '全新娛樂平台', '真人・電子・彩票・棋牌・捕魚・體育賽事', '真人 × 電子 × 多元玩法'],
    ['首儲優惠', '首儲優惠', '限時活動・原型預覽', '限時活動・原型預覽'],
    ['VIP 專屬禮遇', 'VIP 專屬禮遇', '會員優惠・原型預覽', '會員優惠・原型預覽']
  ];
  const slideLabels = [...hero.querySelectorAll('.hero-copy .desktop-title,.hero-copy .mobile-title')];
  const dots = [...$('#bannerDots').querySelectorAll('button')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let slide = 0;
  let timer;
  let touchStart;

  function setSlide(next) {
    slide = (next + slideCopy.length) % slideCopy.length;
    hero.dataset.slide = String(slide);
    slideLabels.forEach((node, index) => { node.textContent = slideCopy[slide][index]; });
    dots.forEach((dot, index) => {
      dot.classList.toggle('on', index === slide);
      dot.setAttribute('aria-current', String(index === slide));
    });
  }

  function scheduleSlide() {
    clearTimeout(timer);
    if (reducedMotion.matches || document.hidden || hero.matches(':hover, :focus-within')) return;
    timer = setTimeout(() => { setSlide(slide + 1); scheduleSlide(); }, 6500);
  }
  function changeSlide(next) {
    setSlide(next);
    scheduleSlide();
  }
  $('#bannerPrev').addEventListener('click', () => changeSlide(slide - 1));
  $('#bannerNext').addEventListener('click', () => changeSlide(slide + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => changeSlide(index)));
  hero.addEventListener('touchstart', (event) => {
    const {clientX, clientY} = event.changedTouches[0];
    touchStart = {clientX, clientY};
  }, {passive:true});
  hero.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.clientX;
    const dy = event.changedTouches[0].clientY - touchStart.clientY;
    if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy)) changeSlide(slide + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  for (const event of ['pointerenter','pointerleave','focusin','focusout']) {
    hero.addEventListener(event, () => setTimeout(scheduleSlide, 0));
  }
  document.addEventListener('visibilitychange', scheduleSlide);
  reducedMotion.addEventListener('change', scheduleSlide);
  setSlide(0);
  scheduleSlide();
}
