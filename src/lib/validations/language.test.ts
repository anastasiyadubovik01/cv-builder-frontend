import { describe, it, expect } from 'vitest';
import { addUserLanguageSchema, proficiencyValues } from './language';
import { z } from 'zod';

describe('addUserLanguageSchema validations', () => {
  const validData = {
    languageName: 'English',
    proficiency: 'B2' as const,
  };

  it('should successfully validate correct user language data', () => {
    const result = addUserLanguageSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('languageName field', () => {
    it('should fail when languageName is empty', () => {
      const result = addUserLanguageSchema.safeParse({
        ...validData,
        languageName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.languageName?.errors).toContain(
          'users.languages.validation.languageRequired',
        );
      }
    });
  });

  describe('proficiency field', () => {
    it('should allow all valid proficiency values', () => {
      proficiencyValues.forEach((proficiency) => {
        const result = addUserLanguageSchema.safeParse({
          ...validData,
          proficiency,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should fail when proficiency is an empty string', () => {
      const result = addUserLanguageSchema.safeParse({
        ...validData,
        proficiency: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.proficiency?.errors).toContain(
          'users.languages.validation.proficiencyRequired',
        );
      }
    });

    it('should fail when proficiency is invalid', () => {
      const result = addUserLanguageSchema.safeParse({
        ...validData,
        proficiency: 'C3',
      });
      expect(result.success).toBe(false);
    });
  });
});
