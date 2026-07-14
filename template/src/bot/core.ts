import { Bot } from "grammy";
import { registerChatHandlers } from "./modes/chat.ts";

export const createBot = (token: string, isDev: boolean = false) => {
  const bot = new Bot(token);

  if (isDev) {
    bot.use(async (ctx, next) => {
      console.log(ctx.message);
      await next();
    });
  }

  registerChatHandlers(bot);

  return bot;
};
