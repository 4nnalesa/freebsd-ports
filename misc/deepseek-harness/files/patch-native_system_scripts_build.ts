--- native/system/scripts/build.ts.orig
+++ native/system/scripts/build.ts
@@ -24,9 +24,9 @@
   libc?: string
 }
 
-if (process.platform !== 'linux' && process.platform !== 'darwin') {
+if (process.platform !== 'linux' && process.platform !== 'darwin' && process.platform !== 'freebsd') {
   if (hostAddonOnly) process.exit(0)
-  throw new Error('build: system binaries are built on Linux or macOS; no native target for this host')
+  throw new Error('build: system binaries are built on Linux, macOS, or FreeBSD; no native target for this host')
 }
 const host = `${process.platform}-${process.arch}`
 const libc = process.platform === 'linux'
@@ -64,9 +64,12 @@
         if (binary.libc !== undefined) throw new Error('build: macOS flock does not select a Linux libc')
         flags.push('-bundle', '-undefined', 'dynamic_lookup', '-mmacosx-version-min=11.0')
       } else {
-        if (binary.libc !== 'glibc' && binary.libc !== 'musl') {
+        if (process.platform === 'linux' && binary.libc !== 'glibc' && binary.libc !== 'musl') {
           throw new Error('build: Linux flock must select glibc or musl')
         }
+        if (process.platform === 'freebsd' && binary.libc !== undefined) {
+          throw new Error('build: FreeBSD flock does not select a Linux libc')
+        }
         flags.push('-shared')
       }
     } else {
