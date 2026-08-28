import { describe, it, expect } from 'vitest';
import { adminLanguageSchema } from './admin-language';
import { z } from 'zod';

describe('adminLanguageSchema validations', () => {
  const validData = {
    name: 'English',
    iso2: 'EN',
    nativeName: 'English',
  };

  it('should successfully validate correct admin language data', () => {
    const result = adminLanguageSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('name field', () => {
    it('should fail when name is empty or whitespace', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        name: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.name?.errors).toContain(
          'languages.admin.validation.nameRequired',
        );
      }
    });

    it('should trim whitespace from name', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        name: '  French  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('French');
      }
    });
  });

  describe('iso2 field', () => {
    it('should fail when iso2 is empty or whitespace', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        iso2: '  ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.iso2?.errors).toContain(
          'languages.admin.validation.isoRequired',
        );
      }
    });

    it('should fail when iso2 length is not 2 characters', () => {
      const shortResult = adminLanguageSchema.safeParse({
        ...validData,
        iso2: 'e',
      });
      const longResult = adminLanguageSchema.safeParse({
        ...validData,
        iso2: 'eng',
      });

      expect(shortResult.success).toBe(false);
      expect(longResult.success).toBe(false);

      if (!shortResult.success) {
        const tree = z.treeifyError(shortResult.error);
        expect(tree.properties?.iso2?.errors).toContain(
          'languages.admin.validation.isoLength',
        );
      }
    });

    it('should trim whitespace from iso2', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        iso2: ' fr ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.iso2).toBe('fr');
      }
    });
  });

  describe('nativeName field', () => {
    it('should fail when nativeName is empty or whitespace', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        nativeName: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.nativeName?.errors).toContain(
          'languages.admin.validation.nativeNameRequired',
        );
      }
    });

    it('should trim whitespace from nativeName', () => {
      const result = adminLanguageSchema.safeParse({
        ...validData,
        nativeName: '  Español  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nativeName).toBe('Español');
      }
    });
  });
});
