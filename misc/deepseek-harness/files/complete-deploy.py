#!/usr/bin/env python3
"""Ensure workspace peerDependencies are materialized in a hoisted pnpm deploy."""

import json
import shutil
import sys
from pathlib import Path

SKIP_NAMES = frozenset({
    "node_modules",
    "tests",
    "test",
    ".git",
    "tsconfig.json",
    "tsconfig.host.json",
    "tsconfig.client.json",
    "tsdown.config.ts",
    "vitest.config.ts",
})


def index_workspace_packages(wrksrc: Path) -> dict[str, Path]:
    packages: dict[str, Path] = {}
    for manifest in wrksrc.glob("**/package.json"):
        if any(part in ("node_modules", "tests", "fixtures") for part in manifest.parts):
            continue
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
        except Exception:
            continue
        name = data.get("name")
        if isinstance(name, str) and name:
            packages[name] = manifest.parent
    return packages


def find_missing_peers(deploy: Path) -> set[str]:
    nm = deploy / "node_modules"
    manifests = [deploy / "package.json"]
    manifests.extend(nm.glob("*/package.json"))
    manifests.extend(nm.glob("@*/*/package.json"))

    missing: set[str] = set()
    for manifest in manifests:
        data = json.loads(manifest.read_text(encoding="utf-8"))
        opt_peers = {
            k
            for k, v in data.get("peerDependenciesMeta", {}).items()
            if isinstance(v, dict) and v.get("optional")
        }
        for section in ("dependencies", "peerDependencies"):
            for dep in data.get(section, {}):
                if section == "peerDependencies" and dep in opt_peers:
                    continue
                if not (nm / dep / "package.json").exists():
                    if not (manifest.parent / "node_modules" / dep / "package.json").exists():
                        missing.add(dep)
    return missing


def copy_package(src_dir: Path, dst_dir: Path) -> None:
    dst_dir.mkdir(parents=True, exist_ok=True)
    for item in src_dir.iterdir():
        if item.name in SKIP_NAMES or item.name.endswith(".orig"):
            continue
        target = dst_dir / item.name
        if item.is_dir():
            shutil.copytree(
                item,
                target,
                symlinks=True,
                dirs_exist_ok=True,
                ignore=shutil.ignore_patterns("*.tsbuildinfo", "*.orig"),
            )
        else:
            shutil.copy2(item, target)


def main() -> int:
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <wrksrc> <deploy_dir>", file=sys.stderr)
        return 1

    wrksrc = Path(sys.argv[1]).resolve()
    deploy = Path(sys.argv[2]).resolve()
    ws_pkgs = index_workspace_packages(wrksrc)

    added: list[str] = []
    while True:
        missing = sorted(dep for dep in find_missing_peers(deploy) if dep in ws_pkgs)
        if not missing:
            break
        for dep in missing:
            copy_package(ws_pkgs[dep], deploy / "node_modules" / dep)
            added.append(dep)

    print(f"Materialized {len(added)} workspace peer package(s)")
    remaining = sorted(find_missing_peers(deploy))
    if remaining:
        print(f"WARNING: unresolved dependencies: {remaining}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
