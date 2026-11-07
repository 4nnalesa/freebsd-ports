# @deepseek-ai/node-addon-system-freebsd-x64

Native FreeBSD amd64 payload for `@deepseek-ai/node-addon-system`.

It provides `bin/system.node`, the Node-API `flock` binding used by the
persistent session store. The module is compiled locally from
`packages/entry/src/flock.c` by `native/system/scripts/build.ts`; this
directory only declares the platform package and its manifest.
