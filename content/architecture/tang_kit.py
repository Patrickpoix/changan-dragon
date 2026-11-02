"""唐式建筑参数化构件库（Blender 4.2+）。

按《营造法式》材分制建模：材广十五分、厚十分；足材廿一分。
所有尺寸以"分"为单位换算成米，便于按建筑等级整体缩放。

设计取向为**唐风**而非宋明清：
- 斗拱体量大（接近柱高一半），用材雄壮、层次少而清晰
- 昂为"批竹昂"直斜面，不做明清的琴面昂/象鼻昂
- 拱头卷杀用四瓣、五瓣，轮廓收得干脆
- 屋面平缓，不做后期官式的高陡举架

本文件只负责生成几何与分件，材质按语义命名，
由运行时映射到共享 PBR 贴图集，避免每个构件重复带材质包。
"""

import math
import bmesh
import bpy
from mathutils import Vector


# 唐式下昂为"批竹昂"，昂面笔直下斜；明清琴面昂不做。
ANGLE_DEG = 18.4


def resolve_materials(materials, *needed):
    """按语义名补齐材质。

    构件函数只声明自己需要哪些语义，缺哪个就报哪个名字，
    避免把调用方传错材质表变成难查的 KeyError。
    同时也保证屋顶面与屋顶脊这类细分语义在各处叫法一致。
    """
    table = dict(materials or {})
    for name in needed:
        if name not in table:
            raise KeyError("material semantics missing: %s" % name)
    return table


# ---------------------------------------------------------------- 基本工具


def reset_scene():
    """清空场景，保证每次构建从确定状态开始。"""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes):
        bpy.data.meshes.remove(block)
    for block in list(bpy.data.materials):
        bpy.data.materials.remove(block)


def make_material(name, color, roughness=0.8, metallic=0.0):
    """按语义建材质。颜色只作造型预览，正式贴图在运行时统一替换。"""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def srgb(hex_color):
    """十六进制转线性色，避免 Blender 颜色空间二次校正。"""
    def to_linear(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return tuple(
        to_linear((hex_color >> shift) & 255) for shift in (16, 8, 0)
    )


def new_object(name, bm, material):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(material)
    bpy.context.collection.objects.link(obj)
    return obj


def loft(rings, name, material, cap=True):
    """由若干等顶点数的水平环放样成实体，用于斗、柱础等有收分的构件。"""
    bm = bmesh.new()
    layers = [[bm.verts.new(p) for p in ring] for ring in rings]
    bm.verts.ensure_lookup_table()
    count = len(rings[0])
    for i in range(len(layers) - 1):
        for j in range(count):
            bm.faces.new(
                (
                    layers[i][j],
                    layers[i][(j + 1) % count],
                    layers[i + 1][(j + 1) % count],
                    layers[i + 1][j],
                )
            )
    if cap:
        bm.faces.new(list(reversed(layers[0])))
        bm.faces.new(list(layers[-1]))
    bm.normal_update()
    return new_object(name, bm, material)


def prism(profile, y0, y1, name, material, bevel=0.0):
    """把 XZ 平面轮廓沿 Y 挤成板状构件，用于拱、昂、枋等。"""
    bm = bmesh.new()
    front = [bm.verts.new((x, y0, z)) for x, z in profile]
    back = [bm.verts.new((x, y1, z)) for x, z in profile]
    count = len(profile)
    for i in range(count):
        a, b = front[i], front[(i + 1) % count]
        c, d = back[(i + 1) % count], back[i]
        bm.faces.new((a, b, c, d))
    bm.faces.new(list(reversed(front)))
    bm.faces.new(back)
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel > 0:
        bmesh.ops.bevel(
            bm,
            geom=list(bm.edges) + list(bm.verts),
            offset=bevel,
            segments=1,
            affect="EDGES",
        )
    return new_object(name, bm, material)


def rect_ring(center_x, center_y, half_x, half_y, z, chamfer=0.0):
    """生成一个矩形（可切角）水平环，四角顺序为左下、右下、右上、左上。"""
    cx, cy = center_x, center_y
    if chamfer <= 0:
        return [
            (cx - half_x, cy - half_y, z),
            (cx + half_x, cy - half_y, z),
            (cx + half_x, cy + half_y, z),
            (cx - half_x, cy + half_y, z),
        ]
    c = min(chamfer, half_x * 0.5, half_y * 0.5)
    return [
        (cx - half_x + c, cy - half_y, z),
        (cx + half_x - c, cy - half_y, z),
        (cx + half_x, cy - half_y + c, z),
        (cx + half_x, cy + half_y - c, z),
        (cx + half_x - c, cy + half_y, z),
        (cx - half_x + c, cy + half_y, z),
        (cx - half_x, cy + half_y - c, z),
        (cx - half_x, cy - half_y + c, z),
    ]


# ---------------------------------------------------------------- 材分制


class TangModule:
    """材分制换算。

    《营造法式》：材广十五分、厚十分，足材廿一分。
    一等材用于殿宇，三号材用于市井小铺，构件代码完全相同。
    """

    def __init__(self, cai=0.30):
        self.cai = cai
        self.fen = cai / 15.0
        self.dan = cai            # 单材：广15分
        self.zu = cai * 1.4       # 足材：广21分
        self.hou = cai * 10.0 / 15.0  # 厚10分
        self.tiao = self.f(30)    # 标准出跳

    def f(self, value):
        return value * self.fen


# ---------------------------------------------------------------- 斗


def build_dou(
    name,
    length,
    width,
    height,
    material,
    position=(0.0, 0.0, 0.0),
    slot_x=0.0,
    slot_y=0.0,
    chamfer_ratio=0.06,
):
    """斗：欹（下外撇）、平（束腰）、耳（上略张）、顶面内收。

    底面位于 z=0，便于逐层堆叠。slot_x / slot_y 为拱穿过的开口宽度。
    """
    hx, hy = length / 2.0, width / 2.0
    h_qi, h_ping = height * 0.40, height * 0.20
    inset = height * 0.06
    rings = [
        rect_ring(0, 0, hx, hy, 0.0, chamfer=hx * chamfer_ratio),
        rect_ring(0, 0, hx * 0.84, hy * 0.84, h_qi, chamfer=hx * chamfer_ratio),
        rect_ring(0, 0, hx * 0.88, hy * 0.88, h_qi + h_ping, chamfer=hx * chamfer_ratio),
        rect_ring(0, 0, hx * 0.94, hy * 0.94, height - inset, chamfer=hx * chamfer_ratio),
        rect_ring(0, 0, hx * 0.90, hy * 0.90, height, chamfer=hx * chamfer_ratio),
    ]
    obj = loft(rings, name, material)
    obj.location = position

    cuts = []
    if slot_x > 0:
        cuts.append((slot_x, width * 1.6, height * 0.62))
    if slot_y > 0:
        cuts.append((length * 1.6, slot_y, height * 0.62))
    for index, (sx, sy, depth) in enumerate(cuts):
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(
                position[0],
                position[1],
                position[2] + height - depth / 2.0,
            ),
        )
        cut = bpy.context.object
        cut.name = "%s_slot%d" % (name, index)
        cut.scale = (sx / 2.0, sy / 2.0, depth / 2.0)
        bpy.ops.object.transform_apply(scale=True)
        mod = obj.modifiers.new("slot", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.object = cut
        mod.solver = "EXACT"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.data.objects.remove(cut, do_unlink=True)
    return obj


# ---------------------------------------------------------------- 拱


def juan_sha_outline(length, height, cut, lobes, end_ratio=0.55):
    """拱的侧视轮廓。

    底面平直坐在下层构件之上（z=0），顶面中段平直，两端以卷杀曲线
    下收到端头。卷杀靠近拱身平缓、靠近端头收得急，让拱头干脆有力。
    """
    half = length / 2.0
    end_h = height * end_ratio
    steps = max(4, lobes * 3)
    outline = [(-half, 0.0), (half, 0.0), (half, end_h)]
    for i in range(1, steps + 1):
        t = i / steps
        outline.append(
            (half - cut * t, end_h + (height - end_h) * t ** 0.55)
        )
    outline.append((-half + cut, height))
    for i in range(1, steps + 1):
        t = i / steps
        outline.append(
            (-half + cut * (1.0 - t), height - (height - end_h) * t ** 0.55)
        )
    # 去重，避免零面积面片进入网格。
    seen = set()
    cleaned = []
    for point in outline:
        key = (round(point[0], 6), round(point[1], 6))
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(point)
    return cleaned


def extrude_profile(outline, axis, thickness, name, material, position):
    """把 XZ 轮廓沿指定轴挤出成板状构件（axis='y' 或 'x'）。"""
    bm = bmesh.new()
    half = thickness / 2.0
    if axis == "y":
        front = [bm.verts.new((x, -half, z)) for x, z in outline]
        back = [bm.verts.new((x, half, z)) for x, z in outline]
    elif axis == "x":
        front = [bm.verts.new((-half, x, z)) for x, z in outline]
        back = [bm.verts.new((half, x, z)) for x, z in outline]
    else:
        raise ValueError("axis must be 'x' or 'y'")
    count = len(outline)
    for i in range(count):
        bm.faces.new(
            (
                front[i],
                front[(i + 1) % count],
                back[(i + 1) % count],
                back[i],
            )
        )
    bm.faces.new(list(reversed(front)))
    bm.faces.new(back)
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = new_object(name, bm, material)
    obj.location = position
    return obj


def build_gong(
    name,
    length,
    height,
    thickness,
    material,
    position=(0.0, 0.0, 0.0),
    cut=None,
    lobes=4,
    end_ratio=0.55,
    along_y=False,
):
    """拱：底面 z=0，长度沿 X；along_y=True 时长度沿 Y。"""
    cut = cut if cut is not None else min(length * 0.24, height * 0.95)
    outline = juan_sha_outline(
        length, height, cut, lobes, end_ratio
    )
    return extrude_profile(
        outline, "x" if along_y else "y", thickness, name, material, position
    )


def build_ang(
    name,
    tail,
    head,
    height,
    thickness,
    material,
    position=(0.0, 0.0, 0.0),
    slope_deg=26.0,
    waist_ratio=0.6,
):
    """批竹昂：原点在昂穿过交互斗处，+X 为外（檐口）。

    昂尾在内侧抬高，昂嘴向外斜下，端头斜切成平直的批竹面。
    """
    slope = math.tan(math.radians(slope_deg))

    def z(x):
        return -x * slope

    tip_len = height * 0.9
    outline = [
        (-tail, z(-tail)),
        (head - tip_len, z(head - tip_len)),
        (head, z(head) + height * waist_ratio * 0.5),
        (head - tip_len * 0.35, z(head - tip_len * 0.35) + height * 0.62),
        (-tail, z(-tail) + height),
    ]
    return extrude_profile(
        outline, "y", thickness, name, material, position
    )


# ---------------------------------------------------------------- 柱与础


def _circle(radius, segments):
    return [
        (
            radius * math.cos(2.0 * math.pi * i / segments),
            radius * math.sin(2.0 * math.pi * i / segments),
        )
        for i in range(segments)
    ]


def build_column(name, height, diameter, material, taper_ratio=0.86, segments=28):
    """唐式柱：柱身上部三分之一开始卷杀收分，柱头略细。

    与明清相比柱身更粗壮、收分更含蓄。
    """
    r_bot = diameter / 2.0
    station = 16
    bm = bmesh.new()
    rings = []
    for i in range(station + 1):
        t = i / station
        taper = 1.0
        if t > 0.66:
            taper = 1.0 - (t - 0.66) / 0.34 * (1.0 - taper_ratio)
        r = r_bot * taper
        rings.append(
            [bm.verts.new((x, y, height * t)) for x, y in _circle(r, segments)]
        )
    for i in range(len(rings) - 1):
        for j in range(segments):
            bm.faces.new(
                (
                    rings[i][j],
                    rings[i][(j + 1) % segments],
                    rings[i + 1][(j + 1) % segments],
                    rings[i + 1][j],
                )
            )
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bm.normal_update()
    return new_object(name, bm, material)


def build_plinth(name, size, height, material, position=(0.0, 0.0, 0.0)):
    """柱础：方形下座、素覆盆上收，唐式多为素覆盆。"""
    half = size / 2.0
    rings = [
        rect_ring(0, 0, half, half, 0.0, chamfer=half * 0.05),
        rect_ring(0, 0, half * 0.98, half * 0.98, height * 0.30, chamfer=half * 0.05),
        rect_ring(0, 0, half * 0.84, half * 0.84, height * 0.62, chamfer=half * 0.04),
        rect_ring(0, 0, half * 0.70, half * 0.70, height * 0.86, chamfer=half * 0.03),
        rect_ring(0, 0, half * 0.66, half * 0.66, height, chamfer=half * 0.03),
    ]
    obj = loft(rings, name, material)
    obj.location = position
    return obj


# ---------------------------------------------------------------- 铺作


def build_puzuo(prefix, m, materials, origin=(0.0, 0.0, 0.0), jumps=2):
    """五铺作单抄单下昂（柱头铺作）。出跳沿 +X，沿墙方向为 Y。

    关键结构认识：斗拱是**两条互相垂直的独立叠置梯**，而不是一堆散件。
      沿墙梯（Y）：栌斗 → 泥道拱 → 散斗 → 慢拱 → 散斗 → 柱头枋
      出跳梯（X）：华拱 → 交互斗 → 下昂 → 交互斗 → 令拱 → 散斗 → 撩檐枋
    两条梯共用栌斗，且华拱与泥道拱在栌斗上十字相交——这正是栌斗要开十字口的原因。
    每层构件底面严格等于下层顶面，不允许悬空或穿插。

    jumps=1 时退化为四铺作单抄（无下昂），用于等级较低的建筑。
    """
    wood = materials["wood"]
    block = materials["block"]
    tile = materials["tile"]
    ox, oy, oz = origin
    parts = []

    def at(x, y, z):
        return (ox + x, oy + y, oz + z)

    def u(value):
        return m.f(value)

    hou = m.hou
    zu = m.zu
    dan = m.dan
    tiao = m.tiao

    # 竖向标高（分），逐层相加，最后统一乘 fen 转米
    Z_LU = 20.0                     # 栌斗高
    Z_GONG = Z_LU + 21.0            # 泥道拱 / 华拱 顶（足材）
    Z_SAN = Z_GONG + 10.0           # 散斗顶 / 交互斗顶
    Z_MAN = Z_SAN + 21.0            # 慢拱顶
    Z_FANG = Z_MAN + 10.0           # 柱头枋底
    Z_FANG_TOP = Z_FANG + 12.0

    # 1) 栌斗
    lu = build_dou(
        "%s_ludou" % prefix,
        u(32),
        u(32),
        u(20),
        block,
        position=at(0, 0, 0),
        slot_x=hou * 1.15,
        slot_y=hou * 1.15,
    )
    parts.append(lu)

    # 2) 沿墙梯：泥道拱，直接坐在栌斗上
    ni_len = u(62)
    parts.append(
        build_gong(
            "%s_nidaogong" % prefix,
            ni_len,
            zu,
            hou,
            wood,
            position=at(0, 0, u(Z_LU)),
            cut=u(16),
            lobes=4,
            along_y=True,
        )
    )

    # 3) 出跳梯：华拱，与泥道拱同层十字相交
    hua_len = tiao * 2 + u(12)
    parts.append(
        build_gong(
            "%s_huagong" % prefix,
            hua_len,
            zu,
            hou,
            wood,
            position=at(0, 0, u(Z_LU)),
            cut=u(18),
            lobes=4,
        )
    )

    # 4) 沿墙梯：散斗 + 慢拱 + 散斗 + 柱头枋
    for index, side in enumerate((-1, 1)):
        parts.append(
            build_dou(
                "%s_sandou_ni%d" % (prefix, index),
                u(16),
                u(14),
                u(10),
                block,
                position=at(0, side * (ni_len / 2 - u(8)), u(Z_GONG)),
                slot_y=hou * 1.15,
                chamfer_ratio=0.05,
            )
        )
    man_len = u(92)
    parts.append(
        build_gong(
            "%s_mangong" % prefix,
            man_len,
            zu,
            hou,
            wood,
            position=at(0, 0, u(Z_SAN)),
            cut=u(14),
            lobes=4,
            along_y=True,
        )
    )
    for index, side in enumerate((-1, 1)):
        parts.append(
            build_dou(
                "%s_sandou_man%d" % (prefix, index),
                u(16),
                u(14),
                u(10),
                block,
                position=at(0, side * (man_len / 2 - u(8)), u(Z_MAN)),
                slot_y=hou * 1.15,
                chamfer_ratio=0.05,
            )
        )
    parts.append(
        box(
            "%s_zhutoufang" % prefix,
            (hou * 1.05, man_len, u(12)),
            tile,
            at(0, 0, u(Z_FANG) + u(6)),
        )
    )

    # 5) 出跳梯：交互斗坐在华拱头上（一跳位置）
    parts.append(
        build_dou(
            "%s_jiaohudou" % prefix,
            u(18),
            u(16),
            u(10),
            block,
            position=at(tiao, 0, u(Z_GONG)),
            slot_x=hou * 1.15,
            slot_y=hou * 1.15,
        )
    )

    if jumps >= 2:
        # 6) 下昂：唐式下昂为"批竹昂"，昂面是笔直斜面、昂嘴平切。
        #    昂底在 x=tiao 处等于一跳交互斗顶面（Z_SAN），向外逐分下降。
        slope = math.tan(math.radians(ANGLE_DEG))
        tail_x = -u(46)
        head_x = tiao * 2
        z_bottom_at = lambda x: u(Z_SAN) - (x - tiao) * slope
        ang_outline = [
            (tail_x, z_bottom_at(tail_x) - u(Z_SAN)),
            (head_x, z_bottom_at(head_x) - u(Z_SAN)),
            (head_x, z_bottom_at(head_x) - u(Z_SAN) + dan),
            (tail_x, z_bottom_at(tail_x) - u(Z_SAN) + dan),
        ]
        parts.append(
            extrude_profile(
                ang_outline,
                "y",
                hou,
                "%s_ang" % prefix,
                wood,
                at(0, 0, u(Z_SAN)),
            )
        )

        # 7) 令拱 + 散斗：承托在昂头之上
        ling_z = z_bottom_at(head_x) + dan
        ling_len = u(72)
        parts.append(
            build_gong(
                "%s_linggong" % prefix,
                ling_len,
                zu * 0.85,
                hou,
                wood,
                position=at(head_x, 0, ling_z),
                cut=u(20),
                lobes=5,
                along_y=True,
            )
        )
        ling_top = ling_z + zu * 0.85
        for index, side in enumerate((-1, 1)):
            parts.append(
                build_dou(
                    "%s_sandou_ling%d" % (prefix, index),
                    u(16),
                    u(14),
                    u(10),
                    block,
                    position=at(head_x, side * (ling_len / 2 - u(8)), ling_top),
                    slot_y=hou * 1.15,
                    chamfer_ratio=0.05,
                )
            )

        # 8) 撩檐枋：整个铺作的最上层，承托屋檐
        parts.append(
            box(
                "%s_liaoyanfang" % prefix,
                (hou * 1.05, man_len, u(12)),
                tile,
                at(head_x + u(10), 0, ling_top + u(10) + u(6)),
            )
        )
    else:
        # 四铺作单抄：出跳梯止于一跳，撩檐枋直接坐在交互斗上
        parts.append(
            box(
                "%s_liaoyanfang" % prefix,
                (hou * 1.05, man_len, u(12)),
                tile,
                at(tiao + u(10), 0, u(Z_SAN) + u(6)),
            )
        )
    return parts


def puzuo_height_from_parts(parts, origin_z=0.0):
    """测量一组铺作构件的实际顶高（世界坐标，相对其自身原点）。

    用测量而不是按材分推算：铺作有沿墙梯与出跳梯两条高度不同的叠置线，
    谁更高取决于 jumps 与构件细节，推算容易错，量一次就不会错。
    """
    top = origin_z
    for obj in parts:
        for corner in obj.bound_box:
            z = (obj.matrix_world @ Vector(corner)).z
            if z > top:
                top = z
    return top


def box(name, size, material, position):
    """按给定尺寸建长方体（size 为实际边长），用于枋类构件。"""
    sx, sy, sz = size
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    obj = new_object(name, bm, material)
    obj.location = position
    return obj


# ---------------------------------------------------------------- 屋顶


def juzhe_profile(stations=10, exponent=1.45):
    """举折曲线参数：t 为从檐口到脊的归一化距离，返回高度系数。

    《营造法式》举折是"先举后折"，屋面呈凹曲——靠近脊部陡、靠近檐口平。
    指数大于 1 即得凹曲；唐式比明清平缓，故整体举高相对低。
    """
    return [(i / stations, (i / stations) ** exponent) for i in range(stations + 1)]


def slope_grid(
    name,
    ridge_a,
    ridge_b,
    eave_a,
    eave_b,
    rise,
    material,
    stations=10,
    corner_lift=0.0,
    corner_power=2.4,
    thickness=0.0,
):
    """在一对"脊边—檐边"之间铺一张带举折曲线与翼角起翘的曲面网格。

    ridge_a/b 与 eave_a/b 是 3D 点（Vector）。t=0 在檐口，t=1 在脊。
    翼角起翘只作用在檐口靠角部的位置：越靠角、越靠檐口抬得越高。
    """
    profile = juzhe_profile(stations)
    bm = bmesh.new()
    grid = []
    underside = []
    for t, h in profile:
        row = []
        low = []
        for j in range(stations + 1):
            s = j / stations
            base = eave_a.lerp(eave_b, s).lerp(ridge_a.lerp(ridge_b, s), t)
            z = rise * h
            if corner_lift:
                # 只在檐口附近起翘，角部权重最高
                edge_weight = (1.0 - t) ** 1.6
                corner_weight = abs(s * 2.0 - 1.0) ** corner_power
                z += corner_lift * edge_weight * corner_weight
            row.append(bm.verts.new((base.x, base.y, z)))
            if thickness:
                low.append(bm.verts.new((base.x, base.y, z - thickness)))
        grid.append(row)
        if thickness:
            underside.append(low)
    bm.verts.ensure_lookup_table()
    for i in range(stations):
        for j in range(stations):
            bm.faces.new(
                (grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j])
            )
            if thickness:
                bm.faces.new(
                    (
                        underside[i + 1][j],
                        underside[i + 1][j + 1],
                        underside[i][j + 1],
                        underside[i][j],
                    )
                )
    if thickness:
        # 屋面不是纸片：补上四周侧壁，近檐与俯视都能读出瓦面厚度。
        for j in range(stations):
            bm.faces.new(
                (
                    grid[0][j],
                    grid[0][j + 1],
                    underside[0][j + 1],
                    underside[0][j],
                )
            )
            bm.faces.new(
                (
                    grid[-1][j + 1],
                    grid[-1][j],
                    underside[-1][j],
                    underside[-1][j + 1],
                )
            )
        for i in range(stations):
            bm.faces.new(
                (
                    grid[i][0],
                    underside[i][0],
                    underside[i + 1][0],
                    grid[i + 1][0],
                )
            )
            bm.faces.new(
                (
                    grid[i + 1][-1],
                    underside[i + 1][-1],
                    underside[i][-1],
                    grid[i][-1],
                )
            )
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return new_object(name, bm, material)


def build_hip_roof(
    name,
    half_width,
    half_depth,
    eave_overhang,
    rise,
    materials,
    ridge_ratio=0.52,
    corner_lift=None,
    stations=10,
):
    """庑殿顶：两长坡（梯形）+ 两短坡（三角形）+ 正脊 + 四条垂脊。

    坐标：正脊沿 Y 轴，位于 x=0、z=rise 高度；檐口落在 z=0。
    唐式特征是出檐深远、屋面平缓、翼角明显起翘。
    """
    from mathutils import Vector

    materials = resolve_materials(materials, "roof", "ridge", "wood", "tile")
    roof = materials["roof"]
    ridge_mat = materials["ridge"]
    W = half_width + eave_overhang
    D = half_depth + eave_overhang
    rh = half_depth * ridge_ratio
    if corner_lift is None:
        # 翼角起翘要克制：太大就成了马鞍形，唐式是角部轻轻翘起。
        corner_lift = rise * 0.14

    parts = []
    # 前坡（-X 侧）与后坡（+X 侧）：脊边短、檐边长，为梯形
    parts.append(
        slope_grid(
            "%s_slope_front" % name,
            Vector((0.0, -rh, 0.0)),
            Vector((0.0, rh, 0.0)),
            Vector((-W, -D, 0.0)),
            Vector((-W, D, 0.0)),
            rise,
            roof,
            stations=stations,
            corner_lift=corner_lift,
            thickness=max(0.08, rise * 0.06),
        )
    )
    parts.append(
        slope_grid(
            "%s_slope_back" % name,
            Vector((0.0, rh, 0.0)),
            Vector((0.0, -rh, 0.0)),
            Vector((W, D, 0.0)),
            Vector((W, -D, 0.0)),
            rise,
            roof,
            stations=stations,
            corner_lift=corner_lift,
            thickness=max(0.08, rise * 0.06),
        )
    )
    # 两短坡：脊缩为一点，与檐边成三角形
    parts.append(
        slope_grid(
            "%s_slope_endleft" % name,
            Vector((0.0, -rh, 0.0)),
            Vector((0.0, -rh, 0.0)),
            Vector((W, -D, 0.0)),
            Vector((-W, -D, 0.0)),
            rise,
            roof,
            stations=stations,
            corner_lift=corner_lift,
            thickness=max(0.08, rise * 0.06),
        )
    )
    parts.append(
        slope_grid(
            "%s_slope_endright" % name,
            Vector((0.0, rh, 0.0)),
            Vector((0.0, rh, 0.0)),
            Vector((-W, D, 0.0)),
            Vector((W, D, 0.0)),
            rise,
            roof,
            stations=stations,
            corner_lift=corner_lift,
            thickness=max(0.08, rise * 0.06),
        )
    )

    # 正脊
    ridge_h = rise * 0.14
    parts.append(
        box(
            "%s_zhengji" % name,
            (rise * 0.06, rh * 2.0, ridge_h),
            ridge_mat,
            (0.0, 0.0, rise + ridge_h / 2.0 - rise * 0.02),
        )
    )
    # 四条垂脊：由正脊两端沿对角下到四个檐角
    for sy in (-1.0, 1.0):
        for sx in (-1.0, 1.0):
            parts.append(
                hip_ridge_bar(
                    "%s_chuiji_%s%s" % (name, "n" if sx < 0 else "p", "n" if sy < 0 else "p"),
                    Vector((0.0, sy * rh, rise)),
                    Vector((sx * W, sy * D, corner_lift)),
                    rise * 0.05,
                    ridge_mat,
                )
            )

    # 瓦垄：两长坡各铺一遍。短坡（两端三角面）面积小，用素面即可，
    # 这样既保住"瓦顶"的视觉，又不把面数浪费在看不到的位置。
    roll_w = eave_overhang * 0.16
    roll_h = rise * 0.055
    parts.append(
        tile_rolls_along_slope(
            "%s_rolls_front" % name,
            Vector((0.0, -rh, 0.0)),
            Vector((0.0, rh, 0.0)),
            Vector((-W, -D, 0.0)),
            Vector((-W, D, 0.0)),
            rise,
            roof,
            tile_width=roll_w,
            roll_height=roll_h,
            stations=stations,
            corner_lift=corner_lift,
        )
    )
    parts.append(
        tile_rolls_along_slope(
            "%s_rolls_back" % name,
            Vector((0.0, rh, 0.0)),
            Vector((0.0, -rh, 0.0)),
            Vector((W, D, 0.0)),
            Vector((W, -D, 0.0)),
            rise,
            roof,
            tile_width=roll_w,
            roll_height=roll_h,
            stations=stations,
            corner_lift=corner_lift,
        )
    )

    # 前后两坡檐口的椽头与滴水。短坡是三角形，用素面收口即可。
    rafter_w = eave_overhang * 0.10
    rafter_d = eave_overhang * 0.30
    for label, ea, eb in (
        ("front", Vector((-W, -D, 0.0)), Vector((-W, D, 0.0))),
        ("back", Vector((W, D, 0.0)), Vector((W, -D, 0.0))),
    ):
        parts.extend(
            eave_detail(
                "%s_eave_%s" % (name, label),
                ea,
                eb,
                rise_offset=0.0,
                materials=materials,
                rafter_width=rafter_w,
                rafter_depth=rafter_d,
                rafter_spacing=eave_overhang * 0.28,
                tile_height=roll_h,
                corner_lift=corner_lift,
            )
        )
    return parts


def hip_ridge_bar(name, start, end, thickness, material, segments=8):
    """垂脊：沿对角脊线铺一根方料，随举折曲线微微起拱。"""
    bm = bmesh.new()
    rows = []
    for i in range(segments + 1):
        t = i / segments
        point = start.lerp(end, t)
        # 与屋面一致的下凹程度，让脊压在屋面上而不悬空
        sag = (1.0 - t ** 1.45) * (start.z - end.z) * 0.0
        rows.append(
            [
                bm.verts.new(
                    (
                        point.x + dx,
                        point.y + dy,
                        point.z + sag + dz,
                    )
                )
                for dx, dy, dz in (
                    (-thickness / 2, -thickness / 2, 0.0),
                    (thickness / 2, -thickness / 2, 0.0),
                    (thickness / 2, thickness / 2, 0.0),
                    (-thickness / 2, thickness / 2, 0.0),
                )
            ]
        )
    bm.verts.ensure_lookup_table()
    for i in range(segments):
        for j in range(4):
            bm.faces.new(
                (
                    rows[i][j],
                    rows[i][(j + 1) % 4],
                    rows[i + 1][(j + 1) % 4],
                    rows[i + 1][j],
                )
            )
    bm.faces.new(list(reversed(rows[0])))
    bm.faces.new(rows[-1])
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return new_object(name, bm, material)


def tile_rolls_along_slope(
    name,
    ridge_a,
    ridge_b,
    eave_a,
    eave_b,
    rise,
    material,
    tile_width,
    roll_height,
    stations=10,
    corner_lift=0.0,
    corner_power=2.4,
    max_rolls=140,
):
    """沿屋面坡度铺瓦垄（筒瓦）。

    屋面本该是"垄与沟交替"的瓦面，这一步是把屋面从一块板变成瓦顶的关键。
    每条垄沿举折曲线从脊走到檐，并按翼角起翘抬高，因此不会穿出屋面。
    用单个合并网格输出，运行时按整体实例化，不会为每条垄增加 draw call。
    """
    profile = juzhe_profile(stations)

    def surface_point(t, s):
        base = eave_a.lerp(eave_b, s).lerp(ridge_a.lerp(ridge_b, s), t)
        z = rise * (t ** 1.45)
        if corner_lift:
            edge_weight = (1.0 - t) ** 1.6
            corner_weight = abs(s * 2.0 - 1.0) ** corner_power
            z += corner_lift * edge_weight * corner_weight
        return Vector((base.x, base.y, z))

    # 檐边总宽决定垄数，保证瓦垄宽度接近真实筒瓦。
    eave_len = (eave_b - eave_a).length
    rolls = max(3, min(max_rolls, int(round(eave_len / tile_width))))
    bm = bmesh.new()
    half = roll_height * 0.5
    # 瓦垄沿屋面由檐口走向屋脊（前进方向），横截面必须与前进方向垂直。
    # 前进方向 = 坡面中心由檐到脊的水平投影方向。
    advance = (ridge_a.lerp(ridge_b, 0.5) - eave_a.lerp(eave_b, 0.5))
    advance.z = 0.0
    if advance.length < 1e-6:
        advance = Vector((1.0, 0.0, 0.0))
    advance.normalize()
    across = Vector((-advance.y, advance.x, 0.0)).normalized()
    for index in range(rolls + 1):
        s = index / rolls
        rings = []
        for t, _ in profile:
            center = surface_point(t, s)
            # 筒瓦坐在屋面之上：整体抬到瓦高的一半，底面两角才不穿进屋面。
            center = Vector((center.x, center.y, center.z + half * 0.55))
            # 垄为半圆筒，跨在瓦沟之上；三点沿"垂直垄向"展开。
            ring = [
                bm.verts.new(
                    (
                        center.x - across.x * half,
                        center.y - across.y * half,
                        center.z - half * 0.42,
                    )
                ),
                bm.verts.new(
                    (
                        center.x,
                        center.y,
                        center.z + half * 0.95,
                    )
                ),
                bm.verts.new(
                    (
                        center.x + across.x * half,
                        center.y + across.y * half,
                        center.z - half * 0.18,
                    )
                ),
            ]
            rings.append(ring)
        for i in range(len(rings) - 1):
            for j in range(2):
                bm.faces.new(
                    (
                        rings[i][j],
                        rings[i][j + 1],
                        rings[i + 1][j + 1],
                        rings[i + 1][j],
                    )
                )
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return new_object(name, bm, material)


def eave_detail(
    name,
    eave_a,
    eave_b,
    rise_offset,
    materials,
    rafter_width,
    rafter_depth,
    rafter_spacing,
    tile_height,
    corner_lift=0.0,
    corner_power=2.4,
):
    """檐口构件：椽头、飞子、瓦当滴水。

    唐式屋檐下最显眼的是成排露明的椽头，以及檐口一列瓦当。缺了这两样，
    屋顶无论拍得多亮都像一块折纸；补上之后才有中式建筑的量感与节奏。
    """
    wood = materials["wood"]
    tile = materials["tile"]
    parts = []
    eave_dir = (eave_b - eave_a)
    span = eave_dir.length
    if span < 1e-6:
        return parts
    along = eave_dir.normalized()
    outward = Vector((-along.y, along.x, 0.0)).normalized()
    # 椽头与瓦口沿檐边方向旋转，不能假设每条檐边都平行于世界 Y 轴。
    yaw = math.atan2(outward.y, outward.x)

    count = max(2, int(round(span / rafter_spacing)))
    for i in range(count + 1):
        s = i / count
        base = eave_a.lerp(eave_b, s)
        lift = 0.0
        if corner_lift:
            corner_weight = abs(s * 2.0 - 1.0) ** corner_power
            lift = corner_lift * corner_weight
        # 椽头：沿出檐方向伸出一小段，端面朝外
        center = Vector(
            (
                base.x + outward.x * rafter_depth * 0.5,
                base.y + outward.y * rafter_depth * 0.5,
                base.z + lift + rise_offset + tile_height * 0.75,
            )
        )
        rafter = box(
            "%s_rafter_%d" % (name, i),
            (rafter_depth, rafter_width, tile_height * 1.5),
            wood,
            center,
        )
        rafter.rotation_euler.z = yaw
        parts.append(rafter)
    # 檐口滴水：沿檐边一条连续的瓦口横带
    drip = box(
        "%s_drip" % name,
        (rafter_depth * 0.55, span, tile_height * 0.5),
        tile,
        Vector(
            (
                (eave_a.x + eave_b.x) * 0.5 + outward.x * rafter_depth * 0.9,
                (eave_a.y + eave_b.y) * 0.5 + outward.y * rafter_depth * 0.9,
                (eave_a.z + eave_b.z) * 0.5 + rise_offset + tile_height * 0.15,
            )
        ),
    )
    drip.rotation_euler.z = yaw
    parts.append(drip)
    return parts


# ---------------------------------------------------------------- 台基


def build_platform(
    name,
    width,
    depth,
    height,
    materials,
    steps_front=True,
    bay_count=3,
):
    """台基（阶基）：主体 + 上沿压边 + 踏道。

    唐式台基多为素方台，上沿有一圈略外挑的压边石。
    """
    stone = materials["stone"]
    parts = []
    parts.append(box("%s_core" % name, (width, depth, height), stone, (0, 0, height / 2)))
    parts.append(
        box(
            "%s_coping" % name,
            (width * 1.03, depth * 1.03, height * 0.12),
            stone,
            (0, 0, height - height * 0.06),
        )
    )
    if steps_front:
        step_h = height * 0.5
        parts.append(
            box(
                "%s_step" % name,
                (width * 0.42, height * 1.6, step_h),
                stone,
                (0, depth / 2 + height * 0.8, step_h / 2),
            )
        )
    return parts


# ---------------------------------------------------------------- 完整建筑


def build_hall(
    name,
    modules=(3, 2),
    grade=0.30,
    materials=None,
    column_h=220.0,
    column_d=30.0,
    rise=115.0,
    overhang=90.0,
):
    """唐式殿堂：台基 → 柱网 → 铺作层 → 庑殿顶。

    所有尺寸以"分"为单位（默认一等材），按材分制换算成米。
    柱头之间按开间数布置铺作，柱头铺作与补间铺作共用同一构件函数，
    因此升级构件库会自动改善全城所有建筑。

    比例依据：唐构柱高约为开间宽度的 1.2～1.5 倍，柱径约 2 材（30 分），
    斗拱总高接近柱高的 4 成——这三条决定唐式"柱壮、斗拱大、屋顶厚重"的观感，
    也是它区别于明清细长柱、小斗科的关键。
    """
    mats = materials
    m = TangModule(grade)
    mats = resolve_materials(
        materials,
        "wood", "block", "tile", "stone", "plaster", "vermilion",
        "roof", "ridge",
    )
    parts = []

    bays_x, bays_y = modules
    bay_width = m.f(150)
    bay_depth = m.f(150)
    half_x = bay_width * bays_x / 2.0
    half_y = bay_depth * bays_y / 2.0

    # 台基
    plat_h = m.f(45)
    parts += build_platform(
        "%s_platform" % name,
        half_x * 2 + m.f(30),
        half_y * 2 + m.f(30),
        plat_h,
        mats,
    )
    top = plat_h

    # 柱网：外圈柱，柱头铺作落在柱顶
    col_h = m.f(column_h)
    col_d = m.f(column_d)
    plinth_h = m.f(20)
    col_xs = [-half_x, 0.0, half_x] if bays_x == 3 else [-half_x, half_x]
    col_ys = [-half_y, 0.0, half_y] if bays_y == 3 else [-half_y, half_y]

    def plinth_and_column(px, py):
        parts.append(
            build_plinth(
                "%s_plinth_%s_%s" % (name, _tag(px), _tag(py)),
                col_d * 1.6,
                plinth_h,
                mats["stone"],
                position=(px, py, top),
            )
        )
        col = build_column(
            "%s_col_%s_%s" % (name, _tag(px), _tag(py)),
            col_h,
            col_d,
            mats["vermilion"],
        )
        col.location = (px, py, top + plinth_h)
        parts.append(col)

    for px in col_xs:
        for py in col_ys:
            plinth_and_column(px, py)

    # 墙体与格扇门：落在柱网内侧，使建筑可进入、近看有格眼
    wall_h = m.f(column_h) * 0.86
    parts += build_facade(
        "%s_facade" % name,
        half_x - col_d * 0.9,
        half_y - col_d * 0.9,
        top + plinth_h,
        wall_h,
        mats,
        bay_width,
    )

    # 铺作层：沿四边按柱位布柱头铺作，柱间补间铺作
    puzuo_z = top + plinth_h + col_h
    puzuo_ids = []
    index = 0
    for py in col_ys:
        for px in col_xs:
            index += 1
            puzuo_ids.append(("%s_pz_%d" % (name, index), px, py))
    # 补间：每边中间再加一朵，与柱头铺作同型
    if bays_x == 3:
        for py in (col_ys[0], col_ys[-1]):
            index += 1
            puzuo_ids.append(("%s_pz_%d" % (name, index), 0.0, py))
    if bays_y == 3:
        for px in (col_xs[0], col_xs[-1]):
            index += 1
            puzuo_ids.append(("%s_pz_%d" % (name, index), px, 0.0))

    outer = half_x + m.f(30)
    outer_y = half_y + m.f(30)
    bpy.context.view_layer.update()
    puzuo_top = puzuo_z
    for pid, px, py in puzuo_ids:
        # 铺作统一按 +X 出跳建模，落到真实位置后按所在边旋转朝外。
        # 绕 Z 旋转 θ 会把 +X 映射到 (cosθ, sinθ)，据此定四条边的角度。
        on_x_edge = abs(abs(px) - half_x) < 1e-6
        on_y_edge = abs(abs(py) - half_y) < 1e-6
        yaws = []
        if on_x_edge and on_y_edge:
            # 转角铺作：唐式在角部向两个方向同时出跳，
            # 用两朵正交铺作交叉叠放，角部转角处才不会露空。
            yaw_x = 0.0 if px > 0 else 180.0
            yaw_y = 90.0 if py > 0 else -90.0
            yaws = [yaw_x, yaw_y]
        elif on_x_edge:
            yaws = [0.0 if px > 0 else 180.0]
        elif on_y_edge:
            yaws = [90.0 if py > 0 else -90.0]
        else:
            yaws = [0.0]

        for slot, yaw in enumerate(yaws):
            group = build_puzuo("%s_%d" % (pid, slot), m, mats, origin=(0.0, 0.0, puzuo_z))
            for obj in group:
                _rotate_about(obj, (0.0, 0.0, puzuo_z), math.radians(yaw))
                obj.location.x += px
                obj.location.y += py
            parts += group
            bpy.context.view_layer.update()
            puzuo_top = max(puzuo_top, puzuo_height_from_parts(group, puzuo_z))

    # 屋顶：举折 + 翼角起翘 + 瓦垄，落在铺作层之上
    roof_parts = build_hip_roof(
        "%s_roof" % name,
        half_x + m.f(30),
        half_y + m.f(30),
        m.f(overhang),
        m.f(rise),
        mats,
    )
    for obj in roof_parts:
        obj.location.z += puzuo_top
    parts += roof_parts
    return parts


def _tag(value):
    return ("n" if value < 0 else "p") + str(abs(round(value, 3)))


def _rotate_about(obj, pivot, angle):
    import mathutils

    rot = mathutils.Matrix.Rotation(angle, 4, "Z")
    pivot_v = mathutils.Vector(pivot)
    offset = mathutils.Vector(obj.location) - pivot_v
    obj.location = pivot_v + (rot @ offset)
    obj.rotation_euler.z += angle


# ---------------------------------------------------------------- 门窗


def build_chiwei(name, scale, material, position, facing=1.0, rotation_z=90.0):
    """鸱尾：唐式正脊两端的鱼尾状脊饰，向内卷曲。

    唐式是"鸱尾"——一块向上内卷的鳍状瓦饰，没有明清鸱吻的龙口与兽头，
    这是判断唐代屋顶轮廓最直观的细节之一。
    """
    h = scale
    profile = [
        (0.0, 0.0),
        (h * 0.34, 0.0),
        (h * 0.40, h * 0.42),
        (h * 0.36, h * 0.78),
        (h * 0.20, h * 0.98),
        (h * 0.04, h * 1.00),
        (-h * 0.06, h * 0.86),
        (-h * 0.02, h * 0.62),
        (h * 0.10, h * 0.46),
        (h * 0.14, h * 0.22),
        (h * 0.02, h * 0.10),
    ]
    obj = extrude_profile(profile, "y", h * 0.34, name, material, position)
    obj.rotation_euler.z = math.radians(rotation_z)
    obj.scale.x = facing
    return obj


def build_railing(name, length, height, post_size, material, position, rotation_y=0.0, bays=None):
    """勾栏（栏杆）：望柱 + 寻杖 + 蜀柱。

    唐式栏干常为"勾栏"，寻杖（上横木）贯通，望柱出头，蜀柱较疏。
    """
    bm = bmesh.new()
    pieces = []
    half = length / 2.0
    post_h = height
    rail_h = post_size * 0.9
    bays = bays or max(3, int(round(length / (height * 1.4))))
    # 望柱
    for i in range(bays + 1):
        x = -half + length * i / bays
        pieces.append((x, post_h / 2.0, post_size, post_h))
    # 寻杖（上横木）与下枋
    pieces.append((0.0, post_h - rail_h / 2.0, length, rail_h))
    pieces.append((0.0, post_h * 0.34, length, rail_h * 0.8))
    for cx, cz, sx, sz in pieces:
        before = len(bm.verts)
        bmesh.ops.create_cube(bm, size=1.0)
        bm.verts.ensure_lookup_table()
        for v in bm.verts[before:]:
            v.co.x = v.co.x * sx + cx
            v.co.z = v.co.z * sz + cz
            v.co.y = v.co.y * post_size
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = new_object(name, bm, material)
    obj.location = position
    obj.rotation_euler.z = rotation_y
    return obj


def build_gable_roof(
    name,
    half_width,
    half_depth,
    overhang,
    rise,
    materials,
    gable_overhang=None,
    stations=9,
    corner_lift=None,
    thickness=None,
):
    """悬山顶：两坡 + 两端出山（山面悬出），正脊 + 鸱尾。

    市井店铺多用悬山：结构简单、出檐大，沿街一排看过去比庑殿更亲切。
    这里把正脊放在 X 轴、坡面朝 ±Y：店铺临街面为 +Y 时，山墙在左右，
    街上看得到连续檐口而不是把山尖正对街道。
    """
    from mathutils import Vector

    materials = resolve_materials(materials, "roof", "ridge", "wood", "tile")
    roof = materials["roof"]
    ridge_mat = materials["ridge"]
    wood = materials["wood"]
    plaster = materials.get("plaster", wood)
    ridge_half = half_width + (
        gable_overhang if gable_overhang is not None else overhang * 0.55
    )
    eave_half = half_depth + overhang
    if thickness is None:
        thickness = max(0.08, rise * 0.06)
    if corner_lift is None:
        corner_lift = rise * 0.16

    parts = []
    for sign, tag in ((-1.0, "front"), (1.0, "back")):
        if sign < 0:
            ridge_a = Vector((-ridge_half, 0.0, 0.0))
            ridge_b = Vector((ridge_half, 0.0, 0.0))
            eave_a = Vector((-ridge_half, -eave_half, 0.0))
            eave_b = Vector((ridge_half, -eave_half, 0.0))
        else:
            ridge_a = Vector((ridge_half, 0.0, 0.0))
            ridge_b = Vector((-ridge_half, 0.0, 0.0))
            eave_a = Vector((ridge_half, eave_half, 0.0))
            eave_b = Vector((-ridge_half, eave_half, 0.0))
        parts.append(
            slope_grid(
                "%s_slope_%s" % (name, tag),
                ridge_a, ridge_b, eave_a, eave_b,
                rise, roof,
                stations=stations,
                corner_lift=corner_lift,
                thickness=thickness,
            )
        )
        roll_w = overhang * 0.16
        parts.append(
            tile_rolls_along_slope(
                "%s_rolls_%s" % (name, tag),
                ridge_a, ridge_b, eave_a, eave_b,
                rise, roof,
                tile_width=roll_w,
                roll_height=rise * 0.055,
                stations=stations,
                corner_lift=corner_lift,
            )
        )
        parts.extend(
            eave_detail(
                "%s_eave_%s" % (name, tag),
                eave_a, eave_b,
                rise_offset=0.0,
                materials=materials,
                rafter_width=overhang * 0.10,
                rafter_depth=overhang * 0.30,
                rafter_spacing=overhang * 0.28,
                tile_height=rise * 0.055,
                corner_lift=corner_lift,
            )
        )

    # 正脊与两端鸱尾
    ridge_h = rise * 0.16
    parts.append(
        box(
            "%s_zhengji" % name,
            (ridge_half * 2.0, rise * 0.07, ridge_h),
            ridge_mat,
            (0.0, 0.0, rise + ridge_h / 2.0 - rise * 0.02),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            build_chiwei(
                "%s_chiwei_%s" % (name, tag),
                rise * 0.46,
                ridge_mat,
                (sign * (ridge_half * 0.98), 0.0, rise + ridge_h * 0.4),
                facing=sign,
                rotation_z=0.0,
            )
        )

    # 山面：灰泥三角墙 + 两侧博风板。屋面向外悬出，板只压在山面边缘。
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            extrude_profile(
                [(-eave_half * 0.96, 0.0), (eave_half * 0.96, 0.0), (0.0, rise * 0.92)],
                "x",
                max(0.06, thickness * 0.8),
                "%s_gable_%s" % (name, tag),
                plaster,
                (sign * half_width, 0.0, 0.0),
            )
        )
        for sy, sy_tag in ((-1.0, "front"), (1.0, "back")):
            parts.append(
                hip_ridge_bar(
                    "%s_bofeng_%s_%s" % (name, tag, sy_tag),
                    Vector((sign * half_width, sy * eave_half, 0.0)),
                    Vector((sign * half_width, 0.0, rise)),
                    max(0.07, rise * 0.045),
                    wood,
                )
            )
    return parts


# ---------------------------------------------------------------- 市井店铺


def build_awning(
    name,
    half_width,
    y_inner,
    y_outer,
    z_inner,
    z_outer,
    material,
    sag=0.10,
    columns=4,
):
    """沿街布篷：从墙面挑出，外缘略低，布面有受重下垂与波浪垂边。"""
    bm = bmesh.new()
    grid = []
    for j in range(columns + 1):
        v = j / columns
        row = []
        for i in range(17):
            u = i / 16.0
            x = (u * 2.0 - 1.0) * half_width
            y = y_inner + (y_outer - y_inner) * v
            z = z_inner + (z_outer - z_inner) * v - sag * math.sin(math.pi * u) * v
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for j in range(columns):
        for i in range(16):
            bm.faces.new(
                (grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i])
            )
    # 波浪垂边：从外缘向下挂一小段，形成真实布篷的节奏。
    outer = []
    for i in range(17):
        u = i / 16.0
        x = (u * 2.0 - 1.0) * half_width
        z = z_outer - sag * math.sin(math.pi * u)
        outer.append(bm.verts.new((x, y_outer, z)))
    bottom = []
    for i in range(17):
        u = i / 16.0
        x = (u * 2.0 - 1.0) * half_width
        scallop = 0.20 + (0.10 if i % 2 == 0 else 0.0)
        bottom.append(bm.verts.new((x, y_outer + 0.015, z_outer - scallop)))
    for i in range(16):
        bm.faces.new((outer[i], outer[i + 1], bottom[i + 1], bottom[i]))
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return new_object(name, bm, material)


def build_shop(
    name,
    bays=2,
    grade=0.22,
    materials=None,
    has_upper=False,
    awning=True,
    storey=0,
):
    """市井店铺：夯土/白灰墙 + 木构门面 + 悬山顶，可沿街连续排列。

    与殿宇共用同一套构件函数（柱、柱础、铺作、屋面、格扇），
    区别只在材等（三号材）、开间数与是否用悬山。这样市井与宫阙是同一套
    营造体系下的不同等级，而不是两批风格不同的模型。

    storey 是铺面的等级档位（0/1/2）：同一套构件、同一份 GLB，
    靠柱高、铺作跳数、举高与台基高度形成真实的檐口高低差。
    之前整条街的铺面共用一个尺度，屋檐几乎在同一条线上，
    天际线读成一条直线——这是"街不像街"的主要原因之一。
    """
    materials = resolve_materials(
        materials,
        "wood", "block", "tile", "stone", "plaster", "vermilion",
        "roof", "ridge", "interior",
    )
    m = TangModule(grade)
    parts = []

    # 三档尺度：低铺 / 常铺 / 高铺。数值是"分"，按材分制换算。
    STOREYS = {
        0: {"col": 160.0, "plat": 16.0, "rise": 62.0, "jumps": 1, "bay": 110.0},
        1: {"col": 190.0, "plat": 20.0, "rise": 70.0, "jumps": 1, "bay": 120.0},
        2: {"col": 228.0, "plat": 26.0, "rise": 80.0, "jumps": 2, "bay": 132.0},
        # 3 = 重檐：柱更高、台基更高、铺作两跳，并在檐下另加一道腰檐。
        # 唐式市街里只有规模较大的行铺（绸缎庄、香药铺一类）才用重檐，
        # 它是这条街天际线的最高一档，不能和常铺同高。
        3: {"col": 300.0, "plat": 34.0, "rise": 104.0, "jumps": 2, "bay": 150.0},
    }
    spec = STOREYS[max(0, min(3, int(storey)))]

    bay = m.f(spec["bay"])
    half_x = bay * bays / 2.0
    half_y = m.f(120)
    col_d = m.f(28)
    col_h = m.f(spec["col"]) if not has_upper else m.f(170)
    plat_h = m.f(spec["plat"])

    parts.append(
        box(
            "%s_plinth_base" % name,
            (half_x * 2 + m.f(24), half_y * 2 + m.f(24), plat_h),
            materials["stone"],
            (0.0, 0.0, plat_h / 2.0),
        )
    )
    # 台基压边：三档台基高度不同，压边让台基读成"阶基"而不是一块垫板。
    parts.append(
        box(
            "%s_plinth_coping" % name,
            (half_x * 2 + m.f(30), half_y * 2 + m.f(30), m.f(5)),
            materials["stone"],
            (0.0, 0.0, plat_h - m.f(2.5)),
        )
    )
    top = plat_h

    # 沿街立面（+Y）列柱 + 后墙 + 两山墙
    col_xs = [-half_x + bay * (i + 0.5) for i in range(bays)]
    for index, px in enumerate(col_xs):
        parts.append(
            build_plinth(
                "%s_plinth_%d" % (name, index),
                col_d * 1.5,
                m.f(12),
                materials["stone"],
                position=(px, half_y - col_d * 0.9, top),
            )
        )
        col = build_column(
            "%s_col_%d" % (name, index),
            col_h,
            col_d,
            materials["vermilion"],
        )
        col.location = (px, half_y - col_d * 0.9, top + m.f(12))
        parts.append(col)

    wall_h = col_h * 0.94
    wall_z = top + m.f(12)
    # 后墙与山墙用夯土，正面为木格扇与板门
    parts.append(
        box(
            "%s_wall_back" % name,
            (half_x * 2.0, m.f(14), wall_h),
            materials["plaster"],
            (0.0, -half_y, wall_z + wall_h / 2.0),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_wall_side_%s" % (name, tag),
                (m.f(14), half_y * 2.0, wall_h),
                materials["plaster"],
                (sign * half_x, 0.0, wall_z + wall_h / 2.0),
            )
        )

    # 正面格扇与门
    panel_w = (half_x * 2.0) / bays
    for i in range(bays):
        cx = -half_x + panel_w * (i + 0.5)
        # 唐式铺面不是整面落地格眼：下部为木板，上部为格扇。
        parts.append(
            box(
                "%s_lower_panel_%d" % (name, i),
                (panel_w * 0.86, m.f(4), wall_h * 0.30),
                materials["wood"],
                (cx, half_y - m.f(8), wall_z + wall_h * 0.15),
            )
        )
        parts.append(
            lattice_panel(
                "%s_lattice_%d" % (name, i),
                panel_w * 0.9,
                wall_h * 0.64,
                panel_w * 0.035,
                materials["wood"],
                grid_x=3,
                grid_y=5,
                depth=0.045,
                position=(cx, half_y - m.f(6), wall_z + wall_h * 0.62),
            )
        )

    # 铺面内部：格扇是透空的，后面必须有一层暗色内壁，否则透过格眼直接看到
    # 后墙的白灰，整面读成"白墙贴了一排木格子"——这是首街最刺眼的假象。
    # 内壁略退进，留出柜台进深，近看能读出"店"而不是"墙"。
    parts.append(
        box(
            "%s_interior" % name,
            (half_x * 2.0, m.f(5), wall_h * 0.94),
            materials["interior"],
            (0.0, half_y - m.f(30), wall_z + wall_h * 0.47),
        )
    )
    # 柜台：临街一排木台面，给内壁一个前景，避免内壁读成一块黑板。
    parts.append(
        box(
            "%s_counter" % name,
            (half_x * 1.72, m.f(46), m.f(8),
            ),
            materials["wood"],
            (0.0, half_y - m.f(36), wall_z + m.f(74)),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_counter_leg_%s" % (name, tag),
                (m.f(8), m.f(8), m.f(74)),
                materials["wood"],
                (sign * half_x * 0.72, half_y - m.f(36), wall_z + m.f(37)),
            )
        )

    # 货架：柜台之后的两排搁板 + 立柱。
    # 之前只有柜台没有货架，从街上看进店内是一片空墙，
    # 读不出"这是卖东西的铺子"。货架靠内壁立起，两排高度错开。
    shelf_y = half_y - m.f(26)
    for row, shelf_z in enumerate((0.72, 1.18)):
        parts.append(
            box(
                "%s_shelf_%d" % (name, row),
                (half_x * 1.60, m.f(5), m.f(30)),
                materials["wood"],
                (0.0, shelf_y, wall_z + m.f(shelf_z * 100)),
            )
        )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_shelf_post_%s" % (name, tag),
                (m.f(7), m.f(7), m.f(130)),
                materials["wood"],
                (sign * half_x * 0.80, shelf_y, wall_z + m.f(65)),
            )
        )
    # 货架上的货：陶罐与布卷，给货架一点体量，不读成空搁板。
    for i in range(4):
        jx = -half_x * 0.58 + i * (half_x * 0.39)
        for row, shelf_z in enumerate((0.72, 1.18)):
            parts.append(
                box(
                    "%s_shelf_goods_%d_%d" % (name, i, row),
                    (m.f(18), m.f(20), m.f(18)),
                    materials["vermilion"] if (i + row) % 2 else materials["wood"],
                    (jx, shelf_y, wall_z + m.f(shelf_z * 100 + 16)),
                )
            )

    # 檐下构造：额枋 + 雀替 + 檐椽。
    # 之前柱顶直接接铺作，柱与斗拱之间是空的，近看只有"柱子上顶着一堆斗"；
    # 唐构在柱头必有额枋联系，柱内侧还有雀替承托，檐下另有檐椽出挑。
    # 这三件是铺面立面读起来"有构造"而不是"贴片"的关键。
    fang_h = m.f(20)
    fang_z = wall_z + wall_h - fang_h * 0.5
    parts.append(
        box(
            "%s_efang" % name,
            (half_x * 2.0 + m.f(10), m.f(12), fang_h),
            materials["wood"],
            (0.0, half_y - col_d * 0.9, fang_z),
        )
    )
    # 雀替：柱头内侧的斜撑，从柱身斜向上接到额枋。
    for px in col_xs:
        for sign in (-1.0, 1.0):
            parts.append(
                extrude_profile(
                    [
                        (0.0, 0.0),
                        (m.f(26), 0.0),
                        (0.0, -m.f(30)),
                    ],
                    "x",
                    m.f(9),
                    "%s_queti_%s_%s" % (name, _tag(px), _tag(sign)),
                    materials["wood"],
                    (px + sign * m.f(12), half_y - col_d * 0.9, fang_z - fang_h * 0.5),
                )
            )
    # 檐椽：沿檐口等距排布的一排出挑椽头，压在额枋之上。
    rafter_y = half_y + m.f(6)
    rafter_count = max(6, int(round((half_x * 2.0) / m.f(22))))
    for i in range(rafter_count):
        rx = -half_x + (half_x * 2.0) * (i + 0.5) / rafter_count
        parts.append(
            box(
                "%s_rafter_%d" % (name, i),
                (m.f(7), m.f(34), m.f(7)),
                materials["wood"],
                (rx, rafter_y + m.f(10), fang_z + fang_h * 0.5 + m.f(4)),
            )
        )

    # 檐下铺作：市井用四铺作单抄；高铺用两跳，斗拱更大一层，
    # 这是"高铺"与"常铺"最直观的等级差。
    puzuo_z = wall_z + wall_h
    puzuo_top = puzuo_z
    for index, px in enumerate(col_xs):
        group = build_puzuo(
            "%s_pz_%d" % (name, index),
            m,
            materials,
            origin=(0.0, 0.0, puzuo_z),
            jumps=spec["jumps"],
        )
        for obj in group:
            obj.location.y += half_y - col_d * 0.9
            obj.location.x += px
        parts += group
        bpy.context.view_layer.update()
        puzuo_top = max(puzuo_top, puzuo_height_from_parts(group, puzuo_z))
    roof = build_gable_roof(
        "%s_roof" % name,
        half_x + m.f(10),
        half_y + m.f(10),
        m.f(45),
        m.f(spec["rise"]),
        materials,
        gable_overhang=m.f(20),
    )
    # 屋顶构件以"檐口 z=0"为基准，挂载时把檐口抬到铺作层顶，
    # 这样檐口正好坐在撩檐枋上，不会穿进斗拱也不会悬空。
    for obj in roof:
        obj.location.z += puzuo_top
    parts += roof

    # 重檐：在主檐之下再加一道腰檐。
    # 腰檐不做完整屋顶，只把同一套坡面缩小、降低一档挂上去；
    # 这样从街上看是"两层檐"，而不是把单层屋顶整体抬高。
    if int(storey) >= 3:
        # 腰檐必须挂在"墙顶、主檐铺作之下"这一层：
        # 放低会悬在墙体中部，上下都不接，侧视是两块脱开的板（实测）。
        # 取墙顶再减去腰檐自身举高，让檐口正好压在墙顶线上。
        waist_rise = m.f(24)
        waist_z = wall_z + wall_h - waist_rise
        waist = build_gable_roof(
            "%s_waist_roof" % name,
            # 腰檐出挑要小于主檐，读作"下层檐"而不是第二个屋顶。
            half_x + m.f(16),
            half_y + m.f(16),
            m.f(30),
            waist_rise,
            materials,
            gable_overhang=m.f(14),
        )
        for obj in waist:
            obj.location.z += waist_z
        parts += waist

        # 两层檐之间必须有"上层墙身"，否则中间空着，
        # 读成两栋楼叠在一起，而不是一栋重檐楼（实测正视/侧视都这样）。
        # 这段墙身比下层略收进，靠铺作承托上层檐。
        upper_z = waist_z + waist_rise
        upper_h = puzuo_top - upper_z
        if upper_h > m.f(10):
            parts.append(
                box(
                    "%s_upper_wall" % name,
                    (half_x * 1.94, m.f(12), upper_h),
                    materials["plaster"],
                    (0.0, half_y - m.f(9), upper_z + upper_h * 0.5),
                )
            )
            # 上层墙身的窗：重檐楼的上层通常是整排窗，不是实墙。
            # 窗必须贴在墙的临街面（+Y 一侧）：墙中心在 half_y - 9 分、
            # 厚 12 分，临街面在 half_y - 3 分。之前放在 half_y - 15 分，
            # 那是墙的背面，从街上完全看不见（实测正视是实墙）。
            parts.append(
                box(
                    "%s_upper_window" % name,
                    (half_x * 1.60, m.f(3), upper_h * 0.62),
                    materials["interior"],
                    (0.0, half_y - m.f(1), upper_z + upper_h * 0.56),
                )
            )
            # 窗棂：两根横棂 + 三根竖棂，把黑窗格成格子，不读成一块黑板。
            for wy in (0.30, 0.52, 0.74):
                parts.append(
                    box(
                        "%s_upper_mullion_h_%d" % (name, int(wy * 100)),
                        (half_x * 1.62, m.f(5), m.f(3)),
                        materials["wood"],
                        (0.0, half_y - m.f(1), upper_z + upper_h * wy),
                    )
                )
            for wx in (-0.62, -0.21, 0.21, 0.62):
                parts.append(
                    box(
                        "%s_upper_mullion_v_%d" % (name, int((wx + 1) * 100)),
                        (m.f(3), m.f(5), upper_h * 0.62),
                        materials["wood"],
                        (wx * half_x * 1.60, half_y - m.f(1), upper_z + upper_h * 0.56),
                    )
                )
            # 上层墙身两侧的短柱，把窗框住。
            for sx in (-1.0, 1.0):
                parts.append(
                    box(
                        "%s_upper_col_%s" % (name, "n" if sx < 0 else "p"),
                        (m.f(14), m.f(16), upper_h),
                        materials["vermilion"],
                        (sx * half_x * 0.95, half_y - m.f(8), upper_z + upper_h * 0.5),
                    )
                )

    # 雨篷（遮阳棚）：从铺面挑出，外缘略低；立柱落回台基，
    # 不能像旧版一样在檐下悬着一块平板。
    # 篷口高度随柱高走：三档铺面的篷口位置因此不同，街上看过去
    # 篷布也形成错落，而不是一条连续的横线。
    if awning:
        cloth = materials.get("cloth") or materials["wood"]
        z_inner = top + m.f(spec["col"] * 0.52)
        z_outer = z_inner - m.f(10)
        y_outer = half_y + m.f(58)
        parts.append(
            build_awning(
                "%s_awning" % name,
                half_x * 0.94,
                half_y - m.f(4),
                y_outer,
                z_inner,
                z_outer,
                cloth,
            )
        )
        for sign, tag in ((-1.0, "n"), (1.0, "p")):
            pole_h = max(0.1, z_outer - top)
            pole = box(
                "%s_awning_pole_%s" % (name, tag),
                (m.f(7), m.f(7), pole_h),
                materials["wood"],
                (sign * half_x * 0.84, y_outer - 0.02, top + pole_h / 2.0),
            )
            parts.append(pole)
    return parts


def build_townhouse(
    name,
    bays=3,
    grade=0.22,
    materials=None,
):
    """两层临街酒肆：一层铺面 + 真实楼板 + 外挑楼廊 + 二层格窗 + 悬山顶。

    首街需要一条明确的竖向节奏，不能把单层铺面整体放大冒充楼阁。
    """
    materials = resolve_materials(
        materials,
        "wood", "block", "tile", "stone", "plaster", "vermilion",
        "roof", "ridge", "cloth", "interior",
    )
    m = TangModule(grade)
    parts = []
    bay = m.f(120)
    half_x = bay * bays / 2.0
    half_y = m.f(125)
    col_d = m.f(28)
    ground_col_h = m.f(165)
    upper_col_h = m.f(118)
    plat_h = m.f(24)
    plinth_h = m.f(12)

    parts += build_platform(
        "%s_platform" % name,
        half_x * 2.0 + m.f(30),
        half_y * 2.0 + m.f(30),
        plat_h,
        materials,
    )
    top = plat_h
    col_xs = [-half_x + bay * i for i in range(bays + 1)]
    front_y = half_y - col_d * 0.9
    back_y = -half_y + col_d * 0.9

    def add_column(px, py, height, tag):
        parts.append(
            build_plinth(
                "%s_plinth_%s" % (name, tag),
                col_d * 1.5,
                plinth_h,
                materials["stone"],
                position=(px, py, top),
            )
        )
        col = build_column(
            "%s_col_%s" % (name, tag),
            height,
            col_d,
            materials["vermilion"],
        )
        col.location = (px, py, top + plinth_h)
        parts.append(col)

    for i, px in enumerate(col_xs):
        add_column(px, front_y, ground_col_h, "front_%d" % i)
        add_column(px, back_y, ground_col_h, "back_%d" % i)

    ground_wall_h = ground_col_h * 0.90
    wall_z = top + plinth_h
    parts.append(
        box(
            "%s_back_wall" % name,
            (half_x * 2.0, m.f(14), ground_wall_h),
            materials["plaster"],
            (0.0, -half_y, wall_z + ground_wall_h / 2.0),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_side_wall_%s" % (name, tag),
                (m.f(14), half_y * 2.0, ground_wall_h),
                materials["plaster"],
                (sign * half_x, 0.0, wall_z + ground_wall_h / 2.0),
            )
        )

    panel_w = bay * 0.90
    for i in range(bays):
        cx = -half_x + bay * (i + 0.5)
        parts.append(
            box(
                "%s_lower_%d" % (name, i),
                (panel_w * 0.94, m.f(4), ground_wall_h * 0.28),
                materials["wood"],
                (cx, front_y - m.f(2), wall_z + ground_wall_h * 0.14),
            )
        )
        parts.append(
            lattice_panel(
                "%s_ground_lattice_%d" % (name, i),
                panel_w,
                ground_wall_h * 0.66,
                panel_w * 0.032,
                materials["wood"],
                grid_x=3,
                grid_y=5,
                depth=0.045,
                position=(cx, front_y, wall_z + ground_wall_h * 0.61),
            )
        )

    # 一层店内：格扇后面必须有暗色内壁。酒肆的格扇同样透空，
    # 直接看到后墙白灰会把一层读成一排白墙加木格子。
    parts.append(
        box(
            "%s_ground_interior" % name,
            (half_x * 2.0, m.f(6), ground_wall_h * 0.96),
            materials["interior"],
            (0.0, front_y - m.f(34), wall_z + ground_wall_h * 0.48),
        )
    )
    # 柜台：临街一排长台面 + 两条腿。
    parts.append(
        box(
            "%s_ground_counter" % name,
            (half_x * 1.78, m.f(50), m.f(8)),
            materials["wood"],
            (0.0, front_y - m.f(40), wall_z + m.f(80)),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_ground_counter_leg_%s" % (name, tag),
                (m.f(8), m.f(8), m.f(80)),
                materials["wood"],
                (sign * half_x * 0.76, front_y - m.f(40), wall_z + m.f(40)),
            )
        )

    # 一层额枋与楼板：楼板外挑，形成真实可站立的楼廊。
    ground_top = wall_z + ground_col_h
    parts.append(
        box(
            "%s_floor_beam" % name,
            (half_x * 2.0 + m.f(24), m.f(10), m.f(14)),
            materials["wood"],
            (0.0, 0.0, ground_top + m.f(7)),
        )
    )
    deck_z = ground_top + m.f(16)
    balcony_depth = m.f(42)
    parts.append(
        box(
            "%s_gallery_deck" % name,
            (half_x * 2.0 + m.f(18), half_y * 2.0 + balcony_depth, m.f(10)),
            materials["wood"],
            (0.0, balcony_depth * 0.28, deck_z),
        )
    )

    upper_front_y = half_y + balcony_depth * 0.58
    upper_back_y = -half_y + col_d * 0.8
    upper_base = deck_z + m.f(5)
    for i, px in enumerate(col_xs):
        add_column_at = build_column(
            "%s_upper_col_%d" % (name, i),
            upper_col_h,
            col_d * 0.92,
            materials["vermilion"],
        )
        add_column_at.location = (px, upper_front_y, upper_base)
        parts.append(add_column_at)
    for i, px in enumerate(col_xs):
        col = build_column(
            "%s_upper_back_col_%d" % (name, i),
            upper_col_h,
            col_d * 0.86,
            materials["vermilion"],
        )
        col.location = (px, upper_back_y, upper_base)
        parts.append(col)

    upper_wall_h = upper_col_h * 0.88
    parts.append(
        box(
            "%s_upper_back" % name,
            (half_x * 2.0, m.f(12), upper_wall_h),
            materials["plaster"],
            (0.0, upper_back_y + m.f(6), upper_base + upper_wall_h / 2.0),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            box(
                "%s_upper_side_%s" % (name, tag),
                (m.f(12), half_y * 2.0 + balcony_depth, upper_wall_h),
                materials["plaster"],
                (sign * half_x, balcony_depth * 0.28, upper_base + upper_wall_h / 2.0),
            )
        )
    for i in range(bays):
        cx = -half_x + bay * (i + 0.5)
        parts.append(
            lattice_panel(
                "%s_upper_lattice_%d" % (name, i),
                panel_w * 0.92,
                upper_wall_h * 0.70,
                panel_w * 0.030,
                materials["wood"],
                grid_x=3,
                grid_y=4,
                depth=0.045,
                position=(cx, upper_front_y, upper_base + upper_wall_h * 0.52),
            )
        )
    # 二层窗后同样要暗：从街上透过二层格窗看到后墙白灰，会读成"白板"。
    parts.append(
        box(
            "%s_upper_interior" % name,
            (half_x * 2.0, m.f(5), upper_wall_h * 0.94),
            materials["interior"],
            (0.0, upper_front_y - m.f(22), upper_base + upper_wall_h * 0.48),
        )
    )

    # 楼廊勾栏与一层布篷：让二层不是贴在一层上的一个方盒。
    parts.append(
        build_railing(
            "%s_gallery_rail" % name,
            half_x * 1.84,
            m.f(50),
            m.f(8),
            materials["wood"],
            (0.0, upper_front_y - m.f(3), deck_z + m.f(5)),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            build_railing(
                "%s_gallery_side_rail_%s" % (name, tag),
                balcony_depth * 0.92,
                m.f(50),
                m.f(8),
                materials["wood"],
                (sign * half_x * 0.92, half_y + balcony_depth * 0.40, deck_z + m.f(5)),
                rotation_y=math.radians(90.0),
            )
        )
    parts.append(
        build_awning(
            "%s_awning" % name,
            half_x * 0.92,
            half_y - m.f(4),
            half_y + m.f(50),
            wall_z + m.f(104),
            wall_z + m.f(94),
            materials["cloth"],
            sag=0.12,
        )
    )

    # 二层铺作与屋顶：檐口由实际铺作顶高决定，避免屋顶压进楼廊。
    puzuo_z = upper_base + upper_col_h
    puzuo_top = puzuo_z
    for i, px in enumerate(col_xs):
        group = build_puzuo(
            "%s_upper_pz_%d" % (name, i),
            m,
            materials,
            origin=(0.0, 0.0, puzuo_z),
            jumps=1,
        )
        for obj in group:
            _rotate_about(obj, (0.0, 0.0, puzuo_z), math.radians(90.0))
            obj.location.x += px
            obj.location.y += upper_front_y
        parts += group
        bpy.context.view_layer.update()
        puzuo_top = max(puzuo_top, puzuo_height_from_parts(group, puzuo_z))

    roof = build_gable_roof(
        "%s_roof" % name,
        half_x + m.f(14),
        half_y + balcony_depth * 0.45,
        m.f(52),
        m.f(82),
        materials,
        gable_overhang=m.f(22),
    )
    for obj in roof:
        obj.location.z += puzuo_top
    parts += roof
    return parts


def lattice_panel(
    name,
    width,
    height,
    frame_w,
    material,
    grid_x=4,
    grid_y=6,
    depth=0.06,
    position=(0.0, 0.0, 0.0),
    rotation_y=0.0,
):
    """格扇（格子门）：外框 + 横竖棂条。

    唐式格扇的棂条比例粗壮、格眼方正，与明清细密冰裂、步步锦不同。
    这里是实体棂条而非贴图，近看有真实厚度与投影。
    """
    bm = bmesh.new()
    half_w, half_h = width / 2.0, height / 2.0
    d = depth

    # 用独立网格再合并，避免 bmesh 里追踪新顶点出错
    pieces = []
    pieces.append((0.0, half_h - frame_w / 2, width, frame_w))      # 上框
    pieces.append((0.0, -half_h + frame_w / 2, width, frame_w))     # 下框
    pieces.append((-half_w + frame_w / 2, 0.0, frame_w, height))    # 左框
    pieces.append((half_w - frame_w / 2, 0.0, frame_w, height))     # 右框
    # 格眼：竖棂
    for i in range(1, grid_x):
        x = -half_w + width * i / grid_x
        pieces.append((x, 0.0, frame_w * 0.55, height - frame_w * 2))
    # 横棂
    for j in range(1, grid_y):
        y = -half_h + height * j / grid_y
        pieces.append((0.0, y, width - frame_w * 2, frame_w * 0.55))

    bm = bmesh.new()
    for cx, cz, sx, sz in pieces:
        before = len(bm.verts)
        bmesh.ops.create_cube(bm, size=1.0)
        bm.verts.ensure_lookup_table()
        new_verts = [bm.verts[i] for i in range(before, len(bm.verts))]
        for v in new_verts:
            # 格扇是立在 XZ 平面上的板：X 为宽、Z 为高、Y 为厚度。
            v.co.x = v.co.x * sx + cx
            v.co.z = v.co.z * sz + cz
            v.co.y = v.co.y * d
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = new_object(name, bm, material)
    obj.location = position
    obj.rotation_euler.z = rotation_y
    return obj


def wall_panel(name, width, height, thickness, material, position, rotation_y=0.0):
    """墙面板：白灰墙或夯土墙。"""
    obj = box(name, (width, thickness, height), material, (0, 0, 0))
    obj.location = position
    obj.rotation_euler.z = rotation_y
    return obj


def build_facade(
    name,
    half_x,
    half_y,
    wall_z,
    wall_h,
    materials,
    bay_width,
    openings=True,
):
    """四面围合：后墙与两山墙为实墙，正面按开间布置格扇门。

    这是把"只有柱子的亭子"变成"可进入的殿宇"的关键一步：
    有墙有门，近看有格眼，从里面看也成立。
    """
    wall_mat = materials["plaster"]
    wood = materials["wood"]
    parts = []
    t = 0.28

    # 后墙（-Y）与两山墙（±X）
    parts.append(
        wall_panel(
            "%s_wall_back" % name,
            half_x * 2.0,
            wall_h,
            t,
            wall_mat,
            (0.0, -half_y, wall_z + wall_h / 2.0),
        )
    )
    for sign, tag in ((-1.0, "n"), (1.0, "p")):
        parts.append(
            wall_panel(
                "%s_wall_side_%s" % (name, tag),
                half_y * 2.0,
                wall_h,
                t,
                wall_mat,
                (sign * half_x, 0.0, wall_z + wall_h / 2.0),
                rotation_y=math.radians(90.0),
            )
        )

    if not openings:
        return parts

    # 正面（+Y）：按开间布置格扇，中间为门
    bays = max(2, int(round(half_x * 2.0 / bay_width)))
    panel_w = (half_x * 2.0) / bays
    frame_w = panel_w * 0.045
    door_h = wall_h * 0.82
    for i in range(bays):
        cx = -half_x + panel_w * (i + 0.5)
        parts.append(
            lattice_panel(
                "%s_lattice_%d" % (name, i),
                panel_w * 0.92,
                door_h,
                frame_w,
                wood,
                grid_x=4,
                grid_y=6,
                depth=0.05,
                position=(cx, half_y, wall_z + door_h / 2.0),
            )
        )
    # 门楣以上的横披
    lintel_h = wall_h - door_h
    if lintel_h > 0.05:
        parts.append(
            wall_panel(
                "%s_transom" % name,
                half_x * 2.0,
                lintel_h,
                t,
                wall_mat,
                (0.0, half_y, wall_z + door_h + lintel_h / 2.0),
            )
        )
    return parts
