/* Old address → new address.
   a58045555.github.io is blocked on some Wi-Fi networks, so every page on it forwards to
   ikontaiwan.vercel.app and carries the game's local data along in the URL fragment.
   The new address imports keys it does not already have, then reloads once.
   Add ?stay=1 to an old address to stay there (for example, to copy a save code by hand). */
(function(){
  var OLD='a58045555.github.io',NEW='https://ikontaiwan.vercel.app',TAG='#kmig=';
  var KEYS=/^(kyokushin|kl-|kyk-|rk-)/;
  function b64e(str){var b=new TextEncoder().encode(str),s='';for(var i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function b64d(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';var s=atob(t),b=new Uint8Array(s.length);for(var i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return new TextDecoder().decode(b);}
  function toast(msg){var show=function(){var d=document.createElement('div');d.setAttribute('role','status');d.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,420px);background:#26223b;color:#f3ecdc;border:3px solid #f2c24f;padding:10px 14px;font:700 14px/1.6 "Noto Sans TC",sans-serif;text-align:center;box-shadow:4px 4px 0 #0d1024';d.innerHTML=msg;document.body.appendChild(d);setTimeout(function(){d.remove();},7000);};if(document.body)show();else document.addEventListener('DOMContentLoaded',show);}

  if(location.hostname===OLD){
    if(/[?&]stay=1/.test(location.search))return;
    var path=location.pathname.replace(/^\/ikontaiwan(?=\/|$)/,'')||'/';
    var dest=NEW+path+location.search,frag='';
    try{var data={},n=0;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&KEYS.test(k)){data[k]=localStorage.getItem(k);n++;}}
      if(n){var enc=b64e(JSON.stringify(data));if(enc.length<1500000)frag=TAG+enc;}}catch(e){}
    location.replace(dest+(frag||location.hash));
    return;
  }

  if(location.hash.indexOf(TAG)!==0)return;
  var raw=location.hash.slice(TAG.length);
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  try{
    var d=JSON.parse(b64d(raw)),added=0,kept=0;
    for(var k in d){if(!KEYS.test(k)||typeof d[k]!=='string')continue;var cur=localStorage.getItem(k);if(cur===null){localStorage.setItem(k,d[k]);added++;}else if(cur!==d[k])kept++;}
    toast(kept?'已經搬到新網址 ikontaiwan.vercel.app。<br>這裡原本就有存檔，所以保留了這裡的進度。':'已經搬到新網址 ikontaiwan.vercel.app'+(added?'，存檔也一起帶過來了。':'。')+'<br>以後請直接用這個網址。');
  }catch(e){toast('已經搬到新網址 ikontaiwan.vercel.app。<br>以後請直接用這個網址。');}
})();
