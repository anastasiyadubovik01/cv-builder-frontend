import { describe, it, expect } from 'vitest';
import { adminDepartmentSchema } from './admin-department';
import { z } from 'zod';

describe('adminDepartmentSchema validations', () => {
  const validData = {
    name: 'DevOps',
  };

  it('should successfully validate correct admin department data', () => {
    const result = adminDepartmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('name field', () => {
    it('should fail when name is empty or whitespace', () => {
      const result = adminDepartmentSchema.safeParse({
        ...validData,
        name: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.name?.errors).toContain(
          'departments.validation.nameRequired',
        );
      }
    });

    it('should trim whitespace from name', () => {
      const result = adminDepartmentSchema.safeParse({
        ...validData,
        name: '  Quality Assurance  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Quality Assurance');
      }
    });
  });
});
