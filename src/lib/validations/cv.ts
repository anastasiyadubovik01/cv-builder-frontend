import { z } from 'zod';

export const createCvSchema = z.object({
  name: z
    .string()
    .min(1, 'cvs.validation.name.required')
    .max(255, 'cvs.validation.name.maxLength'),
  education: z
    .string()
    .min(1, 'cvs.validation.education.required')
    .max(255, 'cvs.validation.education.maxLength'),
  description: z.string().min(1, 'cvs.validation.description.required'),
});

export type CreateCvFormValues = z.infer<typeof createCvSchema>;
