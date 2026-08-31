import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProficiencyProgress } from './LanguageProficiencyProgress';
import type { Proficiency } from '@/features/languages/types';

vi.mock('@/components/ui/progress', () => ({
  Progress: ({
    value,
    className,
    trackClassName,
    indicatorClassName,
  }: {
    value: number;
    className?: string;
    trackClassName?: string;
    indicatorClassName?: string;
  }) => (
    <div
      data-testid="progress-bar"
      data-value={value}
      data-class-name={className}
      data-track-class-name={trackClassName}
      data-indicator-class-name={indicatorClassName}
    />
  ),
}));

describe('LanguageProficiencyProgress', () => {
  const proficiencies: Array<{
    level: Proficiency;
    expectedValue: number;
    expectedClass: string;
  }> = [
    { level: 'A1', expectedValue: 15, expectedClass: 'bg-[#626262]' },
    { level: 'A2', expectedValue: 30, expectedClass: 'bg-[#2196F3]' },
    { level: 'B1', expectedValue: 45, expectedClass: 'bg-[#4CAF50]' },
    { level: 'B2', expectedValue: 60, expectedClass: 'bg-[#4CAF50]' },
    { level: 'C1', expectedValue: 75, expectedClass: 'bg-[#FFC107]' },
    { level: 'C2', expectedValue: 90, expectedClass: 'bg-[#D32F2F]' },
    { level: 'Native', expectedValue: 100, expectedClass: 'bg-[#D32F2F]' },
  ];

  it.each(proficiencies)(
    'should render progress bar with correct value and indicator class for proficiency $level when not selected',
    ({ level, expectedValue, expectedClass }) => {
      render(
        <LanguageProficiencyProgress proficiency={level} selected={false} />,
      );

      const progress = screen.getByTestId('progress-bar');
      expect(progress.getAttribute('data-value')).toBe(String(expectedValue));
      expect(progress.getAttribute('data-indicator-class-name')).toBe(
        expectedClass,
      );
      expect(progress.getAttribute('data-class-name')).toBe('w-[79px]');
      expect(progress.getAttribute('data-track-class-name')).toBe(
        'h-1 bg-[#D9D9D9]',
      );
    },
  );

  it.each(proficiencies)(
    'should render progress bar with selected indicator class override when selected is true for proficiency $level',
    ({ level, expectedValue }) => {
      render(
        <LanguageProficiencyProgress proficiency={level} selected={true} />,
      );

      const progress = screen.getByTestId('progress-bar');
      expect(progress.getAttribute('data-value')).toBe(String(expectedValue));
      expect(progress.getAttribute('data-indicator-class-name')).toBe(
        'bg-[#AEAEAE]',
      );
    },
  );
});
