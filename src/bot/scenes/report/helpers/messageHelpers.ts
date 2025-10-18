import { Markup } from 'telegraf';
import { BUTTONS, CALLBACKS } from '../../../../utils/constants';

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
