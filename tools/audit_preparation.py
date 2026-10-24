#!/usr/bin/env python3
"""Read-only preparation inventory, asset recovery and cost audit.

Verifies files, contracts and self-contained study GLBs. Does not award art,
historical authenticity, voice rights, phone performance or production approval.
"""
import argparse,collections,datetime,hashlib,io,json,math,struct
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,default=ROOT/'docs/qa-evidence/preparation-20261024/inventory.json')
args=parser.parse_args()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def glb_cost(path):
    data=path.read_bytes();magic,version,length=struct.unpack_from('<III',data)
    assert magic==0x46546c67 and version==2 and length==len(data),str(path)
    chunks={};pos=12
    while pos<len(data):
        size,kind=struct.unpack_from('<II',data,pos);chunks[kind]=data[pos+8:pos+8+size];pos+=8+size
    j=json.loads(chunks[0x4e4f534a]);binary=chunks.get(0x004e4942,b'')
    assert all('uri' not in b for b in j.get('buffers',[])),str(path)+' external buffer'
    assert all('uri' not in b for b in j.get('images',[])),str(path)+' external image'
    for view in j.get('bufferViews',[]):assert view.get('byteOffset',0)+view['byteLength']<=len(binary)
    images=[];unique={};triangles=0;primitives=0;vertices=0
    for image in j.get('images',[]):
        v=j['bufferViews'][image['bufferView']];raw=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
        im=Image.open(io.BytesIO(raw));w,h=im.size;digest=hashlib.sha256(raw).hexdigest();gpu=math.ceil(w*h*4*4/3)
        images.append({'name':image.get('name'),'width':w,'height':h,'sha256':digest,'rgba_mip_upper_bytes':gpu});unique[digest]=gpu
    for mesh in j.get('meshes',[]):
        for p in mesh['primitives']:
            assert p.get('mode',4)==4,str(path)+' nontriangle primitive'
            primitives+=1;pa=j['accessors'][p['attributes']['POSITION']];vertices+=pa['count']
            triangles+=(j['accessors'][p['indices']]['count'] if 'indices' in p else pa['count'])//3
            assert all(math.isfinite(x) for field in ['min','max'] for x in pa.get(field,[]))
    return {'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'triangles':triangles,'mesh_primitives':primitives,'vertices_after_uv_normal_splits':vertices,'images':images,'unique_rgba_mip_upper_bytes':sum(unique.values()),'estimated_geometry_bytes':sum(v['byteLength'] for v in j.get('bufferViews',[]) if 'target' in v),'alpha_materials':[{'name':m.get('name'),'mode':m.get('alphaMode','OPAQUE'),'cutoff':m.get('alphaCutoff')} for m in j.get('materials',[]) if m.get('alphaMode','OPAQUE')!='OPAQUE'],'skins':len(j.get('skins',[])),'animations':len(j.get('animations',[])),'external_dependencies':False}

def main():
    catalogue=json.loads((ROOT/'docs/resource-catalog.json').read_text());contracts=json.loads((ROOT/'docs/production-contracts.json').read_text())['contracts']
    ids=[r['id'] for r in catalogue['resources']];assert len(ids)==len(set(ids))
    required=['source_url','acquisition_status','target_scene','style_modification_cost','mobile_cost']
    incomplete=[{'id':r['id'],'missing':[k for k in required if k not in r]} for r in catalogue['resources'] if any(k not in r for k in required)]
    assert not incomplete,incomplete
    assert all('license_scope' in r or 'license' in r for r in catalogue['resources'])
    coverage=[]
    for c in contracts:
        sources=[{'path':p,'exists':(ROOT/p).exists()} for p in c['source_paths']]
        assert all(p['exists'] for p in sources),(c['id'],sources)
        assert c['recipe'] and c['acceptance'] and c['remaining_gap']
        coverage.append({'id':c['id'],'target_scene':c['target_scene'],'acquisition_status':c['acquisition_status'],'source_inputs':sources,'recipe':c['recipe'],'production_released':c['production_released'],'remaining_gap':c['remaining_gap']})
    # Exact recoverable inventory, including licences and original files. Do not
    # mistake this inventory for a legal review of arbitrary downloaded files.
    files=[]
    for p in sorted((ROOT/'assets/library').rglob('*')):
        if not p.is_file() or '__pycache__' in p.parts:continue
        files.append({'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':sha(p)})
    study_paths=[ROOT/'assets/library/preparation-study/assembly.glb',ROOT/'assets/library/architecture/timber-shop/runtime.glb']
    for sub in ['vegetation/studies','vegetation/authored-studies','boats/construction-studies','characters/tang-studies']:
        study_paths+=sorted((ROOT/'assets/library'/sub).glob('*.glb'))
    if (ROOT/'assets/library/preparation-study/natural-unified.glb').exists():study_paths.append(ROOT/'assets/library/preparation-study/natural-unified.glb')
    study_paths+=sorted((ROOT/'assets/library/dragons/grab3d').glob('*/source.glb'))
    models=[glb_cost(p) for p in study_paths]
    detail=ROOT/'assets/library/characters/makehuman-details'
    for item in json.loads((detail/'manifest.json').read_text())['files']:
        path=detail/item['file'];data=path.read_bytes();assert sha(path)==item['sha256']
        assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==item['git_blob_sha1']
    official=[]
    matroot=ROOT/'assets/library/production-materials'
    for mat in json.loads((matroot/'manifest.json').read_text())['materials']:
        for item in mat['files']:
            path=matroot/mat['id']/item['file'];assert sha(path)==item['sha256'],str(path)
            if 'official_md5' in item:assert hashlib.md5(path.read_bytes()).hexdigest()==item['official_md5'],str(path)
            official.append(str(path.relative_to(ROOT)))
    # These derivations have explicit file hashes and stable local generators.
    for sub in ['vegetation/studies','vegetation/authored-studies','boats/construction-studies']:
        path=ROOT/'assets/library'/sub;manifest=json.loads((path/'manifest.json').read_text())
        for typ in manifest['types']:
            for level in typ['levels']:
                assert sha(path/level['file'])==level['sha256'],level
    spec=json.loads((ROOT/'docs/production-spec.json').read_text());assert spec['runtime']['three_revision']=='160'
    package=ROOT/'dist/changan-dragon.html';baseline='d9ede61fd366a3cbd2f056aab21b521ca69c75fd0995f41a1884fb3f2230e373'
    assert sha(package)==baseline,'Unreviewed game package change'
    report={'checked_on':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'scope':'Preparation inventory and input/cost audit only; separate from browser tests, licence legal interpretation and visual release','resource_records':len(ids),'contract_families':len(coverage),'metadata_complete':not incomplete,'source_inputs_exist':True,'official_material_file_hashes_verified':len(official),'library_files':files,'study_models':models,'coverage':coverage,'runtime':{'three_revision':'160','standalone_sha256':sha(package),'standalone_unchanged':True},'production_art_accepted':False,'all_preparation_visual_gaps_closed':False,'cost_limits':'RGBA mip upper estimates assume full RGBA8 with mipmaps, no hardware compression; geometry estimate excludes runtime copies, render targets and driver overhead. Do not sum all LODs as one active scene.'}
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'resources':len(ids),'contracts':len(coverage),'library_files':len(files),'glb_studies':len(models),'material_hash_checks':len(official),'standalone_unchanged':True,'output':str(args.output)},ensure_ascii=False))
if __name__=='__main__':main()
