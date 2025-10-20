import { subDays } from 'date-fns';
import { Markup } from 'telegraf';
import { CALLBACKS } from '../../../../utils/constants';
import { formatDateForDisplay } from '../../../../utils/formatters';

/**
 * Get date selection keyboard with 3 options
 */
export function getDateKeyboard() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);

  return Markup.inlineKeyboard([
    [Markup.button.callback(`Today (${formatDateForDisplay(today)})`, CALLBACKS.DATE_TODAY)],
    [
      Markup.button.callback(
        `Yesterday (${formatDateForDisplay(yesterday)})`,
        CALLBACKS.DATE_YESTERDAY
      ),
    ],
    [
      Markup.button.callback(
        `2 days ago (${formatDateForDisplay(twoDaysAgo)})`,
        CALLBACKS.DATE_2_DAYS
      ),
    ],
  ]);
}

/**
 * Get date from callback data
 */
export function getDateFromCallback(callbackData: string): Date | null {
  const today = new Date();

  switch (callbackData) {
    case CALLBACKS.DATE_TODAY:
      return today;
    case CALLBACKS.DATE_YESTERDAY:
      return subDays(today, 1);
    case CALLBACKS.DATE_2_DAYS:
      return subDays(today, 2);
    default:
      return null;
  }
}

/**
 * Get days ago from callback data
 */
export function getDaysAgoFromCallback(callbackData: string): number {
  switch (callbackData) {
    case CALLBACKS.DATE_TODAY:
      return 0;
    case CALLBACKS.DATE_YESTERDAY:
      return 1;
    case CALLBACKS.DATE_2_DAYS:
      return 2;
    default:
      return 0;
  }
}
