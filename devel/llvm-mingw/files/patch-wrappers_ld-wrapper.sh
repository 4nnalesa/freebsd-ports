--- wrappers/ld-wrapper.sh.orig	2026-11-04 09:42:50 UTC
+++ wrappers/ld-wrapper.sh	2026-11-08 13:20:00 UTC
@@ -48,4 +48,14 @@
     FLAGS="$FLAGS -lwindowsapp -lucrtapp"
     ;;
 esac
+case "$1" in
+--help)
+    # libtool probes the linker help output for "auto-import" before it
+    # uses GNU-style DLL link commands.  lld accepts these flags, so
+    # advertise support to keep libtool from using MSVC-style commands.
+    ld.lld $FLAGS --help
+    echo "  --enable-auto-import       Import symbols from DLLs"
+    exit 0
+    ;;
+esac
 ld.lld $FLAGS "$@"
