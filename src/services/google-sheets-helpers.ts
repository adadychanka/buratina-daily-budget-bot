import { logger } from '../config/logger';
import type { ReportData } from '../types/bot';
import { GOOGLE_SHEETS } from '../utils/constants';
import { formatDateForSheets, getMonthNameEnglish } from '../utils/formatters';
import type { CellUpdate, GoogleSheetsService } from './google-sheets';
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
}

/**
 * Creates cell updates array for report data
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

  // Prepare cell updates
  const updates = createCellUpdates(column, reportData);

  // Update cells in batch
  await sheetsService.updateCells(sheetName, updates);

  logger.info('Successfully saved report to Google Sheets', {
    sheetName,
    dateString,
    column,
    cellsUpdated: updates.map((u) => `${u.column}${u.row}`),
    values: {
      whiteCash: reportData.whiteCashAmount,
      blackCash: reportData.blackCashAmount,
      cardSales: reportData.cardSalesAmount,
    },
  });
}
