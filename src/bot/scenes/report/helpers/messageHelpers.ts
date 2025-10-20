import { Markup } from 'telegraf';
import type { ReportData } from '../../../../types/bot';
import { BUTTONS, CALLBACKS, EDIT_BUTTONS, EDIT_CALLBACKS } from '../../../../utils/constants';
import { formatAmount } from '../../../../utils/formatters';

/**
 * Get weekday selection keyboard
 */
export function getWeekdayKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.MONDAY, CALLBACKS.WEEKDAY_MONDAY),
      Markup.button.callback(BUTTONS.TUESDAY, CALLBACKS.WEEKDAY_TUESDAY),
    ],
    [
      Markup.button.callback(BUTTONS.WEDNESDAY, CALLBACKS.WEEKDAY_WEDNESDAY),
      Markup.button.callback(BUTTONS.THURSDAY, CALLBACKS.WEEKDAY_THURSDAY),
    ],
    [
      Markup.button.callback(BUTTONS.FRIDAY, CALLBACKS.WEEKDAY_FRIDAY),
      Markup.button.callback(BUTTONS.SATURDAY, CALLBACKS.WEEKDAY_SATURDAY),
    ],
    [Markup.button.callback(BUTTONS.SUNDAY, CALLBACKS.WEEKDAY_SUNDAY)],
  ]);
}

/**
 * Get confirmation keyboard
 */
export function getConfirmationKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.CONFIRM, CALLBACKS.CONFIRM_REPORT),
      Markup.button.callback(BUTTONS.EDIT, CALLBACKS.EDIT_REPORT),
    ],
    [Markup.button.callback(BUTTONS.CANCEL, CALLBACKS.CANCEL_REPORT)],
  ]);
}

/**
 * Get edit fields keyboard with current values
 */
export function getEditFieldsKeyboard(reportData: Partial<ReportData>) {
  const buttons = [];

  // Show current values in button labels
  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.CASH} (${formatAmount(reportData.cashAmount ?? 0)})`,
      EDIT_CALLBACKS.EDIT_CASH
    ),
  ]);

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.WHITE_CASH} (${formatAmount(reportData.whiteCashAmount ?? 0)})`,
      EDIT_CALLBACKS.EDIT_WHITE_CASH
    ),
  ]);

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.BLACK_CASH} (${formatAmount(reportData.blackCashAmount ?? 0)})`,
      EDIT_CALLBACKS.EDIT_BLACK_CASH
    ),
  ]);

  if (reportData.blackCashAmount && reportData.blackCashAmount > 0) {
    buttons.push([
      Markup.button.callback(
        `${EDIT_BUTTONS.BLACK_CASH_LOCATION} (${reportData.blackCashLocation || 'None'})`,
        EDIT_CALLBACKS.EDIT_BLACK_CASH_LOCATION
      ),
    ]);
  }

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.CARD_SALES} (${formatAmount(reportData.cardSalesAmount ?? 0)})`,
      EDIT_CALLBACKS.EDIT_CARD_SALES
    ),
  ]);

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.EXPENSES} (${reportData.expenses?.length ?? 0} items)`,
      EDIT_CALLBACKS.EDIT_EXPENSES
    ),
  ]);

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.CASHBOX} (${formatAmount(reportData.cashboxAmount ?? 0)})`,
      EDIT_CALLBACKS.EDIT_CASHBOX
    ),
  ]);

  buttons.push([
    Markup.button.callback(
      `${EDIT_BUTTONS.NOTES} ${reportData.notes ? '(set)' : '(none)'}`,
      EDIT_CALLBACKS.EDIT_NOTES
    ),
  ]);

  buttons.push([Markup.button.callback(EDIT_BUTTONS.DONE_EDITING, EDIT_CALLBACKS.DONE_EDITING)]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Map callback data to weekday name
 */
export function getWeekdayFromCallback(callbackData: string): string | null {
  const weekdayMap: Record<string, string> = {
    [CALLBACKS.WEEKDAY_MONDAY]: 'Monday',
    [CALLBACKS.WEEKDAY_TUESDAY]: 'Tuesday',
    [CALLBACKS.WEEKDAY_WEDNESDAY]: 'Wednesday',
    [CALLBACKS.WEEKDAY_THURSDAY]: 'Thursday',
    [CALLBACKS.WEEKDAY_FRIDAY]: 'Friday',
    [CALLBACKS.WEEKDAY_SATURDAY]: 'Saturday',
    [CALLBACKS.WEEKDAY_SUNDAY]: 'Sunday',
  };

  return weekdayMap[callbackData] || null;
}
