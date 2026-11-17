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
USE_RC_SUBR=	sillytavern

NPM_FETCH_FLAGS+=	--omit=dev
# Pure JS/WASM dependency tree (no native .node addons).
NO_ARCH=	yes
NO_BUILD=	yes

SUB_FILES=	pkg-message
SUB_LIST=	DBDIR=${DBDIR} \
		GROUPS=${GROUPS} \
		USERS=${USERS}
PLIST_SUB=	DBDIR=${DBDIR} \
		GROUPS=${GROUPS} \
		USERS=${USERS}

USERS=		www
GROUPS=		www

DBDIR=		/var/db/${PORTNAME}

post-patch:
	@${REINPLACE_CMD} -e '/^browserLaunch:/,/^[^[:space:]]/ s/^  enabled: true/  enabled: false/' \
		${WRKSRC}/default/config.yaml

do-install:
	@${MKDIR} ${STAGEDIR}${WWWDIR} \
		${STAGEDIR}${ETCDIR} \
		${STAGEDIR}${DBDIR} \
		${STAGEDIR}/var/run/${PORTNAME}
	cd ${WRKSRC} && ${COPYTREE_SHARE} \
		"default plugins public src package.json plugins.js recover.js server.js webpack.config.js node_modules" \
		${STAGEDIR}${WWWDIR}
	@${MKDIR} ${STAGEDIR}${WWWDIR}/backups \
		${STAGEDIR}${WWWDIR}/public/scripts/extensions/third-party
	${RM} -r ${STAGEDIR}${WWWDIR}/src/electron
	${FIND} ${STAGEDIR}${WWWDIR} \
		\( -name '*.bak' -o -name '*.orig' -o -name '.gitkeep' \) -delete
	${FIND} ${STAGEDIR}${WWWDIR}/node_modules \
		\( -name .bin -o -name coverage -o -name test -o -name tests \) \
		-type d -prune -exec ${RM} -r {} +
	${INSTALL_DATA} ${WRKSRC}/default/config.yaml \
		${STAGEDIR}${ETCDIR}/config.yaml.sample

.include <bsd.port.mk>
