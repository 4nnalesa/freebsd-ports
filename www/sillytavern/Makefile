PORTNAME=	sillytavern
DISTVERSION=	1.19.0
CATEGORIES=	www
# GitHub's web frontend is unreachable from some networks, but codeload is
# not; fetch the tag archive directly and unpack it into the repo's own
# top-level directory.
MASTER_SITES=	https://codeload.github.com/SillyTavern/SillyTavern/tar.gz/refs/tags/
# codeload serves the archive from a URL with no filename suffix, so fetch
# it as ${DISTVERSION} and let EXTRACT_SUFX (.tar.gz) drive extraction. The
# archive unpacks into the repository's own SillyTavern-<version> directory.
DISTFILES=	${DISTVERSION}
DIST_SUBDIR=	${PORTNAME}
WRKSRC=		${WRKDIR}/SillyTavern-${DISTVERSION}

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	Web frontend for chatting with LLM APIs
WWW=		https://github.com/SillyTavern/SillyTavern

LICENSE=	AGPLv3
LICENSE_FILE=	${WRKSRC}/LICENSE

USES=		nodejs:24,run npm:npm,fetch
USE_RC_SUBR=	sillytavern
SUB_FILES=	pkg-message

# The dependency tree is pure JavaScript (no native addons), so the
# prefetched node_modules archive is architecture independent.
NPM_PREFETCH=	yes
# Only the runtime dependency tree belongs in the package.
NPM_FETCH_FLAGS+=	--omit=dev
NO_ARCH=	yes
NO_BUILD=	yes

# Headless install: never try to open a browser on the server console.
post-extract:
	${REINPLACE_CMD} -e '/^browserLaunch:/,/^[^[:space:]]/ s/^  enabled: true/  enabled: false/' \
		${WRKSRC}/default/config.yaml

do-install:
	${MKDIR} ${STAGEDIR}${WWWDIR}
	cd ${WRKSRC} && ${COPYTREE_SHARE} . ${STAGEDIR}${WWWDIR}
	${RM} -rf ${STAGEDIR}${WWWDIR}/tests \
		${STAGEDIR}${WWWDIR}/.github \
		${STAGEDIR}${WWWDIR}/.vscode \
		${STAGEDIR}${WWWDIR}/.gemini \
		${STAGEDIR}${WWWDIR}/colab \
		${STAGEDIR}${WWWDIR}/docker
	${MKDIR} ${STAGEDIR}${ETCDIR}
	${INSTALL_DATA} ${WRKSRC}/default/config.yaml ${STAGEDIR}${ETCDIR}/config.yaml.sample
	${MKDIR} ${STAGEDIR}/var/db/sillytavern

.include <bsd.port.mk>
