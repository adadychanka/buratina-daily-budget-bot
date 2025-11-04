import { google } from 'googleapis';
import { logger } from '../config/logger';
import { config } from '../config/settings';

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
}
