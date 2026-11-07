PORTNAME=	deepseek-harness
DISTVERSION=	0.2.2-rc.1
CATEGORIES=	misc
DISTNAME=	${PORTNAME}-dsh-v${DISTVERSION}
DISTFILES=	${DISTNAME}${EXTRACT_SUFX}
MASTER_SITES=	https://github.com/deepseek-ai/deepseek-harness/archive/refs/tags/dsh-v${DISTVERSION}/

MAINTAINER=	4nnalesa
COMMENT=	DeepSeek open-source agent harness (CLI and Web UI)
WWW=		https://github.com/deepseek-ai/deepseek-harness

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/LICENSE

# The FreeBSD flock binding is compiled for amd64 only.
ONLY_FOR_ARCHS=	amd64
ONLY_FOR_ARCHS_REASON=	the FreeBSD flock addon is built for x86-64 only

# pnpm is the repository's package manager. The fetch qualifier lets the
# framework prefetch the complete store before any source is extracted.
USES=		gmake nodejs:24,build,run npm:pnpm,fetch pkgconfig python:build
USE_RC_SUBR=	dsh_web

SUB_FILES=	dsh pkg-message

RUN_DEPENDS=	bash:shells/bash \
		rg:textproc/ripgrep

# Match the pnpm version pinned by the root package.json.
NPM_VER=	11.28.5
NPM_PREFETCH=	yes
NPM_PREFETCH_ARCHS=	amd64
# The framework's extract-time install would run before post-extract and the
# FreeBSD patches, so do-build installs from the prefetched store itself.
NPM_EXTRACT=	no

BUILD_DEPENDS=	sqlite3:databases/sqlite3

# node-gyp must use the headers installed by www/node24. The client build
# embeds the release commit and version because the source tarball has no
# .git directory from which to derive them.
MAKE_ENV+=	npm_config_nodedir=${LOCALBASE} \
		CI=1 \
		DSH_CLIENT_COMMIT_HASH=66491b0 \
		DSH_CLIENT_VERSION=${DISTVERSION}

do-build:
	@${MKDIR} ${WRKDIR}/.bin
	${SETENV} ${MAKE_ENV} corepack enable --install-directory ${WRKDIR}/.bin
	${SETENV} ${MAKE_ENV} corepack install -g ${DISTDIR}/pnpm-${NPM_VER}.tgz
	${RM} ${WRKDIR}/pnpm-store/v11/index.db
	${SETENV} ${MAKE_ENV} ${LOCALBASE}/bin/sqlite3 \
		${WRKDIR}/pnpm-store/v11/index.db < ${WRKDIR}/pnpm-store/v11/index_dump.sql
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} install --offline \
		--frozen-lockfile --trust-lockfile --store-dir ${WRKDIR}/pnpm-store
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} run build:native-system
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} exec tsx \
		scripts/compile-referenced-projects.ts host-libraries
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} exec tsx \
		scripts/compile-referenced-projects.ts client
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} exec tsdown \
		--config-loader native --env.DSH_BUILD_FACE client
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} \
		--filter @deepseek-ai/dsh-web-frontend run build
	cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} --offline \
		--trust-lockfile --store-dir ${WRKDIR}/pnpm-store \
		--filter dsh-python-runtime-closure deploy --prod \
		--config.ignore-scripts=true ${WRKDIR}/deploy
	cd ${WRKDIR}/deploy && ${SETENV} ${MAKE_ENV} ${NPM_CMDNAME} \
		--store-dir ${WRKDIR}/pnpm-store rebuild node-pty koffi \
		@deepseek-ai/dsh-subprocess-local

# The deploy helper also renames build-path virtual-store entries so the
# resulting plist is independent of WRKSRC. node-pty's Windows ConPTY files
# and non-FreeBSD prebuilds have no role in this package.
post-build:
	${PYTHON_CMD} ${FILESDIR}/fix-deploy-links.py ${WRKDIR}/deploy ${WRKSRC}
	${RM} -rf ${WRKDIR}/deploy/node_modules/.pnpm/node-pty@*/node_modules/node-pty/prebuilds \
		${WRKDIR}/deploy/node_modules/.pnpm/node-pty@*/node_modules/node-pty/third_party

# Keep the relative links inside node_modules intact; the installed root is
# a conventional global Node package addressable as deepseek-harness.
do-install:
	${PYTHON_CMD} ${FILESDIR}/fix-deploy-links.py ${WRKDIR}/deploy ${WRKSRC}
	${MKDIR} ${STAGEDIR}${PREFIX}/lib/node_modules/deepseek-harness
	cd ${WRKDIR}/deploy && ${CP} -R node_modules \
		${STAGEDIR}${PREFIX}/lib/node_modules/deepseek-harness/
	${ECHO_CMD} '{"name":"deepseek-harness","version":"${DISTVERSION}","private":true}' \
		> ${STAGEDIR}${PREFIX}/lib/node_modules/deepseek-harness/package.json
	${INSTALL_SCRIPT} ${WRKDIR}/dsh ${STAGEDIR}${PREFIX}/bin/dsh
	${MKDIR} ${STAGEDIR}${DOCSDIR}
	${INSTALL_DATA} ${FILESDIR}/README.FreeBSD ${STAGEDIR}${DOCSDIR}/

# Overlay the final workspace manifests, lockfile and patch set before the
# patch phase; add the FreeBSD platform package and its metadata.
post-extract:
	cd ${FILESDIR}/packagejsons && ${TAR} -cf - . | ${TAR} -xf - -C ${WRKSRC}
	${MKDIR} ${WRKSRC}/native/system/packages/freebsd-x64/bin
	${CP} ${FILESDIR}/freebsd-x64/prebuilds.json \
		${WRKSRC}/native/system/packages/freebsd-x64/prebuilds.json
	${CP} ${FILESDIR}/freebsd-x64/README.md \
		${WRKSRC}/native/system/packages/freebsd-x64/README.md

.include <bsd.port.mk>
