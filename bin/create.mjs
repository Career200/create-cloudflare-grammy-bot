#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const PLACEHOLDER_NAME = "my-tg-cloudflare-bot";
const EXCLUDED_ENTRIES = new Set([
  "node_modules",
  ".git",
  ".wrangler",
  "dist",
  "worker-configuration.d.ts"
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.join(scriptDir, "..", "template");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const defaultName = process.argv[2] ?? PLACEHOLDER_NAME;
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (
  await rl.question(`Package name (${defaultName}): `)
).trim();
rl.close();
const packageName = answer || defaultName;

// The folder always matches the package name, so the two never drift apart.
const targetDir = path.resolve(process.cwd(), packageName);

if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
  fail(`"${packageName}" already exists and isn't empty. Pick another name or clear it out first.`);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (source) => !EXCLUDED_ENTRIES.has(path.basename(source))
});

const pkgPath = path.join(targetDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.name = packageName;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const wranglerPath = path.join(targetDir, "wrangler.jsonc");
const wrangler = fs.readFileSync(wranglerPath, "utf8");
fs.writeFileSync(
  wranglerPath,
  wrangler.replace(`"name": "${PLACEHOLDER_NAME}"`, `"name": "${packageName}"`)
);

console.log(`\nScaffolded ${packageName} in ${targetDir}\n`);

console.log("Installing dependencies (npm install)...");
const install = spawnSync("npm", ["install"], { cwd: targetDir, stdio: "inherit" });
if (install.status !== 0) fail("npm install failed.");

console.log("\nGenerating Cloudflare Workers types (npm run cf-typegen)...");
const typegen = spawnSync("npm", ["run", "cf-typegen"], { cwd: targetDir, stdio: "inherit" });
if (typegen.status !== 0) fail("npm run cf-typegen failed.");

console.log("\nInitializing git repository...");
const gitInit = spawnSync("git", ["init"], { cwd: targetDir, stdio: "inherit" });
if (gitInit.status !== 0) fail("git init failed.");

console.log(`
Next steps:

  cd ${packageName}

  1. Get a bot token from @BotFather (https://t.me/BotFather).
  2. Create a Cloudflare account and run: npx wrangler login
  3. Deploy: npm run deploy
  4. Set the production token: npx wrangler secret put BOT_TOKEN
  5. Register the webhook (see README.md "Setup" section for the exact curl command).

For local development (a second bot + ngrok tunnel), see the README's
"Local development" section and .dev.vars.example. Note: ngrok requires a
one-time \`ngrok config add-authtoken <token>\` (free account) before it
will start tunnels.
`);
