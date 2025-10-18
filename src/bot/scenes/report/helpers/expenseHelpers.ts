import { Markup } from 'telegraf';
import type { BotContext, Expense } from '../../../../types/bot';
import { BUTTONS, CALLBACKS } from '../../../../utils/constants';

/**
 * Initialize expenses array in session
 */
export function initializeExpenses(ctx: BotContext): void {
  if (!ctx.session.reportData) {
    ctx.session.reportData = {};
  }
  if (!ctx.session.reportData.expenses) {
    ctx.session.reportData.expenses = [];
  }
}

/**
 * Add expense to session
 */
export function addExpense(ctx: BotContext, expense: Expense): void {
  initializeExpenses(ctx);
  if (ctx.session.reportData?.expenses) {
    ctx.session.reportData.expenses.push(expense);
  }
}

/**
 * Get total expenses amount
 */
export function getTotalExpenses(ctx: BotContext): number {
  if (!ctx.session.reportData?.expenses) {
    return 0;
  }
  return ctx.session.reportData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Get expense keyboard for initial question
 */
export function getExpenseInitialKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.ADD_EXPENSE, CALLBACKS.EXPENSE_ADD),
      Markup.button.callback(BUTTONS.SKIP_EXPENSES, CALLBACKS.EXPENSE_SKIP),
    ],
  ]);
}

/**
 * Get expense keyboard after adding an expense
 */
export function getExpenseNextKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(BUTTONS.ADD_ANOTHER_EXPENSE, CALLBACKS.EXPENSE_ANOTHER),
      Markup.button.callback(BUTTONS.DONE_EXPENSES, CALLBACKS.EXPENSE_DONE),
    ],
  ]);
}

/**
 * Format expenses list for display
 */
export function formatExpensesList(ctx: BotContext): string {
  if (!ctx.session.reportData?.expenses || ctx.session.reportData.expenses.length === 0) {
    return 'No expenses recorded';
  }

  const expenses = ctx.session.reportData.expenses;
  const expensesList = expenses
    .map((exp, idx) => `${idx + 1}. ${exp.description}: ${exp.amount} RSD`)
    .join('\n');

  return `Expenses recorded (${
    expenses.length
  }):\n${expensesList}\n\nTotal: ${getTotalExpenses(ctx)} RSD`;
}

/**
 * Start expense collection flow
 */
export function startExpenseCollection(ctx: BotContext): void {
  ctx.session.collectingExpense = true;
  ctx.session.currentExpenseAmount = undefined;
}

/**
 * Clear expense collection state
 */
export function clearExpenseCollection(ctx: BotContext): void {
  ctx.session.collectingExpense = false;
  ctx.session.currentExpenseAmount = undefined;
}

/**
 * Check if currently collecting expense
 */
export function isCollectingExpense(ctx: BotContext): boolean {
  return ctx.session.collectingExpense === true;
}

/**
 * Check if collecting expense amount (first step)
 */
export function isCollectingExpenseAmount(ctx: BotContext): boolean {
  return isCollectingExpense(ctx) && ctx.session.currentExpenseAmount === undefined;
}

/**
 * Check if collecting expense description (second step)
 */
export function isCollectingExpenseDescription(ctx: BotContext): boolean {
  return isCollectingExpense(ctx) && ctx.session.currentExpenseAmount !== undefined;
}
