--- packages/boot/app-boot/src/profile-resolution/resolver.ts.orig
+++ packages/boot/app-boot/src/profile-resolution/resolver.ts
@@ -732,18 +732,31 @@
 
 function internalModules(): InternalModules {
   const require = createRequire(import.meta.url)
-  const addon = require('node-addon-require-builtin') as { requireBuiltin(moduleId: string): unknown }
-  const esmModule = addon.requireBuiltin('internal/modules/esm/loader') as {
+  // FreeBSD publishes no node-addon-require-builtin binding, so the addon
+  // cannot reach Node's internal ESM/CJS loader modules. With the launcher's
+  // --expose-internals flag, require() is the usable route; without it the
+  // addon path remains the fallback for other hosts.
+  const requireInternal = (moduleId: string): unknown => {
+    if (process.execArgv.includes('--expose-internals')) {
+      try {
+        return require(moduleId)
+      } catch (_notExposed) {
+        // A few internals remain private even when exposed.
+      }
+    }
+    return (require('node-addon-require-builtin') as { requireBuiltin(id: string): unknown }).requireBuiltin(moduleId)
+  }
+  const esmModule = requireInternal('internal/modules/esm/loader') as {
     getOrInitializeCascadedLoader(): ModuleLoaderV1 | ModuleLoaderV2
   }
-  const cjsModule = addon.requireBuiltin('internal/modules/cjs/loader') as { Module: CommonJsModule }
-  const cjsHelpers = addon.requireBuiltin('internal/modules/helpers') as {
+  const cjsModule = requireInternal('internal/modules/cjs/loader') as { Module: CommonJsModule }
+  const cjsHelpers = requireInternal('internal/modules/helpers') as {
     getCjsConditions(): ReadonlySet<string>
   }
-  const esmUtils = addon.requireBuiltin('internal/modules/esm/utils') as {
+  const esmUtils = requireInternal('internal/modules/esm/utils') as {
     getDefaultConditions(): readonly string[]
   }
-  const esmResolve = addon.requireBuiltin('internal/modules/esm/resolve') as {
+  const esmResolve = requireInternal('internal/modules/esm/resolve') as {
     defaultResolve(
       specifier: string,
       context: { parentURL?: string; conditions?: readonly string[] },
