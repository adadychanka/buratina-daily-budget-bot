// Types for Prisma schema
export interface PrismaReport {
  id: string;
  userId: number;
  date: Date;
  cashAmount: number;
  whiteCashAmount: number;
  blackCashAmount: number;
  blackCashLocation?: string | null;
  cardSalesAmount: number;
  expenses: unknown; // JSON field
  cashboxAmount: number;
  notes?: string | null;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaUser {
  id: string;
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database connection types
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
