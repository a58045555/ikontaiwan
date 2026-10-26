import {KAI,LEVELS,STRIKES} from './kai.mjs?v=25';
export const ACTIONS={idle:{row:0,duration:.8,label:'架勢 / READY'},walk:{row:1,duration:.56,label:'架勢 / READY'},punch:{row:2,duration:.42,label:'直拳 / PUNCH',damage:10},kick:{row:3,duration:.64,label:'踢擊 / KICK',damage:18},block:{row:4,duration:.48,label:'格擋 / GUARD'},hit:{row:5,duration:.5,label:'受擊 / HIT'}};
const guardKey=l=>'block'+l[0].toUpperCase()+l.slice(1);
export class Dojo{
 constructor(random=Math.random){this.random=random;this.now=0;this.started=false;this.reset();}
 reset(mode='free'){Object.assign(this,{mode,timeLeft:45,hp:100,x:.55,targetX:.73,face:1,lockFacing:true,action:'idle',actionAt:this.now,actionSerial:0,hitApplied:false,hits:0,guards:0,attempts:0,damage:0,reactions:[],events:[],cue:null,enemyAttack:null,enemyHitUntil:0,coachPreview:null,preview:null,nextCue:this.now+1.8,counterUntil:0,counterConsumed:false,guardLatch:null,lastLevel:null,guardLevel:'mid',attackSide:'right',paused:false,finished:false,message:'凱師範：先看動作，擋成功再反擊。'});this.held={blockHigh:false,blockMid:false,blockLow:false};this.guardTimes={high:-Infinity,mid:-Infinity,low:-Infinity};this.guardOrder={high:0,mid:0,low:0};this.holdSerial=0;this.strikes={punchLeft:0,punchRight:0,kickLeft:0,kickRight:0};}
 start(mode='free'){this.reset(mode);this.started=true;}
 emit(type,data={}){this.events.push({type,...data});}
 setAction(a){if(!ACTIONS[a])return;this.action=a;this.actionAt=this.now;this.actionSerial++;this.hitApplied=false;}
 get phase(){if(this.preview)return 'preview';if(this.cue)return 'defend';if(this.counterUntil>this.now&&!this.counterConsumed)return 'counter';if(['punch','kick','hit'].includes(this.action))return 'recover';return 'ready';}
 get counterReady(){return this.started&&!this.paused&&!this.finished&&this.phase==='counter';}
 hold(a,on){if(a==='block')a='blockMid';if(!(a in this.held)||!this.started||this.paused||this.finished||this.preview)return;const level=a.slice(5).toLowerCase();if(on&&!this.held[a]){this.guardTimes[level]=this.now;this.guardOrder[level]=++this.holdSerial;this.guardLevel=level;if(this.cue)this.guardLatch={level,at:this.now,until:this.cue.at+this.cue.delay+.08};if(!['punch','kick','hit'].includes(this.action))this.setAction('block');}this.held[a]=on;}
 selectedGuard(){return ['high','mid','low'].filter(l=>this.held[guardKey(l)]).sort((a,b)=>this.guardOrder[b]-this.guardOrder[a])[0]||null;}
 releaseAll(){for(const a in this.held)this.held[a]=false;this.guardLatch=null;}
 act(key){const move=STRIKES[key]||(['punch','kick'].includes(key)?{action:key,side:'right'}:null);if(!move||!this.started||this.paused||this.finished||this.preview)return false;if(!this.counterReady){this.message=this.cue?'先擋住這一招，再反擊。':'等待師範出招，格擋後才有反擊機會。';return false;}if(['punch','kick','hit'].includes(this.action))return false;this.counterConsumed=true;this.attackSide=move.side;this.setAction(move.action);this.message=(STRIKES[key]?.label||'出招')+'反擊！';this.emit('swing',{action:move.action,side:move.side});return true;}
 inspect(key){const move=STRIKES[key],level={blockHigh:'high',blockMid:'mid',blockLow:'low'}[key],a=move?.action||(level?'block':key);if(!ACTIONS[a]||this.finished)return;this.releaseAll();this.cue=null;this.counterUntil=0;this.coachPreview=null;if(move)this.attackSide=move.side;if(level)this.guardLevel=level;this.preview={action:a,key,until:this.now+2.4,at:this.now};this.setAction(a);this.emit('preview');}
 pause(){if(!this.started||this.finished)return;this.paused=true;this.releaseAll();}
 resume(){this.paused=false;}
 update(dt){if(!this.started||this.paused||this.finished)return;dt=Math.min(.05,Math.max(0,dt));this.now+=dt;
  if(this.preview){if(this.now>=this.preview.until){this.preview=null;this.coachPreview=null;this.enemyAttack=null;this.setAction('idle');this.nextCue=this.now+1.3;}return;}
  if(this.mode==='challenge'){this.timeLeft=Math.max(0,this.timeLeft-dt);if(this.timeLeft<=0){this.end();return;}}
  const meta=ACTIONS[this.action],elapsed=this.now-this.actionAt;
  if(['punch','kick','hit'].includes(this.action)){if(this.action!=='hit'&&!this.hitApplied&&elapsed>=meta.duration*.44){this.hitApplied=true;this.hits++;this.damage+=meta.damage;this.strikes[this.action+(this.attackSide==='left'?'Left':'Right')]++;this.message='反擊命中！收招，準備下一次防守。';this.enemyHitUntil=this.now+.3;this.emit('impact',{action:this.action,side:this.attackSide});}if(elapsed>=meta.duration)this.setAction('idle');}
  else{const level=this.guardLatch?.until>this.now?this.guardLatch.level:this.selectedGuard();if(level&&this.cue){this.guardLevel=level;if(this.action!=='block')this.setAction('block');}else if(this.action!=='idle')this.setAction('idle');}
  if(!this.cue&&this.now>=this.nextCue){let moves=KAI.moves,move;if(this.mode==='free')move=moves[this.attempts%moves.length];else{moves=moves.filter(m=>m.level!==this.lastLevel);move=moves[Math.min(moves.length-1,Math.floor(this.random()*moves.length))];}this.lastLevel=move.level;const delay=this.mode==='free'?1.3:Math.max(.82,1.12-this.guards*.018);this.cue={...move,at:this.now,delay,side:'right'};this.attempts++;this.guardLatch=null;this.counterUntil=0;this.counterConsumed=false;this.message=this.mode==='free'?'看清'+LEVELS[move.level]+'起手，點一下對應格擋。':'看師範的動作，判斷攻擊高度。';this.emit('cue',{level:move.level});}
  if(this.cue&&this.now>=this.cue.at+this.cue.delay){const cue=this.cue,latch=this.guardLatch?.until>this.now?this.guardLatch:null,selected=latch?.level||this.selectedGuard(),timing=(latch?.at??this.guardTimes[cue.level])-cue.at,blocking=selected===cue.level&&this.action==='block';this.enemyAttack={...cue,until:this.now+.36};this.cue=null;this.guardLatch=null;this.nextCue=this.now+2.4;
   if(blocking&&timing>=0){this.guards++;this.reactions.push(timing);this.counterUntil=this.now+1.25;this.counterConsumed=false;this.message=LEVELS[cue.level]+'格擋成功！選左／右拳腳反擊。';this.emit('guard',{reaction:timing,level:cue.level});this.setAction('idle');}
   else if(blocking){this.message='有擋住；下一次等起手後再按，才能開啟反擊。';this.emit('early');}
   else{if(this.mode==='challenge')this.hp=Math.max(0,this.hp-15);this.setAction('hit');this.message=(selected?'高度不對，這招要擋':'這招要擋')+LEVELS[cue.level]+(this.mode==='free'?'。慢慢來，再試一次。':'。下一招再來！');this.emit('hurt',{level:cue.level,wrongLevel:!!selected});if(this.hp===0)this.end();}}
 }
 end(){this.finished=true;this.releaseAll();this.emit('end');}
 frame(){const a=this.preview?.action||this.action;return Math.min(3,Math.floor((this.now-this.actionAt)/ACTIONS[a].duration*4)%4);}
 get best(){return this.reactions.length?Math.min(...this.reactions):null;}
}

