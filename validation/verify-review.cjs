const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{auditTrial}=require('./audit-trial.cjs');let checks=0;
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
}
console.log(checks+' review checks passed');
