/**
 * Keep os-gui windows within the mobile viewport.
 * Only active at max-width: 767px; desktop/tablet layouts are unchanged.
 */
(function () {
	const MOBILE_QUERY = "(max-width: 767px)";
	const HORIZONTAL_MARGIN = 4;
	const MIN_WINDOW_WIDTH = 260;

	let resizeRaf = 0;

	function isMobileViewport() {
		return window.matchMedia(MOBILE_QUERY).matches;
	}

	function getViewportWidth() {
		return window.visualViewport?.width ?? document.documentElement.clientWidth;
	}

	function getViewportHeight() {
		return window.visualViewport?.height ?? document.documentElement.clientHeight;
	}

	function getTaskbarHeight() {
		const taskbar = document.querySelector(".taskbar");
		return taskbar ? taskbar.getBoundingClientRect().height : 27;
	}

	function fitWindow($w) {
		if (!isMobileViewport() || !$w || !$w[0]) {
			return;
		}
		const el = $w[0];
		if (el.classList.contains("maximized") || el.classList.contains("minimized")) {
			return;
		}

		const vw = getViewportWidth();
		const maxOuterW = Math.max(MIN_WINDOW_WIDTH, vw - HORIZONTAL_MARGIN * 2);
		if ($w.outerWidth() > maxOuterW) {
			$w.outerWidth(maxOuterW);
		}

		let rect = el.getBoundingClientRect();
		let leftDelta = 0;

		if (rect.left < HORIZONTAL_MARGIN) {
			leftDelta = HORIZONTAL_MARGIN - rect.left;
		} else if (rect.right > vw - HORIZONTAL_MARGIN) {
			leftDelta = vw - HORIZONTAL_MARGIN - rect.width - rect.left;
		}

		if (leftDelta !== 0) {
			const pos = $w.position();
			$w.css("left", pos.left + leftDelta);
		}

		const vh = getViewportHeight();
		const maxBottom = vh - getTaskbarHeight() - HORIZONTAL_MARGIN;
		rect = el.getBoundingClientRect();
		if (rect.bottom > maxBottom) {
			const newTop = Math.max(HORIZONTAL_MARGIN, maxBottom - rect.height);
			const pos = $w.position();
			$w.css("top", pos.top + (newTop - rect.top));
		}
	}

	function fitAllWindows() {
		if (!isMobileViewport()) {
			return;
		}
		document.querySelectorAll(".os-window").forEach((el) => {
			if (el.$window) {
				fitWindow(el.$window);
			}
		});
	}

	function scheduleFitAll() {
		cancelAnimationFrame(resizeRaf);
		resizeRaf = requestAnimationFrame(fitAllWindows);
	}

	function observeWindows() {
		const observer = new MutationObserver((mutations) => {
			if (!isMobileViewport()) {
				return;
			}
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (!(node instanceof HTMLElement)) {
						continue;
					}
					if (node.classList.contains("os-window") && node.$window) {
						requestAnimationFrame(() => fitWindow(node.$window));
					}
					node.querySelectorAll?.(".os-window").forEach((child) => {
						if (child.$window) {
							requestAnimationFrame(() => fitWindow(child.$window));
						}
					});
				}
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	function init() {
		observeWindows();
		scheduleFitAll();
	}

	window.addEventListener("resize", scheduleFitAll);
	window.addEventListener("orientationchange", scheduleFitAll);
	window.visualViewport?.addEventListener("resize", scheduleFitAll);
	window.matchMedia(MOBILE_QUERY).addEventListener("change", scheduleFitAll);

	document.addEventListener(
		"click",
		(event) => {
			if (
				isMobileViewport() &&
				event.target.closest?.(".window-maximize-button, .window-restore-button")
			) {
				scheduleFitAll();
			}
		},
		true
	);

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
