import { z } from 'zod';

// Validator for numeric amounts
export function validateAmount(value: string): {
  isValid: boolean;
  amount?: number;
  error?: string;
} {
  const amount = parseFloat(value);

  if (Number.isNaN(amount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (amount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  return { isValid: true, amount };
}

// Validator for text fields
export function validateText(
  value: string,
  minLength: number = 1
): { isValid: boolean; text?: string; error?: string } {
  const text = value.trim();

  if (text.length < minLength) {
    return {
      isValid: false,
      error: `Minimum length: ${minLength} characters`,
    };
  }

  return { isValid: true, text };
}

// Validator for optional text fields
export function validateOptionalText(value: string): {
  isValid: boolean;
  text?: string;
} {
  const text = value.trim();

  if (text === '' || text.toLowerCase() === 'skip') {
    return { isValid: true, text: undefined };
  }

  return { isValid: true, text };
}

// Validator for confirmation (yes/no)
export function validateConfirmation(value: string): {
  isValid: boolean;
  confirmed?: boolean;
  error?: string;
} {
  const text = value.toLowerCase().trim();

  if (text === 'yes' || text === 'y') {
    return { isValid: true, confirmed: true };
  }

  if (text === 'no' || text === 'n') {
    return { isValid: true, confirmed: false };
  }

  return { isValid: false, error: 'Please answer "yes" or "no"' };
}

// Validator for choice (yes/no/skip)
export function validateChoice(value: string): {
  isValid: boolean;
  choice?: 'yes' | 'no' | 'skip';
  error?: string;
} {
  const text = value.toLowerCase().trim();

  if (text === 'yes' || text === 'y') {
    return { isValid: true, choice: 'yes' };
  }

  if (text === 'no' || text === 'n') {
    return { isValid: true, choice: 'no' };
  }

  if (text === 'skip') {
    return { isValid: true, choice: 'skip' };
  }

  return { isValid: false, error: 'Please answer "yes", "no" or "skip"' };
}

// Validation schema for complete report
export const ReportValidationSchema = z.object({
  cashAmount: z.number().min(0),
  whiteCashAmount: z.number().min(0),
  blackCashAmount: z.number().min(0),
  blackCashLocation: z.string().optional(),
  cardSalesAmount: z.number().min(0),
  expenses: z
    .array(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1),
      })
    )
    .default([]),
  cashboxAmount: z.number().min(0),
  notes: z.string().optional(),
  totalSales: z.number().min(0),
});

export type ReportValidation = z.infer<typeof ReportValidationSchema>;
