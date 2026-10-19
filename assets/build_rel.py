import re,base64,hashlib,os,sys
src,outdir=sys.argv[1],sys.argv[2]
s=open(src).read()
os.makedirs(outdir+'/a',exist_ok=True)
names=['POSE','AGEPX','TRN','TRN_F','TRNPATCH','MHIP','SCN_F']
spans=[]
for n in names:
    i=s.find('const '+n+'=');assert i>=0,n
    j=s.find('};',i);spans.append((i,j))
out=[];pos=0;nfiles=0;moved=0
def ext(mime):return {'image/webp':'webp','image/png':'png','video/mp4':'mp4'}[mime]
for i,j in sorted(spans):
    out.append(s[pos:i]);seg=s[i:j]
    def rep(m):
        global nfiles,moved
        raw=base64.b64decode(m.group(2));h=hashlib.sha1(raw).hexdigest()[:12];fn=f'a/{h}.{ext(m.group(1))}'
        p=outdir+'/'+fn
        if not os.path.exists(p):open(p,'wb').write(raw);nfiles+=1
        moved+=len(m.group(0));return fn
    seg=re.sub(r'data:(image/webp|image/png|video/mp4);base64,([A-Za-z0-9+/=]+)',rep,seg)
    out.append(seg);pos=j
out.append(s[pos:]);s=''.join(out)
for v,fn in [('ENTRY_VID','a/entry_m.mp4'),('ENTRY_VID_F','a/entry_f.mp4')]:
    m=re.search(r"const "+v+r"='data:video/mp4;base64,([A-Za-z0-9+/=]+)'",s);assert m,v
    open(outdir+'/'+fn,'wb').write(base64.b64decode(m.group(1)));moved+=len(m.group(0))
    s=s[:m.start()]+f"const {v}='{fn}'"+s[m.end():]
open(outdir+'/index.html','w').write(s)
print('files',nfiles,'moved chars',moved,'index bytes',len(s.encode()))
