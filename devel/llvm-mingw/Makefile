PORTNAME=	llvm-mingw
DISTVERSION=	20261104
CATEGORIES=	devel lang
MASTER_SITES=	#

MAINTAINER=	root@example.com
COMMENT=	LLVM/Clang based cross compiler toolchain for Windows
WWW=		https://github.com/mstorsjo/llvm-mingw

LICENSE=	LLVM2 MIT
LICENSE_COMB=	multi
LICENSE_NAME_LLVM2=	Apache License 2.0 with LLVM Exceptions
LICENSE_FILE_LLVM2=	${WRKSRC}/llvm-project/llvm/LICENSE.TXT
LICENSE_FILE_MIT=	${WRKSRC}/LICENSE.txt
LICENSE_PERMS_LLVM2=	dist-mirror dist-sell pkg-mirror pkg-sell auto-accept

USES=		cmake:indirect gmake llvm:23,build,run ninja:build

# LLVM release and mingw-w64 revision pinned by upstream build-llvm.sh and
# build-mingw-w64.sh respectively.
LLVM_TAG=	llvmorg-23.1.5
MINGW_W64_REV=	ee9bd87644156c41072a11ad957d1e11831a72df

USE_GITHUB=	yes
GH_ACCOUNT=	mstorsjo llvm:llvm mingw-w64:mingw
GH_PROJECT=	${PORTNAME} llvm-project:llvm mingw-w64:mingw
GH_TAGNAME=	${DISTVERSION} ${LLVM_TAG}:llvm ${MINGW_W64_REV}:mingw
GH_SUBDIR=	llvm-project:llvm mingw-w64:mingw

# Windows targets to build the sysroots and runtimes for.
MINGW_TARGETS=	i686 x86_64 aarch64 armv7
MINGW_ROOT=	${WRKDIR}/llvm-mingw
MINGW_DEST=	${PREFIX}/llvm-mingw

MINGW_ENV=	${SETENV} -i \
		PATH=${LLVM_PREFIX}/bin:${LOCALBASE}/bin:/usr/bin:/bin:/usr/sbin:/sbin \
		HOME=${WRKDIR} TMPDIR=/tmp LANG=C LC_ALL=C \
		CC=${CC} CXX=${CXX} \
		TOOLCHAIN_ARCHS="${MINGW_TARGETS}" CORES=${MAKE_JOBS_NUMBER}

do-build:
	@${ECHO_MSG} "===> Installing llvm-mingw wrappers"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./install-wrappers.sh --host-clang=${LLVM_PREFIX}/bin/clang \
		${MINGW_ROOT}
	@${ECHO_MSG} "===> Building MinGW-w64 tools (gendef, widl)"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-mingw-w64-tools.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building MinGW-w64 headers and CRT"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-mingw-w64.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building compiler-rt builtins"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-compiler-rt.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building libc++, libc++abi and libunwind"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-libcxx.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building winpthreads and winstorecompat"
	@cd ${WRKSRC} && ${MINGW_ENV} lt_cv_prog_gnu_ld=yes \
		./build-mingw-w64-libraries.sh ${MINGW_ROOT}
	@${ECHO_MSG} "===> Building compiler-rt sanitizers"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-compiler-rt.sh ${MINGW_ROOT} --build-sanitizers
	@${ECHO_MSG} "===> Building libomp"
	@cd ${WRKSRC} && ${MINGW_ENV} \
		./build-openmp.sh ${MINGW_ROOT}

do-install:
	@${LN} -sf ${LLVM_PREFIX}/bin/clang-scan-deps ${MINGW_ROOT}/bin/clang-scan-deps
	@${FIND} ${MINGW_ROOT} -name '*.la' -delete
	@${MKDIR} ${STAGEDIR}${MINGW_DEST}
	@cd ${MINGW_ROOT} && ${CP} -a . ${STAGEDIR}${MINGW_DEST}/

.include <bsd.port.mk>
