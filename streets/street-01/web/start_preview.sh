#!/usr/bin/env bash
# 启动本地预览服务（ES Module 与 glTF 需通过 HTTP 加载，不能用 file:// 直接打开）
set -e
cd "$(dirname "$0")/.."
PORT="${1:-8080}"
echo "长安·龙街预览: http://localhost:${PORT}/web/index.html"
echo "按 Ctrl+C 停止"
exec python3 -m http.server "${PORT}" --bind 127.0.0.1
