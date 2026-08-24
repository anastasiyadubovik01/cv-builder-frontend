import { z } from 'zod';

export const adminPositionSchema = z.object({
  name: z.string().trim().min(1, 'positions.validation.nameRequired'),
});

export type AdminPositionFormValues = z.infer<typeof adminPositionSchema>;
