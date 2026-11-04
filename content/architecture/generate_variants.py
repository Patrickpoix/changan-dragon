"""从 8 个底子按规则生成街景实例（纯 Python，不跑 Blender）。

规则（写入实例清单，供后续街景/Three.js 布置复用，几何不重复打包）：
- 底子共享：实例只引用底子 GLB，不复制几何、不新增贴图；颜色变化只用
  运行时材质映射（mat_cloth / mat_vermilion 等语义材质的实例色），不打包新贴图。
- 相邻规则：沿街顺序中相邻两间不得同底子、不得同招牌；本清单用程序断言。
- 变化维度：开间（底子自带）、屋顶（悬山/庑殿按类别）、招牌（名/形式/材质）、
  位置（街侧/街段）、朝向（临街面朝街，北侧 0°、南侧 180°）、坊区风格
  （西市/东市/道馆区/酒肆巷四档，决定布篷与柱色档位）。
- 街景顺序刻意把同类隔开：铁匠—铺面—酒肆—殿堂—铁匠—铺面—酒肆—殿堂……

用法：python3 generate_variants.py --report build/out/prototype-report.json --out build/out/variant-instances.json
"""
import argparse
import json

DISTRICTS = ["西市", "东市", "道馆区", "酒肆巷"]
CLOTH = ["mat_cloth", "mat_vermilion", "mat_timber"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    with open(args.report, encoding="utf-8") as fh:
        report = json.load(fh)
    bases = {p["id"]: p for p in report["prototypes"]}
    # 街景顺序：类别轮换，同一底子在街上最多出现 3 次且不相邻
    order = ["blacksmith-a", "shop-a", "tavern-a", "hall-a",
             "blacksmith-b", "shop-b", "tavern-b", "hall-b"]
    instances = []
    x = 0.0
    for i, bid in enumerate(order * 3):
        base = bases[bid]
        w = base["dimensions_m"][0]
        side = "north" if i % 2 == 0 else "south"
        inst = {
            "instance": "street-%02d" % (i + 1),
            "base_id": bid,
            "category": base["category"],
            "sign": base["sign"],
            "district": DISTRICTS[i % len(DISTRICTS)],
            "side": side,
            "rotation_deg": 0 if side == "north" else 180,
            "street_x_m": round(x + w / 2.0, 3),
            "width_m": w,
            "awning_material": CLOTH[i % len(CLOTH)],
            "roof": base["roof"],
            "geometry_shared_from": base["glb"],
        }
        instances.append(inst)
        x += w + 0.6  # 0.6m 街间缝隙，避免贴合
    # 相邻断言：不同底子、不同招牌
    for a, b in zip(instances, instances[1:]):
        assert a["base_id"] != b["base_id"], "adjacent same base: %s" % a
        assert a["sign"] != b["sign"], "adjacent same sign: %s" % a
    out = {"rule": "相邻不同底子、不同招牌；几何共享底子 GLB，不重复打包贴图",
           "street_length_m": round(x, 3), "instances": instances}
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print("VARIANTS_OK %d instances street_length_m=%.2f" % (len(instances), x))


if __name__ == "__main__":
    main()
