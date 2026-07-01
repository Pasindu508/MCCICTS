function show_help(options) {
	const $help_window = $Window({
		title: options.title || "Help Topics",
		icons: iconsAtTwoSizes("chm"),
		resizable: true,
	})
	$help_window.addClass("help-window");

	let ignore_one_load = true;
	let back_length = 0;
	let forward_length = 0;

	const $main = $(E("div")).addClass("main");
	const $toolbar = $(E("div")).addClass("toolbar");
	const add_toolbar_button = (name, sprite_n, action_fn, enabled_fn) => {
		const $button = $("<button class='lightweight'>")
			.append($("<span>").text(name))
			.appendTo($toolbar)
			.on("click", () => {
				action_fn();
			});
		$("<div class='icon'/>")
			.appendTo($button)
			.css({
				backgroundPosition: `${-sprite_n * 55}px 0px`,
			});
		const update_enabled = () => {
			$button[0].disabled = enabled_fn && !enabled_fn();
		};
		update_enabled();
		$help_window.on("click", "*", update_enabled);
		$help_window.on("update-buttons", update_enabled);
		return $button;
	};
	const measure_sidebar_width = () =>
		$contents.outerWidth() +
		parseFloat(getComputedStyle($contents[0]).getPropertyValue("margin-left")) +
		parseFloat(getComputedStyle($contents[0]).getPropertyValue("margin-right")) +
		$resizer.outerWidth();
	const $hide_button = add_toolbar_button("Hide", 0, () => {
		const toggling_width = measure_sidebar_width();
		$contents.hide();
		$resizer.hide();
		$hide_button.hide();
		$show_button.show();
		$help_window.width($help_window.width() - toggling_width);
		$help_window.css("left", $help_window.offset().left + toggling_width);
	});
	const $show_button = add_toolbar_button("Show", 5, () => {
		$contents.show();
		$resizer.show();
		$show_button.hide();
		$hide_button.show();
		const toggling_width = measure_sidebar_width();
		$help_window.width($help_window.width() + toggling_width);
		$help_window.css("left", $help_window.offset().left - toggling_width);
		// $help_window.applyBounds() would push the window to fit (before trimming it only if needed)
		// Trim the window to fit (especially for if maximized)
		if ($help_window.offset().left < 0) {
			$help_window.width($help_window.width() + $help_window.offset().left);
			$help_window.css("left", 0);
		}
	}).hide();
	add_toolbar_button("Back", 1, () => {
		$iframe[0].contentWindow.history.back();
		ignore_one_load = true;
		back_length -= 1;
		forward_length += 1;
	}, () => back_length > 0);
	add_toolbar_button("Forward", 2, () => {
		$iframe[0].contentWindow.history.forward();
		ignore_one_load = true;
		forward_length -= 1;
		back_length += 1;
	}, () => forward_length > 0);
	add_toolbar_button("Options", 3, () => { }, () => false); // TODO: access key &O
	add_toolbar_button("Web Help", 4, () => {
		iframe.src = "help/online_support.htm";
	});

	const $iframe = $("<iframe sandbox='allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads'>")
		.attr({ src: "help/default.html" })
		.addClass("inset-deep");
	const iframe = $iframe[0];
	enhance_iframe(iframe);
	iframe.$window = $help_window; // for focus handling integration
	const $resizer = $(E("div")).addClass("resizer");
	const $contents = $(E("ul")).addClass("contents inset-deep");

	// TODO: fix race conditions
	$iframe.on("load", () => {
		if (!ignore_one_load) {
			back_length += 1;
			forward_length = 0;
		}
		iframe.contentWindow.location.href
		ignore_one_load = false;
		$help_window.triggerHandler("update-buttons");
	});

	$main.append($contents, $resizer, $iframe);
	$help_window.$content.append($toolbar, $main);

	$help_window.css({ width: 800, height: 600 });

	$iframe.attr({ name: "help-frame" });
	$iframe.css({
		backgroundColor: "white",
		border: "",
		margin: "1px",
	});
	$contents.css({
		margin: "1px",
	});
	$help_window.center();

	$main.css({
		position: "relative", // for resizer
	});

	const resizer_width = 4;
	$resizer.css({
		cursor: "ew-resize",
		width: resizer_width,
		boxSizing: "border-box",
		background: "var(--ButtonFace)",
		borderLeft: "1px solid var(--ButtonShadow)",
		boxShadow: "inset 1px 0 0 var(--ButtonHilight)",
		top: 0,
		bottom: 0,
		zIndex: 1,
	});
	$resizer.on("pointerdown", (e) => {
		let pointermove, pointerup;
		const getPos = (e) =>
			Math.min($help_window.width() - 100, Math.max(20,
				e.clientX - $help_window.$content.offset().left
			));
		$G.on("pointermove", pointermove = (e) => {
			$resizer.css({
				position: "absolute",
				left: getPos(e)
			});
			$contents.css({
				marginRight: resizer_width,
			});
		});
		$G.on("pointerup", pointerup = (e) => {
			$G.off("pointermove", pointermove);
			$G.off("pointerup", pointerup);
			$resizer.css({
				position: "",
				left: ""
			});
			$contents.css({
				flexBasis: getPos(e) - resizer_width,
				marginRight: "",
			});
		});
	});

	const parse_object_params = $object => {
		// parse an $(<object>) to a plain object of key value pairs
		const object = {};
		for (const param of $object.children("param").get()) {
			object[param.name] = param.value;
		}
		return object;
	};

	let $last_expanded;

	const make_$item = text => {
		const $item = $(E("div")).addClass("item").text(text);
		$item.on("mousedown", () => {
			$contents.find(".item").removeClass("selected");
			$item.addClass("selected");
		});
		$item.on("click", () => {
			const $li = $item.parent();
			if ($li.is(".folder")) {
				if ($last_expanded) {
					$last_expanded.not($li).removeClass("expanded");
				}
				$li.toggleClass("expanded");
				$last_expanded = $li;
			}
		});
		return $item;
	};

	const $default_item_li = $(E("li")).addClass("page");
	$default_item_li.append(make_$item("Welcome to Help").on("click", () => {
		$iframe.attr({ src: "help/default.html" });
	}));
	$contents.append($default_item_li);

	function renderItemFromContents(source_li, $folder_items_ul) {
		const object = parse_object_params($(source_li).children("object"));
		if ($(source_li).find("li").length > 0) {

			const $folder_li = $(E("li")).addClass("folder");
			$folder_li.append(make_$item(object.Name));
			$contents.append($folder_li);

			const $folder_items_ul = $(E("ul"));
			$folder_li.append($folder_items_ul);

			$(source_li).children("ul").children().get().forEach((li) => {
				renderItemFromContents(li, $folder_items_ul);
			});
		} else {
			const $item_li = $(E("li")).addClass("page");
			$item_li.append(make_$item(object.Name).on("click", () => {
				$iframe.attr({ src: `${options.root}/${object.Local}` });
			}));
			if ($folder_items_ul) {
				$folder_items_ul.append($item_li);
			} else {
				$contents.append($item_li);
			}
		}
	}

	$.get(options.contentsFile, hhc => {
		$($.parseHTML(hhc)).filter("ul").children().get().forEach((li) => {
			renderItemFromContents(li, null);
		});
	});

	// @TODO: keyboard accessability
	// $help_window.on("keydown", (e)=> {
	// 	switch(e.keyCode){
	// 		case 37:
	// 			show_error_message("MOVE IT");
	// 			break;
	// 	}
	// });
	var task = new Task($help_window);
	task.$help_window = $help_window;
	return task;
}

function Notepad(file_path) {
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in make_iframe_window)
	var document_title = file_path ? file_name_from_path(file_path) : "Untitled";
	var win_title = document_title + " - Notepad";
	// TODO: focus existing window if file is currently open?

	var $win = make_iframe_window({
		src: "programs/notepad/index.html" + (file_path ? ("?path=" + file_path) : ""),
		icons: iconsAtTwoSizes("notepad"),
		title: win_title,
		outerWidth: 480,
		outerHeight: 321,
		resizable: true,
	});
	return new Task($win);
}
Notepad.acceptsFilePaths = true;

function Paint(file_path) {
	var $win = make_iframe_window({
		src: "programs/jspaint/index.html",
		icons: iconsAtTwoSizes("paint"),
		// NOTE: in Windows 98, "untitled" is lowercase, but TODO: we should just make it consistent
		title: "untitled - Paint",
		outerWidth: 275,
		outerHeight: 400,
		minOuterWidth: 275,
		minOuterHeight: 400,
	});

	var contentWindow = $win.$iframe[0].contentWindow;

	var waitUntil = function (test, interval, callback) {
		if (test()) {
			callback();
		} else {
			setTimeout(waitUntil, interval, test, interval, callback);
		}
	};

	const systemHooks = {
		readBlobFromHandle: (file_path) => {
			return new Promise((resolve, reject) => {
				withFilesystem(() => {
					var fs = BrowserFS.BFSRequire("fs");
					fs.readFile(file_path, (err, buffer) => {
						if (err) {
							return reject(err);
						}
						const byte_array = new Uint8Array(buffer);
						const blob = new Blob([byte_array]);
						const file_name = file_path.replace(/.*\//g, "");
						const file = new File([blob], file_name);
						resolve(file);
					});
				});
			});
		},
		writeBlobToHandle: async (file_path, blob) => {
			const arrayBuffer = await blob.arrayBuffer();
			return new Promise((resolve, reject) => {
				withFilesystem(()=> {
					const fs = BrowserFS.BFSRequire("fs");
					const { Buffer } = BrowserFS.BFSRequire("buffer");
					const buffer = Buffer.from(arrayBuffer);
					fs.writeFile(file_path, buffer, (err)=> {
						if (err) {
							return reject(err);
						}
						resolve();
					});
				});
			});
		},
		setWallpaperCentered: (canvas) => {
			canvas.toBlob((blob) => {
				setDesktopWallpaper(blob, "no-repeat", true);
			});
		},
		setWallpaperTiled: (canvas) => {
			canvas.toBlob((blob) => {
				setDesktopWallpaper(blob, "repeat", true);
			});
		},
	};

	// it seems like I should be able to use onload here, but when it works (overrides the function),
	// it for some reason *breaks the scrollbar styling* in jspaint
	// I don't know what's going on there

	// contentWindow.addEventListener("load", function(){
	// $(contentWindow).on("load", function(){
	// $win.$iframe.load(function(){
	// $win.$iframe[0].addEventListener("load", function(){
	waitUntil(()=> contentWindow.systemHooks, 500, ()=> {
		Object.assign(contentWindow.systemHooks, systemHooks);

		let $help_window;
		contentWindow.show_help = () => {
			if ($help_window) {
				$help_window.focus();
				return;
			}
			$help_window = show_help({
				title: "Paint Help",
				contentsFile: "programs/jspaint/help/mspaint.hhc",
				root: "programs/jspaint/help",
			}).$help_window;
			$help_window.on("close", () => {
				$help_window = null;
			});
		};

		if (file_path) {
			// window.initial_system_file_handle = ...; is too late to set this here
			// contentWindow.open_from_file_handle(...); doesn't exist
			systemHooks.readBlobFromHandle(file_path).then(file => {
				if (file) {
					contentWindow.open_from_file(file, file_path);
				}
			}, (error) => {
				// this handler may not always called for errors, sometimes error message is shown via readBlobFromHandle
				contentWindow.show_error_message(`Failed to open file ${file_path}`, error);
			});
		}

		var old_update_title = contentWindow.update_title;
		contentWindow.update_title = () => {
			old_update_title();
			$win.title(contentWindow.document.title);
		};
	});

	return new Task($win);
}
Paint.acceptsFilePaths = true;

function Minesweeper() {
	var $win = make_iframe_window({
		src: "programs/minesweeper/index.html",
		icons: iconsAtTwoSizes("minesweeper"),
		title: "Minesweeper",
		innerWidth: 280,
		innerHeight: 320 + 21,
		resizable: false,
	});
	return new Task($win);
}

function SoundRecorder(file_path) {
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in make_iframe_window)
	var document_title = file_path ? file_name_from_path(file_path) : "Sound";
	var win_title = document_title + " - Sound Recorder";
	// TODO: focus existing window if file is currently open?
	var $win = make_iframe_window({
		src: "programs/sound-recorder/index.html" + (file_path ? ("?path=" + file_path) : ""),
		icons: iconsAtTwoSizes("speaker"),
		title: win_title,
		innerWidth: 270,
		innerHeight: 108 + 21,
		minInnerWidth: 270,
		minInnerHeight: 108 + 21,
	});
	return new Task($win);
}
SoundRecorder.acceptsFilePaths = true;

function Solitaire() {
	var $win = make_iframe_window({
		src: "programs/js-solitaire/index.html",
		icons: iconsAtTwoSizes("solitaire"),
		title: "Solitaire",
		innerWidth: 585,
		innerHeight: 384 + 21,
	});
	return new Task($win);
}

function showScreensaver(iframeSrc) {
	const mouseDistanceToExit = 15;
	const $iframe = $("<iframe>").attr("src", iframeSrc);
	const $surface = $("<div>"); // interact to close
	$surface.css({
		position: "fixed",
		left: 0,
		top: 0,
		width: "100%",
		height: "100%",
		zIndex: $Window.Z_INDEX + 10000,
		cursor: "none",
		touchAction: "none",
	});
	$iframe.css({
		position: "fixed",
		left: 0,
		top: 0,
		width: "100%",
		height: "100%",
		zIndex: $Window.Z_INDEX + 9999,
		border: 0,
		pointerEvents: "none",
		backgroundColor: "black",
	});
	$surface.appendTo("body");
	$iframe.appendTo("body");
	const cleanUp = () => {
		$surface.remove();
		$iframe.remove();
		const prevent = (event) => {
			event.preventDefault();
		};
		$(window).on("contextmenu", prevent);
		setTimeout(() => {
			$(window).off("contextmenu", prevent);
			window.removeEventListener("keydown", keydownHandler, true);
		}, 500);
	};
	const keydownHandler = (event) => {
		// Trying to let you change the display or capture the output
		// not allowing Ctrl+PrintScreen etc. because no modifiers
		if (!(["F11", "F12", "ZoomToggle", "PrintScreen", "MediaRecord", "BrightnessDown", "BrightnessUp", "Dimmer"].includes(event.key))) {
			event.preventDefault();
			event.stopPropagation();
			cleanUp();
		}
	};
	let startMouseX, startMouseY;
	$surface.on("mousemove pointermove", (event) => {
		if (startMouseX === undefined) {
			startMouseX = event.pageX;
			startMouseY = event.pageY;
		}
		if (Math.hypot(startMouseX - event.pageX, startMouseY - event.pageY) > mouseDistanceToExit) {
			cleanUp();
		}
	});
	$surface.on("mousedown pointerdown touchstart", (event) => {
		event.preventDefault();
		cleanUp();
	});
	// useCapture needed for scenario where you hit Enter, with a desktop icon selected
	// (If it relaunches the screensaver, it's like you can't exit it!)
	window.addEventListener("keydown", keydownHandler, true);
}

function Pipes() {
	const options = { hideUI: true };
	showScreensaver(`programs/pipes/index.html#${encodeURIComponent(JSON.stringify(options))}`);
}

function FlowerBox() {
	showScreensaver("programs/3D-FlowerBox/index.html");
}

function CommandPrompt() {
	var $win = make_iframe_window({
		src: "programs/command/index.html",
		icons: iconsAtTwoSizes("msdos"),
		title: "MS-DOS Prompt",
		// TODO: default dimensions
		innerWidth: 640,
		innerHeight: 400,
		constrainRect(rect, x_axis, y_axis) {
			const char_width = 8;
			const char_height = 16;
			const border = ($win.outerWidth() - $win.$content.outerWidth()) / 2;
			const inner_rect = {
				x: rect.x + border,
				y: rect.y + border + $win.$titlebar.outerHeight(),
				width: rect.width - $win.outerWidth() + $win.$content.outerWidth(),
				height: rect.height - $win.outerHeight() + $win.$content.outerHeight(),
			};
			const new_inner_rect = {
				width: Math.floor(inner_rect.width / char_width) * char_width,
				height: Math.floor(inner_rect.height / char_height) * char_height,
			};
			const new_rect = {
				x: inner_rect.x - border,
				y: inner_rect.y - border - $win.$titlebar.outerHeight(),
				width: new_inner_rect.width + $win.outerWidth() - $win.$content.outerWidth(),
				height: new_inner_rect.height + $win.outerHeight() - $win.$content.outerHeight(),
			};
			if (x_axis === -1) {
				new_rect.x = rect.x + rect.width - new_rect.width;
			}
			if (y_axis === -1) {
				new_rect.y = rect.y + rect.height - new_rect.height;
			}
			return new_rect;
		},
		// TODO: make the API simpler / more flexible like:
		// constrainDimensions({ innerWidth, innerHeight }) {
		// 	const charWidth = 8;
		// 	const charHeight = 16;
		// 	innerWidth = Math.floor(innerWidth / charWidth) * charWidth;
		// 	innerHeight = Math.floor(innerHeight / charHeight) * charHeight;
		// 	return { innerWidth, innerHeight };
		// },
	});
	return new Task($win);
}

function Calculator() {
	var $win = make_iframe_window({
		src: "programs/calculator/index.html",
		icons: iconsAtTwoSizes("calculator"),
		title: "Calculator",
		innerWidth: 256,
		innerHeight: 208 + 21,
		minInnerWidth: 256,
		minInnerHeight: 208 + 21,
	});
	return new Task($win);
}

function News() {
	var $win = make_iframe_window({
		src: "programs/news/index.html",
		icons: iconsAtTwoSizes("help"),
		title: "MCCICTS News",
		innerWidth: 640,
		innerHeight: 460,
		minInnerWidth: 480,
		minInnerHeight: 320,
		resizable: true,
	});
	return new Task($win);
}

function Events() {
	var $win = make_iframe_window({
		src: "programs/events/index.html",
		icons: iconsAtTwoSizes("chm"),
		title: "MCCICTS Events",
		innerWidth: 660,
		innerHeight: 480,
		minInnerWidth: 500,
		minInnerHeight: 340,
		resizable: true,
	});
	return new Task($win);
}

function AdminConsole() {
	var $win = make_iframe_window({
		src: "programs/admin-console/index.html",
		icons: iconsAtTwoSizes("settings"),
		title: "MCCICTS Admin Console",
		innerWidth: 860,
		innerHeight: 580,
		minInnerWidth: 640,
		minInnerHeight: 440,
		resizable: true,
	});
	return new Task($win);
}

// The wallpapers available in the Display Properties → Background tab.
// Paths are URL-encoded because some filenames contain spaces.
var WALLPAPER_CATALOG = [
	{ name: "(None)", src: null, defaultMode: "center" },
	{ name: "MCCICTS Logo", src: "images/wallpapers/wallpaper%20with%20logo.png", defaultMode: "stretch" },
	{ name: "Teal", src: "images/wallpapers/Windows%20Default%20I.png", defaultMode: "stretch" },
	{ name: "MCCICTS Teal", src: "images/wallpapers/mccicts-teal.svg", defaultMode: "stretch" },
];

// Color schemes for the Display Properties → Appearance tab.
var SCHEME_CATALOG = [
	{ name: "MCCICTS Teal", path: "/desktop/Themes/MCCICTS/MCCICTS Teal.theme" },
	{ name: "MCCICTS Navy", path: "/desktop/Themes/MCCICTS/MCCICTS Navy.theme" },
];

function DisplayProperties(initialTab) {
	// Focus an existing Display Properties window instead of opening a duplicate.
	if (DisplayProperties._$win && DisplayProperties._$win.element && document.body.contains(DisplayProperties._$win.element)) {
		DisplayProperties._$win.focus();
		return DisplayProperties._$win.task || null;
	}

	var $win = new $Window({
		title: "Display Properties",
		icons: iconsAtTwoSizes("settings"),
		resizable: false,
		maximizeButton: false,
		minimizeButton: false,
		innerWidth: 400,
		innerHeight: 430,
	});
	DisplayProperties._$win = $win;

	var savedMode = "center";
	var savedName = "";
	try {
		savedMode = localStorage.getItem("wallpaper-mode") || "center";
		savedName = localStorage.getItem("wallpaper-name") || "";
	} catch (e) { /* no local storage */ }

	var html =
		'<div class="display-properties">' +
		'<div class="dp-tabs" role="tablist">' +
		'<button type="button" class="dp-tab selected" data-tab="background">Background</button>' +
		'<button type="button" class="dp-tab" data-tab="screensaver">Screen Saver</button>' +
		'<button type="button" class="dp-tab" data-tab="appearance">Appearance</button>' +
		'<button type="button" class="dp-tab" data-tab="settings">Settings</button>' +
		'</div>' +
		'<div class="dp-page-frame">' +
		// Background page
		'<div class="dp-page" data-tab="background">' +
		'<div class="dp-monitor"><div class="dp-monitor-screen"><div class="dp-screen"></div></div><div class="dp-monitor-stand"></div></div>' +
		'<div class="dp-label">Wallpaper</div>' +
		'<div class="dp-listbox dp-wallpaper-list" tabindex="0"></div>' +
		'<div class="dp-row">' +
		'<span class="dp-display-label">Display:</span>' +
		'<select class="dp-display-mode">' +
		'<option value="center">Center</option>' +
		'<option value="tile">Tile</option>' +
		'<option value="stretch">Stretch</option>' +
		'</select>' +
		'</div>' +
		'</div>' +
		// Appearance page
		'<div class="dp-page" data-tab="appearance" hidden>' +
		'<div class="dp-monitor"><div class="dp-monitor-screen"><div class="dp-appearance-preview">' +
		'<div class="dp-prev-title">Inactive Window</div>' +
		'<div class="dp-prev-title active">Active Window</div>' +
		'<div class="dp-prev-body">Window Text</div>' +
		'</div></div><div class="dp-monitor-stand"></div></div>' +
		'<div class="dp-label">Scheme</div>' +
		'<div class="dp-listbox dp-scheme-list" tabindex="0"></div>' +
		'</div>' +
		// Screen Saver page
		'<div class="dp-page" data-tab="screensaver" hidden>' +
		'<div class="dp-monitor"><div class="dp-monitor-screen"><div class="dp-screen dp-blank"></div></div><div class="dp-monitor-stand"></div></div>' +
		'<p class="dp-placeholder">No screen saver is configured.<br>Screen savers are not available in this environment.</p>' +
		'</div>' +
		// Settings page
		'<div class="dp-page" data-tab="settings" hidden>' +
		'<div class="dp-monitor"><div class="dp-monitor-screen"><div class="dp-screen dp-settings-screen"></div></div><div class="dp-monitor-stand"></div></div>' +
		'<p class="dp-placeholder">Colors: True Color (32 bit)<br>Screen area: your browser window<br><br>Display settings cannot be changed here.</p>' +
		'</div>' +
		'</div>' +
		'</div>';

	var $body = $(html).appendTo($win.$content);

	var $screen = $body.find(".dp-page[data-tab='background'] .dp-screen");
	var $modeSelect = $body.find(".dp-display-mode");
	var $wallList = $body.find(".dp-wallpaper-list");
	var $schemeList = $body.find(".dp-scheme-list");

	// Pending selections (null = not changed by the user this session).
	var chosenWallpaperIndex = null;
	var chosenSchemeIndex = null;

	function previewWallpaper(item, mode) {
		if (!item || !item.src) {
			$screen.css({ backgroundImage: "none" });
			return;
		}
		var css = { backgroundImage: "url('" + item.src + "')", backgroundPosition: "center" };
		if (mode === "tile") {
			css.backgroundRepeat = "repeat";
			css.backgroundSize = "40%";
		} else if (mode === "stretch") {
			css.backgroundRepeat = "no-repeat";
			css.backgroundSize = "100% 100%";
		} else {
			css.backgroundRepeat = "no-repeat";
			css.backgroundSize = "contain";
		}
		$screen.css(css);
	}

	// Build the wallpaper list.
	WALLPAPER_CATALOG.forEach(function (item, index) {
		var $item = $("<div class='dp-list-item'></div>").text(item.name).attr("data-index", index);
		$item.on("click", function () {
			$wallList.find(".dp-list-item").removeClass("selected");
			$item.addClass("selected");
			chosenWallpaperIndex = index;
			$modeSelect.val(item.defaultMode);
			previewWallpaper(item, item.defaultMode);
		});
		$wallList.append($item);
	});

	// Build the scheme list.
	SCHEME_CATALOG.forEach(function (scheme, index) {
		var $item = $("<div class='dp-list-item'></div>").text(scheme.name).attr("data-index", index);
		$item.on("click", function () {
			$schemeList.find(".dp-list-item").removeClass("selected");
			$item.addClass("selected");
			chosenSchemeIndex = index;
		});
		$schemeList.append($item);
	});

	$modeSelect.on("change", function () {
		var idx = chosenWallpaperIndex != null ? chosenWallpaperIndex : 0;
		previewWallpaper(WALLPAPER_CATALOG[idx], $modeSelect.val());
	});

	// Preselect based on saved settings.
	$modeSelect.val(["center", "tile", "stretch"].indexOf(savedMode) >= 0 ? savedMode : "center");
	var savedIndex = WALLPAPER_CATALOG.findIndex(function (w) { return w.name === savedName; });
	if (savedIndex >= 0) {
		$wallList.find(".dp-list-item[data-index='" + savedIndex + "']").addClass("selected");
		previewWallpaper(WALLPAPER_CATALOG[savedIndex], $modeSelect.val());
	} else {
		$wallList.find(".dp-list-item[data-index='0']").addClass("selected");
	}

	// Tab switching.
	$body.find(".dp-tab").on("click", function () {
		var tab = $(this).data("tab");
		$body.find(".dp-tab").removeClass("selected");
		$(this).addClass("selected");
		$body.find(".dp-page").each(function () {
			this.hidden = $(this).data("tab") !== tab;
		});
	});
	if (initialTab) {
		$body.find(".dp-tab[data-tab='" + initialTab + "']").trigger("click");
	}

	function applyChanges() {
		var didSomething = false;
		if (chosenWallpaperIndex != null) {
			var item = WALLPAPER_CATALOG[chosenWallpaperIndex];
			var mode = $modeSelect.val();
			if (!item.src) {
				clearDesktopWallpaper(true);
				try { localStorage.setItem("wallpaper-name", "(None)"); } catch (e) {}
			} else {
				fetch(item.src)
					.then(function (r) { return r.blob(); })
					.then(function (blob) {
						setDesktopWallpaper(blob, mode === "tile" ? "repeat" : "no-repeat", true, mode);
						try { localStorage.setItem("wallpaper-name", item.name); } catch (e) {}
					})
					.catch(function (err) {
						showMessageBox({ iconID: "error", title: "Display Properties", message: "Could not load the wallpaper:\n\n" + err });
					});
			}
			didSomething = true;
		}
		if (chosenSchemeIndex != null && typeof openThemeFile === "function") {
			openThemeFile(SCHEME_CATALOG[chosenSchemeIndex].path);
			didSomething = true;
		}
		return didSomething;
	}

	var $ok = $win.$Button("OK", function () {
		applyChanges();
		$win.close();
	});
	var $cancel = $win.$Button("Cancel", function () {
		$win.close();
	});
	var $apply = $win.$Button("Apply", function () {
		applyChanges();
	});
	$([$ok[0], $cancel[0], $apply[0]]).css({ minWidth: 75, height: 23 });
	var $buttonRow = $("<div class='dp-buttons'></div>").append($ok, $cancel, $apply);
	$win.$content.append($buttonRow);

	$ok.addClass("default").focus();

	$win.on("closed", function () {
		if (DisplayProperties._$win === $win) {
			DisplayProperties._$win = null;
		}
	});

	$win.center();

	var task = new Task($win);
	$win.task = task;
	return task;
}
window.DisplayProperties = DisplayProperties;

function Pinball() {
	var $win = make_iframe_window({
		src: "programs/pinball/space-cadet.html",
		icons: iconsAtTwoSizes("pinball"),
		title: "3D Pinball for Windows - Space Cadet",
		innerWidth: 600,
		innerHeight: 416 + 20, // @TODO: where's this 20 coming from?
		minInnerWidth: 600,
		minInnerHeight: 416 + 20,
		// resizable: false, // @TODO (maybe) once gray maximized button is implemented
		override_alert: false, // to handle the alert as a fatal error, and to compensate for overzealous preventDefault()
	});
	const $splash = $("<div>").css({
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		background: "url(images/pinball-splash.png) no-repeat center center",
		backgroundColor: "black",
		zIndex: $Window.Z_INDEX + 6000,
	}).appendTo("body");
	setTimeout(() => {
		$splash.remove(); // just in case
	}, 5000);
	$win.$content.find("iframe").on("game-loaded", () => { // custom event dispatched from within the iframe
		$splash.remove();
	});
	$win.$content.find("iframe").on("game-load-failed", () => { // custom event dispatched from within the iframe
		$splash.remove();
		// on some systems, if the game fails to load,
		// it may result in the canvas showing through to the desktop behind the browser window
		// let's call it a feature, tie it in thematically,
		// and pretend like we did it on purpose, to baffle and amuse.
		// This happens for me on Chrome on Ubuntu with Xfce, when coming out of suspend.
		// It says "Could not create renderer / Couldn't find matching render driver"
		// It keeps happening with live reload, but stops on a regular reload, or duplicating the tab.
		$win.title("Wormhole Window - Space Cadet");
	});
	return new Task($win);
}

function Explorer(address) {
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in make_iframe_window)
	var document_title = address;
	var win_title = document_title;
	// TODO: focus existing window if folder is currently open
	var $win = make_iframe_window({
		src: "programs/explorer/index.html" + (address ? ("?address=" + encodeURIComponent(address)) : ""),
		icons: iconsAtTwoSizes("folder-open"),
		title: win_title,
		// this is based on one measurement, but it uses different sizes depending on the screen resolution,
		// and may be different for different Explorer window types (Microsoft Internet Explorer, "Exploring", normal Windows Explorer*),
		// and may store the window positions, even for different types or folders, so I might have a non-standard default size measurement.
		// *See different types (resized for posing this screenshot): https://imgur.com/nxAcT9C
		innerWidth: Math.min(856, innerWidth * 0.9),
		innerHeight: Math.min(547, innerHeight * 0.7),
	});
	return new Task($win);
}
Explorer.acceptsFilePaths = true;

var webamp_bundle_loaded = false;
var load_winamp_bundle_if_not_loaded = function (includeButterchurn, callback) {
	// FIXME: webamp_bundle_loaded not actually set to true when loaded
	// TODO: also maybe handle already-loading-but-not-done
	if (webamp_bundle_loaded) {
		callback();
	} else {
		// TODO: parallelize (if possible)
		$.getScript("programs/winamp/lib/webamp.bundle.min.js", () => {
			if (includeButterchurn) {
				$.getScript("programs/winamp/lib/butterchurn.min.js", () => {
					$.getScript("programs/winamp/lib/butterchurnPresets.min.js", () => {
						callback();
					});
				});
			} else {
				callback();
			}
		});
	}
}

// from https://github.com/jberg/butterchurn/blob/master/src/isSupported.js
const isButterchurnSupported = () => {
	const canvas = document.createElement('canvas');
	let gl;
	try {
		gl = canvas.getContext('webgl2');
	} catch (x) {
		gl = null;
	}

	const webGL2Supported = !!gl;
	const audioApiSupported = !!(window.AudioContext || window.webkitAudioContext);

	return webGL2Supported && audioApiSupported;
};

let webamp;
let $webamp;
let winamp_task;
let winamp_interface;
let winamp_loading = false;
// TODO: support opening multiple files at once
function openWinamp(file_path) {
	const filePathToBlob = (file_path) => {
		return new Promise((resolve, reject) => {
			withFilesystem(function () {
				var fs = BrowserFS.BFSRequire("fs");
				fs.readFile(file_path, function (err, buffer) {
					if (err) {
						return reject(err);
					}
					const byte_array = new Uint8Array(buffer);
					const blob = new Blob([byte_array]);
					resolve(blob);
				});
			});
		});
	};

	const filePathToTrack = async (file_path) => {
		const blob = await filePathToBlob(file_path);
		const blob_url = URL.createObjectURL(blob);
		// TODO: revokeObjectURL
		const track = {
			url: blob_url,
			defaultName: file_name_from_path(file_path).replace(/\.[a-z0-9]+$/i, ""),
		};
		return track;
	};

	const whenLoaded = async () => {
		if ($webamp.css("display") === "none") {
			winamp_interface.unminimize();
		}

		winamp_interface.focus();

		if (file_path) {
			if (file_path.match(/(\.wsz|\.zip)$/i)) {
				const blob = await filePathToBlob(file_path);
				const url = URL.createObjectURL(blob);
				webamp.setSkinFromUrl(url);
			} else if (file_path.match(/(\.m3u|\.pls)$/i)) {
				alert("Sorry, we don't support playlists yet.");
			} else {
				const track = await filePathToTrack(file_path);
				webamp.setTracksToPlay([track]);
			}
		}

		winamp_loading = false;
	}
	if (winamp_task) {
		whenLoaded()
		return;
	}
	if (winamp_loading) {
		return; // TODO: queue up files?
	}
	winamp_loading = true;

	// This check creates a WebGL context, so don't do it if you try to open Winamp while it's opening or open.
	// (Otherwise it will lead to "WARNING: Too many active WebGL contexts. Oldest context will be lost.")
	const includeButterchurn = isButterchurnSupported();

	load_winamp_bundle_if_not_loaded(includeButterchurn, function () {
		const webamp_options = {
			initialTracks: [{
				metaData: {
					artist: "Unknown Artist",
					title: "Kids",
				},
				url: "programs/winamp/mp3/Kids.mp3",
				duration: 237.148125,
			}],
			// initialSkin: {
			// 	url: "programs/winamp/skins/base-2.91.wsz",
			// },
			enableHotkeys: true,
			handleTrackDropEvent: (event) =>
				Promise.all(
					dragging_file_paths.map(filePathToTrack)
				),
			// TODO: filePickers
		};
		if (includeButterchurn) {
			webamp_options.__butterchurnOptions = {
				importButterchurn: () => Promise.resolve(window.butterchurn),
				getPresets: () => {
					const presets = window.butterchurnPresets.getPresets();
					return Object.keys(presets).map((name) => {
						return {
							name,
							butterchurnPresetObject: presets[name]
						};
					});
				},
				butterchurnOpen: true,
			};
			webamp_options.__initialWindowLayout = {
				main: { position: { x: 0, y: 0 } },
				equalizer: { position: { x: 0, y: 116 } },
				playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
				milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] }
			};
		}
		webamp = new Webamp(webamp_options);

		var visual_container = document.createElement("div");
		visual_container.classList.add("webamp-visual-container");
		visual_container.style.position = "absolute";
		visual_container.style.left = "0";
		visual_container.style.right = "0";
		visual_container.style.top = "0";
		visual_container.style.bottom = "0";
		visual_container.style.pointerEvents = "none";
		document.body.appendChild(visual_container);
		// Render after the skin has loaded.
		webamp.renderWhenReady(visual_container).then(() => {
			window.console && console.log("Webamp rendered");

			$webamp = $("#webamp");
			// Bring window to front, initially and when clicked
			$webamp.css({
				position: "absolute",
				left: 0,
				top: 0,
				zIndex: $Window.Z_INDEX++
			});

			const $eventTarget = $({});
			const makeSimpleListenable = (name) => {
				return (callback) => {
					const fn = () => {
						callback();
					};
					$eventTarget.on(name, fn);
					const dispose = () => {
						$eventTarget.off(name, fn);
					};
					return dispose;
				};
			};

			winamp_interface = {};
			winamp_interface.onFocus = makeSimpleListenable("focus");
			winamp_interface.onBlur = makeSimpleListenable("blur");
			winamp_interface.onClosed = makeSimpleListenable("closed");
			winamp_interface.getIconAtSize = (target_icon_size) => {
				if (target_icon_size !== 32 && target_icon_size !== 16) {
					target_icon_size = 32;
				}
				const img = document.createElement("img");
				img.src = getIconPath("winamp2", target_icon_size);
				return img;
			};
			winamp_interface.bringToFront = () => {
				$webamp.css({
					zIndex: $Window.Z_INDEX++
				});
			};
			winamp_interface.element = winamp_interface[0] = $webamp[0]; // for checking z-index in window switcher
			winamp_interface.hasClass = (className) => { // also for window switcher (@TODO: clean this stuff up)
				if (className === "focused") {
					return $webamp.hasClass("focused");
				}
				return false;
			};
			winamp_interface.focus = () => {
				if (!$webamp.hasClass("focused")) {
					$webamp.addClass("focused");
					winamp_interface.bringToFront();
					$eventTarget.triggerHandler("focus");
					// @TODO: focus last focused window/control?
					$webamp.find("#main-window [tabindex='-1']").focus();
				}
			};
			winamp_interface.blur = () => {
				if ($webamp.hasClass("focused")) {
					$webamp.removeClass("focused");
					$eventTarget.triggerHandler("blur");
					// TODO: really blur
				}
			};
			winamp_interface.minimize = () => {
				// TODO: are these actually useful or does webamp hide it?
				$webamp.hide();
			};
			winamp_interface.unminimize = () => {
				// more to the point does this work necessarily??
				$webamp.show();
				// $webamp.focus();
			};
			winamp_interface.close = () => {
				// not allowing canceling close event in this case (generally used *by* an application (for "Save changes?"), not outside of it)
				// TODO: probably something like winamp_task.close()
				// winamp_interface.triggerHandler("close");
				// winamp_interface.triggerHandler("closed");
				webamp.dispose();
				$webamp.remove();

				$eventTarget.triggerHandler("closed");

				webamp = null;
				$webamp = null;
				winamp_task = null;
				winamp_interface = null;
			};
			winamp_interface.getTitle = () => {
				let taskTitle = "Winamp 2.91";
				const $cell = $webamp.find(".playlist-track-titles .track-cell.current");
				if ($cell.length) {
					taskTitle = `${$cell.text()} - Winamp`;
					switch (webamp.getMediaStatus()) {
						case "STOPPED":
							taskTitle = `${taskTitle} [Stopped]`
							break;
						case "PAUSED":
							taskTitle = `${taskTitle} [Paused]`
							break;
					}
				}
				return taskTitle;
			};
			winamp_interface.setMinimizeTarget = () => {
				// dummy function; it won't animate to the minimize target anyway
				// (did Winamp on Windows 98 animate minimize/restore?)
			};
			// @TODO: this wasn't supposed to be part of the API, but it's needed for the taskbar
			winamp_interface.on = (event_name, callback) => {
				if (event_name === "title-change") {
					webamp.onTrackDidChange(callback);
				} else if (event_name === "icon-change") {
					// icon will never change
				} else {
					console.warn(`Unsupported event: ${event_name}`);
				}
			};

			mustHaveMethods(winamp_interface, windowInterfaceMethods);

			let raf_id;
			let global_pointerdown;

			winamp_task = new Task(winamp_interface);
			webamp.onClose(function () {
				winamp_interface.close();
				cancelAnimationFrame(raf_id);
				visualizerOverlay.fadeOutAndCleanUp();
			});
			webamp.onMinimize(function () {
				winamp_interface.minimize();
			});

			$webamp.on("focusin", () => {
				winamp_interface.focus();
			});
			$webamp.on("focusout", () => {
				// could use relatedTarget, no?
				if (
					!document.activeElement ||
					!document.activeElement.closest ||
					!document.activeElement.closest("#webamp")
				) {
					winamp_interface.blur();
				}
			});

			const visualizerOverlay = new VisualizerOverlay(
				$webamp.find(".gen-window canvas")[0],
				{ mirror: true, stretch: true },
			);

			// TODO: replace with setInterval
			// Note: can't access butterchurn canvas image data during a requestAnimationFrame here
			// because of double buffering
			const animate = () => {
				const windowElements = $(".os-window, .window:not(.gen-window)").toArray();
				windowElements.forEach(windowEl => {
					if (!windowEl.hasOverlayCanvas) {
						visualizerOverlay.makeOverlayCanvas(windowEl);
						windowEl.hasOverlayCanvas = true;
					}
				});

				if (webamp.getMediaStatus() === "PLAYING") {
					visualizerOverlay.fadeIn();
				} else {
					visualizerOverlay.fadeOut();
				}
				raf_id = requestAnimationFrame(animate);
			};
			raf_id = requestAnimationFrame(animate);

			whenLoaded()
		}, (error) => {
			// TODO: show_error_message("Failed to load Webamp:", error);
			alert("Failed to render Webamp:\n\n" + error);
			console.error(error);
		});
	});
}
openWinamp.acceptsFilePaths = true;

/*
function saveAsDialog(){
	var $win = new $Window();
	$win.title("Save As");
	return $win;
}
function openFileDialog(){
	var $win = new $Window();
	$win.title("Open");
	return $win;
}
*/

function openURLFile(file_path) {
	withFilesystem(function () {
		var fs = BrowserFS.BFSRequire("fs");
		fs.readFile(file_path, "utf8", function (err, content) {
			if (err) {
				return alert(err);
			}
			// it's supposed to be an ini-style file, but lets handle files that are literally just a URL as well, just in case
			var match = content.match(/URL\s*=\s*([^\n\r]+)/i);
			var url = match ? match[1] : content;
			Explorer(url);
		});
	});
}
openURLFile.acceptsFilePaths = true;

function openThemeFile(file_path) {
	if (window.MCCICTSProfile && !MCCICTSProfile.canChangeTheme()) {
		showMessageBox({
			iconID: "warning",
			title: "Access Denied",
			message: "Guests cannot change system themes.\n\nLog on as Administrator to customize the desktop.",
		});
		return;
	}
	withFilesystem(function () {
		var fs = BrowserFS.BFSRequire("fs");
		fs.readFile(file_path, "utf8", function (err, content) {
			if (err) {
				return alert(err);
			}
			loadThemeFromText(content);
			try {
				localStorage.setItem("desktop-theme", content);
				localStorage.setItem("desktop-theme-path", file_path);
			} catch (error) {
				// no local storage
			}
		});
	});
}
openThemeFile.acceptsFilePaths = true;

// Note: extensions must be lowercase here. This is used to implement case-insensitive matching.
var file_extension_associations = {
	// Fonts:
	// - eot (Embedded OpenType)
	// - otf (OpenType)
	// - ttf (TrueType)
	// - woff (Web Open Font Format)
	// - woff2 (Web Open Font Format 2)
	// - (also svg but that's mainly an image format)

	// Misc binary:
	// - wasm (WebAssembly)
	// - o (Object file)
	// - so (Shared Object)
	// - dll (Dynamic Link Library)
	// - exe (Executable file)
	// - a (static library)
	// - lib (static library)
	// - pdb (Program Debug database)
	// - idb (Intermediate Debug file)
	// - bcmap (Binary Character Map)
	// - bin (generic binary file extension)

	// Text:
	"": Notepad, // bare files such as LICENSE, Makefile, CNAME, etc.
	ahk: Notepad,
	ai: Paint,
	bat: Notepad,
	check_cache: Notepad,
	cmake: Notepad,
	cmd: Notepad,
	conf: Notepad,
	cpp: Notepad,
	css: Notepad,
	d: Notepad,
	editorconfig: Notepad,
	filters: Notepad,
	gitattributes: Notepad,
	gitignore: Notepad,
	gitrepo: Notepad,
	h: Notepad,
	hhc: Notepad,
	hhk: Notepad,
	html: Notepad,
	ini: Notepad,
	js: Notepad,
	json: Notepad,
	log: Notepad,
	make: Notepad,
	map: Notepad,
	marks: Notepad,
	md: Notepad,
	prettierignore: Notepad,
	properties: Notepad,
	rc: Notepad,
	rsp: Notepad,
	sh: Notepad,
	ts: Notepad,
	txt: Notepad,
	vcxproj: Notepad,
	webmanifest: Notepad,
	xml: Notepad,
	yml: Notepad,

	// Images:
	bmp: Paint,
	cur: Paint,
	eps: Paint,
	gif: Paint,
	icns: Paint,
	ico: Paint,
	jpeg: Paint,
	jpg: Paint,
	kra: Paint,
	pbm: Paint,
	pdf: Paint, // yes I added PDF support to JS Paint (not all formats listed here are supported though)
	pdn: Paint,
	pgm: Paint,
	png: Paint,
	pnm: Paint,
	ppm: Paint,
	ps: Paint,
	psd: Paint,
	svg: Paint,
	tga: Paint,
	tif: Paint,
	tiff: Paint,
	webp: Paint,
	xbm: Paint,
	xcf: Paint,
	xcfbz2: Paint,
	xcfgz: Paint,
	xpm: Paint,

	// Winamp Skins:
	wsz: openWinamp, // winamp skin zip
	zip: openWinamp, // MIGHT be a winamp skin zip, so might as well for now

	// Audio:
	wav: SoundRecorder,
	mp3: openWinamp,
	ogg: openWinamp,
	wma: openWinamp,
	m4a: openWinamp,
	aac: openWinamp,
	flac: openWinamp,
	mka: openWinamp,
	mpc: openWinamp,
	"mp+": openWinamp,

	// Playlists:
	m3u: openWinamp,
	pls: openWinamp,

	// Misc:
	htm: Explorer,
	html: Explorer,
	url: openURLFile,
	theme: openThemeFile,
	themepack: openThemeFile,
};

// Note: global systemExecuteFile called by explorer
function systemExecuteFile(file_path) {
	// execute file with default handler
	// like the START command in CMD.EXE

	withFilesystem(function () {
		var fs = BrowserFS.BFSRequire("fs");
		fs.stat(file_path, function (err, stats) {
			if (err) {
				return alert("Failed to get info about " + file_path + "\n\n" + err);
			}
			if (stats.isDirectory()) {
				Explorer(file_path);
			} else {
				var file_extension = file_extension_from_path(file_path);
				var program = file_extension_associations[file_extension.toLowerCase()];
				if (program) {
					if (!program.acceptsFilePaths) {
						alert(program.name + " does not support opening files via the virtual filesystem yet");
						return;
					}
					program(file_path);
				} else {
					alert("No program is associated with " + file_extension + " files");
				}
			}
		});
	});
}

// TODO: base all the desktop icons off of the filesystem
// Note: `C:\Windows\Desktop` doesn't contain My Computer, My Documents, Network Neighborhood, Recycle Bin, or Internet Explorer,
// or Connect to the Internet, or Setup MSN Internet Access,
// whereas `Desktop` does (that's the full address it shows; it's one of them "special locations")

(function installGatedPrograms() {
	const programs = {
		Notepad,
		Paint,
		Calculator,
		Minesweeper,
		Solitaire,
		SoundRecorder,
		Pinball,
		openWinamp,
		Pipes,
		FlowerBox,
		CommandPrompt,
		News,
		Events,
		AdminConsole,
		Explorer,
	};
	for (const [name, fn] of Object.entries(programs)) {
		window[name] = MCCICTSProfile.gateProgram(name, fn);
	}
	window.show_help = MCCICTSProfile.gateProgram("show_help", show_help);

	const originals = { Notepad, Paint, SoundRecorder, openWinamp, Explorer, openURLFile, openThemeFile };
	for (const [ext, fn] of Object.entries(file_extension_associations)) {
		for (const [name, original] of Object.entries(originals)) {
			if (fn === original && window[name]) {
				file_extension_associations[ext] = window[name];
				break;
			}
		}
	}
})();

var add_icon_not_via_filesystem = function (options) {
	var item = new FolderViewItem({
		icons: {
			[DESKTOP_ICON_SIZE]: getIconPath(options.iconID, DESKTOP_ICON_SIZE),
		},
		...options,
	});
	if (options.programName) {
		item.element.dataset.programName = options.programName;
	}
	if (options.adminOnly) {
		item.element.dataset.adminOnly = "true";
	}
	folder_view.add_item(item);
};
add_icon_not_via_filesystem({
	title: "My Computer",
	iconID: "my-computer",
	open: function () { systemExecuteFile("/"); },
	// file_path: "/",
	is_system_folder: true,
});
add_icon_not_via_filesystem({
	title: "My Documents",
	iconID: "my-documents-folder",
	open: function () { systemExecuteFile("/my-documents"); },
	// file_path: "/my-documents/",
	is_system_folder: true,
});
add_icon_not_via_filesystem({
	title: "Network Neighborhood",
	iconID: "network",
	open: function () { systemExecuteFile("/network-neighborhood"); },
	// file_path: "/network-neighborhood/",
	is_system_folder: true,
});
add_icon_not_via_filesystem({
	title: "Recycle Bin",
	iconID: "recycle-bin",
	open: function () { Explorer("https://www.epa.gov/recycle/"); },
	is_system_folder: true,
});
add_icon_not_via_filesystem({
	title: "My Pictures",
	iconID: "folder",
	open: function () { systemExecuteFile("/my-pictures"); },
	// file_path: "/my-pictures/",
	is_system_folder: true,
});
add_icon_not_via_filesystem({
	title: "Internet Explorer",
	iconID: "internet-explorer",
	programName: "Explorer",
	open: function () { Explorer("https://www.google.com/"); }
});
add_icon_not_via_filesystem({
	title: "Paint",
	iconID: "paint",
	programName: "Paint",
	open: Paint,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Minesweeper",
	iconID: "minesweeper",
	programName: "Minesweeper",
	open: Minesweeper,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Sound Recorder",
	iconID: "speaker",
	programName: "SoundRecorder",
	open: SoundRecorder,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Solitaire",
	iconID: "solitaire",
	programName: "Solitaire",
	open: Solitaire,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Notepad",
	iconID: "notepad",
	programName: "Notepad",
	open: Notepad,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Winamp",
	iconID: "winamp2",
	programName: "openWinamp",
	open: openWinamp,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "3D Pipes",
	iconID: "pipes",
	programName: "Pipes",
	open: Pipes,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "3D Flower Box",
	iconID: "pipes",
	programName: "FlowerBox",
	open: FlowerBox,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "MS-DOS Prompt",
	iconID: "msdos",
	programName: "CommandPrompt",
	open: CommandPrompt,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Admin Console",
	iconID: "settings",
	programName: "AdminConsole",
	open: AdminConsole,
	shortcut: true,
	adminOnly: true,
});
add_icon_not_via_filesystem({
	title: "MCCICTS News",
	iconID: "help",
	programName: "News",
	open: News,
	shortcut: true,
});
add_icon_not_via_filesystem({
	title: "MCCICTS Events",
	iconID: "chm",
	programName: "Events",
	open: Events,
	shortcut: true,
});
add_icon_not_via_filesystem({
	title: "Calculator",
	iconID: "calculator",
	programName: "Calculator",
	open: Calculator,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Pinball",
	iconID: "pinball",
	programName: "Pinball",
	open: Pinball,
	shortcut: true
});

folder_view.arrange_icons();

(function initStartMenu() {
	const start_menu_programs = {
		Notepad: window.Notepad,
		Paint: window.Paint,
		Calculator: window.Calculator,
		Minesweeper: window.Minesweeper,
		Solitaire: window.Solitaire,
		SoundRecorder: window.SoundRecorder,
		Pinball: window.Pinball,
		openWinamp: window.openWinamp,
		Pipes: window.Pipes,
		CommandPrompt: window.CommandPrompt,
		News: window.News,
		Events: window.Events,
		AdminConsole: window.AdminConsole,
		Explorer: () => Explorer("https://mccicts.lk"),
		show_help: () => window.show_help({ title: "MCCICTS Help" }),
	};

	$(".start-menu [data-program]").on("click", function (e) {
		e.preventDefault();
		const name = $(this).data("program");
		const fn = start_menu_programs[name];
		if (fn) {
			fn();
			close_start_menu();
		}
	});

	$(".start-menu [data-open]").on("click", function (e) {
		e.preventDefault();
		const path = $(this).attr("data-open");
		if (path) {
			systemExecuteFile(path);
			close_start_menu();
		}
	});

	$(".start-menu [data-action='display']").on("click", function (e) {
		e.preventDefault();
		close_start_menu();
		DisplayProperties();
	});

	$(".start-menu [data-action='themes']").on("click", function (e) {
		e.preventDefault();
		if (!MCCICTSProfile.canChangeTheme()) {
			showMessageBox({
				iconID: "warning",
				title: "Access Denied",
				message: "Guests cannot change system themes.\n\nLog on as Administrator to customize the desktop.",
			});
			close_start_menu();
			return;
		}
		systemExecuteFile("/desktop/Themes/MCCICTS");
		close_start_menu();
	});

	$(".start-menu [data-action='logoff']").on("click", function (e) {
		e.preventDefault();
		close_start_menu();
		showMessageBox({
			iconID: "question",
			title: "Log Off Windows",
			message: "Are you sure you want to log off?",
			buttons: [
				{ label: "Yes", value: "yes", default: true },
				{ label: "No", value: "no" },
			],
		}).then((result) => {
			if (result === "yes") {
				MCCICTSProfile.logout();
			}
		});
	});

	$(".start-menu [data-action='shutdown']").on("click", function (e) {
		e.preventDefault();
		close_start_menu();
		showMessageBox({
			iconID: "warning",
			message: "It's now safe to turn off your computer.",
			title: "Shut Down Windows",
		});
	});
})();

function iconsAtTwoSizes(iconID) {
	return {
		16: `images/icons/${iconID}-16x16.png`,
		32: `images/icons/${iconID}-32x32.png`,
	};
}
