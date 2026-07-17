# create-cloudflare-grammy-bot

Scaffold a Telegram bot built with [grammY](https://grammy.dev/), deployed as a Cloudflare Worker and driven entirely by webhooks.

## Usage

Requires Node.js >= 22.

```sh
npx create-cloudflare-grammy-bot my-bot
```

(Omit the name to be prompted for one instead.) This installs dependencies, generates Cloudflare Workers types, and runs `git init` for you.

## What you get

- grammY bot on Cloudflare Workers, driven by webhooks
- `/start`, `/help`, and a plain-text echo — a starting point for all your bot logic
- A Vitest test running against the real `workerd` runtime via `@cloudflare/vitest-pool-workers`
- `wrangler dev`/`deploy` scripts, plus an ngrok-based local dev script for testing webhooks without deploying

## Next steps

1. Get a bot token from [@BotFather](https://t.me/BotFather).
2. Create a Cloudflare account (free tier is fine) and run `npx wrangler login`.
3. Deploy: `npm run deploy`.
4. Set the production token: `npx wrangler secret put BOT_TOKEN`.
5. Register the webhook — see the generated project's README "Setup" section for the exact command.

Scaffolding includes local development setup (Cloudflare Workers don't support long-polling, so testing locally means exposing your machine to Telegram's webhook): a script wires up a second bot, an ngrok tunnel, and `wrangler dev` smoothly in one command. See the generated README's "Local development" section.
