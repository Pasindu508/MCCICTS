/**
 * Inject Win98 cursors into the current document and nested iframes.
 */
(function (global) {
	const STYLESHEET_ID = "classic-cursors-stylesheet";
	const CSS_PATH = "/classic-cursors.css";

	function cursorStylesheetUrl() {
		return new URL(CSS_PATH, global.location.origin).href;
	}

	function applyClassicCursors(doc) {
		if (!doc?.head) return;
		if (doc.getElementById(STYLESHEET_ID)) return;
		const link = doc.createElement("link");
		link.id = STYLESHEET_ID;
		link.rel = "stylesheet";
		link.href = cursorStylesheetUrl();
		doc.head.appendChild(link);
		scanForIframes(doc);
	}

	function hookIframe(iframe) {
		if (!iframe || iframe.dataset.classicCursorsHooked) return;
		iframe.dataset.classicCursorsHooked = "true";
		iframe.addEventListener("load", () => {
			try {
				const doc = iframe.contentDocument;
				if (!doc) return;
				applyClassicCursors(doc);
				scanForIframes(doc);
			} catch (_) { /* cross-origin */ }
		});
	}

	function scanForIframes(root) {
		if (!root?.querySelectorAll) return;
		root.querySelectorAll("iframe").forEach((iframe) => {
			hookIframe(iframe);
			try {
				const doc = iframe.contentDocument;
				if (doc?.readyState === "complete") {
					applyClassicCursors(doc);
					scanForIframes(doc);
				}
			} catch (_) { /* cross-origin */ }
		});
	}

	function observeNewIframes() {
		if (!global.MutationObserver || !global.document?.body) return;
		new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType !== 1) continue;
					if (node.tagName === "IFRAME") {
						hookIframe(node);
					}
					scanForIframes(node);
				}
			}
		}).observe(global.document.body, { childList: true, subtree: true });
	}

	function init() {
		applyClassicCursors(global.document);
		scanForIframes(global.document);
		observeNewIframes();
	}

	global.applyClassicCursors = applyClassicCursors;

	if (global.document) {
		if (global.document.readyState === "loading") {
			global.document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}
})(window);
