#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
参考资产整理与调色板提取
--------------------------------------------------
把生图模型产出的 8 张参考图语义化重命名，并从「材质研究板」中
逐格采样出 12 种材质的基色，作为 PBR 贴图生成的唯一色彩依据。

运行: python3 src/tools/prepare_references.py
"""
import json, os, glob, shutil
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = os.path.join(ROOT, "references")
os.makedirs(REF, exist_ok=True)

MAP = [
    ("Photoreal_cinematic_environmen", "01_street_overview.png",
     "盛唐长安商业街黄昏全景：整体氛围、光线、街道尺度、建筑天际线",
     "Photoreal cinematic environment concept art reference plate: Tang dynasty Chang'an commercial street, golden hour, bluestone avenue, timber shopfronts, vermilion columns, grey tiled roofs, red lanterns, fabric banners, distant gate tower, volumetric light"),
    ("Architectural_reference_plate", "02_shopfront_elevation.png",
     "三开间店铺正立面：柱、柱础、斗拱、出檐、格扇、匾额、台基形制比例",
     "Orthographic front elevation of one Tang dynasty timber shopfront, three bays, dougong brackets, grey tubular roof tiles, latticed paper windows, black lacquer signboard"),
    ("Extreme_close_up_material_refe", "03_roof_tile_detail.png",
     "青筒瓦与瓦当特写：瓦垄排列、圆形瓦当纹样、苔藓与雨痕",
     "Extreme close-up of Chinese grey clay roof tiles, pan and cover tiles, circular eave ends with floral motifs, lichen, rain streaks"),
    ("Top_down_material_reference_pl", "04_stone_paving_detail.png",
     "青石板路面俯视：板缝、磨圆边缘、车辙、苔藓、水渍",
     "Top-down weathered bluestone slab paving, deep grout joints, moss in seams, wheel ruts, water stains"),
    ("Material_reference_plate_of_Ta", "05_lacquer_polychrome.png",
     "朱漆柱、青绿彩画斗拱、鎏金铜件：龟裂、剥落、金箔磨损",
     "Tang painted timber details: vermilion lacquer column, blue-green polychrome dougong, gilt bronze fittings, cracked lacquer, worn gold leaf"),
    ("Reference_plate_of_Tang_dynast", "06_lanterns_banners.png",
     "灯笼与幌子：红绸灯笼、纸灯、靛蓝/赭黄布幡、流苏、铜钩",
     "Tang street hanging fixtures: red silk lanterns, paper lanterns, indigo and ochre cloth banners, tassels, brass hooks"),
    ("Game_art_props_reference_sheet", "07_market_props.png",
     "市井道具：陶罐、瓷瓶、竹筐、麻袋、木箱、摊位、水槽、辘轳、拴马桩、石灯、香炉",
     "Tang market props reference sheet: ceramic jars, earthenware pots, bamboo baskets, hemp sacks, wooden crates, stall table, stone trough, well bucket, hitching post, stone lantern, incense burner"),
    ("PBR_material_study_board__twel", "08_material_board.png",
     "12 格材质研究板：可直接采样得到 12 种基色与风化特征",
     "PBR material study board, 4x3 grid of twelve Tang dynasty building material swatches"),
]

# 材质研究板 3 列 x 4 行，按行优先（以实际生图结果为准）
BOARD_COLS, BOARD_ROWS = 3, 4
BOARD_SWATCHES = [
    ("stone_paving",     "青石板铺装"),
    ("grey_brick",       "青砖墙"),
    ("rammed_earth",     "夯土墙/夯土路"),
    ("lime_plaster",     "白灰抹面"),
    ("vermilion_lacquer","朱漆柱"),
    ("aged_timber",      "老木枋/木板"),
    ("roof_tile",        "青筒瓦"),
    ("painted_dougong",  "青绿彩画斗拱"),
    ("gilt_bronze",      "鎏金铜/铜绿"),
    ("lantern_silk",     "灯笼纱纸"),
    ("indigo_banner",    "靛蓝布幡"),
    ("tree_bark",        "树皮"),
]


def relink():
    index = []
    for prefix, newname, purpose, prompt in MAP:
        hits = sorted(glob.glob(os.path.join(REF, "generated", prefix + "*.png")))
        if not hits:
            print("  ! 缺少参考图:", prefix)
            continue
        src = hits[0]
        dst = os.path.join(REF, newname)
        if os.path.abspath(src) != os.path.abspath(dst):
            shutil.copy2(src, dst)
        index.append({
            "file": "references/" + newname,
            "source_file": os.path.basename(src),
            "purpose": purpose,
            "prompt": prompt,
        })
    with open(os.path.join(REF, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    return index


def kmeans_palette(img_bgr, k=10, seed=7):
    small = cv2.resize(img_bgr, (192, 192), interpolation=cv2.INTER_AREA)
    lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, 0.4)
    _, labels, centers = cv2.kmeans(lab, k, None, criteria, 6, cv2.KMEANS_PP_CENTERS)
    centers = centers.astype(np.uint8).reshape(1, k, 3)
    bgr = cv2.cvtColor(centers, cv2.COLOR_LAB2BGR).reshape(k, 3)
    counts = np.bincount(labels.ravel(), minlength=k).astype(float)
    order = np.argsort(-counts)
    out = []
    for i in order:
        b, g, r = [int(v) for v in bgr[i]]
        out.append({"rgb": [r, g, b], "hex": "#%02X%02X%02X" % (r, g, b),
                    "ratio": round(float(counts[i] / counts.sum()), 4)})
    return out


def sample_board(path):
    """从 4x3 材质板逐格采样主色（取中心区域中位数，避开高光/阴影）"""
    bgr = cv2.imread(path, cv2.IMREAD_COLOR)
    if bgr is None:
        return {}
    h, w = bgr.shape[:2]
    cw, ch = w / BOARD_COLS, h / BOARD_ROWS
    out = {}
    for i, (key, label) in enumerate(BOARD_SWATCHES):
        r, c = divmod(i, BOARD_COLS)
        x0, y0 = int(c * cw), int(r * ch)
        x1, y1 = int((c + 1) * cw), int((r + 1) * ch)
        # 中心 62% 区域，去极值后取中位数
        mx, my = int((x1 - x0) * 0.19), int((y1 - y0) * 0.19)
        patch = bgr[y0 + my:y1 - my, x0 + mx:x1 - mx].reshape(-1, 3)
        patch = patch[(patch.min(axis=1) > 12) & (patch.max(axis=1) < 246)]
        if len(patch) == 0:
            patch = bgr[y0:y1, x0:x1].reshape(-1, 3)
        b, g, r = [int(v) for v in np.median(patch, axis=0)]
        out[key] = {"label": label, "rgb": [r, g, b],
                    "hex": "#%02X%02X%02X" % (r, g, b),
                    "grid": [r, c], "mean": [round(float(v), 1) for v in patch.mean(axis=0)[::-1]]}
    return out


def draw_palette(swatches, env_palette, out_path):
    W, H = 1200, 760
    img = Image.new("RGB", (W, H), (24, 24, 26))
    d = ImageDraw.Draw(img)
    font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
    try:
        f_title = ImageFont.truetype(font_path, 30)
        f_lab = ImageFont.truetype(font_path, 17)
        f_small = ImageFont.truetype(font_path, 14)
    except Exception:
        f_title = f_lab = f_small = ImageFont.load_default()
    d.text((36, 24), "参考图调色板 · 盛唐长安 street-01", font=f_title, fill=(236, 228, 210))
    d.text((36, 66), "12 种材质基色由生图材质研究板逐格采样，是 PBR albedo 的唯一色彩来源",
           font=f_small, fill=(160, 158, 150))
    x0, y0, sw, sh, gap = 36, 110, 220, 108, 16
    for i, (key, v) in enumerate(swatches.items()):
        r, c = divmod(i, 3)
        x, y = x0 + c * (sw + gap), y0 + r * (sh + gap + 26)
        d.rectangle([x, y, x + sw, y + sh], fill=tuple(v["rgb"]))
        d.rectangle([x, y, x + sw, y + sh], outline=(70, 70, 72), width=1)
        d.text((x, y + sh + 4), v["label"], font=f_lab, fill=(215, 210, 198))
        d.text((x, y + sh + 26), "%s  rgb%s" % (v["hex"], tuple(v["rgb"])), font=f_small, fill=(140, 138, 132))
    # 环境色带
    by = y0 + 4 * (sh + gap + 26) + 16
    d.text((36, by), "环境 / 光照色（由街道全景图聚类）", font=f_lab, fill=(215, 210, 198))
    bx = 36
    for item in env_palette[:12]:
        d.rectangle([bx, by + 30, bx + 88, by + 78], fill=tuple(item["rgb"]))
        d.text((bx, by + 82), item["hex"], font=f_small, fill=(140, 138, 132))
        bx += 96
    img.save(out_path)


def main():
    print("[1/3] 语义化整理参考图")
    index = relink()
    board = os.path.join(REF, "08_material_board.png")
    overview = os.path.join(REF, "01_street_overview.png")
    print("[2/3] 采样材质基色与环境色")
    swatches = sample_board(board)
    env = kmeans_palette(cv2.imread(overview), k=12) if os.path.exists(overview) else []
    palette = {
        "source": "生图模型参考图（references/08_material_board.png, 01_street_overview.png）",
        "method": "材质板 4x3 网格中心区域中位数采样 + 全景图 LAB K-Means 聚类",
        "color_space": "sRGB",
        "swatches": swatches,
        "environment": env,
        "lighting": {
            "dusk_sun": "#FFC878", "dusk_ambient": "#6E6A78",
            "dawn_sun": "#FFD9B0", "noon_sun": "#FFF3DC",
            "night_ambient": "#1B2436", "lantern_emissive": "#FF7A33",
            "fog_dusk": "#C8A67C", "fog_night": "#1A2434",
        },
    }
    with open(os.path.join(REF, "palette.json"), "w", encoding="utf-8") as f:
        json.dump(palette, f, ensure_ascii=False, indent=2)
    print("[3/3] 生成调色板图")
    draw_palette(swatches, env, os.path.join(REF, "palette_swatches.png"))
    print("完成: %d 张参考图, %d 种材质基色, %d 个环境色" % (len(index), len(swatches), len(env)))
    for k, v in swatches.items():
        print("   %-20s %s %s" % (k, v["hex"], v["label"]))


if __name__ == "__main__":
    main()
