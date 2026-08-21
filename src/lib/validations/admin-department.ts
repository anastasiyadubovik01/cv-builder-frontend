import { z } from 'zod';

export const adminDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'departments.validation.nameRequired'),
});

export type AdminDepartmentFormValues = z.infer<typeof adminDepartmentSchema>;
