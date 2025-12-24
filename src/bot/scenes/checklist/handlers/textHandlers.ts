// Text handlers for checklist scene
// Currently not needed as all interactions are through inline keyboards

import type { BotContext } from '../../../../types/bot';

/**
 * Handle text input in checklist scene
 * Currently just shows a message that text input is not supported
 */
export async function handleTextInput(ctx: BotContext, _userInput: string) {
  await ctx.reply('Please use the buttons to interact with checklists.');
}
