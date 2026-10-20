const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');let checks=0;
const script=f=>fs.readFileSync(f,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function engine(src,storage=new Map()){const c=vm.createContext({console,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},setTimeout(){},clearTimeout(){},TextEncoder,TextDecoder,URLSearchParams,performance});const run=s=>vm.runInContext(s,c,{timeout:30000});run(src);run('render=()=>{};applyDisp=()=>{};scrollCard=()=>{};sfx=()=>{};momentCheck=()=>{}');return {c,run,storage}}
const basic={seed:110003,name:'節奏驗證',home:'pingtung',wc:'middle',sex:'m',aim:'teacher',mode:'easy',route:'dual',v:22,entry:'adult'};
const snap=e=>e.run('JSON.stringify({S,p:G.prompt,c:G.choices,review:reviewRows()})');const test=(n,f)=>{f();checks++;console.log('PASS '+n)};
const root=fs.existsSync('preview-v2/index.html')?'.':'deploy-game';

const html=fs.readFileSync(root+'/index.html','utf8'),src=script(root+'/index.html'),rows=[];
for(const entry of ['youth','practice','adult','mature'])for(let i=0;i<6;i++){
 const e=engine(src);e.c.cfg={...basic,entry,seed:110003+i*1877};e.run('startGame(cfg,[]);globalThis.firstBlack=null;globalThis.steps=0;globalThis.plans=0;globalThis.training=0;globalThis.other=0;for(let i=0;i<9000&&G.prompt.kind!=="end";i++){if(paceTraining(G.prompt)){const n=paceRun("repeat");if(!n)throw Error("Stalled");plans++;training+=n;}else{choose(String(ffPick(G.prompt)));other++;}steps++;if(firstBlack===null&&S.rank>=6)firstBlack=S.age;}');
 assert.equal(e.run('G.prompt.kind'),'end');rows.push({entry,seed:e.c.cfg.seed,age:e.run('S.age'),rank:e.run('S.rank'),firstBlack:e.run('firstBlack'),trainingChoices:e.run('training'),planningCommands:e.run('plans'),otherChoices:e.run('other'),commands:e.run('steps')});
}
console.log(JSON.stringify({kind:'automated simulation, not player data',policy:'repeat training; otherwise first recommended or first enabled option',runs:rows.length,rows},null,2));
