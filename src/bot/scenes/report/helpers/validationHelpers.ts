import { PROMPTS } from '../../../../utils/constants';
import { validateAmount, validateOptionalText, validateText } from '../../../../utils/validators';

/**
 * Validate and return formatted error message for amounts
 */
export function validateAmountWithPrompt(value: string) {
  const validation = validateAmount(value);
  if (!validation.isValid) {
    return {
      ...validation,
      errorMessage: `❌ ${validation.error}\n\n${PROMPTS.INVALID_AMOUNT}`,
    };
  }
  return { ...validation, errorMessage: undefined };
}

/**
 * Validate and return formatted error message for text fields
 */
export function validateTextWithPrompt(value: string, minLength = 1) {
  const validation = validateText(value, minLength);
  if (!validation.isValid) {
    return {
      ...validation,
      errorMessage: `❌ ${validation.error}\n\n${PROMPTS.INVALID_TEXT}`,
    };
  }
  return { ...validation, errorMessage: undefined };
}

/**
 * Validate optional text (notes)
 */
export function validateOptionalTextWithPrompt(value: string) {
  return validateOptionalText(value);
}
