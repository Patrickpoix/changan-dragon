#!/usr/bin/env python3
"""按人物自身坐标系量手臂跨度，避免被实例旋转误导。

街上人物实例带 rotationY，直接用世界 X 会量到身体前后厚度而不是肩宽。
本脚本取网格的局部包围盒（geometry.boundingBox，不含实例旋转），
分别报告头颈手网格与躯干网格的横向跨度。
"""

import argparse
import asyncio
import json
import shutil
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright

MEASURE = """() => {
  let armSpan = 0;
  let torsoSpan = 0;
  let armName = '';
  let torsoName = '';
  __modelReview.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.computeBoundingBox();
    const box = o.geometry.boundingBox;
    const spanX = box.max.x - box.min.x;
    const name = (o.name || '').toLowerCase();
    if (/head|hand/.test(name) && spanX > armSpan) { armSpan = spanX; armName = o.name; }
    if (/garment|skirt|belt/.test(name) && spanX > torsoSpan) { torsoSpan = spanX; torsoName = o.name; }
  });
  return {
    armSpan: +armSpan.toFixed(3),
    torsoSpan: +torsoSpan.toFixed(3),
    armToTorso: +(armSpan / torsoSpan).toFixed(3),
    armName,
    torsoName,
  };
}"""


async def run(args):
    output = Path(args.output or tempfile.mkdtemp(prefix="changan-posture-"))
    output.mkdir(parents=True, exist_ok=True)
    report = {}
    async with async_playwright() as p:
        launch = {
            "headless": True,
            "args": [
                "--no-sandbox",
                "--use-angle=swiftshader",
                "--enable-unsafe-swiftshader",
            ],
        }
        executable = args.browser or shutil.which("chromium")
        if executable:
            launch["executable_path"] = executable
        browser = await p.chromium.launch(**launch)
        for name in ("resident-male", "resident-female"):
            page = await browser.new_page(viewport={"width": 900, "height": 600})
            url = (
                args.base
                + "/tools/model_review.html?model=../assets/kit/architecture/"
                + name
                + ".glb"
            )
            await page.goto(url, wait_until="load")
            await page.wait_for_function(
                "window.__modelReview?.ready || window.__modelReview?.error",
                timeout=120000,
            )
            report[name] = await page.evaluate(MEASURE)
            await page.close()
        await browser.close()
    (output / "resident-posture.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base", default="http://127.0.0.1:8877")
parser.add_argument("--output", type=Path)
parser.add_argument("--browser")
args = parser.parse_args()
asyncio.run(run(args))
