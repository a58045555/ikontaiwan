"""Build kai-reference-actions atlas (3 cols high/mid/low x 3 rows guard/windup/contact).
usage: python3 build-kai-atlas.py <srcdir> <out.png>
srcdir must contain transparent PNGs: guard.png, high-windup.png, high-contact.png,
mid-windup.png, mid-contact.png, low-windup.png, low-contact.png"""
import sys,os
from PIL import Image
src,out=sys.argv[1],sys.argv[2]
CW,ROWS=408,[0,417,847,1286,1716]  # renderer grid: rows guard/windup/contact/strike, 3 equal columns
W,H=CW*3,ROWS[-1]
atlas=Image.new('RGBA',(W,H),(0,0,0,0))
grid=[['guard']*3,['high-windup','mid-windup','low-windup'],['high-contact','mid-contact','low-contact'],['high-strike','mid-strike','low-strike']]
FALLBACK={'mid-strike':'mid-contact','high-strike':'high-contact','low-strike':'low-contact'}
PAD=8
for r,row in enumerate(grid):
    ch=ROWS[r+1]-ROWS[r]
    for c,name in enumerate(row):
        path=os.path.join(src,name+'.png')
        if not os.path.exists(path): path=os.path.join(src,FALLBACK[name]+'.png'); print('  (fallback for',name+')')
        im=Image.open(path).convert('RGBA');im=im.crop(im.getbbox())
        s=min((ch-2*PAD)/im.height,(CW-2*PAD)/im.width)
        im=im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),Image.LANCZOS)
        x=c*CW+(CW-im.width)//2; y=ROWS[r+1]-PAD-im.height   # feet on a shared baseline per row
        atlas.alpha_composite(im,(x,y)); print(f'{name:12s} -> cell({r},{c}) {im.size} at ({x},{y})')
atlas.save(out); print('atlas',atlas.size,'->',out)
