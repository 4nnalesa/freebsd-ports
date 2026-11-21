--- packages/boot/app-boot/src/profile-resolution/resolver.ts.orig	2026-11-18 09:45:47 UTC
+++ packages/boot/app-boot/src/profile-resolution/resolver.ts
@@ -732,18 +732,26 @@ function internalModules(): InternalModules {
 
 function internalModules(): InternalModules {
   const require = createRequire(import.meta.url)
-  const addon = require('node-addon-require-builtin') as { requireBuiltin(moduleId: string): unknown }
-  const esmModule = addon.requireBuiltin('internal/modules/esm/loader') as {
+  const requireBuiltin = (moduleId: string): unknown => {
+    if (process.execArgv.includes('--expose-internals')) {
+      try {
+        return require(moduleId)
+      } catch {}
+    }
+    const addon = require('node-addon-require-builtin') as { requireBuiltin(id: string): unknown }
+    return addon.requireBuiltin(moduleId)
+  }
+  const esmModule = requireBuiltin('internal/modules/esm/loader') as {
     getOrInitializeCascadedLoader(): ModuleLoaderV1 | ModuleLoaderV2
   }
-  const cjsModule = addon.requireBuiltin('internal/modules/cjs/loader') as { Module: CommonJsModule }
-  const cjsHelpers = addon.requireBuiltin('internal/modules/helpers') as {
+  const cjsModule = requireBuiltin('internal/modules/cjs/loader') as { Module: CommonJsModule }
+  const cjsHelpers = requireBuiltin('internal/modules/helpers') as {
     getCjsConditions(): ReadonlySet<string>
   }
-  const esmUtils = addon.requireBuiltin('internal/modules/esm/utils') as {
+  const esmUtils = requireBuiltin('internal/modules/esm/utils') as {
     getDefaultConditions(): readonly string[]
   }
-  const esmResolve = addon.requireBuiltin('internal/modules/esm/resolve') as {
+  const esmResolve = requireBuiltin('internal/modules/esm/resolve') as {
     defaultResolve(
       specifier: string,
       context: { parentURL?: string; conditions?: readonly string[] },
