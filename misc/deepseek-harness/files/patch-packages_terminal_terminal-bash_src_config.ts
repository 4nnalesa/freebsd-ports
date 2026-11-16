--- packages/terminal/terminal-bash/src/config.ts.orig	2026-11-13 05:26:07 UTC
+++ packages/terminal/terminal-bash/src/config.ts
@@ -59,8 +59,8 @@ export type ResolvedConfig = Omit<Required<Config>, 's
   shellArgs: string[]
 }
 
-/** Bash dialect default executable. */
-export const DEFAULT_BASH_SHELL = '/bin/bash'
+/** Bash default on FreeBSD; shells/bash installs it below LOCALBASE. */
+export const DEFAULT_BASH_SHELL = process.platform === 'freebsd' ? '%%LOCALBASE%%/bin/bash' : '/bin/bash'
 /** Bash dialect default arguments (interactive, profile-free). */
 export const DEFAULT_BASH_ARGS = ['--noprofile', '--norc', '-i']
 /** Pwsh dialect default arguments (interactive host, profile-free). */
