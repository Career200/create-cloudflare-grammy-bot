import type { Bot } from "grammy";

export const helpText =
  "This bot responds to:\n\n" +
  "/start - Welcome message\n" +
  "/help - Show this help message\n\n" +
  "Send any other text and the bot will echo it back.";

export const registerChatHandlers = (bot: Bot) => {
  bot.command("start", async (ctx) => {
    await ctx.reply(`Welcome! Use /help to see available commands.`);
  });

  bot.command(["help", "commands"], async (ctx) => {
    await ctx.reply(helpText);
  });

  bot.on(":text", async (ctx) => {
    if (!ctx.message?.text) return; // not possible from :text - type guard

    await ctx.reply(`You said: ${ctx.message.text}`);
  });
};
