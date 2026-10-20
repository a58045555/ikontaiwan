const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=fs.existsSync('preview-v2/index.html')?process.cwd():fs.existsSync('deploy-game/preview-v2/index.html')?process.cwd():path.resolve(__dirname,'..');
const prefix=fs.existsSync(path.join(root,'preview-v2/index.html'))?'validation/':'';
const suites=['verify-preview-mechanics.cjs','verify-yearbook.cjs','verify-ending-stories.cjs','verify-ending-folio.cjs','verify-mentors.cjs','verify-dramatic.cjs','verify-polish.cjs'];
for(const file of suites){const result=spawnSync(process.execPath,[prefix+file,'--no-write'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});if(result.error||result.status!==0){process.stderr.write(file+' failed\n'+(result.stdout||'')+(result.stderr||'')+(result.error||''));process.exit(1);}console.log(file+': '+result.stdout.trim().split('\n').at(-1));}
console.log('All preview regression suites passed');
