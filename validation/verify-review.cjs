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
 // Recorded from the rule 24 game before rule 25 existed: putting 全台 on the Japan path must not touch these lives.
 const V24={"youth": "1bcf51f0336bb1abaa4ca37577acdcbfa198322159db7317226e353e7ed93abc", "practice": "b48d391aae8b19ebe8ee7827eabd37f52ebc711f1f3e1e419cca5a57d8d0135b", "adult": "11d5db0f565a3055a05fdfd1b5819f12427575eed8cf1598d928bf4027084469", "mature": "b219af6804737f77c0c0ccd4aaff19fbe60949c51b9a124dd30a67452f974575"};
 for(const entry of Object.keys(V24))test(file+' rule 24 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則24相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:24,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V24[entry]);
 });
 test(file+' rule 25 keeps 全台 on the road to Japan',()=>{
  let twInJapanYears=0,japanAfterTw=0;
  for(let k=0;k<8;k++){const aim=['champion','teacher','life','balanced'][k%4],route=['dual','kumite','kata','dual'][k%4];
   const r=JSON.parse(life({seed:5000+k*7919,name:'規則25',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim,mode:'easy',route,v:25,entry:'youth'},
    `startGame(cfg,[]);const JP=['intl','jpw','jpk','jp','world'],per={},bad=[];
     const ok=(plan,id)=>plan==='jp'?(JP.includes(id)||id==='tw'):plan==='tw'?(id==='tw'||id==='jp'||id==='world'):plan===id;
     for(let i=0;i<12000&&G.prompt.kind!=='end';i++){const t=G.prompt.title||'';const T=TOURN.find(x=>x.name===t);const isT=T&&G.prompt.opts&&G.prompt.opts.some(o=>o.id==='skip');
      if(isT){const plan=S.flags.meetY===S.year?S.flags.meet:null;if(!ok(plan,T.id))bad.push(S.year+':'+T.id+':'+plan);const y=per[S.year]=per[S.year]||{plan,ids:[]};y.ids.push(T.id);}
      const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}
     JSON.stringify({end:G.prompt.kind==='end',bad,years:Object.values(per)})`));
   assert.ok(r.end,'life reaches its ending');assert.deepEqual(r.bad,[],'every tournament matches that year\'s target');
   for(const y of r.years){const tw=y.ids.filter(x=>x==='tw').length,local=y.ids.filter(x=>x==='local').length;assert.ok(tw+local<=1,'at most one Taiwan-side tournament a year');
    if(y.plan==='jp'&&tw)twInJapanYears++;if(y.plan==='tw'&&y.ids.some(x=>x==='jp'||x==='world'))japanAfterTw++;}}
  assert.ok(twInJapanYears>0,'the Japan tour includes 全台選手權');assert.ok(japanAfterTw>0,'a top-two 全台 finish leads on to that year\'s 全日本');
 });
 // Recorded from the rule 25 game before rule 26 existed: dropping the branch meet must not touch these lives.
 const V25={"youth": "46c92f926a0d5bd1ef735ad3fee0dc010008e791f427a4ae0e86e8651d858c9d", "practice": "e8d64dffa83ec4512c115bcb20580cf71855e1a6eec2cb1e228bda093c7f9d46", "adult": "13958c2cfc478459141ca6c59c62e6184c3d8cb7c01579e3187ee380d727a33a", "mature": "52f64977c81e4146f83be5a38dc9b469b856ec60d3030253a20efb65e87f79ae"};
 for(const entry of Object.keys(V25))test(file+' rule 25 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則25相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:25,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V25[entry]);
 });
 // Recorded from the rule 31 game before rule 32 existed: rule 31 lives keep their one-tournament calendar.
 const V31={"youth": "6cb1d23973a395d5cb8608b49a3a6e00de09fbedc75ac60a07bb9642002fb16e", "practice": "54aa486a7c006060d4cadbac66d936df8acd0f55e38c676f2e46cb75b1d55fe3", "adult": "54b7c8036cf1d907ef83bd04bb063b592b540dc95c3201c63e07115c45fa31a5", "mature": "c5374e08f9767c50de412636f269a5f7462c57cae49e02a3528d6c8c6ce57a83"};
 for(const entry of Object.keys(V31))test(file+' rule 31 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則31相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:31,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V31[entry]);
 });
 test(file+' rule 32 plans the year once and enters meets without asking again',()=>{
  let plans=0,japan=0;
  for(let k=0;k<6;k++){const r=JSON.parse(life({seed:9300+k*487,name:'規則32',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim:'champion',mode:'easy',route:['kumite','dual','kata'][k%3],v:32,entry:'youth'},
   `startGame(cfg,[]);let asked=0,plan=0,jp=0;for(let i=0;i<40000&&G.prompt.kind!=='end';i++){const p=G.prompt;const T=TOURN.find(t=>t.name===p.title);if(T&&p.opts.some(o=>o.id==='skip'))asked++;if(p.title==='今年出賽的項目')plan++;
     const id=String(ffPick(p));G.choices.push(id);G.prompt=G.gen.next(id).value;}
    JSON.stringify({end:G.prompt.kind==='end',asked,plan,jp:!!(S.champ.jp_kumite||S.champ.jp_kata||(S.titles||[]).some(t=>/全日本/.test(t)))})`));
   assert.ok(r.end,'life reaches its ending');assert.equal(r.asked,0,'no per-tournament entry prompt');plans+=r.plan;japan+=r.jp;}
  assert.ok(plans>=10,'the yearly division step is asked');assert.ok(japan>=3,'competitive lives still reach 全日本');
 });
 // Recorded from the rule 30 game before rule 31 existed: one tournament a year must not touch these lives.
 const V30={"youth": "c2c8bf6e0f6f239dc549fb2beebc3625e986f7585b6369fbc04f074e61ec29b6", "practice": "df1672e42b259a0c1d56d902074789bfd556d3585003a9a5624abebafa6a2ba7", "adult": "964afa79e422c41a882173a708af69cd933d9f95b6ecb56f9d79d0139a41b0a3", "mature": "ac7f1d05d0401f30ac3d327ddfb2962f3cb118b61227426751a89519bc43bcdb"};
 for(const entry of Object.keys(V30))test(file+' rule 30 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則30相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:30,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V30[entry]);
 });
 test(file+' rule 31 plays at most one tournament a year and still reaches Japan',()=>{
  let jp=0;
  for(let k=0;k<6;k++){const r=JSON.parse(life({seed:9100+k*487,name:'規則31',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim:'champion',mode:'easy',route:['kumite','dual','kata'][k%3],v:31,entry:'youth'},
   `startGame(cfg,[]);const per={},ids=new Set();for(let i=0;i<40000&&G.prompt.kind!=='end';i++){const p=G.prompt;const T=TOURN.find(t=>t.name===p.title);if(T&&p.opts.some(o=>o.id==='skip')){per[S.year]=(per[S.year]||0)+1;ids.add(T.id);}
     const id=String(ffPick(p));G.choices.push(id);G.prompt=G.gen.next(id).value;}
    JSON.stringify({end:G.prompt.kind==='end',max:Math.max(0,...Object.values(per)),ids:[...ids]})`));
   assert.ok(r.end,'life reaches its ending');assert.ok(r.max<=1,'at most one tournament a year');assert.ok(!r.ids.some(x=>['intl','jpw','jpk','local'].includes(x)),'no extra Japan meets');if(r.ids.includes('jp'))jp++;}
  assert.ok(jp>=3,'most competitive lives still reach 全日本');
 });
 // Recorded from the rule 29 game before rule 30 existed: the junior division must not touch these lives.
 const V29={"youth": "db91148bd35d758103280dcdfc81dfebdbb059db99022518c9e79213b2065214", "practice": "9f90af3f7d04ea4e2bfae2d06227f6523bcfb9c5de9438e4469f3a906e719b37", "adult": "80278ff8281400bdd34dbf58cebe27c38e612d9e87b036cbafce3c0730749e90", "mature": "eed3291253c40bb8137173042e29e5e44cbbdad2167f56806959c741c12ffe70"};
 for(const entry of Object.keys(V29))test(file+' rule 29 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則29相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:29,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V29[entry]);
 });
 test(file+' rule 30 youth lives can compete in the junior division from 15',()=>{
  for(let k=0;k<4;k++){const r=JSON.parse(life({seed:7700+k*331,name:'規則30',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim:'champion',mode:'easy',route:['kumite','dual','kata','dual'][k],v:30,entry:'youth'},
   `startGame(cfg,[]);let first=null,jr=[];for(let i=0;i<20000&&G.prompt.kind!=='end';i++){const p=G.prompt;const T=TOURN.find(t=>t.name===p.title);if(T&&p.opts.some(o=>o.id==='skip')){if(first===null)first=S.age;if(T.id==='twj')jr.push(S.age);}
     const id=String(ffPick(p));G.choices.push(id);G.prompt=G.gen.next(id).value;}
    JSON.stringify({end:G.prompt.kind==='end',first,jr})`));
   assert.ok(r.end,'life reaches its ending');assert.ok(r.first!==null&&r.first<=16,'first tournament by 16');assert.ok(r.jr.length&&r.jr.every(a=>a>=15&&a<=17),'junior division only at 15 to 17');}
 });
 // Recorded from the rule 28 game before rule 29 existed: passive skills must not touch these lives.
 const V28={"youth": "cc84a2d6a6d4c4078fbb21bf9df3adac4b36894b53cbdc5ade45efc5bd122c21", "practice": "b2e2b69e81cc067067b97502e8c66c43b46e42c3672abb215ed3428eb98017f9", "adult": "dbaeffb6b2ba7954272ca6bfa545bf33ee4073ed5d0b81d9f5261887f283ee03", "mature": "623ee7f4e25c18f2017134d6be558e8cf8f2cb29eba80c4c891b1b4b781fb63b"};
 for(const entry of Object.keys(V28))test(file+' rule 28 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則28相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:28,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V28[entry]);
 });
 test(file+' rule 29 lives learn passive skills and replay exactly',()=>{
  const got=new Set();let same=true;
  for(let k=0;k<4;k++){const r=JSON.parse(life({seed:6100+k*977,name:'規則29',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim:['champion','balanced','teacher','life'][k],mode:'easy',route:['kumite','dual','kata','dual'][k],v:29,entry:'youth'},
   `startGame(cfg,[]);for(let i=0;i<20000&&G.prompt.kind!=='end';i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}
    const a=JSON.stringify(S),psv=(S.psv||[]).slice();startGame(cfg,G.choices.slice());JSON.stringify({end:G.prompt.kind==='end',psv,same:JSON.stringify(S)===a})`));
   assert.ok(r.end,'life reaches its ending');r.psv.forEach(x=>got.add(x));same=same&&r.same;}
  assert.ok(same,'lives replay identically');assert.ok(got.size>=3,'several passive skills are learned across lives: '+[...got].join(','));
 });
 // Recorded from the rule 27 game before rule 28 existed: move levels must not touch these lives.
 const V27={"youth": "64326b986dc4e0b74caa1719e9a4df9331a154cbcceee18eb5d1377b5ec17d06", "practice": "42cdfdf8c2d64fc629f24367765306127522edf4b377216851523aa4dae02a75", "adult": "026568903969e0e79c0577e770cb2204ecde8cbff6367b535cdc3354598eb807", "mature": "010f60dd4fc05256ed309b51487fc6bead71ada6a31e2bf740e7a56c3f904a9e"};
 for(const entry of Object.keys(V27))test(file+' rule 27 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則27相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:27,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V27[entry]);
 });
 test(file+' rule 28 moves level up with use and replay exactly',()=>{
  const r=JSON.parse(life({seed:4242,name:'規則28',home:'pingtung',wc:'middle',sex:'m',aim:'champion',mode:'easy',route:'kumite',v:28,entry:'youth'},
   `startGame(cfg,[]);let ups=0,lv3=0;
    for(let i=0;i<20000&&G.prompt.kind!=='end';i++){const p=G.prompt;if(p.lines)for(const l of p.lines)if(l.includes('招式升級'))ups++;if(p.kind==='battle'&&p.opts.some(o=>/Lv3/.test(o.label)))lv3=1;
     const id=String(ffPick(p));G.choices.push(id);G.prompt=G.gen.next(id).value;}
    const a=JSON.stringify(S),mv=S.mvU||{};startGame(cfg,G.choices.slice());
    JSON.stringify({end:G.prompt.kind==='end',ups,lv3,top:Math.max(0,...Object.values(mv)),same:JSON.stringify(S)===a,old:(()=>{S.setup.v=27;return mvLv('tsuki')})()})`));
  assert.ok(r.end,'life reaches its ending');assert.ok(r.top>=25,'a move reaches Lv3 over a life');assert.ok(r.same,'the life replays identically');assert.equal(r.old,0,'older rules have no move levels');
 });
 // Recorded from the rule 26 game before rule 27 existed: 看破 must not touch these lives.
 const V26={"youth": "f8aac6961ddd3fe5851656086c0abbe08a27686392434172f783e782a80ecdc0", "practice": "01e2bb625700899fe2eabc20da1b824973dc51f57b0a5a86c6c8d8e6d4e9d019", "adult": "42682bbe6313fb20ee9bc0fa1c2b2d8d035879f1bd0598e431d57c7ba6f8b9d7", "mature": "f026c5d5797c40edf29566304902b39cd7c389ab3a8ba9c4bd602b6618de2597"};
 for(const entry of Object.keys(V26))test(file+' rule 26 '+entry+' life stays byte-for-byte identical',()=>{
  const json=life({seed:246810,name:'規則26相容',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:26,entry},'startGame(cfg,[]);for(let i=0;i<9000&&G.prompt.kind!=="end";i++){const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}JSON.stringify({S,p:G.prompt,choices:G.choices})');
  assert.equal(crypto.createHash('sha256').update(json).digest('hex'),V26[entry]);
 });
 test(file+' rule 27 看破 offers 擋下/迴避 in hand-played bouts and replays exactly',()=>{
  const r=JSON.parse(life({seed:7331,name:'規則27',home:'pingtung',wc:'middle',sex:'m',aim:'champion',mode:'easy',route:'kumite',v:27,entry:'youth'},
   `startGame(cfg,[]);let seen=0,dodge=0,block=0,k=0;
    for(let i=0;i<20000&&G.prompt.kind!=='end';i++){const p=G.prompt;let id;
     if(p.kind==='battle'&&p.info&&p.info.mikiri){seen++;id=(k++%2)?'dodge':'block';if(id==='dodge')dodge++;else block++;}
     else if(p.kind==='battle'&&p.opts.length>1)id=p.opts.find(o=>o.id!=='auto'&&!/必殺/.test(o.label)&&!o.disabled)?.id||ffPick(p);
     else id=String(ffPick(p));
     G.choices.push(String(id));G.prompt=G.gen.next(String(id)).value;}
    const a=JSON.stringify(S);const ch=G.choices.slice();startGame(cfg,ch);
    JSON.stringify({end:G.prompt.kind==='end',seen,dodge,block,same:JSON.stringify(S)===a})`));
  assert.ok(r.end,'life reaches its ending');assert.ok(r.seen>=3,'看破 shows up in hand-played bouts');assert.ok(r.dodge&&r.block,'both answers are exercised');assert.ok(r.same,'the life replays identically');
 });
 test(file+' rule 26 keeps only 全台選手權 in Taiwan, once a year',()=>{
  for(let k=0;k<8;k++){const aim=['champion','teacher','life','balanced'][k%4],route=['dual','kumite','kata','dual'][k%4];
   const r=JSON.parse(life({seed:5000+k*7919,name:'規則26',home:'pingtung',wc:'middle',sex:k%2?'f':'m',aim,mode:'easy',route,v:26,entry:'youth'},
    `startGame(cfg,[]);const ids=[],per={};let firstAge=null;
     for(let i=0;i<12000&&G.prompt.kind!=='end';i++){const t=G.prompt.title||'';const T=TOURN.find(x=>x.name===t);const isT=T&&G.prompt.opts&&G.prompt.opts.some(o=>o.id==='skip');
      if(isT){ids.push(T.id);if(firstAge===null)firstAge=S.age;if(T.id==='tw')per[S.year]=(per[S.year]||0)+1;}
      if(G.prompt.title==='今年的比賽'&&G.prompt.opts.some(o=>o.id==='local'))ids.push('local-option');
      const id=String(ffPick(G.prompt));G.choices.push(id);G.prompt=G.gen.next(id).value;}
     JSON.stringify({end:G.prompt.kind==='end',ids,maxTw:Math.max(0,...Object.values(per)),firstAge})`));
   assert.ok(r.end,'life reaches its ending');assert.ok(!r.ids.includes('local')&&!r.ids.includes('local-option'),'the branch meet is gone');
   assert.ok(r.maxTw<=1,'全台選手權 at most once a year');assert.ok(r.firstAge===null||r.firstAge>=16,'the first tournament comes at 16 or later');}
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
