import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    password: z.string().min(1, 'settings.validation.passwordRequired'),

    newPassword: z
      .string()
      .min(1, 'settings.validation.newPasswordRequired')
      .min(6, 'settings.validation.passwordMinLength'),

    confirmPassword: z
      .string()
      .min(1, 'settings.validation.confirmPasswordRequired'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'settings.validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
