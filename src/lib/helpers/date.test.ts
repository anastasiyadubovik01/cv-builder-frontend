import { describe, expect, it } from 'vitest';

import { formatPeriodDate, parseDate } from './date';

describe('parseDate', () => {
  it('returns null for empty values', () => {
    expect(parseDate()).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('   ')).toBeNull();
  });

  it('returns Date for valid date string', () => {
    const result = parseDate('2024-05-10');

    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });

  it('returns null for invalid date string', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });
});

describe('formatPeriodDate', () => {
  it('returns empty string for empty value', () => {
    expect(formatPeriodDate()).toBe('');
    expect(formatPeriodDate(null)).toBe('');
  });

  it('returns Present for present value ignoring case and spaces', () => {
    expect(formatPeriodDate('present')).toBe('Present');
    expect(formatPeriodDate(' PRESENT ')).toBe('Present');
  });

  it('returns already formatted MM.YYYY value unchanged', () => {
    expect(formatPeriodDate('08.2026')).toBe('08.2026');
  });

  it('formats valid date as MM.YYYY', () => {
    expect(formatPeriodDate('2024-05-10')).toBe('05.2024');
  });

  it('returns original cleaned value for invalid date', () => {
    expect(formatPeriodDate(' invalid-date ')).toBe('invalid-date');
  });
});
