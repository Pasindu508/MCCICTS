#!/usr/bin/env node
/**
 * MCCICTS API — news, events, and profile authentication.
 */
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = Number(process.env.API_PORT || 3456);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mccicts-admin";
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 24);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

if (!DATABASE_URL) {
	console.error("DATABASE_URL is required. Copy .env.example to .env and add your Neon connection string.");
	process.exit(1);
}

const { neon } = require("@neondatabase/serverless");
const sql = neon(DATABASE_URL);

/** @type {Map<string, { role: string, displayName: string, expires: number }>} */
const sessions = new Map();

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(res, status, data) {
	res.writeHead(status, { ...corsHeaders, "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

function readBody(req, maxBytes = 1024 * 1024) {
	return new Promise((resolve, reject) => {
		let data = "";
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > maxBytes) {
				reject(new Error("Request body too large"));
				req.destroy();
				return;
			}
			data += chunk;
		});
		req.on("end", () => {
			try {
				resolve(data ? JSON.parse(data) : {});
			} catch (e) {
				reject(new Error("Invalid JSON body"));
			}
		});
		req.on("error", reject);
	});
}

function ensureUploadsDir() {
	for (const folder of ["news", "events"]) {
		fs.mkdirSync(path.join(UPLOADS_DIR, folder), { recursive: true });
	}
}

async function ensureImageColumns() {
	await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT`;
	await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT`;
}

function parseImageDataUrl(dataUrl) {
	const match = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
	if (!match) {
		throw new Error("Invalid image. Use JPEG, PNG, GIF, or WebP.");
	}
	const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
	const buffer = Buffer.from(match[2], "base64");
	if (buffer.length > MAX_UPLOAD_BYTES) {
		throw new Error("Image too large (maximum 5 MB).");
	}
	const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
	return { ext, buffer, mime };
}

function sendFile(res, filePath, contentType) {
	fs.readFile(filePath, (err, data) => {
		if (err) {
			sendJson(res, 404, { error: "File not found" });
			return;
		}
		res.writeHead(200, { ...corsHeaders, "Content-Type": contentType, "Cache-Control": "public, max-age=86400" });
		res.end(data);
	});
}

function createSession(role, displayName) {
	const token = crypto.randomBytes(32).toString("hex");
	sessions.set(token, {
		role,
		displayName,
		expires: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
	});
	return token;
}

function getSession(req) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith("Bearer ")) return null;
	const token = auth.slice(7);
	const session = sessions.get(token);
	if (!session || session.expires < Date.now()) {
		sessions.delete(token);
		return null;
	}
	return { token, ...session };
}

function requireAdmin(req, res) {
	const session = getSession(req);
	if (!session || session.role !== "administrator") {
		sendJson(res, 403, { error: "Administrator access required" });
		return null;
	}
	return session;
}

function todayDateString() {
	return new Date().toISOString().slice(0, 10);
}

function filterNews(rows, params) {
	let result = rows;
	const category = params.get("category");
	const q = params.get("q")?.trim().toLowerCase();
	const featured = params.get("featured");
	const sort = params.get("sort") || "newest";

	if (category) result = result.filter((row) => row.category === category);
	if (featured === "true") result = result.filter((row) => row.is_featured);
	if (q) {
		result = result.filter((row) =>
			row.title.toLowerCase().includes(q) ||
			row.summary.toLowerCase().includes(q) ||
			(row.body && row.body.toLowerCase().includes(q)) ||
			(row.author && row.author.toLowerCase().includes(q))
		);
	}
	return [...result].sort((a, b) => {
		const da = new Date(a.published_at).getTime();
		const db = new Date(b.published_at).getTime();
		return sort === "oldest" ? da - db : db - da;
	});
}

function filterEvents(rows, params) {
	let result = rows;
	const category = params.get("category");
	const q = params.get("q")?.trim().toLowerCase();
	const filter = params.get("filter") || "upcoming";
	const today = todayDateString();

	if (category) result = result.filter((row) => row.category === category);
	if (filter === "upcoming") {
		result = result.filter((row) => String(row.event_date).slice(0, 10) >= today);
	} else if (filter === "past") {
		result = result.filter((row) => String(row.event_date).slice(0, 10) < today);
	}
	if (q) {
		result = result.filter((row) =>
			row.title.toLowerCase().includes(q) ||
			row.description.toLowerCase().includes(q) ||
			(row.location && row.location.toLowerCase().includes(q)) ||
			(row.organizer && row.organizer.toLowerCase().includes(q))
		);
	}
	return [...result].sort((a, b) => {
		const da = String(a.event_date).slice(0, 10);
		const db = String(b.event_date).slice(0, 10);
		return filter === "past" ? db.localeCompare(da) : da.localeCompare(db);
	});
}

async function handleRequest(req, res) {
	if (req.method === "OPTIONS") {
		res.writeHead(204, corsHeaders);
		res.end();
		return;
	}

	const url = new URL(req.url, `http://localhost:${PORT}`);

	try {
		// --- Auth ---
		if (url.pathname === "/api/auth/guest" && req.method === "POST") {
			const token = createSession("guest", "Guest");
			sendJson(res, 200, { token, role: "guest", displayName: "Guest" });
			return;
		}

		if (url.pathname === "/api/auth/admin" && req.method === "POST") {
			const body = await readBody(req);
			if (body.password !== ADMIN_PASSWORD) {
				sendJson(res, 401, { error: "Incorrect administrator password." });
				return;
			}
			const token = createSession("administrator", "Administrator");
			sendJson(res, 200, { token, role: "administrator", displayName: "Administrator" });
			return;
		}

		if (url.pathname === "/api/auth/me" && req.method === "GET") {
			const session = getSession(req);
			if (!session) {
				sendJson(res, 401, { error: "Not authenticated" });
				return;
			}
			sendJson(res, 200, {
				role: session.role,
				displayName: session.displayName,
			});
			return;
		}

		if (url.pathname === "/api/auth/logout" && req.method === "POST") {
			const session = getSession(req);
			if (session) sessions.delete(session.token);
			sendJson(res, 200, { ok: true });
			return;
		}

		// --- Health ---
		if (url.pathname === "/api/health" && req.method === "GET") {
			sendJson(res, 200, { ok: true, service: "mccicts-api" });
			return;
		}

		// --- Uploaded images ---
		if (url.pathname.startsWith("/uploads/") && req.method === "GET") {
			const relative = url.pathname.slice("/uploads/".length);
			if (!relative || relative.includes("..")) {
				sendJson(res, 400, { error: "Invalid path" });
				return;
			}
			const filePath = path.join(UPLOADS_DIR, relative);
			if (!filePath.startsWith(UPLOADS_DIR)) {
				sendJson(res, 400, { error: "Invalid path" });
				return;
			}
			const ext = path.extname(filePath).toLowerCase();
			const types = {
				".jpg": "image/jpeg",
				".jpeg": "image/jpeg",
				".png": "image/png",
				".gif": "image/gif",
				".webp": "image/webp",
			};
			if (!types[ext]) {
				sendJson(res, 404, { error: "Not found" });
				return;
			}
			sendFile(res, filePath, types[ext]);
			return;
		}

		if (url.pathname === "/api/admin/upload" && req.method === "POST") {
			if (!requireAdmin(req, res)) return;
			const body = await readBody(req, MAX_UPLOAD_BYTES * 2);
			const folder = body.folder === "events" ? "events" : "news";
			const { ext, buffer, mime } = parseImageDataUrl(body.dataUrl);
			const filename = `${crypto.randomUUID()}.${ext}`;
			const relativePath = `${folder}/${filename}`;
			const absolutePath = path.join(UPLOADS_DIR, relativePath);
			fs.writeFileSync(absolutePath, buffer);
			sendJson(res, 201, { url: `/uploads/${relativePath}`, contentType: mime });
			return;
		}

		// --- Admin dashboard ---
		if (url.pathname === "/api/admin/stats" && req.method === "GET") {
			if (!requireAdmin(req, res)) return;
			const today = todayDateString();
			const [newsStats] = await sql`
				SELECT
					COUNT(*)::int AS total,
					COUNT(*) FILTER (WHERE is_featured)::int AS featured,
					COUNT(DISTINCT category)::int AS categories
				FROM news
			`;
			const [eventStats] = await sql`
				SELECT
					COUNT(*)::int AS total,
					COUNT(*) FILTER (WHERE event_date >= ${today}::date)::int AS upcoming,
					COUNT(*) FILTER (WHERE event_date < ${today}::date)::int AS past,
					COUNT(DISTINCT category)::int AS categories
				FROM events
			`;
			const recentNews = await sql`
				SELECT id, title, category, published_at, is_featured
				FROM news ORDER BY published_at DESC LIMIT 5
			`;
			const upcomingEvents = await sql`
				SELECT id, title, category, event_date, event_time, location
				FROM events
				WHERE event_date >= ${today}::date
				ORDER BY event_date ASC, event_time ASC NULLS LAST
				LIMIT 5
			`;
			const newsByCategory = await sql`
				SELECT category, COUNT(*)::int AS count
				FROM news GROUP BY category ORDER BY count DESC
			`;
			const eventsByCategory = await sql`
				SELECT category, COUNT(*)::int AS count
				FROM events GROUP BY category ORDER BY count DESC
			`;
			sendJson(res, 200, {
				news: newsStats,
				events: eventStats,
				recentNews,
				upcomingEvents,
				newsByCategory,
				eventsByCategory,
				serverTime: new Date().toISOString(),
			});
			return;
		}

		if (url.pathname === "/api/admin/export" && req.method === "GET") {
			if (!requireAdmin(req, res)) return;
			const news = await sql`
				SELECT id, title, summary, body, category, author, published_at, is_featured, image_url, created_at
				FROM news ORDER BY published_at DESC
			`;
			const events = await sql`
				SELECT id, title, description, location, event_date, event_time, end_time,
				       category, organizer, registration_url, image_url, created_at
				FROM events ORDER BY event_date DESC
			`;
			sendJson(res, 200, {
				exportedAt: new Date().toISOString(),
				news,
				events,
			});
			return;
		}

		// --- News read ---
		const newsIdMatch = url.pathname.match(/^\/api\/news\/(\d+)$/);
		if (newsIdMatch && req.method === "GET") {
			const id = Number(newsIdMatch[1]);
			const [row] = await sql`
				SELECT id, title, summary, body, category, author, published_at, is_featured, image_url
				FROM news WHERE id = ${id}
			`;
			if (!row) {
				sendJson(res, 404, { error: "Article not found" });
				return;
			}
			sendJson(res, 200, row);
			return;
		}

		if (url.pathname === "/api/news/meta/categories" && req.method === "GET") {
			const rows = await sql`SELECT DISTINCT category FROM news ORDER BY category`;
			sendJson(res, 200, rows.map((r) => r.category));
			return;
		}

		if (url.pathname === "/api/news" && req.method === "GET") {
			const rows = await sql`
				SELECT id, title, summary, body, category, author, published_at, is_featured, image_url
				FROM news
			`;
			sendJson(res, 200, filterNews(rows, url.searchParams));
			return;
		}

		// --- News admin ---
		if (url.pathname === "/api/news" && req.method === "POST") {
			if (!requireAdmin(req, res)) return;
			const body = await readBody(req);
			const [row] = await sql`
				INSERT INTO news (title, summary, body, category, author, is_featured, published_at, image_url)
				VALUES (
					${body.title},
					${body.summary},
					${body.body || null},
					${body.category || "General"},
					${body.author || "MCCICTS"},
					${!!body.is_featured},
					${body.published_at || new Date().toISOString()},
					${body.image_url || null}
				)
				RETURNING id, title, summary, body, category, author, published_at, is_featured, image_url
			`;
			sendJson(res, 201, row);
			return;
		}

		if (newsIdMatch && req.method === "PUT") {
			if (!requireAdmin(req, res)) return;
			const id = Number(newsIdMatch[1]);
			const body = await readBody(req);
			const [row] = await sql`
				UPDATE news SET
					title = COALESCE(${body.title}, title),
					summary = COALESCE(${body.summary}, summary),
					body = COALESCE(${body.body}, body),
					category = COALESCE(${body.category}, category),
					author = COALESCE(${body.author}, author),
					is_featured = COALESCE(${body.is_featured}, is_featured),
					published_at = COALESCE(${body.published_at}, published_at),
					image_url = ${Object.prototype.hasOwnProperty.call(body, "image_url") ? (body.image_url || null) : sql`image_url`}
				WHERE id = ${id}
				RETURNING id, title, summary, body, category, author, published_at, is_featured, image_url
			`;
			if (!row) {
				sendJson(res, 404, { error: "Article not found" });
				return;
			}
			sendJson(res, 200, row);
			return;
		}

		if (newsIdMatch && req.method === "DELETE") {
			if (!requireAdmin(req, res)) return;
			const id = Number(newsIdMatch[1]);
			await sql`DELETE FROM news WHERE id = ${id}`;
			sendJson(res, 200, { ok: true });
			return;
		}

		// --- Events read ---
		const eventIdMatch = url.pathname.match(/^\/api\/events\/(\d+)$/);
		if (eventIdMatch && req.method === "GET") {
			const id = Number(eventIdMatch[1]);
			const [row] = await sql`
				SELECT id, title, description, location, event_date, event_time, end_time,
				       category, organizer, registration_url, image_url
				FROM events WHERE id = ${id}
			`;
			if (!row) {
				sendJson(res, 404, { error: "Event not found" });
				return;
			}
			sendJson(res, 200, row);
			return;
		}

		if (url.pathname === "/api/events/meta/categories" && req.method === "GET") {
			const rows = await sql`SELECT DISTINCT category FROM events ORDER BY category`;
			sendJson(res, 200, rows.map((r) => r.category));
			return;
		}

		if (url.pathname === "/api/events" && req.method === "GET") {
			const rows = await sql`
				SELECT id, title, description, location, event_date, event_time, end_time,
				       category, organizer, registration_url, image_url
				FROM events
			`;
			sendJson(res, 200, filterEvents(rows, url.searchParams));
			return;
		}

		// --- Events admin ---
		if (url.pathname === "/api/events" && req.method === "POST") {
			if (!requireAdmin(req, res)) return;
			const body = await readBody(req);
			const [row] = await sql`
				INSERT INTO events (title, description, location, event_date, event_time, end_time, category, organizer, registration_url, image_url)
				VALUES (
					${body.title},
					${body.description},
					${body.location || null},
					${body.event_date},
					${body.event_time || null},
					${body.end_time || null},
					${body.category || "Workshop"},
					${body.organizer || "MCCICTS ICT Society"},
					${body.registration_url || null},
					${body.image_url || null}
				)
				RETURNING id, title, description, location, event_date, event_time, end_time, category, organizer, registration_url, image_url
			`;
			sendJson(res, 201, row);
			return;
		}

		if (eventIdMatch && req.method === "PUT") {
			if (!requireAdmin(req, res)) return;
			const id = Number(eventIdMatch[1]);
			const body = await readBody(req);
			const [row] = await sql`
				UPDATE events SET
					title = COALESCE(${body.title}, title),
					description = COALESCE(${body.description}, description),
					location = COALESCE(${body.location}, location),
					event_date = COALESCE(${body.event_date}, event_date),
					event_time = COALESCE(${body.event_time}, event_time),
					end_time = COALESCE(${body.end_time}, end_time),
					category = COALESCE(${body.category}, category),
					organizer = COALESCE(${body.organizer}, organizer),
					registration_url = COALESCE(${body.registration_url}, registration_url),
					image_url = ${Object.prototype.hasOwnProperty.call(body, "image_url") ? (body.image_url || null) : sql`image_url`}
				WHERE id = ${id}
				RETURNING id, title, description, location, event_date, event_time, end_time, category, organizer, registration_url, image_url
			`;
			if (!row) {
				sendJson(res, 404, { error: "Event not found" });
				return;
			}
			sendJson(res, 200, row);
			return;
		}

		if (eventIdMatch && req.method === "DELETE") {
			if (!requireAdmin(req, res)) return;
			const id = Number(eventIdMatch[1]);
			await sql`DELETE FROM events WHERE id = ${id}`;
			sendJson(res, 200, { ok: true });
			return;
		}

		sendJson(res, 404, { error: "Not found" });
	} catch (error) {
		console.error(error);
		sendJson(res, 500, { error: error.message || "Internal server error" });
	}
}

http.createServer(handleRequest).listen(PORT, async () => {
	ensureUploadsDir();
	try {
		await ensureImageColumns();
	} catch (error) {
		console.warn("Could not verify image_url columns:", error.message);
	}
	console.log(`MCCICTS API → http://localhost:${PORT}`);
	console.log("  Auth: POST /api/auth/guest, /api/auth/admin, GET /api/auth/me");
	console.log("  Admin: GET /api/admin/stats, /api/admin/export, POST /api/admin/upload");
	console.log("  Uploads: GET /uploads/news|events/*");
});
