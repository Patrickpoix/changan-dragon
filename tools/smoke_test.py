#!/usr/bin/env python3
"""Browser acceptance checks; writes evidence outside the checkout by default.

Requires Python Playwright and a Chromium executable (or its installed browser).
Serve the checkout separately, then run python tools/smoke_test.py --help.
Only one WebGL page is open at a time. A software renderer verifies behavior,
not real phone GPU performance. Browser plugin not available in this environment.
"""
import argparse
import asyncio
import json
import shutil
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright


VIEWPORTS = {
    "desktop": (1280, 720, False),
    "landscape": (844, 390, True),
    "compact": (667, 375, True),
    "portrait": (390, 844, True),
}


async def read_state(page):
    return await page.evaluate("""() => ({
      ready: !!window.__changan?.state.ready,
      started: !!window.__changan?.state.started,
      fatal: !document.querySelector('#errorOverlay').classList.contains('hidden'),
      fatalText: document.querySelector('#errorText').textContent,
      mode: window.__changan?.exploration.mode,
      position: window.__changan?.player?.group.position.toArray(),
      film: window.__changan?.exploration.film,
      calls: window.__changan?.drawCalls,
      triangles: window.__changan?.renderer.info.render.triangles,
      engine: window.__changanEngine
    })""")


async def frames(page, seconds=0.15):
    """Wait for simulated time to advance; wall-clock delays do not prove a frame."""
    before = await page.evaluate("__changan.state.time")
    await page.wait_for_function("t => __changan.state.time > t", arg=before + seconds)


async def boot(page, url):
    await page.goto(url, wait_until="load")
    await page.wait_for_function("""window.__changan?.state.ready ||
      !document.querySelector('#errorOverlay').classList.contains('hidden')""", timeout=120000)
    # Ready is assigned just before the first draw. A successful scene must also
    # render; shader/uniform failures must fail here, not a minute into a click.
    await page.wait_for_function("""window.__changan?.rendering.frameCount >= 2 ||
      !document.querySelector('#errorOverlay').classList.contains('hidden')""",timeout=120000)
    state = await read_state(page)
    assert state["ready"] and not state["fatal"], state
    assert "龙游长安" in await page.title(), "Unexpected page title"
    await page.locator("#startBtn").wait_for(state="visible")


async def visible_controls(page):
    result = await page.evaluate("""() => {
      const hud = document.querySelector('#hud'), css = getComputedStyle(hud);
      const controls = [...document.querySelectorAll('.mode-btn,.place-action,#joystick,#cameraBtn')].map(el => {
        const r = el.getBoundingClientRect(), c = getComputedStyle(el);
        return {id: el.id || el.dataset.mode, x:r.x, y:r.y, w:r.width, h:r.height,
          visible:c.visibility === 'visible' && c.display !== 'none',
          hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};
      });
      return {hud:{display:css.display,opacity:css.opacity,visibility:css.visibility},controls,
        overflow:document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight};
    }""")
    assert result["hud"]["display"] != "none" and result["hud"]["visibility"] == "visible", result
    assert float(result["hud"]["opacity"]) > 0.99, result
    assert not result["overflow"], result
    width, height = await page.evaluate("[innerWidth,innerHeight]")
    for c in result["controls"]:
        assert c["visible"] and c["hit"], c
        assert c["w"] >= 44 and c["h"] >= 44, c
        assert c["x"] >= 0 and c["y"] >= 0 and c["x"] + c["w"] <= width + 1 and c["y"] + c["h"] <= height + 1, c
    return result


async def hold_touch(page, selector, until, offset=None):
    box = await page.locator(selector).bounding_box()
    point = {"x": box["x"] + box["width"] / 2, "y": box["y"] + box["height"] / 2, "id": 1}
    if offset:
        point["x"] += box["width"] * offset[0]
        point["y"] += box["height"] * offset[1]
    cdp = await page.context.new_cdp_session(page)
    try:
        await cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [point]})
        await page.wait_for_function(until)
    finally:
        await cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
        await cdp.detach()


async def exercise(page, mobile, output):
    results = {}
    for mode in ("walk", "fly"):
        await page.locator(f'[data-mode="{mode}"]').click()
        assert await page.evaluate("__changan.exploration.mode") == mode
        assert not await page.evaluate("__changan.player.bike.group.visible")
    await page.wait_for_function("__changan.player.group.position.y > 8")
    results["flight"] = await read_state(page)
    if mobile:
        before = await page.evaluate("__changan.exploration.altitude")
        await hold_touch(page, "#ascendBtn", f"__changan.exploration.altitude > {before + 2}")
        assert not await page.evaluate("__changan.exploration.liftUp")
    else:
        before = await page.evaluate("__changan.exploration.altitude")
        await page.keyboard.down("q")
        try:
            await page.wait_for_function("a => __changan.exploration.altitude > a + 2", arg=before)
        finally:
            await page.keyboard.up("q")

    # Explicit position fixtures exercise landing rejection without a long flight.
    await page.evaluate("""() => { __changan.player.group.position.set(380,60,320); __changan.exploration.altitude=60; }""")
    await page.locator('[data-mode="walk"]').click()
    assert await page.evaluate("__changan.exploration.mode") == "fly", "Water landing was accepted"
    await page.evaluate("""() => { __changan.player.group.position.set(0,60,300); __changan.exploration.altitude=60; }""")
    await page.locator('[data-mode="bike"]').click()
    assert await page.evaluate("__changan.exploration.mode === 'bike' && __changan.player.bike.group.visible")
    assert await page.evaluate("__changan.player.group.position.y < 1")

    await page.evaluate("__changan.teleport(0,300,Math.PI)")
    before_z = await page.evaluate("__changan.player.group.position.z")
    if mobile:
        await hold_touch(page, "#joystick", f"__changan.player.group.position.z < {before_z - 2}", (0, -0.3))
        assert await page.evaluate("Input.joyX === 0 && Input.joyY === 0 && Input.joyPointer === null")
        yaw = await page.evaluate("Move.yaw")
        await hold_touch(page, "#joystick", f"Move.yaw < {yaw - 0.1}", (0.3, -0.2))
    else:
        await page.keyboard.down("w")
        try:
            await page.wait_for_function("z => __changan.player.group.position.z < z-2", arg=before_z)
            await page.keyboard.down("Shift")
            await page.wait_for_function("__changan.state.boosted")
        finally:
            await page.keyboard.up("Shift")
            await page.keyboard.up("w")
    results["movement"] = await read_state(page)
    await page.evaluate("window.dispatchEvent(new Event('blur'))")
    assert await page.evaluate("__changan.speed === 0 && Input.joyY === 0 && !Input.touchBoost")

    labels = []
    for _ in range(4):
        await page.locator("#cameraBtn").click()
        labels.append(await page.locator("#cameraLabel").inner_text())
    assert len(set(labels)) == 4, labels
    await page.keyboard.press("c")
    assert await page.locator("#cameraLabel").inner_text() != labels[-1]
    results["cameras"] = labels

    for i in range(8):
        await page.locator("#travelBtn").click()
        assert await page.locator("#travelPanel").is_visible()
        await page.locator(f'[data-place="{i}"]').click()
        assert not await page.locator("#modalLayer").is_visible()
        assert await page.evaluate("Explore.safeGround(player.group.position.x,player.group.position.z)"), i
    await page.locator("#helpBtn").click()
    assert await page.locator("#helpPanel").is_visible()
    assert not await page.locator("#travelPanel").is_visible()
    await page.keyboard.press("Escape")
    assert await page.evaluate("document.activeElement.id") == "helpBtn"

    await page.locator("#filmBtn").click()
    assert await page.evaluate("Explore.film && !player.group.visible")
    assert not await page.locator("#hud").is_visible()
    await page.locator("#filmPause").click()
    # Regress the old bug: a paused scene must stay paused even at its boundary.
    await page.evaluate("Explore.filmTime = 34.1")
    await frames(page)
    before = await page.evaluate("[Explore.filmIndex,Explore.filmTime,camera.position.toArray()]")
    await frames(page)
    assert before == await page.evaluate("[Explore.filmIndex,Explore.filmTime,camera.position.toArray()]")
    await page.screenshot(path=str(output / "cinema.png"))
    await page.locator("#filmNext").click()
    assert await page.evaluate("Explore.filmIndex") == (before[0] + 1) % 8
    await page.locator("#filmPrev").click()
    assert await page.evaluate("Explore.filmIndex") == before[0]
    async with page.expect_download(timeout=30000) as pending:
        await page.locator("#filmPhoto").click()
    download = await pending.value
    assert download.suggested_filename.endswith(".png")
    await download.save_as(output / "photo.png")
    assert (output / "photo.png").stat().st_size > 1024
    await page.locator("#filmExit").click()
    assert await page.evaluate("!Explore.film && player.group.visible && document.activeElement.id==='filmBtn'")
    await visible_controls(page)

    await page.locator("#nightBtn").click()
    await page.wait_for_function("__changan.state.nightT > 0.4")
    await page.screenshot(path=str(output / "night.png"))
    await page.locator("#nightBtn").click()
    results["night"] = True

    await page.evaluate("__changan.teleport(0,344,Math.PI)")
    await frames(page)
    assert not await page.evaluate("UI.interact.classList.contains('visible')"), 'The roadside scroll should not interrupt the central avenue'
    await page.evaluate("__changan.teleport(__changan.poems[8].x,__changan.poems[8].z,Math.PI)")
    await page.wait_for_function("UI.interact.classList.contains('visible') && __changan.state.nearPoem===8")
    count = await page.evaluate("__changan.state.poemsFound.size")
    await page.locator("#interactBtn").click()
    assert await page.evaluate("__changan.state.poemsFound.size") == count + 1
    assert await page.locator("#poemPanel").is_visible()
    await page.locator("#poemPanel [data-close]").first.click()
    await page.reload(wait_until="load")
    await page.wait_for_function("window.__changan?.state.ready", timeout=120000)
    assert await page.evaluate("__changan.state.poemsFound.size") == count + 1
    results["persistence"] = True
    return results


async def run(args):
    output = Path(args.output or tempfile.mkdtemp(prefix="changan-smoke-"))
    output.mkdir(parents=True, exist_ok=True)
    report = {"url": args.url, "output": str(output), "browser": "Playwright Chromium", "viewports": {}}
    async with async_playwright() as p:
        launch = {"headless": not args.headful, "args": ["--no-sandbox"]}
        executable = args.browser or shutil.which("chromium") or shutil.which("chromium-browser")
        if executable:
            launch["executable_path"] = executable
        if not args.hardware:
            launch["args"] += ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
        browser = await p.chromium.launch(**launch)
        try:
            for name in args.viewports:
                width, height, mobile = VIEWPORTS[name]
                directory = output / name
                directory.mkdir(exist_ok=True)
                context = await browser.new_context(viewport={"width": width, "height": height}, is_mobile=mobile, has_touch=mobile, device_scale_factor=1, accept_downloads=True)
                page = await context.new_page()
                page.set_default_timeout(45000)
                errors, failures, console_errors = [], [], []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" and not message.location.get("url", "").endswith(("/vendor/three.min.js", "/favicon.ico")) else None)
                page.on("response", lambda r: failures.append([r.status, r.url]) if r.status >= 400 and not r.url.endswith("/vendor/three.min.js") and not r.url.endswith("/favicon.ico") else None)
                item = report["viewports"][name] = {"size": [width, height]}
                try:
                    await boot(page, args.url)
                    item["boot"] = await read_state(page)
                    await page.screenshot(path=str(directory / "start.png"))
                    await page.locator("#startBtn").click()
                    await page.wait_for_function("__changan.state.started")
                    await page.locator("#startScreen").wait_for(state="hidden")
                    item["layout"] = await visible_controls(page)
                    await page.screenshot(path=str(directory / "game.png"))
                    if name in ("desktop", "landscape"):
                        item["interactions"] = await exercise(page, mobile, directory)
                    assert not errors and not failures and not console_errors, {"errors": errors, "requests": failures, "console": console_errors}
                    item["passed"] = True
                except Exception as error:
                    item.update(passed=False, error=str(error), errors=errors, requests=failures, console=console_errors)
                    await page.screenshot(path=str(directory / "failure.png"))
                    raise
                finally:
                    (output / "results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
                    await context.close()
        finally:
            await browser.close()
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8877/")
    parser.add_argument("--output", help="Evidence directory (default: a new directory under /tmp)")
    parser.add_argument("--browser", help="Chromium executable path; otherwise discover Chromium or use Playwright's browser")
    parser.add_argument("--viewports", nargs="+", choices=VIEWPORTS, default=list(VIEWPORTS))
    parser.add_argument("--hardware", action="store_true", help="Use browser default GPU selection instead of SwiftShader")
    parser.add_argument("--headful", action="store_true")
    asyncio.run(run(parser.parse_args()))
