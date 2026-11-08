#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_textures.py — 生成 street-01 全套 PBR 贴图 + 店招贴图 + 总览图
=====================================================================
基色来自 references/palette.json（由生图参考图聚类/采样得到）。
运行: python3 src/pbr/generate_textures.py
"""
import os, sys, json, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from texcore import (rgb_from_hex, delight, build_channels, save_material,
                     save_material_json, _u8)
from materials import GENERATORS

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = os.path.join(ROOT, "references")
TEX = os.path.join(ROOT, "assets", "textures")
DOCS = os.path.join(ROOT, "docs")
os.makedirs(TEX, exist_ok=True)
os.makedirs(DOCS, exist_ok=True)
os.makedirs(os.path.join(DOCS, "images"), exist_ok=True)

with open(os.path.join(REF, "palette.json"), encoding="utf-8") as f:
    PALETTE = json.load(f)
SW = PALETTE["swatches"]

# key, 名称, 分类, 调色板键或 hex, 生成器, 参数, 尺寸, 去光照增益,
# 平铺尺度(m), 粗糙度区间, 金属度, 法线强度, AO半径, seed, 参考图, 备注
MATERIALS = [
    # ---------------- 路面 ----------------
    ("stone_paving", "青石板铺装", "路面", "stone_paving", "masonry",
     {"cells": 6, "jitter": .82}, 2048, 1.34, 2.0, [.68, .94], 0, 2.8, 8, 101,
     "04_stone_paving_detail / 08_material_board", "主街面，板缝含苔藓与车辙痕"),
    ("stone_curb", "路缘石", "路面", "stone_paving", "masonry",
     {"cells": 4, "jitter": .70}, 1024, 1.30, 1.0, [.70, .95], 0, 2.6, 7, 102,
     "04_stone_paving_detail", "路缘、沟盖、台阶"),
    ("grey_brick", "青砖地", "路面", "grey_brick", "brick",
     {"cols": 8, "rows": 16, "joint": .055}, 2048, 1.36, 1.2, [.70, .95], 0, 2.4, 6, 103,
     "08_material_board", "人行道与院落铺砖"),
    ("rammed_earth", "夯土路面", "路面", "rammed_earth", "rammed_earth",
     {"layers": 26}, 2048, 1.38, 1.5, [.78, .98], 0, 2.2, 8, 104,
     "08_material_board", "未铺装巷道与车辙土"),
    ("mud_track", "车辙泥", "路面", "#4A3A2A", "rammed_earth",
     {"layers": 40}, 1024, 1.24, 1.2, [.80, .98], 0, 2.0, 6, 105,
     "04_stone_paving_detail", "车辙与泥泞贴花"),
    ("water_puddle", "积水", "路面", "#33404A", "water",
     {}, 1024, 1.0, 1.0, [.06, .22], 0, 6.0, 4, 106,
     "04_stone_paving_detail", "低粗糙度水面 + 波纹法线"),
    # ---------------- 建筑 ----------------
    ("rammed_earth_wall", "夯土墙", "建筑", "rammed_earth", "rammed_earth",
     {"layers": 20}, 1024, 1.32, 1.6, [.78, .98], 0, 2.2, 8, 201,
     "08_material_board", "山墙与院墙，水平夯层清晰"),
    ("grey_brick_wall", "青砖墙", "建筑", "grey_brick", "brick",
     {"cols": 10, "rows": 22, "joint": .05}, 2048, 1.34, 1.2, [.70, .95], 0, 2.4, 6, 202,
     "08_material_board", "墙体下部与台基包砖"),
    ("lime_plaster", "白灰抹面", "建筑", "lime_plaster", "plaster",
     {}, 2048, 1.16, 1.4, [.72, .95], 0, 2.4, 9, 203,
     "08_material_board", "墙面抹灰，含龟裂与剥落露土"),
    ("vermilion_lacquer", "朱漆柱", "建筑", "vermilion_lacquer", "lacquer",
     {"cells": 26}, 2048, 1.78, 0.6, [.30, .72], 0, 2.2, 5, 204,
     "05_lacquer_polychrome / 01_street_overview", "檐柱与门框，龟裂纹与局部剥落"),
    ("timber_beam", "木枋梁", "建筑", "aged_timber", "wood",
     {"planks": 0, "rings": 26, "knots": 3}, 2048, 1.38, 0.8, [.58, .86], 0, 2.6, 7, 205,
     "08_material_board", "额枋、梁、椽、斗拱木质"),
    ("wood_plank", "木板", "建筑", "aged_timber", "wood",
     {"planks": 6, "rings": 18, "knots": 2}, 1024, 1.34, 0.7, [.60, .88], 0, 2.8, 6, 206,
     "07_market_props", "板门、摊板、货箱"),
    ("lattice_paper", "格扇糊纸", "建筑", "#C9BFA4", "cloth",
     {"freq": 90, "folds": 2, "amount": .16, "emissive": True}, 1024, 1.06, 0.5,
     [.78, .96], 0, 1.6, 5, 207, "02_shopfront_elevation", "窗格糊纸，微透光自发光"),
    ("roof_tile", "青筒瓦", "建筑", "roof_tile", "roof_tile",
     {"cols": 10, "rows": 8}, 2048, 1.42, 0.9, [.68, .94], 0, 3.2, 6, 208,
     "03_roof_tile_detail", "半圆瓦垄 + 搭接缝 + 雨痕苔藓"),
    ("roof_ridge", "瓦当屋脊", "建筑", "roof_tile", "tile_end",
     {}, 1024, 1.36, 0.5, [.70, .95], 0, 2.6, 5, 209,
     "03_roof_tile_detail", "圆形瓦当：莲瓣云纹与乳钉"),
    ("stone_base", "台基石", "建筑", "#8A857A", "stone",
     {}, 1024, 1.18, 1.0, [.66, .90], 0, 2.4, 7, 210,
     "02_shopfront_elevation", "柱础、台基、踏步"),
    ("painted_dougong", "青绿彩画", "建筑", "painted_dougong", "polychrome",
     {}, 2048, 1.52, 0.6, [.38, .88], 0, 2.4, 6, 211,
     "05_lacquer_polychrome", "斗拱与额枋彩画，含金线、朱带、剥落"),
    ("black_lacquer", "黑漆匾额", "建筑", "#221C19", "lacquer",
     {"cells": 22}, 1024, 1.0, 0.5, [.28, .66], 0, 2.0, 5, 212,
     "02_shopfront_elevation", "匾额底板（字由 signage 贴图叠加）"),
    # ---------------- 装饰 ----------------
    ("gilt_bronze", "鎏金铜件", "装饰", "#A8863C", "metal",
     {}, 1024, 1.16, 0.4, [.20, .78], .88, 2.2, 5, 301,
     "05_lacquer_polychrome", "门环、角叶、铜钩，带铜绿与划痕"),
    ("lantern_silk", "灯笼纱", "装饰", "lantern_silk", "cloth",
     {"freq": 130, "folds": 3, "ribs": 8, "amount": .18, "emissive": True}, 1024, 1.22, 0.35,
     [.62, .90], 0, 1.8, 5, 302, "06_lanterns_banners", "竹骨横条 + 暖光自发光"),
    ("indigo_banner", "靛蓝布幡", "装饰", "indigo_banner", "cloth",
     {"freq": 160, "folds": 4, "amount": .24}, 1024, 1.52, 0.5, [.76, .96], 0, 2.0, 6, 303,
     "06_lanterns_banners", "褪色靛蓝幌布"),
    ("ochre_banner", "赭黄布幡", "装饰", "#9A6B3C", "cloth",
     {"freq": 150, "folds": 5, "amount": .26}, 1024, 1.30, 0.5, [.76, .96], 0, 2.0, 6, 304,
     "06_lanterns_banners", "赭黄旗幡"),
    ("bamboo_weave", "竹编", "装饰", "#A98B55", "weave",
     {"cells": 16}, 1024, 1.26, 0.4, [.70, .94], 0, 3.0, 5, 305,
     "07_market_props", "竹筐、竹帘经纬编织"),
    # ---------------- 道具 / 自然 ----------------
    ("pottery", "陶器釉面", "道具", "#7A5238", "pottery",
     {"rings": 38}, 1024, 1.30, 0.4, [.28, .88], 0, 2.4, 6, 401,
     "07_market_props", "陶罐瓷瓶，轮制纹与釉斑"),
    ("sackcloth", "麻袋粗布", "道具", "#9A8A6A", "cloth",
     {"freq": 70, "folds": 3, "amount": .30}, 1024, 1.20, 0.4, [.80, .98], 0, 2.4, 6, 402,
     "07_market_props", "粗麻织物"),
    ("tree_bark", "槐树皮", "自然", "tree_bark", "bark",
     {}, 1024, 1.42, 0.6, [.76, .98], 0, 3.0, 7, 403,
     "08_material_board", "竖向沟壑 + 地衣"),
    ("leaf_atlas", "槐叶图集", "自然", "#4E7038", "leaf_atlas",
     {"grid": 4}, 1024, 1.0, 1.0, [.62, .90], 0, 2.0, 5, 404,
     "01_street_overview / 07_market_props", "4x4 叶片图集 + alpha，用于树冠"),
    ("moss", "苔藓", "自然", "#4C6236", "moss",
     {}, 1024, 1.22, 0.4, [.84, .98], 0, 2.4, 6, 405,
     "04_stone_paving_detail", "缝隙与阴湿处团簇苔藓"),
    ("grime", "污渍贴花", "细节", "#3A3026", "grime",
     {}, 1024, 1.0, 1.0, [.84, .98], 0, 1.6, 5, 406,
     "04_stone_paving_detail", "径向衰减污渍，带 alpha 通道"),
]

SHOPS = [
    ("wineshop", "醉仙楼", "酒"), ("teahouse", "清茗轩", "茶"),
    ("silk", "锦绣坊", "绸"), ("medicine", "回春堂", "药"),
    ("smithy", "百炼坊", "铁"), ("inn", "悦来客栈", "宿"),
    ("pawn", "裕丰当", "当"), ("book", "翰墨斋", "书"),
    ("persian", "波斯邸", "胡"), ("bakery", "胡麻饼", "饼"),
    ("dye", "青蓝染", "染"), ("carpenter", "鲁班坊", "木"),
    ("incense", "沉香阁", "香"), ("brewery", "兰陵酿", "酿"),
]

FONT_CJK = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"


def base_color(spec, gain):
    if spec in SW:
        return rgb_from_hex(SW[spec]["hex"]), "palette:" + spec
    return rgb_from_hex(spec), "derived:" + spec


def signage():
    """中文店名匾额 + 竖幌，本地字体烘焙，不依赖客户端字体"""
    out = os.path.join(TEX, "signage")
    os.makedirs(out, exist_ok=True)
    rng = np.random.default_rng(20261107)
    records = []
    try:
        font_big = ImageFont.truetype(FONT_CJK, 132, index=2)
        font_sm = ImageFont.truetype(FONT_CJK, 44, index=2)
        font_bn = ImageFont.truetype(FONT_CJK, 150, index=2)
    except Exception:
        font_big = font_sm = font_bn = ImageFont.load_default()
    for sid, name, mark in SHOPS:
        # --- 横匾：黑漆金字 ---
        W, H = 1024, 256
        img = Image.new("RGB", (W, H), (26, 20, 17))
        d = ImageDraw.Draw(img)
        for k in range(4):
            d.rectangle([8 + k * 5, 8 + k * 5, W - 9 - k * 5, H - 9 - k * 5],
                        outline=(int(150 - k * 22), int(112 - k * 16), int(56 - k * 8)), width=3)
        d.rectangle([26, 26, W - 27, H - 27], outline=(176, 134, 62), width=2)
        bb = d.textbbox((0, 0), name, font=font_big)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        d.text(((W - tw) / 2 - bb[0], (H - th) / 2 - bb[1] - 6), name,
               font=font_big, fill=(214, 172, 88))
        # 做旧：噪点、划痕、褪色
        arr = np.asarray(img).astype(np.float32)
        noise = rng.normal(0, 9, (H, W, 1)).astype(np.float32)
        arr += noise
        scratch_img = Image.fromarray(_u8(np.abs(rng.normal(0, 26, (H, W)))))
        scratch_img = scratch_img.filter(ImageFilter.GaussianBlur(radius=0.8))
        scratch = np.asarray(scratch_img).astype(np.float32)[:, :, None]
        arr -= scratch * 0.10
        img = Image.fromarray(_u8(arr))
        img.save(os.path.join(out, "plaque_%s.png" % sid), optimize=True)
        # --- 竖幌：靛蓝/赭布 + 大字 ---
        W2, H2 = 256, 1024
        bg = (30, 42, 74) if sid in ("teahouse", "book", "dye") else (128, 44, 34)
        b = Image.new("RGB", (W2, H2), bg)
        dd = ImageDraw.Draw(b)
        dd.rectangle([10, 10, W2 - 11, H2 - 11], outline=(186, 158, 96), width=4)
        bb2 = dd.textbbox((0, 0), mark, font=font_bn)
        dd.text(((W2 - (bb2[2] - bb2[0])) / 2 - bb2[0], 180), mark,
                font=font_bn, fill=(226, 204, 152))
        bb3 = dd.textbbox((0, 0), name, font=font_sm)
        for i, ch in enumerate(name):
            dd.text(((W2 - 44) / 2, 430 + i * 62), ch, font=font_sm, fill=(206, 186, 140))
        arr2 = np.asarray(b).astype(np.float32)
        arr2 += rng.normal(0, 11, (H2, W2, 1)).astype(np.float32)
        fade = np.linspace(1.0, 0.72, H2)[:, None, None]
        arr2 *= fade
        Image.fromarray(_u8(arr2)).save(os.path.join(out, "banner_%s.png" % sid), optimize=True)
        records.append({"id": sid, "name": name, "mark": mark,
                        "plaque": "assets/textures/signage/plaque_%s.png" % sid,
                        "banner": "assets/textures/signage/banner_%s.png" % sid})
    with open(os.path.join(out, "signage.json"), "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    return records


def contact_sheet(results):
    cols, cell, label_h = 5, 216, 42
    rows = (len(results) + cols - 1) // cols
    W, H = cols * cell, rows * (cell + label_h)
    sheet = Image.new("RGB", (W, H), (22, 22, 24))
    d = ImageDraw.Draw(sheet)
    try:
        f_lab = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 18, index=2)
        f_sub = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 13, index=2)
    except Exception:
        f_lab = f_sub = ImageFont.load_default()
    for i, r in enumerate(results):
        c, rr = i % cols, i // cols
        x, y = c * cell, rr * (cell + label_h)
        im = Image.open(r["albedo_path"]).convert("RGB")
        if r["key"] in ("leaf_atlas", "grime"):
            bg = Image.new("RGB", im.size, (90, 90, 92))
            bg.paste(im, (0, 0))
            im = bg
        im = im.resize((cell - 10, cell - 10), Image.Resampling.LANCZOS)
        sheet.paste(im, (x + 5, y + 5))
        d.text((x + 6, y + cell), r["label"], font=f_lab, fill=(226, 220, 206))
        d.text((x + 6, y + cell + 22), "%s  %dpx  seam %.1f" %
               (r["key"], r["size"], r["seam"]), font=f_sub, fill=(138, 136, 128))
    sheet.save(os.path.join(DOCS, "images", "textures-contact-sheet.png"))


def channel_sheet(key, out_dir):
    """展示某材质全部通道，用于验证 PBR 正确性"""
    names = ["albedo", "normal", "roughness", "metallic", "ao", "height", "orm"]
    cell, cols = 230, 4
    rows = 2
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 26)), (22, 22, 24))
    d = ImageDraw.Draw(sheet)
    try:
        f = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 16, index=2)
    except Exception:
        f = ImageFont.load_default()
    for i, nm in enumerate(names):
        p = os.path.join(out_dir, "%s_%s.png" % (key, nm))
        if not os.path.exists(p):
            continue
        c, r = i % cols, i // cols
        im = Image.open(p).convert("RGB").resize((cell - 8, cell - 8), Image.Resampling.LANCZOS)
        sheet.paste(im, (c * cell + 4, r * (cell + 26) + 4))
        d.text((c * cell + 6, r * (cell + 26) + cell), nm, font=f, fill=(226, 220, 206))
    sheet.save(os.path.join(DOCS, "images", "pbr-channels-%s.png" % key))


def main():
    t0 = time.time()
    results = []
    print("材质数:", len(MATERIALS))
    for idx, M in enumerate(MATERIALS, 1):
        (key, label, cat, spec, gen, params, size, gain, tile, rough_rng,
         metal_v, nstr, ao_r, seed, ref, note) = M
        raw, src = base_color(spec, gain)
        base = delight(raw, gain)
        surf = GENERATORS[gen](size, base, params, seed)
        ch = build_channels(surf, normal_strength=nstr, ao_radius=ao_r)
        out_dir = os.path.join(TEX, key)
        written, seam = save_material(out_dir, key, ch, size)
        meta = {
            "key": key, "label": label, "category": cat,
            "base_color_srgb": "#%02X%02X%02X" % tuple(int(v) for v in np.clip(base, 0, 255)),
            "palette_source": src,
            "reference": ref, "delight_gain": gain, "notes": note,
            "size": [size, size], "tile_meters": tile,
            "roughness_range": rough_rng, "metallic": metal_v,
            "normal_strength": nstr, "ao_radius": ao_r, "seed": seed,
            "wrap": "repeat", "color_space": {"albedo": "sRGB", "others": "linear"},
            "seam_error_mean": round(seam, 3),
            "channels": written,
            "gltf": {"baseColorTexture": written["albedo"],
                     "normalTexture": written["normal"],
                     "metallicRoughnessTexture": written["orm"],
                     "occlusionTexture": written["ao"]},
        }
        save_material_json(out_dir, key, meta)
        results.append({"key": key, "label": label, "category": cat, "size": size,
                        "seam": seam, "albedo_path": os.path.join(out_dir, written["albedo"]),
                        "meta": meta})
        print("  [%2d/%d] %-20s %4dpx  seam=%5.2f  %s" %
              (idx, len(MATERIALS), key, size, seam, label), flush=True)
    print("生成店招贴图 ...", flush=True)
    signs = signage()
    print("生成贴图总览 ...", flush=True)
    contact_sheet(results)
    channel_sheet("stone_paving", os.path.join(TEX, "stone_paving"))
    channel_sheet("vermilion_lacquer", os.path.join(TEX, "vermilion_lacquer"))
    channel_sheet("roof_tile", os.path.join(TEX, "roof_tile"))
    manifest = {
        "version": "1.0", "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "palette": "references/palette.json",
        "material_count": len(results),
        "channels_per_material": ["albedo", "normal", "roughness", "metallic", "ao", "height", "orm"],
        "materials": [r["meta"] for r in results],
        "signage": signs,
        "elapsed_sec": round(time.time() - t0, 1),
    }
    with open(os.path.join(TEX, "textures_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    total = sum(os.path.getsize(os.path.join(dp, fn))
                for dp, _, fns in os.walk(TEX) for fn in fns)
    print("完成: %d 种材质, %d 张店招, 贴图总量 %.1f MB, 耗时 %.1fs" %
          (len(results), len(signs) * 2, total / 1048576, time.time() - t0))


if __name__ == "__main__":
    main()
