/* CHARACTER_PILOT_STORAGE_BEGIN */
let PILOT_DEMO=false;
const PILOT_NS='kyokushin-character-play-v1:';
let PILOT_NATIVE_STORAGE;try{PILOT_NATIVE_STORAGE=globalThis.localStorage;}catch(e){}
const localStorage={
getItem(k){return PILOT_NATIVE_STORAGE?PILOT_NATIVE_STORAGE.getItem(PILOT_NS+(PILOT_DEMO?'demo:':'')+k):null;},
setItem(k,v){if(!PILOT_NATIVE_STORAGE)throw Error('Storage unavailable');PILOT_NATIVE_STORAGE.setItem(PILOT_NS+(PILOT_DEMO?'demo:':'')+k,String(v));},
removeItem(k){if(PILOT_NATIVE_STORAGE)PILOT_NATIVE_STORAGE.removeItem(PILOT_NS+(PILOT_DEMO?'demo:':'')+k);}
};
/* CHARACTER_PILOT_STORAGE_END */
