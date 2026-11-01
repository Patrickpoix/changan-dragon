#!/usr/bin/env python3
"""Development probe: measure the dragon's ground contact and silhouette.

This is a maintenance tool for numbers no screenshot can prove: which feet
touch the street, how high the rig floats, and how the body reads from the
four review angles. It is not a product test and not art approval.
"""

import argparse
import asyncio
import json
import shutil
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright

MEASURE = """() => {
  const d = __street.dragon;
  d.root.updateMatrixWorld(true);
  const visualBox = new THREE.Box3().setFromObject(d.visual);
  const feet = d.legs.map((leg) => {
    leg.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(leg);
    return {
      front: leg.userData.front,
      side: leg.userData.side,
      minY: +box.min.y.toFixed(4),
    };
  });
  const headBox = new THREE.Box3().setFromObject(d.head);
  const bodyMesh = d.visual.userData.body;
  const bodyBox = bodyMesh ? new THREE.Box3().setFromObject(bodyMesh) : null;
  return {
    groundY: +d.root.position.y.toFixed(4),
    visualMinY: +visualBox.min.y.toFixed(4),
    visualMaxY: +visualBox.max.y.toFixed(4),
    visualWidth: +(visualBox.max.x - visualBox.min.x).toFixed(4),
    visualLength: +(visualBox.max.z - visualBox.min.z).toFixed(4),
    headMinY: +headBox.min.y.toFixed(4),
    headMaxY: +headBox.max.y.toFixed(4),
    bodySize: bodyBox
      ? {
          x: +(bodyBox.max.x - bodyBox.min.x).toFixed(4),
          y: +(bodyBox.max.y - bodyBox.min.y).toFixed(4),
          z: +(bodyBox.max.z - bodyBox.min.z).toFixed(4),
        }
      : null,
    feet,
  };
}"""

CAMERA = """(yaw) => {
  const state = __street.state;
  const dragon = __street.dragon;
  state.near = true;
  state.orbitPitch = 0.04;
  state.orbitYaw = yaw;
  dragon.root.updateMatrixWorld(true);
  const target = dragon.head
    .getWorldPosition(new THREE.Vector3())
    .add(new THREE.Vector3(0, -0.02, 0.01));
  const angle = state.yaw + state.orbitYaw;
  const distance = 2.35;
  const height = 0.02 + Math.sin(state.orbitPitch) * 0.85;
  __street.camera.position.set(
    target.x + Math.sin(angle) * distance,
    target.y + height,
    target.z + Math.cos(angle) * distance,
  );
  __street.camera.lookAt(target);
}"""


async def run(args):
    output = Path(args.output or tempfile.mkdtemp(prefix="changan-dragon-shape-"))
    output.mkdir(parents=True, exist_ok=True)
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
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        errors = []
        console_errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        try:
            await page.goto(args.url, wait_until="load")
            await page.wait_for_function(
                "window.__street?.state.ready", timeout=120000
            )
            await page.locator("#enterBtn").click()
            await page.wait_for_function("__street.state.started")
            await page.evaluate(
                "document.querySelectorAll('.ui,#enter,#loading,.toast')"
                ".forEach((e)=>{e.style.display='none'});"
            )
            measurements = await page.evaluate(MEASURE)
            for name, yaw in (
                ("front", 0.0),
                ("three-quarter", 0.72),
                ("left", 1.5707963),
                ("back", 3.1415926),
            ):
                await page.evaluate(CAMERA, yaw)
                await page.wait_for_timeout(1800)
                await page.screenshot(path=str(output / (name + ".png")))
            gl_error = await page.evaluate(
                "__street.renderer.getContext().getError()"
            )
            report = {
                "url": args.url,
                "output": str(output),
                "measurements": measurements,
                "glError": gl_error,
                "pageErrors": errors,
                "consoleErrors": console_errors,
            }
        finally:
            await browser.close()
    (output / "shape.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--url", default="http://127.0.0.1:8877/content/street/index.html"
)
parser.add_argument("--output", type=Path)
parser.add_argument("--browser")
args = parser.parse_args()
asyncio.run(run(args))
