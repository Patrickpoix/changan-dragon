"""通宵建筑原型建造脚本（2026-11-05）。

复用仓库 content/architecture/tang_kit.py 的参数化构件（铺面/酒肆/殿堂），
只改参数（开间、材等、档位）与附加构件（招牌、炉台、烟囱、灯笼、香炉等），
不手捏、不复制任何外部模型。

材质：只用 build_kit.py 同款语义材质名（mat_*），不引入新贴图包，
运行时可由 kit-loader 的共享 PBR 贴图映射接管；不为每间房打包新贴图。

用法（串行、单次只跑一个 Blender）：
    blender -b -P overnight_build.py -- --out <dir> --tang <tang_kit.py所在目录>
每类 2 个底子，共 8 个 GLB；每底子 4 张验收图（正面/斜角/侧面/俯瞰）。
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tang_kit as kit


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("--tang", default=os.path.dirname(os.path.abspath(__file__)))
    return p.parse_args(argv)


def materials():
    # 与仓库 build_kit.py kit_materials() 同名同色系，新增构件不另起材质名。
    return {
        "wood": kit.make_material("mat_timber", kit.srgb(0x8A5A3C), 0.72),
        "block": kit.make_material("mat_bracket_block", kit.srgb(0x9A6544), 0.70),
        "vermilion": kit.make_material("mat_vermilion", kit.srgb(0xA8483C), 0.68),
        "stone": kit.make_material("mat_stone", kit.srgb(0xC9C0AE), 0.85),
        "tile": kit.make_material("mat_roof_tile", kit.srgb(0x6E6B63), 0.78),
        "roof": kit.make_material("mat_roof_surface", kit.srgb(0x5E6360), 0.74),
        "ridge": kit.make_material("mat_roof_ridge", kit.srgb(0x4A504E), 0.70),
        "plaster": kit.make_material("mat_plaster", kit.srgb(0xD8CEBB), 0.82),
        "cloth": kit.make_material("mat_cloth", kit.srgb(0xC9553F), 0.86),
        "interior": kit.make_material("mat_interior", kit.srgb(0x3A3028), 0.92),
    }


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    j = bpy.context.object
    j.name = name
    return j


def bounds(obj):
    bpy.context.view_layer.update()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for c in obj.bound_box:
        w = obj.matrix_world @ Vector(c)
        lo = Vector((min(lo[i], w[i]) for i in range(3)))
        hi = Vector((max(hi[i], w[i]) for i in range(3)))
    return (lo + hi) / 2.0, (hi - lo).length / 2.0, lo, hi


def ground(size, mats):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, -0.002))
    g = bpy.context.object
    g.name = "review_ground"
    g.data.materials.append(mats["stone"])


def setup_render(size):
    # 本机无 libEGL，EEVEE/Workbench 无法初始化；改用已实测可用的 Cycles CPU。
    # 采样压低、分辨率 960x720，属验收图而非成品渲染，串行单跑。
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.render.resolution_x = 960
    scene.render.resolution_y = 720
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Standard"
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 84
    world = bpy.data.worlds.new("review_world")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.36, 0.37, 0.39, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    ld = bpy.data.lights.new("sun", "SUN")
    ld.energy = 3.0
    lo = bpy.data.objects.new("sun", ld)
    lo.rotation_euler = (math.radians(50), math.radians(20), math.radians(30))
    bpy.context.collection.objects.link(lo)
    cam_data = bpy.data.cameras.new("review_cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("review_cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    return cam


def place_camera(cam, target, size, az, el, zoom=1.25):
    fov = 2.0 * math.atan(cam.data.sensor_width / (2.0 * cam.data.lens))
    dist = (size * zoom) / math.tan(fov / 2.0)
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    cam.location = Vector(target) + d * dist
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()


def render_to(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def export_glb(path, obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True,
        export_apply=True, export_yup=True,
    )


def count_tris(obj):
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


# ---- 附加构件：全部用共享语义材质，不新增材质名 ----
def sign_board(name, mats, x, front_y, z, vertical, mat_key, eave_z):
    # 验收发现：横招牌只用 0.5m 短杆会悬在空中。改为吊杆直通檐下，
    # 竖招牌同理，杆长由檐高决定，不再写死。
    parts = []
    if vertical:
        parts.append(kit.box("%s_sign" % name, (0.55, 0.08, 1.7), mats[mat_key], (x, front_y + 0.42, z)))
        rod = max(0.2, eave_z - (z + 0.85))
        parts.append(kit.box("%s_sign_pole" % name, (0.07, 0.07, rod), mats["wood"], (x, front_y + 0.20, z + 0.85 + rod / 2)))
    else:
        parts.append(kit.box("%s_sign" % name, (1.9, 0.08, 0.55), mats[mat_key], (x, front_y + 0.42, z)))
        rod = max(0.2, eave_z - (z + 0.275))
        for sx in (-0.85, 0.85):
            parts.append(kit.box("%s_sign_pole_%s" % (name, "l" if sx < 0 else "r"), (0.07, 0.07, rod), mats["wood"], (x + sx, front_y + 0.20, z + 0.275 + rod / 2)))
    return parts


def forge_props(name, mats, dx, dy, h):
    front_y = dy / 2.0
    p = []
    # 侧烟囱：贴在建筑左侧外，不穿屋顶
    p.append(kit.box("%s_chimney" % name, (0.7, 0.7, h + 1.1), mats["stone"], (-dx / 2 - 0.75, 0.0, (h + 1.1) / 2)))
    p.append(kit.box("%s_chimney_cap" % name, (0.9, 0.9, 0.18), mats["tile"], (-dx / 2 - 0.75, 0.0, h + 1.1 + 0.09)))
    p.append(kit.box("%s_chimney_mouth" % name, (0.4, 0.4, 0.1), mats["interior"], (-dx / 2 - 0.75, 0.0, h + 1.22)))
    # 炉台（临街左前方）+ 炉口暗色
    p.append(kit.box("%s_furnace" % name, (1.1, 0.9, 1.15), mats["stone"], (-dx * 0.28, front_y + 0.95, 0.575)))
    p.append(kit.box("%s_furnace_mouth" % name, (0.7, 0.12, 0.55), mats["interior"], (-dx * 0.28, front_y + 1.42, 0.45)))
    # 铁砧：深灰瓦色材质作铁色（不新增材质名），木墩承托
    p.append(kit.box("%s_anvil_base" % name, (0.55, 0.55, 0.55), mats["wood"], (dx * 0.24, front_y + 0.85, 0.275)))
    p.append(kit.box("%s_anvil" % name, (0.85, 0.28, 0.28), mats["tile"], (dx * 0.24, front_y + 0.85, 0.69)))
    # 淬火桶 + 水槽
    p.append(kit.cylinder("%s_quench" % name, 0.36, 0.8, mats["wood"], (dx * 0.42, front_y + 0.75, 0.4), axis="z"))
    p.append(kit.box("%s_trough" % name, (1.0, 0.45, 0.35), mats["wood"], (-dx * 0.05, front_y + 1.05, 0.175)))
    return p


def tavern_props(name, mats, dx, dy, h):
    front_y = dy / 2.0
    p = []
    # 酒旗：杆 + 下垂布旗（布色材质），立于临街右前方
    p.append(kit.box("%s_flag_pole" % name, (0.08, 0.08, h * 0.75), mats["wood"], (dx * 0.38, front_y + 0.7, h * 0.375)))
    p.append(kit.box("%s_flag" % name, (0.08, 1.05, 0.62), mats["cloth"], (dx * 0.38, front_y + 1.15, h * 0.62)))
    # 门前酒坛两只
    for sx in (-0.32, 0.32):
        p.append(kit.cylinder("%s_jar_%s" % (name, "l" if sx < 0 else "r"), 0.32, 0.75, mats["vermilion"], (dx * sx, front_y + 0.65, 0.375), axis="z"))
    # 门前灯笼：验收发现无支撑会悬空，改为落地灯杆（杆直通灯底）。
    lz = h * 0.55
    p.append(kit.box("%s_lantern_post" % name, (0.09, 0.09, lz - 0.21), mats["wood"], (-dx * 0.38, front_y + 0.55, (lz - 0.21) / 2)))
    p.append(kit.box("%s_lantern" % name, (0.28, 0.28, 0.42), mats["vermilion"], (-dx * 0.38, front_y + 0.55, lz)))
    return p


def hall_props(name, mats, dx, dy, h):
    front_y = dy / 2.0
    p = []
    # 两座石灯分列台阶两侧
    for sx in (-1, 1):
        x = sx * dx * 0.30
        p.append(kit.box("%s_lantern_base" % name + ("_l" if sx < 0 else "_r"), (0.55, 0.55, 0.5), mats["stone"], (x, front_y + 1.1, 0.25)))
        p.append(kit.box("%s_lantern_shaft" % name + ("_l" if sx < 0 else "_r"), (0.36, 0.36, 0.9), mats["stone"], (x, front_y + 1.1, 0.95)))
        p.append(kit.box("%s_lantern_top" % name + ("_l" if sx < 0 else "_r"), (0.6, 0.6, 0.35), mats["stone"], (x, front_y + 1.1, 1.55)))
        p.append(kit.box("%s_lantern_cap" % name + ("_l" if sx < 0 else "_r"), (0.75, 0.75, 0.18), mats["tile"], (x, front_y + 1.1, 1.8)))
    # 香炉：居中于台阶前
    p.append(kit.cylinder("%s_burner" % name, 0.5, 0.7, mats["stone"], (0.0, front_y + 1.3, 0.35), axis="z"))
    p.append(kit.cylinder("%s_burner_rim" % name, 0.58, 0.12, mats["tile"], (0.0, front_y + 1.3, 0.72), axis="z"))
    # 供桌
    p.append(kit.box("%s_table" % name, (1.6, 0.7, 0.12), mats["wood"], (0.0, front_y + 0.55, 0.85)))
    for sx in (-1, 1):
        p.append(kit.box("%s_table_leg_%s" % (name, "l" if sx < 0 else "r"), (0.12, 0.12, 0.8), mats["wood"], (sx * 0.7, front_y + 0.55, 0.4)))
    return p


SPECS = [
    # (id, 类别, 招牌, 建造函数, 附加构件, 招牌形式/材质)
    ("blacksmith-a", "blacksmith", "铁匠铺·打铁", "shop", dict(bays=2, storey=1, grade=0.22), "forge", ("vertical", "vermilion")),
    ("blacksmith-b", "blacksmith", "铁匠铺·精铁", "shop", dict(bays=3, storey=2, grade=0.24), "forge", ("horizontal", "tile")),
    ("shop-a", "shop", "杂货铺", "shop", dict(bays=2, storey=0, grade=0.22), "sign", ("vertical", "wood")),
    ("shop-b", "shop", "绸缎庄", "shop", dict(bays=3, storey=1, grade=0.22), "sign", ("horizontal", "vermilion")),
    ("tavern-a", "tavern", "酒肆·醉仙楼", "townhouse", dict(bays=3, grade=0.22), "tavern", ("vertical", "vermilion")),
    ("tavern-b", "tavern", "酒肆·望江楼", "townhouse", dict(bays=2, grade=0.26), "tavern", ("horizontal", "wood")),
    ("hall-a", "hall", "道馆·清虚观", "hall", dict(modules=(3, 2), grade=0.30), "hall", ("horizontal", "tile")),
    ("hall-b", "hall", "殿堂·三清殿", "hall", dict(modules=(5, 2), grade=0.30), "hall", ("vertical", "vermilion")),
]


def build_base(pid, kind, params, mats):
    if kind == "shop":
        return kit.build_shop(pid, bays=params["bays"], grade=params["grade"], materials=mats, storey=params["storey"])
    if kind == "townhouse":
        return kit.build_townhouse(pid, bays=params["bays"], grade=params["grade"], materials=mats)
    if kind == "hall":
        return kit.build_hall(pid, modules=params["modules"], grade=params["grade"], materials=mats)
    raise ValueError(kind)


def main():
    args = parse_args()
    out_dir = os.path.abspath(args.out)
    shots_dir = os.path.join(out_dir, "review")
    os.makedirs(shots_dir, exist_ok=True)
    report = {"prototypes": [], "materials": "shared mat_* only, no per-building texture pack",
              "note": "原创参数化原型；未复制任何外部模型或受限素材"}
    for pid, cat, sign, kind, params, extra, (sign_form, sign_mat) in SPECS:
        kit.reset_scene()
        mats = materials()
        base = build_base(pid, kind, params, mats)
        joined = join(base, pid)
        bpy.context.view_layer.update()
        dx, dy, dz = joined.dimensions.x, joined.dimensions.y, joined.dimensions.z
        center, radius, lo, hi = bounds(joined)
        extras = []
        if extra == "forge":
            extras = forge_props(pid, mats, dx, dy, dz)
            extras += sign_board(pid, mats, dx * 0.38, dy / 2.0, dz * 0.62, sign_form == "vertical", sign_mat, dz * 0.88)
        elif extra == "tavern":
            extras = tavern_props(pid, mats, dx, dy, dz)
            extras += sign_board(pid, mats, -dx * 0.22, dy / 2.0, dz * 0.66, sign_form == "vertical", sign_mat, dz * 0.88)
        elif extra == "hall":
            extras = hall_props(pid, mats, dx, dy, dz)
            extras += sign_board(pid, mats, 0.0, dy / 2.0, dz * 0.52, sign_form == "vertical", sign_mat, dz * 0.80)
        else:  # general shop: only sign
            extras = sign_board(pid, mats, dx * 0.30, dy / 2.0, dz * 0.62, sign_form == "vertical", sign_mat, dz * 0.88)
        all_parts = [joined] + extras
        final = join(all_parts, pid)
        bpy.context.view_layer.update()
        center, radius, lo, hi = bounds(final)
        cam = setup_render(max(dx, dy))
        ground(max(dx, dy) * 6.0, mats)
        for shot, az, el in (("front", 180.0, 7.0), ("three-quarter", 148.0, 16.0),
                             ("side", 90.0, 10.0), ("aerial", 205.0, 45.0)):
            place_camera(cam, center, radius, az, el, zoom=1.15)
            render_to(os.path.join(shots_dir, "%s-%s.jpg" % (pid, shot)))
        glb = os.path.join(out_dir, pid + ".glb")
        export_glb(glb, final)
        report["prototypes"].append({
            "id": pid, "category": cat, "sign": sign, "sign_form": sign_form, "sign_material": sign_mat,
            "params": {k: (list(v) if isinstance(v, tuple) else v) for k, v in params.items()},
            "dimensions_m": [round(float(v), 3) for v in final.dimensions],
            "height_m": round(float(hi[2] - lo[2]), 3),
            "triangles": count_tris(final),
            "glb": os.path.basename(glb),
            "glb_bytes": os.path.getsize(glb),
            "roof": "hip" if kind == "hall" else "gable",
        })
        print("PROTOTYPE_OK %s tris=%d dims=%s" % (pid, report["prototypes"][-1]["triangles"], report["prototypes"][-1]["dimensions_m"]))
    with open(os.path.join(out_dir, "prototype-report.json"), "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
    print("OVERNIGHT_BUILD_OK %d prototypes" % len(report["prototypes"]))


if __name__ == "__main__":
    main()
