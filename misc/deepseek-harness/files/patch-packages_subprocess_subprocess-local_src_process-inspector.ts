--- packages/subprocess/subprocess-local/src/process-inspector.ts.orig	2026-11-18 09:45:47 UTC
+++ packages/subprocess/subprocess-local/src/process-inspector.ts
@@ -498,7 +498,7 @@ function macProcessTable(internals: ProcessInspectorIn
 // macOS row can answer presence and parentage but never session membership.
 function macProcessTable(internals: ProcessInspectorInternals): { rows: ProcessRow[]; complete: boolean } {
   let complete = true
-  const rows = internals.exec('/bin/ps', ['-axo', 'pid=,ppid=,lstart=']).split('\n').flatMap((line) => {
+  const rows = internals.exec('/bin/ps', ['-ax', '-o', 'pid=', '-o', 'ppid=', '-o', 'lstart=']).split('\n').flatMap((line) => {
     const match = /^\s*(\d+)\s+(\d+)\s+(.+?)\s*$/.exec(line)
     if (match?.[1] === undefined || match[2] === undefined || match[3] === undefined) {
       if (line.trim().length > 0) complete = false
@@ -554,7 +554,7 @@ export function createProcessInspector(
   internals: ProcessInspectorInternals = DEFAULT_INTERNALS,
 ): ProcessInspector {
   if (platform === 'linux') return new LinuxProcessInspector(arch, internals)
-  if (platform === 'darwin') return new MacProcessInspector(internals)
+  if (platform === 'darwin' || platform === 'freebsd') return new MacProcessInspector(internals)
   if (platform === 'win32') return createWindowsProcessInspector()
   throw new Error(`subprocess-local: terminal inspection is unsupported on platform ${platform}`)
 }
