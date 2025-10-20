import type { BotContext } from '../../../../types/bot';
import { getTotalExpenses } from './expenseHelpers';

/**
 * Calculate total sales from report data
 * Formula: Cash + White Cash + Black Cash + Card Sales - Total Expenses
 */
export function calculateTotalSales(ctx: BotContext): number {
  const reportData = ctx.session.reportData;

  const cashAmount = reportData?.cashAmount ?? 0;
  const whiteCashAmount = reportData?.whiteCashAmount ?? 0;
  const blackCashAmount = reportData?.blackCashAmount ?? 0;
  const cardSalesAmount = reportData?.cardSalesAmount ?? 0;
  const totalExpenses = getTotalExpenses(ctx);

  return cashAmount + whiteCashAmount + blackCashAmount + cardSalesAmount - totalExpenses;
}

/**
 * Calculate and store total sales in session
 */
export function updateTotalSales(ctx: BotContext): void {
  const totalSales = calculateTotalSales(ctx);

  if (ctx.session.reportData) {
    ctx.session.reportData.totalSales = totalSales;
  }
}

/**
 * Get individual components of the total sales calculation
 * Useful for debugging or detailed display
 */
export function getTotalSalesBreakdown(ctx: BotContext): {
  cashAmount: number;
  whiteCashAmount: number;
  blackCashAmount: number;
  cardSalesAmount: number;
  totalExpenses: number;
  totalSales: number;
} {
  const reportData = ctx.session.reportData;

  const cashAmount = reportData?.cashAmount ?? 0;
  const whiteCashAmount = reportData?.whiteCashAmount ?? 0;
  const blackCashAmount = reportData?.blackCashAmount ?? 0;
  const cardSalesAmount = reportData?.cardSalesAmount ?? 0;
  const totalExpenses = getTotalExpenses(ctx);
  const totalSales =
    cashAmount + whiteCashAmount + blackCashAmount + cardSalesAmount - totalExpenses;

  return {
    cashAmount,
    whiteCashAmount,
    blackCashAmount,
    cardSalesAmount,
    totalExpenses,
    totalSales,
  };
}

/**
 * Validate that total sales calculation is positive
 * Returns true if valid, false with reason if invalid
 */
export function validateTotalSales(ctx: BotContext): {
  isValid: boolean;
  reason?: string;
  totalSales: number;
} {
  const totalSales = calculateTotalSales(ctx);

  if (totalSales < 0) {
    return {
      isValid: false,
      reason: 'Total sales cannot be negative. Please check your expenses.',
      totalSales,
    };
  }

  return {
    isValid: true,
    totalSales,
  };
}
