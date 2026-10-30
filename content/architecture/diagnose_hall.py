"""诊断殿堂装配：验证柱、墙、格扇、铺作、屋顶各层的实际位置与尺寸。

用法：
    blender -b -P content/architecture/diagnose_hall.py
"""

import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tang_kit as kit


def bounds(obj):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for corner in obj.bound_box:
        p = obj.matrix_world @ Vector(corner)
        lo = Vector((min(lo[i], p[i]) for i in range(3)))
        hi = Vector((max(hi[i], p[i]) for i in range(3)))
    return lo, hi


def main():
    kit.reset_scene()
    mats = {
        key: kit.make_material("mat_" + key, kit.srgb(0x888888), 0.8)
        for key in (
            "wood", "block", "tile", "stone", "plaster", "vermilion",
            "roof", "ridge",
        )
    }
    m = kit.TangModule(0.30)
    parts = kit.build_hall("hall", modules=(3, 2), grade=m.cai, materials=mats)
    bpy.context.view_layer.update()

    groups = {}
    for obj in parts:
        key = obj.name.split("_", 2)[-1].split("_")[0]
        groups.setdefault(key, []).append(obj)
    print("TOTAL_PARTS", len(parts))
    for key in sorted(groups):
        objs = groups[key]
        lo = Vector((1e9, 1e9, 1e9))
        hi = Vector((-1e9, -1e9, -1e9))
        for obj in objs:
            a, b = bounds(obj)
            lo = Vector((min(lo[i], a[i]) for i in range(3)))
            hi = Vector((max(hi[i], b[i]) for i in range(3)))
        print(
            "GROUP %-14s n=%3d x=[%7.2f,%7.2f] y=[%7.2f,%7.2f] z=[%7.2f,%7.2f]"
            % (key, len(objs), lo.x, hi.x, lo.y, hi.y, lo.z, hi.z)
        )

    # 格扇必须立在 XZ 平面（厚度沿 Y），否则就是躺在地上
    lattices = [o for o in parts if "lattice" in o.name]
    for obj in lattices:
        lo, hi = bounds(obj)
        dx, dy, dz = hi.x - lo.x, hi.y - lo.y, hi.z - lo.z
        ok = dz > dy * 3 and dx > dy * 3
        print(
            "LATTICE %-24s w=%5.2f thick=%5.2f h=%5.2f standing=%s"
            % (obj.name, dx, dy, dz, "YES" if ok else "NO")
        )

    walls = [o for o in parts if "_wall_" in o.name or "transom" in o.name]
    for obj in walls:
        lo, hi = bounds(obj)
        print(
            "WALL %-26s x=[%6.2f,%6.2f] y=[%6.2f,%6.2f] z=[%5.2f,%5.2f]"
            % (obj.name, lo.x, hi.x, lo.y, hi.y, lo.z, hi.z)
        )
    print("DIAG_HALL_DONE")


main()
