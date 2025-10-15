import type { BotContext } from '../../types/bot';

export const historyHandler = async (ctx: BotContext) => {
  // TODO: Implement history functionality
  // This will be implemented when database integration is added

  const historyMessage = `
📊 Report History

The report history feature will be available after database setup is complete.

For now, you can create new reports using /report command
  `;

  await ctx.reply(historyMessage);
};
