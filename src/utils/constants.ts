// Bot command constants
export const BOT_COMMANDS = {
  START: '/start',
  HELP: '/help',
  REPORT: '/report',
  HISTORY: '/history',
} as const;

// Scene constants
export const SCENES = {
  REPORT: 'report',
} as const;

// Report step constants
export const REPORT_STEPS = {
  CASH_AMOUNT: 'cashAmount',
  WHITE_CASH_AMOUNT: 'whiteCashAmount',
  BLACK_CASH_AMOUNT: 'blackCashAmount',
  BLACK_CASH_LOCATION: 'blackCashLocation',
  CARD_SALES_AMOUNT: 'cardSalesAmount',
  EXPENSES: 'expenses',
  CASHBOX_AMOUNT: 'cashboxAmount',
  NOTES: 'notes',
  CONFIRMATION: 'confirmation',
} as const;

// Validation constants
export const VALIDATION = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
} as const;

// Message constants
export const MESSAGES = {
  WELCOME: 'Welcome to Daily Budget Bot!',
  ERROR: 'An error occurred. Please try again later.',
  INVALID_INPUT: 'Invalid input. Please try again.',
  SUCCESS: 'Operation completed successfully!',
  CANCELLED: 'Operation cancelled.',
  REPORT_START: "📊 Let's create a new report!",
  REPORT_CANCELLED: '❌ Report cancelled.',
  REPORT_ERROR: 'An error occurred. Please try again or use /cancel.',
  AMOUNT_SAVED: '✅ Amount saved',
  REPORT_SUMMARY: '📊 Report Summary:',
  REPORT_COMPLETED: 'Report completed! (More fields will be added later)',
} as const;

// Report field prompts
export const PROMPTS = {
  CASH_AMOUNT: 'Enter Cash amount:',
  WHITE_CASH_AMOUNT: 'Enter White Cash amount:',
  BLACK_CASH_AMOUNT: 'Enter Black Cash amount:',
  BLACK_CASH_LOCATION: "Where was Black Cash saved (e.g., 'Friday', 'Monday')?",
  CARD_SALES_AMOUNT: 'Enter Card sales amount:',
  CASHBOX_AMOUNT: 'Enter total amount in cashbox at end of shift:',
  NOTES: 'Any additional notes?',
  INVALID_AMOUNT: 'Please enter a valid amount:',
} as const;

// Google Sheets constants
export const GOOGLE_SHEETS = {
  RANGE: 'Sheet1!A:J',
  COLUMNS: {
    DATE: 0,
    TOTAL_SALES: 1,
    CASH_AMOUNT: 2,
    WHITE_CASH: 3,
    BLACK_CASH: 4,
    BLACK_CASH_LOCATION: 5,
    CARD_SALES: 6,
    TOTAL_EXPENSES: 7,
    EXPENSES_DETAILS: 8,
    CASHBOX_AMOUNT: 9,
    NOTES: 10,
  },
} as const;

// Database constants
export const DATABASE = {
  TABLES: {
    USERS: 'users',
    REPORTS: 'reports',
  },
  LIMITS: {
    MAX_REPORTS_PER_USER: 1000,
    MAX_HISTORY_DISPLAY: 10,
  },
} as const;
