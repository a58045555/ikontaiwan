const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),work=__dirname,out=__dirname;
function blob(s){const b=Buffer.from(s);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
function transform(base,files){if(blob(base)!=='a174de010aa4e6e75603952d031276dd90414628')throw Error('Production base changed');let h=base;
h=h.replace('<head>','<head>\n<base href="../../">').replace('<link rel="manifest" href="manifest.json">','').replace('<title>極真人生 v2.7</title>','<title>極真人生・人物遊玩測試</title>').replace('v2.7 正式版・2026.10.20','人物遊玩測試・2026.10.21').replace('</style>',files.css+'\n</style>').replace('<body>','<body>\n'+files.header);
const analytics="const GC_ON=typeof location!=='undefined'&&/(^|\\.)a58045555\\.github\\.io$/.test(location.hostname);";
if(!h.includes(analytics))throw Error('Analytics guard changed');h=h.replace(analytics,'const GC_ON=false; /* character pilot */');
h=h.replace('<script>','<script>\n'+files.storage);
const fixture=JSON.parse(files.fixtures);const selected={card:fixture.card,dialogue:fixture.dialogue,battle:fixture.battle};
const runtime=files.runtime.replace('__PILOT_FIXTURES__',JSON.stringify(selected));
const marker="if(typeof document!=='undefined'&&document.querySelector('#start')){";
if(h.indexOf(marker)!==h.lastIndexOf(marker))throw Error('Ambiguous boot');h=h.replace(marker,'/* CHARACTER_PILOT_BEGIN */\n'+runtime+'\n/* CHARACTER_PILOT_END */\n'+marker);
return h;}
if(require.main===module){const files={css:fs.readFileSync(path.join(work,'pilot.css'),'utf8'),header:fs.readFileSync(path.join(work,'pilot-header.html'),'utf8'),storage:fs.readFileSync(path.join(work,'storage-prefix.js'),'utf8'),runtime:fs.readFileSync(path.join(work,'pilot-runtime.js'),'utf8'),fixtures:fs.readFileSync(path.join(work,'fixtures.json'),'utf8')};const h=transform(fs.readFileSync(path.join(root,'index.html'),'utf8'),files);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),h);for(const [key,file]of [['runtime','pilot-runtime.js'],['fixtures','fixtures.json']])fs.writeFileSync(path.join(out,file),files[key]);console.log(JSON.stringify({html:blob(h),bytes:Buffer.byteLength(h)}));}
module.exports={transform};
