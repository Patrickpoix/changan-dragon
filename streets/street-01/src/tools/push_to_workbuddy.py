#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
push_to_workbuddy.py — 把 streets/street-01/ 推送到 changan-dragon 的 workbuddy 分支
=====================================================================
走 api.github.com 的 Git Data API，不依赖 github.com 的 git 协议。
以 main 的 tree 为 base_tree 增量挂载新子树，**main 上任何既有文件都不会被改动**。

前置：一个具有 contents:write 权限的 GitHub token
    export GITHUB_TOKEN=<token>
    python3 src/tools/push_to_workbuddy.py --dry-run   # 只预览将上传什么
    python3 src/tools/push_to_workbuddy.py             # 实际推送

实现要点：
  * 文本类文件用 tree 条目的 content 内联；二进制用 POST /git/blobs 建 blob。
  * 自底向上构造子树，最后以 base_tree 挂到仓库根的 streets/ 下。
  * GitHub 单 blob 上限 100 MB；且 REST 创建 blob 的实测阈值更低
    （19.7 MB 成功 / 41.6 MB 报 422 "input was too large"）。
    超过 MAX_BLOB 的文件会跳过并列出（可用 bash build.sh 重建）。
    模块 GLB 已用 512px 内嵌贴图降到 9 MB 以内，故通常只剩主 GLB 被跳过。
  * 若 workbuddy 分支已存在，则在其 HEAD 上追加一次提交，不强制覆盖。
"""
import os, sys, json, base64, time, argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

OWNER, REPO, BRANCH = "Patrickpoix", "changan-dragon", "workbuddy"
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
API = "https://api.github.com/repos/%s/%s" % (OWNER, REPO)
PREFIX = "streets/street-01"
MAX_BLOB = 99 * 1024 * 1024
TEXT_EXT = {".py", ".md", ".json", ".html", ".sh", ".gltf", ".txt",
            ".css", ".js", ".yml", ".yaml", ".svg"}
TEXT_NAMES = {".gitattributes", ".gitignore"}
SKIP_DIRS = {"__pycache__", ".git"}

try:
    import requests
except ImportError:
    sys.exit("缺少 requests：pip3 install requests")


def is_text(path):
    return (os.path.splitext(path)[1].lower() in TEXT_EXT
            or os.path.basename(path) in TEXT_NAMES)


def collect():
    out = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            full = os.path.join(dp, fn)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            out.append((PREFIX + "/" + rel, full, os.path.getsize(full)))
    return sorted(out)


def call(token, method, path, payload=None, retries=2):
    headers = {"Authorization": "Bearer " + token,
               "Accept": "application/vnd.github+json",
               "X-GitHub-Api-Version": "2022-11-28"}
    last = None
    for i in range(retries + 1):
        try:
            r = requests.request(method, API + path, headers=headers,
                                 json=payload, timeout=240)
        except Exception as e:
            last = e
            time.sleep(1.5 * (i + 1))
            continue
        if r.status_code in (200, 201):
            return r.json()
        if r.status_code == 403:
            raise RuntimeError("403 权限不足：该 token 需要 contents:write 权限。" + r.text[:160])
        last = RuntimeError("%s %s -> HTTP %s %s" %
                            (method, path, r.status_code, r.text[:160]))
        if r.status_code >= 500:
            time.sleep(1.5 * (i + 1))
            continue
        break
    raise last


def branch_head(token):
    r = requests.get(API + "/git/ref/heads/" + BRANCH,
                     headers={"Authorization": "Bearer " + token,
                              "Accept": "application/vnd.github+json"}, timeout=60)
    if r.status_code == 200:
        return r.json()["object"]["sha"]
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--token", default=os.environ.get("GITHUB_TOKEN", ""))
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--message", default=(
        "feat(street-01): 新增一条街的高精细 PBR 建模素材与完整场景（workbuddy 支线）"))
    args = ap.parse_args()

    files = collect()
    uploadable = [x for x in files if x[2] <= MAX_BLOB]
    skipped = [(p, s) for p, _, s in files if s > MAX_BLOB]
    text_files = [x for x in uploadable if is_text(x[0])]
    bin_files = [x for x in uploadable if not is_text(x[0])]

    print("源目录 : %s" % ROOT)
    print("目标   : %s/%s @ %s / %s" % (OWNER, REPO, BRANCH, PREFIX))
    print("文件   : %d 个 / %.1f MB" % (len(files), sum(s for _, _, s in files) / 1048576))
    print("  文本内联 %d  |  二进制 blob %d  |  跳过(>99MB) %d" %
          (len(text_files), len(bin_files), len(skipped)))
    for p, s in skipped:
        print("    ! 跳过 %s (%.1f MB) — 超出 REST blob 阈值，可由 bash build.sh 重建" %
              (p, s / 1048576))
    if args.dry_run:
        print("dry-run 结束，未发起任何写请求。")
        return 0
    if not args.token:
        sys.exit("缺少 token：设置 GITHUB_TOKEN 或传 --token（需 contents:write 权限）")

    token = args.token
    # 1) 基线：main 的 commit/tree；分支已存在则改用其 HEAD
    base_commit = call(token, "GET", "/git/ref/heads/main")["object"]["sha"]
    parent = base_commit
    existing = branch_head(token)
    update_ref = existing is not None
    if existing:
        parent = existing
        print("分支已存在，追加提交:", parent[:10])
    base_tree = call(token, "GET", "/git/commits/" + parent)["tree"]["sha"]

    # 2) 二进制建 blob（并发）
    shas = {}

    def mkblob(item):
        p, f, _ = item
        raw = open(f, "rb").read()
        d = call(token, "POST", "/git/blobs",
                 {"content": base64.b64encode(raw).decode(), "encoding": "base64"})
        return p, d["sha"]

    t0 = time.time()
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = [ex.submit(mkblob, it) for it in bin_files]
        for i, fu in enumerate(as_completed(futs), 1):
            p, sha = fu.result()
            shas[p] = sha
            if i % 50 == 0 or i == len(futs):
                print("  blob %d/%d (%.0fs)" % (i, len(futs), time.time() - t0), flush=True)

    # 3) 自底向上构造子树
    entries = defaultdict(list)
    for p, f, s in uploadable:
        rel = p[len(PREFIX) + 1:]
        d = os.path.dirname(rel)
        name = os.path.basename(rel)
        mode = "100755" if name.endswith(".sh") or name == "build.sh" else "100644"
        if is_text(p):
            ent = {"path": name, "mode": mode, "type": "blob",
                   "content": open(f, encoding="utf-8").read()}
        else:
            ent = {"path": name, "mode": mode, "type": "blob", "sha": shas[p]}
        entries[d].append(ent)

    all_dirs = set(entries) | {""}
    for d in list(entries):
        parts = d.split("/")
        for i in range(1, len(parts)):
            all_dirs.add("/".join(parts[:i]))
    # 必须按「目录深度降序」自底向上构造，根 "" 最后处理。
    # 注意：一级目录不含斜杠，若用 -count("/") 会得到 0 而与根同级，
    # 导致根 tree 先于子目录生成、子目录挂不上（曾造成只入库 5 个文件）。
    def depth(d):
        return 0 if d == "" else d.count("/") + 1

    order = sorted(all_dirs, key=lambda d: (-depth(d), d))
    subtree = {}
    for d in order:
        group = list(entries.get(d, []))
        for child in all_dirs:
            if child and os.path.dirname(child) == d and child in subtree:
                group.append({"path": os.path.basename(child), "mode": "040000",
                              "type": "tree", "sha": subtree[child]})
        subtree[d] = call(token, "POST", "/git/trees", {"tree": group})["sha"]
    print("  子树构造完成: %d 个目录" % len(subtree), flush=True)

    # 4) streets/ -> 挂到 main tree（增量，不动任何既有条目）
    streets = call(token, "POST", "/git/trees", {"tree": [
        {"path": "street-01", "mode": "040000", "type": "tree", "sha": subtree[""]}]})["sha"]
    final_tree = call(token, "POST", "/git/trees", {"base_tree": base_tree, "tree": [
        {"path": "streets", "mode": "040000", "type": "tree", "sha": streets}]})["sha"]

    # 4b) 提交前自检：递归 tree 里子树 blob 数必须与上传数完全一致。
    #     放在 commit 之前，失败时不会写入任何坏 commit / ref。
    r = requests.get(API + "/git/trees/%s?recursive=1" % final_tree,
                     headers={"Authorization": "Bearer " + token,
                              "Accept": "application/vnd.github+json"}, timeout=180)
    rj = r.json()
    got = sum(1 for x in rj.get("tree", [])
              if x["type"] == "blob" and x["path"].startswith(PREFIX + "/"))
    print("  自检: 远端子树 blob %d / 预期 %d (truncated=%s)" %
          (got, len(uploadable), rj.get("truncated")), flush=True)
    if r.status_code != 200 or rj.get("truncated") or got != len(uploadable):
        raise RuntimeError("子树不完整（blob %d/%d），已中止提交；请检查 tree 构造" %
                           (got, len(uploadable)))

    # 5) commit + ref
    commit = call(token, "POST", "/git/commits", {
        "message": args.message, "tree": final_tree, "parents": [parent]})["sha"]
    if update_ref:
        call(token, "PATCH", "/git/refs/heads/" + BRANCH, {"sha": commit, "force": False})
    else:
        call(token, "POST", "/git/refs", {"ref": "refs/heads/" + BRANCH, "sha": commit})
    print("完成: %s -> %s" % (BRANCH, commit[:10]))
    print("https://github.com/%s/%s/tree/%s/%s" % (OWNER, REPO, BRANCH, PREFIX))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
