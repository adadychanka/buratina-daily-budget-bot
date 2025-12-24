import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { logger } from '../../../config/logger';
import type { BotContext } from '../../../types/bot';
import { CHECKLIST_STEPS, MESSAGES, SCENES } from '../../../utils/constants';
import { handleCallbackQuery, loadChecklistNames } from './handlers/callbackHandlers';
import { handleTextInput } from './handlers/textHandlers';
import { getChecklistsKeyboard } from './helpers/messageHelpers';
import {
  clearChecklistData,
  initializeChecklistData,
  setChecklistStep,
} from './helpers/stateHelpers';

export const checklistScene = new Scenes.BaseScene<BotContext>(SCENES.CHECKLIST);

/**
 * Scene entry handler
 */
checklistScene.enter(async (ctx) => {
  try {
    // Initialize checklist data
    initializeChecklistData(ctx);
    setChecklistStep(ctx, CHECKLIST_STEPS.LIST);

    // Load checklist names from Google Sheets
    const checklistNames = await loadChecklistNames(ctx);

    if (checklistNames.length === 0) {
      await ctx.reply('No checklists available.');
      await ctx.scene.leave();
      return;
    }

    // Show list of checklists
    await ctx.reply(MESSAGES.CHECKLIST_LIST, getChecklistsKeyboard(checklistNames));

    logger.info(`User ${ctx.from?.id} entered checklist scene`);
  } catch (error) {
    logger.error('Error in checklist scene entry:', error);
    await ctx.reply(MESSAGES.CHECKLIST_ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Cancel command handler
 */
checklistScene.command('cancel', async (ctx) => {
  try {
    clearChecklistData(ctx);

    await ctx.reply(MESSAGES.CHECKLIST_CANCELLED);
    logger.info(`User ${ctx.from?.id} cancelled checklist`);
    await ctx.scene.leave();
  } catch (error) {
    logger.error('Error cancelling checklist:', error);
    await ctx.reply(MESSAGES.ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Text input handler
 */
checklistScene.on(message('text'), async (ctx) => {
  try {
    const userInput = ctx.message.text;
    await handleTextInput(ctx, userInput);
  } catch (error) {
    logger.error('Error processing text input in checklist scene:', error);
    await ctx.reply(MESSAGES.CHECKLIST_ERROR);
  }
});

/**
 * Callback query handler (for inline keyboards)
 */
checklistScene.on('callback_query', async (ctx) => {
  try {
    await handleCallbackQuery(ctx);
  } catch (error) {
    logger.error('Error processing callback query in checklist scene:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.CHECKLIST_ERROR);
  }
});
