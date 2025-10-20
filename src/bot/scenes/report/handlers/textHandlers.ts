import { logger } from '../../../../config/logger';
import type { BotContext, ReportData } from '../../../../types/bot';
import { MESSAGES, PROMPTS, REPORT_STEPS } from '../../../../utils/constants';
import { formatAmount, formatReportSummary } from '../../../../utils/formatters';
import { updateTotalSales } from '../helpers/calculationHelpers';
import { getEditingField, isEditMode, setEditingField } from '../helpers/editHelpers';
import {
  addExpense,
  clearExpenseCollection,
  formatExpensesList,
  getExpenseNextKeyboard,
  initializeExpenses,
  isCollectingExpenseAmount,
  isCollectingExpenseDescription,
  startExpenseCollection,
} from '../helpers/expenseHelpers';
import {
  getConfirmationKeyboard,
  getEditFieldsKeyboard,
  getWeekdayKeyboard,
} from '../helpers/messageHelpers';
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
 * Return to field selection menu
 */
async function returnToFieldSelection(ctx: BotContext) {
  setEditingField(ctx, undefined);

  await ctx.reply(
    '✏️ Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );
}

/**
 * Handle editing field input
 */
async function handleEditFieldInput(ctx: BotContext, userInput: string) {
  const field = getEditingField(ctx);

  if (!field) {
    await ctx.reply('Error: No field selected for editing');
    return;
  }

  // Handle "skip" to keep current value
  if (userInput.toLowerCase().trim() === 'skip') {
    await returnToFieldSelection(ctx);
    return;
  }

  // Validate and update based on field type
  switch (field) {
    case 'cashAmount':
      await handleEditCashAmountInput(ctx, userInput);
      break;
    case 'whiteCashAmount':
      await handleEditWhiteCashAmountInput(ctx, userInput);
      break;
    case 'blackCashAmount':
      await handleEditBlackCashAmountInput(ctx, userInput);
      break;
    case 'cardSalesAmount':
      await handleEditCardSalesInput(ctx, userInput);
      break;
    case 'cashboxAmount':
      await handleEditCashboxInput(ctx, userInput);
      break;
    case 'notes':
      await handleEditNotesInput(ctx, userInput);
      break;
    case 'expenses':
      await handleEditExpensesInput(ctx, userInput);
      break;
    default:
      await ctx.reply(MESSAGES.INVALID_INPUT);
  }
}

/**
 * Edit handlers for each field
 */
async function handleEditCashAmountInput(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.cashAmount = validation.value;
  }

  await ctx.reply(
    `✅ Cash Amount updated: ${formatAmount(validation.value)}\n\n` +
      'Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated cash amount to ${validation.value}`);
}

async function handleEditWhiteCashAmountInput(ctx: BotContext, userInput: string) {
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

  await ctx.reply(
    `✅ White Cash Amount updated: ${formatAmount(validation.value)}\n\n` +
      'Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated white cash amount to ${validation.value}`);
}

async function handleEditBlackCashAmountInput(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  if (ctx.session.reportData) {
    ctx.session.reportData.blackCashAmount = validation.value;

    // If black cash is 0 or less, clear the location
    if (validation.value === 0) {
      ctx.session.reportData.blackCashLocation = undefined;
    }
  }

  await ctx.reply(
    `✅ Black Cash Amount updated: ${formatAmount(validation.value)}\n\n` +
      'Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated black cash amount to ${validation.value}`);
}

async function handleEditCardSalesInput(ctx: BotContext, userInput: string) {
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

  await ctx.reply(
    `✅ Card Sales Amount updated: ${formatAmount(validation.value)}\n\n` +
      'Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated card sales amount to ${validation.value}`);
}

async function handleEditCashboxInput(ctx: BotContext, userInput: string) {
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

  await ctx.reply(
    `✅ Cashbox Amount updated: ${formatAmount(validation.value)}\n\n` +
      'Select another field to edit or finish:',
    getEditFieldsKeyboard(ctx.session.reportData ?? {})
  );

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated cashbox amount to ${validation.value}`);
}

async function handleEditNotesInput(ctx: BotContext, userInput: string) {
  const trimmedInput = userInput.toLowerCase().trim();

  if (trimmedInput === 'clear') {
    if (ctx.session.reportData) {
      ctx.session.reportData.notes = undefined;
    }

    await ctx.reply(
      '✅ Notes cleared\n\n' + 'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );
  } else {
    const validation = validateOptionalTextWithPrompt(userInput);

    if (!validation.isValid) {
      if (validation.errorMessage) {
        await ctx.reply(validation.errorMessage);
      }
      return;
    }

    if (ctx.session.reportData) {
      ctx.session.reportData.notes = validation.value;
    }

    await ctx.reply(
      `✅ Notes updated: ${validation.value || 'None'}\n\n` +
        'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );
  }

  setEditingField(ctx, undefined);
  logger.info(`User ${ctx.from?.id} updated notes`);
}

async function handleEditExpensesInput(ctx: BotContext, userInput: string) {
  const trimmedInput = userInput.toLowerCase().trim();

  if (trimmedInput === 'clear') {
    if (ctx.session.reportData) {
      ctx.session.reportData.expenses = [];
      initializeExpenses(ctx);
    }

    await ctx.reply(
      '✅ All expenses cleared\n\n' + 'Select another field to edit or finish:',
      getEditFieldsKeyboard(ctx.session.reportData ?? {})
    );

    setEditingField(ctx, undefined);
    logger.info(`User ${ctx.from?.id} cleared all expenses`);
  } else if (trimmedInput === 'skip') {
    await returnToFieldSelection(ctx);
  } else {
    // Start adding expenses
    initializeExpenses(ctx);
    startExpenseCollection(ctx);
    await ctx.reply(PROMPTS.EXPENSE_AMOUNT);
    logger.info(`User ${ctx.from?.id} started adding expenses in edit mode`);
  }
}

/**
 * Main text handler dispatcher
 */
export async function handleTextInput(ctx: BotContext, userInput: string) {
  // Check if collecting expense sub-flow (MUST be checked before edit mode)
  // This allows expense collection to work both in normal flow and edit mode
  if (isCollectingExpenseAmount(ctx)) {
    await handleExpenseAmount(ctx, userInput);
    return;
  }

  if (isCollectingExpenseDescription(ctx)) {
    await handleExpenseDescription(ctx, userInput);
    return;
  }

  // Check if in edit mode
  if (isEditMode(ctx)) {
    await handleEditFieldInput(ctx, userInput);
    return;
  }

  const currentStep = ctx.session?.step;

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
