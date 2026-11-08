#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_preview_assets.py — 生成 Web 预览专用轻量资产
==================================================
生产资产是 2K PNG（140MB），浏览器直接加载过慢。本工具：
  * 把 glTF 引用的贴图统一缩到 512px，转 JPEG（带 alpha 的保留 PNG）
  * 生成 web/street_preview.gltf + bin，image.uri 指向 web/textures/
  * 生成 web/materials.json 供材质浏览器按需读取原尺寸通道图
运行: python3 src/tools/make_preview_assets.py
"""
import os, json, shutil
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
MODELS = os.path.join(ROOT, "assets", "models")
WEB = os.path.join(ROOT, "web")
TEX = os.path.join(ROOT, "assets", "textures")
OUT = os.path.join(WEB, "textures")
os.makedirs(OUT, exist_ok=True)

with open(os.path.join(MODELS, "changan_street_01.gltf"), encoding="utf-8") as f:
    doc = json.load(f)

shutil.copy2(os.path.join(MODELS, "changan_street_01.bin"),
             os.path.join(WEB, "changan_street_01.bin"))
doc["buffers"][0]["uri"] = "changan_street_01.bin"

converted, total_src, total_dst = 0, 0, 0
for img in doc["images"]:
    uri = img.get("uri")
    if not uri:
        continue
    src = os.path.normpath(os.path.join(MODELS, uri))
    if not os.path.exists(src):
        print("  ! 缺少", src)
        continue
    total_src += os.path.getsize(src)
    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im.thumbnail((512, 512), Image.Resampling.LANCZOS)
    name = os.path.splitext(os.path.basename(uri))[0]
    if has_alpha:
        rel = "textures/%s.png" % name
        im.convert("RGBA").save(os.path.join(WEB, rel), optimize=True)
    else:
        rel = "textures/%s.jpg" % name
        im.convert("RGB").save(os.path.join(WEB, rel), quality=86, optimize=True)
    img["uri"] = rel
    total_dst += os.path.getsize(os.path.join(WEB, rel))
    converted += 1

with open(os.path.join(WEB, "street_preview.gltf"), "w", encoding="utf-8") as f:
    json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))


def thumb(src, dst):
    """把任意通道图缩到 512 存入 web/textures/，返回相对路径"""
    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im.thumbnail((512, 512), Image.Resampling.LANCZOS)
    ext = "png" if has_alpha else "jpg"
    rel = "textures/" + dst + "." + ext
    out = os.path.join(WEB, rel)
    if has_alpha:
        im.convert("RGBA").save(out, optimize=True)
    else:
        im.convert("RGB").save(out, quality=86, optimize=True)
    return rel


# 材质浏览器数据：全部通道生成 512 预览，另附原尺寸链接
mats = []
gen = set()
for key in sorted(os.listdir(TEX)):
    p = os.path.join(TEX, key, "material.json")
    if not os.path.isfile(p):
        continue
    with open(p, encoding="utf-8") as f:
        m = json.load(f)
    ch = m["channels"]
    chans, origs = {}, {}
    for c, fn in ch.items():
        src = os.path.join(TEX, key, fn)
        chans[c] = thumb(src, "%s_%s" % (key, c))
        origs[c] = "../assets/textures/%s/%s" % (key, fn)
        gen.add(chans[c])
    mats.append({
        "key": key, "label": m["label"], "category": m["category"],
        "base": m["base_color_srgb"], "tile": m["tile_meters"],
        "size": m["size"][0], "seam": m["seam_error_mean"],
        "reference": m["reference"], "notes": m["notes"],
        "roughness": m["roughness_range"], "metallic": m["metallic"],
        "channels": chans, "originals": origs,
        "preview": "textures/%s_albedo.jpg" % key,
    })
with open(os.path.join(WEB, "materials.json"), "w", encoding="utf-8") as f:
    json.dump(mats, f, ensure_ascii=False, indent=2)

with open(os.path.join(MODELS, "build_stats.json"), encoding="utf-8") as f:
    stats = json.load(f)
with open(os.path.join(WEB, "stats.json"), "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, separators=(",", ":"))

print("预览贴图: %d 张, %.1f MB -> %.1f MB" %
      (converted, total_src / 1048576, total_dst / 1048576))
print("材质浏览器条目:", len(mats))
print("输出: web/street_preview.gltf / changan_street_01.bin / materials.json / stats.json")
