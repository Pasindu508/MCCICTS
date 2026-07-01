/**
 * Two-finger tap → right-click (context menu) on touch screens and trackpads.
 * Desktop uses touch-action: none, which blocks the browser's default long-press menu.
 */
(function (global) {
	const TAP_MAX_MS = 450;
	const TAP_MAX_MOVE_PX = 24;

	function touchCenter(touches) {
		let x = 0;
		let y = 0;
		for (let i = 0; i < touches.length; i++) {
			x += touches[i].clientX;
			y += touches[i].clientY;
		}
		return { x: x / touches.length, y: y / touches.length };
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

	function installTwoFingerGestures(doc) {
		if (!doc || doc.documentElement?.dataset.twoFingerGestures) {
			return;
		}
		doc.documentElement.dataset.twoFingerGestures = "true";

		let gesture = null;
		let suppressNextNativeContextMenu = false;

		doc.addEventListener("contextmenu", () => {
			if (suppressNextNativeContextMenu) {
				suppressNextNativeContextMenu = false;
			}
		}, true);

		doc.addEventListener("touchstart", (e) => {
			if (e.touches.length === 2) {
				const center = touchCenter(e.touches);
				gesture = {
					startX: center.x,
					startY: center.y,
					startTime: e.timeStamp,
					maxMove: 0,
				};
			} else {
				gesture = null;
			}
		}, { passive: true });

		doc.addEventListener("touchmove", (e) => {
			if (!gesture || e.touches.length !== 2) {
				return;
			}
			const center = touchCenter(e.touches);
			const dx = center.x - gesture.startX;
			const dy = center.y - gesture.startY;
			gesture.maxMove = Math.max(gesture.maxMove, Math.hypot(dx, dy));
			if (gesture.maxMove > TAP_MAX_MOVE_PX) {
				gesture = null;
			}
		}, { passive: true });

		doc.addEventListener("touchend", (e) => {
			if (!gesture || e.touches.length > 0) {
				return;
			}
			const elapsed = e.timeStamp - gesture.startTime;
			const { startX, startY, maxMove } = gesture;
			gesture = null;
			if (elapsed > TAP_MAX_MS || maxMove > TAP_MAX_MOVE_PX) {
				return;
			}
			e.preventDefault();
			suppressNextNativeContextMenu = true;
			fireContextMenu(doc, startX, startY);
		});

		doc.addEventListener("touchcancel", () => {
			gesture = null;
		}, { passive: true });

		// Trackpad / mouse secondary button when contextmenu is not fired
		doc.addEventListener("pointerdown", (e) => {
			if (e.button !== 2 || e.pointerType === "touch") {
				return;
			}
			const target = e.target;
			const x = e.clientX;
			const y = e.clientY;
			let handled = false;
			const onContextMenu = () => {
				handled = true;
			};
			doc.addEventListener("contextmenu", onContextMenu, { capture: true, once: true });
			global.setTimeout(() => {
				doc.removeEventListener("contextmenu", onContextMenu, { capture: true });
				if (!handled) {
					fireContextMenu(doc, x, y, target);
				}
			}, 0);
		});
	}

	global.installTwoFingerGestures = installTwoFingerGestures;

	if (global.document) {
		if (global.document.readyState === "loading") {
			global.document.addEventListener("DOMContentLoaded", () => installTwoFingerGestures(global.document));
		} else {
			installTwoFingerGestures(global.document);
		}
	}
})(window);
