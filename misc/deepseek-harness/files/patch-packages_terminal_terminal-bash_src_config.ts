--- packages/terminal/terminal-bash/src/config.ts.orig
+++ packages/terminal/terminal-bash/src/config.ts
@@ -59,8 +59,8 @@
   shellArgs: string[]
 }
 
-/** Bash dialect default executable. */
-export const DEFAULT_BASH_SHELL = '/bin/bash'
+/** Bash default on FreeBSD; shells/bash installs it below /usr/local. */
+export const DEFAULT_BASH_SHELL = process.platform === 'freebsd' ? '/usr/local/bin/bash' : '/bin/bash'
 /** Bash dialect default arguments (interactive, profile-free). */
 export const DEFAULT_BASH_ARGS = ['--noprofile', '--norc', '-i']
 /** Pwsh dialect default arguments (interactive host, profile-free). */
