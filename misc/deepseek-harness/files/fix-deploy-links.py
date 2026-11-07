#!/usr/bin/env python3
"""Finish a pnpm deploy tree for installation as a relocatable package.

There are three cleanup jobs:

1. The two ``link:`` overrides for ``vendor/schemastery`` and
   ``vendor/cosmokit`` point into the build checkout. Copy them below the
   deploy root and repoint those links.
2. Hoisted ``.pnpm/node_modules`` links for workspace packages outside the
   production closure point back into the checkout. Remove them.
3. Workspace packages are stored under virtual-store names such as
   ``pkg@file++++<absolute WRKSRC>``. Those names change with the build
   directory and would make a static pkg-plist unportable. Rename each one
   to ``pkg@file+workspace`` (with a deterministic suffix on collision) and
   rewrite every symlink that names it.

The script is idempotent: a second run finds no external links and no
``@file++++`` directory names.
"""

import hashlib
import json
import os
import shutil
import sys

VENDOR_PACKAGES = ('schemastery', 'cosmokit')
FILE_KEY_MARKER = '@file++++'
NORMALIZED_SUFFIX = '@file+workspace'


def copy_vendor_packages(source: str, deploy: str) -> None:
    vendor_source = os.path.join(source, 'vendor')
    vendor_target = os.path.join(deploy, 'node_modules', '_vendor')
    for name in VENDOR_PACKAGES:
        destination = os.path.join(vendor_target, name)
        if not os.path.isdir(destination):
            shutil.copytree(os.path.join(vendor_source, name), destination,
                            symlinks=False)


def rewrite_external_links(source: str, deploy: str) -> tuple[int, int]:
    vendor_source = os.path.join(source, 'vendor')
    vendor_target = os.path.join(deploy, 'node_modules', '_vendor')
    rewritten = 0
    removed = 0
    for root, directories, files in os.walk(deploy, followlinks=False):
        for name in directories + files:
            path = os.path.join(root, name)
            if not os.path.islink(path):
                continue
            target = os.path.realpath(path)
            if target == deploy or target.startswith(deploy + os.sep):
                continue
            replacement = None
            for vendor in VENDOR_PACKAGES:
                base = os.path.join(vendor_source, vendor)
                if target == base or target.startswith(base + os.sep):
                    inside = os.path.relpath(target, base)
                    replacement = os.path.join(vendor_target, vendor, inside)
                    break
            os.unlink(path)
            if replacement is None:
                removed += 1
            else:
                os.symlink(os.path.relpath(replacement, os.path.dirname(path)),
                           path)
                rewritten += 1
    return rewritten, removed


def package_version(entry: str) -> str:
    """Return the installed package version, if its manifest is readable."""
    for root, _directories, files in os.walk(entry):
        if 'package.json' not in files:
            continue
        try:
            with open(os.path.join(root, 'package.json'), encoding='utf-8') as f:
                value = json.load(f)
        except (OSError, ValueError):
            continue
        version = value.get('version')
        if isinstance(version, str):
            return version
    return ''


def normalize_file_keys(deploy: str) -> int:
    """Rename build-path virtual-store keys and repair their symlinks."""
    pnpm = os.path.join(deploy, 'node_modules', '.pnpm')
    if not os.path.isdir(pnpm):
        return 0

    entries = sorted(
        (entry for entry in os.scandir(pnpm)
         if entry.is_dir(follow_symlinks=False)
         and FILE_KEY_MARKER in entry.name),
        key=lambda entry: entry.name,
    )

    mapping: dict[str, str] = {}
    used: set[str] = set()
    for entry in entries:
        prefix = entry.name.split(FILE_KEY_MARKER, 1)[0]
        candidate = prefix + NORMALIZED_SUFFIX
        if candidate in used or os.path.lexists(os.path.join(pnpm, candidate)):
            digest = hashlib.sha256(
                f'{prefix}@{package_version(entry.path)}'.encode()
            ).hexdigest()[:8]
            candidate = f'{candidate}-{digest}'
        serial = 2
        base = candidate
        while candidate in used or os.path.lexists(os.path.join(pnpm, candidate)):
            candidate = f'{base}-{serial}'
            serial += 1
        os.rename(entry.path, os.path.join(pnpm, candidate))
        mapping[entry.name] = candidate
        used.add(candidate)

    if not mapping:
        return 0

    # Symlink targets are relative strings; replacing the directory component
    # keeps them valid without having to resolve each target.
    for root, directories, files in os.walk(deploy, followlinks=False):
        for name in directories + files:
            path = os.path.join(root, name)
            if not os.path.islink(path):
                continue
            old_target = os.readlink(path)
            new_target = old_target
            for old_name, new_name in mapping.items():
                new_target = new_target.replace(old_name, new_name)
            if new_target != old_target:
                os.unlink(path)
                os.symlink(new_target, path)
    return len(mapping)


def check_links(deploy: str) -> list[str]:
    """Return links that escape the deploy root or no longer resolve."""
    bad: list[str] = []
    for root, directories, files in os.walk(deploy, followlinks=False):
        for name in directories + files:
            path = os.path.join(root, name)
            if not os.path.islink(path):
                continue
            target = os.path.realpath(path)
            if target != deploy and not target.startswith(deploy + os.sep):
                bad.append(f'{path} -> {target} (outside deploy)')
            elif not os.path.exists(path):
                bad.append(f'{path} -> {os.readlink(path)} (broken)')
    return bad


def main() -> int:
    deploy = os.path.abspath(sys.argv[1])
    source = os.path.abspath(sys.argv[2])

    copy_vendor_packages(source, deploy)
    rewritten, removed = rewrite_external_links(source, deploy)
    renamed = normalize_file_keys(deploy)
    bad = check_links(deploy)

    print(f'fix-deploy-links: vendor links {rewritten}, removed {removed}, '
          f'normalized {renamed}')
    if bad:
        for line in bad[:20]:
            print(f'  bad link: {line}')
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
