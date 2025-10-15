import type { BotContext } from '../../types/bot';

export const startHandler = async (ctx: BotContext) => {
  const firstName = ctx.from?.first_name || 'User';

  const welcomeMessage = `
Hello, ${firstName}! 👋

Welcome to Daily Budget Bot!

I'll help you create and manage daily reports.

Available commands:
/report - Create a new report
/history - View report history
/help - Help

Let's start creating a report? Click /report
  `;

  await ctx.reply(welcomeMessage);
};
