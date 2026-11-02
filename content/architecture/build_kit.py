"""构建唐构构件并导出 GLB + 多角度验收图。

用法：
    blender -b -P content/architecture/build_kit.py -- --out assets/kit/architecture

每次构建都会重写输出目录，保证 GLB 与验收图来自同一份代码。
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh
import mathutils
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tang_kit as kit


def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1 :] if "--" in argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="assets/kit/architecture")
    parser.add_argument("--only", default="all")
    return parser.parse_args(argv)


def kit_materials():
    """构件共用的语义材质。运行时按名字映射到共享 PBR 贴图，不逐件带纹理。"""
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
        # 铺面内壁：格扇后面那层暗色面，不能与外墙同色，否则格眼后面一片白。
        "interior": kit.make_material("mat_interior", kit.srgb(0x3A3028), 0.92),
    }


def build_roof_module(m, mats, name="roof_pudian"):
    """庑殿顶。出檐深远、屋面平缓、翼角起翘，是唐式最鲜明的轮廓。"""
    half_w = m.f(150)          # 进深方向半宽
    half_d = m.f(210)          # 面阔方向半长
    overhang = m.f(90)         # 出檐（唐式深远）
    rise = m.f(115)            # 举高（比明清平缓）
    return kit.build_hip_roof(name, half_w, half_d, overhang, rise, mats)


def build_hall_module(m, mats, name="hall_kaijian", modules=(3, 2)):
    """完整殿堂：台基 + 柱网 + 铺作 + 庑殿顶。这是判断整体比例的关键样板。"""
    return kit.build_hall(name, modules=modules, grade=m.cai, materials=mats)


def build_shop_module(m, mats, name="shop_san", bays=2, has_upper=False, storey=1):
    """市井店铺：与殿宇同一套构件、不同材等与屋顶形制。"""
    return kit.build_shop(
        name, bays=bays, grade=m.cai, materials=mats,
        has_upper=has_upper, storey=storey,
    )


def build_townhouse_module(m, mats, name="tavern_san", bays=3):
    """两层酒肆：楼板、楼廊、二层格窗与完整悬山顶。"""
    return kit.build_townhouse(name, bays=bays, grade=m.cai, materials=mats)


def build_puzuo_module(m, mats, name="puzuo_wupuzuo"):
    return kit.build_puzuo(name, m, materials=mats)


def build_puzuo_low(m, mats, name="puzuo_sipuzuo"):
    """四铺作单抄：等级较低的建筑用，出跳少一跳。"""
    return kit.build_puzuo(name, m, materials=mats, tiao_count=1)


def build_column_module(m, mats):
    """柱 + 柱础，作为一根完整柱子导出。"""
    h = m.f(300)
    d = m.f(42)
    plinth_h = m.f(20)
    plinth = kit.build_plinth("plinth", d * 1.5, plinth_h, mats["stone"])
    col = kit.build_column("column", h, d, mats["vermilion"])
    col.location = (0.0, 0.0, plinth_h)
    return [plinth, col]


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


def setup_render(target_size):
    """三点布光 + 中性灰背景，用于判断形体而不是判断气氛。"""
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 900
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Standard"
    # 验收图是工程证据，不是成品美术图：压成 JPEG 控制仓库体积，
    # 44 张全角度留档也只需数 MB。
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 86
    world = bpy.data.worlds.new("review_world")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.36, 0.37, 0.39, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.9

    for name, loc, energy, size in (
        ("key", (3.2, -3.4, 4.2), 900.0, 3.0),
        ("fill", (-3.6, -2.4, 1.6), 220.0, 4.0),
        ("rim", (-1.0, 3.6, 3.0), 420.0, 3.0),
    ):
        light_data = bpy.data.lights.new(name, "AREA")
        light_data.energy = energy
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = loc
        light.rotation_euler = _aim(loc)
        bpy.context.collection.objects.link(light)

    cam_data = bpy.data.cameras.new("review_cam")
    cam_data.lens = 60
    cam = bpy.data.objects.new("review_cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    return cam


def _aim(location):
    from mathutils import Vector

    direction = Vector((0, 0, 1.2)) - Vector(location)
    rot = direction.to_track_quat("-Z", "Y").to_euler()
    return rot


def place_camera(cam, target, size, azimuth_deg, elevation_deg, zoom=1.35):
    """按目标包围球自动退到能装下物体的距离，避免手工调参裁切。"""
    from mathutils import Vector

    cam_data = cam.data
    sensor = cam_data.sensor_width
    fov = 2.0 * math.atan(sensor / (2.0 * cam_data.lens))
    distance = (size * zoom) / math.tan(fov / 2.0)
    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    direction = Vector(
        (
            math.sin(az) * math.cos(el),
            -math.cos(az) * math.cos(el),
            math.sin(el),
        )
    )
    cam.location = Vector(target) + direction * distance
    look = Vector(target) - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()


def bounds(objects):
    from mathutils import Vector

    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            lo = Vector((min(lo[i], world[i]) for i in range(3)))
            hi = Vector((max(hi[i], world[i]) for i in range(3)))
    center = (lo + hi) / 2.0
    radius = (hi - lo).length / 2.0
    return center, radius, lo, hi


def add_ruler(length_m, material, position=(0, 0, 0.001)):
    """在侧方摆一根真实米尺，用于判断构件尺度是否可信。"""
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    bar = bpy.context.object
    bar.name = "scale_ruler"
    bar.scale = (length_m / 2.0, 0.02, 0.006)
    bpy.ops.object.transform_apply(scale=True)
    bar.location = (position[0], position[1], position[2])
    bar.data.materials.append(material)
    return bar


def render_to(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def export_glb(path, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )


def count_triangles(objects):
    total = 0
    for obj in objects:
        mesh = obj.data
        mesh.calc_loop_triangles()
        total += len(mesh.loop_triangles)
    return total


def export_character_types(out_dir):
    """从现有 preparation-study 组合中单独抽出两位自然成人研究人物。

    这不是把整张研究台搬进首街。两位人物来自同一 GLB 中已实际检查的
    MakeHuman CC0 基体与项目唐服试片；原组合保留不动，只按节点选择导出
    独立运行文件，方便首街共享几何与变换。
    """
    source = os.path.abspath(
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "assets",
            "library",
            "preparation-study",
            "assembly.glb",
        )
    )
    if not os.path.isfile(source):
        raise FileNotFoundError("missing character study: " + source)
    records = []
    for node, output, label in (
        ("round_collar_resident", "resident-male.glb", "round_collar_male"),
        ("ruqun_resident", "resident-female.glb", "ruqun_female"),
    ):
        kit.reset_scene()
        bpy.ops.import_scene.gltf(filepath=source)
        root = bpy.data.objects.get(node)
        if root is None:
            normalized = node.replace("_", " ")
            root = next(
                (
                    obj
                    for obj in bpy.context.scene.objects
                    if obj.name == normalized
                    or obj.name.replace(" ", "_") == node
                    or obj.name.startswith(normalized)
                ),
                None,
            )
        if root is None:
            raise RuntimeError("character node missing: " + node)
        # 只保留该人物对象树，其他研究台内容不进入独立运行 GLB。
        keep = {root}
        for child in root.children_recursive:
            keep.add(child)
        for obj in list(bpy.context.scene.objects):
            if obj not in keep:
                bpy.data.objects.remove(obj, do_unlink=True)
        bpy.context.view_layer.update()
        meshes = [o for o in keep if o.type == "MESH"]

        def world_bounds(objects):
            """按实际顶点算世界包围盒。

            obj.bound_box 是缓存：逐顶点改动后不刷新，用它会把收拢前后的
            尺寸混在一起（实测 male 报告 1.139m，运行时只有 0.568m），
            并且会让后面的"水平居中、脚底归零"基于过期数据。
            """
            lo = Vector((1e9, 1e9, 1e9))
            hi = Vector((-1e9, -1e9, -1e9))
            for obj in objects:
                matrix = obj.matrix_world
                for vertex in obj.data.vertices:
                    point = matrix @ vertex.co
                    lo = Vector((min(lo[i], point[i]) for i in range(3)))
                    hi = Vector((max(hi[i], point[i]) for i in range(3)))
            return lo, hi

        # 手臂收拢：研究台人物是 A 字站姿，袖子与手各自向外张开，出现在街上
        # 就是"张开双臂"。人物没有骨骼可摆，所以按几何绕肩点旋转：
        # - 袖网格整体转；
        # - 手/前臂与头颈挤在同一个网格里，按连通件取出手臂部件再转。
        # 两者共用同一枢轴与角度，袖口与手的相对关系因此保持不变。
        rest_lo, rest_hi = world_bounds(meshes)
        body_center_x = (rest_lo.x + rest_hi.x) * 0.5
        shoulder_z = rest_lo.z + (rest_hi.z - rest_lo.z) * 0.74
        arm_tuck = math.radians(44.0)

        def arm_pivot(side):
            return Vector((body_center_x + side * 0.20, rest_lo.y, shoulder_z))

        def rotate_object_about(obj, pivot, angle):
            transform = (
                mathutils.Matrix.Translation(pivot)
                @ mathutils.Matrix.Rotation(angle, 4, "Y")
                @ mathutils.Matrix.Translation(-pivot)
            )
            obj.matrix_world = transform @ obj.matrix_world

        def loose_parts(obj):
            """按连通性把网格拆成独立部件，返回顶点索引列表。"""
            bm = bmesh.new()
            bm.from_mesh(obj.data)
            bm.verts.ensure_lookup_table()
            seen = set()
            groups = []
            for vertex in bm.verts:
                if vertex.index in seen:
                    continue
                stack = [vertex]
                seen.add(vertex.index)
                members = []
                while stack:
                    current = stack.pop()
                    members.append(current.index)
                    for edge in current.link_edges:
                        other = edge.other_vert(current)
                        if other.index not in seen:
                            seen.add(other.index)
                            stack.append(other)
                groups.append(members)
            bm.free()
            return groups

        def rotate_vertices(obj, indices, pivot, angle):
            world = obj.matrix_world.copy()
            inverse = world.inverted()
            rotation = mathutils.Matrix.Rotation(angle, 4, "Y")
            for index in indices:
                vertex = obj.data.vertices[index]
                point = world @ vertex.co
                vertex.co = inverse @ (pivot + (rotation @ (point - pivot)))
            obj.data.update()

        for obj in meshes:
            lower = obj.name.lower()
            if "sleeve" in lower:
                bounds = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
                center = sum(bounds, Vector()) / len(bounds)
                side = -1.0 if center.x < body_center_x else 1.0
                rotate_object_about(obj, arm_pivot(side), side * arm_tuck)
                continue
            if "head" not in lower:
                continue
            world = obj.matrix_world.copy()
            for members in loose_parts(obj):
                total = Vector()
                for index in members:
                    total += world @ obj.data.vertices[index].co
                center = total / len(members)
                # 头、颈、躯干干件贴近中线且位置高；只有横向远离中线的手/前臂
                # 属于手臂部件。
                if abs(center.x - body_center_x) < 0.30:
                    continue
                side = -1.0 if center.x < body_center_x else 1.0
                rotate_vertices(obj, members, arm_pivot(side), side * arm_tuck)
        bounds_lo, bounds_hi = world_bounds(meshes)
        # 研究台里的两位人物留在组合场景坐标上；独立导出必须水平居中、
        # 脚底归零，否则首街实例会被整体平移数米并插进店铺。
        origin = Vector(
            (
                (bounds_lo.x + bounds_hi.x) * 0.5,
                (bounds_lo.y + bounds_hi.y) * 0.5,
                bounds_lo.z,
            )
        )
        for obj in meshes:
            obj.matrix_world = mathutils.Matrix.Translation(-origin) @ obj.matrix_world
        bpy.context.view_layer.update()
        bounds_lo -= origin
        bounds_hi -= origin
        triangles = count_triangles(meshes)
        destination = os.path.join(out_dir, output)
        export_glb(destination, meshes)
        # 报告尺寸改为"重新导入导出的 GLB 再量"：导出会写入 Y-up 与节点
        # 旋转/缩放，直接在 Blender 里量内存对象得到的数字与渲染器最终看到的
        # 不一致（实测 male 报 1.139m、运行时只有 0.49m 宽）。
        kit.reset_scene()
        bpy.ops.import_scene.gltf(filepath=destination)
        # 导入后必须刷新依赖图，否则 matrix_world 仍是导入前的值，
        # 量出来的宽度会比运行时大（实测 male 报 0.799m，运行时 0.57m）。
        bpy.context.view_layer.update()
        exported_meshes = [
            o for o in bpy.context.scene.objects if o.type == "MESH"
        ]
        exported_lo, exported_hi = world_bounds(exported_meshes)
        records.append(
            {
                "id": label,
                "file": output,
                "triangles": triangles,
                "dimensions_m": tuple(
                    round(exported_hi[i] - exported_lo[i], 3) for i in range(3)
                ),
                "source": "assets/library/preparation-study/assembly.glb",
                "source_node": node,
                "third_party": "MakeHuman CC0 body and targets; project Tang clothing study",
                "visual_status": "study; sleeve/neck seams need production retopology",
            }
        )
    return records


def main():
    args = parse_args()
    out_dir = os.path.abspath(args.out)
    shots_dir = os.path.join(out_dir, "review")
    os.makedirs(shots_dir, exist_ok=True)

    # --only characters：只重导两位人物并就地合并报告。
    # 人物改动不需要重跑建筑构件，否则每次都会刷新 50 张只差渲染噪声的
    # 验收图，既拖慢流程又污染 diff。
    if args.only == "characters":
        report_path = os.path.join(out_dir, "kit-report.json")
        report = {}
        if os.path.isfile(report_path):
            with open(report_path, "r", encoding="utf-8") as fh:
                report = json.load(fh)
        report.setdefault("modules", [])
        report.setdefault("note", "唐构构件库，尺寸按材分制换算")
        report["character_types"] = export_character_types(out_dir)
        with open(report_path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, ensure_ascii=False, indent=2)
        print("KIT_BUILD_OK characters")
        return

    # --only shops：只重导市井铺面与酒肆。改铺面内部结构时不必重跑
    # 殿宇与斗拱，否则每次都会刷新几十张只差渲染噪声的验收图。
    if args.only == "shops":
        report_path = os.path.join(out_dir, "kit-report.json")
        report = {}
        if os.path.isfile(report_path):
            with open(report_path, "r", encoding="utf-8") as fh:
                report = json.load(fh)
        report.setdefault("modules", [])
        report.setdefault("note", "唐构构件库，尺寸按材分制换算")
        m = kit.TangModule(0.22)
        shop_ids = ("shop_low_shijing", "shop_shijing", "shop_tall_shijing",
                    "shop_double_shijing", "tavern_shijing")
        modules = [row for row in report["modules"] if row.get("id") not in shop_ids]

        def ground(size):
            bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, -0.002))
            bpy.context.object.name = "review_ground"
            bpy.context.object.data.materials.append(
                kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
            )

        # 三档铺面各出一份 GLB：同一套构件、同一份材质，只差柱高、
        # 铺作跳数、举高与台基高度。这样街上的檐口才有真实的高低错落。
        for storey, module_id, glb, label in (
            (0, "shop_low_shijing", "shop-low-shijing", "shop-low"),
            (1, "shop_shijing", "shop-shijing", "shop"),
            (2, "shop_tall_shijing", "shop-tall-shijing", "shop-tall"),
            # 重檐铺面：这条街天际线的最高一档。
            (3, "shop_double_shijing", "shop-double-shijing", "shop-double"),
        ):
            kit.reset_scene()
            mats = kit_materials()
            cam = setup_render(None)
            # 重檐用 3 开间：只靠高度差（0.67m）在俯瞰视角会被压缩掉，
            # 宽度差才能让它一眼读作"更大的行铺"。
            bays = 3 if storey >= 3 else 2
            shop = join(build_shop_module(m, mats, module_id, bays=bays, storey=storey), module_id)
            bpy.context.view_layer.update()
            ground(60.0)
            sh_center, sh_radius, sh_lo, sh_hi = bounds([shop])
            modules.append(
                {
                    "id": module_id,
                    "grade": m.cai,
                    "storey": storey,
                    "triangles": count_triangles([shop]),
                    "dimensions_m": tuple(round(v, 3) for v in shop.dimensions),
                    "height_m": round(sh_hi[2] - sh_lo[2], 3),
                    "geometry_mode": "street_frontage_gable_roof_awning",
                }
            )
            for shot, az, el in (
                ("front", 180.0, 7.0),
                ("three-quarter", 148.0, 16.0),
                ("shopfront", 172.0, 3.0),
                ("side", 90.0, 10.0),
                ("aerial", 205.0, 45.0),
            ):
                place_camera(cam, sh_center, sh_radius, az, el, zoom=1.1)
                render_to(os.path.join(shots_dir, "%s-%s.jpg" % (label, shot)))
            export_glb(os.path.join(out_dir, glb + ".glb"), [shop])

        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)
        townhouse = join(build_townhouse_module(m, mats, "tavern_shijing"), "tavern_shijing")
        bpy.context.view_layer.update()
        ground(70.0)
        th_center, th_radius, th_lo, th_hi = bounds([townhouse])
        modules.append(
            {
                "id": "tavern_shijing",
                "grade": m.cai,
                "triangles": count_triangles([townhouse]),
                "dimensions_m": tuple(round(v, 3) for v in townhouse.dimensions),
                "height_m": round(th_hi[2] - th_lo[2], 3),
                "geometry_mode": "two_storey_gallery_tavern",
            }
        )
        for label, az, el in (
            ("front", 180.0, 6.0),
            ("three-quarter", 148.0, 15.0),
            ("street", 164.0, 4.0),
            ("side", 90.0, 9.0),
            ("aerial", 205.0, 44.0),
        ):
            place_camera(cam, th_center, th_radius, az, el, zoom=1.08)
            render_to(os.path.join(shots_dir, "tavern-shijing-%s.jpg" % label))
        export_glb(os.path.join(out_dir, "tavern-shijing.glb"), [townhouse])

        report["modules"] = modules
        with open(report_path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, ensure_ascii=False, indent=2)
        print("KIT_BUILD_OK shops")
        return

    report = {"modules": [], "note": "唐构构件库，尺寸按材分制换算"}

    # 一等材用于殿宇；三号材用于市井小铺，两者共用代码。
    grades = {"dadian": kit.TangModule(0.30), "shijing": kit.TangModule(0.22)}

    for grade, m in grades.items():
        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)

        if grade == "dadian":
            parts = build_roof_module(m, mats, "roof_dadian")
        else:
            parts = build_roof_module(m, mats, "roof_shijing")
        joined_roof = join(parts, f"roof_{grade}")
        bpy.ops.mesh.primitive_plane_add(size=20.0, location=(0, 0, -0.002))
        bpy.context.object.name = "review_ground"
        bpy.context.object.data.materials.append(
            kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
        )
        add_ruler(
            1.0,
            kit.make_material("mat_ruler", kit.srgb(0x2E2E2E), 0.6),
            (0.0, joined_roof.dimensions.y * 0.62, 0.001),
        )
        ro_center, ro_radius, ro_lo, ro_hi = bounds([joined_roof])
        report["modules"].append(
            {
                "id": f"roof_{grade}",
                "grade": m.cai,
                "triangles": count_triangles([joined_roof]),
                "dimensions_m": tuple(round(v, 3) for v in joined_roof.dimensions),
                "eave_overhang_m": round(m.f(75), 3),
                "rise_m": round(m.f(105), 3),
                "geometry_mode": "closed_roof_shell_with_corner_lift",
            }
        )
        for label, az, el in (
            ("front", 180.0, 8.0),
            ("three-quarter", 145.0, 16.0),
            ("corner-close", 138.0, 9.0),
            ("side", 90.0, 8.0),
            ("top", 200.0, 55.0),
        ):
            place_camera(cam, ro_center, ro_radius, az, el, zoom=1.15)
            render_to(os.path.join(shots_dir, "%s-roof-%s.jpg" % (grade, label)))
        export_glb(os.path.join(out_dir, "roof-%s.glb" % grade), [joined_roof])

        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)

        # 完整殿堂：台基 + 柱网 + 铺作 + 庑殿顶，用于判断整体比例与气势
        hall_parts = build_hall_module(m, mats, "hall_%s" % grade)
        # 柱和斗拱是分件创建的，先统一更新依赖图再取包围盒
        bpy.context.view_layer.update()
        hall = join(hall_parts, "hall_%s" % grade)
        bpy.ops.mesh.primitive_plane_add(size=120.0, location=(0, 0, -0.002))
        bpy.context.object.name = "review_ground"
        bpy.context.object.data.materials.append(
            kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
        )
        ha_center, ha_radius, ha_lo, ha_hi = bounds([hall])
        report["modules"].append(
            {
                "id": "hall_%s" % grade,
                "grade": m.cai,
                "triangles": count_triangles([hall]),
                "dimensions_m": tuple(round(v, 3) for v in hall.dimensions),
                "height_m": round(ha_hi[2] - ha_lo[2], 3),
                "geometry_mode": "platform_columns_brackets_facade_hip_roof",
            }
        )
        for label, az, el in (
            ("front", 180.0, 10.0),
            ("three-quarter", 146.0, 18.0),
            ("eave-close", 140.0, 6.0),
            ("side", 90.0, 12.0),
            ("aerial", 208.0, 50.0),
        ):
            place_camera(cam, ha_center, ha_radius, az, el, zoom=1.12)
            render_to(os.path.join(shots_dir, "hall-%s-%s.jpg" % (grade, label)))
        export_glb(os.path.join(out_dir, "hall-%s.glb" % grade), [hall])

        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)

        # 市井店铺：与殿宇同一套构件，材等与屋顶形制不同，验证"同体系不同等级"
        shop_parts = build_shop_module(m, mats, "shop_%s" % grade, bays=2)
        bpy.context.view_layer.update()
        shop = join(shop_parts, "shop_%s" % grade)
        bpy.ops.mesh.primitive_plane_add(size=60.0, location=(0, 0, -0.002))
        bpy.context.object.name = "review_ground"
        bpy.context.object.data.materials.append(
            kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
        )
        sh_center, sh_radius, sh_lo, sh_hi = bounds([shop])
        report["modules"].append(
            {
                "id": "shop_%s" % grade,
                "grade": m.cai,
                "triangles": count_triangles([shop]),
                "dimensions_m": tuple(round(v, 3) for v in shop.dimensions),
                "height_m": round(sh_hi[2] - sh_lo[2], 3),
                "geometry_mode": "street_frontage_gable_roof_awning",
            }
        )
        for label, az, el in (
            ("front", 180.0, 7.0),
            ("three-quarter", 148.0, 16.0),
            ("shopfront", 172.0, 3.0),
            ("side", 90.0, 10.0),
            ("aerial", 205.0, 45.0),
        ):
            place_camera(cam, sh_center, sh_radius, az, el, zoom=1.1)
            render_to(os.path.join(shots_dir, "shop-%s-%s.jpg" % (grade, label)))
        export_glb(os.path.join(out_dir, "shop-%s.glb" % grade), [shop])

        if grade == "shijing":
            kit.reset_scene()
            mats = kit_materials()
            cam = setup_render(None)
            town_parts = build_townhouse_module(m, mats, "tavern_shijing")
            bpy.context.view_layer.update()
            townhouse = join(town_parts, "tavern_shijing")
            bpy.ops.mesh.primitive_plane_add(size=70.0, location=(0, 0, -0.002))
            bpy.context.object.name = "review_ground"
            bpy.context.object.data.materials.append(
                kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
            )
            th_center, th_radius, th_lo, th_hi = bounds([townhouse])
            report["modules"].append(
                {
                    "id": "tavern_shijing",
                    "grade": m.cai,
                    "triangles": count_triangles([townhouse]),
                    "dimensions_m": tuple(round(v, 3) for v in townhouse.dimensions),
                    "height_m": round(th_hi[2] - th_lo[2], 3),
                    "geometry_mode": "two_storey_gallery_tavern",
                }
            )
            for label, az, el in (
                ("front", 180.0, 6.0),
                ("three-quarter", 148.0, 15.0),
                ("street", 164.0, 4.0),
                ("side", 90.0, 9.0),
                ("aerial", 205.0, 44.0),
            ):
                place_camera(cam, th_center, th_radius, az, el, zoom=1.08)
                render_to(os.path.join(shots_dir, "tavern-shijing-%s.jpg" % label))
            export_glb(os.path.join(out_dir, "tavern-shijing.glb"), [townhouse])

        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)

        if grade == "dadian":
            parts = build_puzuo_module(m, mats, "puzuo_dadian")
        else:
            parts = build_puzuo_module(m, mats, "puzuo_shijing")
        joined = join(parts, f"puzuo_{grade}")
        joined.location = (0, 0, 0)

        # 地面参考网格便于判断出跳与足材比例。
        bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, -0.002))
        ground = bpy.context.object
        ground.name = "review_ground"
        ground.data.materials.append(kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9))

        tris = count_triangles([joined])
        dims = tuple(round(v, 3) for v in joined.dimensions)
        ruler_mat = kit.make_material("mat_ruler", kit.srgb(0x2E2E2E), 0.6)
        ruler = add_ruler(1.0, ruler_mat, (0.0, joined.dimensions.y * 0.75, 0.001))
        center, radius, lo, hi = bounds([joined])
        report["modules"].append(
            {
                "id": f"puzuo_{grade}",
                "grade": m.cai,
                "triangles": tris,
                "dimensions_m": dims,
                "bounds_min_m": [round(v, 3) for v in lo],
                "bounds_max_m": [round(v, 3) for v in hi],
                "parts_materials": [mat.name for mat in joined.data.materials],
            }
        )

        for label, az, el in (
            ("front", 180.0, 4.0),
            ("three-quarter", 142.0, 12.0),
            ("side", 90.0, 6.0),
            ("top", 200.0, 46.0),
        ):
            place_camera(cam, center, radius, az, el)
            render_to(os.path.join(shots_dir, "%s-%s.jpg" % (grade, label)))

        export_glb(os.path.join(out_dir, "puzuo-%s.glb" % grade), [joined])

        # 柱与柱础单独出一份，验证收分与覆盆。
        kit.reset_scene()
        mats = kit_materials()
        cam = setup_render(None)
        col_parts = build_column_module(m, mats)
        col = join(col_parts, f"column_{grade}")
        bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, -0.002))
        bpy.context.object.name = "review_ground"
        bpy.context.object.data.materials.append(
            kit.make_material("mat_review_ground", kit.srgb(0x8C8880), 0.9)
        )
        add_ruler(
            1.0,
            kit.make_material("mat_ruler", kit.srgb(0x2E2E2E), 0.6),
            (0.0, col.dimensions.y * 0.9, 0.001),
        )
        col_center, col_radius, col_lo, col_hi = bounds([col])
        report["modules"].append(
            {
                "id": f"column_{grade}",
                "grade": m.cai,
                "triangles": count_triangles([col]),
                "dimensions_m": tuple(round(v, 3) for v in col.dimensions),
                "height_m": round(col_hi[2] - col_lo[2], 3),
            }
        )
        for label, az, el, zoom in (
            ("front", 0.0, 6.0, 1.15),
            ("three-quarter", 40.0, 10.0, 1.15),
            ("base-closeup", 24.0, 14.0, 0.22),
        ):
            if "base" in label:
                place_camera(cam, (0, 0, 0.12), col_radius * 0.3, az, el, zoom=1.6)
            else:
                place_camera(cam, col_center, col_radius, az, el, zoom=zoom)
            render_to(os.path.join(shots_dir, "%s-column-%s.jpg" % (grade, label)))
        export_glb(os.path.join(out_dir, "column-%s.glb" % grade), [col])

    with open(os.path.join(out_dir, "kit-report.json"), "w", encoding="utf-8") as fh:
        report["character_types"] = export_character_types(out_dir)
        json.dump(report, fh, ensure_ascii=False, indent=2)
    print("KIT_BUILD_OK", json.dumps(report, ensure_ascii=False)[:800])


main()
