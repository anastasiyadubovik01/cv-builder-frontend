import { z } from 'zod';

export const proficiencyValues = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'Native',
] as const;

export const addUserLanguageSchema = z.object({
  languageName: z
    .string()
    .min(1, 'users.languages.validation.languageRequired'),
  proficiency: z
    .union([z.literal(''), z.enum(proficiencyValues)])
    .superRefine((value, ctx) => {
      if (value === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'users.languages.validation.proficiencyRequired',
        });
      }
    }),
});

export type AddUserLanguageFormValues = z.infer<typeof addUserLanguageSchema>;
