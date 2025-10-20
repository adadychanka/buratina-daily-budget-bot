import { logger } from '../../../../config/logger';
import type { BotContext } from '../../../../types/bot';
import { CALLBACKS, MESSAGES, PROMPTS, REPORT_STEPS } from '../../../../utils/constants';
import { formatAmount } from '../../../../utils/formatters';
import {
  clearExpenseCollection,
  initializeExpenses,
  startExpenseCollection,
} from '../helpers/expenseHelpers';
import { getWeekdayFromCallback } from '../helpers/messageHelpers';

/**
 * Handle weekday selection for black cash location
 */
export async function handleWeekdaySelection(ctx: BotContext, callbackData: string) {
  const weekday = getWeekdayFromCallback(callbackData);

  if (!weekday) {
    await ctx.answerCbQuery('Invalid selection');
    return;
  }

  // Get the black cash amount from session
  const blackCashAmount = ctx.session.reportData?.blackCashAmount ?? 0;

  if (ctx.session.reportData) {
    ctx.session.reportData.blackCashLocation = weekday;
  }
  ctx.session.step = REPORT_STEPS.CARD_SALES_AMOUNT;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `✅ Black Cash location saved\n\n🖤 Black Cash: ${formatAmount(blackCashAmount)}\n📍 Location: ${weekday}\n\n${PROMPTS.CARD_SALES_AMOUNT}`
  );

  logger.info(
    `User ${ctx.from?.id} selected black cash location: ${weekday} for amount: ${blackCashAmount}`
  );
}

/**
 * Handle "Add Expense" button
 */
export async function handleExpenseAdd(ctx: BotContext) {
  initializeExpenses(ctx);
  startExpenseCollection(ctx);

  await ctx.answerCbQuery();
  await ctx.editMessageText(PROMPTS.EXPENSE_AMOUNT);

  logger.info(`User ${ctx.from?.id} started adding expense`);
}

/**
 * Handle "Skip Expenses" button
 */
export async function handleExpenseSkip(ctx: BotContext) {
  initializeExpenses(ctx);
  ctx.session.step = REPORT_STEPS.CASHBOX_AMOUNT;

  await ctx.answerCbQuery();
  await ctx.editMessageText(`⏭️ Expenses skipped\n\n${PROMPTS.CASHBOX_AMOUNT}`);

  logger.info(`User ${ctx.from?.id} skipped expenses`);
}

/**
 * Handle "Add Another Expense" button
 */
export async function handleExpenseAnother(ctx: BotContext) {
  startExpenseCollection(ctx);

  await ctx.answerCbQuery();
  await ctx.editMessageText(PROMPTS.EXPENSE_AMOUNT);

  logger.info(`User ${ctx.from?.id} adding another expense`);
}

/**
 * Handle "Done with Expenses" button
 */
export async function handleExpenseDone(ctx: BotContext) {
  clearExpenseCollection(ctx);
  ctx.session.step = REPORT_STEPS.CASHBOX_AMOUNT;

  await ctx.answerCbQuery();
  await ctx.editMessageText(`✅ Expenses saved\n\n${PROMPTS.CASHBOX_AMOUNT}`);

  logger.info(`User ${ctx.from?.id} finished adding expenses`);
}

/**
 * Handle "Confirm Report" button
 */
export async function handleConfirmReport(ctx: BotContext) {
  await ctx.answerCbQuery();
  await ctx.editMessageText('✅ Report confirmed and saved!\n\n(Database integration coming soon)');

  logger.info(`User ${ctx.from?.id} confirmed report:`, ctx.session.reportData);

  // Clear session and exit scene
  ctx.session.reportData = undefined;
  ctx.session.step = undefined;
  await ctx.scene.leave();
}

/**
 * Handle "Edit Report" button
 */
export async function handleEditReport(ctx: BotContext) {
  await ctx.answerCbQuery('Edit feature coming soon!');
  await ctx.reply(
    '✏️ Edit feature is not yet implemented.\n\nFor now, please use /cancel to start over if you need to make changes.'
  );

  logger.info(`User ${ctx.from?.id} requested to edit report`);
}

/**
 * Handle "Cancel Report" button
 */
export async function handleCancelReport(ctx: BotContext) {
  await ctx.answerCbQuery();
  await ctx.editMessageText(MESSAGES.REPORT_CANCELLED);

  // Clear session and exit scene
  ctx.session.reportData = undefined;
  ctx.session.step = undefined;
  clearExpenseCollection(ctx);
  await ctx.scene.leave();

  logger.info(`User ${ctx.from?.id} cancelled report from confirmation`);
}

/**
 * Main callback query handler dispatcher
 */
export async function handleCallbackQuery(ctx: BotContext) {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : null;

  if (!callbackData) {
    await ctx.answerCbQuery('Invalid callback');
    return;
  }

  try {
    // Weekday callbacks
    if (callbackData.startsWith('weekday_')) {
      await handleWeekdaySelection(ctx, callbackData);
      return;
    }

    // Expense callbacks
    switch (callbackData) {
      case CALLBACKS.EXPENSE_ADD:
        await handleExpenseAdd(ctx);
        break;
      case CALLBACKS.EXPENSE_SKIP:
        await handleExpenseSkip(ctx);
        break;
      case CALLBACKS.EXPENSE_ANOTHER:
        await handleExpenseAnother(ctx);
        break;
      case CALLBACKS.EXPENSE_DONE:
        await handleExpenseDone(ctx);
        break;
      case CALLBACKS.CONFIRM_REPORT:
        await handleConfirmReport(ctx);
        break;
      case CALLBACKS.EDIT_REPORT:
        await handleEditReport(ctx);
        break;
      case CALLBACKS.CANCEL_REPORT:
        await handleCancelReport(ctx);
        break;
      default:
        await ctx.answerCbQuery('Unknown action');
        logger.warn(`Unknown callback data: ${callbackData}`);
    }
  } catch (error) {
    logger.error('Error handling callback query:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.REPORT_ERROR);
  }
}
