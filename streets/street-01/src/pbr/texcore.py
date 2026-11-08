#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
texcore.py — 无缝程序化 PBR 贴图生成核心
==================================================
所有噪声均为严格周期（四边无缝平铺），可复现（固定 seed）。
输出通道统一为 uint8 PNG：albedo(sRGB) / normal(linear,OpenGL +Y) /
roughness / metallic / ao / height / orm(R=AO,G=Rough,B=Metal) /
按需 opacity、emissive。
"""
import os
import json
import numpy as np
from scipy import ndimage
from PIL import Image

# ----------------------------------------------------------------------------
# 基础工具
# ----------------------------------------------------------------------------

def _u8(x):
    return np.clip(x, 0, 255).astype(np.uint8)


def _f(x):
    return np.asarray(x, dtype=np.float32)


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def grid_noise(h, w, cells, seed):
    """严格周期的 value noise（双线性 + smoothstep），返回 0..1"""
    rng = np.random.default_rng(seed)
    g = rng.random((cells, cells)).astype(np.float32)
    xs = (np.arange(w, dtype=np.float32) + 0.5) * cells / w
    ys = (np.arange(h, dtype=np.float32) + 0.5) * cells / h
    x0 = np.floor(xs).astype(np.int32)
    y0 = np.floor(ys).astype(np.int32)
    fx = smoothstep(xs - x0)[None, :]
    fy = smoothstep(ys - y0)[:, None]
    x0m, x1m = x0 % cells, (x0 + 1) % cells
    y0m, y1m = y0 % cells, (y0 + 1) % cells
    a = g[y0m[:, None], x0m[None, :]]
    b = g[y0m[:, None], x1m[None, :]]
    c = g[y1m[:, None], x0m[None, :]]
    d = g[y1m[:, None], x1m[None, :]]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def fbm(h, w, cells, seed, octaves=5, gain=0.5, lacunarity=2.0):
    """分形布朗运动，严格周期，返回 0..1"""
    total = np.zeros((h, w), np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        total += grid_noise(h, w, int(cells * lacunarity ** o), seed + o * 1013) * amp
        norm += amp
        amp *= gain
    return total / norm


def ridged(h, w, cells, seed, octaves=4):
    """脊状噪声，用于裂纹、木纹、石纹"""
    n = fbm(h, w, cells, seed, octaves)
    return 1.0 - np.abs(n * 2.0 - 1.0)


def voronoi(h, w, cells, seed, jitter=0.9):
    """周期 Voronoi。返回 d1(最近距离), edge(边界强度 0..1), cell_id"""
    rng = np.random.default_rng(seed)
    pts = rng.random((cells, cells, 2)).astype(np.float32)
    pts = 0.5 + (pts - 0.5) * jitter
    xs = (np.arange(w, dtype=np.float32) + 0.5) * cells / w
    ys = (np.arange(h, dtype=np.float32) + 0.5) * cells / h
    gx = np.broadcast_to(xs[None, :], (h, w))
    gy = np.broadcast_to(ys[:, None], (h, w))
    ci = np.floor(gx).astype(np.int32)
    cj = np.floor(gy).astype(np.int32)
    d1 = np.full((h, w), 1e9, np.float32)
    d2 = np.full((h, w), 1e9, np.float32)
    cid = np.zeros((h, w), np.int32)
    for dj in (-1, 0, 1):
        for di in (-1, 0, 1):
            ni = (ci + di) % cells
            nj = (cj + dj) % cells
            px = (ci + di) + pts[nj, ni, 0]
            py = (cj + dj) + pts[nj, ni, 1]
            d = (gx - px) ** 2 + (gy - py) ** 2
            mask = d < d1
            d2 = np.where(mask, d1, np.minimum(d2, d))
            cid = np.where(mask, nj * cells + ni, cid)
            d1 = np.where(mask, d, np.minimum(d1, d))
    d1 = np.sqrt(d1)
    d2 = np.sqrt(d2)
    # 边界强度：d2-d1 越小越靠近边界
    edge = 1.0 - smoothstep((d2 - d1) / 0.32)
    return d1, edge, cid


def gaussian(a, sigma):
    return ndimage.gaussian_filter(a.astype(np.float32), sigma, mode="wrap")


def height_to_normal(height, strength=2.6):
    """由高度图求法线，OpenGL 约定 +Y"""
    h = _f(height) / 255.0
    dy, dx = np.gradient(h)
    nx = -dx * strength
    ny = dy * strength
    nz = np.ones_like(h)
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([(nx * inv * 0.5 + 0.5) * 255,
                    (ny * inv * 0.5 + 0.5) * 255,
                    (nz * inv * 0.5 + 0.5) * 255], axis=-1)
    return _u8(rgb)


def height_to_ao(height, radius=7.0, strength=1.5):
    h = _f(height) / 255.0
    blurred = gaussian(h, radius)
    cavity = np.clip((blurred - h) * strength, 0, 1)
    return _u8((1.0 - cavity) * 255)


def rgb_from_hex(hx):
    hx = hx.lstrip("#")
    return np.array([int(hx[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def delight(rgb, gain=1.25, sat=1.06):
    """参考照片含光照，albedo 需去光照补偿：提亮 + 轻微增饱和，保持色相"""
    c = _f(rgb) * gain
    l = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    c = np.clip(l + (c - l) * sat, 0, 255)
    return c


def tint(base_rgb, mod, amount=0.28):
    """mod: 0..1 灰度调制，生成带纹理的 albedo"""
    b = _f(base_rgb)[None, None, :]
    m = (_f(mod) - 0.5) * 2.0 * amount
    out = b * (1.0 + m[:, :, None])
    return _u8(out)


def ramp(a, lo, hi):
    return np.clip((_f(a) - lo) / max(hi - lo, 1e-6), 0, 1)


def stripes(h, w, count, seed=0, along="x", jitter=0.0, duty=0.5, soft=0.02):
    """周期条纹；along='x' 表示沿 x 方向变化"""
    rng = np.random.default_rng(seed)
    phase = rng.random() if jitter == 0 else 0.0
    if along == "x":
        t = (np.arange(w, dtype=np.float32)[None, :] / w * count + phase) % 1.0
        arr = np.broadcast_to(t, (h, w)).copy()
    else:
        t = (np.arange(h, dtype=np.float32)[:, None] / h * count + phase) % 1.0
        arr = np.broadcast_to(t, (h, w)).copy()
    if jitter > 0:
        arr = (arr + (fbm(h, w, max(2, count // 2), seed + 77, 4) - 0.5) * jitter) % 1.0
    s = smoothstep(ramp(arr, 0, duty + soft)) * (1 - smoothstep(ramp(arr, duty - soft, 1)))
    return s


# ----------------------------------------------------------------------------
# 保存 / 组装
# ----------------------------------------------------------------------------

CHANNELS = ("albedo", "normal", "roughness", "metallic", "ao", "height", "orm")


def wrap_fix(arr, k=8):
    """边缘交叉淡化：把左右/上下边界统一到平均值，消除任何残余接缝"""
    a = arr.astype(np.float32).copy()
    d = (a[:, -1] + a[:, 0]) * 0.5 - a[:, 0]
    for i in range(k):
        wgt = 1.0 - i / k
        a[:, i] += d * wgt
        a[:, -1 - i] -= d * wgt
    d2 = (a[-1, :] + a[0, :]) * 0.5 - a[0, :]
    for i in range(k):
        wgt = 1.0 - i / k
        a[i, :] += d2 * wgt
        a[-1 - i, :] -= d2 * wgt
    return np.clip(a, 0, 255).astype(np.uint8)


def build_channels(surf, normal_strength=2.6, ao_radius=7.0):
    """输入 surf 字典（至少 albedo, height, roughness），补全全部通道"""
    height = _u8(surf["height"])
    rough = _u8(surf.get("roughness", np.full_like(height, 190)))
    metal = _u8(surf.get("metallic", np.zeros_like(height)))
    ao = _u8(surf.get("ao", height_to_ao(height, ao_radius)))
    nrm = surf["normal"] if "normal" in surf else height_to_normal(height, normal_strength)
    ch = {
        "albedo": _u8(surf["albedo"]),
        "height": height,
        "roughness": rough,
        "metallic": metal,
        "ao": ao,
        "normal": _u8(nrm),
        "orm": np.stack([ao, rough, metal], axis=-1).astype(np.uint8),
    }
    for extra in ("opacity", "emissive"):
        if extra in surf:
            ch[extra] = _u8(surf[extra])
    return {k: wrap_fix(v) for k, v in ch.items()}


def save_material(out_dir, key, ch, size):
    os.makedirs(out_dir, exist_ok=True)
    written = {}
    for name, arr in ch.items():
        p = os.path.join(out_dir, "%s_%s.png" % (key, name))
        Image.fromarray(arr).save(p, optimize=True)
        written[name] = os.path.basename(p)
    # 无缝自检：左右/上下边缘平均绝对差（0..255）
    a = ch["albedo"].astype(np.float32)
    seam = float((np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0, :] - a[-1, :]).mean()) / 2)
    return written, seam


def save_material_json(out_dir, key, meta):
    with open(os.path.join(out_dir, "material.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
