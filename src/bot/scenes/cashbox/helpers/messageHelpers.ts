import { Markup } from 'telegraf';
import type { CashboxData } from '../../../../types/bot';
import { BUTTONS, CALLBACKS } from '../../../../utils/constants';
import { formatAmount, formatDateForDisplay } from '../../../../utils/formatters';
import { getDateKeyboard } from './dateHelpers';

/**
 * Get date selection keyboard
 */
export function getDateSelectionKeyboard() {
  return getDateKeyboard();
}

/**
 * Get confirmation keyboard for cashbox
 */
export function getConfirmationKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.CASHBOX_CONFIRM, CALLBACKS.CASHBOX_CONFIRM),
      Markup.button.callback(BUTTONS.CASHBOX_CANCEL, CALLBACKS.CASHBOX_CANCEL),
    ],
  ]);
}

/**
 * Get cashbox summary message
 */
export function getCashboxSummary(cashboxData: CashboxData): string {
  return `📊 Cashbox Summary:

📅 Date: ${formatDateForDisplay(cashboxData.date)}
💰 Amount: ${formatAmount(cashboxData.amount)}

Please confirm:`;
}
