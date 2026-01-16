import { logger } from '../../../../config/logger';
import type { BotContext } from '../../../../types/bot';
import { CASHBOX_STEPS, MESSAGES } from '../../../../utils/constants';
import { formatAmount } from '../../../../utils/formatters';
import { getCashboxSummary, getConfirmationKeyboard } from '../helpers/messageHelpers';
import { validateAmountWithPrompt } from '../helpers/validationHelpers';

/**
 * Handle amount input for cashbox
 */
export async function handleAmountInput(ctx: BotContext, userInput: string) {
  const validation = validateAmountWithPrompt(userInput);

  if (!validation.isValid) {
    if (validation.errorMessage) {
      await ctx.reply(validation.errorMessage);
    }
    return;
  }

  // Check if cashboxData exists and has a valid date
  // This should always be true if step is AMOUNT, but check for safety
  if (!ctx.session.cashboxData || !ctx.session.cashboxData.date) {
    await ctx.reply(MESSAGES.CASHBOX_ERROR);
    logger.error('Cashbox data or date missing when entering amount', {
      userId: ctx.from?.id,
      hasCashboxData: !!ctx.session.cashboxData,
      hasDate: !!ctx.session.cashboxData?.date,
    });
    return;
  }

  // Update amount
  ctx.session.cashboxData.amount = validation.value ?? 0;
  ctx.session.step = CASHBOX_STEPS.CONFIRMATION;

  // Show summary and confirmation
  const summary = getCashboxSummary(ctx.session.cashboxData);

  await ctx.reply(
    `${MESSAGES.AMOUNT_SAVED}: ${formatAmount(validation.value ?? 0)}\n\n${summary}`,
    getConfirmationKeyboard()
  );

  logger.info(`User ${ctx.from?.id} entered cashbox amount: ${validation.value}`);
}

/**
 * Main text input dispatcher
 */
export async function handleTextInput(ctx: BotContext, userInput: string) {
  // Ensure session is initialized
  if (!ctx.session) {
    ctx.session = {};
  }

  const currentStep = ctx.session.step;

  // Main FSM flow
  switch (currentStep) {
    case CASHBOX_STEPS.DATE:
      await ctx.reply('Please use buttons to select date');
      break;
    case CASHBOX_STEPS.AMOUNT:
      await handleAmountInput(ctx, userInput);
      break;
    case CASHBOX_STEPS.CONFIRMATION:
      await ctx.reply('Please use buttons to confirm');
      break;
    default:
      await ctx.reply(MESSAGES.INVALID_INPUT);
  }
}
