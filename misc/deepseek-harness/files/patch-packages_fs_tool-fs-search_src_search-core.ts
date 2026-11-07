--- packages/fs/tool-fs-search/src/search-core.ts.orig
+++ packages/fs/tool-fs-search/src/search-core.ts
@@ -165,8 +165,8 @@
  * at the call boundary keeps a missing or corrupt binary at the first search
  * call as `SEARCH_FAILED`, rather than failing the Loader composition.
  *
- * @returns the packaged binary's absolute path; the memoized promise rejects
- *   when the platform package cannot be resolved.
+ * @returns the packaged binary path, or the system `rg` when the platform
+ *   package ships no executable for this host (FreeBSD).
  */
 export function resolveRgPath(): Promise<string> {
   rgPathPromise ??= Promise.resolve().then(async () => {
@@ -175,10 +175,17 @@
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
