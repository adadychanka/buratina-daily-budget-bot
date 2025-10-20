import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateText,
  validateOptionalText,
  validateConfirmation,
  validateChoice,
  validateEmail,
  validateRange,
  combineValidators,
} from '../src/utils/validators';
import { isValidationSuccess, isValidationError } from '../src/types/validation';

describe('Validators', () => {
  describe('validateAmount', () => {
    it('should validate positive numbers', () => {
      const result = validateAmount('100');
      expect(isValidationSuccess(result)).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(100);
      }
    });

    it('should validate zero', () => {
      const result = validateAmount('0');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(0);
      }
    });

    it('should validate decimal numbers', () => {
      const result = validateAmount('99.99');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(99.99);
      }
    });

    it('should reject negative numbers', () => {
      const result = validateAmount('-10');
      expect(result.isValid).toBe(false);
      expect(isValidationError(result)).toBe(true);
      if (isValidationError(result)) {
        expect(result.error).toBe('Amount cannot be negative');
      }
    });

    it('should reject invalid input', () => {
      const result = validateAmount('abc');
      expect(result.isValid).toBe(false);
      if (isValidationError(result)) {
        expect(result.error).toBe('Please enter a valid number');
      }
    });
  });

  describe('validateText', () => {
    it('should validate non-empty text', () => {
      const result = validateText('Hello');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe('Hello');
      }
    });

    it('should trim whitespace', () => {
      const result = validateText('  Hello  ');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe('Hello');
      }
    });

    it('should reject empty text', () => {
      const result = validateText('');
      expect(result.isValid).toBe(false);
    });

    it('should validate minimum length', () => {
      const result = validateText('Hi', 3);
      expect(result.isValid).toBe(false);
      if (isValidationError(result)) {
        expect(result.error).toBe('Minimum length: 3 characters');
      }
    });
  });

  describe('validateOptionalText', () => {
    it('should return undefined for empty string', () => {
      const result = validateOptionalText('');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBeUndefined();
      }
    });

    it('should return undefined for "skip"', () => {
      const result = validateOptionalText('skip');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBeUndefined();
      }
    });

    it('should return text for non-empty input', () => {
      const result = validateOptionalText('Some notes');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe('Some notes');
      }
    });
  });

  describe('validateConfirmation', () => {
    it('should accept "yes"', () => {
      const result = validateConfirmation('yes');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(true);
      }
    });

    it('should accept "y"', () => {
      const result = validateConfirmation('y');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(true);
      }
    });

    it('should accept "no"', () => {
      const result = validateConfirmation('no');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(false);
      }
    });

    it('should reject invalid input', () => {
      const result = validateConfirmation('maybe');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateChoice', () => {
    it('should accept "yes"', () => {
      const result = validateChoice('yes');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe('yes');
      }
    });

    it('should accept "skip"', () => {
      const result = validateChoice('skip');
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe('skip');
      }
    });

    it('should reject invalid input', () => {
      const result = validateChoice('maybe');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('not-an-email');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should accept value in range', () => {
      const result = validateRange('50', 1, 100);
      expect(result.isValid).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.value).toBe(50);
      }
    });

    it('should reject value below minimum', () => {
      const result = validateRange('0', 1, 100);
      expect(result.isValid).toBe(false);
    });

    it('should reject value above maximum', () => {
      const result = validateRange('101', 1, 100);
      expect(result.isValid).toBe(false);
    });
  });

  describe('combineValidators', () => {
    it('should run multiple validators in sequence', () => {
      const combinedValidator = combineValidators(
        (value: string) => validateText(value, 3),
        (value: string) => {
          const text = value.trim();
          if (!text.includes('@')) {
            return { isValid: false, error: 'Must contain @' };
          }
          return { isValid: true, value: text };
        }
      );

      const result1 = combinedValidator('ab');
      expect(result1.isValid).toBe(false);

      const result2 = combinedValidator('abc');
      expect(result2.isValid).toBe(false);

      const result3 = combinedValidator('abc@def');
      expect(result3.isValid).toBe(true);
    });
  });
});
