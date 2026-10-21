// Simple model of the hanno formal challenge (hanno/index.html): timing windows, gaps, feints and double attacks.
// It estimates who can clear each sensei; it is a planning aid, not a human reaction-time study.
// Model of hanno/index.html formal challenge. Player: lognormal RT (median m, sd ~22%), +60ms touch latency,
// 3% wrong-zone on attacks, presses a feint with prob pf. Not a human study.
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function play(i,med,pf){const T=15000,W0=950-i*62,gap0=640-i*44,feintP=Math.min(.3,.08+i*.02+([1,2,4].includes(i)?.04:0)),dblP=Math.min(.5,.06+i*.045+(i===3?.08:0));
 let t=0,score=0,lives=3,delay=null;const speed=()=>1-.22*(Math.min(t,T)/T);
 while(true){t+=delay??gap0*(.7+Math.random()*.6)*speed();delay=null;if(t>=T)break;
  if(score>=1&&Math.random()<feintP){if(Math.random()<pf){lives--;if(!lives)break;delay=Math.max(350,gap0);t+=med*.8;continue;}t+=700;score++;continue;}
  const W=Math.max(300,W0*speed()),rt=med*Math.exp(.22*randn())+60;
  if(rt>=W||Math.random()<.03){t+=Math.min(rt,W);lives--;if(!lives)break;delay=Math.max(350,gap0);continue;}
  t+=rt;if(t>=T)break;score++;if(score>=2&&Math.random()<dblP)delay=120;}
 return score>=10;}
const meds=[[300,'很快的大人 300ms'],[380,'一般大人 380ms'],[450,'國中生 450ms'],[550,'國小高年級 550ms'],[650,'國小低年級 650ms']];
console.log('過關率（10 次成功）：關卡 1..10');
for(const [m,n] of meds){const row=[];for(let i=0;i<10;i++){let w=0;for(let k=0;k<2000;k++)if(play(i,m,.06))w++;row.push(String(Math.round(w/20)).padStart(3));}console.log(n.padEnd(16),row.join(' '));}
