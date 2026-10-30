"""诊断铺作装配：输出每个部件的世界包围盒，验证是否逐层堆叠。

用法：
    blender -b -P content/architecture/diagnose_puzuo.py
"""

import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tang_kit as kit


def world_bounds(obj):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for corner in obj.bound_box:
        point = obj.matrix_world @ Vector(corner)
        lo = Vector((min(lo[i], point[i]) for i in range(3)))
        hi = Vector((max(hi[i], point[i]) for i in range(3)))
    return lo, hi


def main():
    kit.reset_scene()
    mats = {
        "wood": kit.make_material("mat_timber", kit.srgb(0x8A5A3C), 0.72),
        "block": kit.make_material("mat_block", kit.srgb(0x9A6544), 0.70),
        "tile": kit.make_material("mat_tile", kit.srgb(0x6E6B63), 0.78),
    }
    m = kit.TangModule(0.30)
    parts = kit.build_puzuo("diag", m, materials=mats)
    # new_object 只写数据层，不触发依赖图刷新，必须先 update 再取 matrix_world。
    bpy.context.view_layer.update()
    print("PART_COUNT", len(parts))
    print("%-26s %8s %8s %8s %8s %8s %8s" % ("name", "xmin", "xmax", "ymin", "ymax", "zmin", "zmax"))
    for obj in parts:
        lo, hi = world_bounds(obj)
        print(
            "%-26s %8.3f %8.3f %8.3f %8.3f %8.3f %8.3f"
            % (obj.name, lo.x, hi.x, lo.y, hi.y, lo.z, hi.z)
        )
    # 检查相邻层是否有悬空：上层底面应接近或低于下层顶面。
    boxes = [world_bounds(o) for o in parts]
    for i in range(1, len(parts)):
        gap = boxes[i][0].z - boxes[i - 1][1].z
        if gap > 0.02:
            print("GAP_ABOVE", parts[i].name, round(gap, 4))
    print("DIAG_DONE")


main()
