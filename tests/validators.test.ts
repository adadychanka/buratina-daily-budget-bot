import { describe, it, expect } from "vitest";
import { validateAmount } from "../src/utils/validators";

describe("Validators", () => {
  describe("validateAmount", () => {
    it("should validate positive numbers", () => {
      const result = validateAmount("100");
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(100);
    });

    it("should validate zero", () => {
      const result = validateAmount("0");
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(0);
    });

    it("should reject negative numbers", () => {
      const result = validateAmount("-10");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Amount cannot be negative");
    });

    it("should reject invalid input", () => {
      const result = validateAmount("abc");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid number");
    });
  });
});
