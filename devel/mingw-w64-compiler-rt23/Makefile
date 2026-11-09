PORTNAME=	mingw-w64-compiler-rt
DISTVERSION=	23.1.5
CATEGORIES=	devel
PKGNAMESUFFIX=	23

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	Compiler-rt builtins for MinGW-w64 Windows targets
WWW=		https://compiler-rt.llvm.org/

LICENSE=	LLVM2
LICENSE_NAME=	Apache License 2.0 with LLVM Exceptions
LICENSE_FILE=	${WRKSRC}/llvm/LICENSE.TXT
LICENSE_PERMS=	dist-mirror dist-sell pkg-mirror pkg-sell auto-accept

BUILD_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64
RUN_DEPENDS=	${LOCALBASE}/share/mingw-w64/generic-w64-mingw32/include/windows.h:devel/mingw-w64

USES=		cmake:indirect llvm:23,build,run ninja:build

USE_GITHUB=	yes
GH_ACCOUNT=	llvm
GH_PROJECT=	llvm-project
GH_TAGNAME=	llvmorg-${DISTVERSION}

MINGW_TARGETS=	i686 x86_64 aarch64 armv7
MINGW_SYSROOT=	${PREFIX}/share/mingw-w64
LLVM_BIN=	${LLVM_PREFIX}/bin
NO_ARCH=	yes

PLIST_FILES=	share/mingw-w64/lib/clang/23/include \
		share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-aarch64.a \
		share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-arm.a \
		share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-i386.a \
		share/mingw-w64/lib/clang/23/lib/windows/libclang_rt.builtins-x86_64.a

do-build:
	@for arch in ${MINGW_TARGETS}; do \
		${MKDIR} ${WRKDIR}/build-$$arch && cd ${WRKDIR}/build-$$arch && \
		cmake -G Ninja \
			-DCMAKE_BUILD_TYPE=Release \
			-DCMAKE_INSTALL_PREFIX=${WRKDIR}/install \
			-DCMAKE_C_COMPILER=${LLVM_BIN}/clang \
			-DCMAKE_CXX_COMPILER=${LLVM_BIN}/clang++ \
			-DCMAKE_ASM_COMPILER=${LLVM_BIN}/clang \
			-DCMAKE_SYSTEM_NAME=Windows \
			-DCMAKE_C_COMPILER_TARGET=$$arch-w64-windows-gnu \
			-DCMAKE_CXX_COMPILER_TARGET=$$arch-w64-windows-gnu \
			-DCMAKE_ASM_COMPILER_TARGET=$$arch-w64-windows-gnu \
			-DCMAKE_SYSROOT=${MINGW_SYSROOT} \
			-DCMAKE_AR=${LLVM_BIN}/llvm-ar \
			-DCMAKE_RANLIB=${LLVM_BIN}/llvm-ranlib \
			-DCMAKE_C_COMPILER_WORKS=1 \
			-DCMAKE_CXX_COMPILER_WORKS=1 \
			-DCOMPILER_RT_DEFAULT_TARGET_ONLY=TRUE \
			-DCOMPILER_RT_USE_BUILTINS_LIBRARY=TRUE \
			-DCOMPILER_RT_BUILD_BUILTINS=TRUE \
			-DCOMPILER_RT_EXCLUDE_ATOMIC_BUILTIN=FALSE \
			-DLLVM_CONFIG_PATH= \
			-DCMAKE_FIND_ROOT_PATH=${MINGW_SYSROOT}/$$arch-w64-mingw32 \
			-DCMAKE_FIND_ROOT_PATH_MODE_INCLUDE=ONLY \
			-DCMAKE_FIND_ROOT_PATH_MODE_PACKAGE=ONLY \
			-DCMAKE_C_FLAGS_INIT=-mguard=cf \
			${WRKSRC}/compiler-rt/lib/builtins || exit 1; \
		cmake --build . -j${MAKE_JOBS_NUMBER} || exit 1; \
		cmake --install . || exit 1; \
	done

do-install:
	@${MKDIR} ${STAGEDIR}${MINGW_SYSROOT}/lib/clang/23
	@${CP} -a ${WRKDIR}/install/lib ${STAGEDIR}${MINGW_SYSROOT}/lib/clang/23/
	@${LN} -s ${LLVM_PREFIX}/lib/clang/23/include \
		${STAGEDIR}${MINGW_SYSROOT}/lib/clang/23/include

.include <bsd.port.mk>
