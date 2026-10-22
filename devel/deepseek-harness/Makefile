PORTNAME=	deepseek-harness
DISTVERSION=	0.2.1-rc.2
CATEGORIES=	devel
DISTNAME=	${PORTNAME}-${DISTVERSION}-freebsd-amd64

MAINTAINER=	skywalk163@vip.qq.com
COMMENT=	DeepSeek open-source agent harness (CLI and web UI)
WWW=		https://github.com/skywalk163/deepseek-harness

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/LICENSE

# The distfile is a self-contained runtime closure produced from a built
# checkout by tools/make-port-distfile.sh (see dsh-freebsd-port/README.md for
# the rationale). dsh is a pnpm monorepo of ~370 workspace packages: its
# dependency closure is not in the ports tree, and a source build needs 30+
# minutes and 2-4 GB of RAM, which no poudriere builder accepts.
ONLY_FOR_ARCHS=		amd64
ONLY_FOR_ARCHS_REASON=	the distfile ships prebuilt native addons (node-pty, flock) for amd64

USES=		nodejs:run

MASTER_SITES=	https://github.com/skywalk163/deepseek-harness/releases/download/freebsd-${DISTVERSION}/

# bash is required: the terminal tool drives a persistent bash PTY session.
# ripgrep powers the grep/glob tools.
RUN_DEPENDS=	bash:shells/bash \
		rg:textproc/ripgrep

USE_RC_SUBR=	dsh_web
SUB_FILES=	dsh pkg-message

# The only thing built here is the small setuid jail helper that confines
# agent commands on FreeBSD (jail(2) and libjail's jailparam API are both in
# the base system).
do-build:
	${CC} ${CFLAGS} -o ${WRKDIR}/dsh-jail-run ${WRKSRC}/freebsd/dsh-jail-run.c -ljail

do-install:
	${MKDIR} ${STAGEDIR}${PREFIX}/libexec/deepseek-harness
	cd ${WRKSRC} && ${COPYTREE_SHARE} . ${STAGEDIR}${PREFIX}/libexec/deepseek-harness
	${INSTALL_SCRIPT} ${WRKDIR}/dsh ${STAGEDIR}${PREFIX}/bin/dsh
	${INSTALL_PROGRAM} ${WRKDIR}/dsh-jail-run ${STAGEDIR}${PREFIX}/libexec/dsh-jail-run

.include <bsd.port.mk>
