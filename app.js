'use strict';
/* =========================================================
   Тренировки — програма A/B/C (+D), дневник, прогрес, архив
   Данните се пазят в localStorage на устройството.
   ========================================================= */
const APP_VERSION = '1.0';
const GOAL_KG = 85;
const PLAN_URL = 'https://claude.ai/artifact/NqokyyQePUmkS5NmxhqKhT';

/* ---------- програма ---------- */
const W = {
 A:{name:'Тренировка A',time:'~55 мин',focus:'Клек, гърди, гръб, задно бедро, рамене, ръце, корем.',ex:[
  {id:'a1',fig:'goblet',eq:'db',n:'Гоблет клек с дъмбел',sets:3,reps:'10–12',rest:90,cues:['Дъмбелът вертикално пред гърдите','Сядай между петите, гърдите нагоре','Издишай, докато ставаш']},
  {id:'a2',fig:'dbpress',eq:'db',n:'Лежанка с дъмбели',alt:'или машина за гърди',sets:3,reps:'10–12',rest:90,cues:['Лопатките прибрани към пейката','Спускай до гърдите за 2 сек','Издишай при избутване']},
  {id:'a3',fig:'pulldown',eq:'machine',n:'Лат пулдаун (горен скрипец)',sets:3,reps:'10–12',rest:90,cues:['Хват малко по-широк от раменете','Дърпай лоста към горната част на гърдите','Без люлеене с тялото']},
  {id:'a4',fig:'rdl',eq:'db',n:'Румънска мъртва тяга с дъмбели',sets:3,reps:'12',rest:90,cues:['Леко свити колене, гръбът прав','Бутай таза назад, дъмбелите се плъзгат по краката','Лека до умерена тежест, издишай нагоре']},
  {id:'a5',fig:'ohp',eq:'db',n:'Раменна преса с дъмбели седешком',sets:3,reps:'10–12',rest:75,cues:['Гърбът опрян на облегалката','От нивото на ушите до горе','Без извиване в кръста']},
  {id:'a6',fig:'curl',eq:'db',n:'Сгъване за бицепс',ss:'Суперсерия с 7',sets:2,reps:'12–15',rest:0,cues:['Лактите остават до тялото','Бавно надолу за 2 сек','Веднага след това – упражнение 7']},
  {id:'a7',fig:'pushdown',eq:'machine',n:'Трицепс на скрипец',ss:'Суперсерия с 6',sets:2,reps:'12–15',rest:60,cues:['Лактите заключени до тялото','Разгъни докрай','Почивката е след двете упражнения']},
  {id:'a8',fig:'deadbug',eq:'bw',n:'Dead bug',sets:3,reps:'8 на страна',rest:45,cues:['Кръстът е притиснат в пода','Изпъвай противоположни ръка и крак','Дишай нормално през цялото време']}]},
 B:{name:'Тренировка B',time:'~55 мин',focus:'Лег преса, гръб, горни гърди, седалище, рамене, задно бедро, корем.',ex:[
  {id:'b1',fig:'legpress',eq:'machine',n:'Лег преса',sets:3,reps:'12–15',rest:90,cues:['Умерена тежест','Колене до ~90°, кръстът остава на облегалката','Издишай при избутване, не заключвай коленете']},
  {id:'b2',fig:'dbrow',eq:'db',n:'Гребане с дъмбел с опора',sets:3,reps:'10–12 на ръка',rest:75,cues:['Коляно и ръка на пейката, гръб успореден на пода','Дърпай лакътя към хълбока','Издишай при издърпване']},
  {id:'b3',fig:'incline',eq:'db',n:'Наклонена лежанка с дъмбели (30°)',sets:3,reps:'10–12',rest:90,cues:['Облегалката на ниска позиция','Спускай до горната част на гърдите','Издишай при избутване']},
  {id:'b4',fig:'bridge',eq:'db',n:'Глутеус мост',alt:'с дъмбел на таза или на машина',sets:3,reps:'12',rest:75,cues:['Стъпалата на ширината на таза','Стисни седалището горе за 1 сек','Издишай при вдигане']},
  {id:'b5',fig:'lateral',eq:'db',n:'Странично повдигане с дъмбели',sets:3,reps:'12–15',rest:60,cues:['Леко свити лакти','Вдигай до височината на раменете','Лека тежест, без засилване']},
  {id:'b6',fig:'legcurl',eq:'machine',n:'Сгъване на крака на машина',sets:3,reps:'12–15',rest:60,cues:['Валякът над петите','Сгъни докрай, връщай бавно','Тазът не се отлепя от седалката']},
  {id:'b7',fig:'pallof',eq:'machine',n:'Pallof press на скрипец',sets:3,reps:'10 на страна',rest:45,cues:['Застани странично на скрипеца','Избутай ръцете напред и задръж 2 сек','Не позволявай на тялото да се завърти']}]},
 C:{name:'Тренировка C',time:'~55 мин',focus:'Напади, гърди, гръб, предно бедро, задни рамене, ръце, корем.',ex:[
  {id:'c1',fig:'lunge',eq:'db',n:'Напади назад с дъмбели',sets:3,reps:'10 на крак',rest:90,cues:['Голяма крачка назад','Задното коляно почти до пода','Тежестта на предната пета']},
  {id:'c2',fig:'pushup',eq:'bw',n:'Лицеви опори',alt:'или машина за гърди',sets:3,reps:'10–15',rest:75,cues:['Тялото в права линия','Твърде трудно? Ръцете на пейка','Издишай при избутване']},
  {id:'c3',fig:'cablerow',eq:'machine',n:'Долен скрипец седешком',sets:3,reps:'10–12',rest:75,cues:['Гърдите напред, гръбът прав','Дърпай дръжката към пъпа','Стисни лопатките за 1 сек']},
  {id:'c4',fig:'legext',eq:'machine',n:'Разгъване на крака на машина',sets:3,reps:'12–15',rest:60,cues:['Валякът на глезените','Задръж 1 сек горе','Връщай бавно']},
  {id:'c5',fig:'facepull',eq:'machine',n:'Face pull на скрипец',sets:3,reps:'12–15',rest:60,cues:['Въжето на нивото на лицето','Дърпай към челото, лактите високо','Стисни лопатките']},
  {id:'c6',fig:'curl',eq:'db',n:'Чук-сгъване',ss:'Суперсерия с 7',sets:2,reps:'12',rest:0,cues:['Дланите една срещу друга','Лактите до тялото','Веднага след това – упражнение 7']},
  {id:'c7',fig:'french',eq:'db',n:'Френско разгъване с дъмбел седешком',ss:'Суперсерия с 6',sets:2,reps:'12',rest:60,cues:['Държиш един дъмбел с две ръце','Лактите сочат нагоре и не се разтварят','Почивката е след двете упражнения']},
  {id:'c8',fig:'sideplank',eq:'bw',unit:'sec',n:'Странична планка',sets:3,reps:'20–30 сек на страна',rest:45,cues:['Лакътят под рамото','Тялото в права линия','Дишай нормално, не стискай зъби']}]},
 D:{name:'Тренировка D',time:'~45 мин',opt:true,focus:'По избор, лека. 3 кръга подред без почивка между упражненията, 90 сек между кръговете. След това 20–30 мин ходене по наклон или елиптична.',ex:[
  {id:'d1',fig:'stepup',eq:'bw',n:'Степ-ъп на ниска пейка',sets:3,reps:'10 на крак',rest:0,round:true,cues:['Цялото стъпало на пейката','Изправи се с предния крак, без отскок']},
  {id:'d2',fig:'pushup',eq:'bw',n:'Лицеви опори',sets:3,reps:'10–12',rest:0,round:true,cues:['Може с ръце на пейка','Тялото в права линия']},
  {id:'d3',fig:'bandrow',eq:'machine',n:'Гребане на скрипец или с ластик',sets:3,reps:'15',rest:0,round:true,cues:['Лактите назад покрай тялото','Стисни лопатките']},
  {id:'d4',fig:'goblet',eq:'db',n:'Лек гоблет клек',sets:3,reps:'12',rest:0,round:true,cues:['Лек дъмбел','Издишай при ставане']},
  {id:'d5',fig:'birddog',eq:'bw',n:'Bird dog',sets:3,reps:'8 на страна',rest:90,round:true,cues:['Противоположни ръка и крак','Гърбът неподвижен като маса','Почивка 90 сек, после следващ кръг']}]}
};
const ORDER = ['A','B','C'];
const EX = {};
for (const [L,w] of Object.entries(W)) for (const x of w.ex) EX[x.id] = {...x, w:L};
const range = r => { const m = String(r).match(/(\d+)(?:\s*–\s*(\d+))?/); return m ? [+m[1], +(m[2]||m[1])] : [0,0]; };

/* ---------- данни ---------- */
const KEY = 'trn:v1';
const blank = () => ({v:1, sessions:[], draft:{}, body:[]});
let DB = load();
function load(){ try{ const s = localStorage.getItem(KEY); return s ? Object.assign(blank(), JSON.parse(s)) : blank(); }catch(e){ return blank(); } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){ toast('Не успях да запиша данните. Провери свободното място.'); } }
let persistAsked = false;
function askPersist(){ if(persistAsked) return; persistAsked = true; try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){} }

const today = () => new Date().toLocaleDateString('sv-SE');
const fmtD = d => { const p = d.split('-'); return p[2]+'.'+p[1]; };
const fmtDY = d => { const p = d.split('-'); return p[2]+'.'+p[1]+'.'+p[0].slice(2); };
const num = v => { if(v==null || v==='') return null; const n = parseFloat(String(v).replace(',','.')); return isFinite(n) ? n : null; };
const fmtN = n => n==null ? '' : String(Math.round(n*10)/10).replace('.',',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayNum = d => { const p = d.split('-').map(Number); return Date.UTC(p[0],p[1]-1,p[2])/864e5; };

function nextLetter(){ const last = [...DB.sessions].reverse().find(s => ORDER.includes(s.w)); return last ? ORDER[(ORDER.indexOf(last.w)+1)%3] : 'A'; }
function lastSets(id){ for(let i=DB.sessions.length-1;i>=0;i--){ const s = DB.sessions[i].sets[id]; if(s && s.length) return {date:DB.sessions[i].date, sets:s}; } return null; }
function draftFor(L){ return DB.draft[L] || (DB.draft[L] = {}); }
function readyUp(x){ const l = lastSets(x.id); if(!l) return false; const max = range(x.reps)[1]; return l.sets.length >= x.sets && l.sets.every(s => (s.reps||0) >= max); }
function upText(x){ if(x.unit==='sec') return 'Готов за +5 сек'; if(x.eq==='bw') return 'Готов за по-труден вариант'; if(x.eq==='machine') return 'Готов за +2,5–5 кг'; return 'Готов за +1–2 кг'; }
const setStr = (s,x) => x.eq==='bw' ? (s.reps??'–')+(x.unit==='sec'?' сек':'') : `${fmtN(s.kg)||'–'}×${s.reps??'–'}`;

/* ---------- навигация ---------- */
const TABS = [['A','a'],['B','b'],['C','c'],['D','d'],['Прогрес','progress'],['Правила','rules']];
const tabsEl = document.getElementById('tabs'), main = document.getElementById('main');
let cur = null;
function setHeader(){
  const n = nextLetter(), last = DB.sessions[DB.sessions.length-1];
  document.getElementById('next').innerHTML = `Следваща: <b>Тренировка ${n}</b>` + (last ? ` · последна ${last.w} на ${fmtD(last.date)}` : '');
  tabsEl.innerHTML = TABS.map(([l,h]) => `<button type="button" role="tab" aria-selected="${cur===h}" data-h="${h}">${l.length===1?'Тренировка '+l:l}${l===n?'<span class="dot" aria-label="следваща"></span>':''}</button>`).join('');
  const sel = tabsEl.querySelector('[aria-selected="true"]'); if(sel) sel.scrollIntoView({inline:'nearest',block:'nearest'});
}
tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if(b) location.hash = b.dataset.h; });
function route(){
  const h = (location.hash||'').slice(1).toLowerCase();
  cur = TABS.some(t => t[1]===h) ? h : nextLetter().toLowerCase();
  figs = []; if(io) io.disconnect();
  setHeader();
  if(cur==='rules') showRules(); else if(cur==='progress') showProgress(); else showWorkout(cur.toUpperCase());
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', route);

/* ---------- тренировка ---------- */
function setRows(x, L){
  const d = draftFor(L)[x.id] || [], last = lastSets(x.id), nokg = x.eq==='bw', mn = range(x.reps)[0];
  const word = x.round ? 'Кръг' : 'Серия', unit = x.unit==='sec' ? 'сек' : 'повт.';
  let h = '<div class="sets">';
  for(let k=0;k<x.sets;k++){
    const c = d[k] || {}, ls = last && last.sets[k];
    const phKg = ls && ls.kg!=null ? fmtN(ls.kg) : '–', phR = ls && ls.reps!=null ? ls.reps : mn;
    h += `<div class="setrow${nokg?' nokg':''}${c.done?' done':''}" data-ex="${x.id}" data-k="${k}">
      <span class="n" aria-hidden="true">${k+1}</span>
      ${nokg ? '' : `<label class="fld"><input id="kg-${x.id}-${k}" data-f="kg" inputmode="decimal" autocomplete="off" aria-label="${word} ${k+1}, килограми" placeholder="${esc(phKg)}" value="${c.kg!=null?fmtN(c.kg):''}"><span>кг</span></label><span class="x" aria-hidden="true">×</span>`}
      <label class="fld"><input id="r-${x.id}-${k}" data-f="reps" inputmode="numeric" autocomplete="off" aria-label="${word} ${k+1}, ${x.unit==='sec'?'секунди':'повторения'}" placeholder="${phR}" value="${c.reps!=null?c.reps:''}"><span>${unit}</span></label>
      <button type="button" class="ok" aria-pressed="${!!c.done}" aria-label="${word} ${k+1} е готова">✓</button></div>`;
  }
  return h + '</div>';
}
let wakeLock = null, wantWake = false;
async function setWake(on){
  wantWake = on;
  try{
    if(on && 'wakeLock' in navigator){ wakeLock = await navigator.wakeLock.request('screen'); }
    else if(wakeLock){ await wakeLock.release(); wakeLock = null; }
  }catch(e){ wantWake = false; toast('Телефонът не позволява екранът да остане включен.'); }
  const b = document.getElementById('wake'); if(b) b.setAttribute('aria-pressed', wantWake);
}
document.addEventListener('visibilitychange', () => { if(wantWake && document.visibilityState==='visible') setWake(true); });

function showWorkout(L){
  const w = W[L], last = lastSets(w.ex[0].id);
  let h = `<div class="intro"><h2>${w.name}</h2><p>${w.time} · ${esc(w.focus)}</p>
    <p>Загрявка 5–8 мин: бързо ходене + 1–2 леки серии на първото упражнение. Сивите числа в полетата са от миналия път. Докосни фигура, за да я спреш.</p>
    ${'wakeLock' in navigator ? `<div class="row"><button type="button" class="btn ghost small" id="wake" aria-pressed="${wantWake}">Екранът да не загасва</button></div>` : ''}</div><div class="grid">`;
  w.ex.forEach((x,i) => {
    h += `<article class="card"><div class="stage" tabindex="0" role="button" aria-label="Пауза на анимацията: ${esc(x.n)}"><span class="num">${i+1}</span><span class="paused">пауза</span><svg viewBox="10 -12 180 165" data-fig="${x.fig}" aria-hidden="true"></svg></div>
    <div class="body"><div><h3>${esc(x.n)}</h3>${x.alt?`<div class="alt">${esc(x.alt)}</div>`:''}</div>
    <div class="chips"><span class="chip">${x.sets} × ${esc(x.reps)}</span>${x.rest?`<span class="chip">почивка ${x.rest} с</span>`:(x.round?'<span class="chip">без почивка</span>':'')}${x.ss?`<span class="chip ss">${x.ss}</span>`:''}${readyUp(x)?`<span class="chip up">↑ ${upText(x)}</span>`:''}</div>
    <ul class="cues">${x.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    ${setRows(x,L)}</div></article>`;
  });
  h += `</div><div class="finish"><button type="button" class="btn" id="finish">Завърши ${w.name.toLowerCase()}</button><button type="button" class="btn ghost" id="reset">Изчисти</button></div>`;
  main.innerHTML = h;
  main.querySelectorAll('svg[data-fig]').forEach(s => figs.push({el:s, fig:FIG[s.dataset.fig], paused:false, vis:true}));
  attachFigs();
  const wk = document.getElementById('wake'); if(wk) wk.onclick = () => setWake(!wantWake);
  document.getElementById('finish').onclick = () => finish(L);
  let armed = false;
  document.getElementById('reset').onclick = e => {
    if(!armed){ armed = true; e.target.textContent = 'Сигурен ли си? Натисни пак'; setTimeout(() => { armed = false; if(e.target.isConnected) e.target.textContent = 'Изчисти'; }, 3000); return; }
    delete DB.draft[L]; save(); route();
  };
}
function finish(L){
  const d = draftFor(L), sets = {};
  for(const x of W[L].ex){ const arr = (d[x.id]||[]).filter(s => s && s.done).map(s => ({kg:s.kg??null, reps:s.reps??null})); if(arr.length) sets[x.id] = arr; }
  if(!Object.keys(sets).length){ toast('Отметни поне една серия с ✓'); return; }
  DB.sessions.push({id:Date.now(), date:today(), w:L, sets});
  delete DB.draft[L]; save(); stopRest(); setWake(false);
  toast(`Записано. Следваща: Тренировка ${nextLetter()}`);
  location.hash = 'progress'; if(cur==='progress') route();
}
main.addEventListener('input', e => {
  const i = e.target, row = i.closest && i.closest('.setrow'); if(!row) return;
  const L = cur.toUpperCase(), id = row.dataset.ex, k = +row.dataset.k, d = draftFor(L);
  const arr = d[id] || (d[id] = []); const s = arr[k] || (arr[k] = {});
  s[i.dataset.f] = i.dataset.f==='kg' ? num(i.value) : (num(i.value)==null ? null : Math.round(num(i.value)));
  save();
});
main.addEventListener('click', e => {
  const ok = e.target.closest('.ok');
  if(ok){
    askPersist(); unlockAudio();
    const row = ok.closest('.setrow'), L = cur.toUpperCase(), id = row.dataset.ex, k = +row.dataset.k, x = EX[id];
    const d = draftFor(L), arr = d[id] || (d[id] = []), s = arr[k] || (arr[k] = {});
    s.done = !s.done;
    if(s.done){
      const kgI = row.querySelector('[data-f="kg"]'), rI = row.querySelector('[data-f="reps"]');
      if(kgI && s.kg==null){ s.kg = num(kgI.placeholder); if(s.kg!=null) kgI.value = fmtN(s.kg); }
      if(s.reps==null){ s.reps = num(rI.placeholder); if(s.reps!=null) rI.value = s.reps; }
      if(x.rest) startRest(x.rest, x.n);
    }
    row.classList.toggle('done', s.done); ok.setAttribute('aria-pressed', s.done);
    save(); return;
  }
  const st = e.target.closest('.stage'); if(st) togglePause(st);
});
main.addEventListener('keydown', e => { const st = e.target.closest && e.target.closest('.stage'); if(st && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); togglePause(st); } });
function togglePause(st){ const f = figs.find(f => st.contains(f.el)); if(!f) return; f.paused = !f.paused; st.classList.toggle('is-paused', f.paused); }

/* ---------- графики ---------- */
function lineChart(pts, opt={}){
  if(!pts.length) return '<p class="muted">Още няма записи.</p>';
  const Wd=640, H=230, pl=44, pr=58, pt=14, pb=28;
  const xs = pts.map(p => dayNum(p.d)); let x0 = Math.min(...xs), x1 = Math.max(...xs); if(x1===x0){ x0 -= 3; x1 += 3; }
  let ys = pts.map(p => p.y); if(opt.avg) ys = ys.concat(opt.avg.map(a => a.y)); if(opt.target!=null) ys.push(opt.target);
  let y0 = Math.min(...ys), y1 = Math.max(...ys); const pad = Math.max((y1-y0)*0.15, opt.minPad||1); y0 -= pad; y1 += pad;
  const X = v => pl + (v-x0)/(x1-x0)*(Wd-pl-pr), Y = v => pt + (1-(v-y0)/(y1-y0))*(H-pt-pb);
  let s = `<svg class="chart" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(opt.label||'Графика')}">`;
  for(let i=0;i<=4;i++){ const v = y0 + (y1-y0)*i/4, y = Y(v); s += `<line class="grid" x1="${pl}" x2="${Wd-pr}" y1="${y}" y2="${y}"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${fmtN(Math.round(v*10)/10)}</text>`; }
  if(opt.target!=null && opt.target>y0 && opt.target<y1){ const y = Y(opt.target); s += `<line class="tgt" x1="${pl}" x2="${Wd-pr}" y1="${y}" y2="${y}"/><text x="${Wd-pr+4}" y="${y+4}" style="fill:var(--ok)">цел ${opt.target}</text>`; }
  const line = arr => arr.map((p,i) => (i?'L':'M') + X(dayNum(p.d)).toFixed(1) + ',' + Y(p.y).toFixed(1)).join(' ');
  if(opt.avg){
    s += pts.map(p => `<circle class="pt2" cx="${X(dayNum(p.d)).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3"/>`).join('');
    s += `<path class="ln" d="${line(opt.avg)}"/>`;
    const e = opt.avg[opt.avg.length-1]; s += `<circle class="pt" cx="${X(dayNum(e.d))}" cy="${Y(e.y)}" r="5"/><text class="lbl" x="${X(dayNum(e.d))+8}" y="${Y(e.y)+4}">${fmtN(e.y)}</text>`;
  }else{
    const base = Y(y0);
    if(pts.length>1) s += `<path class="area" d="${line(pts)} L${X(dayNum(pts[pts.length-1].d)).toFixed(1)},${base} L${X(dayNum(pts[0].d)).toFixed(1)},${base} Z"/>`;
    s += `<path class="ln" d="${line(pts)}"/>` + pts.map(p => `<circle class="pt" cx="${X(dayNum(p.d)).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5"/>`).join('');
    const e = pts[pts.length-1]; s += `<text class="lbl" x="${X(dayNum(e.d))+8}" y="${Y(e.y)+4}">${fmtN(e.y)}${opt.unit||''}</text>`;
  }
  s += `<text x="${pl}" y="${H-6}">${fmtD(pts[0].d)}</text>`;
  if(pts.length>1) s += `<text x="${Wd-pr}" y="${H-6}" text-anchor="end">${fmtD(pts[pts.length-1].d)}</text>`;
  return s + '</svg>';
}
function bodyAvg(){ const b = [...DB.body].sort((a,c) => a.date<c.date?-1:1); return b.map(e => { const n = dayNum(e.date), w = b.filter(o => { const m = dayNum(o.date); return m<=n && m>n-7; }); return {d:e.date, y:w.reduce((a,o)=>a+o.kg,0)/w.length}; }); }
function windowAvg(fromDays, toDays){ const t = dayNum(today()), w = DB.body.filter(o => { const m = t-dayNum(o.date); return m>=fromDays && m<toDays; }); return w.length ? w.reduce((a,o)=>a+o.kg,0)/w.length : null; }

/* ---------- прогрес ---------- */
let selEx = null, pendingImport = null;
function showProgress(){
  const b = [...DB.body].sort((a,c) => a.date<c.date?-1:1), lastB = b[b.length-1];
  const a7 = windowAvg(0,7), p7 = windowAvg(7,14), diff = a7!=null && p7!=null ? a7-p7 : null;
  const withData = Object.values(EX).filter(x => lastSets(x.id));
  if(!selEx || !EX[selEx]) selEx = (withData[0] || EX.a1).id;
  const x = EX[selEx];
  const exPts = DB.sessions.filter(s => s.sets[x.id]).map(s => ({d:s.date, y: x.eq==='bw' ? Math.max(...s.sets[x.id].map(z => z.reps||0)) : Math.max(...s.sets[x.id].map(z => z.kg||0))}));
  const exRows = DB.sessions.filter(s => s.sets[x.id]).slice(-8).reverse();
  const sess = DB.sessions.slice(-15).reverse();
  const vol = s => Object.entries(s.sets).reduce((a,[id,arr]) => a + (EX[id] && EX[id].eq!=='bw' ? arr.reduce((q,z) => q + (z.kg||0)*(z.reps||0), 0) : 0), 0);
  const opts = Object.entries(W).map(([L,w]) => `<optgroup label="${w.name}">${w.ex.map(e => `<option value="${e.id}"${e.id===selEx?' selected':''}>${esc(e.n)}${lastSets(e.id)?'':' (няма записи)'}</option>`).join('')}</optgroup>`).join('');
  main.innerHTML = `<div class="stack">
  <div class="intro"><h2>Прогрес</h2><p>Тегло, тежести и всички записани тренировки.</p></div>
  <section class="panel" aria-labelledby="h-body"><h3 id="h-body">Тегло</h3>
    <div class="kpis">
      <div class="kpi"><b>${lastB?fmtN(lastB.kg):'–'}</b><span>последно, кг${lastB?' ('+fmtD(lastB.date)+')':''}</span></div>
      <div class="kpi"><b>${a7!=null?fmtN(a7):'–'}</b><span>средно 7 дни</span></div>
      <div class="kpi"><b style="color:${diff==null?'inherit':diff<=0?'var(--ok)':'var(--warn)'}">${diff==null?'–':(diff>0?'+':'')+fmtN(diff)}</b><span>спрямо предната седмица</span></div>
      <div class="kpi"><b>${a7!=null?fmtN(Math.max(0,a7-GOAL_KG)):'–'}</b><span>до ${GOAL_KG} кг</span></div>
    </div>
    <form class="row" id="bodyform"><label class="muted" for="bodykg">Сутрешно тегло днес</label><input class="inp" id="bodykg" inputmode="decimal" autocomplete="off" placeholder="${lastB?fmtN(lastB.kg):'96,5'}"><button class="btn small" type="submit">Запиши</button>${b.length?'<button class="btn ghost small" type="button" id="bodyundo">Изтрий последния</button>':''}</form>
    ${lineChart(b.map(e => ({d:e.date, y:e.kg})), {avg:bodyAvg(), target:GOAL_KG, label:'Тегло и средно за 7 дни'})}
    ${b.length?'<p class="muted">Точките са дневните записи, линията е средното за 7 дни. Гледай линията, не отделния ден.</p>':''}
  </section>
  <section class="panel" aria-labelledby="h-ex"><h3 id="h-ex">Упражнение</h3>
    <select id="exsel" aria-label="Избери упражнение">${opts}</select>
    ${lineChart(exPts, {unit: x.eq==='bw' ? (x.unit==='sec'?' сек':' повт.') : ' кг', label:'Най-тежка серия по дати', minPad: x.eq==='bw'?2:1})}
    <p class="muted">${x.eq==='bw' ? 'Най-много повторения в серия' : 'Най-тежка серия'} за всяка тренировка.${readyUp(x)?' <b style="color:var(--ok)">'+upText(x)+'.</b>':''}</p>
    ${exRows.length ? `<div class="tbl"><table><thead><tr><th>Дата</th><th>Серии</th></tr></thead><tbody>${exRows.map(s => `<tr><td>${fmtDY(s.date)}</td><td>${s.sets[x.id].map(z => setStr(z,x)).join(', ')}</td></tr>`).join('')}</tbody></table></div>` : ''}
  </section>
  <section class="panel" aria-labelledby="h-s"><h3 id="h-s">Тренировки</h3>
    ${sess.length ? `<div class="tbl"><table><thead><tr><th>Дата</th><th>Тренировка</th><th>Серии</th><th>Обем, кг</th></tr></thead><tbody>${sess.map(s => `<tr><td>${fmtDY(s.date)}</td><td>${s.w}</td><td>${Object.values(s.sets).reduce((a,v)=>a+v.length,0)}</td><td>${Math.round(vol(s)).toLocaleString('bg-BG')}</td></tr>`).join('')}</tbody></table></div><p class="muted">Общо ${DB.sessions.length} тренировки. Обемът е сумата от кг × повторения.</p>` : '<p class="muted">Още няма завършени тренировки. Отмяташ сериите с ✓ и натискаш „Завърши“ най-долу.</p>'}
  </section>
  <section class="panel" aria-labelledby="h-bk"><h3 id="h-bk">Резервно копие</h3>
    <p class="muted" style="margin:0">Данните стоят само на това устройство. Тегли архив от време на време, например в iCloud Drive.</p>
    <div class="row"><button class="btn small" type="button" id="dl">Изтегли архив</button><button class="btn ghost small" type="button" id="cp">Копирай като текст</button>
      <label class="btn ghost small" for="imp">Внеси от файл</label><input type="file" id="imp" accept="application/json,.json" hidden></div>
    <details><summary class="muted">Внеси от поставен текст</summary><div class="row" style="margin-top:8px"><textarea id="imptxt" rows="3" style="width:100%;font:13px monospace;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--ink);padding:8px" aria-label="Текст на архива"></textarea><button class="btn ghost small" type="button" id="imptxtbtn">Провери текста</button></div></details>
    <div id="impconfirm"></div>
  </section></div>`;
  document.getElementById('exsel').onchange = e => { selEx = e.target.value; showProgress(); };
  document.getElementById('bodyform').onsubmit = e => {
    e.preventDefault(); askPersist();
    const v = num(document.getElementById('bodykg').value);
    if(v==null || v<30 || v>250){ toast('Въведи теглото в кг, напр. 96,4'); return; }
    const t = today(); DB.body = DB.body.filter(o => o.date!==t); DB.body.push({date:t, kg:v}); save(); toast('Записано'); showProgress();
  };
  const bu = document.getElementById('bodyundo');
  if(bu) bu.onclick = () => { const s = [...DB.body].sort((a,c) => a.date<c.date?-1:1); s.pop(); DB.body = s; save(); showProgress(); };
  document.getElementById('dl').onclick = () => {
    const blob = new Blob([JSON.stringify(exportObj(), null, 1)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `trenirovki-arhiv-${today()}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  document.getElementById('cp').onclick = async () => { try{ await navigator.clipboard.writeText(JSON.stringify(exportObj())); toast('Архивът е копиран'); }catch(e){ toast('Не успях да копирам. Ползвай „Изтегли архив“.'); } };
  document.getElementById('imp').onchange = e => { const f = e.target.files[0]; if(!f) return; f.text().then(checkImport); e.target.value=''; };
  document.getElementById('imptxtbtn').onclick = () => checkImport(document.getElementById('imptxt').value);
}
const exportObj = () => ({app:'trenirovki', v:1, exported:new Date().toISOString(), data:{sessions:DB.sessions, body:DB.body, draft:DB.draft}});
function checkImport(text){
  const box = document.getElementById('impconfirm');
  let o; try{ o = JSON.parse(text); }catch(e){ box.innerHTML = '<p class="muted">Това не е валиден архив.</p>'; return; }
  if(!o || o.app!=='trenirovki' || !o.data || !Array.isArray(o.data.sessions) || !Array.isArray(o.data.body)){ box.innerHTML = '<p class="muted">Това не е архив от това приложение.</p>'; return; }
  pendingImport = o.data;
  box.innerHTML = `<p>Архивът съдържа ${o.data.sessions.length} тренировки и ${o.data.body.length} записа на тегло. Ще замени сегашните данни (${DB.sessions.length} тренировки, ${DB.body.length} записа).</p><div class="row"><button class="btn danger small" type="button" id="impgo">Замени данните</button><button class="btn ghost small" type="button" id="impno">Отказ</button></div>`;
  document.getElementById('impgo').onclick = () => { DB = Object.assign(blank(), {sessions:pendingImport.sessions, body:pendingImport.body, draft:pendingImport.draft||{}}); save(); pendingImport = null; toast('Данните са внесени'); route(); };
  document.getElementById('impno').onclick = () => { pendingImport = null; box.innerHTML = ''; };
}

/* ---------- правила ---------- */
function showRules(){
  main.innerHTML = `<div class="stack rules">
  <div class="intro"><h2>Правила</h2><p>Кратката версия на плана. Целият план с храненето е в <a href="${PLAN_URL}" target="_blank" rel="noopener">документа</a>.</p></div>
  <div class="kpis">
   <div class="kpi"><b>2300–2400</b><span>kcal на ден</span></div>
   <div class="kpi"><b>170–190 g</b><span>протеин</span></div>
   <div class="kpi"><b>35–45 g</b><span>фибри</span></div>
   <div class="kpi"><b>3–3,5 l</b><span>вода</span></div>
   <div class="kpi"><b>8–10 хил.</b><span>стъпки</span></div>
  </div>
  <section class="panel"><h3>Заради хемороидите</h3><ul>
   <li>Издишай при усилието, вдишвай при спускането. Никога не задържай дъха.</li>
   <li>Тежест за 10–15 повторения с 2–3 в запас. Нищо под 8 повторения, без максимални опити.</li>
   <li>Не сядай на пейката между сериите – почивай прав.</li>
   <li>Кървене или болка след тренировка: намали тежестите и се консултирай с проктолог.</li></ul></section>
  <section class="panel"><h3>Как да вдигаш тежестите</h3><ul>
   <li>Когато във всички серии стигнеш горната граница на повторенията с 2 в запас, добави най-малката стъпка: 1–2 кг на дъмбел, 2,5–5 кг на машина. Приложението ти показва зелен знак „Готов за…“.</li>
   <li>Сивите числа в полетата са от миналия път. Натиснеш ли ✓ без да пишеш, се записват те.</li>
   <li>Пропуснат ден: продължаваш със следващата буква, не започваш отначало.</li></ul></section>
  <section class="panel"><h3>Седмица</h3><ul>
   <li>3 пъти: A, B, C (напр. пн, ср, пт) + разходка в събота.</li>
   <li>4 пъти: добави лека D в събота.</li>
   <li>Кардио: ходене по наклон, елиптична или плуване. Без дълго колоездене.</li>
   <li>Тегли се всяка сутрин след тоалетна и записвай в „Прогрес“.</li></ul></section>
  <p class="muted">Версия ${APP_VERSION}</p></div>`;
}

/* ---------- анимация ---------- */
let figs = [], io = null;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function attachFigs(){
  if(reduce){ figs.forEach(f => f.el.innerHTML = render(f.fig,1,true)); return; }
  if('IntersectionObserver' in window){
    io = new IntersectionObserver(es => es.forEach(en => { const f = figs.find(f => f.el===en.target); if(f) f.vis = en.isIntersecting; }));
    figs.forEach(f => io.observe(f.el));
  }
  figs.forEach(f => f.el.innerHTML = render(f.fig,0));
}
function phase(ms){ const c = (ms%3200)/3200; let s; if(c<.15) s=0; else if(c<.5) s=(c-.15)/.35; else if(c<.65) s=1; else s=1-(c-.65)/.35; return s*s*(3-2*s); }
function loop(ms){ const s = phase(ms); for(const f of figs){ if(f.vis && !f.paused) f.el.innerHTML = render(f.fig,s); } requestAnimationFrame(loop); }
if(!reduce) requestAnimationFrame(loop);

/* ---------- таймер за почивка ---------- */
let rest = {end:0,total:0,id:null}, actx = null;
const restEl = document.getElementById('rest');
function unlockAudio(){ try{ if(!actx){ const AC = window.AudioContext || window.webkitAudioContext; if(AC) actx = new AC(); } if(actx && actx.state==='suspended') actx.resume(); }catch(e){} }
function beep(){ try{ if(!actx) return; [0,.25,.5].forEach(t => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(actx.destination); o.start(actx.currentTime+t); o.stop(actx.currentTime+t+.15); }); }catch(e){} try{ navigator.vibrate && navigator.vibrate([200,100,200]); }catch(e){} }
function startRest(sec, name){ rest.total = sec; rest.end = Date.now()+sec*1000; document.getElementById('restl').textContent = 'Почивка след „'+name+'“'; restEl.classList.add('on'); tick(); clearInterval(rest.id); rest.id = setInterval(tick,250); }
function tick(){ const left = Math.max(0, rest.end-Date.now()), s = Math.ceil(left/1000);
  document.getElementById('restt').textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  document.getElementById('restbar').style.transform = `scaleX(${rest.total ? left/(rest.total*1000) : 0})`;
  if(left<=0){ stopRest(); beep(); toast('Следваща серия'); } }
function stopRest(){ clearInterval(rest.id); restEl.classList.remove('on'); }
document.getElementById('restskip').onclick = stopRest;
document.getElementById('rest15').onclick = () => { rest.end += 15000; rest.total += 15; tick(); };
let tt = null;
function toast(m){ const t = document.getElementById('toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 2400); }

/* ---------- старт ---------- */
route();
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(() => {});
