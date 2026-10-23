import {coachSize} from './kai-reference-renderer.mjs?v=23';
// First-person pixel projection: original Canvas scene + transparent POV art.
export function depthFor(x,targetX=.73){return Math.max(0,Math.min(1,1-(targetX-x)/.61));}
export class FirstPerson{
 constructor(image){this.image=image;this.bounds=[];}
 prepare(){const c=document.createElement('canvas');c.width=this.image.width;c.height=this.image.height;const q=c.getContext('2d');q.drawImage(this.image,0,0);const p=q.getImageData(0,0,c.width,c.height).data,ch=c.height/2,cols=Math.max(2,Math.round(c.width/ch)),cw=c.width/cols;
  // Cells: 0 guard, 1 punch, 2 arm block, 3 kick, 4 shin check (low block). Trailing empty cells are ignored.
  for(let i=0;i<cols*2;i++){let minX=cw,minY=ch,maxX=0,maxY=0;const x0=i%cols*cw,y0=Math.floor(i/cols)*ch;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(p[((y+y0)*c.width+Math.floor(x+x0))*4+3]>128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}if(maxY<=minY){if(i<4)throw Error('第一人稱動作素材不完整');break;}this.bounds.push({x:x0,y:y0,w:cw,h:ch,minX,minY,maxX,maxY});}
 }
 scene(ctx,W,H,game,t,drawDummy){const d=depthFor(game.x,game.targetX),walk=game.action==='walk'&&!game.paused,bob=walk?Math.sin(t*12)*H*.006:0,horizon=H*.49;
  const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#34475a');sky.addColorStop(1,'#dba178');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // Front wall, hanging sign and illuminated shoji panels.
  rect(0,0,W,H*.10,'#172637');rect(0,H*.10,W,H*.025,'#936443');
  for(let x=-W*.15;x<W*1.2;x+=W*.17){rect(x,H*.13,W*.14,horizon-H*.13,'#d6b890');for(let y=H*.18;y<horizon;y+=H*.09)rect(x,y,W*.14,3,'#725345');for(let xx=x+W*.035;xx<x+W*.14;xx+=W*.035)rect(xx,H*.13,3,horizon-H*.13,'#80604e');rect(x+W*.14,H*.12,W*.03,horizon-H*.12,'#3b3034');}
  rect(0,horizon-5,W,13,'#4b3733');rect(W*.46,H*.14,W*.08,H*.25,'#bda77b');ctx.fillStyle='#3d3831';ctx.font=`bold ${Math.max(14,H*.055)}px serif`;ctx.textAlign='center';ctx.fillText('極',W*.5,H*.23);ctx.fillText('真',W*.5,H*.31);
  const floor=ctx.createLinearGradient(0,horizon,0,H);floor.addColorStop(0,'#c7b281');floor.addColorStop(1,'#81795d');ctx.fillStyle=floor;ctx.fillRect(0,horizon,W,H-horizon);
  ctx.strokeStyle='#3a514c';ctx.lineWidth=Math.max(2,H*.006);
  for(let i=-5;i<=5;i++){ctx.beginPath();ctx.moveTo(W*.5+i*W*.055,horizon);ctx.lineTo(W*.5+i*W*.32,H);ctx.stroke();}
  const motion=walk?(game.x*6)%1:0;for(let i=0;i<8;i++){const z=(i+motion)/8,y=horizon+(H-horizon)*z*z;rect(0,y,W,Math.max(1,3*z),'#617060');}
  // Side walls converge into the room, without rotating the player's view.
  ctx.fillStyle='#152736';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*.14,H*.14);ctx.lineTo(W*.14,horizon);ctx.lineTo(0,H*.82);ctx.fill();ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W*.86,H*.14);ctx.lineTo(W*.86,horizon);ctx.lineTo(W,H*.82);ctx.fill();
  for(const x of [W*.09,W*.91]){rect(x-3,H*.16,6,H*.19,'#1e2029');rect(x-14,H*.19,28,H*.13,'#e8c992');rect(x-18,H*.185,36,5,'#44352f');}
  const size=coachSize(H,d),ground=H*.91+bob;
  drawDummy(t,W*.5,ground,size/200);
  // Quiet aiming mark; it brightens when within attack range.
  const close=game.targetX-game.x<=.255;ctx.strokeStyle=close?'#f5d28c88':'#e9e0c344';ctx.lineWidth=1;const cy=ground-size*.67;ctx.beginPath();ctx.moveTo(W*.5-8,cy);ctx.lineTo(W*.5-3,cy);ctx.moveTo(W*.5+3,cy);ctx.lineTo(W*.5+8,cy);ctx.stroke();
  return {depth:d,ground,size};
 }
 hands(ctx,W,H,game,t){if(!this.bounds.length)return;const action=game.preview?.action||game.action,duration={punch:.42,kick:.64,hit:.5}[action]||.8,elapsed=game.now-game.actionAt,phase=game.preview?(elapsed%duration)/duration:Math.min(1,elapsed/duration);
  const pulse=['punch','kick'].includes(action)?Math.pow(Math.sin(Math.PI*Math.min(1,phase/.65)),.65):0;
  const moving=game.action==='walk'?Math.sin(t*12)*H*.008:0;
  const draw=(index,alpha=1,offset=0)=>{const f=this.bounds[index],factor=index===4?.98:index===3?.86:index===2?({high:1.18,mid:.98,low:.72}[game.guardLevel]||.98):1.05,size=Math.min(W*.96,H*factor*.84);ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if((index===1||index===3)&&game.attackSide==='left'){ctx.translate(W,0);ctx.scale(-1,1);}ctx.drawImage(this.image,f.x,f.y,f.w,f.h,W*.5-size*.5-(index===3?size*.12:0),H-size+size*.065+moving+offset,size,size);ctx.restore();};
  const lowAttack=game.coachPreview==='low'||game.cue?.level==='low'||(game.enemyAttack?.until>game.now&&game.enemyAttack.level==='low');
  if(action==='block'){if(game.guardLevel==='low'&&this.bounds[4])draw(4,1,0);else draw(2,1,({high:-.10,mid:0,low:.18}[game.guardLevel]||0)*H);}else if(action==='kick'&&phase<.28&&this.bounds[4]){draw(4,1,0);}else if(pulse>.1){draw(action==='kick'?3:1,1,-pulse*H*.035);}else draw(0,1,action==='hit'?Math.sin(phase*Math.PI)*H*.045:lowAttack?H*.12:0);
 }
}

