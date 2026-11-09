PORTNAME=	mingw-w64
DISTVERSION=	14.0.0
CATEGORIES=	devel

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	MinGW-w64 headers and CRT for Windows cross compilation
WWW=		https://www.mingw-w64.org/

LICENSE=	ZPL21 BSD2CLAUSE LGPL21 MIT
LICENSE_COMB=	multi
LICENSE_FILE_ZPL21=	${WRKSRC}/COPYING
LICENSE_FILE_BSD2CLAUSE=	${WRKSRC}/COPYING.MinGW-w64-runtime/COPYING.MinGW-w64-runtime.txt
LICENSE_FILE_LGPL21=	${WRKSRC}/COPYING.MinGW-w64-runtime/COPYING.MinGW-w64-runtime.txt
LICENSE_FILE_MIT=	${WRKSRC}/mingw-w64-tools/gendef/COPYING

USES=		gmake llvm:23

USE_GITHUB=	yes
GH_ACCOUNT=	mingw-w64
GH_TAGNAME=	v14.0.0

MINGW_TARGETS=	i686 x86_64 aarch64 armv7
MINGW_ROOT=	${WRKDIR}/root
MINGW_SYSROOT=	${PREFIX}/share/mingw-w64
LLVM_BIN=	${LLVM_PREFIX}/bin

do-build:
	@${MKDIR} ${MINGW_ROOT}
	@cd ${WRKSRC}/mingw-w64-tools/gendef && ${MKDIR} build && cd build && \
		../configure --prefix=${MINGW_ROOT} && \
		${MAKE_CMD} -j${MAKE_JOBS_NUMBER} && ${MAKE_CMD} install
	@cd ${WRKSRC}/mingw-w64-tools/widl && ${MKDIR} build && cd build && \
		../configure --prefix=${MINGW_ROOT} --target=i686-w64-mingw32 \
			--with-widl-includedir=${MINGW_SYSROOT}/generic-w64-mingw32/include && \
		${MAKE_CMD} -j${MAKE_JOBS_NUMBER} && ${MAKE_CMD} install
	@cd ${WRKSRC}/mingw-w64-headers && ${MKDIR} build && cd build && \
		PATH=${MINGW_ROOT}/bin:$$PATH ../configure \
			--prefix=${MINGW_ROOT}/generic-w64-mingw32 \
			--enable-idl --with-default-win32-winnt=0x601 \
			--with-default-msvcrt=ucrt INSTALL="install -C" && \
		${MAKE_CMD} install
	@for arch in ${MINGW_TARGETS}; do \
		${MKDIR} ${MINGW_ROOT}/$$arch-w64-mingw32; \
		${LN} -sfn ../generic-w64-mingw32/include \
			${MINGW_ROOT}/$$arch-w64-mingw32/include; \
	done
	@for arch in ${MINGW_TARGETS}; do \
		case $$arch in \
		i686)	flags="--enable-lib32 --disable-lib64"; machine="i386" ;; \
		x86_64)	flags="--disable-lib32 --enable-lib64"; machine="i386:x86-64" ;; \
		aarch64) flags="--disable-lib32 --disable-lib64 --enable-libarm64"; machine="arm64" ;; \
		armv7)	flags="--disable-lib32 --disable-lib64 --enable-libarm32"; machine="arm" ;; \
		esac; \
		cd ${WRKSRC}/mingw-w64-crt && ${MKDIR} build-$$arch && \
			cd build-$$arch && \
		CC="${LLVM_BIN}/clang --target=$$arch-w64-mingw32 --sysroot=${MINGW_ROOT}" \
		CXX="${LLVM_BIN}/clang++ --target=$$arch-w64-mingw32 --sysroot=${MINGW_ROOT}" \
		AR="${LLVM_BIN}/llvm-ar" RANLIB="${LLVM_BIN}/llvm-ranlib" \
		DLLTOOL="${LLVM_BIN}/llvm-dlltool -m $$machine" \
		WINDRES="${LLVM_BIN}/llvm-windres" \
			../configure --host=$$arch-w64-mingw32 \
				--prefix=${MINGW_ROOT}/$$arch-w64-mingw32 \
				$$flags --with-default-msvcrt=ucrt \
				--enable-silent-rules --enable-cfguard && \
		${MAKE_CMD} -j${MAKE_JOBS_NUMBER} && ${MAKE_CMD} install || exit 1; \
	done
	@for arch in ${MINGW_TARGETS}; do \
		cd ${MINGW_ROOT}/$$arch-w64-mingw32/lib && \
		${LLVM_BIN}/llvm-ar rcs libssp.a && \
		${LLVM_BIN}/llvm-ar rcs libssp_nonshared.a; \
	done

do-install:
	@${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}
	@${CP} -a ${MINGW_ROOT}/generic-w64-mingw32 ${STAGEDIR}${MINGW_SYSROOT}/
	@${RM} ${STAGEDIR}${MINGW_SYSROOT}/generic-w64-mingw32/include/pthread_signal.h \
		${STAGEDIR}${MINGW_SYSROOT}/generic-w64-mingw32/include/pthread_time.h \
		${STAGEDIR}${MINGW_SYSROOT}/generic-w64-mingw32/include/pthread_unistd.h
	@for arch in ${MINGW_TARGETS}; do \
		${CP} -a ${MINGW_ROOT}/$$arch-w64-mingw32 ${STAGEDIR}${MINGW_SYSROOT}/; \
	done
	@${MKDIR} ${STAGEDIR}${PREFIX}/bin
	${INSTALL_PROGRAM} ${MINGW_ROOT}/bin/gendef ${STAGEDIR}${PREFIX}/bin/
	@for f in ${MINGW_ROOT}/bin/*-widl; do \
		${INSTALL_PROGRAM} $$f ${STAGEDIR}${PREFIX}/bin/; \
	done
	@for arch in ${MINGW_TARGETS}; do \
		[ "$$arch" = i686 ] || \
			${LN} -sf i686-w64-mingw32-widl \
				${STAGEDIR}${PREFIX}/bin/$$arch-w64-mingw32-widl; \
	done
	@for arch in ${MINGW_TARGETS}; do \
		${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32; \
		${INSTALL_DATA} ${WRKSRC}/COPYING \
			${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32/; \
		${INSTALL_DATA} ${WRKSRC}/COPYING.MinGW-w64/COPYING.MinGW-w64.txt \
			${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32/; \
		${INSTALL_DATA} ${WRKSRC}/COPYING.MinGW-w64-runtime/COPYING.MinGW-w64-runtime.txt \
			${STAGEDIR}${MINGW_SYSROOT}/$$arch-w64-mingw32/share/mingw32/; \
	done
	@${MKDIR} ${STAGEDIR}${PREFIX}/share/gendef ${STAGEDIR}${PREFIX}/share/widl
	${INSTALL_DATA} ${WRKSRC}/mingw-w64-tools/gendef/COPYING \
		${STAGEDIR}${PREFIX}/share/gendef/COPYING.txt
	${INSTALL_DATA} ${WRKSRC}/COPYING \
		${STAGEDIR}${PREFIX}/share/widl/COPYING.txt

.include <bsd.port.mk>
