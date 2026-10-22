"""Build first-person-atlas.png (3x2: guard, punch, block / kick, lowblock, empty), each cell one square transparent PNG.
usage: python3 build-fp-atlas.py <srcdir> <out.png> [cell=627]"""
import sys,os
from PIL import Image
src,out=sys.argv[1],sys.argv[2]; cell=int(sys.argv[3]) if len(sys.argv)>3 else 627
COLS=3
atlas=Image.new('RGBA',(cell*COLS,cell*2),(0,0,0,0))
for i,name in enumerate(['guard','punch','block','kick','lowblock']):
    if not os.path.exists(os.path.join(src,name+'.png')): print('missing',name); continue
    im=Image.open(os.path.join(src,name+'.png')).convert('RGBA')
    s=cell*0.8/max(im.size); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x=i%COLS*cell+(cell-im.width)//2; y=i//COLS*cell+(cell-im.height)   # bottom-aligned: sleeves enter from the frame bottom
    atlas.alpha_composite(im,(x,y)); print(name,im.size,'->',(x,y))
atlas.save(out); print('atlas',atlas.size,'->',out)
