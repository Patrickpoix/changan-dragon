# 开发环境与恢复

工程是无后端的静态 HTML/JavaScript/WebGL 游戏。使用现有 `/workspace/changan-dragon`，保留本地开发改动，不为环境准备另建worktree。无需API密钥。

## 最小运行

需要Python3；引擎、扩展、字体、运行模型和材质均已在仓库。先执行：

```sh
cd /workspace/changan-dragon
python3 tools/prepare_assets.py
python3 tools/build_standalone.py
python3 -m http.server 8877 --bind 0.0.0.0 --directory /workspace/changan-dragon >/tmp/changan-http.log 2>&1
```

进程不能依靠快照保留，每次环境恢复应检查并启动。复用8877前确认其服务的是本工程；只停止本任务启动的故障服务。标准输出写到日志，避免长时间未消费的工具管道导致响应中断。

检查 `/`、`/vendor/three.min.js`、`/vendor/three.compat.min.js`、`/vendor/rendering-addons.js`、`/src/boot.js`、`/dist/changan-dragon.html` 均返回200。再实际启动浏览器验证ready和rendering.frameCount>=2，不把端口存在当运行通过。

## 浏览器检查

当前Python Playwright、`/usr/bin/chromium`已装。新机器如未保留这些依赖，可安装 `python3 -m pip install playwright` 并执行 `python3 -m playwright install --with-deps chromium`；检查工具可用 `--browser` 指定路径。浏览器插件可用时优先使用，否则运行：

```sh
python3 tools/smoke_test.py --url 'http://127.0.0.1:8877/?quality=low' --viewports landscape compact portrait
python3 tools/offline_test.py
python3 tools/compatibility_test.py
```

同一时刻只打开一个完整WebGL场景。云端Chromium使用SwiftShader；只证明功能和API兼容，不证明实际手机性能。file://被管理策略阻止，单文件以HTTP加载后断网测试，不绕过策略。

## 可选素材开发工具

Python fontTools用于字体子集，Blender4.3.2用于原始素材加工，Node24与Three0.160.1/esbuild0.25.12用于重建官方扩展；这些不是启动游戏的必需步骤。开发依赖位于 `/workspace/.environment/changan-rendering`，可在此目录执行 `npm install --no-audit --no-fund --save-exact three@0.160.1 esbuild@0.25.12`。不把node_modules/cache放进工程。

- 修改官方扩展：`node tools/build_rendering_addons.mjs`
- 修改作者小船的圆角加工：`python3 tools/prepare_boats.py`
- 修改采用的GLB：`python3 tools/build_asset_bundle.py --bundle`
- 修改字体覆盖：`python3 tools/subset_font.py`
- 原模型/许可/哈希在assets/library；运行模型已优化，不把约95MB原树二进制当手机运行包体积。

用户明确允许所有域名，配置草稿采用allowed_domains=["*"]；保存草稿不等于发布新环境版本。网络请求保留代理和TLS校验，API无需密钥；Poly Haven需描述性User-Agent。

最新工作说明见CONTINUE.md，实际运行证据见QA.md和qa-evidence。配置快照发布/新任务恢复由平台完成，不能将当前实例验证说成已验证新实例恢复。
