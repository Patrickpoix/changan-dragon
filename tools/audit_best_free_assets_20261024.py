from __future__ import annotations
import hashlib,json,pathlib,urllib.parse
from collections import Counter
from PIL import Image
root=pathlib.Path("assets/library/free-curated/categories")
audit=[]
fail=[]
for man in sorted(root.rglob("manifest.json")):
 try:
  x=json.loads(man.read_text(encoding="utf-8-sig"))
  folder=man.parent
  assert x["license"]=="Poly Haven CC0-1.0"
  count=0; total=0; image_count=0;triangles=0
  for f in x["files"]:
   path=(folder/f["path"]).resolve()
   assert path.is_relative_to(folder.resolve()) and path.is_file(), ("path",f["path"])
   payload=path.read_bytes()
   assert len(payload)==f["bytes"],("length",f["path"])
   assert hashlib.md5(payload).hexdigest()==f["md5"],("MD5",f["path"])
   assert hashlib.sha256(payload).hexdigest()==f["sha256"],("sha256",f["path"])
   count+=1;total+=len(payload)
   if path.suffix.lower() in [".jpg",".png"]:
    with Image.open(path) as i:
     assert i.size==(4096,4096), ("not 4K",str(path),i.size)
     image_count+=1
  scene=folder/(x["id"]+"_4k.gltf")
  if scene.exists():
   g=json.loads(scene.read_text(encoding="utf-8-sig"))
   assert g["asset"]["version"]=="2.0"
   refs=[q["uri"] for q in g.get("buffers",[]) if "uri" in q]+[q["uri"] for q in g.get("images",[]) if "uri" in q]
   for v in refs:
    p=(folder/urllib.parse.unquote(v)).resolve()
    assert p.is_relative_to(folder.resolve()) and p.is_file(),("missing dep",v)
   for mesh in g.get("meshes",[]):
    for p in mesh["primitives"]:
     if p.get("mode",4)==4 and "indices" in p:
      triangles+=g["accessors"][p["indices"]]["count"]//3
  audit.append({"category":x["category"],"asset_id":x["id"],"source":x["source"],"license":x["license"],"local_path":str(folder).replace("\\","/"),"local_complete":True,"remote_verified":False,"files":count,"bytes":total,"images_4k":image_count,"triangles":triangles,"status":"acquired locally and byte_verified; NOT art approved, NOT in game"})
  print("PASS",x["category"],x["id"],count,total,image_count,triangles)
 except Exception as e:
  fail.append({"manifest":str(man),"error":str(e)})
  print("FAIL",man,str(e))
totals={"completed":len(audit),"failed":len(fail),"bytes":sum(x["bytes"] for x in audit),"by_category":dict(Counter(x["category"] for x in audit)),"asset_sources":audit,"failures":fail}
out=pathlib.Path("docs/worklog/2026-10-24-curated-category-download-verification.json")
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(totals,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("SUMMARY",totals["completed"],totals["failed"],totals["bytes"],totals["by_category"])
if fail:raise SystemExit(2)

