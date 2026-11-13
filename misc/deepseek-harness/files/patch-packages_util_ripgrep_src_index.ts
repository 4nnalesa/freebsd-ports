--- packages/util/ripgrep/src/index.ts.orig
+++ packages/util/ripgrep/src/index.ts
@@ -8,8 +8,9 @@
 /**
  * Resolve the packaged executable lazily, once per process. Single-file runtimes use an existing
  * `-rg` sidecar; Electron uses the unpacked ASAR path. Resolution failures reject
- * this call, not package loading. No system executable or remote fallback is used.
- * @returns the packaged executable's absolute path.
+ * this call, not package loading. FreeBSD has no published binary package, so
+ * it falls back to the system `rg` from textproc/ripgrep.
+ * @returns the packaged executable's path, or `rg` on FreeBSD.
  */
 export function resolveRgPath(): Promise<string> {
   rgPathPromise ??= Promise.resolve().then(async () => {
@@ -18,10 +19,17 @@
       ? join(executable.dir, `${executable.name}-rg.exe`)
       : `${process.execPath}-rg`
     if ('pkg' in process && existsSync(executableSidecar)) return executableSidecar
-    const dependency = (await import('@vscode/ripgrep')).rgPath
-    return process.versions.electron === undefined
-      ? dependency
-      : dependency.replace(/\.asar(?=[\\/])/u, '.asar.unpacked')
+    try {
+      const dependency = (await import('@vscode/ripgrep')).rgPath
+      const packaged = process.versions.electron === undefined
+        ? dependency
+        : dependency.replace(/\.asar(?=[\\/])/u, '.asar.unpacked')
+      if (existsSync(packaged)) return packaged
+    } catch (_platformPackageAbsent) {
+      // No FreeBSD binary is published by @vscode/ripgrep, so continue to
+      // the system rg provided by textproc/ripgrep.
+    }
+    return 'rg'
   })
   return rgPathPromise
 }
