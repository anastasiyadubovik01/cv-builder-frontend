import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'auth.validation.email.required')
      .email('auth.validation.email.invalid'),
    password: z
      .string()
      .min(1, 'auth.validation.password.required')
      .min(6, 'auth.validation.password.minLength'),
    confirmPassword: z
      .string()
      .min(1, 'auth.validation.confirmPassword.required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.confirmPassword.match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.validation.email.required')
    .email('auth.validation.email.invalid'),
  password: z.string().min(1, 'auth.validation.password.required'),
});

export const verifyMailSchema = z.object({
  otp: z
    .string()
    .min(1, 'auth.validation.otp.required')
    .length(6, 'auth.validation.otp.length'),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
