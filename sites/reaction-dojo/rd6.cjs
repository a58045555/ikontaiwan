const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await p.goto('http://127.0.0.1:18880/');await p.waitForFunction(()=>!document.getElementById('start').disabled,{timeout:15000});await p.click('#start');await p.waitForTimeout(400);
const st=await p.$('#stage');await st.screenshot({path:'/tmp/claude-0/-home-user/a0bf1956-a110-54d0-bd43-1a036f0a7934/scratchpad/rd8-idle.png'});
await p.evaluate(()=>document.querySelector('.coach-panel').open=true);
for(const lvl of ['high','mid','low']){await p.click(`[data-coach=${lvl}]`);await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('蓄勢'));await p.waitForTimeout(100);await st.screenshot({path:`/tmp/claude-0/-home-user/a0bf1956-a110-54d0-bd43-1a036f0a7934/scratchpad/rd8-${lvl}-windup.png`});await p.waitForFunction(()=>document.getElementById('actionLabel').textContent.includes('出招'));await p.waitForTimeout(120);await st.screenshot({path:`/tmp/claude-0/-home-user/a0bf1956-a110-54d0-bd43-1a036f0a7934/scratchpad/rd8-${lvl}-contact.png`});await p.waitForTimeout(1600);}
await b.close();})();
