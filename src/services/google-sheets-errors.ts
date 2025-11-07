/**
 * Custom error classes for Google Sheets operations
 */

/**
 * Base error class for Google Sheets operations
 */
export class GoogleSheetsError extends Error {
  constructor(
    message: string,
    public readonly sheetName?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'GoogleSheetsError';
    Object.setPrototypeOf(this, GoogleSheetsError.prototype);
  }
}

/**
 * Error thrown when a sheet is not found
 */
export class SheetNotFoundError extends GoogleSheetsError {
  constructor(sheetName: string, originalError?: unknown) {
    super(`Sheet "${sheetName}" not found in spreadsheet`, sheetName, originalError);
    this.name = 'SheetNotFoundError';
    Object.setPrototypeOf(this, SheetNotFoundError.prototype);
  }
}

/**
 * Error thrown when a date column is not found
 */
export class DateColumnNotFoundError extends GoogleSheetsError {
  constructor(
    sheetName: string,
    public readonly dateString: string,
    originalError?: unknown
  ) {
    super(`Date "${dateString}" not found in sheet "${sheetName}"`, sheetName, originalError);
    this.name = 'DateColumnNotFoundError';
    Object.setPrototypeOf(this, DateColumnNotFoundError.prototype);
  }
}

/**
 * Error thrown when there are permission issues
 */
export class GoogleSheetsPermissionError extends GoogleSheetsError {
  constructor(message: string, originalError?: unknown) {
    super(`Permission denied: ${message}`, undefined, originalError);
    this.name = 'GoogleSheetsPermissionError';
    Object.setPrototypeOf(this, GoogleSheetsPermissionError.prototype);
  }
}

/**
 * Error thrown when API quota is exceeded
 */
export class GoogleSheetsQuotaError extends GoogleSheetsError {
  constructor(message: string, originalError?: unknown) {
    super(`API quota exceeded: ${message}`, undefined, originalError);
    this.name = 'GoogleSheetsQuotaError';
    Object.setPrototypeOf(this, GoogleSheetsQuotaError.prototype);
  }
}

/**
 * Error thrown when there's a network or connection issue
 */
export class GoogleSheetsConnectionError extends GoogleSheetsError {
  constructor(message: string, originalError?: unknown) {
    super(`Connection error: ${message}`, undefined, originalError);
    this.name = 'GoogleSheetsConnectionError';
    Object.setPrototypeOf(this, GoogleSheetsConnectionError.prototype);
  }
}

/**
 * Checks if an error is a Google API error and extracts useful information
 */
export function parseGoogleSheetsError(error: unknown): {
  isRetryable: boolean;
  error: GoogleSheetsError;
} {
  if (error instanceof GoogleSheetsError) {
    return {
      isRetryable: error instanceof GoogleSheetsConnectionError,
      error,
    };
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for specific Google API errors
  if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
    return {
      isRetryable: false,
      error: new GoogleSheetsPermissionError(errorMessage, error),
    };
  }

  if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('429')) {
    return {
      isRetryable: true,
      error: new GoogleSheetsQuotaError(errorMessage, error),
    };
  }

  if (
    errorMessage.includes('UNAVAILABLE') ||
    errorMessage.includes('DEADLINE_EXCEEDED') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504')
  ) {
    return {
      isRetryable: true,
      error: new GoogleSheetsConnectionError(errorMessage, error),
    };
  }

  if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
    return {
      isRetryable: false,
      error: new GoogleSheetsError(errorMessage, undefined, error),
    };
  }

  // Default to generic error
  return {
    isRetryable: false,
    error: new GoogleSheetsError(errorMessage, undefined, error),
  };
}
