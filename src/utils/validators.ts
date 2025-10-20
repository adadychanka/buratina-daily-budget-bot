import type {
  AmountValidationResult,
  BooleanValidationResult,
  ChoiceValidationResult,
  OptionalTextValidationResult,
  TextValidationResult,
  ValidationOutcome,
} from '../types/validation';
import { validationError, validationSuccess } from '../types/validation';

/**
 * Validator for numeric amounts
 */
export function validateAmount(value: string): AmountValidationResult {
  const amount = Number.parseFloat(value);

  if (Number.isNaN(amount)) {
    return validationError('Please enter a valid number');
  }

  if (amount < 0) {
    return validationError('Amount cannot be negative');
  }

  return validationSuccess(amount);
}

/**
 * Validator for required text fields
 */
export function validateText(value: string, minLength = 1): TextValidationResult {
  const text = value.trim();

  if (text.length < minLength) {
    return validationError(`Minimum length: ${minLength} characters`);
  }

  return validationSuccess(text);
}

/**
 * Validator for optional text fields
 * Returns undefined if text is empty or "skip"
 */
export function validateOptionalText(value: string): OptionalTextValidationResult {
  const text = value.trim();

  if (text === '' || text.toLowerCase() === 'skip') {
    return validationSuccess(undefined);
  }

  return validationSuccess(text);
}

/**
 * Validator for confirmation (yes/no)
 */
export function validateConfirmation(value: string): BooleanValidationResult {
  const text = value.toLowerCase().trim();

  if (text === 'yes' || text === 'y') {
    return validationSuccess(true);
  }

  if (text === 'no' || text === 'n') {
    return validationSuccess(false);
  }

  return validationError('Please answer "yes" or "no"');
}

/**
 * Validator for choice (yes/no/skip)
 */
export function validateChoice(value: string): ChoiceValidationResult {
  const text = value.toLowerCase().trim();

  if (text === 'yes' || text === 'y') {
    return validationSuccess('yes' as const);
  }

  if (text === 'no' || text === 'n') {
    return validationSuccess('no' as const);
  }

  if (text === 'skip') {
    return validationSuccess('skip' as const);
  }

  return validationError('Please answer "yes", "no" or "skip"');
}

/**
 * Validator for email addresses
 */
export function validateEmail(value: string): TextValidationResult {
  const text = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(text)) {
    return validationError('Please enter a valid email address');
  }

  return validationSuccess(text);
}

/**
 * Validator for phone numbers (basic)
 */
export function validatePhone(value: string): TextValidationResult {
  const text = value.trim();
  const phoneRegex = /^\+?[\d\s-()]+$/;

  if (!phoneRegex.test(text) || text.length < 10) {
    return validationError('Please enter a valid phone number');
  }

  return validationSuccess(text);
}

/**
 * Validator for numeric range
 */
export function validateRange(value: string, min: number, max: number): AmountValidationResult {
  const amount = Number.parseFloat(value);

  if (Number.isNaN(amount)) {
    return validationError('Please enter a valid number');
  }

  if (amount < min || amount > max) {
    return validationError(`Value must be between ${min} and ${max}`);
  }

  return validationSuccess(amount);
}

/**
 * Validator for text length range
 */
export function validateTextLength(
  value: string,
  minLength: number,
  maxLength: number
): TextValidationResult {
  const text = value.trim();

  if (text.length < minLength) {
    return validationError(`Minimum length: ${minLength} characters`);
  }

  if (text.length > maxLength) {
    return validationError(`Maximum length: ${maxLength} characters`);
  }

  return validationSuccess(text);
}

/**
 * Generic validator combinator - runs all validators, returns first error
 */
export function combineValidators<T>(
  ...validators: Array<(value: string) => ValidationOutcome<T>>
): (value: string) => ValidationOutcome<T> {
  return (value: string) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    // Return last validator's success result
    return validators[validators.length - 1](value);
  };
}

/**
 * Validator builder for custom validation logic
 */
export function createValidator<T>(
  validationFn: (value: string) => { isValid: boolean; value?: T; error?: string }
): (value: string) => ValidationOutcome<T> {
  return (value: string) => {
    const result = validationFn(value);
    if (result.isValid && result.value !== undefined) {
      return validationSuccess(result.value);
    }
    return validationError(result.error || 'Validation failed');
  };
}
