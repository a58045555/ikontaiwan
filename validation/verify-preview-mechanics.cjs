const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync(fs.existsSync('preview-v2/index.html')?'preview-v2/index.html':'deploy-game/preview-v2/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const c=vm.createContext({console,window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},setTimeout(){},clearTimeout(){},performance,TextEncoder,TextDecoder,Response,Blob,CompressionStream,DecompressionStream,atob,btoa,URLSearchParams});
const run=s=>vm.runInContext(s,c,{timeout:20000});run(script);run('render=()=>{};save=()=>true;');
let count=0;function test(name,f){f();count++;console.log('PASS '+name);}
const basic={seed:74512,name:'驗證選手',home:'pingtung',wc:'middle',sex:'m',v:20,aim:'balanced',mode:'easy',route:'dual'};
c.basic=basic;
const snapshot='JSON.stringify({S,p:G.prompt,c:G.choices})';
const probability=[];
for(const n of [10,20,30])for(const level of [49,55,60,65]){
  test('probability '+n+' opponents at '+level,()=>{
    const result=JSON.parse(run('(()=>{newState(basic);S.st.spi=50;S.hp=100;for(const k of ["pow","spd","sta","tec","con"])S.st[k]='+level+';S.r=mulberry(8811);let wins=0;for(let i=0;i<16000;i++){const z=kumiteN('+n+');if(z.done&&z.wins>=Math.ceil('+n+'/2))wins++;}return JSON.stringify({n:'+n+',level:'+level+',predicted:exactKumiP('+n+'),observed:wins/16000});})()'));
    assert.ok(Math.abs(result.predicted-result.observed)<.018,JSON.stringify(result));probability.push(result);
  });
}
test('rounded examination scoring agrees with displayed probability',()=>{
  const out=JSON.parse(run('(()=>{let wins=0;const rr=mulberry(12479);for(let i=0;i<100000;i++)if(Math.round(49+(rr()-.5)*16)>=49)wins++;return JSON.stringify({p:exactPartP(49,49),actual:wins/100000});})()'));
  assert.ok(Math.abs(out.p-out.actual)<.008);
});
test('probability estimates do not consume the gameplay RNG',()=>{run('newState(basic);globalThis.calls=0;S.r=()=>{calls++;return .5};exactKumiP(10);exactKumiP(20);exactKumiP(30)');assert.equal(run('calls'),0);});
test('same daily setup despite birthday, sex, dojo and debug-looking names',()=>{
  const a=JSON.parse(run('JSON.stringify(makeSetup({...basic,bday:"2000-01-01",test:1,t35:1},true))'));
  const b=JSON.parse(run('JSON.stringify(makeSetup({...basic,name:"測試35",home:"nanzi",wc:"heavy",sex:"f",bday:"1999-03-05"},true))'));delete a.name;delete b.name;assert.deepEqual(a,b);assert.ok(!a.bday&&!a.test&&!a.t35);
});
test('custom names no longer enable test stats',()=>{run('newState(makeSetup({...basic,name:"測試帳號",test:1,t35:1},false))');assert.equal(run('S.rank'),0);assert.ok(run('Math.max(...Object.values(S.st))')<40);});
test('daily save tampering rejected but old test saves supported',()=>{
  assert.throws(()=>run('validateSave({...challengeSetup("2026-10-19","某人"),home:"__proto__"},[])'));
  assert.throws(()=>run('validateSave({...challengeSetup("2026-10-19","某人"),bday:"2000-01-01"},[])'));
  assert.throws(()=>run('validateSave({...basic,test:1},[])'));
  assert.equal(run('!!validateSave({...basic,v:19,test:1},[])'),true);
});
test('plain replay retains historical decision probabilities',()=>{run('newState({...basic,v:19});for(const k of ["pow","spd","sta","tec","con"])S.st[k]=49;S.st.spi=50;S.hp=100');assert.ok(Math.abs(run('kumiNP(10)')-.44)<1e-10);assert.ok(run('exactKumiP(10)')<.1);});
test('annual goals follow the selected life direction',()=>{for(const [aim,key] of [['teacher','teach'],['dojo','open'],['life','practice'],['uchi','twuchi']]){run('newState({...basic,aim:'+JSON.stringify(aim)+'});S.rank=6;S.age=25;S.flags.instDone=1');assert.equal(run('goalPick().k'),key);}});
test('career warning and expired apprentice route are visible',()=>{run('newState({...basic,aim:"uchi"});S.age=29;S.rank=6;S.flags.instDone=1');assert.match(run('careerPlan().next'),/超過/);run('S.flags.instDone=0');assert.match(run('careerPlan().warning'),/3 年/);});
test('life portrait has four factual dimensions',()=>{run('newState({...basic,aim:"life"});S.age=45;S.rank=6');assert.equal(run('lifePortrait().length'),4);assert.match(run('lifePortrait()[3].text'),/30 年/);assert.doesNotMatch(run('lifePortrait()[3].text'),/伴侶|孩子/);});
test('supporting NPC memories do not change RNG sequence',()=>{run('newState(basic);S.used.npc_k1=1;S.bond.koh=10;globalThis.calls=0;S.r=()=>{calls++;return .5}');assert.match(run('supportEcho()'),/教我的/);assert.equal(run('calls'),0);});
test('training policies use available cards and rest when unwell',()=>{
  run('newState(basic);globalThis.promptTest={title:"稽古方針",opts:[{id:"kb"},{id:"mjis"},{id:"rest"}]}');
  assert.equal(run('pacePick(promptTest,"repeat","kb")'),'kb');
  run('S.hp=20');assert.equal(run('pacePick(promptTest,"repeat","mjis")'),'rest');
});
test('pace stops at events and records a replayable choice sequence',()=>{
  run('startGame(basic,[]);paceRun("exam")');assert.equal(run('/^稽古方針/.test(G.prompt.title)'),false);
  const before=run(snapshot);run('globalThis.paceSave={setup:G.setup,choices:G.choices.slice()};globalThis.beforeCount=G.choices.length;paceRun("repeat")');assert.equal(run('G.choices.length===beforeCount'),true);
  run('startGame(paceSave.setup,paceSave.choices)');assert.equal(run(snapshot),before);
});

test('a daily run keeps the selected calendar day across midnight',()=>{
  const cfg=JSON.parse(run('JSON.stringify(makeSetup({...basic,name:"日期測試"},"2026-10-18"))'));
  assert.equal(cfg.daily,'2026-10-18');assert.equal(cfg.seed,run('challengeSetup("2026-10-18","日期測試").seed'));
});
test('repeat-rest policy continues resting',()=>{
  run('newState(basic);S.hp=100;globalThis.restPrompt={opts:[{id:"kb"},{id:"rest"}]}');
  assert.equal(run('pacePick(restPrompt,"repeat","rest")'),'rest');
});
const summaries=[];

for(let i=0;i<36;i++){
  const aim=['balanced','champion','teacher','dojo','uchi','life'][i%6];
  const setup={...basic,seed:110003+i*1877,aim,home:['pingtung','zuoying','lingya','fengshan','zhutian','tainan','xiaogang','nanzi','chaozhou'][i%9],wc:['ll','light','middle','lh','heavy'][i%5],sex:i%2?'f':'m'};
  test('new-version complete life and replay '+aim+' '+i,()=>{
    c.setup=setup;run('startGame(setup,[])');
    const result=JSON.parse(run('(()=>{let steps=0;while(G.prompt.kind!=="end"&&steps<8000){const opts=G.prompt.opts.filter(o=>!o.disabled);let opt=opts.find(o=>o.rec)||opts[steps%opts.length];if(G.prompt.kind==="battle")opt=opts.find(o=>o.id==="auto")||opt;const id=String(opt.id);G.choices.push(id);const r=G.gen.next(id);if(r.done)throw new Error("early end");G.prompt=r.value;steps++;}return JSON.stringify({steps,end:G.prompt.kind==="end",age:S.age,rank:S.rank,aim:S.setup.aim});})()'));
    assert.equal(result.end,true);const before=run(snapshot);run('globalThis.completedChoices=G.choices.slice();startGame(setup,completedChoices)');assert.equal(run(snapshot),before);summaries.push(result);
  });
}
const output={checks:count,probability,summaries};
if(!process.argv.includes('--no-write'))fs.writeFileSync('optimized/v2-test-results.json',JSON.stringify(output,null,2));
console.log(count+' v2 checks passed');
