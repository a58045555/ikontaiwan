const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
const st=await p.$('#stage');await st.screenshot({path:'/tmp/claude-0/-home-user/a0bf1956-a110-54d0-bd43-1a036f0a7934/scratchpad/rd10-idle.png'});
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
for(const [sel,name] of [['[data-preview=punchRight]','punch'],['[data-preview=blockMid]','block'],['[data-preview=kickRight]','kick']]){try{await p.click(sel,{force:true,timeout:3000});await p.waitForTimeout(160);await st.screenshot({path:`/tmp/claude-0/-home-user/a0bf1956-a110-54d0-bd43-1a036f0a7934/scratchpad/rd10-${name}.png`});await p.waitForTimeout(900);}catch(e){console.log('skip',name,e.message.split('\n')[0]);}}
console.log('errors',errs);await b.close();})();
