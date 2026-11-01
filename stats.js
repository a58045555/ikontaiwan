/* Anonymous visit counter (GoatCounter: ikontaiwan.goatcounter.com).
   Counts only on the public hosts. window.kstat('名稱') records an event. */
(function(){
  var ON=/(^|\.)(a58045555\.github\.io|ikontaiwan\.vercel\.app)$/.test(location.hostname);
  function send(p,t,ev){if(!ON)return;try{var q=new URLSearchParams({p:p,t:t,e:ev?'true':'false',r:ev?'':document.referrer,s:screen.width+','+screen.height+','+(devicePixelRatio||1),rnd:Math.random().toString(36).slice(2)});var u='https://ikontaiwan.goatcounter.com/count?'+q;if(navigator.sendBeacon)navigator.sendBeacon(u);else new Image().src=u;}catch(e){}}
  window.kstat=function(name){send(name,name,true);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){send(location.pathname,document.title,false);});else send(location.pathname,document.title,false);
})();
