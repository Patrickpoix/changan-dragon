"""诊断屋面：验证举折曲线、翼角起翘与瓦垄是否落在屋面之上。

用法：
    blender -b -P content/architecture/diagnose_roof.py
"""

import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tang_kit as kit


def main():
    kit.reset_scene()
    mats = {
        "roof": kit.make_material("mat_roof", kit.srgb(0x5E6360), 0.74),
        "ridge": kit.make_material("mat_ridge", kit.srgb(0x4A504E), 0.70),
        "wood": kit.make_material("mat_timber", kit.srgb(0x8A5A3C), 0.72),
        "tile": kit.make_material("mat_tile", kit.srgb(0x6E6B63), 0.78),
    }
    m = kit.TangModule(0.30)
    half_w, half_d = m.f(150), m.f(210)
    overhang, rise = m.f(90), m.f(115)
    parts = kit.build_hip_roof("roof", half_w, half_d, overhang, rise, mats)
    bpy.context.view_layer.update()

    # 举折曲线：檐口 0、脊部 rise，中段应为凹曲（中点低于直线）。
    run = half_w + overhang
    profile = kit.juzhe_profile(10)
    print("JUZHE mid_height_ratio=%.3f (straight would be 0.5)" % profile[5][1])
    print("JUZHE eave=%.3f ridge=%.3f" % (profile[0][1], profile[-1][1]))

    rolls = [o for o in parts if "rolls" in o.name]
    surface = [o for o in parts if "slope_" in o.name]
    print("PARTS slopes=%d rolls=%d" % (len(surface), len(rolls)))

    # 瓦垄顶点是否普遍高于屋面：取屋面在相同 (x,y) 的插值高度做粗校验。
    def surface_z_at(x, y):
        """前坡（-X 侧）屋面在给定水平位置的解析高度。"""
        # 沿举折方向：t 由 x 在 [-W, 0] 内线性映射
        W = half_w + overhang
        t = (x + W) / W if W else 0.0
        t = max(0.0, min(1.0, t))
        return rise * (t ** 1.45)

    for roll in rolls:
        above = 0
        below = 0
        samples = 0
        for vert in roll.data.vertices:
            world = roll.matrix_world @ vert.co
            if world.x > 0:
                continue
            samples += 1
            if world.z >= surface_z_at(world.x, world.y) - 1e-4:
                above += 1
            else:
                below += 1
        print("ROLLS %s samples=%d above=%d below=%d" % (roll.name, samples, above, below))

    # 垄的横向展开方向应与檐口方向一致
    for roll in rolls:
        verts = [roll.matrix_world @ v.co for v in roll.data.vertices]
        if not verts:
            continue
        xs = [v.x for v in verts]
        ys = [v.y for v in verts]
        print(
            "ROLL_SPAN %s x=[%.2f,%.2f] y=[%.2f,%.2f]"
            % (roll.name, min(xs), max(xs), min(ys), max(ys))
        )
    print("DIAG_ROOF_DONE")


main()
