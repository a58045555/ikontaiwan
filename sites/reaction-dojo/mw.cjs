const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelector('.coach-panel').open=true);const st=await p.$('#stage');
await p.click('[data-coach=mid]');await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('蓄勢'));await p.waitForTimeout(100);await st.screenshot({path:process.argv[2]+'/rd11-mid-windup.png'});await b.close();})();
