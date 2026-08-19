import { Progress } from '@/components/ui/progress';
import type { Mastery } from '@/features/skills/types';

type SkillMasteryProgressProps = {
  mastery: Mastery;
  selected?: boolean;
};

const MASTERY_CONFIG: Record<
  Mastery,
  {
    value: number;
    className: string;
  }
> = {
  Novice: {
    value: 20,
    className: 'bg-[#626262]',
  },
  Advanced: {
    value: 40,
    className: 'bg-[#2196F3]',
  },
  Competent: {
    value: 60,
    className: 'bg-[#4CAF50]',
  },
  Proficient: {
    value: 80,
    className: 'bg-[#FFC107]',
  },
  Expert: {
    value: 100,
    className: 'bg-[#D32F2F]',
  },
};

export function SkillMasteryProgress({
  mastery,
  selected = false,
}: SkillMasteryProgressProps) {
  const config = MASTERY_CONFIG[mastery];

  return (
    <Progress
      value={config.value}
      className="w-[79px]"
      trackClassName="h-1 bg-[#D9D9D9]"
      indicatorClassName={selected ? 'bg-[#AEAEAE]' : config.className}
    />
  );
}
