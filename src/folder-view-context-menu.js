/**
 * Right-click context menus for FolderView (desktop and Explorer panes).
 */
(function () {
	function arrangeIconsSubmenu(folder_view) {
		return {
			label: "Arrange &Icons",
			submenu: [
				{
					ariaLabel: "Sort By",
					getValue: () => folder_view.config.sort_mode,
					setValue: (sort_mode) => folder_view.configure({ sort_mode }),
					radioItems: [
						{ label: "by &Name", value: "NAME" },
						{ label: "by &Type", value: "TYPE" },
						{ label: "by &Size", value: "SIZE" },
						{ label: "by &Date", value: "DATE" },
					],
				},
				MENU_DIVIDER,
				{
					label: "&Auto Arrange",
					checkbox: {
						check: () => true,
						toggle: () => folder_view.arrange_icons(),
					},
					description: "Arranges the icons automatically.",
				},
			],
		};
	}

	function showItemProperties(folder_view, item_el) {
		const item = folder_view.getItemFromElement(item_el);
		const title = item_el.querySelector(".title")?.textContent?.trim() || "Item";
		const path = item?.file_path || item_el.dataset.filePath || "(shortcut)";
		const type = item?.is_system_folder ? "System Folder" :
			item?.resolvedStats?.isDirectory?.() ? "Folder" : "File";
		showMessageBox({
			iconID: "info",
			title: `${title} Properties`,
			message: `Name: ${title}\nType: ${type}\nLocation: ${path}`,
		});
	}

	function showDesktopProperties() {
		const role = window.MCCICTSProfile?.getDisplayName?.() || "Guest";
		showMessageBox({
			iconID: "info",
			title: "Display Properties",
			message: `MCCICTS Desktop\n\nLogged on as: ${role}\n\nUse the Start menu → Themes & Wallpapers to change the desktop appearance.`,
		});
	}

	function showFolderProperties(folder_view) {
		showMessageBox({
			iconID: "info",
			title: "Folder Properties",
			message: `Folder: ${folder_view.folder_path}\nItems: ${folder_view.items.length}`,
		});
	}

	function canDeleteSelection(folder_view) {
		return folder_view.element.querySelectorAll(".desktop-icon.selected").length > 0 &&
			[...folder_view.element.querySelectorAll(".desktop-icon.selected")].some(
				(el) => !system_folder_path_to_name[el.dataset.filePath]
			);
	}

	function openItem(item) {
		if (item?.open) {
			item.open();
			return;
		}
		const el = item?.element;
		if (!el) {
			return;
		}
		// Fallback: simulate double-click via two quick pointerdowns
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
	}

	function exploreItem(item) {
		if (typeof Explorer !== "function") {
			return;
		}
		if (item?.file_path) {
			const parent = item.file_path.replace(/\/[^/]+\/?$/, "/") || "/";
			Explorer(parent);
			return;
		}
		Explorer("/desktop/");
	}

	function getIconContextMenu(folder_view, item_el) {
		const item = folder_view.getItemFromElement(item_el);
		const selected_count = folder_view.element.querySelectorAll(".desktop-icon.selected").length;
		const single = selected_count <= 1;
		const can_rename = single && item?.can_rename;

		return [
			{
				label: "&Open",
				shortcutLabel: "Enter",
				action: () => openItem(item),
				description: "Opens the selected item.",
			},
			{
				label: "E&xplore",
				enabled: () => typeof Explorer === "function",
				action: () => exploreItem(item),
				description: "Opens the folder containing the selected item.",
			},
			MENU_DIVIDER,
			{
				label: "Create &Shortcut",
				enabled: false,
				description: "Creates shortcuts to the selected items.",
			},
			{
				label: "&Delete",
				shortcutLabel: "Del",
				enabled: () => canDeleteSelection(folder_view),
				action: () => folder_view.delete_selected(),
				description: "Deletes the selected items.",
			},
			{
				label: "Rena&me",
				enabled: () => can_rename && !!item,
				action: () => {
					if (item) {
						item.element.classList.add("focused");
						item.start_rename();
					}
				},
				description: "Renames the selected item.",
			},
			MENU_DIVIDER,
			{
				label: "P&roperties",
				action: () => showItemProperties(folder_view, item_el),
				description: "Displays the properties of the selected items.",
			},
		];
	}

	function getBackgroundContextMenu(folder_view) {
		const is_desktop = folder_view.asDesktop;
		const items = [
			arrangeIconsSubmenu(folder_view),
			{
				label: "Line &Up Icons",
				action: () => folder_view.arrange_icons(),
				description: "Arranges icons in a grid.",
			},
			MENU_DIVIDER,
			{
				label: "&Paste",
				shortcutLabel: "Ctrl+V",
				enabled: false,
				description: "Inserts the items you have copied or cut into the selected location.",
			},
			{
				label: "&New",
				submenu: [
					{ label: "&Folder", enabled: false },
					{ label: "&Shortcut", enabled: false },
					{ label: "Text &Document", enabled: false },
				],
			},
			MENU_DIVIDER,
			{
				label: is_desktop ? "&Properties" : "Folder &Properties",
				action: () => is_desktop ? showDesktopProperties() : showFolderProperties(folder_view),
				description: "Displays properties.",
			},
		];

		if (is_desktop && typeof MCCICTSProfile !== "undefined" && MCCICTSProfile.canChangeTheme()) {
			items.splice(items.length - 1, 0, {
				label: "&Refresh",
				shortcutLabel: "F5",
				action: () => folder_view.arrange_icons(),
				description: "Refreshes the desktop.",
			});
		}

		return items;
	}

	function attachFolderViewContextMenu(folder_view) {
		const $folder_view = $(folder_view.element);

		$folder_view.on("contextmenu", function (e) {
			e.preventDefault();
			e.stopPropagation();

			const $icon = $(e.target).closest(".desktop-icon");
			if ($icon.length) {
				if (!$icon.hasClass("selected")) {
					folder_view.select_item($icon[0], {}, true);
				}
				showContextMenu(e.clientX, e.clientY, getIconContextMenu(folder_view, $icon[0]));
			} else {
				folder_view.clear_selection();
				showContextMenu(e.clientX, e.clientY, getBackgroundContextMenu(folder_view));
			}
		});
	}

	window.attachFolderViewContextMenu = attachFolderViewContextMenu;
})();
