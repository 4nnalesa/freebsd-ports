#!/bin/sh
#
# Install only the files that were added to the build sysroot on top of
# the files copied from devel/mingw-w64.  The wrappers in bin/ go to
# ${PREFIX}/llvm-mingw, everything else to the shared sysroot.

set -eu

root="$1"
before="$2"
after="$3"
dest="$4"

cd "${root}"

comm -13 "${before}" "${after}" | while IFS= read -r f; do
	case "${f}" in
	./bin/*)
		out="${dest}/llvm-mingw/${f#./}"
		;;
	*)
		out="${dest}/share/mingw-w64/${f#./}"
		;;
	esac
	mkdir -p "$(dirname "${out}")"
	cp -a "${f}" "${out}"
done
