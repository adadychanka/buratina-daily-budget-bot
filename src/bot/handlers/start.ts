import type { BotContext } from '../../types/bot';
import { BOT_COMMANDS } from '../../utils/constants';

export const startHandler = async (ctx: BotContext) => {
  const firstName = ctx.from?.first_name || 'User';

  const welcomeMessage = `
Hello, ${firstName}! 👋

Welcome to Daily Budget Bot!

I'll help you create and manage daily reports.

Available commands:
${BOT_COMMANDS.REPORT} - Create a new report
${BOT_COMMANDS.CHECKLIST} - View available checklists
${BOT_COMMANDS.HISTORY} - View report history
${BOT_COMMANDS.CASHBOX} - Enter cashbox amount
${BOT_COMMANDS.HELP} - Help

Let's start creating a report? Click ${BOT_COMMANDS.REPORT}
  `;

  await ctx.reply(welcomeMessage);
};
