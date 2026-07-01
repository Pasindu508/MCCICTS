// MCCICTS API base URL for news & events (Neon-backed).
// In production, point this at your deployed API (e.g. https://api.mccicts.lk).
(function () {
	const isLocal =
		location.hostname === "localhost" ||
		location.hostname === "127.0.0.1";
	window.MCCICTS_API_BASE = isLocal ? "http://localhost:3456" : "";
})();
