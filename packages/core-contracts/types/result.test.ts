/**
 * Unit Tests for Result Types
 */
import { describe, it, expect } from 'vitest';
import type { Result, Success, Failure, Option, Some, None } from './result';

describe('Result type', () => {
  describe('Success', () => {
    it('should have success: true and data property', () => {
      const result: Success<number> = { success: true, data: 42 };
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should narrow correctly in conditional', () => {
      const result: Result<number> = { success: true, data: 42 };
      
      if (result.success) {
        // TypeScript should know result.data exists here
        expect(result.data).toBe(42);
      } else {
        // This branch should not execute
        expect.fail('Should not reach failure branch');
      }
    });
  });

  describe('Failure', () => {
    it('should have success: false and error property', () => {
      const result: Failure<string> = { success: false, error: 'Something went wrong' };
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });

    it('should narrow correctly in conditional', () => {
      const result: Result<number, string> = { success: false, error: 'Error' };
      
      if (!result.success) {
        // TypeScript should know result.error exists here
        expect(result.error).toBe('Error');
      } else {
        expect.fail('Should not reach success branch');
      }
    });
  });
});

describe('Option type', () => {
  describe('Some', () => {
    it('should have some: true and value property', () => {
      const option: Some<string> = { some: true, value: 'hello' };
      
      expect(option.some).toBe(true);
      expect(option.value).toBe('hello');
    });

    it('should narrow correctly in conditional', () => {
      const option: Option<string> = { some: true, value: 'hello' };
      
      if (option.some) {
        expect(option.value).toBe('hello');
      } else {
        expect.fail('Should not reach None branch');
      }
    });
  });

  describe('None', () => {
    it('should have some: false', () => {
      const option: None = { some: false };
      
      expect(option.some).toBe(false);
    });

    it('should narrow correctly in conditional', () => {
      const option: Option<string> = { some: false };
      
      if (!option.some) {
        // This is the None case
        expect(option.some).toBe(false);
      } else {
        expect.fail('Should not reach Some branch');
      }
    });
  });
});
