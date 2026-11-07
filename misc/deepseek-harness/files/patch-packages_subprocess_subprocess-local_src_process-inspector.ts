--- packages/subprocess/subprocess-local/src/process-inspector.ts.orig
+++ packages/subprocess/subprocess-local/src/process-inspector.ts
@@ -380,7 +380,8 @@
 // Zombie and dead states answer "present in the table" but never "still
 // running"; a table without a state column can only report presence.
 function quiescent(state: string | undefined): boolean {
-  return state !== undefined && /^[ZXx]$/.test(state)
+  // Linux emits one state letter; FreeBSD appends flag letters.
+  return state !== undefined && /^[ZXx]/.test(state)
 }
 
 class PosixProcessSnapshot implements ProcessSnapshot {
@@ -501,6 +502,31 @@
       started: match[3],
       session: undefined,
       state: undefined,
+    }]
+  })
+  return { rows, complete }
+}
+
+// FreeBSD calls the session-id keyword `sid` and rejects `sess`. Its `-o`
+// parser mishandles a comma-joined list containing `=` keywords, so pass
+// each keyword through a separate -o argument.
+function freebsdProcessTable(internals: ProcessInspectorInternals): { rows: ProcessRow[]; complete: boolean } {
+  let complete = true
+  const rows = internals.exec('/bin/ps', [
+    '-axo', 'pid=', '-o', 'ppid=', '-o', 'sid=', '-o', 'stat=', '-o', 'lstart=',
+  ]).split('\n').flatMap((line) => {
+    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+?)\s*$/.exec(line)
+    if (match?.[1] === undefined || match[2] === undefined || match[3] === undefined
+      || match[4] === undefined || match[5] === undefined) {
+      if (line.trim().length > 0) complete = false
+      return []
+    }
+    return [{
+      pid: Number(match[1]),
+      parentPid: Number(match[2]),
+      started: match[5],
+      session: Number(match[3]),
+      state: match[4],
     }]
   })
   return { rows, complete }
@@ -532,6 +558,34 @@
 
 }
 
+class FreebsdProcessInspector extends PosixProcessInspector {
+  foregroundPgid(shellPid: number): number | undefined {
+    try {
+      const value = Number(this.internals.exec('/bin/ps', ['-o', 'tpgid=', '-p', String(shellPid)]).trim())
+      return Number.isSafeInteger(value) && value > 0 ? value : undefined
+    } catch (_missingProcess) {
+      return undefined
+    }
+  }
+
+  // FreeBSD does not expose the Linux /proc syscall view, so an exact PTY
+  // read-wait probe is unavailable; readiness uses prompt and silence cues.
+  isStdinWaiting(_pgid: number, _shellPid: number): boolean {
+    return false
+  }
+
+  isAlive(identity: ProcessIdentity): boolean {
+    return freebsdProcessTable(this.internals).rows
+      .some(entry => entry.pid === identity.pid && entry.started === identity.started)
+  }
+
+  snapshot(): ProcessSnapshot {
+    const table = freebsdProcessTable(this.internals)
+    return new PosixProcessSnapshot(table.rows, table.complete)
+  }
+
+}
+
 /**
  * Create the supported platform inspector or fail at plugin load.
  * @param platform - target Node platform.
@@ -546,6 +600,7 @@
 ): ProcessInspector {
   if (platform === 'linux') return new LinuxProcessInspector(arch, internals)
   if (platform === 'darwin') return new MacProcessInspector(internals)
+  if (platform === 'freebsd') return new FreebsdProcessInspector(internals)
   if (platform === 'win32') return createWindowsProcessInspector()
   throw new Error(`subprocess-local: terminal inspection is unsupported on platform ${platform}`)
 }
