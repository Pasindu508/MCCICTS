// 1998 CRT monitor screen effect.
// Wraps the whole platform (login screen, desktop, taskbar, windows) in a
// full-screen overlay so it looks like it is running inside a late-90s color
// CRT monitor.
//
// It uses the real CRT tube frame artwork from the Scanlines pack
// (images/crt/border.png) so the platform visibly sits inside the monitor,
// plus a gentle barrel curve on the screen and a subtle rolling refresh band
// and tube flicker for life.
//
// The overlay is purely visual (pointer-events: none) so it never blocks clicks.
// Toggle at runtime with window.CRTEffect.toggle(), or press Ctrl+Alt+C.
// The on/off preference is remembered in localStorage.
(function () {
	"use strict";

	const STORAGE_KEY = "mccicts-crt-effect";
	const OVERLAY_ID = "crt-effect-overlay";
	const STYLE_ID = "crt-effect-style";
	// Sit above the taskbar (5000) and start menu (5001), and Webamp menus.
	const Z_INDEX = 6000000;

	// CRT tube frame (border only, no scanlines) from the Scanlines pack.
	const SCREEN_SRC = "images/crt/border.png";
	// Barrel-distortion displacement map (R = x-shift, G = y-shift), used to
	// bulge the whole screen like a real CRT tube.
	const BARREL_MAP_SRC = "images/crt/barrel-map.png";
	const FILTER_ID = "crt-barrel";
	const BEZEL_ID = "crt-bezel";
	const SCANLINES_ID = "crt-scanlines";
	const CURSOR_ID = "crt-cursor";
	const CURSOR_SRC = "/cursors/arrow.cur";
	// Max edge displacement in px; higher = more pronounced curve.
	// The border/scanlines are drawn by the crisp bezel image, so we can bulge
	// the screen content strongly (incl. the left/right sides) without the
	// scanlines looking wavy.
	const CURVE_SCALE = 56;

	const prefersReducedMotion =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const css = `
		:root {
			/* How far the platform is inset from the viewport edges so it sits
			   inside the CRT tube's screen area (matches the frame artwork, with
			   a little margin so nothing hides behind the curved bezel). */
			--crt-inset-x: 2.4vw;
			--crt-inset-y: 3vh;
			--crt-screen-radius: 1vw;
		}

		/* Run the whole platform inside the CRT screen: a transparent-black
		   border insets every layer (desktop, taskbar, windows, start menu),
		   because absolutely-positioned children are clipped to the padding box.
		   Rounding + overflow:hidden matches the curved tube corners. */
		body.crt-effect-on {
			box-sizing: border-box;
			position: relative;
			border-style: solid;
			border-color: #000;
			border-top-width: var(--crt-inset-y);
			border-bottom-width: var(--crt-inset-y);
			border-left-width: var(--crt-inset-x);
			border-right-width: var(--crt-inset-x);
			border-radius: calc(var(--crt-screen-radius) + min(var(--crt-inset-x), var(--crt-inset-y)));
			background-color: #000;
			overflow: hidden;
		}
		/* The login screen is normally position:fixed (viewport-anchored); make it
		   absolute so it too sits inside the inset screen area. */
		body.crt-effect-on #login-screen {
			position: absolute;
		}
		/* Nudge desktop icons in a touch so the top-left icon clears the rounded
		   tube corner. */
		body.crt-effect-on .desktop {
			box-sizing: border-box;
			padding: var(--crt-screen-radius);
		}

		/* os-gui maximizes windows to 100vw/100vh. Inside the CRT screen the
		   usable area is the body's content box (inset border). Without this the
		   right edge — including the close button — is clipped by overflow:hidden. */
		body.crt-effect-on .os-window.maximized {
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			bottom: var(--crt-taskbar-h, 31px) !important;
			width: auto !important;
			height: auto !important;
			max-width: 100% !important;
			box-sizing: border-box !important;
		}

		/* Curve the whole platform like a bulging CRT tube. The barrel filter is
		   applied to the whole body so dynamically-created windows curve too.
		   (A CSS/SVG filter only warps painting, not layout or hit-testing, so
		   the curve stays on permanently and clicks are unaffected by it.) */
		body.crt-effect-on.crt-curve {
			filter: url(#${FILTER_ID});
		}
		/* Applying a filter makes the body the containing block for the fixed
		   overlay, so re-anchor it to cover the full viewport (incl. the inset
		   border) and let it curve together with everything else. */
		body.crt-effect-on.crt-curve #${OVERLAY_ID} {
			position: absolute;
			top: calc(-1 * var(--crt-inset-y));
			left: calc(-1 * var(--crt-inset-x));
			right: auto;
			bottom: auto;
			width: 100vw;
			height: 100vh;
		}

		/* The CRT border comes straight from the Scanlines pack artwork
		   (border.png — the curved tube frame only, no scanlines). It lives
		   OUTSIDE the body (appended to <html>), so the barrel filter on the body
		   doesn't warp it — the frame stays crisp and real, while only the screen
		   content curves underneath. Stretched to fill the whole viewport so the
		   baked border sits on all four edges. */
		#${BEZEL_ID} {
			position: fixed;
			inset: 0;
			pointer-events: none;
			z-index: ${Z_INDEX + 1000};
			background-image: url("${SCREEN_SRC}");
			background-repeat: no-repeat;
			background-position: center;
			background-size: 100% 100%;
		}
		#${BEZEL_ID}[hidden] { display: none !important; }

		/* Subtle CRT scanlines: thin dark lines with clear gaps so the screen
		   content stays fully readable. Kept crisp (drawn on <html>, outside the
		   barrel filter) so the lines don't wobble, and sits just under the
		   frame. */
		#${SCANLINES_ID} {
			position: fixed;
			inset: 0;
			pointer-events: none;
			z-index: ${Z_INDEX + 500};
			background-image: repeating-linear-gradient(
				to bottom,
				rgba(0, 0, 0, 0) 0px,
				rgba(0, 0, 0, 0) 2px,
				rgba(0, 0, 0, 0.14) 2px,
				rgba(0, 0, 0, 0.14) 3px
			);
			mix-blend-mode: multiply;
			opacity: 0.7;
		}
		#${SCANLINES_ID}[hidden] { display: none !important; }

		/* Fake mouse pointer that lives INSIDE the curved screen. The native
		   cursor is hidden over the platform chrome and this arrow is drawn in
		   the body layer instead, so it bends with the tube and sits exactly on
		   whatever is under it. (Program iframes keep the native cursor, since
		   the parent page can't track the mouse over an iframe.) */
		body.crt-effect-on.crt-curve,
		body.crt-effect-on.crt-curve *:not(iframe) {
			cursor: none !important;
		}
		#${CURSOR_ID} {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 5999000;
			pointer-events: none;
			display: none;
			image-rendering: pixelated;
			will-change: transform;
		}
		body.crt-effect-on.crt-cursor-active #${CURSOR_ID} { display: block; }

		#${OVERLAY_ID} {
			position: fixed;
			inset: 0;
			z-index: ${Z_INDEX};
			pointer-events: none;
			overflow: hidden;
			opacity: 1;
			transition: opacity 220ms ease;
		}
		#${OVERLAY_ID}[hidden] {
			display: none !important;
		}
		#${OVERLAY_ID} > div {
			position: absolute;
			inset: 0;
		}

		/* Slow rolling refresh band that sweeps down the screen. */
		#${OVERLAY_ID} .crt-roll {
			background: linear-gradient(
				to bottom,
				rgba(255, 255, 255, 0) 0%,
				rgba(255, 255, 255, 0.035) 45%,
				rgba(255, 255, 255, 0.06) 50%,
				rgba(255, 255, 255, 0.035) 55%,
				rgba(255, 255, 255, 0) 100%
			);
			height: 28%;
			mix-blend-mode: screen;
			animation: crt-roll 7s linear infinite;
		}

		/* Whole-screen brightness flicker of an aging tube. */
		#${OVERLAY_ID} .crt-flicker {
			background: rgba(18, 16, 12, 0.03);
			mix-blend-mode: multiply;
			animation: crt-flicker 90ms steps(2, end) infinite;
		}

		@keyframes crt-roll {
			0% { transform: translateY(-30%); }
			100% { transform: translateY(360%); }
		}
		@keyframes crt-flicker {
			0% { opacity: 0.75; }
			50% { opacity: 0.55; }
			100% { opacity: 0.85; }
		}

		@media (prefers-reduced-motion: reduce) {
			#${OVERLAY_ID} .crt-roll,
			#${OVERLAY_ID} .crt-flicker {
				animation: none;
			}
		}
	`;

	function injectStyle() {
		if (document.getElementById(STYLE_ID)) return;
		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = css;
		document.head.appendChild(style);
	}

	function injectFilterSvg() {
		if (document.getElementById(FILTER_ID)) return;
		const NS = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(NS, "svg");
		svg.setAttribute("width", "0");
		svg.setAttribute("height", "0");
		svg.setAttribute("aria-hidden", "true");
		svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none;";
		svg.innerHTML =
			'<defs>' +
			'<filter id="' + FILTER_ID + '" x="-12%" y="-12%" width="124%" height="124%" ' +
			'color-interpolation-filters="sRGB">' +
			'<feImage xlink:href="' + BARREL_MAP_SRC + '" href="' + BARREL_MAP_SRC + '" ' +
			'x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>' +
			'<feDisplacementMap in="SourceGraphic" in2="map" scale="' + (-CURVE_SCALE) + '" ' +
			'xChannelSelector="R" yChannelSelector="G"/>' +
			'</filter>' +
			'</defs>';
		document.body.appendChild(svg);
	}

	function buildBezel() {
		let bezel = document.getElementById(BEZEL_ID);
		if (bezel) return bezel;
		bezel = document.createElement("div");
		bezel.id = BEZEL_ID;
		bezel.setAttribute("aria-hidden", "true");
		// Append to <html> so it is not a descendant of the filtered <body>
		// and therefore stays crisp (undistorted) like a real monitor frame.
		document.documentElement.appendChild(bezel);
		return bezel;
	}

	function buildScanlines() {
		let el = document.getElementById(SCANLINES_ID);
		if (el) return el;
		el = document.createElement("div");
		el.id = SCANLINES_ID;
		el.setAttribute("aria-hidden", "true");
		// On <html> (outside the filter) so the lines stay crisp, not wavy.
		document.documentElement.appendChild(el);
		return el;
	}

	// --- Fake in-screen mouse pointer -----------------------------------------

	let cursorInsetX = 0;
	let cursorInsetY = 0;
	let pointerX = window.innerWidth / 2;
	let pointerY = window.innerHeight / 2;
	let cursorRafPending = false;

	function buildCursor() {
		let el = document.getElementById(CURSOR_ID);
		if (el) return el;
		el = document.createElement("img");
		el.id = CURSOR_ID;
		el.src = CURSOR_SRC;
		el.alt = "";
		el.setAttribute("aria-hidden", "true");
		el.draggable = false;
		// Inside <body> so it curves with the screen content.
		document.body.appendChild(el);
		return el;
	}

	function measureCursorInset() {
		const cs = getComputedStyle(document.body);
		cursorInsetX = parseFloat(cs.borderLeftWidth) || 0;
		cursorInsetY = parseFloat(cs.borderTopWidth) || 0;
	}

	function updateTaskbarOffset() {
		const taskbar = document.querySelector(".taskbar");
		if (!taskbar) return;
		// Match os-gui maximize(): taskbar.outerHeight() + 1
		const h = taskbar.getBoundingClientRect().height + 1;
		document.documentElement.style.setProperty("--crt-taskbar-h", h + "px");
	}

	function renderCursor() {
		cursorRafPending = false;
		const el = document.getElementById(CURSOR_ID);
		if (!el) return;
		// Measure the inset border every frame so the mapping is always correct
		// even if the effect was just toggled on or the window resized.
		measureCursorInset();
		// Position in the body's content coordinate space (viewport minus the
		// inset border); the barrel filter then bends the paint to match, so the
		// arrow sits exactly on whatever the click will hit.
		el.style.transform =
			"translate(" + (pointerX - cursorInsetX) + "px," + (pointerY - cursorInsetY) + "px)";
	}

	function onPointerMove(e) {
		pointerX = e.clientX;
		pointerY = e.clientY;
		if (isEnabled() && curvatureOn) {
			document.body.classList.add("crt-cursor-active");
		}
		if (!cursorRafPending) {
			cursorRafPending = true;
			requestAnimationFrame(renderCursor);
		}
	}

	function hideCursor() {
		document.body.classList.remove("crt-cursor-active");
	}

	function initCursor() {
		measureCursorInset();
		renderCursor();
		document.addEventListener("pointermove", onPointerMove, true);
		document.addEventListener("pointerdown", onPointerMove, true);
		// Over an iframe the parent stops receiving move events; fall back to the
		// native cursor there so the fake one doesn't freeze on top.
		document.addEventListener("mouseover", (e) => {
			if (e.target && e.target.tagName === "IFRAME") {
				hideCursor();
			} else if (isEnabled() && curvatureOn) {
				document.body.classList.add("crt-cursor-active");
			}
		}, true);
		document.addEventListener("mouseleave", hideCursor);
		window.addEventListener("blur", hideCursor);
		window.addEventListener("resize", () => { measureCursorInset(); renderCursor(); });
	}

	function buildOverlay() {
		let overlay = document.getElementById(OVERLAY_ID);
		if (overlay) return overlay;
		overlay = document.createElement("div");
		overlay.id = OVERLAY_ID;
		overlay.setAttribute("aria-hidden", "true");
		// Subtle animated life on the curved screen; the border/scanlines
		// themselves come from the crisp bezel image (see #${BEZEL_ID}).
		const layers = ["crt-roll", "crt-flicker"];
		for (const cls of layers) {
			// Skip animated layers entirely when the user prefers reduced motion.
			if (prefersReducedMotion && (cls === "crt-roll" || cls === "crt-flicker")) continue;
			const layer = document.createElement("div");
			layer.className = cls;
			overlay.appendChild(layer);
		}
		document.body.appendChild(overlay);
		return overlay;
	}

	function isEnabled() {
		const stored = localStorage.getItem(STORAGE_KEY);
		// Default: on.
		return stored === null ? true : stored === "1";
	}

	function apply(enabled) {
		const overlay = document.getElementById(OVERLAY_ID);
		if (!overlay) return;
		overlay.hidden = !enabled;
		const bezel = document.getElementById(BEZEL_ID);
		if (bezel) bezel.hidden = !enabled;
		const scanlines = document.getElementById(SCANLINES_ID);
		if (scanlines) scanlines.hidden = !enabled;
		document.body.classList.toggle("crt-effect-on", enabled);
		document.body.classList.toggle("crt-curve", enabled && curvatureOn);
	}

	let curvatureOn = true;

	const CRTEffect = {
		enable() {
			localStorage.setItem(STORAGE_KEY, "1");
			apply(true);
		},
		disable() {
			localStorage.setItem(STORAGE_KEY, "0");
			apply(false);
		},
		toggle() {
			if (isEnabled()) {
				this.disable();
			} else {
				this.enable();
			}
			return isEnabled();
		},
		setCurvature(on) {
			curvatureOn = !!on;
			apply(isEnabled());
			return curvatureOn;
		},
		get enabled() {
			return isEnabled();
		},
		get curvature() {
			return curvatureOn;
		},
	};

	function init() {
		injectStyle();
		injectFilterSvg();
		buildOverlay();
		buildBezel();
		buildScanlines();
		buildCursor();
		apply(isEnabled());
		initCursor();
		updateTaskbarOffset();
		window.addEventListener("resize", updateTaskbarOffset);

		// Ctrl+Alt+C toggles the CRT effect.
		document.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.altKey && (e.key === "c" || e.key === "C")) {
				e.preventDefault();
				CRTEffect.toggle();
			}
		});
	}

	window.CRTEffect = CRTEffect;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
