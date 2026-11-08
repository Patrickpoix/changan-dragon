#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_docs.py — 汇总资产清单与文档数据
======================================
生成 manifest.json、docs/02-materials-catalog.md、docs/03-street-inventory.md。
运行: python3 src/tools/build_docs.py
"""
import os, json, time, glob

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DOCS = os.path.join(ROOT, "docs")
os.makedirs(DOCS, exist_ok=True)
os.makedirs(os.path.join(DOCS, "images"), exist_ok=True)


def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


T = load(os.path.join(ROOT, "assets", "textures", "textures_manifest.json"))
S = load(os.path.join(ROOT, "assets", "models", "build_stats.json"))
M = load(os.path.join(ROOT, "assets", "models", "modules", "modules.json"))
R = load(os.path.join(ROOT, "references", "index.json"))
G = load(os.path.join(ROOT, "assets", "models", "changan_street_01.gltf"))

# ---------------------------------------------------------------- manifest
manifest = {
    "project": "changan-dragon / street-01",
    "version": "1.0",
    "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
    "policy": "workbuddy 支线：仅新增 streets/street-01/，未改动 main 任何既有文件",
    "style": "盛唐长安（公元 8 世纪）东/西市商业街，黄昏暖金主光",
    "coordinates": "右手系，Y 向上，单位米；街道沿 +Z，长度 120m",
    "pipeline": [
        "生图模型生成 8 张参考图",
        "从材质研究板逐格采样 + 全景图聚类得到调色板",
        "调色板驱动程序化生成 29 种全通道 PBR 贴图",
        "模块化几何构建整街 + 导出 glTF 2.0 / GLB + 7 件模块库",
        "生成轻量 Web 预览资产与可交互页面",
        "逐项验收自检",
    ],
    "inputs": {
        "references": ["references/" + os.path.basename(x["file"]) for x in R],
        "palette": "references/palette.json",
        "palette_swatches": "references/palette_swatches.png",
    },
    "outputs": {
        "pbr_textures": "assets/textures/<material>/<material>_<channel>.png",
        "signage": "assets/textures/signage/",
        "scene_gltf": "assets/models/changan_street_01.gltf",
        "scene_bin": "assets/models/changan_street_01.bin",
        "scene_glb": "assets/models/changan_street_01.glb",
        "modules": ["assets/models/modules/%s.glb" % m["name"] for m in M],
        "web_preview": "web/index.html",
        "web_preview_assets": "web/street_preview.gltf + web/textures/",
        "contact_sheet": "docs/images/textures-contact-sheet.png",
        "comparison": "docs/images/reference-vs-result.png",
        "screenshots": ["docs/images/preview-dusk.png", "docs/images/preview-noon-aerial.png"],
        "acceptance": "docs/05-acceptance-report.md",
    },
    "counts": {
        "reference_images": len(R),
        "pbr_materials": len(T["materials"]),
        "texture_files": sum(1 for _ in glob.glob(os.path.join(ROOT, "assets", "textures", "**", "*.png"), recursive=True)),
        "signage_textures": len(T["signage"]) * 2,
        "shops": S["counts"]["shops"],
        "semantic_groups": S["counts"]["semantic_groups"],
        "nodes": S["counts"]["nodes"],
        "gltf_materials": S["counts"]["materials"],
        "triangles": S["counts"]["triangles"],
        "vertices": S["counts"]["vertices"],
        "modules": len(M),
    },
    "dimensions_m": S["dimensions"],
    "materials": [{"key": m["key"], "label": m["label"], "category": m["category"],
                   "base": m["base_color_srgb"], "size": m["size"][0],
                   "tile_m": m["tile_meters"], "seam_error": m["seam_error_mean"],
                   "roughness": m["roughness_range"], "metallic": m["metallic"],
                   "channels": list(m["channels"].keys())} for m in T["materials"]],
    "modules": M,
    "reproduce": [
        "python3 src/tools/prepare_references.py",
        "python3 src/pbr/generate_textures.py",
        "python3 src/geometry/build_street.py",
        "python3 src/tools/make_preview_assets.py",
        "python3 src/tools/build_docs.py",
        "python3 src/tools/make_comparison.py",
        "python3 src/tools/validate.py",
    ],
    "preview_command": "bash web/start_preview.sh 8080  →  http://localhost:8080/web/index.html",
}
with open(os.path.join(ROOT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

# ---------------------------------------------------------------- 材质表
cats = {}
for m in T["materials"]:
    cats.setdefault(m["category"], []).append(m)
lines = [
    "# PBR 材质总表", "",
    "共 **%d 种材质**，每种输出 `albedo / normal / roughness / metallic / ao / height / orm` 七通道"
    "（透明与自发光材质另有 `opacity` / `emissive`），全部四边无缝平铺。" % len(T["materials"]), "",
    "基色来源：`references/palette.json`（生图材质研究板逐格采样），经去光照补偿后作为 albedo 主色。", "",
]
for cat, items in cats.items():
    lines += ["## " + cat, "",
              "| 材质 | 名称 | 基色 | 尺寸 | 平铺 | 粗糙度 | 金属度 | 参考依据 |",
              "| --- | --- | --- | --- | --- | --- | --- | --- |"]
    for m in items:
        lines.append("| `%s` | %s | %s | %d px | %.1f m | %.2f–%.2f | %.2f | %s |" %
                     (m["key"], m["label"], m["base_color_srgb"], m["size"][0],
                      m["tile_meters"], m["roughness_range"][0], m["roughness_range"][1],
                      m["metallic"], m["reference"].split(" /")[0]))
    lines.append("")
lines += [
    "## 通道约定", "",
    "| 通道 | 色彩空间 | 说明 |", "| --- | --- | --- |",
    "| albedo | sRGB | 固有色，无烘焙光照与方向阴影 |",
    "| normal | Linear | OpenGL +Y，由 height 求导 |",
    "| roughness | Linear | 灰度，含微观变化 |",
    "| metallic | Linear | 仅鎏金铜 / 彩画金线非零 |",
    "| ao | Linear | 由高度与缝隙遮蔽导出，不写入 albedo |",
    "| height | Linear | 位移 / 世界空间细节 |",
    "| orm | Linear | 打包图 R=AO、G=Roughness、B=Metallic，glTF 直接引用 |",
    "| opacity | Linear | 叶片图集、污渍贴花（glTF 中合成为 RGBA basecolor） |",
    "| emissive | sRGB | 灯笼纱、格扇糊纸的暖光 |", "",
    "接口示例（glTF）：`baseColorTexture = albedo`，`normalTexture = normal`，"
    "`metallicRoughnessTexture = orm`，`occlusionTexture = orm`。", "",
]
with open(os.path.join(DOCS, "02-materials-catalog.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

# ---------------------------------------------------------------- 构件清单
zones = {}
for n in G["nodes"]:
    nm = n.get("name", "")
    if "/" in nm:
        zones.setdefault(nm.split("/")[0], []).append(nm)
    else:
        zones.setdefault("_root", []).append(nm)
inv = ["# 一条街 · 构件清单", "",
       "整街沿 **+Z** 延伸 120 m，路宽 14 m（车行 9 m + 两侧人行道各 2.5 m），"
       "建筑进深 7.4 m，总宽 28.8 m。共 **%d** 个语义分组。" % len(G["meshes"]), "",
       "## 语义分组（节点树）", ""]
for z, names in sorted(zones.items()):
    if z == "_root":
        continue
    inv += ["### " + z + "（%d 组）" % len(names), ""]
    sub = {}
    for nm in names:
        parts = nm.split("/")
        sub.setdefault(parts[1] if len(parts) > 1 else "其他", []).append(nm)
    for k, v in sorted(sub.items()):
        inv.append("- **%s**：%d 组 — %s …" % (k, len(v), v[0].split("/")[-1]))
    inv.append("")
inv += [
    "## 每栋店铺必备构件", "",
    "- 台基与三级踏步、柱础、朱漆檐柱（前后各 5 根）",
    "- 夯土 / 青砖 / 白灰抹面墙体、槛墙、格扇糊纸窗与木棂、板门与鎏金门环",
    "- 额枋、柱头斗拱与补间斗拱（栌斗 / 华拱 / 横拱 / 散斗 / 令拱）",
    "- 椽子、檐板、**举折双坡青瓦屋顶**（每坡 4 段凹曲面）、瓦垄立体脊线、檐口瓦当、垂脊、正脊与鸱吻",
    "- 黑漆金字匾额（本地字体烘焙）、竖幌布幡、四盏红绸 / 纸灯笼（含挂绳、铜盖、流苏）",
    "- 部分店铺为二层重檐楼阁（平坐 + 缩入柱网 + 上层屋顶）", "",
    "## 街面", "",
    "- 青石板车行道、青砖人行道、路缘石分块、两侧排水沟与沟盖板",
    "- 车辙泥、修补砖块、积水、污渍贴花、沟边苔藓、城外夯土地基", "",
    "## 市井道具与绿化", "",
    "- 摊位（木架 / 台面 / 斜布棚 / 陶罐 / 竹筐 / 麻袋）× 12",
    "- 槐树（主干 / 分枝 / 叶片 billboard / 树池）× 8",
    "- 拴马桩 × 10、石灯 × 6、旗杆 × 2、货箱组 × 4、水井与辘轳 × 1、香炉 × 1", "",
    "## 远景", "",
    "- 城门楼（三门洞城台 / 城楼柱网 / 双坡屋面 / 正脊 / 鸱吻）、两侧阙楼、坊墙", "",
    "## 灯光", "",
    "- 1 盏平行光（黄昏低角度暖金）+ 12 盏灯笼点光 + 1 盏香炉点光（KHR_lights_punctual）", "",
    "## 模块化构件库", "",
    "| 模块 | 文件 |", "| --- | --- |",
]
for m in M:
    inv.append("| %s | `%s` |" % (m["name"], m["glb"]))
with open(os.path.join(DOCS, "03-street-inventory.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(inv) + "\n")

print("生成: manifest.json / docs/02-materials-catalog.md / docs/03-street-inventory.md")
print("材质 %d 种, 语义组 %d, 模块 %d 件, 三角面 %d" %
      (len(T["materials"]), len(G["meshes"]), len(M), S["counts"]["triangles"]))
