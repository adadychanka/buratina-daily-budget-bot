import { logger } from '../config/logger';
import type { Expense, ReportData } from '../types/bot';
import { GOOGLE_SHEETS } from '../utils/constants';
import { formatDateForSheets, getMonthNameEnglish } from '../utils/formatters';
import type { CellUpdate, CellUpdateWithNote, GoogleSheetsService } from './google-sheets';
import { DateColumnNotFoundError, SheetNotFoundError } from './google-sheets-errors';

/**
 * Validates report data before saving to Google Sheets
 * @param reportData - Report data to validate
 * @throws Error if validation fails
 */
function validateReportData(reportData: ReportData): void {
  if (!reportData) {
    throw new Error('Report data is required');
  }

  if (!reportData.reportDate) {
    throw new Error('Report date is required');
  }

  if (!(reportData.reportDate instanceof Date) || Number.isNaN(reportData.reportDate.getTime())) {
    throw new Error('Report date must be a valid date');
  }

  if (typeof reportData.whiteCashAmount !== 'number' || Number.isNaN(reportData.whiteCashAmount)) {
    throw new Error('White cash amount must be a valid number');
  }

  if (reportData.whiteCashAmount < 0) {
    throw new Error('White cash amount cannot be negative');
  }

  if (typeof reportData.blackCashAmount !== 'number' || Number.isNaN(reportData.blackCashAmount)) {
    throw new Error('Black cash amount must be a valid number');
  }

  if (reportData.blackCashAmount < 0) {
    throw new Error('Black cash amount cannot be negative');
  }

  if (typeof reportData.cardSalesAmount !== 'number' || Number.isNaN(reportData.cardSalesAmount)) {
    throw new Error('Card sales amount must be a valid number');
  }

  if (reportData.cardSalesAmount < 0) {
    throw new Error('Card sales amount cannot be negative');
  }

  // Validate expenses
  if (!Array.isArray(reportData.expenses)) {
    throw new Error('Expenses must be an array');
  }

  if (reportData.expenses.length > GOOGLE_SHEETS.MAX_EXPENSES) {
    throw new Error(
      `Maximum ${GOOGLE_SHEETS.MAX_EXPENSES} expenses allowed, got ${reportData.expenses.length}`
    );
  }

  for (let i = 0; i < reportData.expenses.length; i++) {
    const expense = reportData.expenses[i];
    if (!expense) {
      throw new Error(`Expense at index ${i} is missing`);
    }

    if (typeof expense.amount !== 'number' || Number.isNaN(expense.amount)) {
      throw new Error(`Expense at index ${i}: amount must be a valid number`);
    }

    if (expense.amount <= 0) {
      throw new Error(`Expense at index ${i}: amount must be greater than 0`);
    }

    if (typeof expense.description !== 'string') {
      throw new Error(`Expense at index ${i}: description must be a string`);
    }
  }
}

/**
 * Creates cell updates array for report data (main data only, no expenses)
 * @param column - Column letter (e.g., "E", "F")
 * @param reportData - Report data to convert
 * @returns Array of cell updates
 */
function createCellUpdates(column: string, reportData: ReportData): CellUpdate[] {
  return [
    {
      row: GOOGLE_SHEETS.ROWS.WHITE_CASH_ROW,
      value: reportData.whiteCashAmount,
      column,
    },
    {
      row: GOOGLE_SHEETS.ROWS.BLACK_CASH_ROW,
      value: reportData.blackCashAmount,
      column,
    },
    {
      row: GOOGLE_SHEETS.ROWS.CARD_SALES_ROW,
      value: reportData.cardSalesAmount,
      column,
    },
  ];
}

/**
 * Creates expense cell updates array
 *
 * Always creates updates for all 10 expense cells (rows 19-28).
 * Fills with actual expenses, then clears remaining cells.
 *
 * @param column - Column letter (e.g., "E", "F")
 * @param expenses - Array of expenses
 * @returns Array of cell updates with notes
 */
function createExpenseCellUpdates(column: string, expenses: Expense[]): CellUpdateWithNote[] {
  const updates: CellUpdateWithNote[] = [];
  const maxExpenses = GOOGLE_SHEETS.MAX_EXPENSES;
  const startRow = GOOGLE_SHEETS.ROWS.EXPENSES_START_ROW;

  // Process each expense cell (always 10 cells)
  for (let i = 0; i < maxExpenses; i++) {
    const row = startRow + i;
    const expense = expenses[i];

    if (expense) {
      // Process expense: trim description and limit length
      let description = expense.description.trim();
      const originalLength = description.length;

      // Limit to 1000 characters
      if (description.length > 1000) {
        description = description.substring(0, 1000);
        logger.warn('Expense description truncated', {
          expenseIndex: i,
          originalLength,
          truncatedLength: 1000,
          cell: `${column}${row}`,
        });
      }

      // Log each expense individually
      logger.debug('Preparing expense cell update', {
        expenseIndex: i,
        amount: expense.amount,
        descriptionLength: description.length,
        cell: `${column}${row}`,
      });

      updates.push({
        row,
        value: expense.amount,
        column,
        // Only add note if description is not empty
        note: description.length > 0 ? description : undefined,
      });
    } else {
      // Clear unused expense cell
      updates.push({
        row,
        value: '', // Empty string to clear cell
        column,
        // No note for cleared cells
      });
    }
  }

  return updates;
}

/**
 * Save report data to Google Sheets in the correct cells
 *
 * The function:
 * 1. Determines sheet name from report date (month name, e.g., "November")
 * 2. Finds the column for the report date in row 6
 * 3. Updates cells in rows 13 (white cash), 14 (black cash), and 16 (card sales)
 *
 * @param sheetsService - Google Sheets service instance
 * @param reportData - Report data to save
 * @throws Error if sheet/date not found or update fails
 */
export async function saveReportToSheets(
  sheetsService: GoogleSheetsService,
  reportData: ReportData
): Promise<void> {
  // Validate report data
  validateReportData(reportData);

  // Get sheet name from report date (e.g., "November")
  const sheetName = getMonthNameEnglish(reportData.reportDate);

  // Validate sheet name is not empty
  if (!sheetName || sheetName.trim().length === 0) {
    throw new Error('Unable to determine sheet name from report date');
  }

  // Format date for search (dd.MM.yyyy)
  const dateString = formatDateForSheets(reportData.reportDate);

  logger.info('Saving report to Google Sheets', {
    sheetName,
    dateString,
    whiteCash: reportData.whiteCashAmount,
    blackCash: reportData.blackCashAmount,
    cardSales: reportData.cardSalesAmount,
  });

  // Check if sheet exists before attempting to find date column
  const sheetExists = await sheetsService.sheetExists(sheetName);
  if (!sheetExists) {
    throw new SheetNotFoundError(
      sheetName,
      new Error(`Sheet "${sheetName}" does not exist in the spreadsheet`)
    );
  }

  // Find column for the date
  const column = await sheetsService.findDateColumn(sheetName, dateString);
  if (!column) {
    throw new DateColumnNotFoundError(sheetName, dateString);
  }

  // Prepare all cell updates (main data + expenses) for single atomic transaction
  const mainDataUpdates = createCellUpdates(column, reportData);
  const expenseUpdates = createExpenseCellUpdates(column, reportData.expenses || []);

  // Combine all updates into single transaction
  // Convert main data updates to CellUpdateWithNote format (no notes)
  const allUpdates: CellUpdateWithNote[] = [
    ...mainDataUpdates.map((update) => ({
      ...update,
      note: undefined,
    })),
    ...expenseUpdates,
  ];

  // Log expenses individually before saving
  if (reportData.expenses && reportData.expenses.length > 0) {
    logger.info('Saving expenses to Google Sheets', {
      expenseCount: reportData.expenses.length,
      expenses: reportData.expenses.map((exp, idx) => ({
        index: idx,
        amount: exp.amount,
        descriptionLength: exp.description.trim().length,
        cell: `${column}${GOOGLE_SHEETS.ROWS.EXPENSES_START_ROW + idx}`,
      })),
    });
  } else {
    logger.info('No expenses to save, clearing all expense cells');
  }

  // Update all cells in single atomic transaction
  await sheetsService.updateCellsWithNotes(sheetName, allUpdates);

  logger.info('Successfully saved report to Google Sheets', {
    sheetName,
    dateString,
    column,
    cellsUpdated: allUpdates.map((u) => `${u.column}${u.row}`),
    mainDataCells: mainDataUpdates.map((u) => `${u.column}${u.row}`),
    expenseCells: expenseUpdates.map((u) => `${u.column}${u.row}`),
    expenseCount: reportData.expenses?.length || 0,
    values: {
      whiteCash: reportData.whiteCashAmount,
      blackCash: reportData.blackCashAmount,
      cardSales: reportData.cardSalesAmount,
      totalExpenses: reportData.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
    },
  });
}
