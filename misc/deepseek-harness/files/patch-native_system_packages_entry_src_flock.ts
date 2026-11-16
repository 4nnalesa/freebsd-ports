--- native/system/packages/entry/src/flock.ts.orig	2026-11-13 05:26:07 UTC
+++ native/system/packages/entry/src/flock.ts
@@ -12,7 +12,7 @@ function loadBinding(): FlockBinding {
 function loadBinding(): FlockBinding {
   if (binding) return binding
   const { platform, arch } = process
-  if (platform !== 'linux' && platform !== 'darwin') {
+  if (platform !== 'linux' && platform !== 'darwin' && platform !== 'freebsd') {
     throw Object.assign(new Error(`flock is not supported on ${platform}-${arch}`), {
       code: 'ERR_FLOCK_UNSUPPORTED_PLATFORM',
       syscall: 'flock',
