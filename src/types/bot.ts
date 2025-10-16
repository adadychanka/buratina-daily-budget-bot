import type { Context, Scenes } from "telegraf";

export interface SessionData extends Scenes.SceneSession {
  reportData?: Partial<ReportData>;
  step?: string;
}

export interface BotContext extends Context {
  session: SessionData;
  scene: Scenes.SceneContextScene<BotContext>;
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
