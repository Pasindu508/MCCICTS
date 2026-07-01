/**
 * Win98-style floating context menus via OS-GUI MenuBar.
 */
(function () {
	let active_dummy_bar = null;

	function clampMenuToViewport(menu_popup_el) {
		const rect = menu_popup_el.getBoundingClientRect();
		let left = parseFloat(menu_popup_el.style.left) || 0;
		let top = parseFloat(menu_popup_el.style.top) || 0;
		if (rect.right > window.innerWidth) {
			left -= rect.right - window.innerWidth;
		}
		if (rect.bottom > window.innerHeight) {
			top -= rect.bottom - window.innerHeight;
		}
		if (rect.left < 0) {
			left -= rect.left;
		}
		if (rect.top < 0) {
			top -= rect.top;
		}
		menu_popup_el.style.left = `${left}px`;
		menu_popup_el.style.top = `${top}px`;
	}

	/**
	 * @param {number} clientX
	 * @param {number} clientY
	 * @param {import("os-gui").OSGUIMenuFragment[]} menuItems
	 */
	function showContextMenu(clientX, clientY, menuItems) {
		if (!menuItems?.length) {
			return;
		}
		if (typeof close_start_menu === "function") {
			close_start_menu();
		}
		if (active_dummy_bar) {
			active_dummy_bar.remove();
			active_dummy_bar = null;
		}

		const dummy_menu_bar = new MenuBar({ "Dummy": menuItems });
		const bar_el = dummy_menu_bar.element;
		active_dummy_bar = bar_el;

		bar_el.style.cssText = [
			"position:fixed",
			`left:${clientX}px`,
			`top:${clientY}px`,
			"visibility:hidden",
			"pointer-events:none",
			"width:0",
			"height:0",
			"overflow:hidden",
		].join(";");

		document.body.appendChild(bar_el);

		const menu_button = bar_el.querySelector(".menu-button");
		menu_button.dispatchEvent(new Event("pointerdown"));

		requestAnimationFrame(() => {
			const popups = [...document.querySelectorAll(".menu-popup")].filter(
				(el) => el.style.display !== "none"
			);
			const menu_popup = popups[popups.length - 1];
			if (!menu_popup) {
				return;
			}
			menu_popup.style.left = `${clientX + window.scrollX}px`;
			menu_popup.style.top = `${clientY + window.scrollY}px`;
			clampMenuToViewport(menu_popup);
			if (window.$Window) {
				menu_popup.style.zIndex = `${++$Window.Z_INDEX + 5001}`;
			}
		});

		menu_button.addEventListener("release", () => {
			bar_el.remove();
			if (active_dummy_bar === bar_el) {
				active_dummy_bar = null;
			}
		});
	}

	window.showContextMenu = showContextMenu;
})();
