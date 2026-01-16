import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { logger } from '../../../config/logger';
import type { BotContext } from '../../../types/bot';
import { CASHBOX_STEPS, MESSAGES, PROMPTS, SCENES } from '../../../utils/constants';
import { handleCallbackQuery } from './handlers/callbackHandlers';
import { handleTextInput } from './handlers/textHandlers';
import { getDateSelectionKeyboard } from './helpers/messageHelpers';

export const cashboxScene = new Scenes.BaseScene<BotContext>(SCENES.CASHBOX);

/**
 * Scene entry handler
 */
cashboxScene.enter(async (ctx) => {
  try {
    // Initialize session
    if (!ctx.session) {
      ctx.session = {};
    }

    // Clear previous data
    ctx.session.cashboxData = undefined;
    ctx.session.step = CASHBOX_STEPS.DATE;

    // Show date selection
    await ctx.reply(MESSAGES.CASHBOX_START);
    await ctx.reply(PROMPTS.CASHBOX_DATE, getDateSelectionKeyboard());

    logger.info(`User ${ctx.from?.id} entered cashbox scene`);
  } catch (error) {
    logger.error('Error in cashbox scene entry:', error);
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Cancel command handler
 */
cashboxScene.command('cancel', async (ctx) => {
  try {
    if (ctx.session) {
      ctx.session.cashboxData = undefined;
      ctx.session.step = undefined;
    }

    await ctx.reply(MESSAGES.CASHBOX_CANCELLED);
    logger.info(`User ${ctx.from?.id} cancelled cashbox`);
    await ctx.scene.leave();
  } catch (error) {
    logger.error('Error cancelling cashbox:', error);
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Text input handler
 */
cashboxScene.on(message('text'), async (ctx) => {
  try {
    await handleTextInput(ctx, ctx.message.text);
  } catch (error) {
    logger.error('Error processing text in cashbox scene:', error);
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
  }
});

/**
 * Callback query handler
 */
cashboxScene.on('callback_query', async (ctx) => {
  try {
    await handleCallbackQuery(ctx);
  } catch (error) {
    logger.error('Error processing callback in cashbox scene:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
  }
});
