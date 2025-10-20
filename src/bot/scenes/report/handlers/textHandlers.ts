import { logger } from '../../../../config/logger';
import type { BotContext, ReportData } from '../../../../types/bot';
import { MESSAGES, PROMPTS, REPORT_STEPS } from '../../../../utils/constants';
import { formatAmount, formatReportSummary } from '../../../../utils/formatters';
import { updateTotalSales } from '../helpers/calculationHelpers';
import {
  addExpense,
  clearExpenseCollection,
  formatExpensesList,
  getExpenseNextKeyboard,
  isCollectingExpenseAmount,
  isCollectingExpenseDescription,
} from '../helpers/expenseHelpers';
import { getConfirmationKeyboard, getWeekdayKeyboard } from '../helpers/messageHelpers';
import {
  validateAmountWithPrompt,
  validateOptionalTextWithPrompt,
  validateTextWithPrompt,
} from '../helpers/validationHelpers';

/**
 * Handle cash amount input
 */
export async function handleCashAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (!ctx.session.reportData) {
    ctx.session.reportData = {};
  }
  ctx.session.reportData.cashAmount = validation.value;
  ctx.session.step = REPORT_STEPS.WHITE_CASH_AMOUNT;

  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${
      PROMPTS.WHITE_CASH_AMOUNT
    }`
  );
  logger.info(`User ${ctx.from?.id} entered cash amount: ${validation.value}`);
}

/**
 * Handle white cash amount input
 */
export async function handleWhiteCashAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.whiteCashAmount = validation.value;
  }
  ctx.session.step = REPORT_STEPS.BLACK_CASH_AMOUNT;

  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${
      PROMPTS.BLACK_CASH_AMOUNT
    }`
  );
  logger.info(`User ${ctx.from?.id} entered white cash amount: ${validation.value}`);
}

/**
 * Handle black cash amount input
 */
export async function handleBlackCashAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.blackCashAmount = validation.value;
  }

  // If black cash > 0, ask for location; otherwise skip to card sales
  if (validation.value && validation.value > 0) {
    ctx.session.step = REPORT_STEPS.BLACK_CASH_LOCATION;
    await ctx.reply(
      `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value)}\n\n${
        PROMPTS.BLACK_CASH_LOCATION
      }`,
      getWeekdayKeyboard()
    );
  } else {
    ctx.session.step = REPORT_STEPS.CARD_SALES_AMOUNT;
    await ctx.reply(
      `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${
        PROMPTS.CARD_SALES_AMOUNT
      }`
    );
  }

  logger.info(`User ${ctx.from?.id} entered black cash amount: ${validation.value}`);
}

/**
 * Handle card sales amount input
 */
export async function handleCardSalesAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.cardSalesAmount = validation.value;
  }
  ctx.session.step = REPORT_STEPS.EXPENSES;

  // Import the keyboard function here to avoid circular dependency
  const { getExpenseInitialKeyboard } = await import('../helpers/expenseHelpers');

  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${
      PROMPTS.EXPENSES_QUESTION
    }`,
    getExpenseInitialKeyboard()
  );
  logger.info(`User ${ctx.from?.id} entered card sales amount: ${validation.value}`);
}

/**
 * Handle cashbox amount input
 */
export async function handleCashboxAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.cashboxAmount = validation.value;
  }
  ctx.session.step = REPORT_STEPS.NOTES;

  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${PROMPTS.NOTES}`
  );
  logger.info(`User ${ctx.from?.id} entered cashbox amount: ${validation.value}`);
}

/**
 * Handle notes input
 */
export async function handleNotes(ctx: BotContext, userInput: string) {
  const validation = validateOptionalTextWithPrompt(userInput);

  if (ctx.session.reportData) {
    ctx.session.reportData.notes = validation.value;
  }
  ctx.session.step = REPORT_STEPS.CONFIRMATION;

  // Calculate and store total sales
  updateTotalSales(ctx);

  // Show full summary
  const summary = formatReportSummary(ctx.session.reportData as ReportData);
  await ctx.reply(
    `${validation.value ? `✅ Notes saved\n\n` : ''}${summary}\n\nPlease confirm your report:`,
    getConfirmationKeyboard()
  );

  logger.info(`User ${ctx.from?.id} entered notes and reached confirmation`);
}

/**
 * Handle expense amount input
 */
export async function handleExpenseAmount(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  ctx.session.currentExpenseAmount = validation.value;
  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${
      PROMPTS.EXPENSE_DESCRIPTION
    }`
  );
  logger.info(`User ${ctx.from?.id} entered expense amount: ${validation.value}`);
}

/**
 * Handle expense description input
 */
export async function handleExpenseDescription(ctx: BotContext, userInput: string) {
  const validation = validateTextWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  const amount = ctx.session.currentExpenseAmount;
  const description = validation.value;

  if (amount !== undefined && description) {
    // Add expense to the list
    addExpense(ctx, {
      amount,
      description,
    });

    clearExpenseCollection(ctx);

    // Show expenses list and ask if they want to add more
    await ctx.reply(`✅ Expense added!\n\n${formatExpensesList(ctx)}`, getExpenseNextKeyboard());

    logger.info(`User ${ctx.from?.id} added expense: ${description} - ${amount}`);
  }
}

/**
 * Main text handler dispatcher
 */
export async function handleTextInput(ctx: BotContext, userInput: string) {
  const currentStep = ctx.session?.step;

  // Check if collecting expense sub-flow
  if (isCollectingExpenseAmount(ctx)) {
    await handleExpenseAmount(ctx, userInput);
    return;
  }

  if (isCollectingExpenseDescription(ctx)) {
    await handleExpenseDescription(ctx, userInput);
    return;
  }

  // Main FSM flow
  switch (currentStep) {
    case REPORT_STEPS.CASH_AMOUNT:
      await handleCashAmount(ctx, userInput);
      break;
    case REPORT_STEPS.WHITE_CASH_AMOUNT:
      await handleWhiteCashAmount(ctx, userInput);
      break;
    case REPORT_STEPS.BLACK_CASH_AMOUNT:
      await handleBlackCashAmount(ctx, userInput);
      break;
    case REPORT_STEPS.CARD_SALES_AMOUNT:
      await handleCardSalesAmount(ctx, userInput);
      break;
    case REPORT_STEPS.CASHBOX_AMOUNT:
      await handleCashboxAmount(ctx, userInput);
      break;
    case REPORT_STEPS.NOTES:
      await handleNotes(ctx, userInput);
      break;
    default:
      await ctx.reply(MESSAGES.INVALID_INPUT);
  }
}
