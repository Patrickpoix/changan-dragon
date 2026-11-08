#!/usr/bin/env bash
# 一键复现 street-01 全部产物。
# 所有生成器固定随机种子，重跑结果一致；产物目录 assets/ 与 web/ 会被重建。
set -euo pipefail
cd "$(dirname "$0")"
PY="$(command -v python3)"

run() {
  echo
  echo "==> $1"
  shift
  "$@"
}

run "1/7 参考图整理 + 调色板"          "$PY" src/tools/prepare_references.py
run "2/7 29 种 PBR 贴图 + 店招 + 总览" "$PY" src/pbr/generate_textures.py
run "3/7 整街 glTF/GLB + 模块库"       "$PY" src/geometry/build_street.py
run "4/7 轻量 Web 预览资产"            "$PY" src/tools/make_preview_assets.py
run "5/7 资产清单与文档"               "$PY" src/tools/build_docs.py

if [ -f docs/images/preview-dusk.png ]; then
  run "6/7 参考 vs 成果对比图"         "$PY" src/tools/make_comparison.py
else
  echo
  echo "==> 6/7 跳过对比图（缺少实拍截图 docs/images/preview-dusk.png）"
fi

run "7/7 逐项验收自检"                 "$PY" src/tools/validate.py

echo
echo "完成。预览：bash web/start_preview.sh 8080  ->  http://localhost:8080/web/index.html"
echo "更新实拍截图（可选，需 Playwright + Chromium + Xvfb）："
echo "  bash web/start_preview.sh 8080 &"
echo "  xvfb-run -a python3 src/tools/capture_preview.py"
