import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'projects.errors.nameRequired')
      .max(100, 'projects.errors.nameMaxLength'),
    domain: z
      .string()
      .trim()
      .min(1, 'projects.errors.domainRequired')
      .max(100, 'projects.errors.domainMaxLength'),
    startDate: z.string().trim().min(1, 'projects.errors.startDateRequired'),
    endDate: z.string().trim().min(1, 'projects.errors.endDateRequired'),
    description: z
      .string()
      .trim()
      .min(1, 'projects.errors.descriptionRequired')
      .max(2000, 'projects.errors.descriptionMaxLength'),
    environment: z.string(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'projects.errors.endDateMustBeLater',
      path: ['endDate'],
    },
  );

export type CreateProjectInputValues = z.infer<typeof createProjectSchema>;
