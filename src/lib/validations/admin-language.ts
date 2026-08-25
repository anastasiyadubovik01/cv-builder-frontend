import { z } from 'zod';

export const adminLanguageSchema = z.object({
  name: z.string().trim().min(1, 'languages.admin.validation.nameRequired'),

  iso2: z
    .string()
    .trim()
    .min(1, 'languages.admin.validation.isoRequired')
    .length(2, 'languages.admin.validation.isoLength'),

  nativeName: z
    .string()
    .trim()
    .min(1, 'languages.admin.validation.nativeNameRequired'),
});

export type AdminLanguageFormValues = z.infer<typeof adminLanguageSchema>;
