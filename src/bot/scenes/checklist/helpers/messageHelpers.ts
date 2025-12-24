import { Markup } from 'telegraf';
import { BUTTONS, CALLBACKS } from '../../../../utils/constants';

/**
 * Get keyboard with list of available checklists
 */
export function getChecklistsKeyboard(checklistNames: string[]) {
  const buttons = checklistNames.map((name, index) => [
    Markup.button.callback(name, `${CALLBACKS.CHECKLIST_SELECT}_${index}`),
  ]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Get keyboard with checklist actions (Done, Cancel)
 */
export function getChecklistActionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.CHECKLIST_DONE, CALLBACKS.CHECKLIST_COMPLETE),
      Markup.button.callback(BUTTONS.CHECKLIST_CANCEL, CALLBACKS.CHECKLIST_CANCEL),
    ],
  ]);
}
