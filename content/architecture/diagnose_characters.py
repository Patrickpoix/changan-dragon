"""诊断准备研究台里两位成人网格的松散部件与手臂范围。

用法：
    blender -b --disable-autoexec -P content/architecture/diagnose_characters.py

人物导出没有骨骼（assembly.glb 本身无 skin/动画），袖子是按对象整体旋转的。
本脚本回答一个具体问题：手是否与头颈同属一个网格、能否按松散部件或空间
范围单独摆下。这是诊断，不修改任何源文件。
"""

import os

import bpy
import bmesh
from mathutils import Vector


SOURCE = os.path.abspath(
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "assets",
        "library",
        "preparation-study",
        "assembly.glb",
    )
)


def loose_part_report(obj):
    """按连通性把手/头分成独立部件，并回报各自的包围盒。"""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    seen = set()
    parts = []
    for vertex in bm.verts:
        if vertex.index in seen:
            continue
        stack = [vertex]
        seen.add(vertex.index)
        group = []
        while stack:
            current = stack.pop()
            group.append(current)
            for edge in current.link_edges:
                other = edge.other_vert(current)
                if other.index not in seen:
                    seen.add(other.index)
                    stack.append(other)
        lo = Vector((1e9, 1e9, 1e9))
        hi = Vector((-1e9, -1e9, -1e9))
        for member in group:
            world = obj.matrix_world @ member.co
            lo = Vector((min(lo[i], world[i]) for i in range(3)))
            hi = Vector((max(hi[i], world[i]) for i in range(3)))
        parts.append(
            {
                "verts": len(group),
                "lo": tuple(round(v, 3) for v in lo),
                "hi": tuple(round(v, 3) for v in hi),
                "size": tuple(round(hi[i] - lo[i], 3) for i in range(3)),
                "center": tuple(round((hi[i] + lo[i]) / 2, 3) for i in range(3)),
            }
        )
    bm.free()
    parts.sort(key=lambda p: -p["verts"])
    return parts


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SOURCE)
    for name in ("round_collar_resident", "ruqun_resident"):
        root = bpy.data.objects.get(name) or next(
            (
                o
                for o in bpy.context.scene.objects
                if o.name.replace(" ", "_").startswith(name)
            ),
            None,
        )
        if root is None:
            print("MISSING", name)
            continue
        keep = {root}
        for child in root.children_recursive:
            keep.add(child)
        print("=== " + name)
        for obj in sorted(keep, key=lambda o: o.name):
            if obj.type != "MESH":
                continue
            bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
            lo = Vector((min(b[i] for b in bounds) for i in range(3)))
            hi = Vector((max(b[i] for b in bounds) for i in range(3)))
            print(
                "  %-58s tris=%-6d size=%s lo=%s"
                % (
                    obj.name,
                    len(obj.data.loop_triangles) if obj.data.loop_triangles else 0,
                    tuple(round(hi[i] - lo[i], 3) for i in range(3)),
                    tuple(round(v, 3) for v in lo),
                )
            )
            if "head" in obj.name.lower() or "hand" in obj.name.lower():
                parts = loose_part_report(obj)
                print("        loose parts:", len(parts))
                for part in parts:
                    print("        loose", part)


main()
