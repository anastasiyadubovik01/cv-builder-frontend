import { Progress } from '@/components/ui/progress';
import type { Proficiency } from '@/features/languages/types';

type LanguageProficiencyProgressProps = {
  proficiency: Proficiency;
  selected?: boolean;
};

const PROFICIENCY_CONFIG: Record<
  Proficiency,
  { value: number; className: string }
> = {
  A1: { value: 15, className: 'bg-[#626262]' },
  A2: { value: 30, className: 'bg-[#2196F3]' },
  B1: { value: 45, className: 'bg-[#4CAF50]' },
  B2: { value: 60, className: 'bg-[#4CAF50]' },
  C1: { value: 75, className: 'bg-[#FFC107]' },
  C2: { value: 90, className: 'bg-[#D32F2F]' },
  Native: { value: 100, className: 'bg-[#D32F2F]' },
};

export function LanguageProficiencyProgress({
  proficiency,
  selected = false,
}: LanguageProficiencyProgressProps) {
  const config = PROFICIENCY_CONFIG[proficiency];

  return (
    <Progress
      value={config.value}
      className="w-[79px]"
      trackClassName="h-1 bg-[#D9D9D9]"
      indicatorClassName={selected ? 'bg-[#AEAEAE]' : config.className}
    />
  );
}
