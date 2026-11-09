PORTNAME=	mingw-w64-winpthreads
DISTVERSION=	14.0.0
CATEGORIES=	devel

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	MinGW-w64 winpthreads and winstorecompat runtime libraries
WWW=		https://www.mingw-w64.org/

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/mingw-w64-libraries/winpthreads/COPYING

BUILD_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64 \
		${LOCALBASE}/share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-x86_64.a:devel/mingw-w64-compiler-rt23
RUN_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64 \
		${LOCALBASE}/share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-x86_64.a:devel/mingw-w64-compiler-rt23

USES=		gmake llvm:23

USE_GITHUB=	yes
GH_ACCOUNT=	mingw-w64
GH_PROJECT=	mingw-w64
GH_TAGNAME=	v${DISTVERSION}

MINGW_TARGETS=	i686 x86_64 aarch64 armv7
MINGW_SYSROOT=	${PREFIX}/share/mingw-w64
LLVM_BIN=	${LLVM_PREFIX}/bin

do-build:
	@for arch in ${MINGW_TARGETS}; do \
		case $$arch in \
		i686)		machine=i386pe ;; \
		x86_64)		machine=i386pep ;; \
		aarch64)	machine=arm64pe ;; \
		armv7)		machine=thumb2pe ;; \
		esac; \
		${SED} -e "s|@MACHINE@|$$machine|" \
			-e "s|@LLVM_BIN@|${LLVM_BIN}|" \
			${FILESDIR}/ld-wrapper.sh.in > ${WRKDIR}/ld-$$arch; \
		${CHMOD} 755 ${WRKDIR}/ld-$$arch; \
		for lib in winpthreads winstorecompat; do \
			cd ${WRKSRC}/mingw-w64-libraries/$$lib && \
				${MKDIR} build-$$arch && cd build-$$arch && \
			CC="${LLVM_BIN}/clang --target=$$arch-w64-mingw32 --sysroot=${MINGW_SYSROOT} -resource-dir=${MINGW_SYSROOT}/lib/clang/23 -rtlib=compiler-rt -fuse-ld=lld" \
			CXX="${LLVM_BIN}/clang++ --target=$$arch-w64-mingw32 --sysroot=${MINGW_SYSROOT} -resource-dir=${MINGW_SYSROOT}/lib/clang/23 -rtlib=compiler-rt -fuse-ld=lld" \
			AR="${LLVM_BIN}/llvm-ar" RANLIB="${LLVM_BIN}/llvm-ranlib" \
			RC="${LLVM_BIN}/llvm-windres --target=$$arch-w64-mingw32 --include-dir=${MINGW_SYSROOT}/$$arch-w64-mingw32/include" \
			LD="${WRKDIR}/ld-$$arch" lt_cv_prog_gnu_ld=yes \
			CFLAGS="-g -O2 -mguard=cf" CXXFLAGS="-g -O2 -mguard=cf" \
				../configure --host=$$arch-w64-mingw32 \
					--prefix=${MINGW_SYSROOT}/$$arch-w64-mingw32 \
					--libdir=${MINGW_SYSROOT}/$$arch-w64-mingw32/lib \
					--includedir=${MINGW_SYSROOT}/generic-w64-mingw32/include \
					--enable-silent-rules || exit 1; \
			${MAKE_CMD} -j${MAKE_JOBS_NUMBER} || exit 1; \
			${MAKE_CMD} install DESTDIR=${WRKDIR}/root || exit 1; \
		done; \
	done

do-install:
	@${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}/generic-w64-mingw32/include
	@${CP} -a ${WRKDIR}/root${PREFIX}/share/mingw-w64/generic-w64-mingw32/include/. \
		${STAGEDIR}${MINGW_SYSROOT}/generic-w64-mingw32/include/
	@for arch in ${MINGW_TARGETS}; do \
		${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32; \
		${CP} -a ${WRKDIR}/root${PREFIX}/share/mingw-w64/$$arch-w64-mingw32/lib \
			${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/; \
		${CP} -a ${WRKDIR}/root${PREFIX}/share/mingw-w64/$$arch-w64-mingw32/bin \
			${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/; \
		${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32; \
		for lib in winpthreads winstorecompat; do \
			${INSTALL_DATA} ${WRKSRC}/mingw-w64-libraries/$$lib/COPYING \
				${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32/COPYING.$$lib.txt; \
		done; \
	done
	@${FIND} ${STAGEDIR} -name '*.la' -delete

.include <bsd.port.mk>
