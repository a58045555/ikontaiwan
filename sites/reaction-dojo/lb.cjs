const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));const st=await p.$('#stage');
await p.click('[data-preview=blockLow]',{force:true});await p.waitForTimeout(200);await st.screenshot({path:process.argv[2]+'/rd22-lowblock.png'});console.log('errors',errs);await b.close();})();
