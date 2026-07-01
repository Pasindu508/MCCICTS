window.MCCICTS = window.MCCICTS || {};

function mccictsParentWindow() {
	try {
		if (window.parent && window.parent !== window) {
			return window.parent;
		}
	} catch (_) { /* cross-origin */ }
	return null;
}

/** Copy login session from the desktop shell into program iframes. */
MCCICTS.syncSessionFromParent = function () {
	const parent = mccictsParentWindow();
	if (!parent) {
		return;
	}
	if (parent.MCCICTS_AUTH_TOKEN) {
		window.MCCICTS_AUTH_TOKEN = parent.MCCICTS_AUTH_TOKEN;
	}
	if (parent.MCCICTS_USER_ROLE) {
		window.MCCICTS_USER_ROLE = parent.MCCICTS_USER_ROLE;
	}
	if (parent.MCCICTS_API_BASE) {
		window.MCCICTS_API_BASE = parent.MCCICTS_API_BASE;
	}
};

MCCICTS.getUserRole = function () {
	MCCICTS.syncSessionFromParent();
	return window.MCCICTS_USER_ROLE || null;
};

MCCICTS.getAuthToken = function () {
	MCCICTS.syncSessionFromParent();
	return window.MCCICTS_AUTH_TOKEN || null;
};

MCCICTS.apiBase = function () {
	MCCICTS.syncSessionFromParent();
	return window.MCCICTS_API_BASE || "";
};

/** Full URL for uploaded news/event photos served by the API. */
MCCICTS.mediaUrl = function (url) {
	if (!url) return "";
	if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
	const base = MCCICTS.apiBase().replace(/\/$/, "");
	const path = url.startsWith("/") ? url : `/${url}`;
	return base ? base + path : path;
};

MCCICTS.uploadImage = async function (file, folder) {
	const dataUrl = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(new Error("Could not read image file."));
		reader.readAsDataURL(file);
	});
	return MCCICTS.fetchJson("/api/admin/upload", {
		method: "POST",
		body: JSON.stringify({
			dataUrl,
			folder: folder === "events" ? "events" : "news",
		}),
	});
};

MCCICTS.escapeHtml = function (text) {
	const div = document.createElement("div");
	div.textContent = text == null ? "" : String(text);
	return div.innerHTML;
};

MCCICTS.formatDate = function (isoString) {
	if (!isoString) return "";
	return new Date(isoString).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

MCCICTS.formatDateTime = function (dateStr, timeStr) {
	const dateOnly = String(dateStr).slice(0, 10);
	const timePart = timeStr ? String(timeStr).slice(0, 8) : "";
	const date = new Date(dateOnly + (timePart ? "T" + timePart : ""));
	let text = date.toLocaleDateString(undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	if (timePart) {
		const [h, m] = timePart.split(":");
		const t = new Date();
		t.setHours(Number(h), Number(m));
		text += " at " + t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
	}
	return text;
};

MCCICTS.daysUntil = function (dateStr) {
	const dateOnly = String(dateStr).slice(0, 10);
	const eventDay = new Date(dateOnly + "T00:00:00");
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return Math.round((eventDay - today) / (1000 * 60 * 60 * 24));
};

MCCICTS.buildQuery = function (params) {
	const q = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value != null && value !== "" && value !== false) {
			q.set(key, String(value));
		}
	}
	const s = q.toString();
	return s ? "?" + s : "";
};

MCCICTS.apiHint = function () {
	return MCCICTS.apiBase()
		? ""
		: " Run npm run start-api and set MCCICTS_API_BASE in config/mccicts-api.js.";
};

MCCICTS.authHeaders = function () {
	const token = MCCICTS.getAuthToken();
	return token ? { Authorization: "Bearer " + token } : {};
};

MCCICTS.fetchJson = async function (path, options = {}) {
	const url = MCCICTS.apiBase() + path;
	let response;
	try {
		response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...MCCICTS.authHeaders(),
				...(options.headers || {}),
			},
		});
	} catch (error) {
		throw new Error(
			"Cannot reach the MCCICTS API server. Make sure npm start is running (port 3456)."
		);
	}
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(body.error || `Request failed (${response.status})`);
	}
	if (response.status === 204) return null;
	return response.json();
};

MCCICTS.isAdmin = function () {
	return MCCICTS.getUserRole() === "administrator";
};
