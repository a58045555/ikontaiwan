const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));const st=await p.$('#stage');
for(const [sel,name] of [['[data-preview=blockLow]','lowblock'],['[data-preview=blockMid]','midblock']]){await p.click(sel,{force:true});await p.waitForTimeout(200);await st.screenshot({path:`${process.argv[2]}/rd12-${name}.png`});await p.waitForTimeout(900);}
await p.click('[data-coach=high]');await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('蓄勢'));await p.waitForTimeout(100);await st.screenshot({path:process.argv[2]+'/rd12-high-windup.png'});await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('出招'));await p.waitForTimeout(120);await st.screenshot({path:process.argv[2]+'/rd12-high-contact.png'});
console.log('errors',errs);await b.close();})();
