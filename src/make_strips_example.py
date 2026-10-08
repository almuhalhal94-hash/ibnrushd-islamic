import subprocess, glob, re, os, json
from PIL import Image
W=960; out={}
for k,g in {'k1':7,'k2':8,'k3':9,'k4':6}.items():
    tmp=f'/home/claude/kr/img_{k}'; os.makedirs(tmp,exist_ok=True)
    for f in glob.glob(tmp+'/*'): os.remove(f)
    subprocess.run(['pdftoppm','-scale-to-x','1100','-scale-to-y','-1','-jpeg','-jpegopt','quality=75',f'/home/claude/kr/{k}.pdf',tmp+'/s'],check=True)
    fs=sorted(glob.glob(tmp+'/s-*.jpg'),key=lambda f:int(re.search(r's-(\d+)',f).group(1)))
    ims=[Image.open(f).convert('RGB') for f in fs]
    h=round(ims[0].height*W/ims[0].width)
    S=Image.new('RGB',(W,h*len(ims)),'white')
    for i,im in enumerate(ims): S.paste(im.resize((W,h),Image.LANCZOS),(0,i*h))
    S.save(f'/home/claude/asli/tl/ans/a{g}.jpg',quality=72,optimize=True,progressive=True)
    subprocess.run(['cp',f'/home/claude/kr/{k}.pdf',f'/home/claude/asli/tl/ans/a{g}.pdf'])
    out[g]={'n':len(ims),'h':h}
print(json.dumps(out))
