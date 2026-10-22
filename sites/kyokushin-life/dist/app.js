const routes=[
{age:"15",name:"青春競技",label:"把青春，留在每一次稽古裡。",title:"想知道自己，能走到哪裡。",goal:"先把第一拳練好。",desc:"從高一入門，練基本、學型、參加賽事。在學業與修行之間做選擇，也可能踏上內弟子、教學或經營道場的道路。",tags:["稽古與升帶","型與組手","人生岔路"],sprite:"hero-white"},
{age:"15",name:"終身修行",label:"讓練習，慢慢長成生活。",title:"每次回到道場，都是一次選擇。",goal:"把稽古變成日常。",desc:"從十五歲開始，把修行留在日常裡。安排稽古、休息與生活，向小願望前進，依自己的選擇走到六十歲。",tags:["生活與修行","小願望","自己的步調"],sprite:"hero-female"},
{age:"30",name:"成年入門",label:"忙碌之後，也留一點時間給自己。",title:"下班之後，還有另一個起點。",goal:"這週，為自己來一次。",desc:"三十歲，第一次走進道場。從白帶練起，讓基本、型與體能一起進步。升帶、交流與協助後輩，讓修行陪你走進往後的生活。",tags:["成年白帶","均衡基本課","生活的第二章"],sprite:"hero-female"},
{age:"45",name:"第一次入門",label:"你願意開始的今天，就是好日子。",title:"把「有一天」，變成今天。",goal:"照自己的步調開始。",desc:"四十五歲也能開啟第一堂課。練習、休養、參加合適的賽事，慢慢走向下一條腰帶。教學與開館仍需取得相應資格。",tags:["初次入門","持續練習","修行到六十歲"],sprite:"hero-white"}
];
const stories=[
{kicker:"回望 / 那個站在門口的你",title:"原來，已經走了這麼遠。",paras:["第一次繫腰帶的時候，你低著頭，怕別人看見自己不會。前輩沒有催，只是站在旁邊，等你再試一次。","多年後，你也在道場裡等一個手忙腳亂的孩子。那一刻才明白，有些教過你的事，要走很遠，才真正學會。"],sign:"— 在每一次「押忍」之後"},
{kicker:"同行 / 有些名字，還是放不下",title:"那一聲前輩，還記得嗎？",paras:["弟子第一次說要離開的那天，你忙著叮囑他，要記得練基本、不要荒廢。送他到門口，才發現一句捨不得，都沒有說。","後來他帶著自己的弟子回來。那孩子鞠躬叫了你一聲，你忽然不知道該怎麼回禮。他笑著說：「您教我的，我都有帶著。」"],sign:"— 你留下的，正在別人身上繼續"},
{kicker:"給自己 / 如果能再見一次",title:"先抱抱，那個害怕的自己。",paras:["如果能回到第一天，我想告訴你：會有落敗的時候，會有想逃的晚上。也會有人，在你最不相信自己的那天，認真地等你再來。","那時候先別急著證明什麼。好好吃飯，好好休息。等明天道場的燈亮了，我們再一起推開那扇門。"],sign:"— 給還沒走到這裡的你"}
];
function bindTabs(buttons,choose){buttons.forEach((b,i)=>{b.addEventListener("click",()=>choose(i));b.addEventListener("keydown",e=>{let n=i;if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(i+1)%buttons.length;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(i+buttons.length-1)%buttons.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=buttons.length-1;else return;e.preventDefault();choose(n);buttons[n].focus();});});}
function select(buttons,i,panel){buttons.forEach((b,n)=>{b.setAttribute("aria-selected",String(n===i));b.tabIndex=n===i?0:-1;});panel.setAttribute("aria-labelledby",buttons[i].id);}
const routeButtons=[...document.querySelectorAll("[data-route]")],routePanel=document.getElementById("route-panel");
bindTabs(routeButtons,i=>{const r=routes[i];select(routeButtons,i,routePanel);document.getElementById("route-age").textContent=r.age+" 歲 / "+r.name;document.getElementById("route-year").textContent=r.age;document.getElementById("route-label").textContent=r.label;document.getElementById("route-title").textContent=r.title;document.getElementById("route-goal").textContent=r.goal;document.getElementById("route-desc").textContent=r.desc;document.getElementById("route-sprite").src="assets/"+r.sprite+".webp";document.getElementById("route-tags").replaceChildren(...r.tags.map(t=>{const s=document.createElement("span");s.textContent=t;return s;}));});
const storyButtons=[...document.querySelectorAll("[data-story]")],storyPanel=document.getElementById("story-panel");
bindTabs(storyButtons,i=>{const s=stories[i];select(storyButtons,i,storyPanel);document.getElementById("story-kicker").textContent=s.kicker;document.getElementById("story-title").textContent=s.title;document.getElementById("story-copy").replaceChildren(...s.paras.map(t=>{const p=document.createElement("p");p.textContent=t;return p;}));document.querySelector(".story-sign").textContent=s.sign;document.getElementById("story-page").textContent=String(i+1).padStart(2,"0")+" / 03";});
const menu=document.querySelector(".menu-toggle"),nav=document.getElementById("nav");
function closeMenu(){menu.setAttribute("aria-expanded","false");nav.classList.remove("open");menu.querySelector("span").textContent="＋";}
menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(open));nav.classList.toggle("open",open);menu.querySelector("span").textContent=open?"－":"＋";});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.getAttribute("aria-expanded")==="true"){closeMenu();menu.focus();}});

