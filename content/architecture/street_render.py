"""街景合成渲染（串行，单独一次 Blender 运行）。

导入 8 个底子 GLB 各一次，其余实例用链接复制（共享同一 mesh 数据，
不重复打包几何），按 variant-instances.json 前 8 间布置成一条街：
北侧临街面朝南（0°）、南侧朝北（180°），同类隔开、相邻不同底子不同招牌
（生成脚本已断言）。
输出：白天 / 黄昏 / 夜里 3 张街景图（同一机位、只换光照与天色）。
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--outdir", required=True)
    p.add_argument("--variants", required=True)
    p.add_argument("--glbdir", required=True)
    return p.parse_args(argv)


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for b in list(coll):
            try:
                coll.remove(b)
            except Exception:
                pass


def ground_mat():
    mat = bpy.data.materials.new("mat_street_ground")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.45, 0.42, 0.38, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.95
    return mat


def setup_camera(scene):
    cam_data = bpy.data.cameras.new("street_cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("street_cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    return cam


def look_at(cam, target):
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()


def render(scene, path):
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def main():
    args = parse_args()
    clear()
    scene = bpy.context.scene
    # 与单体验收图一致：本机无 libEGL，改用已实测可用的 Cycles CPU。
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 32
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 84
    with open(args.variants, encoding="utf-8") as fh:
        variants = json.load(fh)
    instances = variants["instances"][:8]
    # 地面
    bpy.ops.mesh.primitive_plane_add(size=220, location=(0, 0, -0.01))
    g = bpy.context.object
    g.name = "street_ground"
    g.data.materials.append(ground_mat())
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(12.0, 0.0, 0.005))
    strip = bpy.context.object
    strip.name = "street_paving"
    strip.scale = (65.0, 5.5, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    smat = bpy.data.materials.new("mat_street_paving")
    smat.use_nodes = True
    smat.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = (0.32, 0.30, 0.27, 1.0)
    smat.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value = 0.95
    strip.data.materials.append(smat)
    # 导入底子（每底子一次），实例链接复制共享 mesh
    cache = {}
    placed = []
    for inst in instances:
        bid = inst["base_id"]
        if bid not in cache:
            before = set(bpy.context.scene.objects)
            bpy.ops.import_scene.gltf(filepath=os.path.join(args.glbdir, bid + ".glb"))
            new = [o for o in bpy.context.scene.objects if o not in before and o.type == "MESH"]
            assert new, "no mesh imported for %s" % bid
            cache[bid] = new[0]
            # 先把源件移到原点外备用区，实例用复制件
            cache[bid].location = (0, 0, -50)
        src = cache[bid]
        dup = src.copy()
        dup.data = src.data  # 链接复制：共享几何
        bpy.context.collection.objects.link(dup)
        y = -7.5 if inst["side"] == "north" else 7.5
        dup.location = (inst["street_x_m"] - 30.0, y, 0.0)
        dup.rotation_euler.z = math.radians(inst["rotation_deg"])
        placed.append(dup)
    bpy.context.view_layer.update()
    cam = setup_camera(scene)
    cam.location = (-48.0, 0.0, 4.0)
    look_at(cam, (8.0, 0.0, 4.5))
    world = bpy.data.worlds.new("street_world")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    # 太阳（共用一盏，换角度/颜色/强度做三档）
    sun_data = bpy.data.lights.new("sun", "SUN")
    sun = bpy.data.objects.new("sun", sun_data)
    bpy.context.collection.objects.link(sun)
    setups = [
        ("day", (0.65, 0.72, 0.85, 1.0), 1.0, (1.0, 0.95, 0.85), 5.0, (45, 20, 60)),
        ("dusk", (0.95, 0.55, 0.30, 1.0), 0.45, (1.0, 0.55, 0.25), 2.2, (75, 10, 18)),
        ("night", (0.05, 0.08, 0.16, 1.0), 0.22, (1.0, 0.75, 0.45), 1.0, (30, 30, 50)),
    ]
    lanterns = []
    for i, inst in enumerate(instances):
        ld = bpy.data.lights.new("lantern_%d" % i, "POINT")
        ld.energy = 0.0
        ld.shadow_soft_size = 0.5
        lo = bpy.data.objects.new("lantern_%d" % i, ld)
        y = -7.5 if inst["side"] == "north" else 7.5
        lo.location = (inst["street_x_m"] - 30.0, y + (-1.5 if inst["side"] == "north" else 1.5), 2.6)
        bpy.context.collection.objects.link(lo)
        lanterns.append(ld)
    for tag, wcol, wstr, scol, senergy, srot in setups:
        bg.inputs[0].default_value = wcol
        bg.inputs[1].default_value = wstr
        sun_data.color = scol
        sun_data.energy = senergy
        sun.rotation_euler = (math.radians(srot[0]), math.radians(srot[1]), math.radians(srot[2]))
        for ld in lanterns:
            ld.energy = 300.0 if tag == "night" else (40.0 if tag == "dusk" else 0.0)
        render(scene, os.path.join(args.outdir, "street-%s.jpg" % tag))
        print("STREET_OK %s" % tag)
    print("STREET_DONE placed=%d shared_meshes=%d" % (len(placed), len(cache)))


if __name__ == "__main__":
    main()
