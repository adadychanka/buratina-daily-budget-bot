/**
 * Validation result types
 * Provides a consistent type-safe interface for all validation functions
 */

/**
 * Base validation result
 */
export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
  errorMessage?: string;
}

/**
 * Successful validation result
 */
export interface ValidationSuccess<T> extends ValidationResult<T> {
  isValid: true;
  value: T;
  error?: never;
  errorMessage?: never;
}

/**
 * Failed validation result
 */
export interface ValidationError extends ValidationResult<never> {
  isValid: false;
  value?: never;
  error: string;
  errorMessage?: string;
}

/**
 * Union type for validation results
 */
export type ValidationOutcome<T> = ValidationSuccess<T> | ValidationError;

/**
 * Type guard to check if validation succeeded
 */
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is ValidationSuccess<T> {
  return result.isValid === true && result.value !== undefined;
}

/**
 * Type guard to check if validation failed
 */
export function isValidationError<T>(result: ValidationResult<T>): result is ValidationError {
  return result.isValid === false;
}

/**
 * Helper to create success result
 */
export function validationSuccess<T>(value: T): ValidationSuccess<T> {
  return {
    isValid: true,
    value,
  };
}

/**
 * Helper to create error result
 */
export function validationError(error: string, errorMessage?: string): ValidationError {
  return {
    isValid: false,
    error,
    errorMessage,
  };
}

/**
 * Specific validation result types
 */
export type AmountValidationResult = ValidationOutcome<number>;
export type TextValidationResult = ValidationOutcome<string>;
export type OptionalTextValidationResult = ValidationOutcome<string | undefined>;
export type BooleanValidationResult = ValidationOutcome<boolean>;
export type ChoiceValidationResult = ValidationOutcome<'yes' | 'no' | 'skip'>;

/**
 * Validator function type
 */
export type Validator<T> = (value: string) => ValidationOutcome<T>;

/**
 * Validator with prompt function type (returns error message)
 */
export type ValidatorWithPrompt<T> = (
  value: string
) => ValidationOutcome<T> & { errorMessage?: string };

/**
 * Validation context for complex validations
 */
export interface ValidationContext {
  fieldName: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  customMessage?: string;
}

/**
 * Chain-able validator builder
 */
export interface ValidatorBuilder<T> {
  validate: (value: string) => ValidationOutcome<T>;
  withContext: (context: Partial<ValidationContext>) => ValidatorBuilder<T>;
  withErrorMessage: (message: string) => ValidatorBuilder<T>;
}
