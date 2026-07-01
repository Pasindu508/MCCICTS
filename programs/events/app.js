(function () {
	const listContainer = document.getElementById("list-container");
	const detailContainer = document.getElementById("detail-container");
	const statusLine = document.getElementById("status-line");
	const searchInput = document.getElementById("search-input");
	const filterSelect = document.getElementById("filter-select");
	const categorySelect = document.getElementById("category-select");
	const calendarBtn = document.getElementById("calendar-btn");
	const registerBtn = document.getElementById("register-btn");

	let events = [];
	let selectedId = null;
	let selectedEvent = null;
	let viewMode = "list";
	let searchTimer = null;

	function setStatus(msg) {
		statusLine.textContent = msg;
	}

	function getQuery() {
		return MCCICTS.buildQuery({
			q: searchInput.value,
			category: categorySelect.value,
			filter: filterSelect.value,
		});
	}

	function countdownLabel(dateStr) {
		const days = MCCICTS.daysUntil(dateStr);
		if (days > 1) return `In ${days} days`;
		if (days === 1) return "Tomorrow";
		if (days === 0) return "Today";
		if (days === -1) return "Yesterday";
		return `${Math.abs(days)} days ago`;
	}

	function monthKey(dateStr) {
		const d = new Date(String(dateStr).slice(0, 10) + "T00:00:00");
		return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
	}

	async function loadCategories() {
		try {
			const categories = await MCCICTS.fetchJson("/api/events/meta/categories");
			const current = categorySelect.value;
			categorySelect.innerHTML = '<option value="">All</option>';
			for (const cat of categories) {
				const opt = document.createElement("option");
				opt.value = cat;
				opt.textContent = cat;
				categorySelect.appendChild(opt);
			}
			categorySelect.value = current;
		} catch (_) { /* optional */ }
	}

	function createListItem(item) {
		const days = MCCICTS.daysUntil(item.event_date);
		const li = document.createElement("li");
		li.className = "list-item" + (item.id === selectedId ? " selected" : "");
		li.dataset.id = item.id;
		li.innerHTML = `
			<div class="list-item-title">${MCCICTS.escapeHtml(item.title)}</div>
			<div class="list-item-meta">
				<span class="badge">${MCCICTS.escapeHtml(item.category)}</span>
				${MCCICTS.formatDate(item.event_date)}
				· ${countdownLabel(item.event_date)}
			</div>
		`;
		li.addEventListener("click", () => selectEvent(item.id));
		return li;
	}

	function renderList() {
		listContainer.innerHTML = "";
		listContainer.classList.toggle("view-mode-month", viewMode === "month");

		if (!events.length) {
			listContainer.innerHTML = '<div class="empty-state">No events match your filters.</div>';
			return;
		}

		if (viewMode === "month") {
			const groups = new Map();
			for (const item of events) {
				const key = monthKey(item.event_date);
				if (!groups.has(key)) groups.set(key, []);
				groups.get(key).push(item);
			}
			for (const [month, items] of groups) {
				const group = document.createElement("div");
				group.className = "month-group";
				group.innerHTML = `<div class="month-heading">${MCCICTS.escapeHtml(month)}</div>`;
				const ul = document.createElement("ul");
				ul.className = "item-list";
				for (const item of items) {
					ul.appendChild(createListItem(item));
				}
				group.appendChild(ul);
				listContainer.appendChild(group);
			}
		} else {
			const ul = document.createElement("ul");
			ul.className = "item-list";
			for (const item of events) {
				ul.appendChild(createListItem(item));
			}
			listContainer.appendChild(ul);
		}
	}

	function formatTimeRange(event) {
		let text = MCCICTS.formatDateTime(event.event_date, event.event_time);
		if (event.end_time) {
			const end = String(event.end_time).slice(0, 5);
			text += " – " + end;
		}
		return text;
	}

	function buildIcs(event) {
		const dateOnly = String(event.event_date).slice(0, 10).replace(/-/g, "");
		const timePart = event.event_time ? String(event.event_time).slice(0, 8).replace(/:/g, "") : null;
		const dtStart = timePart ? dateOnly + "T" + timePart : dateOnly;
		let dtEnd = dtStart;
		if (event.end_time) {
			dtEnd = dateOnly + "T" + String(event.end_time).slice(0, 8).replace(/:/g, "");
		} else if (timePart) {
			const h = Number(String(event.event_time).slice(0, 2)) + 1;
			dtEnd = dateOnly + "T" + String(h).padStart(2, "0") + String(event.event_time).slice(2, 8).replace(/:/g, "");
		}
		const lines = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//MCCICTS//Events//EN",
			"BEGIN:VEVENT",
			"UID:mccicts-event-" + event.id + "@mccicts.lk",
			"DTSTART:" + dtStart,
			"DTEND:" + dtEnd,
			"SUMMARY:" + (event.title || "").replace(/[,;\\]/g, ""),
			"DESCRIPTION:" + (event.description || "").replace(/\n/g, "\\n").replace(/[,;\\]/g, ""),
			"LOCATION:" + (event.location || "").replace(/[,;\\]/g, ""),
			"END:VEVENT",
			"END:VCALENDAR",
		];
		return lines.join("\r\n");
	}

	function downloadIcs(event) {
		const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "mccicts-event-" + event.id + ".ics";
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function renderDetail(event) {
		selectedEvent = event;
		calendarBtn.disabled = !event;
		registerBtn.disabled = !event || !event.registration_url;

		if (!event) {
			detailContainer.innerHTML = '<div class="detail-empty">Select an event to view details.</div>';
			return;
		}

		const days = MCCICTS.daysUntil(event.event_date);
		const countdownClass = days < 0 ? "countdown past" : "countdown";
		const registerBlock = event.registration_url
			? `<a class="button-link outset-deep" href="${MCCICTS.escapeHtml(event.registration_url)}" target="_blank" rel="noopener">Register online</a>`
			: "";

		detailContainer.innerHTML = `
			<div class="${countdownClass}">${MCCICTS.escapeHtml(countdownLabel(event.event_date))}</div>
			<div class="detail-header">
				<h1>${MCCICTS.escapeHtml(event.title)}</h1>
				<div class="detail-meta">
					<span class="badge">${MCCICTS.escapeHtml(event.category)}</span><br>
					<strong>When:</strong> ${formatTimeRange(event)}<br>
					<strong>Where:</strong> ${MCCICTS.escapeHtml(event.location || "TBA")}<br>
					<strong>Organizer:</strong> ${MCCICTS.escapeHtml(event.organizer || "MCCICTS ICT Society")}
				</div>
			</div>
			${event.image_url ? `<img class="detail-photo" src="${MCCICTS.escapeHtml(MCCICTS.mediaUrl(event.image_url))}" alt="">` : ""}
			<div class="detail-body">${MCCICTS.escapeHtml(event.description)}</div>
			<div class="detail-actions">
				<button type="button" id="detail-calendar">Add to Calendar (.ics)</button>
				${registerBlock}
				<a class="button-link outset-deep" href="https://mccicts.lk" target="_blank" rel="noopener">More on mccicts.lk</a>
			</div>
		`;
		document.getElementById("detail-calendar").addEventListener("click", () => downloadIcs(event));
	}

	async function selectEvent(id) {
		selectedId = id;
		renderList();
		try {
			const event = await MCCICTS.fetchJson("/api/events/" + id);
			renderDetail(event);
		} catch (error) {
			detailContainer.innerHTML = `<div class="error-state">${MCCICTS.escapeHtml(error.message)}</div>`;
			selectedEvent = null;
			calendarBtn.disabled = true;
			registerBtn.disabled = true;
		}
	}

	async function loadEvents() {
		setStatus("Loading events…");
		try {
			events = await MCCICTS.fetchJson("/api/events" + getQuery());
			const upcoming = events.filter((e) => MCCICTS.daysUntil(e.event_date) >= 0).length;
			setStatus(`${events.length} event(s) · ${upcoming} upcoming — MCCICTS Events`);
			renderList();
			if (selectedId && events.some((e) => e.id === selectedId)) {
				selectEvent(selectedId);
			} else {
				selectedId = null;
				renderDetail(null);
				if (events.length) {
					selectEvent(events[0].id);
				}
			}
		} catch (error) {
			listContainer.innerHTML = `<div class="error-state">${MCCICTS.escapeHtml(error.message + MCCICTS.apiHint())}</div>`;
			renderDetail(null);
			setStatus("Failed to load events.");
		}
	}

	document.querySelectorAll('input[name="view-mode"]').forEach((radio) => {
		radio.addEventListener("change", () => {
			if (radio.checked) {
				viewMode = radio.value;
				renderList();
			}
		});
	});
	document.getElementById("refresh-btn").addEventListener("click", () => {
		loadCategories();
		loadEvents();
	});
	calendarBtn.addEventListener("click", () => {
		if (selectedEvent) downloadIcs(selectedEvent);
	});
	registerBtn.addEventListener("click", () => {
		if (selectedEvent?.registration_url) {
			window.open(selectedEvent.registration_url, "_blank");
		}
	});
	filterSelect.addEventListener("change", loadEvents);
	categorySelect.addEventListener("change", loadEvents);
	searchInput.addEventListener("input", () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(loadEvents, 300);
	});

	loadCategories();
	loadEvents();
})();
