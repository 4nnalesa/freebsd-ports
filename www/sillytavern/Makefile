PORTNAME=	sillytavern
DISTVERSION=	1.19.0
CATEGORIES=	www

MAINTAINER=	4nnalesa@gmail.com
COMMENT=	Web frontend for chatting with LLM APIs
WWW=		https://github.com/SillyTavern/SillyTavern

LICENSE=	AGPLv3
LICENSE_FILE=	${WRKSRC}/LICENSE

USES=		nodejs:24,run npm:npm,fetch
USE_GITHUB=	yes
GH_ACCOUNT=	SillyTavern
GH_PROJECT=	SillyTavern
GH_TAGNAME=	${DISTVERSION}
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
