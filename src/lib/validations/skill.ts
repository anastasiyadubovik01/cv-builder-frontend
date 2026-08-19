import { z } from 'zod';

export const masteryValues = [
  'Novice',
  'Advanced',
  'Competent',
  'Proficient',
  'Expert',
] as const;

export const addUserSkillSchema = z.object({
  skillName: z.string().min(1, 'users.skills.validation.skillRequired'),

  mastery: z
    .union([z.literal(''), z.enum(masteryValues)])
    .superRefine((value, ctx) => {
      if (value === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'users.skills.validation.masteryRequired',
        });
      }
    }),
});

export type AddUserSkillFormValues = z.infer<typeof addUserSkillSchema>;
