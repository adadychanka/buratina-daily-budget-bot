// Bot command constants
export const BOT_COMMANDS = {
  START: '/start',
  HELP: '/help',
  REPORT: '/report',
  HISTORY: '/history',
  CHECKLIST: '/checklist',
} as const;

// Scene constants
export const SCENES = {
  REPORT: 'report',
  CHECKLIST: 'checklist',
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
  REPORT_DATE: 'reportDate',
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
  // Checklist messages
  CHECKLIST_LIST: '📋 Available checklists:',
  CHECKLIST_SELECTED: '📋 Checklist:',
  CHECKLIST_COMPLETED: '✅ Checklist completed!',
  CHECKLIST_CANCELLED: '❌ Checklist cancelled.',
  CHECKLIST_ERROR: 'An error occurred while loading checklist.',
  CHECKLIST_CONTINUATION: '(continuation)',
  CHECKLIST_NO_CATEGORY: 'No Category',
  CHECKLIST_EMPTY: '📋 *Checklist is empty*',
  // Friendly messages when checklist is selected
  CHECKLIST_MOTIVATIONAL_MESSAGES: [
    "Alright, let's go through this! 😊",
    'Here we go, checking everything step by step 📝',
    'Nothing fancy, just going through the list ✨',
    "Quick check and we're done! ⚡",
    'Okay, let me see what we have here 👀',
    "Let's check everything so we don't miss anything 🎯",
    'Take it easy, you got this! 💪',
  ],
} as const;

// Report field prompts
export const PROMPTS = {
  CASH_AMOUNT: '💰 Enter Cash amount:',
  WHITE_CASH_AMOUNT: '💵 Enter White Cash amount:',
  BLACK_CASH_AMOUNT: '🖤 Enter Black Cash amount:',
  BLACK_CASH_LOCATION: '📅 Select the weekday when Black Cash was saved:',
  CARD_SALES_AMOUNT: '💳 Enter Card sales amount:',
  EXPENSES_QUESTION: '📦 Do you have any expenses to record?',
  EXPENSE_AMOUNT: '💸 Enter expense amount:',
  EXPENSE_DESCRIPTION: '📝 Enter expense description:',
  CASHBOX_AMOUNT: '🏦 Enter total amount in cashbox at end of shift:',
  NOTES: '📄 Any additional notes? (Type message or /skip)',
  REPORT_DATE: '📅 Select the report date:',
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
  // Checklist buttons
  CHECKLIST_DONE: '✅ Done',
  CHECKLIST_CANCEL: '❌ Cancel',
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
  // Date selection
  DATE_TODAY: 'date_today',
  DATE_YESTERDAY: 'date_yesterday',
  DATE_2_DAYS: 'date_2_days',
  // Expenses
  EXPENSE_ADD: 'expense_add',
  EXPENSE_SKIP: 'expense_skip',
  EXPENSE_ANOTHER: 'expense_another',
  EXPENSE_DONE: 'expense_done',
  // Confirmation
  CONFIRM_REPORT: 'confirm_report',
  EDIT_REPORT: 'edit_report',
  CANCEL_REPORT: 'cancel_report',
  // Checklist
  CHECKLIST_SELECT: 'checklist_select',
  CHECKLIST_COMPLETE: 'checklist_complete',
  CHECKLIST_CANCEL: 'checklist_cancel',
} as const;

// Google Sheets constants
// Note: RANGE is for reference only, actual range is configured via GOOGLE_SHEETS_RANGE env var
// Actual data spans 12 columns (A-L), but range A:J is sufficient for append operation
export const GOOGLE_SHEETS = {
  RANGE: 'Sheet1!A:J',
  COLUMNS: {
    DATE: 0, // Column A
    TOTAL_SALES: 1, // Column B
    TOTAL_AMOUNT_OF_DAY: 2, // Column C
    CASH_AMOUNT: 3, // Column D
    WHITE_CASH: 4, // Column E
    BLACK_CASH: 5, // Column F
    BLACK_CASH_LOCATION: 6, // Column G
    CARD_SALES: 7, // Column H
    TOTAL_EXPENSES: 8, // Column I
    EXPENSES_DETAILS: 9, // Column J
    CASHBOX_AMOUNT: 10, // Column K
    NOTES: 11, // Column L
  },
  // Row numbers for report data cells
  ROWS: {
    DATE_ROW: 6, // Row containing dates (01.10.2025, 02.10.2025, etc.)
    WHITE_CASH_ROW: 13, // Row for fiscal cash (2.1)
    BLACK_CASH_ROW: 14, // Row for cash (2.2)
    CARD_SALES_ROW: 16, // Row for non-cash income excluding acquiring (2.4)
    EXPENSES_START_ROW: 19, // First row for expenses
    EXPENSES_END_ROW: 28, // Last row for expenses (10 cells total)
  },
  MAX_EXPENSES: 10, // Maximum number of expenses per report
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
  EDIT_REPORT_DATE: 'edit_report_date',
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
  REPORT_DATE: '📅 Report Date',
  DONE_EDITING: '✅ Done Editing',
} as const;

// Checklist step constants
export const CHECKLIST_STEPS = {
  LIST: 'list',
  VIEWING: 'viewing',
  COMPLETED: 'completed',
} as const;
