# Tree Small 02

Author: Rico Cilliers. License: CC0-1.0.
Source: https://polyhaven.com/a/tree_small_02

Complete original glTF, binary and 1k maps retained. Official API MD5 and local SHA256 are in manifest.json. Raw source is approximately101MB, not a mobile runtime size.

Rebuild the reviewed derivative with `python3 tools/prepare_tree.py`. Uniform decimation was rejected after visual inspection because it destroyed small leaves. The adopted code preserves the authored leaf placement/orientation/UVs using deterministic complete folded leaf surfaces, while simplifying timber separately. See runtime-metadata.json for counts and exact derivation.

The2.95MB local GLB is used at eight foreground sites, with shared source geometry/materials, trunk collisions and distance culling. This is an art-directed generic tree, not a botanical identification of a Tang-period species.
