#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
materials.py — 盛唐长安 street-01 的 28 种 PBR 材质定义
======================================================
每个生成器接收 (n, base_rgb, params, seed)，返回 surf 字典：
  albedo(0..255 RGB) / height(0..255) / roughness / metallic / ao /
  可选 normal / opacity / emissive
高度与粗糙度均含多尺度细节；所有噪声严格周期，四边无缝。
"""
import numpy as np
from texcore import (_f, _u8, fbm, ridged, voronoi, grid_noise, gaussian,
                     smoothstep, ramp, stripes, tint, height_to_normal,
                     height_to_ao, delight)


def shade(base, mod, amount=0.28, dark=None, additive=None):
    a = tint(base, mod, amount).astype(np.float32)
    if dark is not None:
        a *= _f(dark)[:, :, None]
    if additive is not None:
        a += _f(additive)
    return _u8(a)


def _gray01(x):
    return _f(x) / 255.0


# ---------------------------------------------------------------- 砖石 / 铺装
def masonry(n, base, p, seed):
    cells = p.get("cells", 6)
    d1, edge, cid = voronoi(n, n, cells, seed, jitter=p.get("jitter", 0.82))
    rng = np.random.default_rng(seed + 991)
    lut = rng.uniform(0.80, 1.20, cells * cells).astype(np.float32)
    plate_var = lut[cid]
    plate = 1.0 - smoothstep(ramp(d1, 0.20, 0.62))
    fine = fbm(n, n, 48, seed + 3, 5)
    grain = fbm(n, n, 180, seed + 5, 3)
    worn = smoothstep(ramp(d1, 0.30, 0.68))          # 板边磨圆
    moss_field = fbm(n, n, 12, seed + 17, 4)
    moss = smoothstep(ramp(edge * 0.65 + moss_field * 0.55, 0.62, 0.95))
    stain = smoothstep(ramp(fbm(n, n, 6, seed + 29, 4), 0.58, 0.86))
    height = 0.52 + plate * 0.34 + fine * 0.09 + grain * 0.05 - edge * 0.50 - worn * 0.10
    mod = np.clip(plate_var * (0.42 + fine * 0.42 + grain * 0.16), 0, 1)
    dark = np.clip(1.0 - edge * 0.62 - stain * 0.20, 0.25, 1.0)
    alb = shade(base, mod, 0.34, dark)
    # 缝隙苔藓偏绿
    alb = _u8(alb.astype(np.float32) * (1 - moss[:, :, None] * 0.45) +
              np.array([54, 74, 42], np.float32)[None, None, :] * moss[:, :, None] * 0.45)
    rough = _u8(np.clip(178 + (fine - 0.5) * 46 + edge * 52 + moss * 26 - worn * 22, 60, 255))
    ao = _u8(np.clip(255 - edge * 105 - (1 - plate) * 26 - moss * 20, 40, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def brick(n, base, p, seed):
    cols, rows = p.get("cols", 8), p.get("rows", 16)
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    ry = yy / n * rows
    row = np.floor(ry).astype(np.int32)
    u = (ry % 1.0)
    t = ((xx / n * cols + (row % 2) * 0.5) % 1.0)
    jx = np.minimum(t, 1 - t)
    jy = np.minimum(u, 1 - u)
    jw = p.get("joint", 0.055)
    bx = smoothstep(ramp(jx, 0.0, jw))
    by = smoothstep(ramp(jy, 0.0, jw * 1.5))
    brick_mask = bx * by
    cid = (row * cols + np.floor((xx / n * cols + (row % 2) * 0.5)).astype(np.int32)) % (cols * rows * 2)
    rng = np.random.default_rng(seed + 313)
    lut = rng.uniform(0.78, 1.22, cols * rows * 2).astype(np.float32)
    var = lut[cid]
    fine = fbm(n, n, 64, seed + 7, 5)
    grain = fbm(n, n, 200, seed + 9, 3)
    chip = smoothstep(ramp(ridged(n, n, 90, seed + 11, 3), 0.80, 0.97)) * brick_mask
    stain = smoothstep(ramp(fbm(n, n, 5, seed + 23, 4), 0.60, 0.88))
    height = 0.30 + brick_mask * 0.55 + fine * 0.08 - (1 - brick_mask) * 0.02 - chip * 0.14
    mod = np.clip(var * (0.40 + fine * 0.44 + grain * 0.16), 0, 1)
    dark = np.clip(0.36 + brick_mask * 0.64 - stain * 0.16 - chip * 0.12, 0.2, 1.0)
    alb = shade(base, mod, 0.30, dark)
    rough = _u8(np.clip(186 + (fine - 0.5) * 40 + (1 - brick_mask) * 48 - chip * 18, 70, 255))
    ao = _u8(np.clip(150 + brick_mask * 105 - chip * 26, 40, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def rammed_earth(n, base, p, seed):
    layers = p.get("layers", 26)
    yy = np.arange(n, dtype=np.float32)[:, None] / n * layers
    row = np.floor(yy).astype(np.int32)
    rng = np.random.default_rng(seed + 41)
    lut = rng.uniform(0.86, 1.14, layers).astype(np.float32)
    band = lut[np.broadcast_to(row, (n, n))]
    seam = 1 - smoothstep(ramp(np.minimum(yy % 1, 1 - yy % 1), 0.0, 0.09))
    coarse = fbm(n, n, 34, seed + 3, 6)
    pebble = smoothstep(ramp(fbm(n, n, 260, seed + 5, 3), 0.72, 0.93))
    crack = 1 - smoothstep(ramp(ridged(n, n, 16, seed + 13, 4), 0.86, 0.99))
    stain = smoothstep(ramp(fbm(n, n, 5, seed + 21, 4), 0.60, 0.9))
    height = 0.42 + coarse * 0.30 + pebble * 0.16 - seam * 0.16 - crack * 0.10
    mod = np.clip(band * (0.40 + coarse * 0.46 + pebble * 0.14), 0, 1)
    dark = np.clip(1 - seam * 0.24 - crack * 0.18 - stain * 0.16, 0.3, 1)
    alb = shade(base, mod, 0.32, dark)
    rough = _u8(np.clip(214 + (coarse - 0.5) * 30 + pebble * 20, 120, 255))
    ao = _u8(np.clip(246 - seam * 66 - crack * 40 - pebble * 10, 60, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def plaster(n, base, p, seed):
    low = fbm(n, n, 5, seed + 3, 5)
    mid = fbm(n, n, 32, seed + 5, 5)
    fine = fbm(n, n, 160, seed + 7, 4)
    crack_src = ridged(n, n, 11, seed + 17, 4)
    crack = 1 - smoothstep(ramp(crack_src, 0.90, 0.995))
    flake = smoothstep(ramp(fbm(n, n, 9, seed + 23, 4), 0.66, 0.86))
    stain = smoothstep(ramp(fbm(n, n, 4, seed + 31, 4), 0.55, 0.88))
    height = 0.55 + mid * 0.22 + fine * 0.08 - crack * 0.30 - flake * 0.22
    mod = np.clip(0.45 + low * 0.24 + mid * 0.26 + fine * 0.05, 0, 1)
    dark = np.clip(1 - stain * 0.22 - flake * 0.20 - crack * 0.24, 0.3, 1)
    alb = shade(base, mod, 0.22, dark)
    # 剥落处露出土色
    earth = np.array([118, 96, 72], np.float32)
    alb = _u8(alb.astype(np.float32) * (1 - flake[:, :, None] * 0.55) +
              earth[None, None, :] * flake[:, :, None] * 0.55)
    rough = _u8(np.clip(206 + (mid - 0.5) * 28 + flake * 36, 120, 255))
    ao = _u8(np.clip(250 - crack * 90 - flake * 44, 60, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


# ---------------------------------------------------------------- 漆 / 木 / 瓦
def lacquer(n, base, p, seed):
    cells = p.get("cells", 26)
    d1, edge, cid = voronoi(n, n, cells, seed, jitter=0.7)
    crack = smoothstep(ramp(edge, 0.72, 0.96))
    fine = fbm(n, n, 70, seed + 3, 5)
    flake = smoothstep(ramp(fbm(n, n, 7, seed + 11, 5), 0.70, 0.88))
    dust = smoothstep(ramp(fbm(n, n, 4, seed + 19, 4), 0.60, 0.9))
    height = 0.66 + fine * 0.10 - crack * 0.28 - flake * 0.20
    mod = np.clip(0.5 + fine * 0.42 + crack * 0.08, 0, 1)
    dark = np.clip(1 - crack * 0.34 - flake * 0.30 - dust * 0.12, 0.28, 1)
    alb = shade(base, mod, 0.16, dark)
    wood = np.array([96, 68, 46], np.float32)
    alb = _u8(alb.astype(np.float32) * (1 - flake[:, :, None] * 0.62) +
              wood[None, None, :] * flake[:, :, None] * 0.62)
    rough = _u8(np.clip(96 + (fine - 0.5) * 26 + crack * 92 + flake * 100 + dust * 30, 40, 255))
    ao = _u8(np.clip(250 - crack * 74 - flake * 48, 70, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def wood(n, base, p, seed):
    planks = p.get("planks", 6)
    yy = np.arange(n, dtype=np.float32)[:, None] / n
    xx = np.arange(n, dtype=np.float32)[None, :] / n
    warp = (fbm(n, n, 7, seed + 3, 5) - 0.5) * 0.055
    rings = np.sin((yy + warp) * np.pi * 2 * p.get("rings", 26)) * 0.5 + 0.5
    rings = rings * (0.55 + 0.45 * fbm(n, n, 40, seed + 5, 4))
    fine = fbm(n, n, 180, seed + 7, 3)
    # 节疤
    knot = np.zeros((n, n), np.float32)
    rng = np.random.default_rng(seed + 61)
    for _ in range(p.get("knots", 3)):
        kx, ky = rng.uniform(0.1, 0.9, 2)
        r = np.sqrt(((xx - kx) * 1.7) ** 2 + (yy - ky) ** 2)
        knot += np.exp(-r * 26) * (0.6 + 0.4 * np.sin(r * 90))
    knot = np.clip(knot, 0, 1)
    seam = np.zeros((n, n), np.float32)
    if planks > 0:
        t = ((xx * planks) % 1.0)
        seam = 1 - smoothstep(ramp(np.minimum(t, 1 - t), 0.0, 0.022))
    grain = np.clip(rings * 0.62 + fine * 0.24 + knot * 0.30, 0, 1)
    height = 0.48 + grain * 0.30 - seam * 0.36 - knot * 0.12
    mod = np.clip(0.34 + grain * 0.62, 0, 1)
    dark = np.clip(1 - seam * 0.62 - knot * 0.18, 0.2, 1)
    alb = shade(base, mod, 0.40, dark)
    rough = _u8(np.clip(168 + (fine - 0.5) * 44 + seam * 60 + knot * 26, 70, 255))
    ao = _u8(np.clip(246 - seam * 110 - knot * 30, 50, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def roof_tile(n, base, p, seed):
    cols = p.get("cols", 10)
    rows = p.get("rows", 8)
    xx = np.arange(n, dtype=np.float32)[None, :] / n
    yy = np.arange(n, dtype=np.float32)[:, None] / n
    t = (xx * cols) % 1.0
    arc = np.sqrt(np.clip(1 - (2 * t - 1) ** 2, 0, 1))       # 半圆瓦垄
    lap = ((yy * rows) % 1.0)
    lap_seam = 1 - smoothstep(ramp(np.minimum(lap, 1 - lap), 0.0, 0.055))
    valley = 1 - smoothstep(ramp(np.minimum(t, 1 - t), 0.0, 0.035))
    coarse = fbm(n, n, 26, seed + 3, 5)
    fine = fbm(n, n, 130, seed + 5, 4)
    # 沿 y 拉伸的雨痕
    streak = fbm(n, n, 12, seed + 9, 4)
    streak = np.repeat(streak[::8, :], 8, axis=0)[:n, :]
    lichen = smoothstep(ramp(fbm(n, n, 16, seed + 17, 4) * 0.65 + coarse * 0.5, 0.62, 0.92))
    height = 0.30 + arc * 0.60 + coarse * 0.06 - lap_seam * 0.26 - valley * 0.30
    mod = np.clip(0.42 + arc * 0.26 + coarse * 0.26 + fine * 0.08, 0, 1)
    dark = np.clip(0.52 + arc * 0.48 - lap_seam * 0.34 - valley * 0.28 - streak * 0.12, 0.2, 1)
    alb = shade(base, mod, 0.26, dark)
    alb = _u8(alb.astype(np.float32) * (1 - lichen[:, :, None] * 0.35) +
              np.array([96, 108, 74], np.float32)[None, None, :] * lichen[:, :, None] * 0.35)
    rough = _u8(np.clip(190 + (coarse - 0.5) * 36 + lichen * 34 + lap_seam * 30, 90, 255))
    ao = _u8(np.clip(170 + arc * 85 - lap_seam * 60 - valley * 46, 50, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def polychrome(n, base, p, seed):
    """青绿彩画：底青绿 + 朱红边框 + 金色卷草纹 + 剥落"""
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n
    low = fbm(n, n, 8, seed + 3, 5)
    fine = fbm(n, n, 110, seed + 5, 4)
    # 卷草纹：正弦波带 + 圆点
    wave = np.sin((xx * 6 + yy * 2.5) * np.pi * 2) * 0.5 + 0.5
    gold = smoothstep(ramp(wave, 0.82, 0.95)) * 0.8
    band = np.zeros((n, n), np.float32)
    band[np.logical_or((yy % 0.5) < 0.035, (yy % 0.5) > 0.465)] = 1.0
    red_band = band * smoothstep(ramp(low, 0.25, 0.7))
    peel = smoothstep(ramp(fbm(n, n, 10, seed + 17, 5), 0.64, 0.86))
    crack = 1 - smoothstep(ramp(ridged(n, n, 20, seed + 23, 3), 0.90, 0.99))
    height = 0.56 + gold * 0.16 + fine * 0.08 - peel * 0.26 - crack * 0.14
    alb = tint(base, low * 0.55 + fine * 0.3, 0.30).astype(np.float32)
    gold_c = np.array([186, 148, 74], np.float32)[None, None, :]
    red_c = np.array([126, 42, 32], np.float32)[None, None, :]
    wood_c = np.array([92, 66, 46], np.float32)[None, None, :]
    alb = alb * (1 - gold[:, :, None] * 0.8) + gold_c * gold[:, :, None] * 0.8
    alb = alb * (1 - red_band[:, :, None] * 0.75) + red_c * red_band[:, :, None] * 0.75
    alb = alb * (1 - peel[:, :, None] * 0.72) + wood_c * peel[:, :, None] * 0.72
    alb *= (1 - crack[:, :, None] * 0.30)
    rough = _u8(np.clip(128 + (fine - 0.5) * 40 + peel * 96 - gold * 30, 50, 255))
    ao = _u8(np.clip(244 - crack * 60 - peel * 50, 70, 255))
    return dict(albedo=_u8(alb), height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=_u8(gold * 90), ao=ao)


def metal(n, base, p, seed):
    low = fbm(n, n, 9, seed + 3, 5)
    fine = fbm(n, n, 150, seed + 5, 4)
    scratch = 1 - smoothstep(ramp(ridged(n, n, 90, seed + 11, 3), 0.88, 0.995))
    patina = smoothstep(ramp(fbm(n, n, 7, seed + 19, 5) * 0.7 + low * 0.4, 0.55, 0.82))
    tarnish = smoothstep(ramp(low, 0.60, 0.9))
    height = 0.58 + fine * 0.10 - scratch * 0.16 + patina * 0.06
    alb = tint(base, low * 0.5 + fine * 0.4, 0.28).astype(np.float32)
    green = np.array([64, 118, 104], np.float32)[None, None, :]
    alb = alb * (1 - patina[:, :, None] * 0.72) + green * patina[:, :, None] * 0.72
    alb *= (1 - tarnish[:, :, None] * 0.30 + scratch[:, :, None] * 0.22)
    rough = _u8(np.clip(78 + (fine - 0.5) * 34 + patina * 130 + scratch * 46 + tarnish * 34, 30, 255))
    metal_v = _u8(np.clip(224 - patina * 190 - tarnish * 40, 0, 255))
    ao = _u8(np.clip(250 - scratch * 46 - patina * 26, 90, 255))
    return dict(albedo=_u8(alb), height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=metal_v, ao=ao)


def stone(n, base, p, seed):
    low = fbm(n, n, 7, seed + 3, 5)
    mid = fbm(n, n, 48, seed + 5, 5)
    fine = fbm(n, n, 190, seed + 7, 3)
    vein = 1 - smoothstep(ramp(ridged(n, n, 14, seed + 13, 4), 0.84, 0.99))
    chip = smoothstep(ramp(fbm(n, n, 30, seed + 21, 4), 0.72, 0.92))
    height = 0.52 + mid * 0.26 + fine * 0.06 - vein * 0.16 - chip * 0.14
    mod = np.clip(0.40 + low * 0.22 + mid * 0.34 + fine * 0.06, 0, 1)
    dark = np.clip(1 - vein * 0.22 - chip * 0.18, 0.3, 1)
    alb = shade(base, mod, 0.28, dark)
    rough = _u8(np.clip(184 + (mid - 0.5) * 40 + chip * 30, 90, 255))
    ao = _u8(np.clip(248 - vein * 56 - chip * 30, 70, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


# ---------------------------------------------------------------- 织物 / 自然
def cloth(n, base, p, seed):
    freq = p.get("freq", 190)
    xx = np.arange(n, dtype=np.float32)[None, :] / n
    yy = np.arange(n, dtype=np.float32)[:, None] / n
    warp = np.sin(xx * np.pi * 2 * freq) * 0.5 + 0.5
    weft = np.sin(yy * np.pi * 2 * freq) * 0.5 + 0.5
    weave = warp * 0.5 + weft * 0.5
    low = fbm(n, n, 5, seed + 3, 5)
    fade = smoothstep(ramp(low, 0.35, 0.85))
    fold = np.sin(yy * np.pi * 2 * p.get("folds", 5) + low * 2.5) * 0.5 + 0.5
    dirt = smoothstep(ramp(fbm(n, n, 12, seed + 11, 4), 0.62, 0.9))
    rib = np.zeros((n, n), np.float32)
    if p.get("ribs", 0):
        t = (yy * p["ribs"]) % 1.0
        rib = 1 - smoothstep(ramp(np.minimum(t, 1 - t), 0.0, 0.035))
    height = 0.46 + weave * 0.22 + fold * 0.12 - rib * 0.24
    mod = np.clip(0.40 + weave * 0.30 + low * 0.22 + fold * 0.10, 0, 1)
    dark = np.clip(1 - dirt * 0.22 - rib * 0.30 - fade * 0.14, 0.3, 1)
    alb = shade(base, mod, p.get("amount", 0.22), dark)
    rough = _u8(np.clip(214 + (weave - 0.5) * 24 + dirt * 22, 140, 255))
    ao = _u8(np.clip(250 - rib * 70 - fold * 18, 90, 255))
    out = dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
               roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)
    if p.get("emissive"):
        glow = np.clip(0.35 + fold * 0.35 + (1 - rib) * 0.30, 0, 1)
        out["emissive"] = _u8(np.stack([glow * 255, glow * 168, glow * 78], axis=-1))
    return out


def weave(n, base, p, seed):
    # cells 必须整除 n，且为偶数，保证奇偶交织在周期边界自然衔接
    cells = p.get("cells", 16)
    xx = np.arange(n, dtype=np.float32)[None, :] / n * cells
    yy = np.arange(n, dtype=np.float32)[:, None] / n * cells
    u, v = xx % 1.0, yy % 1.0
    # 经纬带在每个格边界均为 0，因此跨格/跨图幅严格连续
    a = np.sin(v * np.pi) ** 2
    b = np.sin(u * np.pi) ** 2
    over = ((np.floor(xx).astype(np.int32) + np.floor(yy).astype(np.int32)) % 2)
    strip = np.where(np.broadcast_to(over, (n, n)) == 0, a, b)
    fine = fbm(n, n, 120, seed + 3, 4)
    low = fbm(n, n, 8, seed + 7, 4)
    height = 0.34 + strip * 0.56 + fine * 0.06
    mod = np.clip(0.38 + strip * 0.42 + low * 0.20, 0, 1)
    alb = shade(base, mod, 0.34, np.clip(0.62 + strip * 0.38, 0, 1))
    rough = _u8(np.clip(198 + (fine - 0.5) * 36, 120, 255))
    ao = _u8(np.clip(160 + strip * 95, 60, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def pottery(n, base, p, seed):
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n
    r = np.sqrt((xx - 0.5) ** 2 + (yy - 0.5) ** 2)
    wheel = np.sin(r * np.pi * 2 * p.get("rings", 38)) * 0.5 + 0.5
    low = fbm(n, n, 9, seed + 3, 5)
    fine = fbm(n, n, 140, seed + 5, 4)
    glaze = smoothstep(ramp(fbm(n, n, 6, seed + 11, 5), 0.52, 0.80))
    pit = smoothstep(ramp(fbm(n, n, 90, seed + 17, 3), 0.72, 0.94))
    height = 0.48 + wheel * 0.12 + low * 0.22 - pit * 0.16 + glaze * 0.05
    mod = np.clip(0.36 + low * 0.36 + wheel * 0.16 + fine * 0.12, 0, 1)
    dark = np.clip(1 - pit * 0.22 - glaze * 0.12, 0.3, 1)
    alb = shade(base, mod, 0.32, dark)
    gloss = np.array([74, 96, 82], np.float32)[None, None, :]
    alb = _u8(alb.astype(np.float32) * (1 - glaze[:, :, None] * 0.38) +
              gloss * glaze[:, :, None] * 0.38)
    rough = _u8(np.clip(196 + (fine - 0.5) * 40 + pit * 34 - glaze * 72, 40, 255))
    ao = _u8(np.clip(246 - pit * 50 - wheel * 14, 80, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def bark(n, base, p, seed):
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n
    # 竖向沟壑：x 方向高频，y 方向低频拉伸
    ridge = ridged(n, n, 34, seed + 3, 4)
    ridge = np.repeat(ridge[::6, :], 6, axis=0)[:n, :]
    warp = (fbm(n, n, 6, seed + 7, 4) - 0.5) * 0.12
    furrow = 1 - smoothstep(ramp(ridge + warp, 0.42, 0.86))
    fine = fbm(n, n, 160, seed + 11, 4)
    lichen = smoothstep(ramp(fbm(n, n, 14, seed + 17, 4), 0.66, 0.9))
    height = 0.40 + (1 - furrow) * 0.46 + fine * 0.08
    mod = np.clip(0.30 + (1 - furrow) * 0.50 + fine * 0.20, 0, 1)
    dark = np.clip(0.34 + (1 - furrow) * 0.66, 0.2, 1)
    alb = shade(base, mod, 0.36, dark)
    alb = _u8(alb.astype(np.float32) * (1 - lichen[:, :, None] * 0.32) +
              np.array([112, 124, 88], np.float32)[None, None, :] * lichen[:, :, None] * 0.32)
    rough = _u8(np.clip(214 + (fine - 0.5) * 30 + furrow * 24, 130, 255))
    ao = _u8(np.clip(140 + (1 - furrow) * 115, 50, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def moss_surface(n, base, p, seed):
    clump = fbm(n, n, 14, seed + 3, 6)
    fine = fbm(n, n, 180, seed + 5, 4)
    speck = smoothstep(ramp(fbm(n, n, 260, seed + 7, 3), 0.62, 0.9))
    height = 0.28 + clump * 0.46 + fine * 0.16 + speck * 0.12
    mod = np.clip(0.28 + clump * 0.48 + fine * 0.24, 0, 1)
    alb = shade(base, mod, 0.42)
    rough = _u8(np.clip(226 + (fine - 0.5) * 26, 160, 255))
    ao = _u8(np.clip(150 + clump * 105, 60, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


def water(n, base, p, seed):
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n
    w = (np.sin((xx * 9 + yy * 4) * np.pi * 2) +
         np.sin((xx * 3 - yy * 11) * np.pi * 2) * 0.7 +
         (fbm(n, n, 18, seed + 3, 4) - 0.5) * 2.2)
    h = 0.5 + w * 0.06
    alb = tint(base, fbm(n, n, 7, seed + 9, 4), 0.16).astype(np.float32)
    alb *= 0.86
    return dict(albedo=_u8(alb), height=_u8(np.clip(h, 0, 1) * 255),
                roughness=_u8(np.clip(34 + (fbm(n, n, 24, seed + 13, 3) - 0.5) * 30, 8, 80)),
                metallic=np.zeros((n, n), np.uint8),
                ao=np.full((n, n), 245, np.uint8),
                normal=height_to_normal(_u8(np.clip(h, 0, 1) * 255), strength=6.0))


def leaf_atlas(n, base, p, seed):
    """叶片图集：多枚带叶脉的椭圆叶，alpha 控制透明"""
    import cv2
    alb = np.zeros((n, n, 3), np.float32)
    alpha = np.zeros((n, n), np.float32)
    height = np.full((n, n), 0.10, np.float32)
    rng = np.random.default_rng(seed)
    cols = rows = p.get("grid", 4)
    cell = n // cols
    for gy in range(rows):
        for gx in range(cols):
            cx = int((gx + 0.5) * cell + rng.uniform(-cell * 0.08, cell * 0.08))
            cy = int((gy + 0.5) * cell + rng.uniform(-cell * 0.08, cell * 0.08))
            L = int(cell * rng.uniform(0.34, 0.44))
            W = int(cell * rng.uniform(0.13, 0.19))
            ang = rng.uniform(-35, 35)
            layer = np.zeros((n, n), np.uint8)
            cv2.ellipse(layer, (cx, cy), (L, W), ang, 0, 360, 255, -1)
            m = layer.astype(np.float32) / 255.0
            # 叶脉：沿主轴的高亮细线
            vein = np.zeros((n, n), np.float32)
            cv2.line(vein, (cx - int(L * 0.85 * np.cos(np.deg2rad(ang))),
                            cy - int(L * 0.85 * np.sin(np.deg2rad(ang)))),
                     (cx + int(L * 0.85 * np.cos(np.deg2rad(ang))),
                      cy + int(L * 0.85 * np.sin(np.deg2rad(ang)))), 1.0, 2)
            fine = fbm(n, n, 90, seed + gx * 17 + gy * 71, 4)
            tint_v = np.clip(0.62 + fine * 0.48 + vein * 0.32, 0, 1.2)
            col = np.array(base, np.float32) * rng.uniform(0.78, 1.24)
            alb += m[:, :, None] * col[None, None, :] * tint_v[:, :, None]
            alpha = np.maximum(alpha, m * (0.90 + fine * 0.10))
            height += m * (0.30 + vein * 0.30)
    np.clip(alb, 0, 255, out=alb)
    rough = _u8(np.clip(196 - alpha * 42, 60, 255))
    return dict(albedo=_u8(alb), height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8),
                ao=np.full((n, n), 238, np.uint8),
                opacity=_u8(alpha * 255))


def grime(n, base, p, seed):
    low = fbm(n, n, 6, seed + 3, 6)
    mid = fbm(n, n, 30, seed + 5, 4)
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n
    rad = np.clip(1 - np.sqrt((xx - .5) ** 2 + (yy - .5) ** 2) * 1.7, 0, 1)
    a = smoothstep(ramp(low * 0.62 + mid * 0.38, 0.46, 0.78)) * rad
    alb = shade(base, mid, 0.22)
    return dict(albedo=alb, height=_u8(np.clip(0.35 + mid * 0.3, 0, 1) * 255),
                roughness=_u8(np.clip(226 + (mid - .5) * 22, 150, 255)),
                metallic=np.zeros((n, n), np.uint8),
                ao=np.full((n, n), 250, np.uint8), opacity=_u8(a * 235))


def tile_end(n, base, p, seed):
    """圆形瓦当：外圈 + 云纹/莲瓣 + 中心乳钉"""
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / n - 0.5
    r = np.sqrt(xx ** 2 + yy ** 2)
    ang = np.arctan2(yy, xx)
    ring = smoothstep(ramp(r, 0.30, 0.33)) * (1 - smoothstep(ramp(r, 0.44, 0.47)))
    petals = np.sin(ang * 8 + r * 12) * 0.5 + 0.5
    boss = 1 - smoothstep(ramp(r, 0.0, 0.12))
    rim = smoothstep(ramp(r, 0.40, 0.43)) * (1 - smoothstep(ramp(r, 0.47, 0.5)))
    coarse = fbm(n, n, 22, seed + 3, 5)
    fine = fbm(n, n, 140, seed + 5, 3)
    chip = smoothstep(ramp(fbm(n, n, 60, seed + 9, 4), 0.70, 0.92))
    disc = 1 - smoothstep(ramp(r, 0.47, 0.5))
    height = 0.34 + disc * 0.30 + rim * 0.24 + ring * 0.12 + boss * 0.28 + petals * 0.06 - chip * 0.16
    mod = np.clip(0.36 + coarse * 0.34 + fine * 0.12 + petals * 0.16, 0, 1)
    dark = np.clip(0.55 + disc * 0.45 - chip * 0.24 + rim * 0.10, 0.2, 1)
    alb = shade(base, mod, 0.26, dark)
    rough = _u8(np.clip(196 + (coarse - .5) * 34 + chip * 30, 120, 255))
    ao = _u8(np.clip(150 + disc * 105 - chip * 34, 50, 255))
    return dict(albedo=alb, height=_u8(np.clip(height, 0, 1) * 255),
                roughness=rough, metallic=np.zeros((n, n), np.uint8), ao=ao)


# ---------------------------------------------------------------- 注册表
GENERATORS = {
    "masonry": masonry, "brick": brick, "rammed_earth": rammed_earth,
    "plaster": plaster, "lacquer": lacquer, "wood": wood,
    "roof_tile": roof_tile, "polychrome": polychrome, "metal": metal,
    "stone": stone, "cloth": cloth, "weave": weave, "pottery": pottery,
    "bark": bark, "moss": moss_surface, "water": water,
    "leaf_atlas": leaf_atlas, "grime": grime, "tile_end": tile_end,
}
