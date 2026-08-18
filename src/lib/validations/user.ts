import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'users.validation.email.required')
    .email('users.validation.email.invalid'),

  password: z
    .string()
    .min(1, 'users.validation.password.required')
    .min(6, 'users.validation.password.minLength'),

  firstName: z.string().trim().min(1, 'users.validation.firstName.required'),

  lastName: z.string().trim().min(1, 'users.validation.lastName.required'),

  departmentId: z.string().min(1, 'users.validation.department.required'),

  positionId: z.string().min(1, 'users.validation.position.required'),

  role: z.enum(['Employee', 'Admin'], {
    message: 'users.validation.role.required',
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string(),
  password: z.string(),

  firstName: z.string().trim().min(1, 'users.validation.firstName.required'),

  lastName: z.string().trim().min(1, 'users.validation.lastName.required'),

  departmentId: z.string().min(1, 'users.validation.department.required'),

  positionId: z.string().min(1, 'users.validation.position.required'),

  role: z.enum(['Employee', 'Admin'], {
    message: 'users.validation.role.required',
  }),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
