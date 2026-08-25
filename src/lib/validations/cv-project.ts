import { z } from 'zod';
import { parseDate } from '../helpers/date';

export const createCvProjectSchema = z
  .object({
    projectId: z.string().trim().min(1, 'projects.validation.projectRequired'),
    startDate: z
      .string()
      .trim()
      .min(1, 'projects.validation.startDateRequired'),
    endDate: z.string().trim().optional().or(z.literal('')),
    roles: z.string().trim().min(1, 'projects.validation.rolesRequired'),
    responsibilities: z.string().trim().optional(),
    domain: z.string().trim().optional(),
    description: z.string().trim().optional(),
    environment: z.string().trim().optional(),
    projectStartDate: z.string().trim().optional(),
    projectEndDate: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const projEnd = parseDate(data.projectEndDate);
      const userEnd = parseDate(data.endDate);
      return !(projEnd && !userEnd);
    },
    {
      message: 'projects.validation.endDateRequiredForFinishedProject',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      if (!start || !end) return true;
      return end >= start;
    },
    {
      message: 'projects.validation.endDateMustBeLater',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      const start = parseDate(data.startDate);
      const projStart = parseDate(data.projectStartDate);
      if (!start || !projStart) return true;
      return start >= projStart;
    },
    {
      message: 'projects.validation.startDateWithinProject',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      const start = parseDate(data.startDate);
      const projEnd = parseDate(data.projectEndDate);
      if (!start || !projEnd) return true;
      return start <= projEnd;
    },
    {
      message: 'projects.validation.startDateWithinProject',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      const end = parseDate(data.endDate);
      const projEnd = parseDate(data.projectEndDate);
      if (!end || !projEnd) return true;
      return end <= projEnd;
    },
    {
      message: 'projects.validation.endDateWithinProject',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      const end = parseDate(data.endDate);
      const projStart = parseDate(data.projectStartDate);
      if (!end || !projStart) return true;
      return end >= projStart;
    },
    {
      message: 'projects.validation.endDateWithinProject',
      path: ['endDate'],
    },
  );

export type CreateCvProjectInputValues = z.infer<typeof createCvProjectSchema>;
export type UpdateCvProjectInputValues = CreateCvProjectInputValues;
