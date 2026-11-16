--- packages/util/ripgrep/src/index.ts.orig	2026-11-13 05:26:07 UTC
+++ packages/util/ripgrep/src/index.ts
@@ -8,8 +8,9 @@ let rgPathPromise: Promise<string> | undefined
 /**
  * Resolve the packaged executable lazily, once per process. Single-file runtimes use an existing
  * `-rg` sidecar; Electron uses the unpacked ASAR path. Resolution failures reject
- * this call, not package loading. No system executable or remote fallback is used.
- * @returns the packaged executable's absolute path.
+ * this call, not package loading. FreeBSD uses the executable supplied by
+ * textproc/ripgrep because @vscode/ripgrep publishes no FreeBSD binary.
+ * @returns the packaged executable's path, or the system `rg`.
  */
 export function resolveRgPath(): Promise<string> {
   rgPathPromise ??= Promise.resolve().then(async () => {
@@ -18,10 +19,16 @@ export function resolveRgPath(): Promise<string> {
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
+      // No FreeBSD binary is published; use the port-provided executable.
+    }
+    return 'rg'
   })
   return rgPathPromise
 }
