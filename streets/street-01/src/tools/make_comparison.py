#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_comparison.py — 生成「生图参考 → PBR 建模成果」对照图
运行: python3 src/tools/make_comparison.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
REF = os.path.join(ROOT, "references", "01_street_overview.png")
SHOT = os.path.join(ROOT, "docs", "images", "preview-dusk.png")
OUT = os.path.join(ROOT, "docs", "images", "reference-vs-result.png")

W, H = 1680, 800
BG = (18, 16, 14)
canvas = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(canvas)
fp = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
fs = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"
try:
    f_title = ImageFont.truetype(fs, 32, index=2)
    f_sub = ImageFont.truetype(fp, 16, index=2)
    f_lab = ImageFont.truetype(fs, 20, index=2)
    f_note = ImageFont.truetype(fp, 14, index=2)
except Exception:
    f_title = f_sub = f_lab = f_note = ImageFont.load_default()

d.text((36, 20), "生图参考 → PBR 建模成果", font=f_title, fill=(216, 173, 106))
d.text((36, 62), "盛唐长安 · 一条街  |  参考图决定配色 / 纹样 / 风化程度，成果为实时渲染的 glTF 场景",
       font=f_sub, fill=(154, 149, 137))
d.line([36, 92, W - 36, 92], fill=(90, 72, 46), width=1)

CW, CH = 796, 560
x0, x1, y0 = 36, 848, 112
for x, path, label, sub in (
        (x0, REF, "① 生图模型参考图", "街道黄昏全景 · 配色与形制依据"),
        (x1, SHOT, "② 实时渲染成果", "29 种 PBR 材质 · glTF 2.0 · 245,046 三角面")):
    im = Image.open(path).convert("RGB")
    im = ImageOps.fit(im, (CW, CH), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    canvas.paste(im, (x, y0))
    d.rectangle([x, y0, x + CW, y0 + CH], outline=(120, 96, 60), width=1)
    d.text((x, y0 + CH + 12), label, font=f_lab, fill=(226, 220, 206))
    d.text((x, y0 + CH + 40), sub, font=f_note, fill=(150, 146, 136))

by = y0 + CH + 76
d.line([36, by, W - 36, by], fill=(60, 52, 40), width=1)
notes = [
    "同款元素对照：黄昏暖金低角度光 · 连续出檐与青瓦屋面 · 朱漆檐柱 · 红绸灯笼 ·",
    "竖幌布幡 · 青石板车行道与车辙 · 两侧市井摊位 · 远处城楼剪影与大气雾。",
    "参考图基色经 3×4 材质板逐格采样 → palette.json → 程序化 PBR 贴图（接缝误差 0）。",
]
for i, t in enumerate(notes):
    d.text((36, by + 14 + i * 24), t, font=f_note, fill=(150, 146, 136))
canvas.save(OUT, optimize=True)
print("生成:", OUT)
