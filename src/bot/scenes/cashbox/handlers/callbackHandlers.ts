import { logger } from '../../../../config/logger';
import { GoogleSheetsService } from '../../../../services/google-sheets';
import {
  DateColumnNotFoundError,
  GoogleSheetsConnectionError,
  GoogleSheetsPermissionError,
  SheetNotFoundError,
} from '../../../../services/google-sheets-errors';
import { saveCashboxToSheets } from '../../../../services/google-sheets-helpers';
import type { BotContext } from '../../../../types/bot';
import { CALLBACKS, CASHBOX_STEPS, MESSAGES, PROMPTS } from '../../../../utils/constants';
import { formatDateForDisplay } from '../../../../utils/formatters';
import { getDateFromCallback } from '../helpers/dateHelpers';
import { getCashboxSummary, getConfirmationKeyboard } from '../helpers/messageHelpers';

/**
 * Handle date selection for cashbox
 */
export async function handleDateSelection(ctx: BotContext, callbackData: string) {
  const selectedDate = getDateFromCallback(callbackData);

  if (!selectedDate) {
    await ctx.answerCbQuery('Invalid date selection');
    return;
  }

  // Initialize session if needed
  if (!ctx.session) {
    ctx.session = {};
  }

  // Initialize cashboxData if needed, or update date if exists
  // If amount was already entered, preserve it when changing date
  if (!ctx.session.cashboxData) {
    ctx.session.cashboxData = {
      amount: 0,
      date: selectedDate,
    };
    ctx.session.step = CASHBOX_STEPS.AMOUNT;

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `✅ Date selected: ${formatDateForDisplay(selectedDate)}\n\n${PROMPTS.CASHBOX_START_AMOUNT}`
    );
  } else {
    // Update date, preserve amount if it was already entered
    // Check if amount was already set (including 0, which is valid)
    const hadAmount =
      typeof ctx.session.cashboxData.amount === 'number' &&
      !Number.isNaN(ctx.session.cashboxData.amount);
    ctx.session.cashboxData.date = selectedDate;

    await ctx.answerCbQuery();

    if (hadAmount) {
      // If amount was already entered, show summary with confirmation
      ctx.session.step = CASHBOX_STEPS.CONFIRMATION;
      const summary = getCashboxSummary(ctx.session.cashboxData);
      await ctx.editMessageText(
        `✅ Date updated: ${formatDateForDisplay(selectedDate)}\n\n${summary}`,
        getConfirmationKeyboard()
      );
    } else {
      // If no amount yet, ask for amount
      ctx.session.step = CASHBOX_STEPS.AMOUNT;
      await ctx.editMessageText(
        `✅ Date selected: ${formatDateForDisplay(selectedDate)}\n\n${PROMPTS.CASHBOX_START_AMOUNT}`
      );
    }
  }

  logger.info(`User ${ctx.from?.id} selected cashbox date: ${formatDateForDisplay(selectedDate)}`);
}

/**
 * Handle confirmation for cashbox
 */
export async function handleConfirmation(ctx: BotContext) {
  const cashboxData = ctx.session.cashboxData;

  // Validate cashboxData exists and has required fields
  if (
    !cashboxData ||
    !cashboxData.date ||
    typeof cashboxData.amount !== 'number' ||
    Number.isNaN(cashboxData.amount)
  ) {
    await ctx.answerCbQuery('Invalid cashbox data');

    // Try to edit message, fallback to reply if edit fails
    try {
      await ctx.editMessageText(MESSAGES.CASHBOX_ERROR);
    } catch {
      await ctx.reply(MESSAGES.CASHBOX_ERROR);
    }

    logger.error('Invalid cashbox data on confirmation', {
      userId: ctx.from?.id,
      hasCashboxData: !!cashboxData,
      hasDate: !!cashboxData?.date,
      amountType: typeof cashboxData?.amount,
      amountValue: cashboxData?.amount,
    });
    return;
  }

  try {
    // Save to Google Sheets
    const sheetsService = new GoogleSheetsService();
    await saveCashboxToSheets(sheetsService, cashboxData);

    await ctx.answerCbQuery();
    await ctx.editMessageText(MESSAGES.CASHBOX_COMPLETED);

    // Clear session and exit scene
    ctx.session.cashboxData = undefined;
    ctx.session.step = undefined;

    logger.info(`User ${ctx.from?.id} successfully saved cashbox amount: ${cashboxData.amount}`);

    await ctx.scene.leave();
  } catch (error) {
    // Handle specific error types with user-friendly messages
    let userMessage = '⚠️ Cashbox confirmed but failed to save to Google Sheets.\n\n';

    if (error instanceof SheetNotFoundError) {
      userMessage += `Sheet "${error.sheetName}" not found. Please ensure the sheet exists in your spreadsheet.`;
      logger.error('Sheet not found error', {
        error: error.message,
        sheetName: error.sheetName,
        userId: ctx.from?.id,
      });
    } else if (error instanceof DateColumnNotFoundError) {
      userMessage += `Date "${error.dateString}" not found in sheet "${error.sheetName}". Please ensure the date exists in the sheet.`;
      logger.error('Date column not found error', {
        error: error.message,
        sheetName: error.sheetName,
        dateString: error.dateString,
        userId: ctx.from?.id,
      });
    } else if (error instanceof GoogleSheetsPermissionError) {
      userMessage +=
        'Permission denied. Please check that the service account has access to the spreadsheet.';
      logger.error('Permission error', {
        error: error.message,
        userId: ctx.from?.id,
      });
    } else if (error instanceof GoogleSheetsConnectionError) {
      userMessage += 'Connection error. Please try again in a few moments.';
      logger.error('Connection error', {
        error: error.message,
        userId: ctx.from?.id,
      });
    } else {
      // Generic error for other cases
      logger.error('Failed to save cashbox to Google Sheets', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        userId: ctx.from?.id,
      });
      userMessage += 'Please contact support or try again later.';
    }

    await ctx.answerCbQuery();

    // Show error message and summary again to allow retry
    const summary = getCashboxSummary(cashboxData);
    await ctx.editMessageText(`${userMessage}\n\n${summary}`, getConfirmationKeyboard());

    // Stay in scene to allow retry (don't clear data, don't leave scene)
    logger.info(`User ${ctx.from?.id} confirmed cashbox (but Google Sheets save failed)`, {
      cashboxData: ctx.session.cashboxData,
    });
  }
}

/**
 * Handle cancel for cashbox
 */
export async function handleCancel(ctx: BotContext) {
  await ctx.answerCbQuery();

  if (ctx.session) {
    ctx.session.cashboxData = undefined;
    ctx.session.step = undefined;
  }

  // Edit message to remove keyboard, then send cancellation message
  try {
    await ctx.editMessageText(MESSAGES.CASHBOX_CANCELLED);
  } catch {
    // If edit fails (e.g., message too old), just send new message
    await ctx.reply(MESSAGES.CASHBOX_CANCELLED);
  }

  logger.info(`User ${ctx.from?.id} cancelled cashbox via button`);
  await ctx.scene.leave();
}

/**
 * Main callback query dispatcher
 */
export async function handleCallbackQuery(ctx: BotContext) {
  const callbackData =
    ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : null;

  if (!callbackData) {
    await ctx.answerCbQuery('Invalid callback');
    return;
  }

  try {
    // Route by prefix for date callbacks
    if (callbackData.startsWith('date_')) {
      await handleDateSelection(ctx, callbackData);
      return;
    }

    // Route by exact match
    switch (callbackData) {
      case CALLBACKS.CASHBOX_CONFIRM:
        await handleConfirmation(ctx);
        break;
      case CALLBACKS.CASHBOX_CANCEL:
        await handleCancel(ctx);
        break;
      default:
        await ctx.answerCbQuery('Unknown action');
        logger.warn(`Unknown callback data in cashbox scene: ${callbackData}`);
    }
  } catch (error) {
    logger.error('Error handling callback query in cashbox scene:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
  }
}
