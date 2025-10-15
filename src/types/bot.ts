import type { Context } from 'telegraf';

export interface BotContext extends Context {
  session?: {
    reportData?: Partial<ReportData>;
    currentScene?: string;
    step?: string;
  };
}

export interface ReportData {
  cashAmount: number;
  whiteCashAmount: number;
  blackCashAmount: number;
  blackCashLocation?: string;
  cardSalesAmount: number;
  expenses: Expense[];
  cashboxAmount: number;
  notes?: string;
  totalSales: number;
}

export interface Expense {
  amount: number;
  description: string;
}

export interface UserSession {
  userId: number;
  currentScene?: string;
  reportData?: Partial<ReportData>;
  step?: string;
  createdAt: Date;
  updatedAt: Date;
}
