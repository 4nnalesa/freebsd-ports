--- packages/terminal/terminal-bash/src/config.ts.orig	2026-11-18 09:45:47 UTC
+++ packages/terminal/terminal-bash/src/config.ts
@@ -60,7 +60,7 @@ export type ResolvedConfig = Omit<Required<Config>, 's
 }
 
 /** Bash dialect default executable. */
-export const DEFAULT_BASH_SHELL = '/bin/bash'
+export const DEFAULT_BASH_SHELL = process.platform === 'freebsd' ? '%%LOCALBASE%%/bin/bash' : '/bin/bash'
 /** Bash dialect default arguments (interactive, profile-free). */
 export const DEFAULT_BASH_ARGS = ['--noprofile', '--norc', '-i']
 /** Pwsh dialect default arguments (interactive host, profile-free). */
