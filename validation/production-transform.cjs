function transformProduction(page){
  const once=(from,to)=>{if(page.split(from).length!==2)throw Error('Production anchor missing or ambiguous: '+from.slice(0,90));page=page.replace(from,to);};
  once('<base href="../">\n','');
  once('<link rel="manifest" href="preview-v2/manifest.json">','<link rel="manifest" href="manifest.json">');
  once('const PREVIEW_STORAGE={getItem(k){return localStorage.getItem(\'kyokushin-preview-v20:\'+k)},setItem(k,v){localStorage.setItem(\'kyokushin-preview-v20:\'+k,v)},removeItem(k){localStorage.removeItem(\'kyokushin-preview-v20:\'+k)}};\n','');
  page=page.replaceAll('PREVIEW_STORAGE.','localStorage.');
  once('const GC_ON=false; // Preview traffic stays separate.',"const GC_ON=typeof location!=='undefined'&&/(^|\\.)a58045555\\.github\\.io$/.test(location.hostname);");
  const note=page.match(/<div role="note"[^>]*>手機測試版 v2\.7[\s\S]*?<\/div>/);
  if(!note)throw Error('Preview banner missing');once(note[0]+'\n','');
  once('<title>極真人生 v2.7 手機測試版</title>','<title>極真人生 v2.7</title>');
  once('v2.7 測試版・2026.10.20','v2.7 正式版・2026.10.20');
  once("x.fillText('a58045555.github.io/ikontaiwan/preview-v2/',280,1368)","x.fillText('a58045555.github.io/ikontaiwan/',280,1368)");
  once('從十五歲高一入門，一路練到黑帶、全日本、世界大賽，甚至成為台灣支部長。','從青春競技到成年入門，體驗升帶、賽事、道場生活與三代師徒傳承。');
  once('抽稽古牌、比賽、升段審查、當內弟子、開道場。你的空手道人生會走到哪裡？','選擇入門時刻，抽稽古牌、參加比賽、陪伴弟子，走出自己的空手道人生。');
  return page;
}
module.exports={transformProduction};
