/* Presentation adapters only: no changes to stats, RNG, choices or battle resolution. */
const PILOT_CHECKPOINTS=__PILOT_FIXTURES__;
const PILOT_SHEETS={hero:'character-study/assets/hero-belts-v1.webp',rival:'character-study/assets/rival-belts-v1.webp'};
const PILOT_PORTRAITS={hero:'character-study/assets/hero.webp',rival:'character-study/assets/rival-v3.webp'};
const PILOT_CACHE={hero:[],rival:[],heads:{},headURLs:{}};
let PILOT_ENABLED=true,PILOT_LOAD_STATE='loading';
try{PILOT_ENABLED=PILOT_NATIVE_STORAGE?.getItem(PILOT_NS+'art-enabled')!=='0';}catch(e){}
function pilotEligible(person){return !!person&&person.sex==='m'&&Number.isFinite(person.age)&&person.age>=15&&person.age<22;}
function pilotBelt(rank){const n=Number(rank);return Number.isFinite(n)?Math.max(0,Math.min(6,Math.floor(n))):0;}
function pilotFrame(width,height,rank){const i=pilotBelt(rank);return {x:i%4*width/4,y:Math.floor(i/4)*height/2,w:width/4,h:height/2};}
function pilotCurrent(){return !!(PILOT_ENABLED&&S&&G&&pilotEligible({sex:S.setup?.sex||G.setup?.sex,age:S.age}));}
function pilotCanvas(width,height){const cv=document.createElement('canvas');cv.width=width;cv.height=height;Object.defineProperties(cv,{complete:{value:true},naturalWidth:{get:()=>cv.width},naturalHeight:{get:()=>cv.height}});return cv;}
function pilotReady(role,rank){return !!PILOT_CACHE[role]?.[pilotBelt(rank)];}
function pilotBody(cv,role,rank){const im=PILOT_CACHE[role]?.[pilotBelt(rank)];if(!cv||!im)return false;cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);x.drawImage(im,0,0);cv.classList.add('hpx','pilot-sprite');cv.dataset.pilotRole=role;cv.dataset.pilotBelt=String(pilotBelt(rank));return true;}
function pilotHead(cv,role){const im=PILOT_CACHE.heads[role];if(!cv||!im)return false;cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);x.drawImage(im,0,0);cv.classList.add('hpx');cv.dataset.pilotRole=role;return true;}
function pilotClear(cv){if(!cv)return;cv.classList.remove('pilot-sprite');delete cv.dataset.pilotRole;delete cv.dataset.pilotBelt;}
const pilotBaseDrawHero=drawHero;
drawHero=function(cv,rank,crop,fm){if(pilotCurrent()&&fm!==true){if(crop&&pilotHead(cv,'hero'))return true;if(!crop&&pilotBody(cv,'hero',rank))return true;}pilotClear(cv);return pilotBaseDrawHero(cv,rank,crop,fm);};
const pilotBaseFoeKey=foeKey;
foeKey=function(f){return pilotCurrent()&&f?.rival&&pilotReady('rival',f.belt)?'pilot-rival-'+pilotBelt(f.belt):pilotBaseFoeKey(f);};
const pilotBaseDrawPx=drawPx;
drawPx=function(cv,key){if(pilotCurrent()){if(/^back_/.test(key)&&pilotBody(cv,'hero',HERO_KEYS.indexOf(key.slice(5))))return true;if(/^pilot-rival-/.test(key)&&pilotBody(cv,'rival',Number(key.slice(12))))return true;}pilotClear(cv);return pilotBaseDrawPx(cv,key);};
const pilotBasePoseKey=poseKey;
poseKey=function(f,type){if(pilotCurrent()){if(f?.me&&pilotReady('hero',f.belt))return 'pilot-hero-'+pilotBelt(f.belt);if(f?.rival&&pilotReady('rival',f.belt))return 'pilot-rival-'+pilotBelt(f.belt);}return pilotBasePoseKey(f,type);};
const pilotBaseVs=vsSplash;
vsSplash=function(p){pilotBaseVs(p);if(!pilotCurrent())return;const cv=document.querySelector('#card .vss .vsme');if(cv)pilotBody(cv,'hero',p.me.belt);};
const pilotBaseBattleTut=battleTut;
battleTut=function(){if(!PILOT_DEMO)pilotBaseBattleTut();};
const pilotBaseRender=render;
render=function(){pilotBaseRender();if(typeof document==='undefined')return;const p=G?.prompt;if(pilotCurrent()&&p?.kind!=='battle'&&speakerOf(p)?.[0]==='rival'&&PILOT_CACHE.headURLs.rival){const im=document.querySelector('#card .dlg img.pxh');if(im){im.src=PILOT_CACHE.headURLs.rival;im.alt='宿敵・'+S.rival;im.dataset.pilotRole='rival';im.classList.add('pilot-head');}}
const status=document.getElementById('pilotState');if(status){const mode=PILOT_DEMO?'示範片段':'我的測試人生';status.textContent=(G?mode+'・'+S.age+' 歲・'+RANKS[S.rank]:'建立你自己的測試人生')+(PILOT_LOAD_STATE==='loading'?'・人物載入中':PILOT_LOAD_STATE==='partial'?'・部分圖片未載入，使用原有素材':'');}
const toggle=document.getElementById('pilotArt');if(toggle){toggle.setAttribute('aria-pressed',String(PILOT_ENABLED));toggle.textContent=PILOT_ENABLED?'人物：新版':'人物：原有';}
const back=document.getElementById('pilotMine');if(back)back.hidden=!PILOT_DEMO;
};
function pilotLoadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Artwork unavailable'));im.src=src;});}
function pilotBuildSheet(role,im){if(im.naturalWidth%4||im.naturalHeight%2)throw Error('Invalid sprite grid');for(let rank=0;rank<7;rank++){const f=pilotFrame(im.naturalWidth,im.naturalHeight,rank),cv=pilotCanvas(f.w,f.h),x=cv.getContext('2d');x.imageSmoothingEnabled=false;if(role==='rival'){x.translate(cv.width,0);x.scale(-1,1);}x.drawImage(im,f.x,f.y,f.w,f.h,0,0,cv.width,cv.height);PILOT_CACHE[role][rank]=cv;PXIMG['pilot-'+role+'-'+rank]=cv;}}
function pilotBuildHead(role,im){const cv=pilotCanvas(200,200),x=cv.getContext('2d');x.imageSmoothingEnabled=false;const w=im.naturalWidth*.62;x.drawImage(im,im.naturalWidth*.22,im.naturalHeight*.005,w,w,0,0,200,200);PILOT_CACHE.heads[role]=cv;PILOT_CACHE.headURLs[role]=cv.toDataURL('image/png');}
async function pilotLoadArt(){const jobs=[];for(const role of ['hero','rival']){jobs.push(pilotLoadImage(PILOT_SHEETS[role]).then(im=>pilotBuildSheet(role,im)));jobs.push(pilotLoadImage(PILOT_PORTRAITS[role]).then(im=>pilotBuildHead(role,im)));}const results=await Promise.allSettled(jobs);PILOT_LOAD_STATE=results.every(x=>x.status==='fulfilled')?'ready':'partial';render();}
function pilotCancelTransient(){GT=null;POSE_TOKEN++;TL_SKIP=null;clearTimeout(ATBLK_T);document.querySelectorAll('.btut,.vss').forEach(el=>el.remove());document.body.classList.remove('introOn');}
function pilotCheckpoint(key,focus=true){const data=PILOT_CHECKPOINTS[key];if(!data)return;pilotCancelTransient();PILOT_DEMO=true;const intro=document.getElementById('intro'),entry=document.getElementById('entry');if(intro)intro.hidden=true;if(entry)entry.hidden=true;startGame(data.setup,data.choices);const target=key==="card"?(focus?document.getElementById("panels"):null):document.getElementById("card");window.scrollTo({top:target?Math.max(0,target.getBoundingClientRect().top+window.scrollY-12):0});}
function pilotMyLife(){pilotCancelTransient();PILOT_DEMO=false;const saved=loadSave();if(saved)startGame(saved.setup,saved.choices);else{G=null;render();}window.scrollTo({top:0});}
function pilotInstall(){document.getElementById('pilotMenu').addEventListener('click',()=>document.querySelector('.pilot-bar').scrollIntoView({behavior:'smooth',block:'start'}));document.querySelectorAll('[data-pilot-scene]').forEach(b=>b.addEventListener('click',()=>pilotCheckpoint(b.dataset.pilotScene)));document.getElementById('pilotMine').addEventListener('click',pilotMyLife);document.getElementById('pilotArt').addEventListener('click',()=>{PILOT_ENABLED=!PILOT_ENABLED;try{PILOT_NATIVE_STORAGE?.setItem(PILOT_NS+'art-enabled',PILOT_ENABLED?'1':'0');}catch(e){}render();});pilotLoadArt();}
const pilotBaseBoot=boot;
boot=function(data){const key=typeof location==='undefined'?null:new URLSearchParams(location.search).get('scene');if(Object.hasOwn(PILOT_CHECKPOINTS,key)){initUI();pilotCheckpoint(key,false);}else pilotBaseBoot(data);if(typeof document!=='undefined')pilotInstall();};
