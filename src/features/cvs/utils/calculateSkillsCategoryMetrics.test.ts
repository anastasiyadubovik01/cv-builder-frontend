import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateSkillsCategoryMetrics } from './calculateSkillsCategoryMetrics';

describe('calculateSkillsCategoryMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-08-28T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when no projects match category skills', () => {
    const result = calculateSkillsCategoryMetrics(
      'Frontend',
      ['React', 'TypeScript'],
      [
        {
          start_date: '2020-01-01',
          end_date: '2022-01-01',
          environment: ['Java', 'Spring'],
        },
      ],
    );

    expect(result).toBeNull();
  });

  it('matches skills ignoring case and spaces', () => {
    const result = calculateSkillsCategoryMetrics(
      'Frontend',
      [' React '],
      [
        {
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          environment: ['  REACT  '],
        },
      ],
    );

    expect(result).not.toBeNull();
  });

  it('calculates experience from the earliest matching project', () => {
    const result = calculateSkillsCategoryMetrics(
      'Frontend',
      ['React'],
      [
        {
          start_date: '2022-01-01',
          end_date: '2023-01-01',
          environment: ['React'],
        },
        {
          start_date: '2020-01-01',
          end_date: '2021-01-01',
          environment: ['React'],
        },
      ],
    );

    expect(result?.experienceYears).toBe(6);
  });

  it('uses current year as lastUsed when there is an active project', () => {
    const result = calculateSkillsCategoryMetrics(
      'Frontend',
      ['React'],
      [
        {
          start_date: '2024-01-01',
          end_date: 'Present',
          environment: ['React'],
        },
      ],
    );

    expect(result?.lastUsed).toBe('2026');
  });

  it('uses the latest project end year as lastUsed', () => {
    const result = calculateSkillsCategoryMetrics(
      'Frontend',
      ['React'],
      [
        {
          start_date: '2020-01-01',
          end_date: '2022-01-01',
          environment: ['React'],
        },
        {
          start_date: '2021-01-01',
          end_date: '2025-01-01',
          environment: ['React'],
        },
      ],
    );

    expect(result?.lastUsed).toBe('2025');
  });
});
