PORTNAME=	matcha
DISTVERSION=	2.1.0
CATEGORIES=	x11 wayland
MASTER_SITES=	https://codeberg.org/QuincePie/${PORTNAME}/archive/${DISTVERSIONFULL}${EXTRACT_SUFX}?dummy=/
WRKSRC=		${WRKDIR}/matcha

MAINTAINER=	daucja@gmail.com
COMMENT=	An idle inhibitor for Wayland
WWW=		https://codeberg.org/QuincePie/matcha

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/LICENSE

BUILD_DEPENDS=	wayland-protocols>0:graphics/wayland-protocols
LIB_DEPENDS=	libwayland-client.so:graphics/wayland

USES=		compiler:c11 meson pkgconfig

PLIST_FILES=	bin/matcha

.include <bsd.port.mk>
