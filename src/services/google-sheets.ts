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
 * Cell update with optional note for Google Sheets
 */
export interface CellUpdateWithNote {
  row: number;
  value: number | string; // Number for values, empty string to clear cell
  column: string;
  note?: string; // Optional note/comment for the cell
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
    // Support both keyFile (local development) and credentials JSON (production/Railway)
    const authOptions: {
      keyFile?: string;
      credentials?: Record<string, unknown>;
      scopes: string[];
    } = {
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    };

    if (config.googleCredentialsJson) {
      // Use credentials from environment variable (for Railway/production)
      try {
        const credentials = JSON.parse(config.googleCredentialsJson);
        authOptions.credentials = credentials;
        logger.info('Using Google credentials from environment variable');
      } catch (error) {
        logger.error('Failed to parse GOOGLE_CREDENTIALS_JSON', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new Error('Invalid GOOGLE_CREDENTIALS_JSON format. Must be valid JSON.');
      }
    } else if (config.googleCredentialsPath) {
      // Use credentials from file (for local development)
      authOptions.keyFile = config.googleCredentialsPath;
      logger.info('Using Google credentials from file', {
        path: config.googleCredentialsPath,
      });
    } else {
      throw new Error('Either GOOGLE_CREDENTIALS_PATH or GOOGLE_CREDENTIALS_JSON must be provided');
    }

    this.auth = new google.auth.GoogleAuth(authOptions);

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
   * Get sheet ID by sheet name
   * @param sheetName - Name of the sheet
   * @returns Sheet ID (number) or null if not found
   * @throws Error if API call fails
   */
  async getSheetId(sheetName: string): Promise<number | null> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: config.googleSheetsId,
      });

      const sheets = response.data.sheets || [];
      const sheet = sheets.find((s) => s.properties?.title === sheetName);

      if (!sheet || !sheet.properties?.sheetId) {
        logger.warn('Sheet ID not found', { sheetName });
        return null;
      }

      return sheet.properties.sheetId;
    } catch (error) {
      const { error: parsedError } = parseGoogleSheetsError(error);
      logger.error('Failed to get sheet ID', {
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
   * Convert column letter to zero-based index (A -> 0, B -> 1, ..., Z -> 25, AA -> 26, etc.)
   * @param columnLetter - Column letter(s) (e.g., "A", "E", "AA")
   * @returns Zero-based column index
   */
  private columnLetterToIndex(columnLetter: string): number {
    let result = 0;
    for (let i = 0; i < columnLetter.length; i++) {
      result = result * 26 + (columnLetter.charCodeAt(i) - 64);
    }
    return result - 1; // Convert to 0-based
  }

  /**
   * Update cells with values and optional notes in a single atomic transaction
   *
   * Uses batchUpdate to update both cell values and notes atomically.
   * Can handle regular cell updates (values only) and expense updates (values + notes).
   *
   * @param sheetName - Name of the sheet (e.g., "November")
   * @param updates - Array of cell updates (can include notes)
   * @throws SheetNotFoundError if sheet doesn't exist
   * @throws GoogleSheetsError for other API errors
   */
  async updateCellsWithNotes(sheetName: string, updates: CellUpdateWithNote[]): Promise<void> {
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
      // Value can be 0, empty string (for clearing), or a valid number
      if (
        update.value !== 0 &&
        update.value !== '' &&
        (typeof update.value !== 'number' ||
          Number.isNaN(update.value) ||
          !Number.isFinite(update.value))
      ) {
        throw new Error(
          `Invalid value: ${update.value}. Value must be a finite number or empty string`
        );
      }
    }

    try {
      // Get sheet ID
      const sheetId = await this.getSheetId(sheetName);
      if (sheetId === null) {
        throw new SheetNotFoundError(sheetName);
      }

      // Prepare batch update requests
      const requests: Array<{
        updateCells: {
          rows: Array<{
            values: Array<{
              userEnteredValue?: { numberValue?: number; stringValue?: string };
              note?: string;
            }>;
          }>;
          fields: string;
          start: { sheetId: number; rowIndex: number; columnIndex: number };
        };
      }> = [];

      // Group updates by row for efficiency (batchUpdate works better with row-based updates)
      const updatesByRow = new Map<number, CellUpdateWithNote[]>();
      for (const update of updates) {
        const row = update.row - 1; // Convert to 0-based
        if (!updatesByRow.has(row)) {
          updatesByRow.set(row, []);
        }
        updatesByRow.get(row)!.push(update);
      }

      // Create updateCells requests for each row
      for (const [rowIndex, rowUpdates] of updatesByRow.entries()) {
        // Sort by column index to maintain order
        rowUpdates.sort((a, b) => {
          const colA = this.columnLetterToIndex(a.column);
          const colB = this.columnLetterToIndex(b.column);
          return colA - colB;
        });

        // Find min and max column indices for this row
        const columnIndices = rowUpdates.map((u) => this.columnLetterToIndex(u.column));
        const minCol = Math.min(...columnIndices);
        // const maxCol = Math.max(...columnIndices);

        // Create values array for the range
        const values: Array<{
          userEnteredValue?: { numberValue?: number; stringValue?: string };
          note?: string;
        }> = [];

        // Fill values array (some cells may be skipped)
        let currentCol = minCol;
        for (const update of rowUpdates) {
          const updateCol = this.columnLetterToIndex(update.column);
          // Fill gaps with empty cells if needed
          while (currentCol < updateCol) {
            values.push({});
            currentCol++;
          }

          // Add the actual update
          const cellValue: {
            userEnteredValue?: { numberValue?: number; stringValue?: string };
            note?: string;
          } = {};

          // Set value (empty string to clear, number otherwise)
          if (update.value === '' || update.value === null || update.value === undefined) {
            cellValue.userEnteredValue = { stringValue: '' };
          } else if (typeof update.value === 'number') {
            cellValue.userEnteredValue = { numberValue: update.value };
          } else {
            // String value (for clearing cells)
            cellValue.userEnteredValue = { stringValue: String(update.value) };
          }

          // Set note if provided
          if (update.note !== undefined && update.note !== null && update.note.trim().length > 0) {
            cellValue.note = update.note;
          }

          values.push(cellValue);
          currentCol++;
        }

        // Determine fields to update
        const hasNotes = rowUpdates.some(
          (u) => u.note !== undefined && u.note !== null && u.note.trim().length > 0
        );
        const fields = hasNotes ? 'userEnteredValue,note' : 'userEnteredValue';

        requests.push({
          updateCells: {
            rows: [{ values }],
            fields,
            start: {
              sheetId,
              rowIndex,
              columnIndex: minCol,
            },
          },
        });
      }

      // Execute batch update
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.googleSheetsId,
        requestBody: {
          requests,
        },
      });

      logger.info('Successfully updated cells with notes in Google Sheets', {
        sheetId: config.googleSheetsId,
        sheetName,
        cellCount: updates.length,
        cells: updates.map((u) => `${u.column}${u.row}`),
        notesCount: updates.filter((u) => u.note && u.note.trim().length > 0).length,
      });
    } catch (error) {
      const { error: parsedError } = parseGoogleSheetsError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check for specific error types
      if (errorMessage.includes('Unable to parse range') || errorMessage.includes('NOT_FOUND')) {
        throw new SheetNotFoundError(sheetName, error);
      }

      logger.error('Failed to update cells with notes in Google Sheets', {
        error: parsedError.message,
        sheetId: config.googleSheetsId,
        sheetName,
        cellCount: updates.length,
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
