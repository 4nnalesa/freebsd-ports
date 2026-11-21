--- packages/util/ripgrep/src/index.ts.orig	2026-11-18 09:45:47 UTC
+++ packages/util/ripgrep/src/index.ts
@@ -13,6 +13,7 @@ export function resolveRgPath(): Promise<string> {
  */
 export function resolveRgPath(): Promise<string> {
   rgPathPromise ??= Promise.resolve().then(async () => {
+    if (process.platform === 'freebsd') return '%%LOCALBASE%%/bin/rg'
     const executable = parse(process.execPath)
     const executableSidecar = process.platform === 'win32'
       ? join(executable.dir, `${executable.name}-rg.exe`)
