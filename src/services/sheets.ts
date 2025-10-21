import { google } from 'googleapis';
import * as path from 'path';

/**
 * Google Sheets service for reading and writing tournament data
 */
export class SheetsService {
  private sheets;
  private auth;

  constructor() {
    // Load credentials from the keys folder
    const keyPath = path.join(__dirname, '../../keys/vpoll-key.json');

    this.auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Read values from a specific range in a spreadsheet
   * @param spreadsheetId - The ID of the spreadsheet (from the URL)
   * @param range - The A1 notation range (e.g., "Rank!A1:B65" or "Teams!A1:E17")
   * @returns The values from the range
   */
  async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Write values to a specific range in a spreadsheet
   * @param spreadsheetId - The ID of the spreadsheet
   * @param range - The A1 notation range
   * @param values - 2D array of values to write
   */
  async writeRange(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error writing to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Read multiple ranges at once (batch read)
   * @param spreadsheetId - The ID of the spreadsheet
   * @param ranges - Array of A1 notation ranges
   * @returns Object with range names as keys and values as arrays
   */
  async batchReadRanges(
    spreadsheetId: string,
    ranges: string[]
  ): Promise<{ [range: string]: any[][] }> {
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      });

      const result: { [range: string]: any[][] } = {};

      if (response.data.valueRanges) {
        response.data.valueRanges.forEach((valueRange) => {
          if (valueRange.range) {
            result[valueRange.range] = valueRange.values || [];
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error batch reading from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Get spreadsheet metadata (tab names, etc.)
   * @param spreadsheetId - The ID of the spreadsheet
   */
  async getSpreadsheetMetadata(spreadsheetId: string) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting spreadsheet metadata:', error);
      throw error;
    }
  }
}
