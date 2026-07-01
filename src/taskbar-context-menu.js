/**
 * Taskbar right-click menus (empty taskbar area and task buttons).
 */
(function () {
	let minimized_snapshot = null;

	function getVisibleWindows() {
		return Task.all_tasks
			.map((task) => task.$window)
			.filter((win) => win && !win.closed);
	}

	function isWindowVisible(win) {
		return win.is(":visible") && !win.hasClass("minimized-without-taskbar");
	}

	function cascadeWindows() {
		const windows = getVisibleWindows().filter(isWindowVisible);
		let x = 0;
		let y = 0;
		const offset = 22;
		const max_x = Math.max(0, window.innerWidth - 400);
		const max_y = Math.max(0, window.innerHeight - 120);
		for (const win of windows) {
			win.restore?.();
			win.unminimize?.();
			win.setDimensions?.({ outerWidth: 640, outerHeight: 480 });
			win.css({ left: `${Math.min(x, max_x)}px`, top: `${Math.min(y, max_y)}px` });
			win.bringToFront();
			x += offset;
			y += offset;
		}
	}

	function tileWindows(horizontal) {
		const windows = getVisibleWindows().filter(isWindowVisible);
		if (windows.length === 0) {
			return;
		}
		const taskbar_height = document.querySelector(".taskbar")?.offsetHeight || 28;
		const area_width = window.innerWidth;
		const area_height = window.innerHeight - taskbar_height;
		const count = windows.length;
		let cols, rows;
		if (horizontal) {
			rows = count;
			cols = 1;
		} else {
			cols = count;
			rows = 1;
		}
		const tile_width = Math.floor(area_width / cols);
		const tile_height = Math.floor(area_height / rows);
		windows.forEach((win, i) => {
			win.restore?.();
			win.unminimize?.();
			const col = horizontal ? 0 : i;
			const row = horizontal ? i : 0;
			win.setDimensions?.({ outerWidth: tile_width, outerHeight: tile_height });
			win.css({ left: `${col * tile_width}px`, top: `${row * tile_height}px` });
			win.bringToFront();
		});
	}

	function minimizeAll() {
		const windows = getVisibleWindows().filter(isWindowVisible);
		minimized_snapshot = windows;
		for (const win of windows) {
			win.minimize();
		}
	}

	function undoMinimizeAll() {
		if (!minimized_snapshot?.length) {
			return;
		}
		for (const win of minimized_snapshot) {
			if (win && !win.closed) {
				win.unminimize();
				win.bringToFront();
			}
		}
		minimized_snapshot = null;
	}

	function getTaskbarBackgroundMenu() {
		return [
			{
				label: "&Cascade",
				action: cascadeWindows,
				description: "Stacks open windows, with only title bars showing.",
			},
			{
				label: "Tile &Horizontally",
				action: () => tileWindows(true),
				description: "Resizes and arranges open windows so they overlap, top to bottom.",
			},
			{
				label: "Tile &Vertically",
				action: () => tileWindows(false),
				description: "Resizes and arranges open windows so they do not overlap, side by side.",
			},
			MENU_DIVIDER,
			{
				label: "&Minimize All Windows",
				enabled: () => getVisibleWindows().some((win) => isWindowVisible(win)),
				action: minimizeAll,
				description: "Reduces all open windows to taskbar buttons.",
			},
			{
				label: "&Undo Minimize All",
				enabled: () => !!minimized_snapshot?.length,
				action: undoMinimizeAll,
				description: "Restores all minimized windows.",
			},
			MENU_DIVIDER,
			{
				label: "P&roperties",
				action: () => showMessageBox({
					iconID: "info",
					title: "Taskbar Properties",
					message: "MCCICTS Taskbar\n\nRight-click desktop icons for file commands.\nRight-click a task button to close a window.",
				}),
			},
		];
	}

	function getTaskButtonMenu(task) {
		const win = task.$window;
		const minimized = !win.is(":visible") || win.hasClass("minimized-without-taskbar");
		const maximized = win.hasClass("maximized");
		return [
			{
				label: "&Restore",
				enabled: () => minimized || maximized,
				action: () => {
					win.unminimize();
					win.restore();
					win.bringToFront();
					win.focus();
				},
			},
			{
				label: "Mi&nimize",
				enabled: () => !minimized,
				action: () => win.minimize(),
			},
			{
				label: "Ma&ximize",
				enabled: () => !maximized && !minimized,
				action: () => win.maximize(),
			},
			MENU_DIVIDER,
			{
				label: "&Close",
				shortcutLabel: "Alt+F4",
				action: () => win.close(),
			},
		];
	}

	function initTaskbarContextMenus() {
		$(".taskbar").on("contextmenu", function (e) {
			const $target = $(e.target);
			if ($target.closest(".start-button, .start-menu, .tray").length) {
				return;
			}
			const $task = $target.closest(".task");
			if ($task.length) {
				e.preventDefault();
				e.stopPropagation();
				const task = Task.all_tasks.find((t) => t.$task[0] === $task[0]);
				if (task) {
					showContextMenu(e.clientX, e.clientY, getTaskButtonMenu(task));
				}
				return;
			}
			if ($target.closest(".tasks, .taskbar-divider, .taskbar-profile").length || $target.hasClass("taskbar")) {
				e.preventDefault();
				e.stopPropagation();
				showContextMenu(e.clientX, e.clientY, getTaskbarBackgroundMenu());
			}
		});
	}

	$(initTaskbarContextMenus);
})();
