"""诊断市井店铺装配：墙高、柱高、铺作层与屋顶标高是否连续。

用法：
    blender -b -P content/architecture/diagnose_shop.py
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
            "roof", "ridge", "cloth",
        )
    }
    m = kit.TangModule(0.22)
    parts = kit.build_shop("shop", bays=2, grade=m.cai, materials=mats)
    bpy.context.view_layer.update()
    print("TOTAL_PARTS", len(parts))

    def report(label, objs):
        if not objs:
            print("GROUP %-18s (none)" % label)
            return
        lo = Vector((1e9, 1e9, 1e9))
        hi = Vector((-1e9, -1e9, -1e9))
        for obj in objs:
            a, b = bounds(obj)
            lo = Vector((min(lo[i], a[i]) for i in range(3)))
            hi = Vector((max(hi[i], b[i]) for i in range(3)))
        print(
            "GROUP %-18s n=%3d x=[%6.2f,%6.2f] y=[%6.2f,%6.2f] z=[%5.2f,%5.2f]"
            % (label, len(objs), lo.x, hi.x, lo.y, hi.y, lo.z, hi.z)
        )

    report("walls", [o for o in parts if "_wall_" in o.name])
    report("lattice", [o for o in parts if "lattice" in o.name])
    report("columns", [o for o in parts if "_col_" in o.name])
    report("puzuo", [o for o in parts if "_pz_" in o.name])
    report("roof", [o for o in parts if "_roof_" in o.name or "slope" in o.name])
    report("zhengji", [o for o in parts if "zhengji" in o.name])
    report("chiwei", [o for o in parts if "chiwei" in o.name])
    report("awning", [o for o in parts if "awning" in o.name])

    # 关键连续性：墙顶应接近铺作底；铺作顶应接近屋顶檐口
    walls = [o for o in parts if "_wall_" in o.name]
    puzuo = [o for o in parts if "_pz_" in o.name]
    roof = [o for o in parts if "rolls" in o.name]
    if walls and puzuo:
        wall_top = max(bounds(o)[1].z for o in walls)
        pz_bot = min(bounds(o)[0].z for o in puzuo)
        print("CONTINUITY wall_top=%.3f puzuo_bottom=%.3f gap=%.3f" % (wall_top, pz_bot, pz_bot - wall_top))
    if puzuo and roof:
        pz_top = max(bounds(o)[1].z for o in puzuo)
        roof_bot = min(bounds(o)[0].z for o in roof)
        print("CONTINUITY puzuo_top=%.3f roof_bottom=%.3f gap=%.3f" % (pz_top, roof_bot, roof_bot - pz_top))
        # 逐件列出低于安装面的构件，定位穿模的是哪一件
        for obj in roof:
            low = bounds(obj)[0].z
            if low < pz_top - 1e-3:
                print("  BELOW %-42s min_z=%.3f (%.3f below mount)" % (obj.name, low, pz_top - low))
        for obj in parts:
            if obj in roof or obj in puzuo:
                continue
            low = bounds(obj)[0].z
            if low < pz_top - 1e-3 and "pz_" not in obj.name:
                pass
    print("DIAG_SHOP_DONE")


main()
