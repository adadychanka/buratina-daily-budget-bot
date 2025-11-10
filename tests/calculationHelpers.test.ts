import { describe, it, expect, beforeEach } from 'vitest';
import type { BotContext } from '../src/types/bot';
import {
  calculateTotalSales,
  updateTotalSales,
  getTotalSalesBreakdown,
  validateTotalSales,
} from '../src/bot/scenes/report/helpers/calculationHelpers';

describe('Calculation Helpers', () => {
  let mockCtx: Partial<BotContext>;

  beforeEach(() => {
    mockCtx = {
      session: {
        reportData: {
          cashAmount: 0,
          whiteCashAmount: 0,
          blackCashAmount: 0,
          cardSalesAmount: 0,
          expenses: [],
          cashboxAmount: 0,
          totalSales: 0,
        },
      },
    };
  });

  describe('calculateTotalSales', () => {
    it('should calculate total sales with all positive amounts', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 500,
        blackCashAmount: 200,
        cardSalesAmount: 1500,
        expenses: [],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = calculateTotalSales(mockCtx as BotContext);
      expect(result).toBe(2200); // 500 + 200 + 1500
    });

    it('should subtract expenses from total', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 500,
        blackCashAmount: 0,
        cardSalesAmount: 1000,
        expenses: [
          { amount: 100, description: 'Expense 1' },
          { amount: 200, description: 'Expense 2' },
        ],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = calculateTotalSales(mockCtx as BotContext);
      expect(result).toBe(1200); // 500 + 1000 - 300
    });

    it('should handle zero amounts', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 0,
        blackCashAmount: 0,
        cardSalesAmount: 0,
        expenses: [],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = calculateTotalSales(mockCtx as BotContext);
      expect(result).toBe(0);
    });

    it('should handle undefined report data', () => {
      mockCtx.session!.reportData = undefined;

      const result = calculateTotalSales(mockCtx as BotContext);
      expect(result).toBe(0);
    });

    it('should handle negative total when expenses exceed income', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 100,
        blackCashAmount: 0,
        cardSalesAmount: 100,
        expenses: [{ amount: 500, description: 'Big expense' }],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = calculateTotalSales(mockCtx as BotContext);
      expect(result).toBe(-300); // 100 + 100 - 500
    });
  });

  describe('updateTotalSales', () => {
    it('should update total sales in session', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 500,
        blackCashAmount: 200,
        cardSalesAmount: 1500,
        expenses: [],
        cashboxAmount: 0,
        totalSales: 0,
      };

      updateTotalSales(mockCtx as BotContext);

      expect(mockCtx.session!.reportData!.totalSales).toBe(2200);
    });

    it('should not throw if reportData is undefined', () => {
      mockCtx.session!.reportData = undefined;

      expect(() => updateTotalSales(mockCtx as BotContext)).not.toThrow();
    });
  });

  describe('getTotalSalesBreakdown', () => {
    it('should return breakdown of all components', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 500,
        blackCashAmount: 200,
        cardSalesAmount: 1500,
        expenses: [
          { amount: 100, description: 'Expense 1' },
          { amount: 50, description: 'Expense 2' },
        ],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const breakdown = getTotalSalesBreakdown(mockCtx as BotContext);

      expect(breakdown).toEqual({
        cashAmount: 700, // 500 + 200 (calculated)
        whiteCashAmount: 500,
        blackCashAmount: 200,
        cardSalesAmount: 1500,
        totalExpenses: 150,
        totalSales: 2050, // 700 + 1500 - 150
      });
    });

    it('should handle missing data gracefully', () => {
      mockCtx.session!.reportData = undefined;

      const breakdown = getTotalSalesBreakdown(mockCtx as BotContext);

      expect(breakdown).toEqual({
        cashAmount: 0,
        whiteCashAmount: 0,
        blackCashAmount: 0,
        cardSalesAmount: 0,
        totalExpenses: 0,
        totalSales: 0,
      });
    });
  });

  describe('validateTotalSales', () => {
    it('should validate positive total sales', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 500,
        blackCashAmount: 0,
        cardSalesAmount: 1000,
        expenses: [],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = validateTotalSales(mockCtx as BotContext);

      expect(result.isValid).toBe(true);
      expect(result.totalSales).toBe(1500); // 500 + 1000
      expect(result.reason).toBeUndefined();
    });

    it('should validate zero total sales', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 0,
        blackCashAmount: 0,
        cardSalesAmount: 0,
        expenses: [],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = validateTotalSales(mockCtx as BotContext);

      expect(result.isValid).toBe(true);
      expect(result.totalSales).toBe(0);
    });

    it('should invalidate negative total sales', () => {
      mockCtx.session!.reportData = {
        cashAmount: 0,
        whiteCashAmount: 100,
        blackCashAmount: 0,
        cardSalesAmount: 100,
        expenses: [{ amount: 500, description: 'Big expense' }],
        cashboxAmount: 0,
        totalSales: 0,
      };

      const result = validateTotalSales(mockCtx as BotContext);

      expect(result.isValid).toBe(false);
      expect(result.totalSales).toBe(-300); // 100 + 100 - 500
      expect(result.reason).toBe('Total sales cannot be negative. Please check your expenses.');
    });
  });
});

