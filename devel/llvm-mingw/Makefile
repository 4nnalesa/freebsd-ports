PORTNAME=	llvm-mingw
DISTVERSION=	20261104
CATEGORIES=	devel lang

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	LLVM/Clang/LLD based mingw-w64 toolchain
WWW=		https://github.com/mstorsjo/llvm-mingw

LICENSE=	ISCL LLVM2
LICENSE_COMB=	multi
LICENSE_NAME_LLVM2=	Apache License 2.0 with LLVM Exceptions
LICENSE_FILE_LLVM2=	${WRKSRC}/llvm-project/llvm/LICENSE.TXT
LICENSE_FILE_ISCL=	${WRKSRC}/LICENSE.txt
LICENSE_PERMS_LLVM2=	dist-mirror dist-sell pkg-mirror pkg-sell auto-accept

BUILD_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64 \
		${LOCALBASE}/share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-x86_64.a:devel/mingw-w64-compiler-rt23 \
		${LOCALBASE}/share/mingw-w64/x86_64-w64-mingw32/lib/libwinpthread.a:devel/mingw-w64-winpthreads
RUN_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64 \
		${LOCALBASE}/share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-x86_64.a:devel/mingw-w64-compiler-rt23 \
		${LOCALBASE}/share/mingw-w64/x86_64-w64-mingw32/lib/libwinpthread.a:devel/mingw-w64-winpthreads

USES=		cmake:indirect gmake llvm:23,build,run ninja:build

# LLVM release pinned by the upstream llvm-mingw build-llvm.sh script.
LLVM_TAG=	llvmorg-23.1.5

USE_GITHUB=	yes
GH_ACCOUNT=	mstorsjo llvm:llvm
GH_PROJECT=	${PORTNAME} llvm-project:llvm
GH_TAGNAME=	${DISTVERSION} ${LLVM_TAG}:llvm
GH_SUBDIR=	llvm-project:llvm

MINGW_TARGETS=	i686 x86_64 aarch64 armv7
MINGW_ROOT=	${WRKDIR}/root
MINGW_SYSROOT=	${PREFIX}/share/mingw-w64
MINGW_DEST=	${PREFIX}/llvm-mingw

SUB_FILES=	clang
SUB_LIST=	LLVM_PREFIX=${LLVM_PREFIX} PREFIX=${PREFIX}

MINGW_ENV=	${SETENV} -i \
		PATH=${LLVM_PREFIX}/bin:${LOCALBASE}/bin:/usr/bin:/bin:/usr/sbin:/sbin \
		HOME=${WRKDIR} TMPDIR=/tmp LANG=C LC_ALL=C \
		CC=${CC} CXX=${CXX} \
		TOOLCHAIN_ARCHS="${MINGW_TARGETS}" CORES=${MAKE_JOBS_NUMBER}

do-build:
	@${ECHO_MSG} "===> Installing MinGW-w64 sysroot"
	@${RM} -rf ${MINGW_ROOT}
	@${CP} -a ${LOCALBASE}/share/mingw-w64 ${MINGW_ROOT}
	@cd ${MINGW_ROOT} && ${FIND} . -type f -o -type l | ${SORT} \
		> ${WRKDIR}/.sysroot-files
	@${ECHO_MSG} "===> Installing llvm-mingw wrappers"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./install-wrappers.sh --host-clang=${LLVM_PREFIX}/bin/clang \
		${MINGW_ROOT}
	@${LN} -sf ${LLVM_PREFIX}/bin/clang-scan-deps ${MINGW_ROOT}/bin/clang-scan-deps
	@${ECHO_MSG} "===> Building compiler-rt builtins"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-compiler-rt.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building libc++, libc++abi and libunwind"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-libcxx.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building compiler-rt sanitizers"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-compiler-rt.sh ${MINGW_ROOT} --build-sanitizers
	@${ECHO_MSG} "===> Building libomp"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-openmp.sh ${MINGW_ROOT}
	@${FIND} ${MINGW_ROOT} -name '*.la' -delete

do-install:
	@${MKDIR} ${STAGEDIR}${MINGW_DEST}/bin ${STAGEDIR}${MINGW_SYSROOT}
	@cd ${MINGW_ROOT} && ${FIND} . -type f -o -type l | ${SORT} \
		> ${WRKDIR}/.built-files
	@${SH} ${FILESDIR}/install.sh ${MINGW_ROOT} \
		${WRKDIR}/.sysroot-files ${WRKDIR}/.built-files \
		${STAGEDIR}${PREFIX}
	${INSTALL_SCRIPT} ${WRKDIR}/clang ${STAGEDIR}${MINGW_DEST}/bin/clang

.include <bsd.port.mk>
