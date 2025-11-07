import { google } from 'googleapis';
import { logger } from '../config/logger';
import { config } from '../config/settings';
import { GOOGLE_SHEETS } from '../utils/constants';
import { parseGoogleSheetsError, SheetNotFoundError } from './google-sheets-errors';

/**
 * Cell update interface for Google Sheets
 */
export interface CellUpdate {
  row: number;
  value: number;
  column: string;
}

/**
 * Google Sheets Service
 *
 * Handles integration with Google Sheets API using Service Account authentication.
 * This service is used to append report data to a Google Sheet for centralized storage.
 */
export class GoogleSheetsService {
  private sheets;
  private auth;

  constructor() {
    // Initialize Google Auth with Service Account
    this.auth = new google.auth.GoogleAuth({
      keyFile: config.googleCredentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize Google Sheets API client
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Append a row of data to the Google Sheet
   * @param values - Array of values to append (one row)
   * @throws Error if the append operation fails
   */
  async appendRow(values: string[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.googleSheetsId,
        range: config.googleSheetsRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });

      logger.info('Successfully appended row to Google Sheets', {
        sheetId: config.googleSheetsId,
        range: config.googleSheetsRange,
        rowCount: values.length,
      });
    } catch (error) {
      logger.error('Failed to append row to Google Sheets', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sheetId: config.googleSheetsId,
        range: config.googleSheetsRange,
      });
      throw error;
    }
  }

  /**
   * Test the connection to Google Sheets by reading the first row
   * @returns true if connection is successful, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: 'Sheet1!A1:Z1',
      });

      logger.info('Google Sheets connection test successful', {
        sheetId: config.googleSheetsId,
      });
      return true;
    } catch (error) {
      logger.error('Google Sheets connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sheetId: config.googleSheetsId,
      });
      return false;
    }
  }

  /**
   * Update specific cells in Google Sheet
   *
   * Performs batch update of multiple cells in a single API call for efficiency.
   *
   * @param sheetName - Name of the sheet (e.g., "November")
   * @param updates - Array of cell updates with row number, value, and column letter
   * @throws SheetNotFoundError if sheet doesn't exist
   * @throws GoogleSheetsPermissionError if permission denied
   * @throws GoogleSheetsError for other API errors
   */
  async updateCells(sheetName: string, updates: CellUpdate[]): Promise<void> {
    if (updates.length === 0) {
      logger.warn('No cell updates provided');
      return;
    }

    // Validate updates
    for (const update of updates) {
      if (update.row < 1) {
        throw new Error(`Invalid row number: ${update.row}. Row numbers must be >= 1`);
      }
      if (!update.column || update.column.trim().length === 0) {
        throw new Error('Column letter cannot be empty');
      }
      if (Number.isNaN(update.value) || !Number.isFinite(update.value)) {
        throw new Error(`Invalid value: ${update.value}. Value must be a finite number`);
      }
    }

    try {
      const data: Array<{ range: string; values: string[][] }> = updates.map((update) => ({
        range: `${sheetName}!${update.column}${update.row}`,
        values: [[update.value.toString()]],
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: config.googleSheetsId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data,
        },
      });

      logger.info('Successfully updated cells in Google Sheets', {
        sheetId: config.googleSheetsId,
        sheetName,
        cellCount: updates.length,
        cells: updates.map((u) => `${u.column}${u.row}`),
      });
    } catch (error) {
      const { error: parsedError } = parseGoogleSheetsError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check for specific error types
      if (errorMessage.includes('Unable to parse range') || errorMessage.includes('NOT_FOUND')) {
        throw new SheetNotFoundError(sheetName, error);
      }

      logger.error('Failed to update cells in Google Sheets', {
        error: parsedError.message,
        sheetId: config.googleSheetsId,
        sheetName,
        cellCount: updates.length,
        cells: updates.map((u) => `${u.column}${u.row}`),
        originalError: errorMessage,
      });

      throw parsedError;
    }
  }

  /**
   * Check if a sheet exists in the spreadsheet
   * @param sheetName - Name of the sheet to check
   * @returns true if sheet exists, false otherwise
   */
  async sheetExists(sheetName: string): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: config.googleSheetsId,
      });

      const sheets = response.data.sheets || [];
      return sheets.some((sheet) => sheet.properties?.title === sheetName);
    } catch (error) {
      const { error: parsedError } = parseGoogleSheetsError(error);
      logger.error('Failed to check if sheet exists', {
        error: parsedError.message,
        sheetName,
      });
      throw parsedError;
    }
  }

  /**
   * Find column index for a specific date in the sheet
   *
   * Dates are located in row 6. First date (e.g., "01.10.2025") is in column E.
   * Subsequent dates shift to next columns (F, G, H, etc.)
   *
   * @param sheetName - Name of the sheet (e.g., "November")
   * @param dateString - Date in format "dd.MM.yyyy" (e.g., "01.10.2025")
   * @returns Column letter (e.g., "E", "F") or null if not found
   * @throws SheetNotFoundError if sheet doesn't exist
   * @throws DateColumnNotFoundError if date is not found (when required)
   * @throws GoogleSheetsError for other API errors
   */
  async findDateColumn(sheetName: string, dateString: string): Promise<string | null> {
    try {
      // Validate sheet name format
      if (!sheetName || sheetName.trim().length === 0) {
        throw new Error('Sheet name cannot be empty');
      }

      // Read row containing dates (row 6)
      // Google Sheets API returns array where index corresponds to column position
      // (A=0, B=1, C=2, D=3, E=4, etc.)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: `${sheetName}!${GOOGLE_SHEETS.ROWS.DATE_ROW}:${GOOGLE_SHEETS.ROWS.DATE_ROW}`,
      });

      const values = response.data.values?.[0] || [];

      // Check if date row exists and has data
      if (values.length === 0) {
        logger.warn('Date row is empty in sheet', {
          sheetName,
          dateRow: GOOGLE_SHEETS.ROWS.DATE_ROW,
        });
        return null;
      }

      // Search for exact match (dates should match exactly in format "dd.MM.yyyy")
      const dateIndex = values.findIndex((cell) => {
        const cellValue = String(cell || '').trim();
        return cellValue === dateString;
      });

      if (dateIndex === -1) {
        logger.warn('Date column not found in sheet', {
          sheetName,
          dateString,
          availableDates: values.slice(0, 10), // Log first 10 for debugging
          totalDatesFound: values.length,
        });
        return null;
      }

      // Convert index to column letter (A=0, B=1, ..., E=4, F=5, etc.)
      // For first date "01.10.2025" at index 4, this should return "E"
      const columnLetter = this.indexToColumnLetter(dateIndex);

      logger.debug('Found date column', {
        sheetName,
        dateString,
        dateIndex,
        columnLetter,
      });

      return columnLetter;
    } catch (error) {
      const { error: parsedError } = parseGoogleSheetsError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a sheet not found error
      if (errorMessage.includes('Unable to parse range') || errorMessage.includes('NOT_FOUND')) {
        const sheetError = new SheetNotFoundError(sheetName, error);
        logger.error('Sheet not found', {
          sheetName,
          dateString,
          error: sheetError.message,
        });
        throw sheetError;
      }

      logger.error('Failed to find date column in Google Sheets', {
        error: parsedError.message,
        sheetName,
        dateString,
        originalError: errorMessage,
      });

      throw parsedError;
    }
  }

  /**
   * Convert column index to column letter (0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, etc.)
   * @param index - Zero-based column index
   * @returns Column letter(s)
   */
  private indexToColumnLetter(index: number): string {
    let result = '';
    let num = index;
    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }
}
