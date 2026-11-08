#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gltf_writer.py — 纯 Python 几何原语 + glTF 2.0 / GLB 写出器
==========================================================
- 顶点属性 POSITION / NORMAL / TEXCOORD_0，uint32 索引
- 按「语义路径 + 材质」合并几何，保留可读的 node 层级
- PBR Metallic-Roughness：albedo(sRGB) + normal + ORM(R=AO,G= Rough,B=Metal)
- 输出 .gltf（外置纹理）与 .glb（纹理内嵌），均符合 glTF 2.0
"""
import os, json, struct, math, io
import numpy as np
from PIL import Image

FLOAT = 5126
UINT = 5125
ARRAY_BUFFER = 34962
ELEM_BUFFER = 34963


# ---------------------------------------------------------------------------
# 几何原语（返回 v, n, uv, f）
# ---------------------------------------------------------------------------
def _quad_geo(p0, p1, p2, p3, tile=1.0, uv0=(0, 0), flip=False):
    p0, p1, p2, p3 = map(lambda p: np.array(p, np.float32), (p0, p1, p2, p3))
    n = np.cross(p1 - p0, p2 - p0)
    ln = np.linalg.norm(n)
    n = n / ln if ln > 1e-8 else np.array([0, 1, 0], np.float32)
    if flip:
        n = -n
        p1, p3 = p3, p1
    uw = np.linalg.norm(p1 - p0) / tile
    uh = np.linalg.norm(p3 - p0) / tile
    u0, v0 = uv0
    uv = np.array([[u0, v0], [u0 + uw, v0], [u0 + uw, v0 + uh], [u0, v0 + uh]], np.float32)
    v = np.stack([p0, p1, p2, p3])
    nn = np.tile(n, (4, 1))
    f = np.array([[0, 1, 2], [0, 2, 3]], np.int32)
    return v, nn, uv, f


def box(sx, sy, sz, tile=1.0, center=(0, 0, 0)):
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    cx, cy, cz = center
    P = lambda x, y, z: (x + cx, y + cy, z + cz)
    faces = [
        ((0, 0, 1), [P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)], sx / tile, sy / tile),
        ((0, 0, -1), [P(hx, -hy, -hz), P(-hx, -hy, -hz), (-hx + cx, hy + cy, -hz + cz), (hx + cx, hy + cy, -hz + cz)], sx / tile, sy / tile),
        ((1, 0, 0), [P(hx, -hy, hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(hx, hy, hz)], sz / tile, sy / tile),
        ((-1, 0, 0), [P(-hx, -hy, -hz), P(-hx, -hy, hz), P(-hx, hy, hz), P(-hx, hy, -hz)], sz / tile, sy / tile),
        ((0, 1, 0), [P(-hx, hy, hz), P(hx, hy, hz), P(hx, hy, -hz), P(-hx, hy, -hz)], sx / tile, sz / tile),
        ((0, -1, 0), [P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, -hy, hz), P(-hx, -hy, hz)], sx / tile, sz / tile),
    ]
    vs, ns, uvs, fs = [], [], [], []
    off = 0
    for (nx, ny, nz), corners, uw, uh in faces:
        v = np.array(corners, np.float32)
        n = np.tile(np.array([nx, ny, nz], np.float32), (4, 1))
        uv = np.array([[0, 0], [uw, 0], [uw, uh], [0, uh]], np.float32)
        f = np.array([[0, 1, 2], [0, 2, 3]], np.int32) + off
        vs.append(v); ns.append(n); uvs.append(uv); fs.append(f); off += 4
    return np.concatenate(vs), np.concatenate(ns), np.concatenate(uvs), np.concatenate(fs)


def plane_xz(w, d, y=0.0, center=(0, 0), tile=1.0, flip=True):
    cx, cz = center
    return _quad_geo((cx - w / 2, y, cz - d / 2), (cx + w / 2, y, cz - d / 2),
                     (cx + w / 2, y, cz + d / 2), (cx - w / 2, y, cz + d / 2),
                     tile=tile, flip=flip)


def quad(p0, p1, p2, p3, tile=1.0, uv0=(0, 0), flip=False):
    return _quad_geo(p0, p1, p2, p3, tile=tile, uv0=uv0, flip=flip)


def cylinder(r, h, seg=12, tile=1.0, center=(0, 0, 0), caps=True, r2=None):
    """圆柱/圆台；r2 为上端半径（None 同 r）"""
    cx, cy, cz = center
    rt = r if r2 is None else r2
    vs, ns, uvs, fs = [], [], [], []
    y0, y1 = cy - h / 2, cy + h / 2
    circ = 2 * math.pi * r / tile
    for i in range(seg):
        a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
        c0, s0, c1, s1 = math.cos(a0), math.sin(a0), math.cos(a1), math.sin(a1)
        p0 = (cx + r * c0, y0, cz + r * s0)
        p1 = (cx + r * c1, y0, cz + r * s1)
        p2 = (cx + rt * c1, y1, cz + rt * s1)
        p3 = (cx + rt * c0, y1, cz + rt * s0)
        n0 = np.array([c0, 0, s0], np.float32)
        n1 = np.array([c1, 0, s1], np.float32)
        v = np.array([p0, p1, p2, p3], np.float32)
        n = np.array([n0, n1, n1, n0], np.float32)
        u = np.array([[i / seg * circ, 0], [(i + 1) / seg * circ, 0],
                      [(i + 1) / seg * circ, h / tile], [i / seg * circ, h / tile]], np.float32)
        f = np.array([[0, 1, 2], [0, 2, 3]], np.int32)
        vs.append(v); ns.append(n); uvs.append(u); fs.append(f)
    if caps:
        for yy, rad, ny in ((y1, rt, 1.0), (y0, r, -1.0)):
            for i in range(seg):
                a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
                p0 = (cx, yy, cz)
                p1 = (cx + rad * math.cos(a0), yy, cz + rad * math.sin(a0))
                p2 = (cx + rad * math.cos(a1), yy, cz + rad * math.sin(a1))
                v = np.array([p0, p1, p2], np.float32)
                n = np.tile(np.array([0, ny, 0], np.float32), (3, 1))
                u = np.array([[.5, .5], [.5 + .5 * math.cos(a0), .5 + .5 * math.sin(a0)],
                              [.5 + .5 * math.cos(a1), .5 + .5 * math.sin(a1)]], np.float32)
                f = np.array([[0, 2, 1]] if ny > 0 else [[0, 1, 2]], np.int32)
                vs.append(v); ns.append(n); uvs.append(u); fs.append(f)
    # 每片独立顶点，需重排索引
    return _merge_parts(vs, ns, uvs, fs)


def lathe(profile, seg=16, tile=1.0, center=(0, 0, 0)):
    """旋转体：profile = [(radius, y), ...]，从下到上"""
    cx, cy, cz = center
    vs, ns, uvs, fs = [], [], [], []
    n = len(profile)
    for j in range(n - 1):
        r0, y0 = profile[j]
        r1, y1 = profile[j + 1]
        dy = y1 - y0
        dr = r1 - r0
        for i in range(seg):
            a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            c0, s0, c1, s1 = math.cos(a0), math.sin(a0), math.cos(a1), math.sin(a1)
            p0 = (cx + r0 * c0, cy + y0, cz + r0 * s0)
            p1 = (cx + r0 * c1, cy + y0, cz + r0 * s1)
            p2 = (cx + r1 * c1, cy + y1, cz + r1 * s1)
            p3 = (cx + r1 * c0, cy + y1, cz + r1 * s0)
            nrm = np.array([dy * c0, -dr, dy * s0], np.float32)
            nrm /= (np.linalg.norm(nrm) + 1e-8)
            v = np.array([p0, p1, p2, p3], np.float32)
            nn = np.tile(nrm, (4, 1))
            u = np.array([[i / seg * 2 * math.pi * r0 / tile, y0 / tile],
                          [(i + 1) / seg * 2 * math.pi * r0 / tile, y0 / tile],
                          [(i + 1) / seg * 2 * math.pi * r1 / tile, y1 / tile],
                          [i / seg * 2 * math.pi * r1 / tile, y1 / tile]], np.float32)
            f = np.array([[0, 1, 2], [0, 2, 3]], np.int32)
            vs.append(v); ns.append(nn); uvs.append(u); fs.append(f)
    return _merge_parts(vs, ns, uvs, fs)


def _merge_parts(vs, ns, uvs, fs):
    off, F = 0, []
    for v, f in zip(vs, fs):
        F.append(f + off)
        off += len(v)
    return (np.concatenate(vs), np.concatenate(ns),
            np.concatenate(uvs), np.concatenate(F))


def transform(geo, M):
    """应用 4x4 变换到顶点与法线"""
    v, n, uv, f = geo
    R = M[:3, :3]
    t = M[:3, 3]
    v = v @ R.T + t
    try:
        n = n @ np.linalg.inv(R)
    except np.linalg.LinAlgError:
        pass
    ln = np.linalg.norm(n, axis=1, keepdims=True)
    n = n / np.maximum(ln, 1e-8)
    return v, n, uv, f


def trs(t=(0, 0, 0), rot_y=0.0, s=(1, 1, 1)):
    c, si = math.cos(rot_y), math.sin(rot_y)
    R = np.array([[c, 0, si], [0, 1, 0], [-si, 0, c]], np.float32)
    S = np.diag(np.array(s, np.float32))
    M = np.eye(4, dtype=np.float32)
    M[:3, :3] = R @ S
    M[:3, 3] = t
    return M


# ---------------------------------------------------------------------------
# glTF 写出器
# ---------------------------------------------------------------------------
class GeoAccum:
    def __init__(self):
        self.parts = []

    def add(self, geo, M=None):
        if M is not None:
            geo = transform(geo, M)
        self.parts.append(geo)

    def packed(self):
        if not self.parts:
            return None
        v = np.concatenate([p[0] for p in self.parts]).astype(np.float32)
        n = np.concatenate([p[1] for p in self.parts]).astype(np.float32)
        uv = np.concatenate([p[2] for p in self.parts]).astype(np.float32)
        off, fs = 0, []
        for p in self.parts:
            fs.append(p[3].astype(np.uint32) + off)
            off += len(p[0])
        f = np.concatenate(fs).ravel().astype(np.uint32)
        return v, n, uv, f


class GLTFWriter:
    def __init__(self, root_dir, model_dir="assets/models", glb_embed_max_px=None):
        self.root = root_dir
        self.model_dir = os.path.join(root_dir, model_dir)
        # 模块 GLB 是轻量自包含分发版；限制内嵌贴图边长可显著减小体积。
        # 分离式 .gltf + assets/textures/ 始终使用全分辨率，不受此影响。
        self.glb_embed_max_px = glb_embed_max_px
        os.makedirs(self.model_dir, exist_ok=True)
        self.buf = bytearray()
        self.bufferViews = []
        self.accessors = []
        self.meshes = []
        self.nodes = []
        self.materials = []
        self.images = []
        self.samplers = []
        self.textures = []
        self.lights = []
        self._light_nodes = []
        self.groups = {}          # group path -> {mat -> GeoAccum}
        self._tex_cache = {}
        self._mat_idx = {}
        self.extras = {}

    # ---- 几何 -------------------------------------------------------------
    def add(self, group, mat, geo, M=None):
        g = self.groups.setdefault(group, {})
        g.setdefault(mat, GeoAccum()).add(geo, M)

    def _view(self, data, target=None):
        while len(self.buf) % 4:
            self.buf.append(0)
        off = len(self.buf)
        self.buf.extend(data)
        bv = {"buffer": 0, "byteOffset": off, "byteLength": len(data)}
        if target:
            bv["target"] = target
        self.bufferViews.append(bv)
        return len(self.bufferViews) - 1

    def _accessor(self, arr, ctype, atype, target, minmax=False):
        arr = np.ascontiguousarray(arr)
        vi = self._view(arr.tobytes(), target)
        a = {"bufferView": vi, "componentType": ctype,
             "count": len(arr), "type": atype}
        if minmax:
            a["min"] = arr.min(axis=0).tolist()
            a["max"] = arr.max(axis=0).tolist()
        self.accessors.append(a)
        return len(self.accessors) - 1

    # ---- 纹理与材质 -------------------------------------------------------
    def _image(self, rel_path):
        if rel_path in self._tex_cache:
            return self._tex_cache[rel_path]
        self.images.append({"uri": rel_path})
        idx = len(self.images) - 1
        self._tex_cache[rel_path] = idx
        return idx

    def _texture(self, rel_path):
        img = self._image(rel_path)
        if not self.samplers:
            self.samplers.append({"magFilter": 9729, "minFilter": 9987,
                                  "wrapS": 10497, "wrapT": 10497})
        self.textures.append({"sampler": 0, "source": img})
        return len(self.textures) - 1

    def register_material(self, key, cfg):
        """cfg: {albedo, normal, orm, emissive?, alpha?, double_sided?, emissive_factor?}"""
        if key in self._mat_idx:
            return self._mat_idx[key]
        pbr = {
            "baseColorTexture": {"index": self._texture(cfg["albedo"])},
            "metallicRoughnessTexture": {"index": self._texture(cfg["orm"])},
            "baseColorFactor": cfg.get("base_color_factor", [1, 1, 1, 1]),
            "metallicFactor": 1.0, "roughnessFactor": 1.0,
        }
        m = {
            "name": "MAT_" + key,
            "pbrMetallicRoughness": pbr,
            "normalTexture": {"index": self._texture(cfg["normal"]), "scale": 1.0},
            "occlusionTexture": {"index": self._texture(cfg["orm"]), "strength": 1.0},
        }
        if cfg.get("emissive"):
            m["emissiveTexture"] = {"index": self._texture(cfg["emissive"])}
            m["emissiveFactor"] = cfg.get("emissive_factor", [1, 1, 1])
        if cfg.get("alpha"):
            m["alphaMode"] = cfg.get("alpha_mode", "MASK")
            m["alphaCutoff"] = cfg.get("alpha_cutoff", 0.5)
        if cfg.get("double_sided"):
            m["doubleSided"] = True
        self.materials.append(m)
        idx = len(self.materials) - 1
        self._mat_idx[key] = idx
        return idx

    def add_light(self, ltype, color, intensity, node_name, position=None, rotation=None):
        idx = len(self.lights)
        light = {"type": ltype, "color": list(color), "intensity": intensity}
        if ltype == "point":
            light["range"] = 14.0
        self.lights.append(light)
        n = {"name": node_name, "extensions": {"KHR_lights_punctual": {"light": idx}}}
        if position:
            n["translation"] = list(position)
        if rotation:
            n["rotation"] = list(rotation)
        self.nodes.append(n)
        idx_node = len(self.nodes) - 1
        self._light_nodes.append(idx_node)
        return idx_node

    # ---- 组装 -------------------------------------------------------------
    def _build_meshes(self):
        mesh_for_group = {}
        for gname, bymat in self.groups.items():
            prims = []
            for mat, acc in bymat.items():
                packed = acc.packed()
                if packed is None:
                    continue
                v, n, uv, f = packed
                a0 = self._accessor(v, FLOAT, "VEC3", ARRAY_BUFFER, minmax=True)
                a1 = self._accessor(n, FLOAT, "VEC3", ARRAY_BUFFER)
                a2 = self._accessor(uv, FLOAT, "VEC2", ARRAY_BUFFER)
                a3 = self._accessor(f, UINT, "SCALAR", ELEM_BUFFER)
                p = {"attributes": {"POSITION": a0, "NORMAL": a1, "TEXCOORD_0": a2},
                     "indices": a3, "material": self._mat_idx[mat], "mode": 4}
                prims.append(p)
            if not prims:
                continue
            self.meshes.append({"name": "MESH_" + gname.replace("/", "_"), "primitives": prims})
            mesh_for_group[gname] = len(self.meshes) - 1
        return mesh_for_group

    def _build_node_tree(self, mesh_for_group):
        tree = {"name": "ChangAn_Street_01", "children": {}}
        for gname in self.groups:
            if gname not in mesh_for_group:
                continue
            cur = tree
            for part in gname.split("/"):
                cur = cur["children"].setdefault(part, {"name": part, "children": {}})
            cur["_mesh"] = mesh_for_group[gname]

        def emit(node):
            entry = {"name": node["name"]}
            if "_mesh" in node:
                entry["mesh"] = node["_mesh"]
            kids = [emit(c) for c in node["children"].values()]
            if kids:
                entry["children"] = kids
            self.nodes.append(entry)
            return len(self.nodes) - 1

        return emit(tree)

    def _prune_unused(self, doc):
        """裁掉未被任何 primitive 引用的材质/纹理/图片（模块 GLB 只内嵌用到的贴图）"""
        used = sorted({p["material"] for m in doc["meshes"] for p in m["primitives"]})
        rm = {o: i for i, o in enumerate(used)}
        for m in doc["meshes"]:
            for p in m["primitives"]:
                p["material"] = rm[p["material"]]
        doc["materials"] = [doc["materials"][i] for i in used]
        tset = set()
        for m in doc["materials"]:
            for v in m.values():
                if isinstance(v, dict) and "index" in v:
                    tset.add(v["index"])
            for v in m.get("pbrMetallicRoughness", {}).values():
                if isinstance(v, dict) and "index" in v:
                    tset.add(v["index"])
        used_t = sorted(tset)
        rt = {o: i for i, o in enumerate(used_t)}

        def fix(d):
            for k, v in d.items():
                if isinstance(v, dict) and "index" in v:
                    v["index"] = rt[v["index"]]

        for m in doc["materials"]:
            fix(m)
            fix(m.get("pbrMetallicRoughness", {}))
        doc["textures"] = [doc["textures"][i] for i in used_t]
        used_i = sorted({t["source"] for t in doc["textures"]})
        ri = {o: i for i, o in enumerate(used_i)}
        for t in doc["textures"]:
            t["source"] = ri[t["source"]]
        doc["images"] = [doc["images"][i] for i in used_i]
        return doc

    def finalize(self):
        mesh_for_group = self._build_meshes()
        root = self._build_node_tree(mesh_for_group)
        doc = {
            "asset": {"version": "2.0", "generator": "ChangAn Street-01 PBR Builder",
                      "copyright": "street-01 procedural PBR asset set"},
            "scene": 0,
            "scenes": [{"name": "ChangAn Street 01",
                        "nodes": [root] + list(self._light_nodes)}],
            "nodes": self.nodes,
            "meshes": self.meshes,
            "materials": self.materials,
            "textures": self.textures,
            "samplers": self.samplers,
            "images": self.images,
            "accessors": self.accessors,
            "bufferViews": self.bufferViews,
            "buffers": [{"byteLength": len(self.buf)}],
            "extensionsUsed": ["KHR_lights_punctual"],
        }
        if self.lights:
            doc["extensions"] = {"KHR_lights_punctual": {"lights": self.lights}}
        if self.extras:
            doc["extras"] = self.extras
        return self._prune_unused(doc)

    def write(self, basename="changan_street_01"):
        doc = self.finalize()
        bin_path = os.path.join(self.model_dir, basename + ".bin")
        gltf_path = os.path.join(self.model_dir, basename + ".gltf")
        with open(bin_path, "wb") as f:
            f.write(self.buf)
        doc["buffers"][0]["uri"] = basename + ".bin"
        with open(gltf_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        glb_path = self._write_glb(doc, basename)
        return {"gltf": gltf_path, "bin": bin_path, "glb": glb_path,
                "meshes": len(self.meshes), "materials": len(self.materials),
                "nodes": len(self.nodes), "texture_files": len(self.images),
                "bin_bytes": len(self.buf)}

    def _write_glb(self, doc, basename):
        """把外置贴图内嵌进 GLB：image.uri -> image.bufferView"""
        d = json.loads(json.dumps(doc))
        buf = bytearray(self.buf)
        new_bv = list(d["bufferViews"])
        for img in d["images"]:
            uri = img.pop("uri", None)
            if not uri:
                continue
            path = os.path.normpath(os.path.join(self.model_dir, uri))
            if not os.path.exists(path):
                print("  ! GLB 缺少纹理:", path)
                continue
            with open(path, "rb") as f:
                data = f.read()
            if self.glb_embed_max_px and path.lower().endswith((".png", ".jpg", ".jpeg")):
                im = Image.open(io.BytesIO(data))
                if max(im.size) > self.glb_embed_max_px:
                    im.thumbnail((self.glb_embed_max_px, self.glb_embed_max_px),
                                 Image.Resampling.LANCZOS)
                    bio = io.BytesIO()
                    im.save(bio, format="PNG", optimize=True)
                    data = bio.getvalue()
            while len(buf) % 4:
                buf.append(0)
            off = len(buf)
            buf.extend(data)
            new_bv.append({"buffer": 0, "byteOffset": off, "byteLength": len(data)})
            img["bufferView"] = len(new_bv) - 1
            img["mimeType"] = "image/png"
        d["bufferViews"] = new_bv
        d["buffers"] = [{"byteLength": len(buf)}]
        json_bytes = json.dumps(d, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        while len(json_bytes) % 4:
            json_bytes += b" "
        while len(buf) % 4:
            buf.append(0)
        total = 12 + 8 + len(json_bytes) + 8 + len(buf)
        out = bytearray()
        out += struct.pack("<4sII", b"glTF", 2, total)
        out += struct.pack("<I4s", len(json_bytes), b"JSON") + json_bytes
        out += struct.pack("<I4s", len(buf), b"BIN\0") + buf
        path = os.path.join(self.model_dir, basename + ".glb")
        with open(path, "wb") as f:
            f.write(out)
        return path


def make_rgba(albedo_path, opacity_path, out_path):
    """glTF 的 baseColor alpha 必须内嵌在贴图 A 通道；合成 RGBA"""
    a = Image.open(albedo_path).convert("RGB")
    o = Image.open(opacity_path).convert("L")
    a.putalpha(o)
    a.save(out_path, optimize=True)
    return out_path
