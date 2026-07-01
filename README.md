
# MCCICTS — Mayurapada Central College ICT Society

[![Website](https://img.shields.io/badge/website-mccicts.lk-008080)](https://mccicts.lk)

The official web desktop for **Mayurapada Central College ICT Society (MCCICTS)** — a Windows 98-inspired interactive portal for students, members, and visitors.

Empowering the next generation of digital leaders through innovation, technology, and collaborative learning at Mayurapada Central College, Narammala, Sri Lanka.

## Try it out

Open the desktop locally with `npm start`, then visit [http://localhost:1998](http://localhost:1998).

You will see a **Windows 98-style logon screen** with two profiles:

| Profile | Access |
|--------|--------|
| **Guest** | Full desktop (Paint, Notepad, Winamp, themes, wallpapers, file drop) — no Admin Console |
| **Administrator** | Everything Guest has, plus **Admin Console** for managing news & events |

Default administrator password (local dev): **`142536`** — set `ADMIN_PASSWORD` in `.env` to change it.

Production site: [https://mccicts.lk](https://mccicts.lk)

## What's included

Classic Windows 98 applications recreated for the web:

* Notepad, Sound Recorder, Paint, Calculator
* Minesweeper, Solitaire, 3D Pinball, Winamp
* Windows Explorer / Internet Explorer
* 3D Pipes, 3D FlowerBox, Help Viewer, Clippy

## Features

* Drop files onto the desktop — they're stored in a virtual filesystem
* Load Windows themes from the Themes folder on the desktop
* Easter eggs (try a famous cheat code)
* Help Topics in Paint, Sound Recorder, Notepad, and Minesweeper
* Add to your homescreen on mobile

## About MCCICTS

The ICT Society focuses on:

* Web Development (React, Next.js, TypeScript)
* UI/UX Design
* Cyber Security & digital safety
* Mobile Apps, AI/ML, Robotics, and Graphic Design

**College:** [Mayurapada Central College](https://mayurapada.lk) — Giriulla Educational Zone, Kurunegala District

## News & Events (Neon Database)

Society news and upcoming events are stored in **Neon Postgres** and served via a small API.

### Setup

1. Create a Neon project at [console.neon.tech](https://console.neon.tech) (or use the existing `mccicts` project).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Neon connection string.
3. Apply the schema: run `db/schema.sql` in the Neon SQL Editor (or use the Neon MCP).
4. Run `npm install` then `npm start` (starts the desktop on port **1998** and the API on **3456**).

### Deploying to Vercel

The desktop's static files are served directly, and the API runs as a single
serverless function (`api/[...path].js`) that reuses the same request handler as
the local server. In production the client calls the API on the same origin
(`https://your-domain/api/...`), so no separate API host is needed.

In **Project → Settings → Environment Variables**, set:

- `DATABASE_URL` — Neon Postgres connection string
- `ADMIN_PASSWORD` — administrator login password
- `SESSION_SECRET` — a long random string used to sign session tokens
  (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

Session tokens are **stateless** (HMAC-signed), so login works across serverless
invocations. Note: admin image uploads write to the local filesystem and are not
persistent on Vercel's ephemeral serverless filesystem.

### Desktop apps

- **MCCICTS News** — search, category filter, featured filter, sort, split-pane reader, print
- **MCCICTS Events** — upcoming/past/all, search, calendar export (.ics), registration links, countdown

Open from desktop icons, Start menu, or system tray.

### API endpoints

- `GET /api/news` — `?q=&category=&featured=true&sort=newest|oldest`
- `GET /api/news/:id` — single article
- `GET /api/news/meta/categories`
- `GET /api/events` — `?q=&category=&filter=upcoming|past|all`
- `GET /api/events/:id` — single event
- `GET /api/events/meta/categories`
- `GET /api/health`
- `POST /api/auth/guest` — guest session token
- `POST /api/auth/admin` — `{ "password": "..." }` → administrator token
- `GET /api/auth/me` — validate Bearer token
- `GET /api/admin/stats` — dashboard statistics (administrator only)
- `GET /api/admin/export` — full news + events backup (administrator only)
- `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` — administrator only

### Admin Console

Log on as **Administrator**, then open **Admin Console** from the desktop or Start menu.

- **Dashboard** — article/event counts, recent news, upcoming events, category breakdown
- **News & Events** — search, filters, bulk delete, duplicate, live preview, featured toggle, publish date
- **System** — API health check, session info, full JSON backup export

## User profiles

Sessions are stored in `sessionStorage` and validated against the API. Use **Log Off** in the Start menu to return to the logon screen.

- **Guest** has the same desktop experience as Administrator except **Admin Console** and API content management.
- **Administrator** can create, edit, and delete news and events via the Admin Console.

## Development Setup

- Install [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/)
- Clone this repository
- Run `npm install`
- Install global dependency: `npm i -g browserfs@2.0.0`
- Run `npm start` for a live-reloading dev server on port 1998

When pulling changes, run `npm install` again if dependencies changed.

### Quality Assurance

```
npm test
npm run lint
```

## Credits

Individual apps and libraries are credited in `desktop/CREDITS.txt`.

**MCCICTS** — [mccicts.lk](https://mccicts.lk)

## License

See `LICENSE` and `desktop/CREDITS.txt` for licensing and attribution details.
