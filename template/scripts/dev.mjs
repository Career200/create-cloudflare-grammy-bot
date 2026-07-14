import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const NGROK_API = "http://127.0.0.1:4040/api/tunnels";

function readDevVars() {
  const text = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
  const vars = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (match) vars[match[1]] = match[2];
  }
  return vars;
}

async function getTunnelUrl(port = "8787") {
  const res = await fetch(NGROK_API);
  const { tunnels } = await res.json();
  const tunnel = tunnels.find(
    (t) => t.proto === "https" && t.config?.addr?.endsWith(`:${port}`)
  );
  return tunnel?.public_url;
}

async function waitForTunnel(timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const url = await getTunnelUrl();
      if (url) return url;
    } catch {
      // ngrok API not up yet, wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Timed out waiting for ngrok tunnel");
}

async function registerWebhook(botToken, url) {
  const allowedUpdates = encodeURIComponent(
    JSON.stringify(["message"])
  );
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(url)}&allowed_updates=${allowedUpdates}`
  );
  const body = await res.json();
  if (!body.ok) {
    throw new Error(`setWebhook failed: ${JSON.stringify(body)}`);
  }
  console.log(`Webhook registered: ${url}`);
}

async function main() {
  const { DEV_BOT_TOKEN, NGROK_DOMAIN } = readDevVars();
  if (!DEV_BOT_TOKEN) throw new Error("DEV_BOT_TOKEN missing from .dev.vars");

  let ngrokProcess;
  let tunnelUrl = await getTunnelUrl().catch(() => undefined);

  if (tunnelUrl) {
    console.log("Reusing already-running ngrok tunnel.");
  } else {
    const args = ["http", "8787"];
    if (NGROK_DOMAIN) args.push(`--url=${NGROK_DOMAIN}`);
    ngrokProcess = spawn("ngrok", args, { stdio: "ignore" });
    ngrokProcess.on("error", (err) => {
      console.error(`Failed to start ngrok: ${err.message}`);
      process.exit(1);
    });
    tunnelUrl = await waitForTunnel();
  }

  await registerWebhook(DEV_BOT_TOKEN, tunnelUrl);

  const wrangler = spawn(
    "wrangler",
    ["dev", "--var", `BOT_TOKEN:${DEV_BOT_TOKEN}`, "--var", "MODE:development"],
    { stdio: "inherit" }
  );
  wrangler.on("error", (err) => {
    console.error(`Failed to start wrangler: ${err.message}`);
    ngrokProcess?.kill();
    process.exit(1);
  });

  const cleanup = () => {
    ngrokProcess?.kill();
    wrangler.kill();
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  wrangler.on("exit", (code) => {
    ngrokProcess?.kill();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
