# 2026-10-24 Verified full-resolution CC0 source acquisition

Goal: obtain an actual editable 4K source rather than only collect web links. Strict $0 resource policy retained.

Added files: assets/library/free-curated/polyhaven/antique_ceramic_vase_01_4k containing five original files (glTF, BIN, 3 JPG textures) plus README.md and manifest.json; total original 3129647 bytes. No deletion, move or rename; no existing game code or runtime binaries touched.

Actual validation: downloaded files directly from Poly Haven official URLs, verified source MD5 for all five and computed SHA256; created Git blobs. Inspected glTF JSON: one mesh, one material, buffer length 217216; all three image URIs are in textures/. Verify Git tree and binary sizes after commit.

Not run: Blender import, UV/art/historical vetting, browser loading, animation, GPU tests, game regressions. No need to run full-game tests for research-only files; do not call this a finished Tang asset.

Risks/boundaries: vessel date unknown; CC0 permits reuse, but historic suitability remains unproven. No paid/NoAI/restricted sources. Temporary downloader scratch files on user Windows PC should be cleared. Next reviewer: read manifest.json and repo FREE_ONLY_RESOURCES_20261024.md, then confirm actual Blender appearance before any product inclusion.
