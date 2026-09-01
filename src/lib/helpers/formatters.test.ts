import { describe, it, expect } from 'vitest';
import {
  capitalizeFirstLetter,
  parseCommaSeparated,
  formatArrayToCommaSeparated,
} from './formatters';

describe('formatters', () => {
  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter of a lowercase string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('leaves already capitalized strings unchanged', () => {
      expect(capitalizeFirstLetter('World')).toBe('World');
    });

    it('handles single character strings correctly', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
      expect(capitalizeFirstLetter('Z')).toBe('Z');
    });

    it('returns empty string or falsy values as-is', () => {
      expect(capitalizeFirstLetter('')).toBe('');
      expect(
        capitalizeFirstLetter(undefined as unknown as string),
      ).toBeUndefined();
      expect(capitalizeFirstLetter(null as unknown as string)).toBeNull();
    });
  });

  describe('parseCommaSeparated', () => {
    it('splits a comma-separated string, trims items and filters out empty values', () => {
      expect(parseCommaSeparated('apple, banana ,  orange ,, pear')).toEqual([
        'apple',
        'banana',
        'orange',
        'pear',
      ]);
    });

    it('handles a single item string without commas', () => {
      expect(parseCommaSeparated('development')).toEqual(['development']);
    });

    it('returns an empty array for empty, undefined or null inputs', () => {
      expect(parseCommaSeparated('')).toEqual([]);
      expect(parseCommaSeparated(undefined)).toEqual([]);
      expect(parseCommaSeparated(null)).toEqual([]);
    });
  });

  describe('formatArrayToCommaSeparated', () => {
    it('joins an array of strings into a comma-separated string with spaces', () => {
      expect(formatArrayToCommaSeparated(['React', 'TypeScript', 'Node'])).toBe(
        'React, TypeScript, Node',
      );
    });

    it('handles a single element array correctly', () => {
      expect(formatArrayToCommaSeparated(['TypeScript'])).toBe('TypeScript');
    });

    it('returns a string as-is if a string is provided instead of an array', () => {
      expect(formatArrayToCommaSeparated('already formatted string')).toBe(
        'already formatted string',
      );
    });

    it('returns an empty string for undefined, null, or empty array inputs', () => {
      expect(formatArrayToCommaSeparated([])).toBe('');
      expect(formatArrayToCommaSeparated(undefined)).toBe('');
      expect(formatArrayToCommaSeparated(null)).toBe('');
    });
  });
});
