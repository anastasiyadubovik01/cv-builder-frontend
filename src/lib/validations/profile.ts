import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'users.details.validation.firstNameRequired')
    .max(100, 'users.details.validation.firstNameMaxLength'),

  lastName: z
    .string()
    .trim()
    .min(1, 'users.details.validation.lastNameRequired')
    .max(100, 'users.details.validation.lastNameMaxLength'),

  departmentId: z
    .string()
    .min(1, 'users.details.validation.departmentRequired'),

  positionId: z.string().min(1, 'users.details.validation.positionRequired'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
