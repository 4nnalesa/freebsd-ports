--- native/system/packages/entry/src/flock.ts.orig	2026-11-18 09:45:47 UTC
+++ native/system/packages/entry/src/flock.ts
@@ -1,6 +1,7 @@ import { dirname, join } from 'node:path'
 /** Lazy POSIX flock entry; importing it does not load a native addon. */
 import { createRequire } from 'node:module'
 import { dirname, join } from 'node:path'
+import { fileURLToPath } from 'node:url'
 import { getSystemErrorName } from 'node:util'
 
 interface FlockBinding {
@@ -12,6 +13,11 @@ function loadBinding(): FlockBinding {
 function loadBinding(): FlockBinding {
   if (binding) return binding
   const { platform, arch } = process
+  if (platform === 'freebsd') {
+    const require = createRequire(import.meta.url)
+    binding = require(fileURLToPath(new URL('../bin/system.node', import.meta.url))) as FlockBinding
+    return binding
+  }
   if (platform !== 'linux' && platform !== 'darwin') {
     throw Object.assign(new Error(`flock is not supported on ${platform}-${arch}`), {
       code: 'ERR_FLOCK_UNSUPPORTED_PLATFORM',
