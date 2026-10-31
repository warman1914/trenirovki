'use strict';
/* =========================================================
   Хранене — дневник на храненето по плана: калории, протеин,
   фибри, вода. Данните се пазят в localStorage на устройството.
   ========================================================= */
const APP_VERSION = '1.0';
const PLAN_URL = 'https://claude.ai/artifact/NqokyyQePUmkS5NmxhqKhT';
const SLOTS = [['lunch','Обяд','12:00–13:00'],['snack','Междинно','16:00–17:00'],['dinner','Вечеря','19:30–20:30'],['other','Друго','свободни калории, напитки']];
const SLOTN = Object.fromEntries(SLOTS.map(s => [s[0], s[1]]));
const DEF_T = {kcal:[2300,2400], p:[170,190], fib:[35,45], water:[3000,3500], f:[65,80], c:[220,260]};
const T_LABEL = {kcal:['Калории','kcal'], p:['Протеин','г'], fib:['Фибри','г'], water:['Вода','мл'], f:['Мазнини','г'], c:['Въглехидрати','г']};

/* ---------- данни ---------- */
const KEY = 'hrn:v1';
const clone = o => JSON.parse(JSON.stringify(o));
const blank = () => ({v:1, targets:clone(DEF_T), days:{}, custom:[], meals:clone(DEFAULT_MEALS), fav:['chk','skyr','lentil','oats','apple','egg','rye','almond'], recent:[]});
let DB = load();
function load(){ try{ const s = localStorage.getItem(KEY); return s ? Object.assign(blank(), JSON.parse(s)) : blank(); }catch(e){ return blank(); } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('Не успях да запиша. Провери свободното място.'); } }
let persistAsked = false;
function askPersist(){ if(persistAsked) return; persistAsked = true; try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){} }

const today = () => new Date().toLocaleDateString('sv-SE');
const addDays = (d, n) => { const p = d.split('-').map(Number), x = new Date(p[0], p[1]-1, p[2]+n); return x.toLocaleDateString('sv-SE'); };
const fmtD = d => { const p = d.split('-'); return p[2]+'.'+p[1]; };
const WD = ['нд','пн','вт','ср','чт','пт','сб'];
const wday = d => { const p = d.split('-').map(Number); return WD[new Date(p[0],p[1]-1,p[2]).getDay()]; };
const num = v => { if(v==null || v==='') return null; const n = parseFloat(String(v).replace(',','.')); return isFinite(n) ? n : null; };
const r0 = n => Math.round(n||0).toLocaleString('bg-BG');
const r1 = n => String(Math.round((n||0)*10)/10).replace('.',',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const food = id => FOODS.find(f => f.id===id) || DB.custom.find(f => f.id===id);
const macro = (fd, g) => { const k = g/100; return {kcal:fd.kcal*k, p:fd.p*k, f:fd.f*k, c:fd.c*k, fib:fd.fib*k}; };
const unitOf = fd => fd && fd.u==='ml' ? 'мл' : 'г';
function dayR(d){ return DB.days[d] || {items:[], water:0}; }
function dayW(d){ return DB.days[d] || (DB.days[d] = {items:[], water:0}); }
function totals(d){ const t = {kcal:0,p:0,f:0,c:0,fib:0}; for(const i of dayR(d).items) for(const k in t) t[k] += i[k]||0; return t; }
const mid = r => (r[0]+r[1])/2;
function defaultSlot(){ const h = new Date().getHours() + new Date().getMinutes()/60; return h < 15 ? 'lunch' : h < 18.5 ? 'snack' : h < 22.5 ? 'dinner' : 'other'; }
function mealItems(m){ return m.items.map(it => { if(Array.isArray(it)){ const fd = food(it[0]); return fd ? {fid:fd.id, n:fd.n, g:it[1], u:fd.u, ...macro(fd, it[1])} : null; } return {...it}; }).filter(Boolean); }
function mealTotal(m){ const t = {kcal:0,p:0,f:0,c:0,fib:0}; for(const i of mealItems(m)) for(const k in t) t[k] += i[k]||0; return t; }

/* ---------- навигация ---------- */
const TABS = [['Днес','today'],['История','history'],['Храни','foods'],['Цели','goals']];
const tabsEl = document.getElementById('tabs'), main = document.getElementById('main');
let cur = 'today', vd = today();
function setTabs(){ tabsEl.innerHTML = TABS.map(([l,h]) => `<button type="button" role="tab" aria-selected="${cur===h}" data-h="${h}">${l}</button>`).join(''); }
tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if(b) location.hash = b.dataset.h; });
function route(){
  const h = (location.hash||'').slice(1);
  cur = TABS.some(t => t[1]===h) ? h : 'today';
  setTabs();
  ({today:showToday, history:showHistory, foods:showFoods, goals:showGoals})[cur]();
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0,0); });

/* ---------- днес ---------- */
function bar(key, val){
  const [mn, mx] = DB.targets[key], scale = mx*1.25, unit = T_LABEL[key][1];
  const cls = val > mx ? 'over' : val >= mn ? 'in' : '';
  const shown = key==='water' ? r1(val/1000)+' / '+r1(mn/1000)+'–'+r1(mx/1000)+' л' : `${r0(val)} / ${r0(mn)}–${r0(mx)} ${unit}`;
  return `<div class="bar"><div class="lab"><b>${T_LABEL[key][0]}</b><span>${shown}</span></div>
    <div class="track" role="img" aria-label="${T_LABEL[key][0]}: ${shown}"><div class="band" style="left:${mn/scale*100}%;width:${(mx-mn)/scale*100}%"></div><div class="fill ${cls}" style="width:${Math.min(100, val/scale*100)}%"></div></div></div>`;
}
function showToday(){
  const d = vd, day = dayR(d), t = totals(d), T = DB.targets, isToday = d===today();
  const left = mid(T.kcal) - t.kcal, yd = dayR(addDays(d,-1));
  const needP = Math.max(0, T.p[0]-t.p), needF = Math.max(0, T.fib[0]-t.fib);
  let h = `<div class="datenav"><button type="button" class="iconbtn" id="prev" aria-label="Предишен ден">‹</button>
    <h2>${isToday ? 'Днес' : wday(d)}, ${fmtD(d)}</h2>
    <button type="button" class="iconbtn" id="nextd" aria-label="Следващ ден" ${isToday?'disabled':''}>›</button></div>
  <section class="panel" aria-label="Обобщение за деня">
    <div class="left${left<0?' over':''}"><b>${r0(Math.abs(left))}</b><span>${left>=0 ? 'kcal остават до ~'+r0(mid(T.kcal)) : 'kcal над целта от ~'+r0(mid(T.kcal))}</span></div>
    <div class="bars">${bar('kcal',t.kcal)}${bar('p',t.p)}${bar('fib',t.fib)}${bar('water',day.water||0)}</div>
    <div class="minor">Мазнини ${r0(t.f)} г (цел ${T.f[0]}–${T.f[1]}) · Въглехидрати ${r0(t.c)} г (цел ${T.c[0]}–${T.c[1]})</div>
    ${(needP>0 || needF>0) && t.kcal>0 ? `<div class="minor">Остават ${needP>0?r0(needP)+' г протеин':''}${needP>0&&needF>0?' и ':''}${needF>0?r0(needF)+' г фибри':''} до долната граница.</div>` : ''}
    <div class="water"><span class="muted">Вода:</span>
      <button type="button" class="btn small" data-water="250">+250 мл</button>
      <button type="button" class="btn small" data-water="500">+500 мл</button>
      <button type="button" class="btn ghost small" data-water="-250" ${(day.water||0)<=0?'disabled':''}>−250</button></div>
  </section>`;
  for(const [k, name, time] of SLOTS){
    const items = day.items.filter(i => i.slot===k), s = {kcal:0,p:0,fib:0};
    items.forEach(i => { s.kcal += i.kcal||0; s.p += i.p||0; s.fib += i.fib||0; });
    const yItems = yd.items.filter(i => i.slot===k);
    h += `<section class="panel" aria-labelledby="h-${k}"><div class="slot-h"><div><h3 id="h-${k}">${name}</h3><div class="muted">${time}</div></div>
      ${items.length ? `<div class="sum">${r0(s.kcal)} kcal<br>${r0(s.p)} г протеин · ${r1(s.fib)} г фибри</div>` : ''}</div>
      ${items.length ? `<div class="items">${items.map(i => `<div class="item">
        <button type="button" class="nm" data-edit="${i.uid}" ${i.fid?'':'disabled'}>${esc(i.n)}<small>${i.g!=null ? r0(i.g)+' '+(i.u==='ml'?'мл':'г') : 'бързо въвеждане'}</small></button>
        <div class="kc">${r0(i.kcal)} kcal<small>${r0(i.p)} П · ${r1(i.fib)} Ф</small></div>
        <button type="button" class="del" data-del="${i.uid}" aria-label="Изтрий ${esc(i.n)}">×</button></div>`).join('')}</div>` : ''}
      <div class="row"><button type="button" class="btn small" data-add="${k}">+ Добави</button>
        ${!items.length && yItems.length ? `<button type="button" class="btn ghost small" data-copy="${k}">Като вчера (${r0(yItems.reduce((a,i)=>a+(i.kcal||0),0))} kcal)</button>` : ''}
        ${items.length ? `<button type="button" class="btn ghost small" data-savemeal="${k}">Запази като ястие</button>` : ''}</div>
    </section>`;
  }
  main.innerHTML = h;
  document.getElementById('prev').onclick = () => { vd = addDays(vd,-1); showToday(); };
  document.getElementById('nextd').onclick = () => { if(vd < today()){ vd = addDays(vd,1); showToday(); } };
}
main.addEventListener('click', e => {
  if(cur!=='today') return;
  const b = e.target.closest('button'); if(!b) return;
  const D = b.dataset;
  if(D.water){ askPersist(); const day = dayW(vd); day.water = Math.max(0, (day.water||0) + (+D.water)); save(); showToday(); }
  else if(D.add){ openSheet(D.add); }
  else if(D.del){ const day = dayW(vd); const it = day.items.find(i => i.uid===D.del); day.items = day.items.filter(i => i.uid!==D.del); save(); showToday(); if(it) toastUndo(`Изтрито: ${it.n}`, () => { dayW(vd).items.push(it); save(); showToday(); }); }
  else if(D.edit){ const it = dayR(vd).items.find(i => i.uid===D.edit); if(it && it.fid && food(it.fid)) openSheet(it.slot, {fid:it.fid, g:it.g, editUid:it.uid}); }
  else if(D.copy){ const its = dayR(addDays(vd,-1)).items.filter(i => i.slot===D.copy).map(i => ({...i, uid:uid()})); dayW(vd).items.push(...its); save(); showToday(); toast('Копирано от вчера'); }
  else if(D.savemeal){
    const its = dayR(vd).items.filter(i => i.slot===D.savemeal);
    const name = its.slice(0,3).map(i => i.n.replace(/\s*\(.*?\)/g,'')).join(', ');
    DB.meals.push({id:'m'+uid(), n:name, slot:D.savemeal, items:its.map(i => i.fid ? [i.fid, i.g] : {n:i.n, g:null, kcal:i.kcal, p:i.p, f:i.f, c:i.c, fib:i.fib})});
    save(); toast('Запазено в „Ястия“. Името се сменя в раздел „Храни“.');
  }
});

/* ---------- добавяне (лист) ---------- */
const sheetEl = document.getElementById('sheet'), sb = document.getElementById('sheetbody'), qEl = document.getElementById('q');
let S = null;
function openSheet(slot, pick){
  askPersist();
  S = {slot, mode: DB.fav.length ? 'fav' : 'all', q:'', pick: pick || null};
  qEl.value = ''; sheetEl.classList.add('on'); sheetEl.setAttribute('aria-hidden','false'); document.body.classList.add('sheet-open');
  renderSheet();
  if(!pick) setTimeout(() => qEl.focus({preventScroll:true}), 50);
}
function closeSheet(){ sheetEl.classList.remove('on'); sheetEl.setAttribute('aria-hidden','true'); document.body.classList.remove('sheet-open'); S = null; route(); }
sheetEl.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeSheet(); });
document.addEventListener('keydown', e => { if(e.key==='Escape' && S) closeSheet(); });
qEl.addEventListener('input', () => { S.q = qEl.value.trim(); S.pick = null; renderSheet(); });
const MODES = [['fav','Любими'],['recent','Скорошни'],['meals','Ястия'],['all','Всички'],['quick','Бързо']];
function norm(s){ return s.toLowerCase().replace(/ё/g,'е'); }
function match(n, q){ const a = norm(n); return norm(q).split(/\s+/).every(w => a.includes(w)); }
function foodRow(fd){ return `<div class="r"><button type="button" class="pick" data-food="${fd.id}">${esc(fd.n)}<small>100 ${unitOf(fd)}: ${r0(fd.kcal)} kcal · ${r1(fd.p)} г протеин · ${r1(fd.fib)} г фибри</small></button>
  <button type="button" class="star" data-star="${fd.id}" aria-pressed="${DB.fav.includes(fd.id)}" aria-label="Любима: ${esc(fd.n)}">★</button></div>`; }
function mealRow(m){ const t = mealTotal(m); return `<div class="r"><button type="button" class="pick" data-meal="${m.id}">${esc(m.n)}<small>${r0(t.kcal)} kcal · ${r0(t.p)} г протеин · ${r1(t.fib)} г фибри · ${m.items.length} съставки</small></button><span></span></div>`; }
function renderSheet(){
  document.getElementById('slotchips').innerHTML = SLOTS.map(([k,n]) => `<button type="button" class="chip" data-slot="${k}" aria-pressed="${S.slot===k}">${n}</button>`).join('');
  document.getElementById('modechips').innerHTML = S.q ? '' : MODES.map(([k,n]) => `<button type="button" class="chip" data-mode="${k}" aria-pressed="${S.mode===k}">${n}</button>`).join('');
  document.getElementById('sheet-title').textContent = S.pick && S.pick.editUid ? 'Промени количество' : 'Добави към ' + SLOTN[S.slot].toLowerCase();
  qEl.hidden = !!S.pick;
  if(S.pick) return renderPortion();
  const all = FOODS.concat(DB.custom);
  let h = '';
  if(S.q){
    const ms = DB.meals.filter(m => match(m.n, S.q)), fs = all.filter(f => match(f.n, S.q));
    h = ms.map(mealRow).join('') + fs.map(foodRow).join('');
    if(!h) h = `<p class="muted">Няма такава храна. Добави я в „Бързо“ или като своя храна в раздел „Храни“.</p>`;
  }else if(S.mode==='fav'){ const fs = DB.fav.map(food).filter(Boolean); h = fs.length ? fs.map(foodRow).join('') : '<p class="muted">Натисни ★ до храна, за да я добавиш тук.</p>'; }
  else if(S.mode==='recent'){ const fs = DB.recent.map(food).filter(Boolean); h = fs.length ? fs.map(foodRow).join('') : '<p class="muted">Тук ще се появят последно добавените храни.</p>'; }
  else if(S.mode==='meals'){ h = DB.meals.length ? DB.meals.map(mealRow).join('') : '<p class="muted">Няма запазени ястия.</p>'; }
  else if(S.mode==='all'){ const cats = [...new Set(all.map(f => f.cat || 'Мои храни'))]; h = cats.map(c => `<h3 style="font-size:17px;margin:14px 0 2px">${esc(c)}</h3>` + all.filter(f => (f.cat||'Мои храни')===c).map(foodRow).join('')).join(''); }
  else if(S.mode==='quick'){ h = `<form id="quick" class="form" style="padding-top:8px">
      <label class="f wide">Какво<input id="qn" required placeholder="напр. Дюнер, сандвич от магазина"></label>
      <label class="f">kcal<input id="qk" class="num" inputmode="decimal" required></label>
      <label class="f">Протеин, г<input id="qp" class="num" inputmode="decimal"></label>
      <label class="f">Фибри, г<input id="qfb" class="num" inputmode="decimal"></label>
      <label class="f">Мазнини, г<input id="qf" class="num" inputmode="decimal"></label>
      <label class="f">Въглехидрати, г<input id="qc" class="num" inputmode="decimal"></label>
      <div class="wide"><button class="btn" type="submit">Добави</button></div>
      <p class="muted wide" style="margin:0">За цялото количество, което си изял. Стойностите ги има на етикета или в сайта на заведението.</p></form>`; }
  h = `<div class="res">${h}</div>`;
  sb.innerHTML = h;
  const qf = document.getElementById('quick');
  if(qf) qf.onsubmit = e => { e.preventDefault(); const k = num(document.getElementById('qk').value); if(k==null){ toast('Въведи калориите'); return; }
    addItems([{n:document.getElementById('qn').value.trim() || 'Бързо въвеждане', g:null, kcal:k, p:num(document.getElementById('qp').value)||0, fib:num(document.getElementById('qfb').value)||0, f:num(document.getElementById('qf').value)||0, c:num(document.getElementById('qc').value)||0}]); };
}
function renderPortion(){
  const fd = food(S.pick.fid), u = unitOf(fd);
  const g = S.pick.g ?? (fd.por[0] ? fd.por[0][1] : 100);
  S.pick.g = g;
  const m = macro(fd, g);
  sb.innerHTML = `<div class="portion"><h3>${esc(fd.n)}</h3>
    <div class="chips">${fd.por.concat([['100 '+u,100]]).map(([l,gr]) => `<button type="button" class="chip" data-g="${gr}" aria-pressed="${gr===g}">${esc(l)} · ${gr} ${u}</button>`).join('')}</div>
    <label class="f">Количество, ${u}<input id="grams" class="num" inputmode="decimal" value="${r1(g)}" style="width:140px"></label>
    <div class="preview" id="pv">${pv(m)}</div>
    <div class="row"><button type="button" class="btn" id="addit">${S.pick.editUid ? 'Запази' : 'Добави'}</button>${S.pick.editUid ? '' : '<button type="button" class="btn ghost" id="back">Назад</button>'}</div></div>`;
  const gi = document.getElementById('grams');
  gi.oninput = () => { const v = num(gi.value); if(v!=null){ S.pick.g = v; document.getElementById('pv').innerHTML = pv(macro(fd, v)); sb.querySelectorAll('[data-g]').forEach(c => c.setAttribute('aria-pressed', +c.dataset.g===v)); } };
  document.getElementById('addit').onclick = () => {
    const gg = S.pick.g; if(!gg || gg<=0){ toast('Въведи количество'); return; }
    if(S.pick.editUid){ const it = dayW(vd).items.find(i => i.uid===S.pick.editUid); if(it){ Object.assign(it, {g:gg, slot:S.slot}, macro(fd, gg)); save(); } toast('Запазено'); closeSheet(); }
    else addItems([{fid:fd.id, n:fd.n, g:gg, u:fd.u, ...macro(fd, gg)}]);
  };
  const bk = document.getElementById('back'); if(bk) bk.onclick = () => { S.pick = null; renderSheet(); };
}
const pv = m => `<div><b>${r0(m.kcal)}</b><span>kcal</span></div><div><b>${r0(m.p)}</b><span>протеин</span></div><div><b>${r1(m.fib)}</b><span>фибри</span></div><div><b>${r0(m.f)}</b><span>мазнини</span></div><div><b>${r0(m.c)}</b><span>въгл.</span></div>`;
function addItems(arr){
  const day = dayW(vd);
  for(const a of arr){ day.items.push({uid:uid(), slot:S.slot, ...a}); if(a.fid){ DB.recent = [a.fid, ...DB.recent.filter(x => x!==a.fid)].slice(0,25); } }
  save(); toast(arr.length>1 ? `Добавени ${arr.length} храни в ${SLOTN[S.slot].toLowerCase()}` : `Добавено: ${arr[0].n}`); closeSheet();
}
sb.addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b || !S) return;
  const D = b.dataset;
  if(D.food){ S.pick = {fid:D.food, g:null}; renderSheet(); sb.scrollTop = 0; }
  else if(D.star){ DB.fav = DB.fav.includes(D.star) ? DB.fav.filter(x => x!==D.star) : [...DB.fav, D.star]; save(); b.setAttribute('aria-pressed', DB.fav.includes(D.star)); }
  else if(D.meal){ const m = DB.meals.find(x => x.id===D.meal); if(m) addItems(mealItems(m)); }
  else if(D.g){ S.pick.g = +D.g; renderPortion(); }
});
document.getElementById('slotchips').addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if(b){ S.slot = b.dataset.slot; renderSheet(); } });
document.getElementById('modechips').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if(b){ S.mode = b.dataset.mode; S.pick = null; renderSheet(); } });

/* ---------- история ---------- */
function bodyWeight(){ try{ const t = JSON.parse(localStorage.getItem('trn:v1')||'null'); return t && Array.isArray(t.body) ? t.body : []; }catch(e){ return []; } }
const dn = d => { const p = d.split('-').map(Number); return Date.UTC(p[0],p[1]-1,p[2])/864e5; };
function avgW(b, from, to){ const t = dn(today()), w = b.filter(o => { const m = t-dn(o.date); return m>=from && m<to; }); return w.length ? w.reduce((a,o)=>a+o.kg,0)/w.length : null; }
function showHistory(){
  const T = DB.targets, days = []; for(let i=13;i>=0;i--) days.push(addDays(today(), -i));
  const rows = days.map(d => ({d, t:totals(d), w:dayR(d).water||0, n:dayR(d).items.length}));
  const last7 = rows.slice(-7).filter(r => r.n);
  const avg = k => last7.length ? last7.reduce((a,r)=>a+r.t[k],0)/last7.length : null;
  const onTarget = last7.filter(r => r.t.kcal <= T.kcal[1]+50 && r.t.p >= T.p[0]).length;
  const b = bodyWeight(), a7 = avgW(b,0,7), p7 = avgW(b,7,14), diff = a7!=null && p7!=null ? a7-p7 : null;
  // chart
  const Wd=640, H=220, pl=44, pr=10, pt=10, pb=26, mx = Math.max(T.kcal[1]*1.25, ...rows.map(r => r.t.kcal));
  const bw = (Wd-pl-pr)/rows.length, Y = v => pt + (1 - v/mx)*(H-pt-pb);
  let ch = `<svg class="chart" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Калории по дни за последните 14 дни">`;
  for(let i=0;i<=4;i++){ const v = mx*i/4, y = Y(v); ch += `<line class="grid" x1="${pl}" x2="${Wd-pr}" y1="${y}" y2="${y}"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${r0(v)}</text>`; }
  ch += `<rect class="bandr" x="${pl}" width="${Wd-pl-pr}" y="${Y(T.kcal[1])}" height="${Y(T.kcal[0])-Y(T.kcal[1])}"/>`;
  rows.forEach((r,i) => { const x = pl + i*bw + bw*.18, w = bw*.64;
    if(r.n){ const cls = r.t.kcal > T.kcal[1] ? 'over' : r.t.kcal < T.kcal[0]-300 ? 'under' : ''; ch += `<rect class="b ${cls}" x="${x}" y="${Y(r.t.kcal)}" width="${w}" height="${Y(0)-Y(r.t.kcal)}" rx="3"><title>${fmtD(r.d)}: ${r0(r.t.kcal)} kcal</title></rect>`; }
    if(i%2===1 || i===rows.length-1) ch += `<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${fmtD(r.d)}</text>`; });
  ch += '</svg>';
  main.innerHTML = `<section class="panel" aria-labelledby="h-w"><h3 id="h-w">Последните 7 дни</h3>
    <div class="kpis">
      <div class="kpi"><b>${avg('kcal')!=null?r0(avg('kcal')):'–'}</b><span>kcal средно (цел ${T.kcal[0]}–${T.kcal[1]})</span></div>
      <div class="kpi"><b>${avg('p')!=null?r0(avg('p')):'–'}</b><span>г протеин средно</span></div>
      <div class="kpi"><b>${avg('fib')!=null?r0(avg('fib')):'–'}</b><span>г фибри средно</span></div>
      <div class="kpi"><b>${last7.length?onTarget+' от '+last7.length:'–'}</b><span>дни в целта*</span></div>
      <div class="kpi"><b>${a7!=null?r1(a7):'–'}</b><span>кг тегло средно${diff!=null?' ('+(diff>0?'+':'')+r1(diff)+' за седмица)':''}</span></div>
    </div>
    <p class="muted" style="margin:0">* Калории до ${T.kcal[1]+50} и протеин поне ${T.p[0]} г. ${b.length?'Теглото идва от приложението за тренировки.':'Теглото се записва в Тренировки → Прогрес.'}</p></section>
  <section class="panel" aria-labelledby="h-c"><h3 id="h-c">Калории по дни</h3>${ch}<p class="muted" style="margin:0">Зелената ивица е целта ${T.kcal[0]}–${T.kcal[1]} kcal. Червено = над целта.</p></section>
  <section class="panel" aria-labelledby="h-t"><h3 id="h-t">По дни</h3><div class="tbl"><table><thead><tr><th>Ден</th><th class="r">kcal</th><th class="r">Протеин</th><th class="r">Фибри</th><th class="r">Вода, л</th></tr></thead>
    <tbody>${rows.slice().reverse().map(r => `<tr><td><a href="#today" data-day="${r.d}">${wday(r.d)} ${fmtD(r.d)}</a></td><td class="r">${r.n?r0(r.t.kcal):'–'}</td><td class="r">${r.n?r0(r.t.p):'–'}</td><td class="r">${r.n?r1(r.t.fib):'–'}</td><td class="r">${r.w?r1(r.w/1000):'–'}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="margin:0">Натисни ден, за да го отвориш и допълниш.</p></section>`;
  main.querySelectorAll('[data-day]').forEach(a => a.onclick = () => { vd = a.dataset.day; });
}

/* ---------- храни ---------- */
function showFoods(){
  main.innerHTML = `<section class="panel" aria-labelledby="h-m"><h3 id="h-m">Мои ястия</h3>
    <p class="muted" style="margin:0">Добавят се с едно докосване от „+ Добави“ → „Ястия“. Ново ястие правиш от „Днес“ с „Запази като ястие“.</p>
    ${DB.meals.length ? DB.meals.map(m => { const t = mealTotal(m); return `<div style="display:grid;gap:6px;border-top:1px solid var(--line);padding-top:10px">
      <input data-mealname="${m.id}" value="${esc(m.n)}" aria-label="Име на ястието">
      <div class="muted">${mealItems(m).map(i => esc(i.n)+(i.g!=null?' '+r0(i.g)+(i.u==='ml'?' мл':' г'):'')).join(', ')}</div>
      <div class="row"><span class="muted">${r0(t.kcal)} kcal · ${r0(t.p)} г протеин · ${r1(t.fib)} г фибри</span><button type="button" class="btn ghost small" data-delmeal="${m.id}" style="margin-left:auto">Изтрий</button></div></div>`; }).join('') : '<p class="muted">Няма ястия.</p>'}
  </section>
  <section class="panel" aria-labelledby="h-cf"><h3 id="h-cf">Добави своя храна</h3>
    <form id="cf" class="form">
      <label class="f wide">Име<input id="cfn" required placeholder="напр. Протеинов бар X"></label>
      <label class="f">Мерна единица<select id="cfu"><option value="g">на 100 г</option><option value="ml">на 100 мл</option></select></label>
      <label class="f">kcal<input id="cfk" class="num" inputmode="decimal" required></label>
      <label class="f">Протеин<input id="cfp" class="num" inputmode="decimal"></label>
      <label class="f">Мазнини<input id="cff" class="num" inputmode="decimal"></label>
      <label class="f">Въглехидрати<input id="cfc" class="num" inputmode="decimal"></label>
      <label class="f">Фибри<input id="cffb" class="num" inputmode="decimal"></label>
      <label class="f">Порция (име)<input id="cfpn" placeholder="1 бр"></label>
      <label class="f">Порция (г/мл)<input id="cfpg" class="num" inputmode="decimal"></label>
      <div class="wide"><button class="btn" type="submit">Запази храната</button></div></form>
    <p class="muted" style="margin:0">Стойностите са от етикета, колоната „на 100 г“.</p>
    ${DB.custom.length ? `<div class="tbl"><table><thead><tr><th>Храна</th><th class="r">kcal</th><th class="r">П</th><th class="r">Ф</th><th></th></tr></thead><tbody>${DB.custom.map(f => `<tr><td>${esc(f.n)}</td><td class="r">${r0(f.kcal)}</td><td class="r">${r1(f.p)}</td><td class="r">${r1(f.fib)}</td><td class="r"><button type="button" class="btn ghost small" data-delfood="${f.id}">Изтрий</button></td></tr>`).join('')}</tbody></table></div>` : ''}
  </section>
  <section class="panel" aria-labelledby="h-db"><h3 id="h-db">Справочник (на 100 г)</h3>
    <p class="muted" style="margin:0">Ориентировъчни стойности. Сортирани по фибри, за да виждаш кое помага най-много.</p>
    ${[...new Set(FOODS.map(f => f.cat))].map(c => `<details><summary>${esc(c)}</summary><div class="tbl"><table><thead><tr><th>Храна</th><th class="r">kcal</th><th class="r">Протеин</th><th class="r">Фибри</th></tr></thead><tbody>${FOODS.filter(f => f.cat===c).sort((a,b) => b.fib-a.fib).map(f => `<tr><td>${esc(f.n)}</td><td class="r">${r0(f.kcal)}</td><td class="r">${r1(f.p)}</td><td class="r">${r1(f.fib)}</td></tr>`).join('')}</tbody></table></div></details>`).join('')}
  </section>`;
  main.querySelectorAll('[data-mealname]').forEach(i => i.onchange = () => { const m = DB.meals.find(x => x.id===i.dataset.mealname); if(m){ m.n = i.value.trim() || m.n; save(); toast('Името е сменено'); } });
  main.querySelectorAll('[data-delmeal]').forEach(b => b.onclick = () => { DB.meals = DB.meals.filter(m => m.id!==b.dataset.delmeal); save(); showFoods(); });
  main.querySelectorAll('[data-delfood]').forEach(b => b.onclick = () => { DB.custom = DB.custom.filter(f => f.id!==b.dataset.delfood); DB.fav = DB.fav.filter(x => x!==b.dataset.delfood); save(); showFoods(); });
  document.getElementById('cf').onsubmit = e => {
    e.preventDefault(); const v = id => num(document.getElementById(id).value);
    const k = v('cfk'); if(k==null){ toast('Въведи калориите'); return; }
    const pg = v('cfpg'), pn = document.getElementById('cfpn').value.trim();
    const f = {id:'c_'+uid(), n:document.getElementById('cfn').value.trim(), kcal:k, p:v('cfp')||0, f:v('cff')||0, c:v('cfc')||0, fib:v('cffb')||0, por: pg ? [[pn || 'порция', pg]] : [], u:document.getElementById('cfu').value, cat:'Мои храни'};
    DB.custom.push(f); DB.fav.push(f.id); save(); toast('Храната е запазена и е в „Любими“'); showFoods();
  };
}

/* ---------- цели ---------- */
let pendingImport = null;
function showGoals(){
  const T = DB.targets;
  main.innerHTML = `<section class="panel" aria-labelledby="h-g"><h3 id="h-g">Дневни цели</h3>
    <form id="tg" class="form">${Object.keys(DEF_T).map(k => `<label class="f">${T_LABEL[k][0]}, ${T_LABEL[k][1]} от<input class="num" id="t-${k}-0" inputmode="numeric" value="${T[k][0]}"></label><label class="f">до<input class="num" id="t-${k}-1" inputmode="numeric" value="${T[k][1]}"></label>`).join('')}
    <div class="wide row"><button class="btn" type="submit">Запази целите</button><button class="btn ghost" type="button" id="tdef">По плана</button></div></form>
    <p class="muted" style="margin:0">По плана: 2300–2400 kcal, 170–190 г протеин, 35–45 г фибри, 3–3,5 л вода. Ако теглото не пада 2 седмици, свали калориите с ~150.</p></section>
  <section class="panel" aria-labelledby="h-tp"><h3 id="h-tp">Как да се храниш</h3><ul class="tips">
    <li>Без закуска: хранене между ~12:00 и 20:30 – обяд, междинно, вечеря. Сутрин вода, кафе или чай без захар.</li>
    <li>Чинията: половин зеленчуци, четвърт протеин (2 длани), четвърт въглехидрати (1–2 шепи), мазнина колкото палец.</li>
    <li>80/20: около 300–450 kcal на ден са свободни (десерт, бира). Слагай ги в „Друго“.</li>
    <li>Фибрите вдигай постепенно, с ~5 г на седмица и повече вода, иначе ще подуваш.</li>
    <li>Протеин във всяко хранене. Ако вечерта не стигаш 170 г, добави скир или шейк.</li></ul>
    <p class="muted" style="margin:0">Целият план е в <a href="${PLAN_URL}" target="_blank" rel="noopener">документа</a>. Тренировките са в <a href="../">приложението за тренировки</a>.</p></section>
  <section class="panel" aria-labelledby="h-bk"><h3 id="h-bk">Резервно копие</h3>
    <p class="muted" style="margin:0">Данните стоят само на това устройство. Тегли архив от време на време, например в iCloud Drive.</p>
    <div class="row"><button class="btn small" type="button" id="dl">Изтегли архив</button><button class="btn ghost small" type="button" id="cp">Копирай като текст</button>
      <label class="btn ghost small" for="imp">Внеси от файл</label><input type="file" id="imp" accept="application/json,.json" hidden></div>
    <details><summary class="muted">Внеси от поставен текст</summary><div class="row" style="margin-top:8px"><textarea id="imptxt" rows="3" style="width:100%;font:13px monospace" aria-label="Текст на архива"></textarea><button class="btn ghost small" type="button" id="imptxtbtn">Провери текста</button></div></details>
    <div id="impconfirm"></div></section>
  <p class="muted">Версия ${APP_VERSION}</p>`;
  document.getElementById('tg').onsubmit = e => {
    e.preventDefault(); const nt = {};
    for(const k of Object.keys(DEF_T)){ const a = num(document.getElementById(`t-${k}-0`).value), b = num(document.getElementById(`t-${k}-1`).value);
      if(a==null || b==null || a<=0 || b<a){ toast(`Провери „${T_LABEL[k][0]}“: „от“ трябва да е по-малко от „до“`); return; } nt[k] = [a,b]; }
    DB.targets = nt; save(); toast('Целите са запазени');
  };
  document.getElementById('tdef').onclick = () => { DB.targets = clone(DEF_T); save(); showGoals(); toast('Върнати са целите по плана'); };
  document.getElementById('dl').onclick = () => {
    const blob = new Blob([JSON.stringify(exportObj(), null, 1)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hranene-arhiv-${today()}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  document.getElementById('cp').onclick = async () => { try{ await navigator.clipboard.writeText(JSON.stringify(exportObj())); toast('Архивът е копиран'); }catch(e){ toast('Не успях да копирам. Ползвай „Изтегли архив“.'); } };
  document.getElementById('imp').onchange = e => { const f = e.target.files[0]; if(!f) return; f.text().then(checkImport); e.target.value = ''; };
  document.getElementById('imptxtbtn').onclick = () => checkImport(document.getElementById('imptxt').value);
}
const exportObj = () => ({app:'hranene', v:1, exported:new Date().toISOString(), data:DB});
function checkImport(text){
  const box = document.getElementById('impconfirm');
  let o; try{ o = JSON.parse(text); }catch(e){ box.innerHTML = '<p class="muted">Това не е валиден архив.</p>'; return; }
  if(!o || o.app!=='hranene' || !o.data || typeof o.data.days!=='object'){ box.innerHTML = '<p class="muted">Това не е архив от приложението за хранене.</p>'; return; }
  pendingImport = o.data;
  box.innerHTML = `<p>Архивът съдържа ${Object.keys(o.data.days).length} дни. Ще замени сегашните данни (${Object.keys(DB.days).length} дни).</p><div class="row"><button class="btn danger small" type="button" id="impgo">Замени данните</button><button class="btn ghost small" type="button" id="impno">Отказ</button></div>`;
  document.getElementById('impgo').onclick = () => { DB = Object.assign(blank(), pendingImport); save(); pendingImport = null; toast('Данните са внесени'); route(); };
  document.getElementById('impno').onclick = () => { pendingImport = null; box.innerHTML = ''; };
}

/* ---------- съобщения ---------- */
let tt = null;
function toast(m){ const t = document.getElementById('toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 2400); }
function toastUndo(m, fn){ const t = document.getElementById('toast'); t.innerHTML = `${esc(m)} <button type="button" class="btn small" style="margin-left:8px">Върни</button>`; t.style.display = 'block'; t.querySelector('button').onclick = () => { fn(); t.style.display = 'none'; }; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 4000); }

/* ---------- старт ---------- */
route();
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(() => {});
