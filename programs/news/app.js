(function () {
	const articleList = document.getElementById("article-list");
	const detailContainer = document.getElementById("detail-container");
	const statusLine = document.getElementById("status-line");
	const searchInput = document.getElementById("search-input");
	const categorySelect = document.getElementById("category-select");
	const sortSelect = document.getElementById("sort-select");
	const featuredBtn = document.getElementById("featured-btn");
	const printBtn = document.getElementById("print-btn");
	const webBtn = document.getElementById("web-btn");

	let articles = [];
	let selectedId = null;
	let currentArticle = null;
	let featuredOnly = false;
	let searchTimer = null;

	function setStatus(msg) {
		statusLine.textContent = msg;
	}

	function getQuery() {
		return MCCICTS.buildQuery({
			q: searchInput.value,
			category: categorySelect.value,
			sort: sortSelect.value,
			featured: featuredOnly || undefined,
		});
	}

	async function loadCategories() {
		try {
			const categories = await MCCICTS.fetchJson("/api/news/meta/categories");
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

	function renderList() {
		articleList.innerHTML = "";
		if (!articles.length) {
			articleList.innerHTML = '<li class="empty-state">No articles match your filters.</li>';
			return;
		}
		for (const item of articles) {
			const li = document.createElement("li");
			li.className = "list-item" +
				(item.is_featured ? " featured" : "") +
				(item.id === selectedId ? " selected" : "");
			li.dataset.id = item.id;
			li.innerHTML = `
				<div class="list-item-title">${MCCICTS.escapeHtml(item.title)}</div>
				<div class="list-item-meta">
					${item.is_featured ? '<span class="badge featured-badge">Featured</span>' : ""}
					<span class="badge">${MCCICTS.escapeHtml(item.category)}</span>
					${MCCICTS.formatDate(item.published_at)}
				</div>
			`;
			li.addEventListener("click", () => selectArticle(item.id));
			articleList.appendChild(li);
		}
	}

	function renderDetail(article) {
		currentArticle = article;
		if (!article) {
			detailContainer.innerHTML = '<div class="detail-empty">Select an article to read.</div>';
			printBtn.disabled = true;
			webBtn.disabled = true;
			return;
		}
		printBtn.disabled = false;
		webBtn.disabled = false;
		detailContainer.innerHTML = `
			<div class="detail-header">
				<h1>${MCCICTS.escapeHtml(article.title)}</h1>
				<div class="detail-meta">
					${article.is_featured ? '<span class="badge featured-badge">Featured</span>' : ""}
					<span class="badge">${MCCICTS.escapeHtml(article.category)}</span><br>
					<strong>Published:</strong> ${MCCICTS.formatDate(article.published_at)}<br>
					<strong>Author:</strong> ${MCCICTS.escapeHtml(article.author || "MCCICTS")}
				</div>
				<p><em>${MCCICTS.escapeHtml(article.summary)}</em></p>
			</div>
			${article.image_url ? `<img class="detail-photo" src="${MCCICTS.escapeHtml(MCCICTS.mediaUrl(article.image_url))}" alt="">` : ""}
			<div class="detail-body">${MCCICTS.escapeHtml(article.body || "No additional content.")}</div>
			<div class="detail-actions">
				<button type="button" id="detail-print">Print Article</button>
				<a class="button-link outset-deep" href="https://mccicts.lk" target="_blank" rel="noopener">Visit mccicts.lk</a>
			</div>
		`;
		document.getElementById("detail-print").addEventListener("click", () => printArticle(article));
	}

	async function selectArticle(id) {
		selectedId = id;
		renderList();
		try {
			const article = await MCCICTS.fetchJson("/api/news/" + id);
			renderDetail(article);
		} catch (error) {
			detailContainer.innerHTML = `<div class="error-state">${MCCICTS.escapeHtml(error.message)}</div>`;
		}
	}

	function printArticle(article) {
		const w = window.open("", "_blank");
		if (!w) return;
		w.document.write(`
			<!DOCTYPE html><html><head><title>${MCCICTS.escapeHtml(article.title)}</title>
			<style>body{font-family:Tahoma,sans-serif;max-width:700px;margin:2em auto;line-height:1.5}
			h1{font-size:1.4em}.meta{color:#666;font-size:0.9em;margin-bottom:1.5em}
			.photo{max-width:100%;height:auto;margin:1em 0}</style></head><body>
			<h1>${MCCICTS.escapeHtml(article.title)}</h1>
			<p class="meta">${MCCICTS.escapeHtml(article.category)} · ${MCCICTS.formatDate(article.published_at)} · ${MCCICTS.escapeHtml(article.author || "MCCICTS")}</p>
			${article.image_url ? `<img class="photo" src="${MCCICTS.escapeHtml(MCCICTS.mediaUrl(article.image_url))}" alt="">` : ""}
			<p><strong>${MCCICTS.escapeHtml(article.summary)}</strong></p>
			<div>${MCCICTS.escapeHtml(article.body || "").replace(/\n/g, "<br>")}</div>
			<p style="margin-top:2em;font-size:0.85em;color:#666">MCCICTS — Mayurapada Central College ICT Society</p>
			</body></html>
		`);
		w.document.close();
		w.print();
	}

	async function loadArticles() {
		setStatus("Loading articles…");
		try {
			articles = await MCCICTS.fetchJson("/api/news" + getQuery());
			const featured = articles.filter((a) => a.is_featured).length;
			setStatus(`${articles.length} article(s)${featured ? ` · ${featured} featured` : ""} — MCCICTS News`);
			renderList();
			if (selectedId && articles.some((a) => a.id === selectedId)) {
				selectArticle(selectedId);
			} else {
				selectedId = null;
				renderDetail(null);
				if (articles.length) {
					selectArticle(articles[0].id);
				}
			}
		} catch (error) {
			articleList.innerHTML = `<li class="error-state">${MCCICTS.escapeHtml(error.message + MCCICTS.apiHint())}</li>`;
			renderDetail(null);
			setStatus("Failed to load news.");
		}
	}

	featuredBtn.addEventListener("click", () => {
		featuredOnly = !featuredOnly;
		featuredBtn.classList.toggle("active", featuredOnly);
		loadArticles();
	});
	document.getElementById("refresh-btn").addEventListener("click", () => {
		loadCategories();
		loadArticles();
	});
	printBtn.addEventListener("click", () => {
		if (currentArticle) printArticle(currentArticle);
	});
	webBtn.addEventListener("click", () => window.open("https://mccicts.lk", "_blank"));
	categorySelect.addEventListener("change", loadArticles);
	sortSelect.addEventListener("change", loadArticles);
	searchInput.addEventListener("input", () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(loadArticles, 300);
	});

	loadCategories();
	loadArticles();
})();
