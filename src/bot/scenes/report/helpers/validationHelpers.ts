import type {
  AmountValidationResult,
  OptionalTextValidationResult,
  TextValidationResult,
} from '../../../../types/validation';
import { validationError } from '../../../../types/validation';
import { PROMPTS } from '../../../../utils/constants';
import { validateAmount, validateOptionalText, validateText } from '../../../../utils/validators';

/**
 * Validate and return formatted error message for amounts
 */
export function validateAmountWithPrompt(
  value: string
): AmountValidationResult & { errorMessage?: string } {
  const validation = validateAmount(value);

  if (!validation.isValid) {
    return {
      ...validation,
      errorMessage: `❌ ${validation.error}\n\n${PROMPTS.INVALID_AMOUNT}`,
    };
  }

  return validation;
}

/**
 * Validate and return formatted error message for text fields
 */
export function validateTextWithPrompt(
  value: string,
  minLength = 1
): TextValidationResult & { errorMessage?: string } {
  const validation = validateText(value, minLength);

  if (!validation.isValid) {
    return {
      ...validation,
      errorMessage: `❌ ${validation.error}\n\n${PROMPTS.INVALID_TEXT}`,
    };
  }

  return validation;
}

/**
 * Validate optional text (notes)
 */
export function validateOptionalTextWithPrompt(value: string): OptionalTextValidationResult {
  return validateOptionalText(value);
}

/**
 * Validate amount with custom range and prompt
 */
export function validateAmountInRange(
  value: string,
  min: number,
  max: number
): AmountValidationResult & { errorMessage?: string } {
  const validation = validateAmount(value);

  if (!validation.isValid) {
    return {
      ...validation,
      errorMessage: `❌ ${validation.error}\n\n${PROMPTS.INVALID_AMOUNT}`,
    };
  }

  // Additional range check
  if (validation.value < min || validation.value > max) {
    return validationError(
      `Amount must be between ${min} and ${max}`,
      `❌ Amount must be between ${min} and ${max}\n\n${PROMPTS.INVALID_AMOUNT}`
    );
  }

  return validation;
}

/**
 * Validate text with max length
 */
export function validateTextWithMaxLength(
  value: string,
  minLength: number,
  maxLength: number
): TextValidationResult & { errorMessage?: string } {
  const text = value.trim();

  if (text.length < minLength) {
    return validationError(
      `Minimum length: ${minLength} characters`,
      `❌ Minimum length: ${minLength} characters\n\n${PROMPTS.INVALID_TEXT}`
    );
  }

  if (text.length > maxLength) {
    return validationError(
      `Maximum length: ${maxLength} characters`,
      `❌ Maximum length: ${maxLength} characters\n\n${PROMPTS.INVALID_TEXT}`
    );
  }

  return {
    isValid: true,
    value: text,
  };
}
