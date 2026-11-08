#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_street.py — 盛唐长安「一条街」高精细 PBR 场景构建器
========================================================
生成 glTF 2.0 / GLB 整街模型 + 模块化构件库 + 构件统计。
所有几何带 PBR 材质与物理尺度 UV，按语义路径分组。

运行: python3 src/geometry/build_street.py
"""
import os, sys, json, math, random
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gltf_writer import (GLTFWriter, box, plane_xz, _quad_geo, cylinder, lathe,
                         transform, make_rgba)

ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
TEX = os.path.join(ROOT, "assets", "textures")
SIGN = os.path.join(TEX, "signage")
MODELS = os.path.join(ROOT, "assets", "models")
DOCS = os.path.join(ROOT, "docs")
os.makedirs(MODELS, exist_ok=True)
os.makedirs(DOCS, exist_ok=True)

with open(os.path.join(SIGN, "signage.json"), encoding="utf-8") as f:
    SHOPS = json.load(f)

# ---------------------------------------------------------------- 尺度常量
STREET_LEN = 120.0
HALF_ROAD = 4.5
WALK_W = 2.5
EDGE = HALF_ROAD + WALK_W          # 7.0 建筑前脸
DEPTH = 7.4                        # 建筑进深
BAYS = 4                           # 四开间（5 柱）
N_PER_SIDE = 8
LOT = STREET_LEN / N_PER_SIDE      # 15.0
GAP = 0.6
LOT_W = LOT - GAP                  # 14.4
BASE_Y = 0.45                      # 台基顶
COL_H = 3.30                       # 檐柱高
EAVE_Y = BASE_Y + COL_H + 0.55     # 檐口
RIDGE_H = 1.75                     # 举高

META = {}
for d in sorted(os.listdir(TEX)):
    p = os.path.join(TEX, d, "material.json")
    if os.path.isfile(p):
        with open(p, encoding="utf-8") as f:
            META[d] = json.load(f)
TILE = {k: float(v["tile_meters"]) for k, v in META.items()}
print("已加载材质:", len(META))


# ---------------------------------------------------------------- 通用工具
def xf(t=(0, 0, 0), rx=0.0, ry=0.0, rz=0.0, s=(1, 1, 1)):
    f = np.float32
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], f)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], f)
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], f)
    M = np.eye(4, dtype=f)
    M[:3, :3] = (Ry @ Rx @ Rz) @ np.diag(np.array(s, f))
    M[:3, 3] = np.array(t, f)
    return M


def quat_between(a, b):
    a = np.asarray(a, np.float32); a /= (np.linalg.norm(a) + 1e-9)
    b = np.asarray(b, np.float32); b /= (np.linalg.norm(b) + 1e-9)
    v = np.cross(a, b); c = float(np.dot(a, b))
    if c < -0.9999:
        return [1.0, 0.0, 0.0, 0.0]
    s = math.sqrt((1 + c) * 2)
    return [float(v[0] / s), float(v[1] / s), float(v[2] / s), float(s / 2)]


def B(w, g, mat, sx, sy, sz, c, M=None, tile=None):
    w.add(g, mat, box(sx, sy, sz, tile=tile or TILE.get(mat, 1.0), center=c), M)


def C(w, g, mat, r, h, c, seg=12, r2=None, M=None, tile=None):
    w.add(g, mat, cylinder(r, h, seg=seg, tile=tile or TILE.get(mat, 1.0),
                           center=c, r2=r2), M)


def upward_quad(p0, p1, p2, p3, tile=1.0, uv0=(0, 0)):
    v, n, uv, f = _quad_geo(p0, p1, p2, p3, tile=tile, uv0=uv0)
    if n[0][1] < 0:
        v, n, uv, f = _quad_geo(p0, p1, p2, p3, tile=tile, uv0=uv0, flip=True)
    return v, n, uv, f


def facing_quad(x, y0, y1, z0, z1, side, uv0=(0, 0), uv1=(1, 1)):
    """竖直面片，法线朝街心；UV: (0,0) 为图像左上"""
    za, zb = (z0, z1) if side > 0 else (z1, z0)
    v = np.array([[x, y0, za], [x, y0, zb], [x, y1, zb], [x, y1, za]], np.float32)
    n = np.tile(np.array([-side, 0, 0], np.float32), (4, 1))
    u0, v0 = uv0; u1, v1 = uv1
    uv = np.array([[u0, v1], [u1, v1], [u1, v0], [u0, v0]], np.float32)
    f = np.array([[0, 1, 2], [0, 2, 3]], np.int32)
    return v, n, uv, f


def billboard(cx, cy, cz, w, h, ang, uv0=(0, 0), uv1=(1, 1)):
    """绕 Y 旋转的竖直面片（双面），用于树冠/旗幡"""
    u0, v0 = uv0; u1, v1 = uv1
    v = np.array([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0],
                  [w / 2, h / 2, 0], [-w / 2, h / 2, 0]], np.float32)
    n = np.tile(np.array([0, 0, 1], np.float32), (4, 1))
    uv = np.array([[u0, v1], [u1, v1], [u1, v0], [u0, v0]], np.float32)
    f = np.array([[0, 1, 2], [0, 2, 3]], np.int32)
    return transform((v, n, uv, f), xf(t=(cx, cy, cz), ry=ang))


def atlas_uv(i, cols=4, rows=4):
    c, r = i % cols, i // cols
    return (c / cols, r / rows, (c + 1) / cols, (r + 1) / rows)


# ---------------------------------------------------------------- 材质注册
def build_signage_atlas():
    os.makedirs(SIGN, exist_ok=True)
    plaque = Image.new("RGB", (2048, 512), (22, 17, 14))
    banner = Image.new("RGB", (512, 2048), (26, 20, 17))
    for i, s in enumerate(SHOPS):
        p = Image.open(os.path.join(SIGN, "plaque_%s.png" % s["id"])).convert("RGB").resize((512, 128))
        b = Image.open(os.path.join(SIGN, "banner_%s.png" % s["id"])).convert("RGB").resize((128, 512))
        plaque.paste(p, ((i % 4) * 512, (i // 4) * 128))
        banner.paste(b, ((i % 4) * 128, (i // 4) * 512))
    plaque.save(os.path.join(SIGN, "plaques_atlas.png"), optimize=True)
    banner.save(os.path.join(SIGN, "banners_atlas.png"), optimize=True)
    Image.new("RGB", (64, 64), (128, 128, 255)).save(os.path.join(SIGN, "flat_normal.png"))
    Image.new("RGB", (64, 64), (255, 170, 0)).save(os.path.join(SIGN, "flat_orm_plaque.png"))
    Image.new("RGB", (64, 64), (255, 225, 0)).save(os.path.join(SIGN, "flat_orm_banner.png"))


DOUBLE_SIDED = {"indigo_banner", "ochre_banner", "lattice_paper", "leaf_atlas",
                "grime", "water_puddle", "lantern_silk", "sackcloth"}
ALPHA_MAT = {"leaf_atlas", "grime"}


def register(w, tex_prefix="../textures/"):
    for key, m in META.items():
        base = "%s%s/" % (tex_prefix, key)
        ch = m["channels"]
        cfg = {"albedo": base + ch["albedo"],
               "normal": base + ch["normal"],
               "orm": base + ch["orm"]}
        if "emissive" in ch:
            cfg["emissive"] = base + ch["emissive"]
            cfg["emissive_factor"] = [1.0, 0.86, 0.62] if key == "lantern_silk" else [0.55, 0.48, 0.36]
        if key in ALPHA_MAT:
            out = os.path.join(TEX, key, key + "_basecolor_rgba.png")
            make_rgba(os.path.join(TEX, key, ch["albedo"]),
                      os.path.join(TEX, key, ch["opacity"]), out)
            cfg["albedo"] = base + key + "_basecolor_rgba.png"
            cfg["alpha"] = True
            cfg["alpha_mode"] = "MASK" if key == "leaf_atlas" else "BLEND"
            cfg["alpha_cutoff"] = 0.45
        if key in DOUBLE_SIDED:
            cfg["double_sided"] = True
        w.register_material(key, cfg)
    sg = tex_prefix + "signage/"
    n = sg + "flat_normal.png"
    w.register_material("plaque_atlas", {
        "albedo": sg + "plaques_atlas.png",
        "normal": n, "orm": sg + "flat_orm_plaque.png",
        "double_sided": True})
    w.register_material("banner_atlas", {
        "albedo": sg + "banners_atlas.png",
        "normal": n, "orm": sg + "flat_orm_banner.png",
        "double_sided": True, "alpha": False})
    # 红绸灯笼：复用灯笼纱的全部通道，仅用 baseColorFactor 染成朱红（无需额外贴图）
    lk = "lantern_silk"
    lb = "%s%s/" % (tex_prefix, lk)
    lc = META[lk]["channels"]
    w.register_material("red_lantern", {
        "albedo": lb + lc["albedo"], "normal": lb + lc["normal"],
        "orm": lb + lc["orm"], "emissive": lb + lc["emissive"],
        "emissive_factor": [1.0, 0.30, 0.14],
        "base_color_factor": [0.94, 0.20, 0.13, 1.0],
        "double_sided": True})


# ---------------------------------------------------------------- 建筑构件
def add_dougong(w, g, x, y, z, scale=1.0):
    """一攒斗拱：栌斗 + 两层华拱 + 横拱 + 散斗 + 令拱"""
    s = scale
    B(w, g, "painted_dougong", 0.46 * s, 0.20 * s, 0.46 * s, (x, y + 0.10 * s, z))
    for dy, sx, sz, mat in ((0.25, 1.20, 0.20, "painted_dougong"),
                            (0.42, 1.55, 0.20, "timber_beam")):
        B(w, g, mat, sx * s, 0.15 * s, sz * s, (x, y + dy * s, z))
        B(w, g, mat, sz * s, 0.15 * s, 0.95 * s, (x, y + dy * s, z))
    for dx in (-0.52, 0.52):
        for dz in (-0.36, 0.36):
            B(w, g, "painted_dougong", 0.18 * s, 0.14 * s, 0.18 * s,
              (x + dx * s, y + 0.52 * s, z + dz * s))
    B(w, g, "painted_dougong", 0.24 * s, 0.16 * s, 1.35 * s, (x, y + 0.62 * s, z))


def add_lantern(w, g, x, y, z, scl=1.0, red=False):
    prof = [(0.06, -0.34), (0.17, -0.30), (0.28, -0.18), (0.33, 0.0),
            (0.28, 0.18), (0.17, 0.30), (0.06, 0.34)]
    geo = lathe(prof, seg=14, tile=TILE["lantern_silk"])
    w.add(g, "red_lantern" if red else "lantern_silk", geo,
          xf(t=(x, y, z), s=(scl, scl, scl)))
    C(w, g, "gilt_bronze", 0.10 * scl, 0.055, (x, y + 0.35 * scl, z), seg=12)
    C(w, g, "gilt_bronze", 0.10 * scl, 0.055, (x, y - 0.35 * scl, z), seg=12)
    C(w, g, "timber_beam", 0.012, 0.46 * scl, (x, y + 0.58 * scl, z), seg=6)
    C(w, g, "vermilion_lacquer", 0.022, 0.26 * scl, (x, y - 0.49 * scl, z), seg=8)
    C(w, g, "gilt_bronze", 0.035, 0.04, (x, y - 0.63 * scl, z), seg=8)


def add_roof(w, g, side, z0, W, eave_y, ridge_x, ridge_y, tile="roof_tile",
             front_ref=None, back_ref=None, overhang=0.95):
    """举折双坡屋顶：每坡 4 段凹曲面 + 瓦垄脊线 + 正脊 + 鸱吻 + 檐口瓦当"""
    toward = -side
    fa = side * EDGE if front_ref is None else front_ref
    ba = side * (EDGE + DEPTH) if back_ref is None else back_ref
    front_eave = fa + toward * overhang
    back_eave = ba - toward * overhang
    za, zb = z0 - 0.95, z0 + W + 0.95
    for eave_x, label in ((front_eave, "front"), (back_eave, "back")):
        dx = eave_x - ridge_x
        for i in range(4):
            t0, t1 = i / 4.0, (i + 1) / 4.0
            x0 = ridge_x + dx * t0
            x1 = ridge_x + dx * t1
            y0 = eave_y + (ridge_y - eave_y) * (1 - t0) ** 1.5
            y1 = eave_y + (ridge_y - eave_y) * (1 - t1) ** 1.5
            w.add(g, tile, upward_quad((x0, y0, za), (x1, y1, za),
                                       (x1, y1, zb), (x0, y0, zb),
                                       tile=TILE[tile]))
        # 瓦垄立体脊线（每 0.55m 一条），沿坡面折线
        k = 0
        zz = za + 0.2
        while zz < zb - 0.2:
            for i in range(4):
                t0, t1 = i / 4.0, (i + 1) / 4.0
                xa = ridge_x + dx * t0
                xb = ridge_x + dx * t1
                ya = eave_y + (ridge_y - eave_y) * (1 - t0) ** 1.5 + 0.035
                yb = eave_y + (ridge_y - eave_y) * (1 - t1) ** 1.5 + 0.035
                L = math.hypot(xb - xa, yb - ya)
                ang = math.atan2(yb - ya, xb - xa)
                w.add(g, "roof_tile", box(L, 0.045, 0.075, tile=TILE["roof_tile"]),
                      xf(t=((xa + xb) / 2, (ya + yb) / 2, zz), rz=ang))
            zz += 0.82
            k += 1
        # 檐口瓦当（圆瓦端）
        zz = za + 0.15
        while zz < zb - 0.1:
            w.add(g, "roof_ridge", cylinder(0.115, 0.10, seg=10,
                                            tile=TILE["roof_ridge"]),
                  xf(t=(eave_x, eave_y + 0.02, zz), rz=math.pi / 2 * (1 if dx > 0 else -1)))
            zz += 0.34
        # 垂脊（山墙边）
        for zz2 in (za + 0.05, zb - 0.05):
            for i in range(4):
                t0, t1 = i / 4.0, (i + 1) / 4.0
                xa = ridge_x + dx * t0
                xb = ridge_x + dx * t1
                ya = eave_y + (ridge_y - eave_y) * (1 - t0) ** 1.5 + 0.10
                yb = eave_y + (ridge_y - eave_y) * (1 - t1) ** 1.5 + 0.10
                L = math.hypot(xb - xa, yb - ya)
                ang = math.atan2(yb - ya, xb - xa)
                w.add(g, "roof_ridge", box(L, 0.20, 0.22, tile=TILE["roof_ridge"]),
                      xf(t=((xa + xb) / 2, (ya + yb) / 2, zz2), rz=ang))
    # 正脊
    B(w, g, "roof_ridge", 0.38, 0.32, W + 2.0, (ridge_x, ridge_y + 0.16, z0 + W / 2))
    for zz2 in (za + 0.05, zb - 0.05):
        B(w, g, "roof_ridge", 0.42, 0.52, 0.42, (ridge_x, ridge_y + 0.42, zz2))
        B(w, g, "roof_ridge", 0.30, 0.32, 0.30, (ridge_x, ridge_y + 0.80, zz2))
        w.add(g, "roof_ridge", cylinder(0.13, 0.42, seg=8, tile=TILE["roof_ridge"]),
              xf(t=(ridge_x, ridge_y + 1.02, zz2), rz=0.35))


def add_upper_storey(w, g, side, z0, W, cx, cz, base_eave):
    """重檐楼阁二层：平坐 + 缩入柱网 + 格扇 + 简化斗拱 + 上层屋顶"""
    fx, bx = side * (EDGE + 0.9), side * (EDGE + DEPTH - 0.9)
    cx2, cz2 = (fx + bx) / 2, z0 + W / 2
    B(w, g, "timber_beam", abs(bx - fx) + 1.2, 0.22, W - 0.4, (cx2, base_eave + 0.05, cz2))
    h2 = 2.55
    for k in range(BAYS + 1):
        zz = z0 + k * W / BAYS
        for xx in (fx, bx):
            C(w, g, "vermilion_lacquer", 0.15, h2, (xx, base_eave + 0.22 + h2 / 2, zz), seg=10)
            B(w, g, "stone_base", 0.34, 0.16, 0.34, (xx, base_eave + 0.30, zz))
    for xx in (fx, bx):
        B(w, g, "timber_beam", 0.22, 0.26, W, (xx, base_eave + 0.22 + h2, cz2))
    # 二层格扇（糊纸）
    xf2 = fx
    for k in range(BAYS):
        zz = z0 + (k + 0.5) * W / BAYS
        w.add(g, "lattice_paper", facing_quad(xf2 + (-side) * 0.06,
              base_eave + 0.30, base_eave + 0.30 + h2 - 0.35,
              zz - W / BAYS * 0.38, zz + W / BAYS * 0.38, side))
        B(w, g, "timber_beam", 0.10, h2 - 0.30, 0.09,
          (xf2 + (-side) * 0.10, base_eave + 0.30 + (h2 - 0.30) / 2, zz - W / BAYS * 0.40))
    eave2 = base_eave + 0.22 + h2 + 0.30
    ridge2 = eave2 + 1.32
    add_roof(w, g, side, z0 + 0.4, W - 0.8, eave2, (fx + bx) / 2, ridge2,
             front_ref=fx, back_ref=bx, overhang=0.62)


def build_shop(w, side, idx, z0, W, shop, floors, rng, module=False):
    name = shop["id"] if shop else "dwelling"
    zone = "North" if side < 0 else "South"
    g = "%s/Buildings/%s_%02d" % (zone, name, idx)
    fx, bx = side * EDGE, side * (EDGE + DEPTH)
    cx, cz = (fx + bx) / 2, z0 + W / 2
    toward = -side
    style = rng.choice(["lime_plaster", "rammed_earth_wall", "grey_brick_wall"])
    # 台基与线脚
    B(w, g, "stone_base", DEPTH + 0.6, BASE_Y, W + 0.6, (cx, BASE_Y / 2, cz))
    B(w, g, "stone_base", DEPTH + 0.75, 0.09, W + 0.75, (cx, BASE_Y - 0.04, cz))
    for i in range(3):
        B(w, g, "stone_base", 0.42, 0.15, 3.4 - i * 0.3,
          (fx + toward * (0.30 + i * 0.34), 0.075 + i * 0.15, cz))
    # 柱网
    col_top = BASE_Y + 0.18 + COL_H
    for k in range(BAYS + 1):
        zz = z0 + k * W / BAYS
        for xx in (fx, bx):
            C(w, g, "stone_base", 0.30, 0.18, (xx, BASE_Y + 0.09, zz), seg=12)
            C(w, g, "vermilion_lacquer", 0.195, COL_H,
              (xx, BASE_Y + 0.18 + COL_H / 2, zz), seg=14, r2=0.175)
            B(w, g, "painted_dougong", 0.50, 0.22, 0.50, (xx, col_top + 0.11, zz))
    # 墙体
    wall_h = COL_H - 0.15
    B(w, g, style, 0.28, wall_h, W - 0.4, (bx, BASE_Y + 0.18 + wall_h / 2, cz))
    for zz in (z0 + 0.14, z0 + W - 0.14):
        B(w, g, style, DEPTH - 0.3, wall_h, 0.28, (cx, BASE_Y + 0.18 + wall_h / 2, zz))
    # 裙墙 / 槛墙
    B(w, g, style, 0.24, 0.92, W - 0.5, (fx, BASE_Y + 0.18 + 0.46, cz))
    # 前脸格扇与板门
    for k in range(BAYS):
        zz = z0 + (k + 0.5) * W / BAYS
        wd = W / BAYS * 0.72
        if k == BAYS // 2:
            B(w, g, "wood_plank", 0.10, 2.15, wd,
              (fx + toward * 0.08, BASE_Y + 1.10 + 1.075, zz))
            for dzz in (-wd / 2, wd / 2):
                B(w, g, "timber_beam", 0.12, 2.25, 0.10,
                  (fx + toward * 0.12, BASE_Y + 1.10 + 1.125, zz + dzz))
            C(w, g, "gilt_bronze", 0.075, 0.04,
              (fx + toward * 0.16, BASE_Y + 2.15, zz - 0.28), seg=10)
            C(w, g, "gilt_bronze", 0.075, 0.04,
              (fx + toward * 0.16, BASE_Y + 2.15, zz + 0.28), seg=10)
        else:
            w.add(g, "lattice_paper", facing_quad(fx + toward * 0.08,
                  BASE_Y + 1.10, BASE_Y + 1.10 + 2.10,
                  zz - wd / 2, zz + wd / 2, side))
            # 格扇木框（横棂 + 竖棂）
            for j in range(1, 7):
                B(w, g, "timber_beam", 0.055, 0.045, wd,
                  (fx + toward * 0.12, BASE_Y + 1.10 + j * 2.10 / 7, zz))
            for j in range(1, 5):
                B(w, g, "timber_beam", 0.055, 2.10, 0.045,
                  (fx + toward * 0.12, BASE_Y + 1.10 + 1.05, zz - wd / 2 + j * wd / 5))
    # 额枋
    B(w, g, "timber_beam", 0.30, 0.32, W + 0.3, (fx, col_top + 0.16, cz))
    B(w, g, "painted_dougong", 0.26, 0.20, W + 0.3, (fx, col_top + 0.42, cz))
    # 斗拱：柱头 + 补间
    for k in range(BAYS + 1):
        add_dougong(w, g, fx, col_top + 0.30, z0 + k * W / BAYS, 1.0)
    for k in range(BAYS):
        for q in (0.33, 0.67):
            add_dougong(w, g, fx, col_top + 0.30, z0 + (k + q) * W / BAYS, 0.82)
    # 椽子与檐板
    zz = z0 - 0.9
    while zz < z0 + W + 0.9:
        B(w, g, "timber_beam", DEPTH + 1.9, 0.10, 0.09,
          (cx, EAVE_Y - 0.05, zz))
        zz += 0.42
    B(w, g, "timber_beam", DEPTH + 1.9, 0.14, W + 1.9, (cx, EAVE_Y + 0.03, cz))
    ridge_y = EAVE_Y + RIDGE_H
    add_roof(w, g, side, z0, W, EAVE_Y + 0.10, cx, ridge_y)
    # 匾额（黑漆框 + atlas 字面）
    if shop:
        i = SHOPS.index(shop)
        u0, v0, u1, v1 = atlas_uv(i)
        px = fx + toward * 0.22
        B(w, g, "black_lacquer", 0.16, 0.78, 3.20, (px, EAVE_Y - 0.62, cz))
        w.add(g, "plaque_atlas", facing_quad(px + toward * 0.09,
              EAVE_Y - 0.94, EAVE_Y - 0.30, cz - 1.50, cz + 1.50, side,
              uv0=(u0, v0), uv1=(u1, v1)))
        # 竖幌
        bz = z0 + W * 0.82
        u0, v0, u1, v1 = atlas_uv(i)
        B(w, g, "timber_beam", 0.06, 0.06, 0.90,
          (fx + toward * 0.55, EAVE_Y - 0.06, bz))
        w.add(g, "banner_atlas", facing_quad(fx + toward * 0.58,
              EAVE_Y - 2.55, EAVE_Y - 0.18, bz - 0.32, bz + 0.32, side,
              uv0=(u0, v0), uv1=(u1, v1)))
    # 檐下灯笼
    for k in range(4):
        lz = z0 + (k + 0.5) * W / 4
        lx = fx + toward * 0.62
        C(w, g, "timber_beam", 0.02, 0.42, (lx, EAVE_Y - 0.24, lz), seg=6)
        add_lantern(w, g, lx, EAVE_Y - 0.95, lz,
                    1.0 if k % 2 == 0 else 0.82, red=(k % 4 != 3))
    # 二层
    if floors == 2:
        add_upper_storey(w, g, side, z0, W, cx, cz, EAVE_Y + RIDGE_H + 0.35)
    return g


# ---------------------------------------------------------------- 街面
def add_ground(w, rng):
    g = "Street/Surface"
    # 城外夯土地基：让街口、俯瞰等任意机位都不会露出天空球底部
    w.add(g, "rammed_earth", plane_xz(220, 340, y=-0.07,
                                      center=(0, STREET_LEN / 2), tile=4.5))
    w.add(g, "stone_paving", plane_xz(2 * HALF_ROAD, STREET_LEN, y=0.0,
                                      center=(0, STREET_LEN / 2), tile=TILE["stone_paving"]))
    for side in (-1, 1):
        x = side * (HALF_ROAD + WALK_W / 2)
        w.add(g, "grey_brick", plane_xz(WALK_W, STREET_LEN, y=0.18,
                                        center=(x, STREET_LEN / 2), tile=TILE["grey_brick"]))
        B(w, g, "stone_curb", 0.16, 0.18, STREET_LEN, (side * HALF_ROAD, 0.09, STREET_LEN / 2))
        # 路缘石分块
        z = 0.0
        while z < STREET_LEN:
            B(w, g, "stone_curb", 0.34, 0.26, 1.42,
              (side * (HALF_ROAD + 0.16), 0.22, z + 0.75))
            z += 1.5
        # 排水沟：槽 + 沟盖
        gx = side * (HALF_ROAD + 0.34)
        B(w, g, "stone_base", 0.52, 0.12, STREET_LEN, (gx, 0.185, STREET_LEN / 2))
        z = 0.0
        while z < STREET_LEN - 1.0:
            B(w, g, "stone_curb", 0.50, 0.055, 1.12, (gx, 0.245, z + 0.60))
            z += 1.2
    # 车辙
    for xx in (-1.65, 1.65):
        w.add(g, "mud_track", plane_xz(0.42, STREET_LEN - 4, y=0.012,
                                       center=(xx, STREET_LEN / 2), tile=TILE["mud_track"]))
    # 修补砖块
    for _ in range(16):
        xx = rng.uniform(-4.0, 4.0)
        zz = rng.uniform(4, STREET_LEN - 4)
        w.add(g, "grey_brick", plane_xz(rng.uniform(0.7, 1.6), rng.uniform(0.6, 1.3),
                                        y=0.016, center=(xx, zz), tile=TILE["grey_brick"]))
    # 积水
    for j in range(7):
        xx = rng.uniform(-3.6, 3.6)
        zz = rng.uniform(6, STREET_LEN - 6)
        w.add(g, "water_puddle", plane_xz(rng.uniform(0.8, 2.0), rng.uniform(1.0, 2.6),
                                          y=0.020, center=(xx, zz), tile=TILE["water_puddle"]))
    # 污渍贴花
    for j in range(12):
        xx = rng.uniform(-6.5, 6.5)
        zz = rng.uniform(3, STREET_LEN - 3)
        s = rng.uniform(1.0, 2.4)
        w.add(g, "grime", plane_xz(s, s * rng.uniform(0.7, 1.4), y=0.024,
                                   center=(xx, zz), tile=s))
    # 苔藓（沟边）
    for j in range(10):
        zz = rng.uniform(3, STREET_LEN - 3)
        side = rng.choice([-1, 1])
        w.add(g, "moss", plane_xz(0.35, rng.uniform(0.5, 1.4), y=0.255,
                                  center=(side * (HALF_ROAD + 0.34), zz), tile=TILE["moss"]))


# ---------------------------------------------------------------- 市井道具
def add_jar(w, g, x, y, z, scl, rng):
    prof = [(0.10, 0), (0.20, 0.02), (0.30, 0.12), (0.33, 0.28),
            (0.27, 0.44), (0.18, 0.52), (0.17, 0.58), (0.21, 0.60)]
    w.add(g, "pottery", lathe(prof, seg=12, tile=TILE["pottery"]),
          xf(t=(x, y, z), s=(scl, scl, scl)))
    if rng.random() < 0.5:
        C(w, g, "pottery", 0.19 * scl, 0.04, (x, y + 0.61 * scl, z), seg=12)


def add_basket(w, g, x, y, z, scl):
    C(w, g, "bamboo_weave", 0.32 * scl, 0.42 * scl, (x, y + 0.21 * scl, z),
      seg=14, r2=0.38 * scl)
    C(w, g, "bamboo_weave", 0.30 * scl, 0.03, (x, y + 0.02, z), seg=14)


def add_sack(w, g, x, y, z, scl):
    prof = [(0.18, 0), (0.30, 0.06), (0.34, 0.22), (0.30, 0.40),
            (0.14, 0.50), (0.10, 0.56)]
    w.add(g, "sackcloth", lathe(prof, seg=12, tile=TILE["sackcloth"]),
          xf(t=(x, y, z), s=(scl, scl * 0.9, scl)))


def add_stall(w, g, x, z, rng):
    B(w, g, "wood_plank", 1.85, 0.11, 2.45, (x, 1.05, z))
    for dx in (-0.82, 0.82):
        for dz in (-1.10, 1.10):
            B(w, g, "wood_plank", 0.09, 1.90, 0.09, (x + dx, 0.95, z + dz))
    B(w, g, "timber_beam", 0.08, 0.08, 2.55, (x, 1.90, z - 1.12))
    B(w, g, "timber_beam", 0.08, 0.08, 2.55, (x, 2.18, z + 1.12))
    # 斜顶布棚
    w.add(g, "sackcloth", upward_quad(
        (x - 1.05, 1.90, z - 1.35), (x + 1.05, 1.90, z - 1.35),
        (x + 1.05, 2.18, z + 1.35), (x - 1.05, 2.18, z + 1.35), tile=TILE["sackcloth"]))
    # 货物
    for k in range(3):
        add_jar(w, g, x + rng.uniform(-0.65, 0.65), 1.11,
                z + rng.uniform(-0.9, 0.9), rng.uniform(0.42, 0.62), rng)
    add_basket(w, g, x - 0.55, 1.11, z - 0.75, 0.8)
    add_basket(w, g, x + 0.5, 1.11, z + 0.6, 0.7)
    add_sack(w, g, x + rng.uniform(-0.5, 0.5), 1.11, z + 0.1, 0.7)


def add_well(w, g, x, z):
    prof = [(0.85, 0), (1.08, 0), (1.08, 0.52), (0.85, 0.52), (0.85, 0)]
    w.add(g, "stone_base", lathe(prof, seg=20, tile=TILE["stone_base"]),
          xf(t=(x, 0.18, z)))
    w.add(g, "water_puddle", cylinder(0.83, 0.02, seg=20, tile=TILE["water_puddle"]),
          xf(t=(x, 0.44, z)))
    for dx in (-0.95, 0.95):
        B(w, g, "timber_beam", 0.14, 2.05, 0.14, (x + dx, 1.25, z))
    B(w, g, "timber_beam", 0.16, 0.16, 2.2, (x, 2.24, z))
    w.add(g, "timber_beam", cylinder(0.17, 1.85, seg=12, tile=TILE["timber_beam"]),
          xf(t=(x, 1.95, z), rz=math.pi / 2))
    C(w, g, "timber_beam", 0.012, 1.15, (x, 1.38, z), seg=6)
    add_jar(w, g, x + 0.35, 0.18, z + 1.35, 0.55, random.Random(3))
    C(w, g, "bamboo_weave", 0.28, 0.34, (x - 0.4, 0.35, z + 1.45), seg=12)


def add_tree(w, g, x, z, rng):
    C(w, g, "tree_bark", 0.30, 3.60, (x, 0.18 + 1.80, z), seg=12, r2=0.20)
    for k in range(5):
        a = 2 * math.pi * k / 5 + rng.uniform(-0.3, 0.3)
        dx, dz = math.cos(a), math.sin(a)
        M = xf(t=(x + dx * 0.55, 3.55, z + dz * 0.55),
               rx=dz * 0.62, rz=-dx * 0.62)
        w.add(g, "tree_bark", cylinder(0.09, 1.55, seg=8, tile=TILE["tree_bark"]), M)
    for k in range(14):
        a = rng.uniform(0, 2 * math.pi)
        rad = rng.uniform(0.4, 1.9)
        cy = rng.uniform(3.9, 5.5)
        sz = rng.uniform(1.5, 2.6)
        w.add(g, "leaf_atlas", billboard(x + math.cos(a) * rad, cy,
              z + math.sin(a) * rad, sz, sz * 0.85, a + math.pi / 2))
    # 树池
    B(w, g, "stone_curb", 1.5, 0.20, 1.5, (x, 0.28, z))


def add_hitching_post(w, g, x, z):
    B(w, g, "stone_base", 0.30, 0.22, 0.30, (x, 0.29, z))
    C(w, g, "stone_base", 0.115, 1.05, (x, 0.92, z), seg=8)
    B(w, g, "stone_base", 0.28, 0.16, 0.20, (x, 1.50, z))
    C(w, g, "gilt_bronze", 0.055, 0.22, (x, 1.66, z), seg=8)


def add_stone_lantern(w, g, x, z):
    C(w, g, "stone_base", 0.32, 0.24, (x, 0.30, z), seg=8)
    C(w, g, "stone_base", 0.12, 1.10, (x, 0.97, z), seg=8)
    B(w, g, "stone_base", 0.60, 0.10, 0.60, (x, 1.57, z))
    for dx in (-0.24, 0.24):
        for dz in (-0.24, 0.24):
            B(w, g, "stone_base", 0.07, 0.46, 0.07, (x + dx, 1.85, z + dz))
    B(w, g, "lantern_silk", 0.44, 0.42, 0.44, (x, 1.85, z))
    B(w, g, "stone_base", 0.72, 0.12, 0.72, (x, 2.12, z))
    w.add(g, "stone_base", cylinder(0.30, 0.28, seg=8, tile=TILE["stone_base"]),
          xf(t=(x, 2.30, z), rz=math.pi / 4))
    C(w, g, "gilt_bronze", 0.07, 0.16, (x, 2.52, z), seg=8)


def add_flag(w, g, x, z, side):
    C(w, g, "timber_beam", 0.055, 4.20, (x, 2.10, z), seg=8)
    C(w, g, "gilt_bronze", 0.09, 0.16, (x, 4.28, z), seg=8)
    u0, v0, u1, v1 = atlas_uv(3)
    w.add(g, "ochre_banner", billboard(x + 0.55, 3.55, z, 1.35, 1.05, 0.0))
    w.add(g, "ochre_banner", billboard(x + 0.55, 3.55, z, 1.35, 1.05, math.pi / 2))


def add_crates(w, g, x, z, rng):
    for k in range(rng.randint(2, 4)):
        dx, dz = rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6)
        s = rng.uniform(0.45, 0.75)
        B(w, g, "wood_plank", s, s * 0.7, s * 0.9, (x + dx, 0.18 + s * 0.35, z + dz))
        if rng.random() < 0.5:
            add_jar(w, g, x + dx, 0.18 + s * 0.7, z + dz, 0.45, rng)


def add_props(w, rng):
    for side in (-1, 1):
        zone = "North" if side < 0 else "South"
        for i in range(6):
            z = 12 + i * 19 + rng.uniform(-3, 3)
            x = side * (HALF_ROAD + 1.25)
            add_stall(w, "%s/Props/Stall_%02d" % (zone, i), x, z, rng)
        for i in range(4):
            z = 18 + i * 28 + rng.uniform(-5, 5)
            x = side * (EDGE - 0.45)
            add_tree(w, "%s/Vegetation/Locust_%02d" % (zone, i), x, z, rng)
        for i in range(5):
            z = 9 + i * 24
            add_hitching_post(w, "%s/Fixtures/Hitching_%02d" % (zone, i),
                              side * (EDGE - 0.25), z)
        for i in range(3):
            z = 25 + i * 36
            add_stone_lantern(w, "%s/Fixtures/StoneLantern_%02d" % (zone, i),
                              side * (EDGE - 0.5), z)
        for i in range(2):
            z = 34 + i * 55
            add_crates(w, "%s/Props/Crates_%02d" % (zone, i),
                       side * (EDGE - 0.9), z, rng)
        add_flag(w, "%s/Fixtures/Flag_%s" % (zone, "N" if side < 0 else "S"),
                 side * (EDGE - 0.7), 62 + (0 if side < 0 else 12), side)
    add_well(w, "Fixtures/Well_01", -(EDGE - 0.9), 47.0)
    # 香炉
    g = "Fixtures/Incense_01"
    prof = [(0.20, 0), (0.32, 0.06), (0.36, 0.24), (0.30, 0.38), (0.34, 0.42)]
    w.add(g, "gilt_bronze", lathe(prof, seg=14, tile=TILE["gilt_bronze"]),
          xf(t=(0.0, 0.18, 70.0)))
    for dx in (-0.22, 0.22):
        C(w, g, "gilt_bronze", 0.035, 0.30, (dx, 0.42, 70.0), seg=8)


# ---------------------------------------------------------------- 远景城楼
def add_gate_tower(w):
    g = "Landmark/CityGate"
    z = 141.0
    for px in (-10.5, -3.5, 3.5, 10.5):
        B(w, g, "grey_brick_wall", 4.2, 6.2, 6.0, (px, 3.10, z))
        B(w, g, "stone_base", 4.5, 0.45, 6.3, (px, 0.22, z))
    B(w, g, "rammed_earth_wall", 27.0, 1.9, 6.2, (0, 7.15, z))
    B(w, g, "grey_brick_wall", 27.4, 0.55, 6.6, (0, 8.35, z))
    # 门楣
    for px in (-7.0, 0.0, 7.0):
        B(w, g, "timber_beam", 3.0, 0.30, 0.30, (px, 5.90, z - 3.05))
    # 城楼柱网
    for k in range(7):
        px = -9 + k * 3.0
        C(w, g, "vermilion_lacquer", 0.22, 3.30, (px, 8.62 + 1.65, z), seg=12)
    B(w, g, "painted_dougong", 0.30, 0.30, 20.0, (0, 12.10, z))
    B(w, g, "rammed_earth_wall", 19.0, 3.0, 4.2, (0, 10.60, z))
    # 城楼屋面（沿 z 双坡，屋脊沿 x）
    for sz in (-1, 1):
        za, zb = z - 3.0, z + 3.0
        ey, ry = 12.25, 14.35
        zedge = z + sz * 3.3
        w.add(g, "roof_tile", upward_quad(
            (-10.5, ry, z), (10.5, ry, z), (10.5, ey, zedge), (-10.5, ey, zedge),
            tile=TILE["roof_tile"]))
    B(w, g, "roof_ridge", 21.5, 0.40, 0.42, (0, 14.55, z))
    for px in (-10.5, 10.5):
        B(w, g, "roof_ridge", 0.55, 0.75, 0.55, (px, 14.95, z))
    # 两侧阙楼
    for px in (-13.5, 13.5):
        B(w, g, "rammed_earth_wall", 3.2, 4.0, 3.2, (px, 2.0, z))
        B(w, g, "roof_ridge", 4.0, 0.35, 4.0, (px, 4.20, z))
    # 远景坊墙
    for side in (-1, 1):
        B(w, g, "rammed_earth_wall", 0.6, 3.2, 22.0,
          (side * 18.0, 1.60, z - 12.0))


# ---------------------------------------------------------------- 灯光
def add_lights(w):
    q = quat_between((0, 0, -1), (-0.55, -0.48, 0.68))
    w.add_light("directional", [1.0, 0.78, 0.48], 2.4,
                "Light_Sun_Dusk", rotation=q)
    for i in range(12):
        z = 9.0 + i * 10.0
        side = -1 if i % 2 == 0 else 1
        w.add_light("point", [1.0, 0.44, 0.18], 2.6,
                    "Light_Lantern_%02d" % i,
                    position=(side * 5.9, 3.30, z))
    w.add_light("point", [1.0, 0.62, 0.30], 1.8, "Light_Well",
                position=(0.0, 2.6, 70.0))


# ---------------------------------------------------------------- 模块导出
def export_modules(rng):
    out = os.path.join(MODELS, "modules")
    os.makedirs(out, exist_ok=True)
    specs = [
        ("lantern", lambda w: add_lantern(w, "Module/Lantern", 0, 0, 0, 1.0)),
        ("stall", lambda w: add_stall(w, "Module/Stall", 0, 0, rng)),
        ("well", lambda w: add_well(w, "Module/Well", 0, 0)),
        ("tree", lambda w: add_tree(w, "Module/LocustTree", 0, 0, rng)),
        ("hitching_post", lambda w: add_hitching_post(w, "Module/HitchingPost", 0, 0)),
        ("stone_lantern", lambda w: add_stone_lantern(w, "Module/StoneLantern", 0, 0)),
        ("shop_3bay", lambda w: build_shop(w, -1, 0, 0.0, 14.4, SHOPS[0], 1,
                                           random.Random(11), module=True)),
    ]
    results = []
    for name, fn in specs:
        w = GLTFWriter(ROOT, model_dir="assets/models/modules", glb_embed_max_px=512)
        register(w, "../../textures/")
        fn(w)
        r = w.write(name)
        results.append({"name": name, "glb": "assets/models/modules/%s.glb" % name,
                        "meshes": r["meshes"], "bin_bytes": r["bin_bytes"]})
        print("  模块:", name, r["meshes"], "meshes")
    with open(os.path.join(out, "modules.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    return results


# ---------------------------------------------------------------- 主流程
def main():
    rng = random.Random(20261107)
    build_signage_atlas()
    w = GLTFWriter(ROOT, model_dir="assets/models")
    register(w)
    print("构建街面 ...")
    add_ground(w, rng)
    print("构建两侧店铺 ...")
    shop_seq = list(SHOPS)
    for side in (-1, 1):
        for i in range(N_PER_SIDE):
            z0 = i * LOT + GAP / 2
            shop = shop_seq[(i + (0 if side < 0 else 7)) % len(shop_seq)]
            if (side, i) in ((1, 3), (-1, 6)):
                shop = None          # 民居/库房，无匾额
            floors = 2 if i in (1, 4, 6) else 1
            build_shop(w, side, i, z0, LOT_W, shop, floors,
                       random.Random(1000 + (0 if side < 0 else 500) + i))
    print("构建市井道具与绿化 ...")
    add_props(w, rng)
    print("构建远景城楼 ...")
    add_gate_tower(w)
    print("布置灯光 ...")
    add_lights(w)
    # 统计
    tri = 0
    vert = 0
    for gname, bymat in w.groups.items():
        for mat, acc in bymat.items():
            for p in acc.parts:
                vert += len(p[0])
                tri += len(p[3])
    w.extras = {"street_length_m": STREET_LEN, "street_width_m": 2 * EDGE,
                "shops": N_PER_SIDE * 2, "triangles": tri, "vertices": vert,
                "semantic_groups": len(w.groups)}
    print("写出 glTF / GLB ...")
    r = w.write("changan_street_01")
    print("导出模块化构件 ...")
    mods = export_modules(rng)
    stats = {
        "version": "1.0",
        "scene": "盛唐长安 · 一条街 (street-01)",
        "dimensions": {"length_m": STREET_LEN, "road_width_m": 2 * HALF_ROAD,
                       "walkway_width_m": WALK_W, "total_width_m": 2 * (EDGE + DEPTH),
                       "eave_height_m": round(EAVE_Y, 2),
                       "ridge_height_m": round(EAVE_Y + RIDGE_H, 2)},
        "counts": {"shops": N_PER_SIDE * 2, "semantic_groups": len(w.groups),
                   "meshes": r["meshes"], "materials": r["materials"],
                   "nodes": r["nodes"], "triangles": tri, "vertices": vert,
                   "texture_files": r["texture_files"]},
        "modules": mods,
        "files": {"gltf": "assets/models/changan_street_01.gltf",
                  "bin": "assets/models/changan_street_01.bin",
                  "glb": "assets/models/changan_street_01.glb"},
    }
    with open(os.path.join(MODELS, "build_stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print("完成: %d 组, %d 三角面, %d 顶点, %d 材质, GLB %.1f MB" %
          (len(w.groups), tri, vert, r["materials"],
           os.path.getsize(r["glb"]) / 1048576))
    return r


if __name__ == "__main__":
    main()
