--- native/system/scripts/build.ts.orig	2026-11-18 09:45:47 UTC
+++ native/system/scripts/build.ts
@@ -24,6 +24,29 @@ interface Binary {
   libc?: string
 }
 
+if (process.platform === 'freebsd') {
+  const headers = resolve(dirname(process.execPath), '../include/node')
+  if (!existsSync(join(headers, 'node_api.h'))) {
+    throw new Error(`build: Node-API headers missing at ${headers}; use a Node installation with development headers`)
+  }
+  const output = join(root, 'packages', 'entry', 'bin', 'system.node')
+  mkdirSync(dirname(output), { recursive: true })
+  const compiler = process.env.CC || 'cc'
+  const flags = ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', '-fPIC', '-fvisibility=hidden', '-DNAPI_VERSION=8', '-I', headers, '-shared']
+  mkdirSync(join(root, '.release'), { recursive: true })
+  const temporary = mkdtempSync(join(root, '.release', 'native-build-'))
+  try {
+    const pending = join(temporary, basename(output))
+    const result = spawnSync(compiler, [...flags, '-o', pending, join(root, sources.flock)], { stdio: 'inherit' })
+    if (result.error) throw result.error
+    if (result.status !== 0) throw new Error(`build: ${compiler} failed for bin/system.node`)
+    renameSync(pending, output)
+  } finally {
+    rmSync(temporary, { recursive: true, force: true })
+  }
+  console.log('build: built entry/bin/system.node')
+  process.exit(0)
+}
 if (process.platform !== 'linux' && process.platform !== 'darwin') {
   if (hostAddonOnly) process.exit(0)
   throw new Error('build: system binaries are built on Linux or macOS; no native target for this host')
