export const ATTACK_COLUMNS={high:0,mid:1,low:2};
export function coachSize(H){return H*.76;}
export function coachPose(game){
 if(game.coachPreview){const p=Math.min(1,(game.now-game.preview.at)/2.4);return {level:game.coachPreview,row:p<.2?0:p<.5?1:p<.82?2:1,progress:p};}
 if(game.cue){const p=(game.now-game.cue.at)/game.cue.delay;return {level:game.cue.level,row:p<.18?0:p<.83?1:2,progress:p};}
 if(game.enemyAttack?.until>game.now){const remaining=game.enemyAttack.until-game.now;return {level:game.enemyAttack.level,row:remaining>.2?2:1,progress:1};}
 return {level:'mid',row:0,progress:0};
}
export class KaiRenderer{
 constructor(){this.atlas=new Image();this.frames=[];}
 load(){return new Promise((resolve,reject)=>{this.atlas.onerror=()=>reject(Error('凱師範素材載入失敗'));this.atlas.onload=()=>{try{const c=document.createElement('canvas');c.width=this.atlas.width;c.height=this.atlas.height;const q=c.getContext('2d');q.drawImage(this.atlas,0,0);const data=q.getImageData(0,0,c.width,c.height).data;const rows=[0,417,847,c.height];for(let r=0;r<3;r++)for(let col=0;col<3;col++){const x0=Math.round(col*c.width/3),x1=Math.round((col+1)*c.width/3);let left=x1,right=x0,top=rows[r+1],bottom=rows[r];for(let y=rows[r];y<rows[r+1];y++)for(let x=x0;x<x1;x++)if(data[(y*c.width+x)*4+3]>160){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}if(right<=left)throw Error('動作圖不完整');let sum=0,n=0;for(let y=top;y<top+(bottom-top)*.25;y++)for(let x=left;x<=right;x++)if(data[(y*c.width+x)*4+3]>180){sum+=x;n++;}this.frames.push({x:left,y:top,w:right-left+1,h:bottom-top+1,anchor:(n?sum/n:(left+right)/2)-left});}resolve();}catch(e){reject(e);}};this.atlas.src='assets/kai-reference-actions-v8.png';});}
 draw(ctx,game,t,x,y,height){const pose=coachPose(game),f=this.frames[pose.row*3+ATTACK_COLUMNS[pose.level]];if(!f)return;const room=Math.min(x,ctx.canvas.width-x)-ctx.canvas.width*.055;const scale=Math.min(height/424,room/Math.max(f.anchor,f.w-f.anchor));const breath=pose.row===0?Math.sin(t*2.5)*height*.004:0,lunge=pose.row===2?1.035:1;ctx.save();ctx.translate(x,y+breath);ctx.fillStyle='#17263755';ctx.beginPath();ctx.ellipse(0,2,height*.2,height*.025,0,0,Math.PI*2);ctx.fill();if(game.enemyHitUntil>game.now)ctx.translate(Math.sin(t*55)*4,-3);ctx.scale(scale*lunge,scale*lunge);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(this.atlas,f.x,f.y,f.w,f.h,-f.anchor,-f.h,f.w,f.h);ctx.restore();}
}

