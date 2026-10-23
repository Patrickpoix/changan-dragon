#!/usr/bin/env python3
"""Recover reviewed study materials. Pillow required; --verify never uses network."""
import argparse, hashlib, io, json, urllib.request, zipfile
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/library/production-materials'
IDS = ['fine_grained_wood', 'dark_wood', 'bark_willow_02', 'grey_stone_path', 'brown_leather', 'brown_mud_02']
def sha(b): return hashlib.sha256(b).hexdigest()
def save(p, b):
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and p.read_bytes() != b: raise RuntimeError(f'Preserving different existing file: {p}')
    p.write_bytes(b)
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'ChanganDragonAssetResearch/1.0'}), timeout=60) as r: return r.read()
def js(p, x): save(p, (json.dumps(x, ensure_ascii=False, indent=2)+'\n').encode())
def derive(folder, content, role):
    im = Image.open(io.BytesIO(content)).convert('RGB' if role != 'roughness' else 'L')
    im = im.resize((512,512), Image.Resampling.LANCZOS)
    if role == 'normal':
        # Filtering must preserve unit OpenGL tangent normals.
        import numpy as np
        a = np.asarray(im).astype(float)/127.5-1
        a /= np.maximum(np.linalg.norm(a,axis=2,keepdims=True),1e-8)
        im=Image.fromarray(np.clip((a+1)*127.5,0,255).round().astype('uint8'))
    out=io.BytesIO();im.save(out,format='PNG');b=out.getvalue();name=role+'_512.png';save(folder/name,b)
    return {'file':name,'sha256':sha(b),'bytes':len(b),'size':[512,512]}
def verify():
    x=json.loads((DEST/'manifest.json').read_text()); assert len(x['materials'])==7
    count=0
    for m in x['materials']:
        for f in m['files']:
            p=DEST/m['id']/f['file'];b=p.read_bytes();assert sha(b)==f['sha256'],p
            if f.get('size'):
                with Image.open(p) as im: assert list(im.size)==f['size']
                count+=1
    assert count==21
    print('Verified 7 material groups, 21 512px maps and all recorded source hashes')
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--verify',action='store_true');args=parser.parse_args()
    if args.verify: return verify()
    materials=[]
    cc0=(ROOT/'assets/library/polyhaven/ceramic_pot/LICENSE-CC0-1.0.txt').read_bytes()
    save(DEST/'LICENSE-CC0-1.0.txt',cc0)
    for id in IDS:
        folder=DEST/id;files=[]
        for kind in ['info','files']:
            b=read('https://api.polyhaven.com/'+kind+'/'+id);save(folder/('asset-'+kind+'.json'),b)
        info=json.loads((folder/'asset-info.json').read_text());catalog=json.loads((folder/'asset-files.json').read_text())
        for role,key in [('basecolor',next(k for k in ['Diffuse','diff'] if k in catalog)),('normal','nor_gl'),('roughness','Rough')]:
            s=catalog[key]['1k']['jpg'];b=read(s['url']);assert hashlib.md5(b).hexdigest()==s['md5']
            name='source/'+role+'_1k.jpg';save(folder/name,b)
            files.append({'file':name,'url':s['url'],'official_md5':s['md5'],'sha256':sha(b),'bytes':len(b)})
            files.append(derive(folder,b,role))
        materials.append({'id':id,'authors':info.get('authors'),'license':'CC0-1.0','page':'https://polyhaven.com/a/'+id,'files':files})
        print(id,flush=True)
    id='Fabric081C';folder=DEST/id
    url='https://ambientcg.com/api/v2/full_json?id=Fabric081C&include=downloadData,previewData';meta=read(url);save(folder/'asset-info.json',meta)
    url='https://ambientcg.com/get?file=Fabric081C_1K-JPG.zip';b=read(url);save(folder/'source/Fabric081C_1K-JPG.zip',b)
    files=[{'file':'source/Fabric081C_1K-JPG.zip','url':url,'sha256':sha(b),'bytes':len(b)}]
    with zipfile.ZipFile(io.BytesIO(b)) as z:
        for role,suffix in [('basecolor','_Color.jpg'),('normal','_NormalGL.jpg'),('roughness','_Roughness.jpg')]:
            name=next(n for n in z.namelist() if n.endswith(suffix));files.append(derive(folder,z.read(name),role))
    license_bytes=read('https://ambientcg.com/license');save(folder/'license-evidence.html',license_bytes)
    materials.append({'id':id,'author':'ambientCG / Lennart Demes','license':'CC0-1.0','files':files,'note':'Generic printed fabric microdetail; not historical silk evidence.'})
    js(DEST/'manifest.json',{'status':'reconstructed_research_only','visual_accepted':False,'runtime_integrated':False,'derivation':'1k originals retained; Lanczos 512px PNG; normal vectors renormalized; no cinematic recoloring claimed','materials':materials})
    verify()
if __name__=='__main__': main()
