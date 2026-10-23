const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{auditTrial}=require('./audit-trial.cjs');let checks=0;
const test=(n,f)=>{f();checks++;console.log('PASS '+n)};
const root=fs.existsSync('preview-v2/index.html')?'.':'deploy-game';
const hexRgb=h=>{h=h.replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
const lum=h=>{const [r,g,b]=hexRgb(h).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const tokens=s=>Object.fromEntries([...s.matchAll(/--([\w-]+):(#[0-9a-fA-F]{3,6})/g)].map(m=>[m[1],m[2]]));

for(const file of [root+'/index.html',root+'/preview-v2/index.html']){
 const html=fs.readFileSync(file,'utf8'),src=html.match(/<script>([\s\S]*?)<\/script>/)[1];

 test(file+' primary button subtitles stay readable in every palette',()=>{
  const base=tokens(html.match(/:root\{[^}]*\}/)[0]);
  const pals=[['default',base],...[...html.matchAll(/:root\[data-pal="(\w+)"\]\{([^}]*)\}/g)].map(m=>[m[1],{...base,...tokens(m[2])}])];
  const rule=(html.match(/\.opt\.primary \.s\{color:([^;}]+)\}/)||[])[1];
  for(const [name,t] of pals){
   const fg=rule?(rule.startsWith('var(')?t[rule.slice(6,-1)]:rule):t.muted;
   assert.ok(contrast(fg,t.coral)>=3,`${name}: subtitle ${fg} on ${t.coral} is ${contrast(fg,t.coral).toFixed(2)}:1`);
  }
 });

 // The first-battle tutorial is scheduled 1.7 s after the first exchange. A fast tap can finish the bout
 // before then; the coach card must not appear over the result screen or be marked as seen.
 const tutorial=battleLive=>{
  const st=new Map(),added=[],timers=[];
  const node=()=>({innerHTML:'',className:'',querySelector:()=>({}),remove(){}});
  const document={createElement:node,querySelector:s=>s==='#card.battle'||(battleLive&&s==='#card.battle .atbx')?{}:null,body:{appendChild:d=>added.push(d),contains:d=>added.includes(d)}};
  const c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,String(v)),removeItem:k=>st.delete(k)},setTimeout:f=>timers.push(f),clearTimeout(){},setInterval:()=>0,clearInterval(){},TextEncoder,TextDecoder,URLSearchParams,performance});
  vm.runInContext(src,c,{timeout:30000});c.document=document;timers.length=0;
  vm.runInContext('battleTut()',c);timers.forEach(f=>f());
  return {shown:added.length,seen:[...st.keys()].some(k=>k.endsWith('kl-tut'))};
 };
 test(file+' first-battle tutorial shows while the bout is still running',()=>{const r=tutorial(true);assert.equal(r.shown,1);});
 test(file+' first-battle tutorial waits for the next bout when the first one already ended',()=>{const r=tutorial(false);assert.equal(r.shown,0);assert.equal(r.seen,false);});

 // Fixed seeds and scripted policies: guards the tuning, says nothing about how real players feel.
 test(file+' first-lesson bout rewards the taught tactics without being a giveaway',()=>{
  const {rows}=auditTrial(file,120,['youth','mature'],['打對手弱點＋每次黃區','固定順序輪流按']);
  for(const entry of ['youth','mature']){
   const [taught,mash]=['打對手弱點＋每次黃區','固定順序輪流按'].map(p=>rows.find(r=>r.entry===entry&&r.policy===p));
   assert.ok(taught.winPct>=40&&taught.winPct<=80,entry+' taught win '+taught.winPct);
   assert.ok(taught.winPct-mash.winPct>=15,entry+' taught '+taught.winPct+' vs mash '+mash.winPct);
   assert.ok(!taught.playerChoices[0]&&!mash.playerChoices[0],entry+' player knocked out before acting');
  }
 });

 // Seed 5000, lifelong practice: endurance and strength reach their hidden potential around 33 while the
 // third-dan fitness test still needs more. The card used to repeat "practise more" for over a decade.
 test(file+' exam hint admits when the weak part is already at its potential',()=>{
  const st=new Map(),c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,String(v)),removeItem:k=>st.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});
  const run=x=>vm.runInContext(x,c,{timeout:60000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');
  c.cfg={seed:5000,name:'審查',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:22,entry:'practice'};
  const seen=JSON.parse(run(`startGame(cfg,[]);const seen=[];for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const p=G.prompt;if(/審查$/.test(p.title||'')&&p.opts.length===2){const no=p.opts.find(o=>o.id==='no'),go=p.opts.find(o=>o.id==='go');seen.push({t:p.title,age:S.age,sub:no.sub,goRec:!!go.rec,capped:!!(examRec()||{}).capped});}choose(String(ffPick(p)))};JSON.stringify(seen)`));
  const early=seen.find(x=>!x.capped&&/不足，建議多練/.test(x.sub));assert.ok(early,'ordinary weak-part advice still shown');
  const capped=seen.filter(x=>x.capped);assert.ok(capped.length>0,'capped exam reached');
  for(const x of capped){assert.match(x.sub,/已練到自己的上限/);assert.doesNotMatch(x.sub,/建議多練/);assert.equal(x.goRec,true);}
  const third=seen.filter(x=>x.t==='三段審查').length;assert.ok(third<=6,'third-dan card shown '+third+' times (15 before the fix)');
 });

 // 320px phones with the large font: card names, card levels and long player names must wrap or shorten.
 test(file+' narrow-screen text wraps inside cards and the battle HUD',()=>{
  const last=sel=>{const all=[...html.matchAll(new RegExp(sel.replace(/[.*+?^${}()|[\]\\>]/g,'\\$&')+'\\{([^}]*)\\}','g'))];return all.length?all[all.length-1][1]:'';};
  assert.match(last('.ttile .tn>span'),/white-space:normal/);assert.match(last('.ttile .lv'),/white-space:normal/);
  assert.match(last('.ttile .cmeta'),/flex-wrap:wrap/);assert.match(last('.hud>*'),/min-width:0/);
 });

 const life=(cfg,body)=>{const st=new Map(),c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,String(v)),removeItem:k=>st.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});
  const run=x=>vm.runInContext(x,c,{timeout:60000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');c.cfg=cfg;return run(body);};
 // Recorded from the rule 22 game before rule 23 existed: aging and owner-mode healing must not touch these lives.
 const V22={"youth": "689502b10595d27b3b56d8824d10bc18603a4795ded4c62f757765cc9635c091", "practice": "54f5f067b181ee310e77178e56663e7d0f77f55eedbdb227e63cdb25b8795446", "adult": "a8bd5a2317384c4550f104b2d4de1f9e3a93503c0be9a0883af3aaf5c65fb547", "mature": "c011de171b68dfd3c0b48f40c5e02a5b75961f921d1d6f21639bb7200c4fc016"};
 for(const entry of Object.keys(V22))test(file+' rule 22 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則22相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:22,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V22[entry]);
 });
 // Recorded from the rule 23 game before rule 24 existed: the yearly tournament choice must not touch these lives.
 const V23={"youth": "8e53b19ae3f1642beeff829f9611c23cf92c75fdc266b31349e79484db82ace4", "practice": "7430e0d09e5497f4c787b64024ed52426cfd6fd5b616d4a1b26e1d9a27ad7d47", "adult": "a90db48a5652e68367ffd6845a2465d2aaa69dd99789c2a2b20a4f213730d826", "mature": "549cad126f4a24c0346b029a8af884db1df00ffa5d1a6fc6eb572ebf4c2a52dc"};
 for(const entry of Object.keys(V23))test(file+' rule 23 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則23相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:23,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V23[entry]);
 });
 test(file+' rule 24 offers one tournament target a year and keeps the Japan tour together',()=>{
  let japanYears=0,asked=0;
  for(let k=0;k<8;k++){const aim=['champion','teacher','life','balanced'][k%4],route=['dual','kumite','kata','dual'][k%4];
   const r=JSON.parse(life({seed:5000+k*7919,name:'規則24',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim,mode:'easy',route,v:24,entry:'youth'},
    `startGame(cfg,[]);const JP=['intl','jpw','jpk','jp','world'],per={},bad=[];let asked=0;
     for(let i=0;i<12000&&G.prompt.kind!=='end';i++){const t=G.prompt.title||'';if(t==='今年的比賽')asked++;const T=TOURN.find(x=>x.name===t);const isT=T&&G.prompt.opts&&G.prompt.opts.some(o=>o.id==='skip');
      if(isT){const plan=S.flags.meetY===S.year?S.flags.meet:null;if(plan!==(JP.includes(T.id)?'jp':T.id))bad.push(S.year+':'+T.id+':'+plan);const y=per[S.year]=per[S.year]||{jp:0,other:0};if(JP.includes(T.id))y.jp++;else y.other++;}
      const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}
     JSON.stringify({end:G.prompt.kind==='end',bad,asked,years:Object.values(per)})`));
   assert.ok(r.end,'life reaches its ending');assert.deepEqual(r.bad,[],'every tournament matches that year\'s chosen target');
   for(const y of r.years){assert.ok(y.other<=1,'at most one Taiwan-side tournament a year');assert.ok(!(y.other&&y.jp),'a year is either the Japan tour or one other tournament');if(y.jp)japanYears++;}
   asked+=r.asked;}
  assert.ok(asked>=100,'the yearly question is asked');assert.ok(japanYears>0,'the Japan tour is reachable');
  const perfect=life({seed:100028,name:'規則24',home:'pingtung',wc:'middle',sex:'m',aim:'champion',mode:'easy',route:'dual',v:24,entry:'youth'},'startGame(cfg,[]);for(let i=0;i<12000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}(S.crowns||[]).some(c=>c.perfect)');
  assert.equal(perfect,true,'a perfect sweep is still possible under rule 24');
 });
 test(file+' rule 23 ages every entry gently and keeps owner injuries healing',()=>{
  const at55={};
  for(const entry of ['youth','practice','adult','mature'])for(let k=0;k<8;k++){
   const r=JSON.parse(life({seed:3000+k*7907,name:'規則23',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim:'balanced',mode:'easy',route:'dual',v:23,entry},
    `startGame(cfg,[]);let worst=0,aged=0,injFrom=0,injKey=null,injMax=0,b55=null;const y0=()=>({spd:S.st.spd,sta:S.st.sta,pow:S.st.pow,con:S.st.con});
     const tick=agingTick;agingTick=function(){const b=y0();tick();for(const k in b){const d=b[k]-S.st[k];if(d>0)aged++;worst=Math.max(worst,d);}};
     for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const key=S.injury?S.injury.n+S.injury.sev:null;if(key!==injKey){injKey=key;injFrom=S.age;}if(key)injMax=Math.max(injMax,S.age-injFrom);if(S.age===55&&!b55)b55=(S.st.pow+S.st.spd+S.st.sta)/3;choose(String(ffPick(G.prompt)))}
     JSON.stringify({worst,aged,injMax,b55})`));
   assert.ok(r.worst<=1.6*1.2+1e-9,entry+' yearly loss '+r.worst);assert.ok(r.aged>0,entry+' never aged');assert.ok(r.injMax<3,entry+' injury lasted '+r.injMax+' years');
   if(r.b55!=null)(at55[entry]=at55[entry]||[]).push(r.b55);
  }
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  assert.ok(avg(at55.youth)>=45,'youth body at 55 '+avg(at55.youth).toFixed(1)+' (25 under rule 22)');
  assert.ok(Math.abs(avg(at55.youth)-avg(at55.adult))<20,'youth vs adult at 55 differ too much');
 });

 test(file+' guide marks type matchups as a game simplification and the shihandai review carries a recommendation',()=>{
  assert.ok(html.includes('類型相剋、有效與一本的判定都是遊戲規則的簡化'));
  const st=new Map(),c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,String(v)),removeItem:k=>st.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});
  const run=x=>vm.runInContext(x,c,{timeout:60000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');
  c.cfg={seed:3000,name:'審查',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:23,entry:'youth'};
  const seen=JSON.parse(run(`startGame(cfg,[]);const o=[];for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const p=G.prompt;if(p.title==='師範代審查'){const g=p.opts.find(x=>x.id==='go'),n=p.opts.find(x=>x.id==='no');o.push({all:shdReview().all,goRec:!!g.rec,noRec:!!n.rec});}choose(String(ffPick(p)))};JSON.stringify(o)`));
  assert.ok(seen.length>0,'no shihandai review reached');for(const x of seen){assert.equal(x.goRec,x.all>=.5);assert.equal(x.noRec,x.all<.5);}
 });
}
console.log(checks+' review checks passed');
