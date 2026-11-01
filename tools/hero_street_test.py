#!/usr/bin/env python3
"""Verify the isolated West Market hero street in a real browser.

This is a development gate, not a claim of phone performance or final art
approval. It checks actual WebGL rendering, keyboard/touch controls, camera
views, the new building kit, and screenshots at desktop and phone landscape.
"""

import argparse
import asyncio
import json
import shutil
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright


async def wait_ready(page):
    await page.wait_for_function(
        "window.__street?.state.ready || "
        "document.querySelector('#loadingText').textContent.includes('没有搭起来')",
        timeout=120000,
    )
    state = await page.evaluate(
        """() => ({
          ready: !!window.__street?.state.ready,
          error: document.querySelector('#loadingText').textContent,
          frameCount: window.__street?.state.frameCount || 0
        })"""
    )
    assert state["ready"], state
    await page.wait_for_function("window.__street.state.frameCount >= 3", timeout=120000)
    return state


async def read(page):
    return await page.evaluate(
        """() => ({
          started: __street.state.started,
          mode: __street.state.mode,
          near: __street.state.near,
          position: __street.state.position.toArray(),
          yaw: __street.state.yaw,
          camera: __street.camera.position.toArray(),
          calls: __street.renderer.info.render.calls,
          triangles: __street.renderer.info.render.triangles,
          kit: __street.state.kitStats,
          frames: __street.state.frameCount
        })"""
    )


async def run(args):
    output = Path(args.output or tempfile.mkdtemp(prefix="changan-hero-street-"))
    output.mkdir(parents=True, exist_ok=True)
    report = {
        "url": args.url,
        "output": str(output),
        "browser": "Playwright Chromium",
        "finalArtAccepted": False,
        "phonePerformanceVerified": False,
        "profiles": {},
    }
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
        try:
            for name in args.profiles:
                mobile = name == "landscape"
                viewport = {"width": 844, "height": 390} if mobile else {"width": 1280, "height": 720}
                context = await browser.new_context(
                    viewport=viewport,
                    is_mobile=mobile,
                    has_touch=mobile,
                    device_scale_factor=1,
                )
                page = await context.new_page()
                page.set_default_timeout(120000)
                errors = []
                console_errors = []
                bad = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.on(
                    "console",
                    lambda message: console_errors.append(message.text)
                    if message.type == "error"
                    else None,
                )
                page.on(
                    "response",
                    lambda response: bad.append([response.status, response.url])
                    if response.status >= 400
                    else None,
                )
                directory = output / name
                directory.mkdir(exist_ok=True)
                item = report["profiles"][name] = {"viewport": viewport}
                try:
                    await page.goto(args.url, wait_until="load")
                    item["boot"] = await wait_ready(page)
                    await page.wait_for_timeout(900)
                    await page.screenshot(path=str(directory / "01-entry.png"))
                    await page.locator("#enterBtn").click()
                    await page.wait_for_function("__street.state.started")
                    await page.wait_for_function(
                        "getComputedStyle(document.querySelector('#enter')).display === 'none'"
                    )
                    await page.wait_for_timeout(500)
                    item["street"] = await read(page)
                    await page.screenshot(path=str(directory / "02-street.png"))

                    if mobile:
                        box = await page.locator("#joystick").bounding_box()
                        assert box and box["width"] >= 44, box
                        cdp = await context.new_cdp_session(page)
                        point = {
                            "x": box["x"] + box["width"] / 2,
                            "y": box["y"] + box["height"] / 3,
                            "id": 1,
                        }
                        before = (await read(page))["position"][2]
                        await cdp.send(
                            "Input.dispatchTouchEvent",
                            {"type": "touchStart", "touchPoints": [point]},
                        )
                        try:
                            await page.wait_for_function(
                                f"__street.state.position.z < {before - 0.5}",
                                timeout=30000,
                            )
                        finally:
                            await cdp.send(
                                "Input.dispatchTouchEvent",
                                {"type": "touchEnd", "touchPoints": []},
                            )
                            await cdp.detach()
                        # The movement solver has a normal damping tail; verify
                        # the touch input itself was released, not zero speed.
                        assert await page.evaluate(
                            "__street.joystick.active === false && "
                            "__street.joystick.x === 0 && __street.joystick.y === 0"
                        )
                    else:
                        before = (await read(page))["position"][2]
                        await page.keyboard.down("w")
                        try:
                            await page.wait_for_function(
                                f"__street.state.position.z < {before - 1}",
                                timeout=30000,
                            )
                        finally:
                            await page.keyboard.up("w")
                    item["walk"] = await read(page)
                    await page.screenshot(path=str(directory / "03-walk.png"))

                    await page.locator('[data-mode="fly"]').click()
                    await page.wait_for_function("__street.state.mode === 'fly'")
                    if mobile:
                        await page.locator("#upBtn").dispatch_event("pointerdown")
                        await page.wait_for_timeout(800)
                        await page.locator("#upBtn").dispatch_event("pointerup")
                    else:
                        await page.keyboard.down("q")
                        await page.wait_for_timeout(900)
                        await page.keyboard.up("q")
                    # Keyboard events can arrive while the page is still
                    # submitting the previous software-rendered frame. Hold Q
                    # until simulation time advances, not wall-clock only.
                    await page.wait_for_function(
                        "__street.state.position.y > 1.55 || "
                        "__street.state.time > 1.0",
                        timeout=30000,
                    )
                    if not await page.evaluate("__street.state.position.y > 1.55"):
                        await page.keyboard.down("q")
                        await page.wait_for_function(
                            "__street.state.position.y > 1.55", timeout=30000
                        )
                        await page.keyboard.up("q")
                    item["flight"] = await read(page)
                    await page.screenshot(path=str(directory / "04-flight.png"))

                    await page.locator("#nearBtn").click()
                    await page.wait_for_function("__street.state.near")
                    await page.wait_for_timeout(600)
                    near = await page.evaluate(
                        """() => ({
                          camera: __street.camera.position.toArray(),
                          head: __street.dragon.headWorld.toArray(),
                          distance: __street.camera.position.distanceTo(__street.dragon.headWorld),
                          calls: __street.renderer.info.render.calls
                        })"""
                    )
                    assert 2.0 <= near["distance"] <= 3.5, near
                    item["near"] = near
                    await page.screenshot(path=str(directory / "05-near.png"))

                    await page.locator("#nearBtn").click()
                    await page.locator("#resetBtn").click()
                    await page.wait_for_function(
                        "__street.state.position.z > 22 && __street.state.mode === 'walk'"
                    )
                    item["reset"] = await read(page)
                    item["layout"] = await page.evaluate(
                        """() => {
                          const ids=['enterBtn','nearBtn','resetBtn'];
                          const controls=[...document.querySelectorAll('.actions button')].map(el=>{
                            const r=el.getBoundingClientRect(), c=getComputedStyle(el);
                            return {text:el.textContent.trim(),x:r.x,y:r.y,w:r.width,h:r.height,
                              visible:c.display!=='none'&&c.visibility==='visible',
                              hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};
                          });
                          return {controls, overflow:document.documentElement.scrollWidth>innerWidth||
                            document.documentElement.scrollHeight>innerHeight};
                        }"""
                    )
                    assert not item["layout"]["overflow"], item["layout"]
                    for control in item["layout"]["controls"]:
                        if not control["visible"]:
                            continue
                        assert control["w"] >= 44 and control["h"] >= 44, control
                        assert control["hit"], control
                    gl = await page.evaluate("__street.renderer.getContext().getError()")
                    assert gl == 0, gl
                    assert not errors and not console_errors and not bad, {
                        "pageErrors": errors,
                        "consoleErrors": console_errors,
                        "badResponses": bad,
                    }
                    item.update(passed=True, glError=gl)
                except Exception as error:
                    item.update(passed=False, error=str(error))
                    await page.screenshot(path=str(directory / "failure.png"))
                    raise
                finally:
                    await context.close()
        finally:
            await browser.close()
    (output / "results.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--url", default="http://127.0.0.1:8877/content/street/index.html"
)
parser.add_argument("--output", type=Path)
parser.add_argument("--browser")
parser.add_argument("--profiles", nargs="+", choices=["desktop", "landscape"], default=["desktop", "landscape"])
args = parser.parse_args()
asyncio.run(run(args))
