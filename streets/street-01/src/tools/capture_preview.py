#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
capture_preview.py — 用真实浏览器实拍 Web 预览截图
==================================================
依赖：playwright、Chromium / google-chrome、xvfb-run（软件 WebGL）
运行：
    bash web/start_preview.sh 8080 &
    xvfb-run -a python3 src/tools/capture_preview.py
输出：docs/images/preview-dusk.png、docs/images/preview-noon-aerial.png
可用环境变量 STREET_PREVIEW_URL 覆盖页面地址。
"""
import os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(ROOT, "docs", "images")
URL = os.environ.get("STREET_PREVIEW_URL", "http://127.0.0.1:8080/web/index.html")


def main():
    os.makedirs(OUT, exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("缺少 playwright：pip3 install playwright && playwright install chromium")
        return 1

    chrome = "/usr/bin/google-chrome"
    args = ["--no-sandbox", "--use-gl=desktop", "--enable-webgl",
            "--ignore-gpu-blocklist", "--disable-dev-shm-usage"]
    msgs = []
    with sync_playwright() as p:
        kw = {"headless": False, "args": args}
        if os.path.isfile(chrome):
            kw["executable_path"] = chrome
        browser = p.chromium.launch(**kw)
        page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
        page.on("console", lambda m: msgs.append(m.type + ": " + m.text[:240]))
        page.on("pageerror", lambda e: msgs.append("PAGEERROR: " + str(e)[:300]))
        page.goto(URL, wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(30000)

        err = page.locator("#err").inner_text() if page.locator("#err").count() else ""
        print("页面错误框:", (err[:200] or "(无)"))
        print("HUD 三角面:", page.locator("#hTri").inner_text())
        print("材质卡片:", page.locator(".mcard").count())
        page.screenshot(path=os.path.join(OUT, "preview-dusk.png"))

        page.click('button[data-preset="noon"]')
        page.click('button[data-view="aerial"]')
        page.wait_for_timeout(5000)
        page.screenshot(path=os.path.join(OUT, "preview-noon-aerial.png"))

        bad = [m for m in msgs if m.startswith("error") or m.startswith("PAGEERROR")]
        print("控制台错误数:", len(bad))
        for m in bad[:10]:
            print("  ", m)
        browser.close()

    print("输出目录:", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
