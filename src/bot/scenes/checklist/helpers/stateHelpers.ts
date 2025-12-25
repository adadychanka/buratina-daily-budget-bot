import type { BotContext } from '../../../../types/bot';

/**
 * Initialize checklist data in session
 */
export function initializeChecklistData(ctx: BotContext): void {
  if (!ctx.session) {
    ctx.session = {};
  }
  if (!ctx.session.checklistData) {
    ctx.session.checklistData = {};
  }
}

/**
 * Clear checklist data from session
 */
export function clearChecklistData(ctx: BotContext): void {
  if (ctx.session) {
    ctx.session.checklistData = undefined;
  }
}

/**
 * Set checklist step
 */
export function setChecklistStep(ctx: BotContext, step: string): void {
  initializeChecklistData(ctx);
  if (ctx.session.checklistData) {
    ctx.session.checklistData.step = step;
  }
}
