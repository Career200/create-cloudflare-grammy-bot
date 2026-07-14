# Cloudflare grammY bot

A Telegram bot built with [grammY](https://grammy.dev/), deployed as a Cloudflare Worker, driven entirely by webhooks (no polling).

This is a hello-world scaffold: `/start`, `/help`, and a plain-text echo, wired up in `src/bot`. For everything past that — commands, message handling, keyboards, sessions, whatever your bot actually does — reference [grammY docs](https://grammy.dev/).

## Setup

1. Get a bot token from [@BotFather](https://t.me/BotFather).
2. `npm install`
3. `npx wrangler login` (once, to authenticate with your Cloudflare account)
4. Provide the token: for production, `npx wrangler secret put BOT_TOKEN`. For local dev, see [Local development](#local-development) below.
5. Ship with `npm run deploy`.
6. Register the production webhook once, pointing at your deployed Worker URL:
   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>"
   ```

See the [grammY Cloudflare Workers guide](https://grammy.dev/hosting/cloudflare-workers-nodejs) for more details on [debugging](https://grammy.dev/hosting/cloudflare-workers-nodejs#debugging-your-bot), and background on building a Cloudflare worker bot from scratch.

## Local development

Local dev talks to Telegram through a tunnel, so it needs its own bot — reusing the production `BOT_TOKEN` would mean testing against the live bot, and `wrangler dev` never reads secrets from Cloudflare anyway (`env.BOT_TOKEN` only comes from `.dev.vars` or an explicit `--var`).

1. Create a second bot with [@BotFather](https://t.me/BotFather) dedicated to local testing.
2. Install [ngrok](https://ngrok.com/) and authenticate it once with `ngrok config add-authtoken <token>` (from your [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken) — a free account is enough; ngrok refuses to start tunnels without this). Optionally, reserve a static domain (free tier supports one) so the webhook URL doesn't change between runs.
3. Copy `.dev.vars.example` to `.dev.vars` (gitignored) and fill in:
   ```
   DEV_BOT_TOKEN=<your dev bot's token>
   NGROK_DOMAIN=<your reserved domain, optional>
   ```
4. Run `npm run dev`. This runs `scripts/dev.mjs`, which:
   - starts ngrok on port 8787 (or reuses one already running),
   - registers that tunnel URL as the dev bot's webhook via `setWebhook`,
   - starts `wrangler dev` with `BOT_TOKEN` set to `DEV_BOT_TOKEN` and `MODE=development`, so the Worker answers as the dev bot.

   Use `npm run dev:worker` instead if you just want plain `wrangler dev` without the ngrok/webhook automation.

Running in dev mode (`MODE=development`) also logs every incoming `ctx.message` to the console before any handler runs, to make it easier to inspect what Telegram actually sent.
