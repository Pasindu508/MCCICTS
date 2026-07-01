// Vercel serverless entry point for the MCCICTS API.
//
// Vercel serves the Windows 98 web desktop as static files and routes every
// request under /api/* to this catch-all function. It reuses the exact same
// request handler as the local dev server (server/index.js), so behaviour is
// identical in both environments.
//
// Required Vercel environment variables (Project → Settings → Environment
// Variables):
//   DATABASE_URL    Neon Postgres connection string (for news/events/admin)
//   ADMIN_PASSWORD  Administrator login password
//   SESSION_SECRET  Any long random string used to sign session tokens
const { handleRequest } = require("../server/index.js");

module.exports = (req, res) => handleRequest(req, res);
