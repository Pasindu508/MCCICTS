/**
 * MCCICTS user profiles — Guest and Administrator.
 */
(function () {
	const SESSION_KEY = "mccicts-session";

	const PERMISSIONS = {
		guest: {
			displayName: "Guest",
			programs: new Set([
				"News", "Events", "Notepad", "Paint", "Calculator", "Minesweeper",
				"Solitaire", "SoundRecorder", "Pinball", "openWinamp", "Explorer",
				"Pipes", "FlowerBox", "CommandPrompt", "show_help",
			]),
			canChangeTheme: true,
			canChangeWallpaper: true,
			canDropFiles: true,
			canUseAdminConsole: false,
			canManageContent: false,
		},
		administrator: {
			displayName: "Administrator",
			programs: new Set([
				"News", "Events", "Notepad", "Paint", "Calculator", "Minesweeper",
				"Solitaire", "SoundRecorder", "Pinball", "openWinamp", "Explorer",
				"Pipes", "FlowerBox", "CommandPrompt", "show_help", "AdminConsole",
			]),
			canChangeTheme: true,
			canChangeWallpaper: true,
			canDropFiles: true,
			canUseAdminConsole: true,
			canManageContent: true,
		},
	};

	let currentRole = null;
	let authToken = null;

	function getApiBase() {
		return window.MCCICTS_API_BASE || "";
	}

	function loadSession() {
		try {
			const raw = sessionStorage.getItem(SESSION_KEY);
			if (!raw) return null;
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}

	function saveSession(session) {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
		currentRole = session.role;
		authToken = session.token;
		window.MCCICTS_AUTH_TOKEN = authToken;
		window.MCCICTS_USER_ROLE = currentRole;
	}

	function clearSession() {
		sessionStorage.removeItem(SESSION_KEY);
		currentRole = null;
		authToken = null;
		window.MCCICTS_AUTH_TOKEN = null;
		window.MCCICTS_USER_ROLE = null;
	}

	async function apiPost(path, body) {
		let response;
		try {
			response = await fetch(getApiBase() + path, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
		} catch (error) {
			throw new Error(
				"Cannot reach the MCCICTS API server.\n\n" +
				"Make sure npm start is running (API on port 3456).\n\n" +
				(error.message || "Network error")
			);
		}
		const data = await response.json().catch(() => ({}));
		if (!response.ok) {
			throw new Error(data.error || "Authentication failed");
		}
		return data;
	}

	async function validateSession(session) {
		const response = await fetch(getApiBase() + "/api/auth/me", {
			headers: { Authorization: "Bearer " + session.token },
		});
		if (!response.ok) return null;
		return response.json();
	}

	window.MCCICTSProfile = {
		ROLES: { GUEST: "guest", ADMIN: "administrator" },

		getRole() {
			return currentRole;
		},

		getToken() {
			return authToken;
		},

		isAdministrator() {
			return currentRole === "administrator";
		},

		isGuest() {
			return currentRole === "guest";
		},

		getDisplayName() {
			const p = PERMISSIONS[currentRole];
			return p ? p.displayName : "";
		},

		can(programName) {
			if (!currentRole) return false;
			return PERMISSIONS[currentRole].programs.has(programName);
		},

		canChangeTheme() {
			return currentRole && PERMISSIONS[currentRole].canChangeTheme;
		},

		canChangeWallpaper() {
			return currentRole && PERMISSIONS[currentRole].canChangeWallpaper;
		},

		canDropFiles() {
			return currentRole && PERMISSIONS[currentRole].canDropFiles;
		},

		canManageContent() {
			return currentRole && PERMISSIONS[currentRole].canManageContent;
		},

		gateProgram(programName, fn) {
			return function (...args) {
				if (!MCCICTSProfile.can(programName)) {
					showMessageBox({
						iconID: "warning",
						title: "Access Denied",
						message:
							`The ${MCCICTSProfile.getDisplayName()} account does not have permission to run this program.\n\n` +
							"Log on as Administrator for full access.",
					});
					return null;
				}
				return fn.apply(this, args);
			};
		},

		async loginAsGuest() {
			const data = await apiPost("/api/auth/guest", {});
			saveSession({ role: "guest", token: data.token, displayName: data.displayName });
			MCCICTSProfile._onLogin();
			return data;
		},

		async loginAsAdministrator(password) {
			const data = await apiPost("/api/auth/admin", { password });
			saveSession({
				role: "administrator",
				token: data.token,
				displayName: data.displayName,
			});
			MCCICTSProfile._onLogin();
			return data;
		},

		logout() {
			if (window.jQuery) {
				jQuery("iframe").each(function () {
					if (this.$window && typeof this.$window.close === "function") {
						this.$window.close();
					}
				});
			}
			clearSession();
			MCCICTSProfile._showLoginScreen();
		},

		_onLogin() {
			document.getElementById("login-screen").hidden = true;
			document.body.classList.remove("login-pending");
			MCCICTSProfile._applyDesktopForRole();
			MCCICTSProfile._updateChrome();
			if (typeof MCCICTSProfile.onLogin === "function") {
				MCCICTSProfile.onLogin();
			}
		},

		_applyDesktopForRole() {
			const $desktop = window.jQuery && jQuery(".desktop");
			if (!$desktop || !$desktop.length) return;
			try {
				const wallpaper_data_url = localStorage.getItem("wallpaper-data-url");
				const wallpaper_repeat = localStorage.getItem("wallpaper-repeat");
				const theme_file_content = localStorage.getItem("desktop-theme");
				if (wallpaper_data_url) {
					fetch(wallpaper_data_url).then((r) => r.blob()).then((file) => {
						if (typeof setDesktopWallpaper === "function") {
							setDesktopWallpaper(file, wallpaper_repeat, false);
						}
					});
				}
				if (theme_file_content && typeof loadThemeFromText === "function") {
					loadThemeFromText(theme_file_content);
				}
			} catch (_) { /* ignore */ }
		},

		_updateChrome() {
			const name = MCCICTSProfile.getDisplayName();
			const label = document.getElementById("profile-label");
			if (label) {
				label.textContent = name;
				label.title = "Logged on as " + name;
			}
			document.body.dataset.userRole = currentRole || "";

			document.querySelectorAll("[data-admin-only]").forEach((el) => {
				el.hidden = !MCCICTSProfile.isAdministrator();
			});

			document.querySelectorAll(".start-menu [data-program]").forEach((el) => {
				const program = el.dataset.program;
				const li = el.closest("li");
				if (li) {
					li.style.display = MCCICTSProfile.can(program) ? "" : "none";
				}
			});

			document.querySelectorAll(".desktop-icon[data-program-name]").forEach((el) => {
				el.style.display = MCCICTSProfile.can(el.dataset.programName) ? "" : "none";
			});
			document.querySelectorAll(".desktop-icon[data-admin-only]").forEach((el) => {
				el.style.display = MCCICTSProfile.isAdministrator() ? "" : "none";
			});

			const themesLink = document.querySelector(".start-menu [data-action='themes']");
			if (themesLink) {
				themesLink.closest("li").style.display =
					MCCICTSProfile.canChangeTheme() ? "" : "none";
			}
		},

		_showLoginScreen() {
			document.getElementById("login-screen").hidden = false;
			document.body.classList.add("login-pending");
			const err = document.getElementById("login-error");
			if (err) {
				err.hidden = true;
				err.textContent = "";
			}
			const pw = document.getElementById("admin-password");
			if (pw) pw.value = "";
		},

		async init() {
			MCCICTSProfile._bindLoginUI();

			const saved = loadSession();
			if (saved?.token) {
				try {
					const me = await validateSession(saved);
					if (me) {
						saveSession({
							role: me.role,
							token: saved.token,
							displayName: me.displayName,
						});
						MCCICTSProfile._onLogin();
						return;
					}
				} catch (_) { /* show login */ }
				clearSession();
			}
			MCCICTSProfile._showLoginScreen();
		},

		_bindLoginUI() {
			document.getElementById("login-guest-btn").addEventListener("click", async () => {
				try {
					await MCCICTSProfile.loginAsGuest();
				} catch (e) {
					MCCICTSProfile._showLoginError(e.message);
				}
			});

			document.getElementById("login-admin-btn").addEventListener("click", async () => {
				const password = document.getElementById("admin-password").value;
				try {
					await MCCICTSProfile.loginAsAdministrator(password);
				} catch (e) {
					MCCICTSProfile._showLoginError(e.message);
				}
			});

			document.getElementById("admin-password").addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					document.getElementById("login-admin-btn").click();
				}
			});
		},

		_showLoginError(message) {
			const err = document.getElementById("login-error");
			err.textContent = message;
			err.hidden = false;
		},
	};

	// Restore token globals if page reloads mid-session before init completes
	const saved = loadSession();
	if (saved?.token) {
		window.MCCICTS_AUTH_TOKEN = saved.token;
		window.MCCICTS_USER_ROLE = saved.role;
	}
})();
