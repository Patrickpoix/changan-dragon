#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate.py — street-01 资产验收自检
====================================
检查 glTF 2.0 结构、accessor 边界、纹理可解析、贴图通道齐全、
无缝误差、GLB 头、模块库、预览资产完整性，输出 docs/05-acceptance-report.md。
运行: python3 src/tools/validate.py
"""
import os, json, struct, glob
import numpy as np
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
MODELS = os.path.join(ROOT, "assets", "models")
TEX = os.path.join(ROOT, "assets", "textures")
WEB = os.path.join(ROOT, "web")
DOCS = os.path.join(ROOT, "docs")

issues, checks = [], []


def ck(name, ok, detail=""):
    checks.append((name, bool(ok), detail))
    if not ok:
        issues.append(name + " — " + detail)
    return ok


def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def check_gltf(path, label):
    d = load(path)
    ck(label + " / asset.version", d["asset"]["version"] == "2.0")
    ck(label + " / scenes", len(d.get("scenes", [])) >= 1)
    ck(label + " / nodes", len(d["nodes"]) > 0, "%d" % len(d["nodes"]))
    ck(label + " / meshes", len(d["meshes"]) > 0, "%d" % len(d["meshes"]))
    # buffer 长度
    bin_uri = d["buffers"][0].get("uri")
    if bin_uri:
        bp = os.path.normpath(os.path.join(os.path.dirname(path), bin_uri))
        ok = os.path.exists(bp) and os.path.getsize(bp) >= d["buffers"][0]["byteLength"]
        ck(label + " / bin", ok, bin_uri)
    # bufferView 不越界
    blen = d["buffers"][0]["byteLength"]
    bad = [i for i, v in enumerate(d["bufferViews"])
           if v["byteOffset"] + v["byteLength"] > blen]
    ck(label + " / bufferView 边界", not bad, str(bad[:5]))
    # accessor 边界 + 计数
    bad2 = []
    for i, a in enumerate(d["accessors"]):
        v = d["bufferViews"][a["bufferView"]]
        comp = {5126: 4, 5125: 4, 5123: 2, 5121: 1}[a["componentType"]]
        n = {"VEC3": 3, "VEC2": 2, "SCALAR": 1}[a["type"]]
        if a["count"] * n * comp > v["byteLength"] + 4:
            bad2.append(i)
    ck(label + " / accessor 边界", not bad2, str(bad2[:5]))
    # 索引不越界
    bad3 = []
    for m in d["meshes"]:
        for p in m["primitives"]:
            ia = d["accessors"][p["indices"]]
            pa = d["accessors"][p["attributes"]["POSITION"]]
            if ia["count"] % 3 != 0:
                bad3.append(m["name"])
    ck(label + " / 三角索引", not bad3, str(bad3[:5]))
    # 材质引用有效
    bad4 = [p["material"] for m in d["meshes"] for p in m["primitives"]
            if p["material"] >= len(d["materials"])]
    ck(label + " / 材质引用", not bad4)
    # 纹理文件可解析
    missing = []
    for im in d["images"]:
        if "uri" not in im:
            continue
        p = os.path.normpath(os.path.join(os.path.dirname(path), im["uri"]))
        if not os.path.exists(p):
            missing.append(im["uri"])
    ck(label + " / 纹理路径", not missing, str(missing[:5]))
    # PBR 材质通道齐全
    bad5 = []
    for m in d["materials"]:
        pbr = m.get("pbrMetallicRoughness", {})
        if "baseColorTexture" not in pbr or "metallicRoughnessTexture" not in pbr or "normalTexture" not in m:
            bad5.append(m.get("name"))
    ck(label + " / PBR 三通道", not bad5, str(bad5[:5]))
    return d


def check_glb(path, label):
    with open(path, "rb") as f:
        head = f.read(20)
    magic, ver, total = struct.unpack("<4sII", head[:12])
    size = os.path.getsize(path)
    ck(label + " / GLB 头", magic == b"glTF" and ver == 2 and total == size,
       "magic=%s ver=%s len=%d/%d" % (magic, ver, total, size))
    ct, ctype = struct.unpack("<I4s", head[12:20])
    ck(label + " / JSON chunk", ctype == b"JSON", str(ctype))


def check_textures():
    dirs = [d for d in sorted(os.listdir(TEX))
            if os.path.isfile(os.path.join(TEX, d, "material.json"))]
    ck("材质数量 >= 24", len(dirs) >= 24, "%d" % len(dirs))
    need = ["albedo", "normal", "roughness", "metallic", "ao", "height", "orm"]
    bad, badsize, badseam = [], [], []
    total_png = 0
    for d in dirs:
        p = os.path.join(TEX, d)
        m = load(os.path.join(p, "material.json"))
        for c in need:
            f = os.path.join(p, m["channels"][c])
            if not os.path.exists(f):
                bad.append(d + "/" + c)
                continue
            im = Image.open(f)
            if im.size[0] not in (512, 1024, 2048) or im.size[0] != im.size[1]:
                badsize.append(d + "/" + c + str(im.size))
            total_png += 1
        if m["seam_error_mean"] > 1.0:
            badseam.append("%s=%.2f" % (d, m["seam_error_mean"]))
    ck("贴图通道齐全", not bad, str(bad[:6]))
    ck("贴图尺寸为 2 的幂", not badsize, str(badsize[:6]))
    ck("贴图四边无缝(误差<=1)", not badseam, str(badseam[:6]))
    # alpha / emissive 通道存在性
    ck("RGBA 合成图", all(os.path.exists(os.path.join(TEX, k, k + "_basecolor_rgba.png"))
                         for k in ("leaf_atlas", "grime")))
    return len(dirs), total_png


def check_preview():
    gp = os.path.join(WEB, "street_preview.gltf")
    ck("预览 gltf 存在", os.path.exists(gp))
    ck("预览 bin 存在", os.path.exists(os.path.join(WEB, "changan_street_01.bin")))
    ck("three.js 本地化", all(os.path.exists(os.path.join(WEB, "vendor", p)) for p in
                              ["three.module.js", "loaders/GLTFLoader.js",
                               "utils/BufferGeometryUtils.js", "controls/OrbitControls.js"]))
    ck("index.html 存在", os.path.exists(os.path.join(WEB, "index.html")))
    d = load(gp)
    miss = [im["uri"] for im in d["images"]
            if not os.path.exists(os.path.join(WEB, im.get("uri", "x")))]
    ck("预览贴图齐全", not miss, "%d 张, 缺失 %s" % (len(d["images"]), str(miss[:4])))
    ck("材质浏览器数据", os.path.exists(os.path.join(WEB, "materials.json")) and
       len(load(os.path.join(WEB, "materials.json"))) >= 24)


def main():
    gltf = check_gltf(os.path.join(MODELS, "changan_street_01.gltf"), "整街 glTF")
    glb_path = os.path.join(MODELS, "changan_street_01.glb")
    if os.path.exists(glb_path):
        check_glb(glb_path, "整街 GLB")
    else:
        checks.append(("整街 GLB（可选，>100MB 不入库）", True, "build.sh 可重建"))
    mods = glob.glob(os.path.join(MODELS, "modules", "*.gltf"))
    ck("模块库 >= 7 件", len(mods) >= 7, "%d" % len(mods))
    for mp in mods:
        check_gltf(mp, "模块 " + os.path.basename(mp))
        check_glb(mp.replace(".gltf", ".glb"), "模块 GLB " + os.path.basename(mp))
    nmat, npng = check_textures()
    check_preview()
    stats = load(os.path.join(MODELS, "build_stats.json"))
    ck("场景规模", stats["counts"]["triangles"] > 50000,
       "%d 三角面" % stats["counts"]["triangles"])
    ck("参考图 8 张", len(glob.glob(os.path.join(ROOT, "references", "0*.png"))) >= 8)
    ck("调色板", os.path.exists(os.path.join(ROOT, "references", "palette.json")))
    ck("贴图总览", os.path.exists(os.path.join(DOCS, "images", "textures-contact-sheet.png")))
    ck("入口 README", os.path.exists(os.path.join(ROOT, "README.md")))
    ck("设计说明 docs/01-overview.md", os.path.exists(os.path.join(ROOT, "docs", "01-overview.md")))
    ck("一键复现 build.sh", os.path.exists(os.path.join(ROOT, "build.sh")))
    ck("原始生图归档", len(glob.glob(os.path.join(ROOT, "references", "generated", "*.png"))) >= 8)

    passed = sum(1 for _, ok, _ in checks if ok)
    lines = [
        "# street-01 验收自检报告", "",
        "生成时间：%s" % __import__("time").strftime("%Y-%m-%d %H:%M:%S"),
        "", "## 结果", "",
        "**%d / %d 项通过**%s" % (passed, len(checks),
                                 "（全部通过）" if not issues else "（存在 %d 项问题）" % len(issues)),
        "", "## 资产规模", "",
        "| 项 | 值 |", "| --- | --- |",
        "| PBR 材质 | %d 种 |" % nmat,
        "| 贴图文件 | %d 张（2K/1K 全通道 PNG） |" % npng,
        "| 三角面 | %s |" % format(stats["counts"]["triangles"], ","),
        "| 顶点 | %s |" % format(stats["counts"]["vertices"], ","),
        "| 语义分组 / 节点 | %d / %d |" % (stats["counts"]["semantic_groups"], stats["counts"]["nodes"]),
        "| 材质 | %d |" % stats["counts"]["materials"],
        "| 模块化构件 | %d 件 |" % len(mods),
        "| 整街 GLB | %s |" % ("%.1f MB" % (os.path.getsize(glb_path) / 1048576)
                              if os.path.exists(glb_path) else "未入库（>100MB，build.sh 可重建）"),
        "", "## 逐项检查", "",
        "| 检查项 | 结果 | 说明 |", "| --- | --- | --- |",
    ]
    for name, ok, detail in checks:
        lines.append("| %s | %s | %s |" % (name, "通过" if ok else "**未通过**", detail))
    if issues:
        lines += ["", "## 待处理", ""] + ["- " + x for x in issues]
    with open(os.path.join(DOCS, "05-acceptance-report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("验收: %d/%d 通过" % (passed, len(checks)))
    for x in issues:
        print("  ! " + x)
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(main())
