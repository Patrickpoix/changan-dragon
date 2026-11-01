#!/usr/bin/env python3
"""在 r160 验收台里量两位人物 GLB 的世界包围盒。

这是权威值：运行时加载的就是同一份 GLB。Blender 端的 `bound_box` 是缓存，
重导入后再量也会因节点旋转/依赖图刷新而与渲染器不一致，因此报告尺寸应以
渲染器实测为准。本脚本不修改任何资源。
"""

import argparse
import asyncio
import json
import shutil
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright

MEASURE = """() => {
  const root = __modelReview.model || __modelReview.root || null;
  if (!root) return { error: 'model not exposed' };
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  return {
    width: +size.x.toFixed(3),
    height: +size.y.toFixed(3),
    depth: +size.z.toFixed(3),
    minY: +box.min.y.toFixed(3),
    triangles: __modelReview.triangles,
  };
}"""


async def run(args):
    output = Path(args.output or tempfile.mkdtemp(prefix="changan-resident-bounds-"))
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
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
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
            measured = await page.evaluate(MEASURE)
            measured["pageErrors"] = errors
            report[name] = measured
            await page.close()
        await browser.close()
    (output / "resident-bounds.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base", default="http://127.0.0.1:8877")
parser.add_argument("--output", type=Path)
parser.add_argument("--browser")
args = parser.parse_args()
asyncio.run(run(args))
