#!/usr/bin/env python3
"""按 GLB 内的 position accessor 报告自包含模型的真实尺寸。

用途：核实 `assets/kit/architecture/kit-report.json` 里的人物尺寸是否与
导出文件一致。Blender 的 `obj.bound_box` 是缓存，逐顶点改动后不一定刷新；
本脚本不依赖 Blender，直接读 GLB 的 accessor min/max，作为权威值。
"""

import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_glb_json(path):
    data = Path(path).read_bytes()
    _, _, length = struct.unpack_from("<III", data, 0)
    offset = 12
    chunks = []
    while offset < length:
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunks.append((chunk_type, data[offset:offset + chunk_length]))
        offset += chunk_length
    return json.loads(chunks[0][1].decode("utf-8"))


def dimensions(path):
    gltf = read_glb_json(path)
    lo = [float("inf")] * 3
    hi = [float("-inf")] * 3
    for node in gltf["nodes"]:
        if "mesh" not in node:
            continue
        translation = node.get("translation", [0.0, 0.0, 0.0])
        for primitive in gltf["meshes"][node["mesh"]]["primitives"]:
            accessor = gltf["accessors"][primitive["attributes"]["POSITION"]]
            for axis in range(3):
                lo[axis] = min(lo[axis], accessor["min"][axis] + translation[axis])
                hi[axis] = max(hi[axis], accessor["max"][axis] + translation[axis])
    return lo, hi


def main():
    report_path = ROOT / "assets" / "kit" / "architecture" / "kit-report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    recorded = {item["id"]: item for item in report.get("character_types", [])}
    for name, key in (("resident-male", "round_collar_male"), ("resident-female", "ruqun_female")):
        lo, hi = dimensions(ROOT / "assets" / "kit" / "architecture" / f"{name}.glb")
        size = [round(hi[axis] - lo[axis], 3) for axis in range(3)]
        entry = recorded.get(key, {})
        print(
            name,
            "glb_dims=", size,
            "minY=", round(lo[1], 3),
            "report=", entry.get("dimensions_m"),
        )


if __name__ == "__main__":
    main()
