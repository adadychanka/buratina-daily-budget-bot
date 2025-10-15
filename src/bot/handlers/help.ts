import type { BotContext } from '../../types/bot';

export const helpHandler = async (ctx: BotContext) => {
  const helpMessage = `
📋 Bot Usage Help

Available commands:
/report - Create a new report
/history - View recent reports
/help - Show this message

📊 Report creation process:
1. Enter numeric data (validated input)
2. Enter text data (optional fields supported)
3. Add expense items (multi-entry support)
4. Enter final values
5. Add notes (optional)
6. Confirm and submit report

❓ If you have questions, contact the administrator.
  `;

  await ctx.reply(helpMessage);
};
