#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const candidates = [
	path.join(__dirname, "..", "node_modules", "browserfs", "dist", "scripts", "make_http_index.js"),
	path.join(execSync("npm root -g", { encoding: "utf8" }).trim(), "browserfs", "dist", "scripts", "make_http_index.js"),
];

const script = candidates.find((p) => fs.existsSync(p));
if (!script) {
	console.error("Could not find browserfs make_http_index.js. Run: npm i -g browserfs@2.0.0");
	process.exit(1);
}

const index = execSync(`node "${script}"`, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
process.stdout.write(index);
