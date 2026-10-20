const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');let checks=0;
const script=f=>fs.readFileSync(f,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function engine(src,storage=new Map()){const c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});const run=s=>vm.runInContext(s,c,{timeout:30000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');return {c,run,storage}}
const basic={seed:125019,name:'流程回歸',home:'pingtung',wc:'middle',sex:'m',aim:'teacher',mode:'easy',route:'dual',v:22,entry:'youth'};
const snap=e=>e.run('JSON.stringify({S,p:G.prompt,c:G.choices,review:reviewRows()})');const test=(n,f)=>{f();checks++;console.log('PASS '+n)};
const root=fs.existsSync('preview-v2/index.html')?'.':'deploy-game';

for(const file of [root+'/index.html',root+'/preview-v2/index.html']){
 const src=script(file);
 const reachAward=mode=>{const e=engine(src);e.c.cfg=basic;e.run('startGame(cfg,[]);setPointMode('+JSON.stringify(mode)+');for(let i=0;i<2000&&!(S.turn===40&&/^稽古方針/.test(G.prompt.title||""));i++){if(G.prompt.kind==="end")throw Error("Missing fixture");choose(/^稽古方針/.test(G.prompt.title||"")?pacePick(G.prompt,"exam",null):String(ffPick(G.prompt)))}');assert.equal(e.run('S.turn'),40);return e;};
 for(const mode of ['auto','manual'])test(file+' scheduled '+mode+' annual reward agrees with ordinary choices',()=>{
  const scheduled=reachAward(mode),normal=engine(src);normal.c.saved=scheduled.run('({setup:G.setup,choices:G.choices.slice()})');normal.run('startGame(saved.setup,saved.choices);setPointMode('+JSON.stringify(mode)+')');scheduled.run('globalThis.count=paceRun("exam")');normal.c.count=scheduled.run('count');normal.run('for(let i=0;i<count;i++)choose(pacePick(G.prompt,"exam",null))');
  assert.equal(scheduled.run('count'),1);assert.equal(scheduled.run('S.turn'),41);if(mode==='auto'){assert.equal(scheduled.run('G.prompt.title'),'同學會');assert.equal(scheduled.run('S.pts'),0)}else assert.ok(scheduled.run('S.pts')>0);assert.equal(snap(scheduled),snap(normal));
  const before=snap(scheduled);scheduled.run('globalThis.saved=G.choices.slice();startGame(cfg,saved)');assert.equal(snap(scheduled),before);
 });
 for(const entry of ['youth','practice','adult','mature'])test(file+' planner scope and '+entry+' life replay stay consistent',()=>{
  const e=engine(src);e.c.cfg={...basic,entry};e.run('startGame(cfg,[]);globalThis.plans=0;for(let i=0;i<9000&&G.prompt.kind!=="end";i++){if(/^稽古方針/.test(G.prompt.title||"")){if(!paceRun("exam"))throw Error("Planning stalled");plans++;}else choose(String(ffPick(G.prompt)));if(!Number.isFinite(S.money)||Object.values(S.st).some(n=>!Number.isFinite(n)))throw Error("Nonfinite")}');
  assert.equal(e.run('G.prompt.kind'),'end');assert.equal(e.run('plans')>0,entry==='youth');const before=snap(e);e.run('globalThis.saved=G.choices.slice();startGame(cfg,saved)');assert.equal(snap(e),before);
 });
 for(const [entry,age] of [['youth',15],['practice',15],['adult',30],['mature',45]])test(file+' '+entry+' trial uses actual age and preserves the previous save',()=>{
  const e=engine(src);e.c.cfg=basic;e.run('startGame(cfg,[]);choose(String(ffPick(G.prompt)))');const before=new Map(e.storage);e.c.trialCfg={...basic,entry};e.run('startTrial(trialCfg)');
  assert.equal(e.run('S.age'),age);assert.ok(e.run('G.prompt.body').includes(age+' 歲'));if(age>15)assert.doesNotMatch(e.run('G.prompt.body'),/十五歲|高一/);
  e.run('for(let i=0;i<1500&&G.prompt.title!=="體驗結束";i++){choose(String(ffPick(G.prompt)));save()}');assert.equal(e.run('G.prompt.title'),'體驗結束');
  const toast={innerHTML:'',remove(){}};e.c.document={createElement:()=>toast,body:{appendChild(){}}};e.run('choose("full")');assert.equal(e.run('G'),null);assert.doesNotMatch(toast.innerHTML,/高一春天/);assert.match(toast.innerHTML,/入門時刻/);assert.deepEqual(e.storage,before);
 });
}
console.log(checks+' player-flow checks passed');
