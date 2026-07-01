(function () {
	const msgbox = (opts) => {
		if (typeof showMessageBox === "function") return showMessageBox(opts);
		if (window.parent && typeof window.parent.showMessageBox === "function") {
			return window.parent.showMessageBox(opts);
		}
		alert(opts.message || opts.title || "Error");
		return Promise.resolve();
	};

	if (!MCCICTS.isAdmin()) {
		document.getElementById("access-denied").hidden = false;
		document.querySelectorAll(".panel, .filter-bar").forEach((el) => { el.hidden = true; });
		document.getElementById("status-line").textContent = "Access denied.";
		return;
	}

	const panels = {
		dashboard: document.getElementById("panel-dashboard"),
		records: document.getElementById("panel-records"),
		system: document.getElementById("panel-system"),
	};
	const recordList = document.getElementById("record-list");
	const editForm = document.getElementById("edit-form");
	const formTitle = document.getElementById("form-title");
	const statusLine = document.getElementById("status-line");
	const deleteBtn = document.getElementById("delete-btn");
	const duplicateBtn = document.getElementById("duplicate-btn");
	const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
	const openPublicBtn = document.getElementById("open-public-btn");
	const toggleFeaturedBtn = document.getElementById("toggle-featured-btn");
	const previewPane = document.getElementById("preview-pane");
	const previewContent = document.getElementById("preview-content");
	const filterFeaturedWrap = document.getElementById("filter-featured-wrap");
	const filterEventWrap = document.getElementById("filter-event-wrap");
	const filterSortWrap = document.getElementById("filter-sort-wrap");

	let section = "dashboard";
	let crudSection = "news";
	let records = [];
	let selectedId = null;
	const selectedIds = new Set();
	let categories = [];

	const newsFields = [
		{ name: "title", label: "Title", type: "text", required: true },
		{ name: "summary", label: "Summary", type: "textarea", required: true },
		{ name: "image_url", label: "Photo", type: "image" },
		{ name: "body", label: "Body", type: "textarea", rows: 6 },
		{ name: "category", label: "Category", type: "category", default: "General" },
		{ name: "author", label: "Author", type: "text", default: "MCCICTS" },
		{ name: "published_at", label: "Published", type: "datetime-local" },
		{ name: "is_featured", label: "Featured article (homepage highlight)", type: "checkbox" },
	];

	const eventFields = [
		{ name: "title", label: "Title", type: "text", required: true },
		{ name: "image_url", label: "Photo", type: "image" },
		{ name: "description", label: "Description", type: "textarea", required: true, rows: 5 },
		{ name: "location", label: "Location", type: "text" },
		{ name: "event_date", label: "Date", type: "date", required: true },
		{ name: "event_time", label: "Start time", type: "time" },
		{ name: "end_time", label: "End time", type: "time" },
		{ name: "category", label: "Category", type: "category", default: "Workshop" },
		{ name: "organizer", label: "Organizer", type: "text", default: "MCCICTS ICT Society" },
		{ name: "registration_url", label: "Registration URL", type: "url" },
	];

	function fields() {
		return crudSection === "news" ? newsFields : eventFields;
	}

	function apiPath(suffix = "") {
		return "/api/" + crudSection + suffix;
	}

	function setStatus(msg) {
		statusLine.textContent = msg;
	}

	function showPanel(name) {
		section = name;
		panels.dashboard.hidden = name !== "dashboard";
		panels.records.hidden = name !== "news" && name !== "events";
		panels.system.hidden = name !== "system";
		if (name === "news" || name === "events") {
			crudSection = name;
			syncCrudUi();
			loadCategories();
			loadRecords();
		}
		if (name === "dashboard") loadDashboard();
		if (name === "system") loadSystemPanel();
	}

	function syncCrudUi() {
		document.getElementById("list-title").textContent =
			crudSection === "news" ? "News articles" : "Events";
		filterFeaturedWrap.hidden = crudSection !== "news";
		filterEventWrap.hidden = crudSection !== "events";
		filterSortWrap.hidden = crudSection === "events";
		toggleFeaturedBtn.hidden = crudSection !== "news";
		selectedId = null;
		selectedIds.clear();
		document.getElementById("select-all").checked = false;
		updateActionButtons();
		renderForm({});
	}

	function updateActionButtons() {
		deleteBtn.disabled = !selectedId;
		duplicateBtn.disabled = !selectedId;
		openPublicBtn.disabled = !selectedId;
		bulkDeleteBtn.disabled = selectedIds.size === 0;
	}

	function toDatetimeLocal(iso) {
		if (!iso) return "";
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return "";
		const pad = (n) => String(n).padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function fromDatetimeLocal(value) {
		if (!value) return null;
		return new Date(value).toISOString();
	}

	function renderForm(record = {}) {
		editForm.innerHTML = "";
		selectedId = record.id || null;
		updateActionButtons();
		formTitle.textContent = selectedId
			? `Edit ${crudSection.slice(0, -1)} #${selectedId}`
			: `New ${crudSection.slice(0, -1)}`;
		previewPane.hidden = true;

		for (const field of fields()) {
			const wrap = document.createElement("div");
			const id = "field-" + field.name;
			if (field.type === "checkbox") {
				wrap.className = "checkbox-row";
				wrap.innerHTML = `
					<input type="checkbox" id="${id}" name="${field.name}" ${record[field.name] ? "checked" : ""}>
					<label for="${id}">${MCCICTS.escapeHtml(field.label)}</label>
				`;
			} else if (field.type === "textarea") {
				wrap.innerHTML = `
					<label for="${id}">${MCCICTS.escapeHtml(field.label)}</label>
					<textarea id="${id}" name="${field.name}" rows="${field.rows || 3}" ${field.required ? "required" : ""}>${MCCICTS.escapeHtml(record[field.name] || "")}</textarea>
				`;
			} else if (field.type === "category") {
				const value = record[field.name] || field.default || "";
				const options = [...new Set([...categories, value].filter(Boolean))]
					.map((c) => `<option value="${MCCICTS.escapeHtml(c)}" ${c === value ? "selected" : ""}>${MCCICTS.escapeHtml(c)}</option>`)
					.join("");
				wrap.innerHTML = `
					<label for="${id}">${MCCICTS.escapeHtml(field.label)}</label>
					<input type="text" id="${id}" name="${field.name}" list="category-suggestions" value="${MCCICTS.escapeHtml(value)}" ${field.required ? "required" : ""}>
					<datalist id="category-suggestions">${options}</datalist>
				`;
			} else if (field.type === "image") {
				const imageUrl = record[field.name] || "";
				const previewSrc = imageUrl ? MCCICTS.mediaUrl(imageUrl) : "";
				wrap.className = "image-field";
				wrap.innerHTML = `
					<label for="${id}-file">${MCCICTS.escapeHtml(field.label)}</label>
					<input type="hidden" id="${id}" name="${field.name}" value="${MCCICTS.escapeHtml(imageUrl)}">
					<div class="image-upload-row">
						<input type="file" id="${id}-file" accept="image/jpeg,image/png,image/gif,image/webp">
						<button type="button" class="image-clear-btn" ${imageUrl ? "" : "disabled"}>Remove photo</button>
					</div>
					<div class="image-preview-wrap" ${previewSrc ? "" : "hidden"}>
						<img class="image-preview" id="${id}-preview" src="${MCCICTS.escapeHtml(previewSrc)}" alt="Photo preview">
					</div>
					<div class="image-upload-status" id="${id}-status"></div>
				`;
				const hidden = wrap.querySelector(`#${id}`);
				const fileInput = wrap.querySelector(`#${id}-file`);
				const preview = wrap.querySelector(`#${id}-preview`);
				const previewWrap = wrap.querySelector(".image-preview-wrap");
				const statusEl = wrap.querySelector(`#${id}-status`);
				const clearBtn = wrap.querySelector(".image-clear-btn");
				clearBtn.addEventListener("click", () => {
					hidden.value = "";
					fileInput.value = "";
					preview.removeAttribute("src");
					previewWrap.hidden = true;
					clearBtn.disabled = true;
					statusEl.textContent = "Photo removed. Save to apply.";
				});
				fileInput.addEventListener("change", async () => {
					const file = fileInput.files?.[0];
					if (!file) return;
					if (file.size > 5 * 1024 * 1024) {
						statusEl.textContent = "Image must be 5 MB or smaller.";
						fileInput.value = "";
						return;
					}
					statusEl.textContent = "Uploading photo…";
					clearBtn.disabled = true;
					try {
						const result = await MCCICTS.uploadImage(file, crudSection);
						hidden.value = result.url;
						preview.src = MCCICTS.mediaUrl(result.url);
						previewWrap.hidden = false;
						clearBtn.disabled = false;
						statusEl.textContent = "Photo uploaded. Save to keep changes.";
					} catch (error) {
						statusEl.textContent = error.message;
						fileInput.value = "";
					}
				});
			} else {
				let value = record[field.name] || field.default || "";
				let type = field.type;
				if (field.name === "event_date" && value) value = String(value).slice(0, 10);
				if ((field.name === "event_time" || field.name === "end_time") && value) {
					value = String(value).slice(0, 5);
				}
				if (field.name === "published_at") {
					type = "datetime-local";
					value = toDatetimeLocal(record.published_at);
				}
				wrap.innerHTML = `
					<label for="${id}">${MCCICTS.escapeHtml(field.label)}</label>
					<input type="${type}" id="${id}" name="${field.name}" value="${MCCICTS.escapeHtml(value)}"
						${field.required ? "required" : ""}>
				`;
			}
			editForm.appendChild(wrap);
		}
	}

	function buildQuery() {
		const params = {};
		const q = document.getElementById("filter-search").value.trim();
		const category = document.getElementById("filter-category").value;
		if (q) params.q = q;
		if (category) params.category = category;
		if (crudSection === "news") {
			params.sort = document.getElementById("filter-sort").value;
			if (document.getElementById("filter-featured").checked) params.featured = "true";
		} else {
			params.filter = document.getElementById("filter-event-when").value;
		}
		return MCCICTS.buildQuery(params);
	}

	function renderList() {
		recordList.innerHTML = "";
		if (!records.length) {
			recordList.innerHTML = '<li class="empty-state">No matching records.</li>';
			return;
		}
		for (const item of records) {
			const li = document.createElement("li");
			li.className = "list-item" + (item.id === selectedId ? " selected" : "");
			const subtitle = crudSection === "news"
				? MCCICTS.formatDate(item.published_at) + " · " + item.category
				: String(item.event_date).slice(0, 10) + " · " + (item.location || item.category);
			const featured = crudSection === "news" && item.is_featured
				? '<span class="featured-badge">★</span>' : "";
			li.innerHTML = `
				<input type="checkbox" class="row-check" data-id="${item.id}" ${selectedIds.has(item.id) ? "checked" : ""}>
				<div class="row-body">
					<div class="list-item-title">${MCCICTS.escapeHtml(item.title)}${featured}</div>
					<div class="list-item-meta">${MCCICTS.escapeHtml(subtitle)}</div>
				</div>
			`;
			li.querySelector(".row-check").addEventListener("click", (e) => {
				e.stopPropagation();
				const id = item.id;
				if (selectedIds.has(id)) selectedIds.delete(id);
				else selectedIds.add(id);
				updateActionButtons();
			});
			li.querySelector(".row-body").addEventListener("click", () => {
				selectedId = item.id;
				renderList();
				renderForm(item);
			});
			recordList.appendChild(li);
		}
	}

	function formData() {
		const data = {};
		for (const field of fields()) {
			const el = editForm.elements[field.name];
			if (!el) continue;
			if (field.type === "checkbox") {
				data[field.name] = el.checked;
			} else if (field.name === "published_at") {
				data.published_at = fromDatetimeLocal(el.value);
			} else if (field.type === "image") {
				data[field.name] = el.value.trim() || null;
			} else {
				data[field.name] = el.value.trim();
			}
		}
		if (crudSection === "events") {
			if (!data.event_time) data.event_time = null;
			if (!data.end_time) data.end_time = null;
			if (!data.registration_url) data.registration_url = null;
		}
		return data;
	}

	async function loadCategories() {
		try {
			categories = await MCCICTS.fetchJson("/api/" + crudSection + "/meta/categories");
			const sel = document.getElementById("filter-category");
			const current = sel.value;
			sel.innerHTML = '<option value="">All</option>' +
				categories.map((c) => `<option value="${MCCICTS.escapeHtml(c)}">${MCCICTS.escapeHtml(c)}</option>`).join("");
			sel.value = current;
		} catch (_) { /* optional */ }
	}

	async function loadRecords() {
		if (section !== "news" && section !== "events") return;
		setStatus("Loading…");
		try {
			records = await MCCICTS.fetchJson(apiPath() + buildQuery());
			setStatus(`${records.length} ${crudSection} record(s) — Administrator Console`);
			renderList();
		} catch (e) {
			recordList.innerHTML = `<li class="error-state">${MCCICTS.escapeHtml(e.message)}</li>`;
			setStatus("Load failed.");
		}
	}

	async function loadDashboard() {
		setStatus("Loading dashboard…");
		try {
			const stats = await MCCICTS.fetchJson("/api/admin/stats");
			document.getElementById("stats-grid").innerHTML = `
				<div class="stat-card inset-deep"><div class="stat-value">${stats.news.total}</div><div class="stat-label">News articles</div></div>
				<div class="stat-card inset-deep"><div class="stat-value">${stats.news.featured}</div><div class="stat-label">Featured</div></div>
				<div class="stat-card inset-deep"><div class="stat-value">${stats.events.total}</div><div class="stat-label">Events</div></div>
				<div class="stat-card inset-deep"><div class="stat-value">${stats.events.upcoming}</div><div class="stat-label">Upcoming</div></div>
				<div class="stat-card inset-deep"><div class="stat-value">${stats.events.past}</div><div class="stat-label">Past events</div></div>
				<div class="stat-card inset-deep"><div class="stat-value">${stats.news.categories + stats.events.categories}</div><div class="stat-label">Categories</div></div>
			`;

			const newsList = document.getElementById("dash-recent-news");
			newsList.innerHTML = stats.recentNews.length
				? stats.recentNews.map((n) => `
					<li data-section="news" data-id="${n.id}">
						<strong>${MCCICTS.escapeHtml(n.title)}</strong>${n.is_featured ? " ★" : ""}
						<div class="dash-meta">${MCCICTS.escapeHtml(n.category)} · ${MCCICTS.formatDate(n.published_at)}</div>
					</li>`).join("")
				: '<li class="empty-state">No news yet.</li>';

			const eventsList = document.getElementById("dash-upcoming-events");
			eventsList.innerHTML = stats.upcomingEvents.length
				? stats.upcomingEvents.map((e) => `
					<li data-section="events" data-id="${e.id}">
						<strong>${MCCICTS.escapeHtml(e.title)}</strong>
						<div class="dash-meta">${String(e.event_date).slice(0, 10)} · ${MCCICTS.escapeHtml(e.location || e.category)}</div>
					</li>`).join("")
				: '<li class="empty-state">No upcoming events.</li>';

			document.getElementById("category-breakdown").innerHTML = `
				<div><strong>News</strong><ul>${stats.newsByCategory.map((r) =>
					`<li>${MCCICTS.escapeHtml(r.category)} (${r.count})</li>`).join("") || "<li>—</li>"}</ul></div>
				<div><strong>Events</strong><ul>${stats.eventsByCategory.map((r) =>
					`<li>${MCCICTS.escapeHtml(r.category)} (${r.count})</li>`).join("") || "<li>—</li>"}</ul></div>
			`;

			newsList.querySelectorAll("li[data-id]").forEach((li) => {
				li.addEventListener("click", () => jumpToRecord(li.dataset.section, Number(li.dataset.id)));
			});
			eventsList.querySelectorAll("li[data-id]").forEach((li) => {
				li.addEventListener("click", () => jumpToRecord(li.dataset.section, Number(li.dataset.id)));
			});

			setStatus(`Dashboard updated — ${stats.news.total} articles, ${stats.events.upcoming} upcoming events`);
		} catch (e) {
			setStatus("Dashboard load failed: " + e.message);
		}
	}

	function jumpToRecord(sec, id) {
		document.querySelector(`.tab[data-section="${sec}"]`).click();
		loadRecords().then(() => {
			const item = records.find((r) => r.id === id);
			if (item) {
				selectedId = id;
				renderList();
				renderForm(item);
			}
		});
	}

	async function loadSystemPanel() {
		document.getElementById("session-info").innerHTML = `
			<dt>Role</dt><dd>${MCCICTS.escapeHtml(MCCICTS.getUserRole() || "—")}</dd>
			<dt>API base</dt><dd>${MCCICTS.escapeHtml(MCCICTS.apiBase() || "(same origin)")}</dd>
			<dt>Token</dt><dd>${MCCICTS.getAuthToken() ? "Active (Bearer)" : "None"}</dd>
		`;
		await runHealthCheck();
	}

	async function runHealthCheck() {
		const el = document.getElementById("health-info");
		el.innerHTML = "<dd>Checking…</dd>";
		try {
			const health = await MCCICTS.fetchJson("/api/health");
			el.innerHTML = `
				<dt>Status</dt><dd style="color: green">● Online</dd>
				<dt>Service</dt><dd>${MCCICTS.escapeHtml(health.service)}</dd>
				<dt>Checked</dt><dd>${new Date().toLocaleString()}</dd>
			`;
		} catch (e) {
			el.innerHTML = `
				<dt>Status</dt><dd style="color: maroon">● Offline</dd>
				<dt>Error</dt><dd>${MCCICTS.escapeHtml(e.message)}</dd>
			`;
		}
	}

	async function saveRecord(e) {
		e.preventDefault();
		const data = formData();
		try {
			if (selectedId) {
				await MCCICTS.fetchJson(apiPath("/" + selectedId), {
					method: "PUT",
					body: JSON.stringify(data),
				});
				setStatus("Saved changes to #" + selectedId);
			} else {
				const created = await MCCICTS.fetchJson(apiPath(), {
					method: "POST",
					body: JSON.stringify(data),
				});
				selectedId = created.id;
				setStatus(`Created ${crudSection.slice(0, -1)} #${created.id}`);
			}
			await loadRecords();
			const updated = records.find((r) => r.id === selectedId);
			if (updated) renderForm(updated);
		} catch (e) {
			msgbox({ iconID: "error", title: "Save Failed", message: e.message });
		}
	}

	async function deleteRecord() {
		if (!selectedId) return;
		if (!confirm("Delete this record permanently?")) return;
		await deleteIds([selectedId]);
	}

	async function deleteIds(ids) {
		try {
			for (const id of ids) {
				await MCCICTS.fetchJson(apiPath("/" + id), { method: "DELETE" });
			}
			if (selectedId && ids.includes(selectedId)) {
				selectedId = null;
				renderForm({});
			}
			ids.forEach((id) => selectedIds.delete(id));
			await loadRecords();
			setStatus(`Deleted ${ids.length} record(s).`);
			updateActionButtons();
		} catch (e) {
			msgbox({ iconID: "error", title: "Delete Failed", message: e.message });
		}
	}

	async function duplicateRecord() {
		if (!selectedId) return;
		const record = records.find((r) => r.id === selectedId);
		if (!record) return;
		const data = { ...record };
		delete data.id;
		delete data.created_at;
		data.title = data.title + " (Copy)";
		if (crudSection === "news") {
			data.is_featured = false;
			data.published_at = new Date().toISOString();
		}
		try {
			const created = await MCCICTS.fetchJson(apiPath(), {
				method: "POST",
				body: JSON.stringify(data),
			});
			selectedId = created.id;
			await loadRecords();
			renderForm(created);
			setStatus(`Duplicated as #${created.id}`);
		} catch (e) {
			msgbox({ iconID: "error", title: "Duplicate Failed", message: e.message });
		}
	}

	async function toggleFeatured() {
		if (!selectedId || crudSection !== "news") return;
		const record = records.find((r) => r.id === selectedId);
		if (!record) return;
		try {
			await MCCICTS.fetchJson(apiPath("/" + selectedId), {
				method: "PUT",
				body: JSON.stringify({ is_featured: !record.is_featured }),
			});
			await loadRecords();
			const updated = records.find((r) => r.id === selectedId);
			if (updated) renderForm(updated);
			setStatus(updated.is_featured ? "Marked as featured." : "Removed from featured.");
		} catch (e) {
			msgbox({ iconID: "error", title: "Update Failed", message: e.message });
		}
	}

	function showPreview() {
		const data = formData();
		previewPane.hidden = false;
		if (crudSection === "news") {
			const photo = data.image_url
				? `<img class="preview-photo" src="${MCCICTS.escapeHtml(MCCICTS.mediaUrl(data.image_url))}" alt="">`
				: "";
			previewContent.innerHTML = `
				${photo}
				<h3>${MCCICTS.escapeHtml(data.title || "Untitled")}</h3>
				<div class="preview-meta">${MCCICTS.escapeHtml(data.author || "")} · ${MCCICTS.escapeHtml(data.category || "")}${data.is_featured ? " · ★ Featured" : ""}</div>
				<p><strong>${MCCICTS.escapeHtml(data.summary || "")}</strong></p>
				<div>${MCCICTS.escapeHtml(data.body || "").replace(/\n/g, "<br>")}</div>
			`;
		} else {
			const photo = data.image_url
				? `<img class="preview-photo" src="${MCCICTS.escapeHtml(MCCICTS.mediaUrl(data.image_url))}" alt="">`
				: "";
			previewContent.innerHTML = `
				${photo}
				<h3>${MCCICTS.escapeHtml(data.title || "Untitled")}</h3>
				<div class="preview-meta">${MCCICTS.formatDateTime(data.event_date, data.event_time)} · ${MCCICTS.escapeHtml(data.location || "TBA")}</div>
				<p>${MCCICTS.escapeHtml(data.description || "").replace(/\n/g, "<br>")}</p>
				${data.registration_url ? `<p><a href="${MCCICTS.escapeHtml(data.registration_url)}" target="_blank" rel="noopener">Register</a></p>` : ""}
			`;
		}
	}

	function openInPublicApp() {
		const opener = window.parent;
		if (!opener) return;
		if (crudSection === "news" && typeof opener.News === "function") opener.News();
		else if (crudSection === "events" && typeof opener.Events === "function") opener.Events();
		else msgbox({ iconID: "info", title: "Open App", message: "Open MCCICTS News or Events from the desktop." });
	}

	function downloadJson(filename, data) {
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function exportSection() {
		downloadJson(`mccicts-${crudSection}-${new Date().toISOString().slice(0, 10)}.json`, {
			exportedAt: new Date().toISOString(),
			section: crudSection,
			records,
		});
		setStatus(`Exported ${records.length} ${crudSection} record(s).`);
	}

	async function exportAll() {
		try {
			const data = await MCCICTS.fetchJson("/api/admin/export");
			downloadJson(`mccicts-backup-${new Date().toISOString().slice(0, 10)}.json`, data);
			setStatus(`Full backup: ${data.news.length} news, ${data.events.length} events.`);
		} catch (e) {
			msgbox({ iconID: "error", title: "Export Failed", message: e.message });
		}
	}

	document.querySelectorAll(".toolbar .tab").forEach((btn) => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".toolbar .tab").forEach((b) => {
				b.classList.toggle("active", b === btn);
			});
			showPanel(btn.dataset.section);
		});
	});

	document.getElementById("refresh-btn").addEventListener("click", () => {
		if (section === "dashboard") loadDashboard();
		else if (section === "system") loadSystemPanel();
		else loadRecords();
	});

	document.getElementById("filter-apply-btn").addEventListener("click", loadRecords);
	document.getElementById("filter-search").addEventListener("keydown", (e) => {
		if (e.key === "Enter") loadRecords();
	});

	document.getElementById("select-all").addEventListener("change", (e) => {
		selectedIds.clear();
		if (e.target.checked) records.forEach((r) => selectedIds.add(r.id));
		renderList();
		updateActionButtons();
	});

	document.getElementById("new-btn").addEventListener("click", () => {
		selectedId = null;
		renderForm({});
		renderList();
	});
	document.getElementById("clear-btn").addEventListener("click", () => renderForm({}));
	document.getElementById("duplicate-btn").addEventListener("click", duplicateRecord);
	document.getElementById("delete-btn").addEventListener("click", deleteRecord);
	document.getElementById("bulk-delete-btn").addEventListener("click", () => {
		if (!selectedIds.size) return;
		if (!confirm(`Delete ${selectedIds.size} selected record(s) permanently?`)) return;
		deleteIds([...selectedIds]);
	});
	document.getElementById("preview-btn").addEventListener("click", showPreview);
	document.getElementById("open-public-btn").addEventListener("click", openInPublicApp);
	document.getElementById("toggle-featured-btn").addEventListener("click", toggleFeatured);
	document.getElementById("export-section-btn").addEventListener("click", exportSection);
	document.getElementById("export-all-btn").addEventListener("click", exportAll);
	document.getElementById("health-check-btn").addEventListener("click", runHealthCheck);
	document.getElementById("reload-dashboard-btn").addEventListener("click", loadDashboard);
	editForm.addEventListener("submit", saveRecord);

	showPanel("dashboard");
})();
