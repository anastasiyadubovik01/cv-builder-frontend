import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillMasteryProgress } from './SkillMasteryProgress';
import React from 'react';

vi.mock('@/components/ui/progress', () => ({
  Progress: ({
    value,
    className,
    trackClassName,
    indicatorClassName,
  }: {
    value: number;
    className: string;
    trackClassName: string;
    indicatorClassName: string;
  }) => (
    <div
      data-testid="progress-component"
      data-value={value}
      data-classname={className}
      data-trackclassname={trackClassName}
      data-indicatorclassname={indicatorClassName}
    >
      Progress: {value}%
    </div>
  ),
}));

describe('SkillMasteryProgress', () => {
  it.each([
    {
      mastery: 'Novice' as const,
      expectedValue: 20,
      expectedClass: 'bg-[#626262]',
    },
    {
      mastery: 'Advanced' as const,
      expectedValue: 40,
      expectedClass: 'bg-[#2196F3]',
    },
    {
      mastery: 'Competent' as const,
      expectedValue: 60,
      expectedClass: 'bg-[#4CAF50]',
    },
    {
      mastery: 'Proficient' as const,
      expectedValue: 80,
      expectedClass: 'bg-[#FFC107]',
    },
    {
      mastery: 'Expert' as const,
      expectedValue: 100,
      expectedClass: 'bg-[#D32F2F]',
    },
  ])(
    'renders correct progress value and config class for mastery level $mastery',
    ({ mastery, expectedValue, expectedClass }) => {
      render(<SkillMasteryProgress mastery={mastery} />);

      const progressEl = screen.getByTestId('progress-component');
      expect(progressEl).toHaveAttribute('data-value', String(expectedValue));
      expect(progressEl).toHaveAttribute(
        'data-indicatorclassname',
        expectedClass,
      );
      expect(progressEl).toHaveAttribute('data-classname', 'w-[79px]');
      expect(progressEl).toHaveAttribute(
        'data-trackclassname',
        'h-1 bg-[#D9D9D9]',
      );
    },
  );

  it('applies selected indicator class when selected prop is true', () => {
    render(<SkillMasteryProgress mastery="Expert" selected={true} />);

    const progressEl = screen.getByTestId('progress-component');
    expect(progressEl).toHaveAttribute('data-value', '100');
    expect(progressEl).toHaveAttribute(
      'data-indicatorclassname',
      'bg-[#AEAEAE]',
    );
  });
});
