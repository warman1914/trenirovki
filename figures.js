/* Stick-figure renderer and exercise poses. Side view unless fig.front. */
/* ---------- skeleton figure ---------- */
const L={torso:42,neck:15,head:9,th:32,sh:32,ua:24,fa:22};
function ik(a,b,l1,l2,dir){
  const dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy);const base=Math.atan2(dy,dx);
  const dd=Math.min(Math.max(d,Math.abs(l1-l2)+.01),l1+l2-.01);
  const c=(l1*l1+dd*dd-l2*l2)/(2*l1*dd);const A=Math.acos(Math.max(-1,Math.min(1,c)));
  const ang=base+dir*A;const j=[a[0]+l1*Math.cos(ang),a[1]+l1*Math.sin(ang)];
  const ex=b[0]-j[0],ey=b[1]-j[1],ed=Math.hypot(ex,ey)||1;
  return [j,[j[0]+l2*ex/ed,j[1]+l2*ey/ed]];
}
const lerp=(a,b,s)=>a+(b-a)*s;
const lerp2=(a,b,s)=>[lerp(a[0],b[0],s),lerp(a[1],b[1],s)];
function norm(p){return {hip:p.hip,t:p.t||0,fN:p.fN,fF:p.fF||[p.fN[0]-4,p.fN[1]],hN:p.hN,hF:p.hF||[p.hN[0]-3,p.hN[1]]};}
function mix(p,q,s){return {hip:lerp2(p.hip,q.hip,s),t:lerp(p.t,q.t,s),fN:lerp2(p.fN,q.fN,s),fF:lerp2(p.fF,q.fF,s),hN:lerp2(p.hN,q.hN,s),hF:lerp2(p.hF,q.hF,s)};}
function solve(p,fig){
  const r=p.t*Math.PI/180,u=[Math.sin(r),-Math.cos(r)];
  const S=[p.hip[0]+L.torso*u[0],p.hip[1]+L.torso*u[1]];
  const H=fig.front?[S[0],S[1]-L.neck]:[S[0]+L.neck*u[0],S[1]+L.neck*u[1]];
  let sN=S,sF=S,pN=p.hip,pF=p.hip;
  if(fig.front){sN=[S[0]-11,S[1]];sF=[S[0]+11,S[1]];pN=[p.hip[0]-6,p.hip[1]];pF=[p.hip[0]+6,p.hip[1]];}
  const b=Object.assign({kN:-1,kF:-1,eN:1,eF:1},fig.bend||{});
  const [kN,aN]=ik(pN,p.fN,L.th,L.sh,b.kN),[kF,aF]=ik(pF,p.fF,L.th,L.sh,b.kF);
  const [eN,hN]=ik(sN,p.hN,L.ua,L.fa,b.eN),[eF,hF]=ik(sF,p.hF,L.ua,L.fa,b.eF);
  return {S,H,sN,sF,pN,pF,kN,aN,kF,aF,eN,hN,eF,hF,hip:p.hip};
}
const f1=n=>Math.round(n*10)/10;
const pl=(...pts)=>pts.map(q=>f1(q[0])+','+f1(q[1])).join(' ');
function jointOf(J,k){return {hN:J.hN,hF:J.hF,fN:J.aN,fF:J.aF,hip:J.hip,sh:J.S}[k];}
function prop(pr,J){
  switch(pr.k){
    case 'rect':return `<rect class="eq" x="${pr.x}" y="${pr.y}" width="${pr.w}" height="${pr.h}" rx="${pr.r??2}"/>`;
    case 'line':return `<line class="eqs" x1="${pr.p[0]}" y1="${pr.p[1]}" x2="${pr.p[2]}" y2="${pr.p[3]}" stroke-width="${pr.w||5}"/>`;
    case 'cable':{const t=jointOf(J,pr.to);return `<line class="cable" x1="${pr.from[0]}" y1="${pr.from[1]}" x2="${f1(t[0])}" y2="${f1(t[1])}"/><circle class="eq" cx="${pr.from[0]}" cy="${pr.from[1]}" r="4"/>`;}
    case 'db':{const q=jointOf(J,pr.at),o=pr.o||'c';
      if(o==='v')return `<rect class="db" x="${f1(q[0]-4)}" y="${f1(q[1]-10)}" width="8" height="20" rx="3"/>`;
      if(o==='h')return `<rect class="db" x="${f1(q[0]-10)}" y="${f1(q[1]-4)}" width="20" height="8" rx="3"/>`;
      return `<circle class="db" cx="${f1(q[0])}" cy="${f1(q[1])}" r="6"/>`;}
    case 'handle':{const q=jointOf(J,pr.at);return `<rect class="eq" x="${f1(q[0]-6)}" y="${f1(q[1]-2.5)}" width="12" height="5" rx="2"/>`;}
    case 'plate':{const q=jointOf(J,pr.at),a=pr.a*Math.PI/180,h=(pr.len||34)/2,dx=Math.cos(a)*h,dy=Math.sin(a)*h;
      return `<line class="eqs" x1="${f1(q[0]+3-dx)}" y1="${f1(q[1]-dy)}" x2="${f1(q[0]+3+dx)}" y2="${f1(q[1]+dy)}" stroke-width="5"/>`;}
    case 'roller':{const q=jointOf(J,pr.at);return `<circle class="eq" cx="${f1(q[0]+(pr.dx||0))}" cy="${f1(q[1]+(pr.dy||0))}" r="6"/>`;}
  }
  return '';
}
const FRONT_PROPS=new Set(['db','handle','plate','roller']);
function drawBody(J,fig,cls){
  let s=`<g class="${cls||''}">`;
  const leg=(p,k,a,far)=>`<polyline class="limb${far?' far':''}" points="${pl(p,k,a)}"/>`;
  const arm=(sh,e,h,far)=>`<polyline class="limb${far?' far':''}" points="${pl(sh,e,h)}"/>`;
  if(fig.front){
    s+=leg(J.pN,J.kN,J.aN)+leg(J.pF,J.kF,J.aF);
    s+=`<polygon class="torso-f" points="${pl(J.sN,J.sF,J.pF,J.pN)}"/>`;
    s+=arm(J.sN,J.eN,J.hN)+arm(J.sF,J.eF,J.hF);
  }else{
    s+=leg(J.pF,J.kF,J.aF,true)+arm(J.sF,J.eF,J.hF,true);
    s+=`<line class="torso" x1="${f1(J.hip[0])}" y1="${f1(J.hip[1])}" x2="${f1(J.S[0])}" y2="${f1(J.S[1])}"/>`;
    s+=leg(J.pN,J.kN,J.aN)+arm(J.sN,J.eN,J.hN);
  }
  s+=`<circle class="headc" cx="${f1(J.H[0])}" cy="${f1(J.H[1])}" r="${L.head}"/>`;
  return s+'</g>';
}
function render(fig,s,ghost){
  const p0=norm(fig.p[0]),p1=norm(fig.p[1]);
  const J=solve(mix(p0,p1,s),fig);
  const props=fig.props||[];
  let out=`<line class="floor" x1="10" y1="150" x2="190" y2="150"/>`;
  out+=props.filter(x=>!FRONT_PROPS.has(x.k)).map(x=>prop(x,J)).join('');
  if(ghost){const G=solve(p0,fig);out+=`<g class="figghost">${drawBody(G,fig)}${props.filter(x=>FRONT_PROPS.has(x.k)).map(x=>prop(x,G)).join('')}</g>`;}
  out+=drawBody(J,fig);
  out+=props.filter(x=>FRONT_PROPS.has(x.k)).map(x=>prop(x,J)).join('');
  return out;
}

/* ---------- poses ---------- */
const ST={hip:[100,84],t:0,fN:[102,148],fF:[97,148],hN:[102,88],hF:[99,88]};
const FIG={
  goblet:{p:[{hip:[100,84],t:6,fN:[104,148],fF:[98,148],hN:[114,54],hF:[112,56]},
             {hip:[86,114],t:28,fN:[104,148],fF:[98,148],hN:[116,88],hF:[114,90]}],
          props:[{k:'db',at:'hN',o:'v'}]},
  dbpress:{p:[{hip:[116,104],t:-90,fN:[146,148],fF:[140,148],hN:[74,58],hF:[72,58]},
              {hip:[116,104],t:-90,fN:[146,148],fF:[140,148],hN:[78,90],hF:[76,90]}],
          props:[{k:'rect',x:46,y:110,w:104,h:7},{k:'rect',x:56,y:117,w:5,h:33,r:1},{k:'rect',x:136,y:117,w:5,h:33,r:1},{k:'db',at:'hN'}]},
  pulldown:{p:[{hip:[100,108],t:-10,fN:[128,148],fF:[124,148],hN:[101,22],hF:[99,22]},
               {hip:[100,108],t:-10,fN:[128,148],fF:[124,148],hN:[110,62],hF:[108,62]}],
          props:[{k:'rect',x:80,y:112,w:36,h:6},{k:'rect',x:95,y:118,w:6,h:32,r:1},{k:'rect',x:124,y:104,w:16,h:6},{k:'line',p:[160,0,160,150],w:6},{k:'line',p:[100,2,160,2],w:4},{k:'cable',from:[100,4],to:'hN'},{k:'handle',at:'hN'}]},
  rdl:{p:[{hip:[100,84],t:2,fN:[102,148],fF:[98,148],hN:[104,88],hF:[102,88]},
          {hip:[86,86],t:72,fN:[102,148],fF:[98,148],hN:[127,118],hF:[125,118]}],
          props:[{k:'db',at:'hN'}]},
  ohp:{front:true,bend:{kN:1,kF:-1,eN:-1,eF:1},
       p:[{hip:[100,108],t:0,fN:[86,148],fF:[114,148],hN:[82,46],hF:[118,46]},
          {hip:[100,108],t:0,fN:[86,148],fF:[114,148],hN:[92,22],hF:[108,22]}],
       props:[{k:'rect',x:84,y:58,w:32,h:52,r:4},{k:'rect',x:76,y:108,w:48,h:7},{k:'db',at:'hN',o:'h'},{k:'db',at:'hF',o:'h'}]},
  curl:{p:[ST,{...ST,hN:[116,56],hF:[113,57]}],props:[{k:'db',at:'hN'}]},
  pushdown:{p:[{hip:[96,84],t:8,fN:[100,148],fF:[94,148],hN:[116,64],hF:[114,65]},
               {hip:[96,84],t:8,fN:[100,148],fF:[94,148],hN:[106,88],hF:[104,88]}],
          props:[{k:'line',p:[160,0,160,150],w:6},{k:'cable',from:[154,8],to:'hN'},{k:'handle',at:'hN'}]},
  deadbug:{p:[{hip:[120,140],t:-90,fN:[152,108],fF:[150,110],hN:[80,94],hF:[76,94]},
              {hip:[120,140],t:-90,fN:[152,108],fF:[184,136],hN:[36,132],hF:[76,94]}]},
  legpress:{p:[{hip:[95,122],t:-60,fN:[144,86],fF:[140,88],hN:[98,122],hF:[96,122]},
               {hip:[95,122],t:-60,fN:[128,98],fF:[124,100],hN:[98,122],hF:[96,122]}],
          props:[{k:'line',p:[46,92,96,128],w:7},{k:'line',p:[96,128,96,150],w:6},{k:'line',p:[118,138,180,70],w:3},{k:'plate',at:'fN',a:-137,len:38}]},
  dbrow:{p:[{hip:[78,88],t:80,fN:[72,148],fF:[54,116],hN:[121,126],hF:[124,117]},
            {hip:[78,88],t:80,fN:[72,148],fF:[54,116],hN:[104,96],hF:[124,117]}],
          props:[{k:'rect',x:46,y:118,w:96,h:7},{k:'rect',x:54,y:125,w:5,h:25,r:1},{k:'rect',x:130,y:125,w:5,h:25,r:1},{k:'db',at:'hN'}]},
  incline:{p:[{hip:[106,108],t:-60,fN:[142,148],fF:[138,148],hN:[70,41],hF:[68,41]},
              {hip:[106,108],t:-60,fN:[142,148],fF:[138,148],hN:[74,76],hF:[72,76]}],
          props:[{k:'line',p:[104,116,50,85],w:7},{k:'rect',x:96,y:112,w:34,h:7},{k:'rect',x:110,y:119,w:5,h:31,r:1},{k:'db',at:'hN'}]},
  bridge:{p:[{hip:[100,140],t:-90,fN:[128,148],fF:[124,148],hN:[102,146],hF:[100,146]},
             {hip:[96,122],t:-115,fN:[128,148],fF:[124,148],hN:[102,146],hF:[100,146]}],
          props:[{k:'db',at:'hip',o:'h'}]},
  lateral:{front:true,bend:{kN:1,kF:-1,eN:-1,eF:1},
           p:[{hip:[100,84],t:0,fN:[92,148],fF:[108,148],hN:[87,88],hF:[113,88]},
              {hip:[100,84],t:0,fN:[92,148],fF:[108,148],hN:[46,50],hF:[154,50]}],
           props:[{k:'db',at:'hN',o:'h'},{k:'db',at:'hF',o:'h'}]},
  legcurl:{p:[{hip:[96,108],t:-8,fN:[160,110],fF:[156,110],hN:[104,112],hF:[102,112]},
              {hip:[96,108],t:-8,fN:[122,140],fF:[118,140],hN:[104,112],hF:[102,112]}],
          props:[{k:'rect',x:76,y:112,w:40,h:7},{k:'rect',x:72,y:68,w:7,h:46},{k:'rect',x:92,y:119,w:6,h:31,r:1},{k:'rect',x:116,y:98,w:26,h:6},{k:'roller',at:'fN',dx:2,dy:-8}]},
  pallof:{p:[{hip:[100,84],t:0,fN:[106,148],fF:[94,148],hN:[112,58],hF:[110,58]},
             {hip:[100,84],t:0,fN:[106,148],fF:[94,148],hN:[144,52],hF:[142,52]}],
          props:[{k:'line',p:[34,10,34,150],w:6},{k:'cable',from:[38,60],to:'hN'},{k:'handle',at:'hN'}]},
  lunge:{p:[{hip:[100,84],t:2,fN:[102,148],fF:[98,148],hN:[102,88],hF:[99,88]},
            {hip:[94,114],t:4,fN:[110,148],fF:[58,146],hN:[99,117],hF:[96,117]}],
          props:[{k:'db',at:'hN'}]},
  pushup:{p:[{hip:[94,119],t:65,fN:[36,146],fF:[34,146],hN:[134,148],hF:[130,148]},
             {hip:[92,131],t:75,fN:[36,146],fF:[34,146],hN:[134,148],hF:[130,148]}]},
  cablerow:{p:[{hip:[80,122],t:8,fN:[138,128],fF:[136,130],hN:[130,90],hF:[128,90]},
               {hip:[80,122],t:-4,fN:[138,128],fF:[136,130],hN:[100,100],hF:[98,100]}],
          props:[{k:'rect',x:54,y:126,w:54,h:7},{k:'rect',x:142,y:112,w:6,h:30},{k:'line',p:[160,60,160,150],w:6},{k:'cable',from:[156,122],to:'hN'},{k:'handle',at:'hN'}]},
  legext:{p:[{hip:[98,108],t:-8,fN:[130,142],fF:[126,142],hN:[104,114],hF:[102,114]},
             {hip:[98,108],t:-8,fN:[160,100],fF:[156,100],hN:[104,114],hF:[102,114]}],
          props:[{k:'rect',x:78,y:112,w:40,h:7},{k:'rect',x:74,y:68,w:7,h:46},{k:'rect',x:94,y:119,w:6,h:31,r:1},{k:'roller',at:'fN',dx:4,dy:-5}]},
  facepull:{bend:{eN:-1,eF:-1},
            p:[{hip:[96,84],t:-4,fN:[100,148],fF:[92,148],hN:[138,42],hF:[136,44]},
               {hip:[96,84],t:-4,fN:[100,148],fF:[92,148],hN:[104,30],hF:[102,32]}],
          props:[{k:'line',p:[178,0,178,150],w:6},{k:'cable',from:[174,36],to:'hN'},{k:'handle',at:'hN'}]},
  french:{p:[{hip:[100,112],t:0,fN:[126,148],fF:[122,148],hN:[88,56],hF:[86,57]},
             {hip:[100,112],t:0,fN:[126,148],fF:[122,148],hN:[102,25],hF:[100,25]}],
          props:[{k:'rect',x:82,y:114,w:36,h:7},{k:'rect',x:97,y:121,w:6,h:29,r:1},{k:'db',at:'hN',o:'v'}]},
  sideplank:{p:[{hip:[92,131],t:75,fN:[30,148],fF:[32,146],hN:[154,146],hF:[96,124]},
                {hip:[93,136],t:73,fN:[30,148],fF:[32,146],hN:[154,146],hF:[97,128]}]},
  stepup:{p:[{hip:[96,90],t:10,fN:[124,130],fF:[94,148],hN:[105,94],hF:[103,94]},
             {hip:[124,66],t:2,fN:[122,130],fF:[130,130],hN:[127,70],hF:[125,70]}],
          props:[{k:'rect',x:106,y:132,w:46,h:18,r:3}]},
  bandrow:{p:[{hip:[96,84],t:10,fN:[104,148],fF:[90,148],hN:[146,60],hF:[144,60]},
              {hip:[96,84],t:10,fN:[104,148],fF:[90,148],hN:[112,72],hF:[110,72]}],
          props:[{k:'line',p:[188,10,188,150],w:6},{k:'cable',from:[184,70],to:'hN'},{k:'handle',at:'hN'}]},
  birddog:{p:[{hip:[80,104],t:90,fN:[48,146],fF:[50,146],hN:[122,148],hF:[118,148]},
              {hip:[80,104],t:90,fN:[48,146],fF:[16,100],hN:[167,98],hF:[118,148]}]}
};

