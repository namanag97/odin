/**
 * Unit Tests for Query Types
 */
import { describe, it, expect } from 'vitest';
import {
  FilterOperator,
  isFilterOperator,
  isFilter,
  isDateRange,
  eq,
  contains,
  between,
  inArray,
} from './query';
import type { ISODateTime } from './common';

describe('isFilterOperator', () => {
  it('returns true for valid operators', () => {
    expect(isFilterOperator(FilterOperator.EQ)).toBe(true);
    expect(isFilterOperator(FilterOperator.NEQ)).toBe(true);
    expect(isFilterOperator(FilterOperator.GT)).toBe(true);
    expect(isFilterOperator(FilterOperator.GTE)).toBe(true);
    expect(isFilterOperator(FilterOperator.LT)).toBe(true);
    expect(isFilterOperator(FilterOperator.LTE)).toBe(true);
    expect(isFilterOperator(FilterOperator.IN)).toBe(true);
    expect(isFilterOperator(FilterOperator.NOT_IN)).toBe(true);
    expect(isFilterOperator(FilterOperator.CONTAINS)).toBe(true);
    expect(isFilterOperator(FilterOperator.STARTS_WITH)).toBe(true);
    expect(isFilterOperator(FilterOperator.ENDS_WITH)).toBe(true);
    expect(isFilterOperator(FilterOperator.BETWEEN)).toBe(true);
    expect(isFilterOperator(FilterOperator.IS_NULL)).toBe(true);
    expect(isFilterOperator(FilterOperator.IS_NOT_NULL)).toBe(true);
    expect(isFilterOperator(FilterOperator.REGEX)).toBe(true);
  });

  it('returns true for string enum values', () => {
    expect(isFilterOperator('eq')).toBe(true);
    expect(isFilterOperator('contains')).toBe(true);
    expect(isFilterOperator('between')).toBe(true);
  });

  it('returns false for invalid operators', () => {
    expect(isFilterOperator('invalid')).toBe(false);
    expect(isFilterOperator('')).toBe(false);
    expect(isFilterOperator(null)).toBe(false);
    expect(isFilterOperator(undefined)).toBe(false);
    expect(isFilterOperator(123)).toBe(false);
  });
});

describe('isFilter', () => {
  it('returns true for valid filters', () => {
    expect(isFilter({
      field: 'name',
      operator: FilterOperator.EQ,
      value: 'test',
    })).toBe(true);

    expect(isFilter({
      field: 'age',
      operator: FilterOperator.BETWEEN,
      value: [18, 65],
    })).toBe(true);
  });

  it('returns false for invalid filters', () => {
    expect(isFilter(null)).toBe(false);
    expect(isFilter(undefined)).toBe(false);
    expect(isFilter({})).toBe(false);
    expect(isFilter({ field: 'name' })).toBe(false);
    expect(isFilter({ field: 'name', operator: 'invalid' })).toBe(false);
    expect(isFilter({ field: 123, operator: FilterOperator.EQ, value: 'test' })).toBe(false);
  });
});

describe('isDateRange', () => {
  it('returns true for valid date ranges', () => {
    expect(isDateRange({
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z',
    })).toBe(true);

    expect(isDateRange({
      start: '2024-01-01',
      end: '2024-12-31',
      startInclusive: true,
      endInclusive: false,
    })).toBe(true);
  });

  it('returns false for invalid date ranges', () => {
    expect(isDateRange(null)).toBe(false);
    expect(isDateRange(undefined)).toBe(false);
    expect(isDateRange({})).toBe(false);
    expect(isDateRange({ start: '2024-01-01' })).toBe(false);
    expect(isDateRange({ end: '2024-12-31' })).toBe(false);
    expect(isDateRange({ start: 123, end: '2024-12-31' })).toBe(false);
  });
});

describe('Filter Factory Functions', () => {
  describe('eq', () => {
    it('creates an equality filter', () => {
      const filter = eq('name', 'John');
      
      expect(filter.field).toBe('name');
      expect(filter.operator).toBe(FilterOperator.EQ);
      expect(filter.value).toBe('John');
    });
  });

  describe('contains', () => {
    it('creates a contains filter', () => {
      const filter = contains('email', 'gmail');
      
      expect(filter.field).toBe('email');
      expect(filter.operator).toBe(FilterOperator.CONTAINS);
      expect(filter.value).toBe('gmail');
    });
  });

  describe('between', () => {
    it('creates a between filter', () => {
      const filter = between('age', 18, 65);
      
      expect(filter.field).toBe('age');
      expect(filter.operator).toBe(FilterOperator.BETWEEN);
      expect(filter.value).toEqual([18, 65]);
    });

    it('works with dates', () => {
      const start = '2024-01-01' as ISODateTime;
      const end = '2024-12-31' as ISODateTime;
      const filter = between('createdAt', start, end);
      
      expect(filter.field).toBe('createdAt');
      expect(filter.operator).toBe(FilterOperator.BETWEEN);
      expect(filter.value).toEqual([start, end]);
    });
  });

  describe('inArray', () => {
    it('creates an IN filter', () => {
      const filter = inArray('status', ['active', 'pending']);
      
      expect(filter.field).toBe('status');
      expect(filter.operator).toBe(FilterOperator.IN);
      expect(filter.value).toEqual(['active', 'pending']);
    });

    it('works with numbers', () => {
      const filter = inArray('priority', [1, 2, 3]);
      
      expect(filter.value).toEqual([1, 2, 3]);
    });
  });
});
