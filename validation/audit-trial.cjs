// Fixed-seed audit of the first-lesson sparring bout (trial). Scripted policies, not player data.
const fs=require('node:fs'),vm=require('node:vm');
function auditTrial(file,N=300,entries=['youth','mature'],only=null){
const src=fs.readFileSync(file,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function engine(){const st=new Map();const c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,String(v)),removeItem:k=>st.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});const run=s=>vm.runInContext(s,c,{timeout:30000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');return {c,run};}
// Each policy is evaluated with the battle prompt in `p`. '!' marks a perfect-timing press.
const policies={
 '交給本能（auto）':`'auto'`,
 '打對手弱點＋每次黃區':`(()=>{const w={power:'gedan',tech:'tsuki',speed:'chudan'}[p.foe.type];const ok=p.opts.filter(o=>!o.disabled&&o.id!=='auto');const m=ok.find(o=>o.id===w)||ok.find(o=>o.id==='tsuki')||ok[0];return m.id+(MOVES[m.id]&&!MOVES[m.id].rest&&!MOVES[m.id].guard?'!':'')})()`,
 '只按正拳、不看時機':`(p.opts.find(o=>o.id==='tsuki'&&!o.disabled)||p.opts.find(o=>!o.disabled&&o.id!=='auto')).id`,
 '固定順序輪流按':`(()=>{const ok=p.opts.filter(o=>!o.disabled&&o.id!=='auto');return ok[i%ok.length].id})()`,
};
const rows=[];
for(const entry of entries)for(const [name,expr] of Object.entries(policies)){if(only&&!only.includes(name))continue;
 let win=0;const turns={};
 for(let s=1;s<=N;s++){const e=engine();e.c.cfg={seed:777+s*104729,name:'測',home:'pingtung',wc:'middle',sex:'m',aim:'balanced',mode:'easy',route:'dual',v:22,entry};
  const [w,n]=e.run(`startTrial(cfg);choose('mjis');choose('go');let n=0;for(let i=0;i<500&&G.prompt.title!=="體驗結束";i++){const p=G.prompt;const live=p.kind==='battle'&&p.opts.length>1;if(live)n++;choose(String(live?${expr}:ffPick(p)))};[G.prompt.body.includes('你贏了'),n]`);
  if(w)win++;turns[n]=(turns[n]||0)+1;}
 rows.push({entry,policy:name,winPct:+(win/N*100).toFixed(1),playerChoices:turns});
}
return {file,seeds:N,rows};}
module.exports={auditTrial};
if(require.main===module){const file=process.argv[2]||(fs.existsSync('preview-v2/index.html')?'index.html':'deploy-game/index.html');console.log(JSON.stringify(auditTrial(file,+(process.argv[3]||300)),null,1));}
