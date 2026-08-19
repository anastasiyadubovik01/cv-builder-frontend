import { z } from 'zod';

export const adminSkillSchema = z.object({
  name: z.string().trim().min(1, 'skills.admin.validation.nameRequired'),
  categoryId: z.string().min(1, 'skills.admin.validation.categoryRequired'),
});

export type AdminSkillFormValues = z.infer<typeof adminSkillSchema>;
