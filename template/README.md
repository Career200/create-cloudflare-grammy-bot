# Cloudflare grammY bot

A Telegram bot built with [grammY](https://grammy.dev/), deployed as a **Cloudflare Worker** and driven entirely by **Telegram webhooks**.

This is a hello-world scaffold: `/start`, `/help`, and a plain-text echo. Everything else — commands, message handling, inline mode, whatever your bot actually does — is yours to build on top of `src/bot`.

## Tech stack

The project structure is the default scaffold produced by `wrangler init` (a plain Cloudflare Worker, TypeScript template); the bot logic itself is implemented with grammY, wired up in `src/bot`.

- **Runtime**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **Bot framework**: [grammY](https://grammy.dev/)
- **Transport**: Telegram Bot API webhooks via grammY's `webhookCallback`
- **Language**: TypeScript
- **Testing**: [Vitest](https://vitest.dev/) + [`@cloudflare/vitest-pool-workers`](https://developers.cloudflare.com/workers/testing/vitest-integration/) (tests run against the actual `workerd` runtime)
- **Tooling**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for local dev (`wrangler dev`) and deployment (`wrangler deploy`)

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
2. Install [ngrok](https://ngrok.com/) and, optionally, reserve a static domain (free tier supports one) so the webhook URL doesn't change between runs.
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

## Features

Bot responds to:

1. `/start` - welcome message
2. `/help` or `/commands` - list available commands
3. Any other text - echoed back

Replace `registerChatHandlers` in `src/bot/modes/chat.ts` with your own bot logic.
