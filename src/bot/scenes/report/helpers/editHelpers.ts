import type { BotContext } from '../../../../types/bot';

/**
 * Start edit mode
 */
export function startEditMode(ctx: BotContext): void {
  ctx.session.editMode = true;
  ctx.session.editingField = undefined;
}

/**
 * Exit edit mode
 */
export function exitEditMode(ctx: BotContext): void {
  ctx.session.editMode = false;
  ctx.session.editingField = undefined;
}

/**
 * Check if in edit mode
 */
export function isEditMode(ctx: BotContext): boolean {
  return ctx.session.editMode === true;
}

/**
 * Set field being edited
 */
export function setEditingField(ctx: BotContext, field: string | undefined): void {
  ctx.session.editingField = field;
}

/**
 * Get editing field
 */
export function getEditingField(ctx: BotContext): string | undefined {
  return ctx.session.editingField;
}

/**
 * Format current value message
 */
export function formatCurrentValueMessage(
  fieldName: string,
  currentValue: string | number | undefined
): string {
  return `🤳 Current ${fieldName}: ${currentValue ?? 'None'}\n\nEnter new value or type "skip" to keep current:`;
}
