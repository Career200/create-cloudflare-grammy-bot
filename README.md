# create-cloudflare-grammy-bot

Scaffold a Telegram bot built with [grammY](https://grammy.dev/), deployed as a Cloudflare Worker and driven entirely by webhooks.

## Prerequisites

- Node.js >= 22
- A Cloudflare account (free tier is fine)
- A bot token from [@BotFather](https://t.me/BotFather)

## Usage

```sh
npx create-cloudflare-grammy-bot
```

You'll be prompted for a package name; that name becomes both the project folder and the `package.json`/`wrangler.jsonc` name, so folder and package can never drift apart. Pass a name as an argument to skip the prompt:

```sh
npx create-cloudflare-grammy-bot my-bot
```

The command installs dependencies, generates Cloudflare Workers types, and runs `git init` for you.

## What you get

- grammY bot on Cloudflare Workers, driven by webhooks
- `/start`, `/help`, and a plain-text echo — a starting point for all your bot logic
- A Vitest test running against the real `workerd` runtime via `@cloudflare/vitest-pool-workers`
- `wrangler dev`/`deploy` scripts, plus an ngrok-based local dev script for testing webhooks without deploying
