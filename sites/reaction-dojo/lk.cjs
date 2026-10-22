const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelector('.coach-panel').open=true);const st=await p.$('#stage');
for(const lvl of ['low','mid']){await p.click(`[data-coach=${lvl}]`);await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('蓄勢'));await p.waitForTimeout(100);await st.screenshot({path:`${process.argv[2]}/rd13-${lvl}-windup.png`});await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('出招'));await p.waitForTimeout(120);await st.screenshot({path:`${process.argv[2]}/rd13-${lvl}-contact.png`});await p.waitForTimeout(1600);}
console.log('errors',errs);await b.close();})();
