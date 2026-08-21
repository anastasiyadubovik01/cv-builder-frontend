import { z } from 'zod';

export const masteryValues = [
  'Novice',
  'Advanced',
  'Competent',
  'Proficient',
  'Expert',
] as const;

export const addSkillSchema = z.object({
  skillName: z.string().min(1, 'skills.validation.skillRequired'),

  mastery: z
    .union([z.literal(''), z.enum(masteryValues)])
    .superRefine((value, ctx) => {
      if (value === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'skills.validation.masteryRequired',
        });
      }
    }),
});

export type AddSkillFormValues = z.infer<typeof addSkillSchema>;
