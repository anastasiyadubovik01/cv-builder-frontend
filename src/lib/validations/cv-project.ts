import { z } from 'zod';

export const createCvProjectSchema = z
  .object({
    projectId: z.string().min(1, 'projects.validation.projectRequired'),
    startDate: z.string().min(1, 'projects.validation.startDateRequired'),
    endDate: z.string().min(1, 'projects.validation.endDateRequired'),
    roles: z.string().min(1, 'projects.validation.rolesRequired'),
    responsibilities: z.string().optional(),
    domain: z.string().optional(),
    description: z.string().optional(),
    environment: z.string().optional(),
    projectStartDate: z.string().optional(),
    projectEndDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: 'projects.validation.endDateMustBeLater',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.projectStartDate) return true;
      return new Date(data.startDate) >= new Date(data.projectStartDate);
    },
    {
      message: 'projects.validation.startDateWithinProject',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.projectEndDate) return true;
      return new Date(data.startDate) <= new Date(data.projectEndDate);
    },
    {
      message: 'projects.validation.startDateWithinProject',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.endDate || !data.projectEndDate) return true;
      return new Date(data.endDate) <= new Date(data.projectEndDate);
    },
    {
      message: 'projects.validation.endDateWithinProject',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.endDate || !data.projectStartDate) return true;
      return new Date(data.endDate) >= new Date(data.projectStartDate);
    },
    {
      message: 'projects.validation.endDateWithinProject',
      path: ['endDate'],
    },
  );

export type CreateCvProjectInputValues = z.infer<typeof createCvProjectSchema>;
export type UpdateCvProjectInputValues = CreateCvProjectInputValues;
