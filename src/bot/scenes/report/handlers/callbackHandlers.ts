import { logger } from '../../../../config/logger';
import { GoogleSheetsService } from '../../../../services/google-sheets';
import {
  DateColumnNotFoundError,
  GoogleSheetsConnectionError,
  GoogleSheetsPermissionError,
  SheetNotFoundError,
} from '../../../../services/google-sheets-errors';
import { saveReportToSheets } from '../../../../services/google-sheets-helpers';
import type { BotContext, ReportData } from '../../../../types/bot';
import {
  CALLBACKS,
  EDIT_CALLBACKS,
  MESSAGES,
  PROMPTS,
  REPORT_STEPS,
} from '../../../../utils/constants';
import {
  formatAmount,
  formatDateForDisplay,
  formatReportSummary,
} from '../../../../utils/formatters';
import {
  calculateCashAmount,
  calculateCashboxAmount,
  updateTotalSales,
} from '../helpers/calculationHelpers';
import { getDateFromCallback } from '../helpers/dateHelpers';
import {
  exitEditMode,
  formatCurrentValueMessage,
  getEditingField,
  setEditingField,
  startEditMode,
} from '../helpers/editHelpers';
import {
  clearExpenseCollection,
  formatExpensesList,
  initializeExpenses,
  startExpenseCollection,
} from '../helpers/expenseHelpers';
import {
  getConfirmationKeyboard,
  getDateSelectionKeyboard,
  getEditFieldsKeyboard,
  getWeekdayFromCallback,
  getWeekdayKeyboard,
} from '../helpers/messageHelpers';

/**
 * Handle date selection for report date
 */
export async function handleDateSelection(ctx: BotContext, callbackData: string) {
  const selectedDate = getDateFromCallback(callbackData);

  if (!selectedDate) {
    await ctx.answerCbQuery('Invalid date selection');
    return;
  }

  // Check if in edit mode
  const editingField = getEditingField(ctx);
  if (editingField === 'reportDate') {
    // In edit mode - return to field selection
    if (ctx.session.reportData) {
      ctx.session.reportData.reportDate = selectedDate;
    }

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `✅ Report date updated: ${formatDateForDisplay(selectedDate)}\n\n` +
        'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );

    setEditingField(ctx, undefined);
    logger.info(
      `User ${ctx.from?.id} updated report date to ${formatDateForDisplay(selectedDate)}`
    );
  } else {
    // Normal flow - continue to confirmation
    if (ctx.session.reportData) {
      ctx.session.reportData.reportDate = selectedDate;
    }
    ctx.session.step = REPORT_STEPS.CONFIRMATION;

    // Calculate and store total sales
    updateTotalSales(ctx);

    // Show full summary with confirmation buttons
    const summary = formatReportSummary(ctx.session.reportData as ReportData);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `${summary}\n\nPlease confirm your report:`,
      getConfirmationKeyboard()
    );

    logger.info(`User ${ctx.from?.id} selected report date: ${formatDateForDisplay(selectedDate)}`);
  }
}

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
    // Recalculate cashAmount after location is set
    ctx.session.reportData.cashAmount = calculateCashAmount(ctx);
  }

  // Check if in edit mode
  const editingField = ctx.session.editingField;
  if (editingField === 'blackCashLocation') {
    // In edit mode - return to field selection
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `✅ Black Cash location updated: ${weekday}\n\n` + 'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );

    setEditingField(ctx, undefined);
    logger.info(`User ${ctx.from?.id} updated black cash location to ${weekday}`);
  } else {
    // Normal flow - continue to next step
    ctx.session.step = REPORT_STEPS.CARD_SALES_AMOUNT;
    const cashAmount = ctx.session.reportData?.cashAmount ?? 0;

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `✅ Black Cash location saved\n\n🖤 Black Cash: ${formatAmount(
        blackCashAmount
      )}\n📍 Location: ${weekday}\n💰 Total Cash: ${formatAmount(cashAmount)}\n\n${PROMPTS.CARD_SALES_AMOUNT}`
    );

    logger.info(
      `User ${ctx.from?.id} selected black cash location: ${weekday} for amount: ${blackCashAmount}`
    );
  }
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

  // Auto-calculate cashboxAmount after expenses are skipped
  if (ctx.session.reportData) {
    ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
  }

  ctx.session.step = REPORT_STEPS.NOTES;

  await ctx.answerCbQuery();
  await ctx.editMessageText(`⏭️ Expenses skipped\n\n${PROMPTS.NOTES}`);

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

  // Auto-calculate cashboxAmount after expenses are completed
  if (ctx.session.reportData) {
    ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
  }

  // Check if in edit mode
  const editingField = getEditingField(ctx);
  if (editingField === 'expenses') {
    // In edit mode - recalculate cashboxAmount and return to field selection
    if (ctx.session.reportData) {
      ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
    }

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `✅ Expenses updated\n\n` + 'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );

    setEditingField(ctx, undefined);
    logger.info(`User ${ctx.from?.id} finished editing expenses`);
  } else {
    // Normal flow - skip to NOTES step (cashboxAmount is calculated automatically)
    ctx.session.step = REPORT_STEPS.NOTES;

    await ctx.answerCbQuery();
    await ctx.editMessageText(`✅ Expenses saved\n\n${PROMPTS.NOTES}`);

    logger.info(`User ${ctx.from?.id} finished adding expenses`);
  }
}

/**
 * Handle "Confirm Report" button
 */
export async function handleConfirmReport(ctx: BotContext) {
  // Recalculate cashAmount and cashboxAmount before confirming to ensure they're up-to-date
  if (ctx.session.reportData) {
    ctx.session.reportData.cashAmount = calculateCashAmount(ctx);
    ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
  }

  await ctx.answerCbQuery();

  try {
    // Save report to Google Sheets
    const reportData = ctx.session.reportData as ReportData;
    if (!reportData) {
      throw new Error('Report data is missing');
    }

    const sheetsService = new GoogleSheetsService();
    await saveReportToSheets(sheetsService, reportData);

    const reportDateFormatted = formatDateForDisplay(reportData.reportDate);
    await ctx.editMessageText(
      `✅ Report confirmed and saved to Google Sheets!\n\n📅 Report date: ${reportDateFormatted}\n📊 Your report has been successfully exported.`
    );

    logger.info(`User ${ctx.from?.id} confirmed and saved report to Google Sheets`, {
      reportDate: reportData.reportDate,
      totalSales: reportData.totalSales,
    });
  } catch (error) {
    // Handle specific error types with user-friendly messages
    let userMessage = '⚠️ Report confirmed but failed to save to Google Sheets.\n\n';

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
      logger.error('Failed to save report to Google Sheets', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        userId: ctx.from?.id,
      });
      userMessage += 'Please contact support or try again later.';
    }

    await ctx.editMessageText(userMessage);

    // Still log the report data for debugging
    logger.info(`User ${ctx.from?.id} confirmed report (but Google Sheets save failed)`, {
      reportData: ctx.session.reportData,
    });
  }

  // Clear session and exit scene
  ctx.session.reportData = undefined;
  ctx.session.step = undefined;
  await ctx.scene.leave();
}

/**
 * Handle "Edit Report" button
 */
export async function handleEditReport(ctx: BotContext) {
  // Recalculate cashAmount and cashboxAmount before entering edit mode to ensure correct display
  if (ctx.session.reportData) {
    ctx.session.reportData.cashAmount = calculateCashAmount(ctx);
    ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
  }

  await ctx.answerCbQuery();

  startEditMode(ctx);

  await ctx.editMessageText(
    '✏️ Select field to edit:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  logger.info(`User ${ctx.from?.id} entered edit mode`);
}

/**
 * Handle editing white cash amount
 */
export async function handleEditWhiteCash(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'whiteCashAmount');

  const currentValue = ctx.session.reportData?.whiteCashAmount;
  await ctx.editMessageText(
    formatCurrentValueMessage('White Cash Amount', formatAmount(currentValue ?? 0))
  );
}

/**
 * Handle editing black cash amount
 */
export async function handleEditBlackCash(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'blackCashAmount');

  const currentValue = ctx.session.reportData?.blackCashAmount;
  await ctx.editMessageText(
    formatCurrentValueMessage('Black Cash Amount', formatAmount(currentValue ?? 0))
  );
}

/**
 * Handle editing black cash location
 */
export async function handleEditBlackCashLocation(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'blackCashLocation');

  await ctx.editMessageText(
    `Current location: ${
      ctx.session.reportData?.blackCashLocation || 'None'
    }\n\nSelect new weekday:`,
    getWeekdayKeyboard()
  );
}

/**
 * Handle editing card sales amount
 */
export async function handleEditCardSales(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'cardSalesAmount');

  const currentValue = ctx.session.reportData?.cardSalesAmount;
  await ctx.editMessageText(
    formatCurrentValueMessage('Card Sales Amount', formatAmount(currentValue ?? 0))
  );
}

/**
 * Handle editing expenses
 */
export async function handleEditExpenses(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'expenses');

  const expenses = ctx.session.reportData?.expenses || [];
  const expensesList = expenses.length > 0 ? formatExpensesList(ctx) : 'No expenses yet';

  await ctx.editMessageText(
    `Current expenses:\n${expensesList}\n\n` +
      '⚠️ Editing expenses will let you add more.\n' +
      'Type "clear" to remove all expenses, or type "skip" to keep current expenses.'
  );
}

/**
 * Handle editing notes
 */
export async function handleEditNotes(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'notes');

  const currentValue = ctx.session.reportData?.notes;
  await ctx.editMessageText(
    formatCurrentValueMessage('Notes', currentValue || 'None') + '\n\nType "clear" to remove notes.'
  );
}

/**
 * Handle editing report date
 */
export async function handleEditReportDate(ctx: BotContext) {
  await ctx.answerCbQuery();
  setEditingField(ctx, 'reportDate');

  const currentValue = ctx.session.reportData?.reportDate;
  await ctx.editMessageText(
    `Current date: ${currentValue ? formatDateForDisplay(currentValue) : 'None'}\n\nSelect new date:`,
    getDateSelectionKeyboard()
  );
}

/**
 * Handle done editing
 */
export async function handleDoneEditing(ctx: BotContext) {
  await ctx.answerCbQuery();
  exitEditMode(ctx);

  // Recalculate cashAmount and cashboxAmount after exiting edit mode
  if (ctx.session.reportData) {
    ctx.session.reportData.cashAmount = calculateCashAmount(ctx);
    ctx.session.reportData.cashboxAmount = calculateCashboxAmount(ctx);
  }

  // Recalculate total sales
  updateTotalSales(ctx);

  // Show updated summary
  const summary = formatReportSummary(ctx.session.reportData as ReportData);
  await ctx.editMessageText(
    `${summary}\n\nPlease confirm your updated report:`,
    getConfirmationKeyboard()
  );

  logger.info(`User ${ctx.from?.id} finished editing`);
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

    // Date callbacks
    if (callbackData.startsWith('date_')) {
      await handleDateSelection(ctx, callbackData);
      return;
    }

    // Main action callbacks (handle before field-specific edit callbacks)
    switch (callbackData) {
      case CALLBACKS.EXPENSE_ADD:
        await handleExpenseAdd(ctx);
        return;
      case CALLBACKS.EXPENSE_SKIP:
        await handleExpenseSkip(ctx);
        return;
      case CALLBACKS.EXPENSE_ANOTHER:
        await handleExpenseAnother(ctx);
        return;
      case CALLBACKS.EXPENSE_DONE:
        await handleExpenseDone(ctx);
        return;
      case CALLBACKS.CONFIRM_REPORT:
        await handleConfirmReport(ctx);
        return;
      case CALLBACKS.EDIT_REPORT:
        await handleEditReport(ctx);
        return;
      case CALLBACKS.CANCEL_REPORT:
        await handleCancelReport(ctx);
        return;
      case EDIT_CALLBACKS.DONE_EDITING:
        await handleDoneEditing(ctx);
        return;
    }

    // Field-specific edit mode callbacks
    if (callbackData.startsWith('edit_')) {
      switch (callbackData) {
        case EDIT_CALLBACKS.EDIT_WHITE_CASH:
          await handleEditWhiteCash(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_BLACK_CASH:
          await handleEditBlackCash(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_BLACK_CASH_LOCATION:
          await handleEditBlackCashLocation(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_CARD_SALES:
          await handleEditCardSales(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_EXPENSES:
          await handleEditExpenses(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_NOTES:
          await handleEditNotes(ctx);
          break;
        case EDIT_CALLBACKS.EDIT_REPORT_DATE:
          await handleEditReportDate(ctx);
          break;
        default:
          await ctx.answerCbQuery('Unknown edit action');
          logger.warn(`Unknown edit callback data: ${callbackData}`);
      }
      return;
    }

    // Unknown callback
    await ctx.answerCbQuery('Unknown action');
    logger.warn(`Unknown callback data: ${callbackData}`);
  } catch (error) {
    logger.error('Error handling callback query:', error);
    await ctx.answerCbQuery('An error occurred');
    await ctx.reply(MESSAGES.REPORT_ERROR);
  }
}
