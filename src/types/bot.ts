import type { Context, Scenes } from 'telegraf';

export interface SessionData extends Scenes.SceneSession {
  reportData?: Partial<ReportData>;
  step?: string;
  collectingExpense?: boolean;
  currentExpenseAmount?: number;
  editMode?: boolean;
  editingField?: string;
  checklistData?: ChecklistData;
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
  reportDate: Date;
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

// Checklist types
export interface ChecklistItem {
  text: string;
}

export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export interface Checklist {
  name: string;
  categories: ChecklistCategory[];
  itemsWithoutCategory: ChecklistItem[];
}

export interface ChecklistData {
  selectedChecklist?: string;
  step?: string;
  names?: string[]; // Store checklist names for callback handling
}
