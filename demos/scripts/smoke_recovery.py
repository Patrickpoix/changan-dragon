"""Headless smoke test for recovered experimental demos.

Requires locally installed Playwright + Chromium. Software WebGL is NOT a
substitute for user desktop GPU performance or final visual approval.
"""
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "qa-evidence" / "recovery-20261025"
DEMOS = ("city-viewer", "integrated", "postprocessing")


class QuietHTTP(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        return


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = {}
    with sync_playwright() as playwright:
        options = {"headless": True, "args": [
            "--enable-unsafe-swiftshader", "--use-angle=swiftshader",
            "--disable-features=Vulkan"
        ]}
        if os.environ.get("RECOVERY_CHROMIUM"):
            options["executable_path"] = os.environ["RECOVERY_CHROMIUM"]
        browser = playwright.chromium.launch(**options)
        try:
            for name in DEMOS:
                dist = ROOT / name / "dist"
                if not (dist / "index.html").exists():
                    results[name] = {"status": "not_built"}
                    continue
                server = ThreadingHTTPServer(
                    ("127.0.0.1", 0), partial(QuietHTTP, directory=str(dist))
                )
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                page = browser.new_page(viewport={"width": 1280, "height": 800})
                errors = []
                responses = []
                page.on("pageerror", lambda error: errors.append("page: " + str(error)))
                page.on("console", lambda msg: errors.append("console: " + msg.text)
                        if msg.type == "error" else None)
                page.on("response", lambda response: responses.append(
                    str(response.status) + " " + response.url)
                        if response.status >= 400 else None)
                try:
                    page.goto("http://127.0.0.1:" + str(server.server_port),
                              wait_until="domcontentloaded", timeout=45000)
                    page.wait_for_selector("canvas", timeout=60000)
                    if name in ("city-viewer", "integrated"):
                        page.wait_for_function(
                            "() => /加载块 [1-9]/.test(document.getElementById('hud')?.textContent || '')",
                            timeout=90000
                        )
                        before = page.evaluate("""() => ({
                            z: window.__RECOVERY_VIEWER__.camera.position.z,
                            chunks: [...window.__RECOVERY_VIEWER__.loaded.keys()].sort(),
                            resources: window.__RECOVERY_VIEWER__.registry.stats()
                        })""")
                        if before["resources"]["liveAssets"] != 8:
                            errors.append("shared GPU assets must be exactly eight objects")
                        if before["resources"]["references"] != 8 * len(before["chunks"]):
                            errors.append("resource owners do not match loaded chunk count")
                        page.keyboard.down("Shift")
                        page.keyboard.down("w")
                        page.wait_for_timeout(4400)
                        page.keyboard.up("w")
                        page.keyboard.up("Shift")
                        page.wait_for_timeout(1600)
                        after = page.evaluate("""() => ({
                            z: window.__RECOVERY_VIEWER__.camera.position.z,
                            chunks: [...window.__RECOVERY_VIEWER__.loaded.keys()].sort(),
                            resources: window.__RECOVERY_VIEWER__.registry.stats()
                        })""")
                        if after["resources"]["liveAssets"] != 8:
                            errors.append("leaked or duplicated shared resources after chunk transition")
                        if after["resources"]["references"] != 8 * len(after["chunks"]):
                            errors.append("chunk unload did not release resource references")
                        if not after["z"] < before["z"] - 200:
                            errors.append("forward movement did not advance the camera")
                        if before["chunks"] == after["chunks"]:
                            errors.append("streaming chunk set did not change after movement")
                    else:
                        page.wait_for_function(
                            "() => (document.getElementById('hud')?.textContent || '').includes('DrawCalls')",
                            timeout=90000
                        )
                    page.wait_for_timeout(1250)
                    hud = page.locator("#hud").inner_text()
                    page.screenshot(path=str(OUTPUT / (name + ".png")))
                    results[name] = {
                        "status": "pass" if not errors and not responses else "errors",
                        "hud": hud[:500], "page_errors": errors[:20],
                        "http_errors": responses[:20],
                    }
                    if name in ("city-viewer", "integrated"):
                        results[name]["movement"] = {
                            "start_z": before["z"], "end_z": after["z"],
                            "before_loaded_chunks": len(before["chunks"]),
                            "after_loaded_chunks": len(after["chunks"]),
                            "changed": before["chunks"] != after["chunks"],
                            "resource_stats_before": before["resources"],
                            "resource_stats_after": after["resources"],
                        }
                        # Leaving *every* streamed district must release the
                        # last GPU lease, not just hide the chunk meshes.
                        page.evaluate("window.__RECOVERY_VIEWER__.camera.position.x = -16000")
                        page.wait_for_function("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            return v.loaded.size===0 && v.registry.stats().liveAssets===0 &&
                                   v.registry.stats().references===0;
                        }""", timeout=25000)
                        fully_released = page.evaluate("window.__RECOVERY_VIEWER__.registry.stats()")
                        if fully_released["disposed"] < 8:
                            errors.append("last district did not dispose shared GPU assets")
                        # Returning to the original district reconstructs the
                        # shared objects once, and the same route remains playable.
                        page.evaluate("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            v.camera.position.x=4860;
                            v.camera.position.z=-4100;
                        }""")
                        page.wait_for_function("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            return v.loaded.size>0 && v.registry.stats().liveAssets===8;
                        }""", timeout=25000)
                        after_reentry = page.evaluate("window.__RECOVERY_VIEWER__.registry.stats()")
                        results[name]["resource_lifecycle"] = {
                            "after_all_chunks_unloaded": fully_released,
                            "after_reentry": after_reentry
                        }
                        if errors:
                            results[name]["status"] = "errors"
                except Exception as exc:
                    results[name] = {
                        "status": "failed", "error": str(exc)[:1500],
                        "page_errors": errors[:20], "http_errors": responses[:20],
                    }
                finally:
                    page.close()
                    server.shutdown()
                    server.server_close()
        finally:
            browser.close()
    (OUTPUT / "results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(results, ensure_ascii=False, indent=2))
    if any(result["status"] != "pass" for result in results.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
"""Headless smoke test for recovered experimental demos.

Requires locally installed Playwright + Chromium. Software WebGL is NOT a
substitute for user desktop GPU performance or final visual approval.
"""
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "qa-evidence" / "recovery-20261025"
DEMOS = ("city-viewer", "integrated", "postprocessing")


class QuietHTTP(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        return


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = {}
    with sync_playwright() as playwright:
        options = {"headless": True, "args": [
            "--enable-unsafe-swiftshader", "--use-angle=swiftshader",
            "--disable-features=Vulkan"
        ]}
        if os.environ.get("RECOVERY_CHROMIUM"):
            options["executable_path"] = os.environ["RECOVERY_CHROMIUM"]
        browser = playwright.chromium.launch(**options)
        try:
            for name in DEMOS:
                dist = ROOT / name / "dist"
                if not (dist / "index.html").exists():
                    results[name] = {"status": "not_built"}
                    continue
                server = ThreadingHTTPServer(
                    ("127.0.0.1", 0), partial(QuietHTTP, directory=str(dist))
                )
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                page = browser.new_page(viewport={"width": 1280, "height": 800})
                errors = []
                responses = []
                page.on("pageerror", lambda error: errors.append("page: " + str(error)))
                page.on("console", lambda msg: errors.append("console: " + msg.text)
                        if msg.type == "error" else None)
                page.on("response", lambda response: responses.append(
                    str(response.status) + " " + response.url)
                        if response.status >= 400 else None)
                try:
                    page.goto("http://127.0.0.1:" + str(server.server_port),
                              wait_until="domcontentloaded", timeout=45000)
                    page.wait_for_selector("canvas", timeout=60000)
                    if name in ("city-viewer", "integrated"):
                        page.wait_for_function(
                            "() => /加载块 [1-9]/.test(document.getElementById('hud')?.textContent || '')",
                            timeout=90000
                        )
                        before = page.evaluate("""() => ({
                            z: window.__RECOVERY_VIEWER__.camera.position.z,
                            chunks: [...window.__RECOVERY_VIEWER__.loaded.keys()].sort(),
                            resources: window.__RECOVERY_VIEWER__.registry.stats()
                        })""")
                        if before["resources"]["liveAssets"] != 8:
                            errors.append("shared GPU assets must be exactly eight objects")
                        if before["resources"]["references"] != 8 * len(before["chunks"]):
                            errors.append("resource owners do not match loaded chunk count")
                        page.keyboard.down("Shift")
                        page.keyboard.down("w")
                        page.wait_for_timeout(4400)
                        page.keyboard.up("w")
                        page.keyboard.up("Shift")
                        page.wait_for_timeout(1600)
                        after = page.evaluate("""() => ({
                            z: window.__RECOVERY_VIEWER__.camera.position.z,
                            chunks: [...window.__RECOVERY_VIEWER__.loaded.keys()].sort(),
                            resources: window.__RECOVERY_VIEWER__.registry.stats()
                        })""")
                        if after["resources"]["liveAssets"] != 8:
                            errors.append("leaked or duplicated shared resources after chunk transition")
                        if after["resources"]["references"] != 8 * len(after["chunks"]):
                            errors.append("chunk unload did not release resource references")
                        if not after["z"] < before["z"] - 200:
                            errors.append("forward movement did not advance the camera")
                        if before["chunks"] == after["chunks"]:
                            errors.append("streaming chunk set did not change after movement")
                    else:
                        page.wait_for_function(
                            "() => (document.getElementById('hud')?.textContent || '').includes('DrawCalls')",
                            timeout=90000
                        )
                    page.wait_for_timeout(1250)
                    hud = page.locator("#hud").inner_text()
                    page.screenshot(path=str(OUTPUT / (name + ".png")))
                    results[name] = {
                        "status": "pass" if not errors and not responses else "errors",
                        "hud": hud[:500], "page_errors": errors[:20],
                        "http_errors": responses[:20],
                    }
                    if name in ("city-viewer", "integrated"):
                        results[name]["movement"] = {
                            "start_z": before["z"], "end_z": after["z"],
                            "before_loaded_chunks": len(before["chunks"]),
                            "after_loaded_chunks": len(after["chunks"]),
                            "changed": before["chunks"] != after["chunks"],
                            "resource_stats_before": before["resources"],
                            "resource_stats_after": after["resources"],
                        }
                        # Leaving *every* streamed district must release the
                        # last GPU lease, not just hide the chunk meshes.
                        page.evaluate("window.__RECOVERY_VIEWER__.camera.position.x = -16000")
                        page.wait_for_function("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            return v.loaded.size===0 && v.registry.stats().liveAssets===0 &&
                                   v.registry.stats().references===0;
                        }""", timeout=25000)
                        fully_released = page.evaluate("window.__RECOVERY_VIEWER__.registry.stats()")
                        if fully_released["disposed"] < 8:
                            errors.append("last district did not dispose shared GPU assets")
                        # Returning to the original district reconstructs the
                        # shared objects once, and the same route remains playable.
                        page.evaluate("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            v.camera.position.x=4860;
                            v.camera.position.z=-4100;
                        }""")
                        page.wait_for_function("""() => {
                            const v=window.__RECOVERY_VIEWER__;
                            return v.loaded.size>0 && v.registry.stats().liveAssets===8;
                        }""", timeout=25000)
                        after_reentry = page.evaluate("window.__RECOVERY_VIEWER__.registry.stats()")
                        results[name]["resource_lifecycle"] = {
                            "after_all_chunks_unloaded": fully_released,
                            "after_reentry": after_reentry
                        }
                        if errors:
                            results[name]["status"] = "errors"
                except Exception as exc:
                    results[name] = {
                        "status": "failed", "error": str(exc)[:1500],
                        "page_errors": errors[:20], "http_errors": responses[:20],
                    }
                finally:
                    page.close()
                    server.shutdown()
                    server.server_close()
        finally:
            browser.close()
    (OUTPUT / "results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(results, ensure_ascii=False, indent=2))
    if any(result["status"] != "pass" for result in results.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
