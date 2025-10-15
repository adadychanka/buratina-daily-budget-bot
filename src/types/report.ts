import { z } from 'zod';

// Expense validation schema
export const ExpenseSchema = z.object({
  amount: z.number().positive('Expense amount must be positive'),
  description: z.string().min(1, 'Expense description is required'),
});

// Report validation schema
export const ReportSchema = z.object({
  cashAmount: z.number().min(0, 'Cash amount must be non-negative'),
  whiteCashAmount: z.number().min(0, 'White cash amount must be non-negative'),
  blackCashAmount: z.number().min(0, 'Black cash amount must be non-negative'),
  blackCashLocation: z.string().optional(),
  cardSalesAmount: z.number().min(0, 'Card sales amount must be non-negative'),
  expenses: z.array(ExpenseSchema).default([]),
  cashboxAmount: z.number().min(0, 'Cashbox amount must be non-negative'),
  notes: z.string().optional(),
  totalSales: z.number().min(0, 'Total sales must be non-negative'),
});

// Types inferred from schemas
export type Expense = z.infer<typeof ExpenseSchema>;
export type Report = z.infer<typeof ReportSchema>;

// Google Sheets report interface
export interface GoogleSheetsReport {
  date: string;
  totalSales: number;
  cashAmount: number;
  whiteCashAmount: number;
  blackCashAmount: number;
  blackCashLocation: string;
  cardSalesAmount: number;
  totalExpenses: number;
  expensesDetails: string;
  cashboxAmount: number;
  notes: string;
}

// Database report interface
export interface DatabaseReport {
  id: string;
  userId: number;
  date: Date;
  cashAmount: number;
  whiteCashAmount: number;
  blackCashAmount: number;
  blackCashLocation?: string;
  cardSalesAmount: number;
  expenses: Expense[];
  cashboxAmount: number;
  notes?: string;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}
