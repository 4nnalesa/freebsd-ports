PORTNAME=	deepseek-harness
DISTVERSIONPREFIX=	dsh-v
DISTVERSION=	0.2.2-rc.5
CATEGORIES=	misc
MASTER_SITES=	# prefetched via USES=npm

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	Open-source agent harness built on Cordis plugin architecture
WWW=		https://github.com/deepseek-ai/deepseek-harness

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/LICENSE

ONLY_FOR_ARCHS=		amd64
ONLY_FOR_ARCHS_REASON=	Build toolchains (rolldown, oxc-resolver, lightningcss) only ship FreeBSD x64 bindings

BUILD_DEPENDS=	npm-node24>0:www/npm-node24
RUN_DEPENDS=	bash:shells/bash \
		rg:textproc/ripgrep

USES=		gmake nodejs:24,env npm:pnpm,build,run python:build
USE_GITHUB=	yes
GH_ACCOUNT=	deepseek-ai
USE_RC_SUBR=	dsh_web

MAKE_ENV+=	DSH_BUILD_CLIENT_PROFILE=official \
		DSH_CLIENT_COMMIT_HASH=9c2670d \
		NODE_OPTIONS="--max-old-space-size=8192" \
		PATH="${WRKDIR}/.bin:${PATH}"

NPM_PREFETCH_ARCHS=	amd64
NPM_CACHE_SETUP_CMD=	${SH} -c 'for f in patches/*__AT__*; do ${MV} "$$f" "$$(printf "%s" "$$f" | ${SED} "s/__AT__/@/g")"; done'

SUB_FILES=	dsh pkg-message

PLIST_FILES=	bin/dsh

_NODE_GYP=	${LOCALBASE}/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js
_APP_DIR=	${PREFIX}/lib/node_modules/${PORTNAME}

post-patch:
	@${REINPLACE_CMD} -e 's|%%LOCALBASE%%|${LOCALBASE}|g' \
		${WRKSRC}/packages/util/ripgrep/src/index.ts \
		${WRKSRC}/packages/terminal/terminal-bash/src/config.ts
	@${RM} ${WRKSRC}/packages/util/ripgrep/src/index.ts.bak \
		${WRKSRC}/packages/terminal/terminal-bash/src/config.ts.bak

do-build:
	@${ECHO_MSG} "===>  Building DeepSeek Harness artifacts"
	@cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} \
		CC="${CC}" CFLAGS="${CFLAGS}" \
		pnpm run build:artifacts
	@${ECHO_MSG} "===>  Deploying runtime closure for @deepseek-ai/dsh"
	@${RM} -r ${WRKDIR}/deploy
	@cd ${WRKSRC} && ${SETENV} ${MAKE_ENV} \
		pnpm --filter @deepseek-ai/dsh --prod deploy \
			--offline --ignore-scripts --trust-lockfile \
			--config.inject-workspace-packages=true \
			--config.node-linker=hoisted \
			--store-dir ${WRKDIR}/node-modules-cache/pnpm-store \
			${WRKDIR}/deploy
	@${PYTHON_CMD} ${FILESDIR}/complete-deploy.py ${WRKSRC} ${WRKDIR}/deploy
	@${RM} -f ${WRKDIR}/deploy/pnpm-lock.yaml \
		${WRKDIR}/deploy/node_modules/.modules.yaml
	@${ECHO_MSG} "===>  Building native node-pty addon for FreeBSD"
	@for dir in ${WRKDIR}/deploy/node_modules/node-pty; do \
		if [ -f "$${dir}/binding.gyp" ]; then \
			${PATCH} -s -d "$${dir}" -p0 < ${FILESDIR}/extra-patch-node-pty && \
			(cd "$${dir}" && \
			${SETENV} ${MAKE_ENV} \
				CC="${CC}" CXX="${CXX}" \
				CFLAGS="${CFLAGS}" CXXFLAGS="${CXXFLAGS}" \
				MAKE="${GMAKE}" PYTHON="${PYTHON_CMD}" \
				npm_config_nodedir="${LOCALBASE}" \
				npm_config_offline=true \
				${LOCALBASE}/bin/node ${_NODE_GYP} rebuild \
					--nodedir="${LOCALBASE}" \
					--jobs=${MAKE_JOBS_NUMBER}) && \
			${FIND} "$${dir}/build" -mindepth 1 -maxdepth 1 ! -name Release -exec ${RM} -r {} + && \
			${FIND} "$${dir}/build/Release" -mindepth 1 -maxdepth 1 ! -name 'pty.node' -exec ${RM} -r {} + && \
			${RM} -r "$${dir}/prebuilds" "$${dir}/third_party" "$${dir}/src/unix/pty.cc.orig"; \
		fi; \
	done
	@for d in `${FIND} ${WRKDIR}/deploy -type d -name prebuilds`; do \
		for sub in "$${d}"/*; do \
			[ -e "$${sub}" ] || continue; \
			case "`${BASENAME} "$${sub}"`" in \
				freebsd-*) ;; \
				*) ${RM} -r "$${sub}" ;; \
			esac; \
		done; \
		${RMDIR} "$${d}" 2>/dev/null || true; \
	done

do-install:
	@${MKDIR} ${STAGEDIR}${_APP_DIR}
	@cd ${WRKDIR}/deploy && ${COPYTREE_SHARE} . ${STAGEDIR}${_APP_DIR}
	${INSTALL_SCRIPT} ${WRKDIR}/dsh ${STAGEDIR}${PREFIX}/bin/dsh
	@${FIND} ${STAGEDIR}${_APP_DIR} -type f -name '*.node' -exec ${STRIP_CMD} {} +

post-install:
	@${FIND} -s ${STAGEDIR}${_APP_DIR} -not -type d | \
		${SED} -e 's|^${STAGEDIR}${PREFIX}/||' >> ${TMPPLIST}
	@${FIND} -s ${STAGEDIR}${_APP_DIR} -type d -empty | \
		${SED} -e 's|^${STAGEDIR}${PREFIX}/|@dir |' >> ${TMPPLIST}

.include <bsd.port.mk>
