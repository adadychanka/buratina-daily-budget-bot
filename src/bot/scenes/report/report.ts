import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { logger } from '../../../config/logger';
import type { BotContext } from '../../../types/bot';
import { MESSAGES, PROMPTS, REPORT_STEPS, SCENES } from '../../../utils/constants';
import { handleCallbackQuery } from './handlers/callbackHandlers';
import { handleTextInput } from './handlers/textHandlers';
import { calculateCashAmount } from './helpers/calculationHelpers';
import { initializeExpenses } from './helpers/expenseHelpers';

export const reportScene = new Scenes.BaseScene<BotContext>(SCENES.REPORT);

/**
 * Scene entry handler
 */
reportScene.enter(async (ctx) => {
  try {
    // Initialize session
    if (!ctx.session) {
      ctx.session = {};
    }

    // Check if we have partial data and recalculate cashAmount if needed
    if (ctx.session.reportData) {
      const whiteCashAmount = ctx.session.reportData.whiteCashAmount;
      const blackCashAmount = ctx.session.reportData.blackCashAmount;

      // If we have whiteCashAmount or blackCashAmount, recalculate cashAmount
      if (whiteCashAmount !== undefined || blackCashAmount !== undefined) {
        ctx.session.reportData.cashAmount = calculateCashAmount(ctx);
      }
    }

    // Clear any previous report data if starting fresh
    if (!ctx.session.reportData || !ctx.session.step) {
      ctx.session.reportData = {};
      ctx.session.step = REPORT_STEPS.WHITE_CASH_AMOUNT;
      ctx.session.collectingExpense = false;
      ctx.session.currentExpenseAmount = undefined;

      // Initialize expenses array
      initializeExpenses(ctx);

      await ctx.reply(`${MESSAGES.REPORT_START}\n\n${PROMPTS.WHITE_CASH_AMOUNT}`);
    } else {
      // If we're resuming, just show current step prompt
      const currentStep = ctx.session.step;
      if (currentStep === REPORT_STEPS.WHITE_CASH_AMOUNT) {
        await ctx.reply(`${MESSAGES.REPORT_START}\n\n${PROMPTS.WHITE_CASH_AMOUNT}`);
      }
    }

    logger.info(`User ${ctx.from?.id} entered report scene`);
  } catch (error) {
    logger.error('Error in report scene entry:', error);
    await ctx.reply(MESSAGES.ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Cancel command handler
 */
reportScene.command('cancel', async (ctx) => {
  try {
    // Clear session data
    if (ctx.session) {
      ctx.session.reportData = undefined;
      ctx.session.step = undefined;
      ctx.session.collectingExpense = false;
      ctx.session.currentExpenseAmount = undefined;
    }

    await ctx.reply(MESSAGES.REPORT_CANCELLED);
    logger.info(`User ${ctx.from?.id} cancelled report`);
    await ctx.scene.leave();
  } catch (error) {
    logger.error('Error cancelling report:', error);
    await ctx.reply(MESSAGES.ERROR);
    await ctx.scene.leave();
  }
});

/**
 * Skip command handler (for optional fields like notes)
 */
reportScene.command('skip', async (ctx) => {
  try {
    const currentStep = ctx.session?.step;

    // Only allow skipping on notes step
    if (currentStep === REPORT_STEPS.NOTES) {
      await handleTextInput(ctx, 'skip');
    } else {
      await ctx.reply('You can only use /skip for optional fields (like notes).');
    }
  } catch (error) {
    logger.error('Error handling skip command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
});

/**
 * Text input handler
 */
reportScene.on(message('text'), async (ctx) => {
  try {
    const userInput = ctx.message.text;
    await handleTextInput(ctx, userInput);
  } catch (error) {
    logger.error('Error processing text input in report scene:', error);
    await ctx.reply(MESSAGES.REPORT_ERROR);
  }
});

/**
 * Callback query handler (for inline keyboards)
 */
reportScene.on('callback_query', async (ctx) => {
  try {
    await handleCallbackQuery(ctx);
  } catch (error) {
    logger.error('Error processing callback query in report scene:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.REPORT_ERROR);
  }
});
