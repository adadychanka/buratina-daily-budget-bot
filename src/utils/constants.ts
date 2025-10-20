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
  CASH_AMOUNT: '💰 Enter Cash amount:',
  WHITE_CASH_AMOUNT: '💵 Enter White Cash amount:',
  BLACK_CASH_AMOUNT: '🖤 Enter Black Cash amount:',
  BLACK_CASH_LOCATION: '📍 Select the weekday when Black Cash was saved:',
  CARD_SALES_AMOUNT: '💳 Enter Card sales amount:',
  EXPENSES_QUESTION: '📦 Do you have any expenses to record?',
  EXPENSE_AMOUNT: '💸 Enter expense amount:',
  EXPENSE_DESCRIPTION: '📝 Enter expense description:',
  CASHBOX_AMOUNT: '🏦 Enter total amount in cashbox at end of shift:',
  NOTES: '📄 Any additional notes? (Type message or /skip)',
  INVALID_AMOUNT: '❌ Please enter a valid amount:',
  INVALID_TEXT: '❌ Please enter valid text:',
} as const;

// Button labels
export const BUTTONS = {
  // Weekday buttons
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  // Expense buttons
  ADD_EXPENSE: '➕ Add Expense',
  SKIP_EXPENSES: '⏭️ Skip Expenses',
  ADD_ANOTHER_EXPENSE: '➕ Add Another',
  DONE_EXPENSES: '✅ Done',
  // Confirmation buttons
  CONFIRM: '✅ Confirm',
  EDIT: '✏️ Edit',
  CANCEL: '❌ Cancel',
} as const;

// Callback data constants
export const CALLBACKS = {
  // Weekdays
  WEEKDAY_MONDAY: 'weekday_monday',
  WEEKDAY_TUESDAY: 'weekday_tuesday',
  WEEKDAY_WEDNESDAY: 'weekday_wednesday',
  WEEKDAY_THURSDAY: 'weekday_thursday',
  WEEKDAY_FRIDAY: 'weekday_friday',
  WEEKDAY_SATURDAY: 'weekday_saturday',
  WEEKDAY_SUNDAY: 'weekday_sunday',
  // Expenses
  EXPENSE_ADD: 'expense_add',
  EXPENSE_SKIP: 'expense_skip',
  EXPENSE_ANOTHER: 'expense_another',
  EXPENSE_DONE: 'expense_done',
  // Confirmation
  CONFIRM_REPORT: 'confirm_report',
  EDIT_REPORT: 'edit_report',
  CANCEL_REPORT: 'cancel_report',
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

// Edit mode constants
export const EDIT_MODE = {
  FIELD_SELECTION: 'editFieldSelection',
  EDITING_FIELD: 'editingField',
} as const;

export const EDIT_CALLBACKS = {
  EDIT_CASH: 'edit_cash',
  EDIT_WHITE_CASH: 'edit_white_cash',
  EDIT_BLACK_CASH: 'edit_black_cash',
  EDIT_BLACK_CASH_LOCATION: 'edit_black_cash_location',
  EDIT_CARD_SALES: 'edit_card_sales',
  EDIT_EXPENSES: 'edit_expenses',
  EDIT_CASHBOX: 'edit_cashbox',
  EDIT_NOTES: 'edit_notes',
  DONE_EDITING: 'done_editing',
} as const;

export const EDIT_BUTTONS = {
  CASH: '💰 Cash',
  WHITE_CASH: '💳 White Cash',
  BLACK_CASH: '🖤 Black Cash',
  BLACK_CASH_LOCATION: '📍 Black Cash Location',
  CARD_SALES: '💳 Card Sales',
  EXPENSES: '📦 Expenses',
  CASHBOX: '💰 Cashbox',
  NOTES: '📝 Notes',
  DONE_EDITING: '✅ Done Editing',
} as const;
