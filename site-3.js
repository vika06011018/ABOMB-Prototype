

/* Floating buttons open a dedicated side panel instead of the generic centered dialog. */
(() => {
  const floating = document.querySelector('.floating');
  const panel = document.createElement('section');
  panel.id = 'bombQuickPanel'; panel.hidden = true;
  panel.setAttribute('aria-label','快速工具詳細內容');
  document.body.append(panel);
  const data = {
    help: {icon:'♧',title:'客服中心',subtitle:'需要協助嗎？可查看常見問題或聯絡客服。',cta:'立即聯繫客服',rows:[['☎','線上客服','前往客服聯絡入口'],['ⓘ','常見問題','快速查看常見問答'],['✉','聯絡我們','意見反映與問題回報'],['◷','服務時間','客服時段及作業資訊']]},
    promo:{icon:'🎁',title:'優惠活動',subtitle:'精選活動入口，點擊可查看後續活動詳情。',rows:[['🎁','首儲優惠','正式優惠條件待確認'],['⚡','限時活動','活動內容與期間待確認'],['♛','VIP 專屬活動','參與資格與獎勵待確認']]},
    referral:{icon:'♙',title:'推薦好友',subtitle:'分享推薦資訊給好友，了解邀請方式與活動條件。',cta:'查看詳情',rows:[['1','取得推薦資訊','查看邀請方式'],['2','分享給好友','傳送推薦連結'],['3','確認活動條件','查看參與資格與獎勵']]}
  };
  let active = null;
  function place(){
    if(panel.hidden||!floating)return;
    const r=floating.getBoundingClientRect(),w=panel.offsetWidth,h=panel.offsetHeight;
    const gap=12;
    const left=r.left < innerWidth/2 ? r.right+gap : r.left-w-gap;
    panel.style.left=Math.max(gap,Math.min(innerWidth-w-gap,left))+'px';
    panel.style.top=Math.max(gap,Math.min(innerHeight-h-gap,r.top+(r.height-h)/2))+'px';
  }
  function close(){panel.hidden=true;active=null}
  function open(type){
    if(active===type&&!panel.hidden){close();return}
    const d=data[type]; if(!d)return;
    active=type;
    panel.innerHTML=`<button class="bqp-close" type="button" aria-label="關閉工具面板">×</button><div class="bqp-head"><span class="bqp-icon">${d.icon}</span><div><div class="bqp-title">${d.title}</div><div class="bqp-sub">${d.subtitle}</div></div></div><div class="bqp-items"></div>${d.cta?`<button class="bqp-cta" type="button">${d.cta}　▶</button>`:''}<p class="bqp-foot">此為功能示意，正式服務與活動內容待確認。</p>`;
    const items=panel.querySelector('.bqp-items');
    d.rows.forEach(([sym,title,desc])=>{
      const b=document.createElement('button');b.type='button';b.className='bqp-item';
      b.innerHTML=`<span class="bqp-num"></span><span class="bqp-rowtext"><strong></strong><small></small></span><span class="bqp-chevron">›</span>`;
      b.querySelector('.bqp-num').textContent=sym;
      b.querySelector('strong').textContent=title;
      b.querySelector('small').textContent=desc;
      b.addEventListener('click',()=>{
        close();
        if(typeof showModal==='function')showModal(title,'此為原型展示，正式服務與活動詳情將於後續串接。');
      });
      items.append(b);
    });
    panel.querySelector('.bqp-close').addEventListener('click',close);
    panel.querySelector('.bqp-cta')?.addEventListener('click',()=>{
      close();
      if(typeof showModal==='function')showModal(d.cta,'目前為原型展示，正式功能資訊等待提供。');
    });
    panel.hidden=false;place();
  }
  // Capture before the existing document-level delegated click handler.
  document.addEventListener('click',event=>{
    const btn=event.target.closest('.floating [data-action]');
    if(!btn||!matchMedia('(min-width:900px)').matches)return;
    const key=btn.dataset.action;
    if(!(key in data))return;
    event.preventDefault();event.stopPropagation();open(key);
  },true);
  document.addEventListener('pointerdown',event=>{
    if(!panel.hidden&&!event.target.closest('#bombQuickPanel,.floating'))close();
  },true);
  document.querySelector('#floatToggle')?.addEventListener('click',()=>{if(!panel.hidden)close()},true);
  window.addEventListener('resize',()=>{if(!matchMedia('(min-width:900px)').matches)close();else place()});
  window.addEventListener('scroll',place,{passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close()}});
  if(floating){const observer=new MutationObserver(place);observer.observe(floating,{attributes:true,attributeFilter:['style','class']});}
})();

