/**
 * Touch-first UX for phones and tablets: no mouse cursor, long-press menus.
 * Desktop pointer devices are unchanged.
 */
(function (global) {
	const TOUCH_SCREEN_QUERY = "(hover: none) and (pointer: coarse) and (max-width: 1024px)";
	const STYLESHEET_ID = "touch-screen-stylesheet";
	const CSS_PATH = "/touch-screen.css";
	const LONG_PRESS_MS = 550;
	const LONG_PRESS_MOVE_PX = 12;
	const SUPPRESS_CLICK_MS = 400;

	let activePress = null;
	let suppressClickTarget = null;
	let suppressClickUntil = 0;

	function touchScreenMedia() {
		return global.matchMedia(TOUCH_SCREEN_QUERY);
	}

	function isTouchScreenMode() {
		return touchScreenMedia().matches;
	}

	function touchStylesheetUrl() {
		return new URL(CSS_PATH, global.location.origin).href;
	}

	function applyTouchScreenStyles(doc) {
		if (!doc?.head || !isTouchScreenMode()) {
			return;
		}
		doc.documentElement.classList.add("touch-screen");
		if (doc.getElementById(STYLESHEET_ID)) {
			return;
		}
		const link = doc.createElement("link");
		link.id = STYLESHEET_ID;
		link.rel = "stylesheet";
		link.href = touchStylesheetUrl();
		doc.head.appendChild(link);
	}

	function removeTouchScreenStyles(doc) {
		if (!doc?.documentElement) {
			return;
		}
		doc.documentElement.classList.remove("touch-screen");
		doc.getElementById(STYLESHEET_ID)?.remove();
	}

	function fireContextMenu(doc, clientX, clientY, target) {
		const el = target || doc.elementFromPoint(clientX, clientY);
		if (!el) {
			return;
		}
		const event = new MouseEvent("contextmenu", {
			bubbles: true,
			cancelable: true,
			view: doc.defaultView,
			clientX,
			clientY,
			screenX: clientX,
			screenY: clientY,
			button: 2,
			buttons: 2,
		});
		el.dispatchEvent(event);
	}

	function cancelLongPress() {
		if (!activePress) {
			return;
		}
		clearTimeout(activePress.timer);
		activePress = null;
	}

	function installLongPress(doc) {
		if (!doc || doc.documentElement?.dataset.touchLongPress) {
			return;
		}
		doc.documentElement.dataset.touchLongPress = "true";

		doc.addEventListener(
			"touchstart",
			(e) => {
				if (!isTouchScreenMode()) {
					return;
				}
				if (e.touches.length !== 1) {
					cancelLongPress();
					return;
				}
				const touch = e.touches[0];
				cancelLongPress();
				activePress = {
					id: touch.identifier,
					x: touch.clientX,
					y: touch.clientY,
					target: touch.target,
					timer: global.setTimeout(() => {
						if (!activePress) {
							return;
						}
						activePress.fired = true;
						suppressClickTarget = activePress.target;
						suppressClickUntil = Date.now() + SUPPRESS_CLICK_MS;
						fireContextMenu(doc, activePress.x, activePress.y, activePress.target);
						if (global.navigator.vibrate) {
							global.navigator.vibrate(12);
						}
					}, LONG_PRESS_MS),
				};
			},
			{ passive: true }
		);

		doc.addEventListener(
			"touchmove",
			(e) => {
				if (!activePress) {
					return;
				}
				const touch = Array.from(e.touches).find((t) => t.identifier === activePress.id);
				if (!touch) {
					return;
				}
				const move = Math.hypot(touch.clientX - activePress.x, touch.clientY - activePress.y);
				if (move > LONG_PRESS_MOVE_PX) {
					cancelLongPress();
				}
			},
			{ passive: true }
		);

		doc.addEventListener("touchend", () => {
			cancelLongPress();
		}, { passive: true });

		doc.addEventListener("touchcancel", () => {
			cancelLongPress();
		}, { passive: true });

		doc.addEventListener(
			"click",
			(e) => {
				if (
					suppressClickTarget &&
					Date.now() < suppressClickUntil &&
					(e.target === suppressClickTarget ||
						suppressClickTarget.contains(e.target))
				) {
					e.preventDefault();
					e.stopPropagation();
				}
			},
			true
		);
	}

	function installTouchScreen(doc) {
		if (!doc) {
			return;
		}
		if (isTouchScreenMode()) {
			applyTouchScreenStyles(doc);
			installLongPress(doc);
		} else {
			removeTouchScreenStyles(doc);
		}
	}

	function scanForIframes(root) {
		if (!root?.querySelectorAll) {
			return;
		}
		root.querySelectorAll("iframe").forEach((iframe) => {
			try {
				const doc = iframe.contentDocument;
				if (doc?.readyState === "complete") {
					installTouchScreen(doc);
				}
			} catch (_) { /* cross-origin */ }
		});
	}

	function observeNewIframes() {
		if (!global.MutationObserver || !global.document?.body) {
			return;
		}
		new MutationObserver((mutations) => {
			if (!isTouchScreenMode()) {
				return;
			}
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType !== 1) {
						continue;
					}
					if (node.tagName === "IFRAME") {
						node.addEventListener("load", () => {
							try {
								installTouchScreen(node.contentDocument);
							} catch (_) { /* cross-origin */ }
						});
					}
					scanForIframes(node);
				}
			}
		}).observe(global.document.body, { childList: true, subtree: true });
	}

	function syncTouchScreenMode() {
		installTouchScreen(global.document);
		scanForIframes(global.document);
	}

	function init() {
		syncTouchScreenMode();
		observeNewIframes();
		touchScreenMedia().addEventListener("change", syncTouchScreenMode);
		global.addEventListener("orientationchange", syncTouchScreenMode);
	}

	global.isTouchScreenMode = isTouchScreenMode;
	global.applyTouchScreenStyles = applyTouchScreenStyles;
	global.installTouchScreen = installTouchScreen;

	if (global.document) {
		if (global.document.readyState === "loading") {
			global.document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}
})(window);
