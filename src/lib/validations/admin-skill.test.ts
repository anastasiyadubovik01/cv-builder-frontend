import { describe, it, expect } from 'vitest';
import { adminSkillSchema } from './admin-skill';
import { z } from 'zod';

describe('adminSkillSchema validations', () => {
  const validData = {
    name: 'TypeScript',
    categoryId: '412',
  };

  it('should successfully validate correct admin skill data', () => {
    const result = adminSkillSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('name field', () => {
    it('should fail when name is empty or whitespace', () => {
      const result = adminSkillSchema.safeParse({
        ...validData,
        name: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.name?.errors).toContain(
          'skills.admin.validation.nameRequired',
        );
      }
    });

    it('should trim whitespace from name', () => {
      const result = adminSkillSchema.safeParse({
        ...validData,
        name: '  JavaScript  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('JavaScript');
      }
    });
  });

  describe('categoryId field', () => {
    it('should fail when categoryId is empty', () => {
      const result = adminSkillSchema.safeParse({
        ...validData,
        categoryId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.categoryId?.errors).toContain(
          'skills.admin.validation.categoryRequired',
        );
      }
    });
  });
});
