PORTNAME=	scroll
DISTVERSION=	1.12.21
CATEGORIES=	x11-wm wayland

MAINTAINER=	daucja@gmail.com
COMMENT=	Sway with a PaperWM layout like niri or hyprscroller
WWW=		https://github.com/dawsers/scroll

LICENSE=	MIT
LICENSE_FILE=	${WRKSRC}/LICENSE

BUILD_DEPENDS=	evdev-proto>0:devel/evdev-proto \
		wayland-protocols>=1.48:graphics/wayland-protocols
LIB_DEPENDS=	libjson-c.so:devel/json-c \
		libevdev.so:devel/libevdev \
		libudev.so:devel/libudev-devd \
		libpcre2-8.so:devel/pcre2 \
		libdrm.so:graphics/libdrm \
		libwayland-egl.so:graphics/wayland \
		libinput.so:x11/libinput \
		libxkbcommon.so:x11/libxkbcommon

USES=		compiler:c11 gl gnome lua:54 meson pkgconfig readline xorg
USE_GITHUB=	yes
USE_GNOME=	cairo pango
USE_XORG=	pixman
USE_GL=		gbm
GH_ACCOUNT=	dawsers
MESON_ARGS=	-Dsd-bus-provider=basu -Dwlroots:allocators=gbm \
		-Dwlroots:backends=${BACKENDS:ts,} -Dwlroots:renderers=${RENDERERS:ts,}

OPTIONS_DEFINE=	BASU DRM LCMS2 LIBLIFTOFF MANPAGES OPENGL PIXBUF SWAYBG VULKAN X11
OPTIONS_DEFAULT=BASU DRM LCMS2 LIBLIFTOFF MANPAGES OPENGL PIXBUF SWAYBG VULKAN X11
OPTIONS_SUB=	yes

BASU_DESC=		Tray in swaybar via basu
BASU_LIB_DEPENDS=	libbasu.so:devel/basu
BASU_MESON_ENABLED=	tray

DRM_DESC=               KMS console support
DRM_BUILD_DEPENDS=      hwdata>0:misc/hwdata
DRM_LIB_DEPENDS=        libdisplay-info.so:sysutils/libdisplay-info \
			libseat.so:sysutils/seatd
DRM_MESON_ENABLED=      wlroots:session
DRM_VARS=               BACKENDS+="drm libinput"

LCMS2_LIB_DEPENDS=      liblcms2.so:graphics/lcms2
LCMS2_MESON_ENABLED=    wlroots:color-management

LIBLIFTOFF_DESC=        libliftoff DRM interface (see WLR_DRM_FORCE_LIBLIFTOFF)
LIBLIFTOFF_LIB_DEPENDS= libliftoff.so:graphics/libliftoff
LIBLIFTOFF_MESON_ENABLED=       wlroots:libliftoff
LIBLIFTOFF_IMPLIES=     DRM

MANPAGES_BUILD_DEPENDS=	scdoc>=1.9.2:textproc/scdoc
MANPAGES_MESON_ENABLED=	man-pages

OPENGL_RUN_DEPENDS=     mesa-dri>0:graphics/mesa-dri
OPENGL_USE=             GL=egl,glesv2
OPENGL_VARS=            RENDERERS+=gles2

PIXBUF_USE=		GNOME=gdkpixbuf
PIXBUF_MESON_ENABLED=	gdk-pixbuf

SWAYBG_DESC=		Default command to set background
SWAYBG_RUN_DEPENDS=	swaybg:x11/swaybg

VULKAN_DESC=		Vulkan renderer
VULKAN_BUILD_DEPENDS=	glslangValidator:graphics/glslang \
			vulkan-headers>0:graphics/vulkan-headers
VULKAN_LIB_DEPENDS=	libvulkan.so:graphics/vulkan-loader
VULKAN_RUN_DEPENDS=	mesa-dri>0:graphics/mesa-dri
VULKAN_VARS=		RENDERERS+=vulkan

X11_BUILD_DEPENDS=      Xwayland:x11-servers/xwayland
X11_LIB_DEPENDS=	libxcb-errors.so:x11/xcb-util-errors \
			libxcb-render-util.so:x11/xcb-util-renderutil \
			libxcb-icccm.so:x11/xcb-util-wm
X11_RUN_DEPENDS=	Xwayland:x11-servers/xwayland
X11_MESON_ENABLED=      wlroots:xwayland
X11_USE=		XORG=xcb
X11_VARS=		BACKENDS+=x11

post-patch:
# Let @sample handle default files under etc/
	@${REINPLACE_CMD} -e '/config\.in/{ N; s/@BASENAME@/&.sample/; }' \
		${WRKSRC}/meson.build
# Extract (snapshot) version from the port instead of meson.build
	@${REINPLACE_CMD} -i .nogit -e 's/git.found()/false/' \
		-e '/project_version/s/@0@/${DISTVERSIONFULL}/' \
		${WRKSRC}/meson.build

.include <bsd.port.mk>
