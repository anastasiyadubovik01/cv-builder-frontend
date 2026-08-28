import { describe, it, expect } from 'vitest';
import { adminPositionSchema } from './admin-position';
import { z } from 'zod';

describe('adminPositionSchema validations', () => {
  const validData = {
    name: 'QA Engineer',
  };

  it('should successfully validate correct admin position data', () => {
    const result = adminPositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('name field', () => {
    it('should fail when name is empty or whitespace', () => {
      const result = adminPositionSchema.safeParse({
        ...validData,
        name: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.name?.errors).toContain(
          'positions.validation.nameRequired',
        );
      }
    });

    it('should trim whitespace from name', () => {
      const result = adminPositionSchema.safeParse({
        ...validData,
        name: '  Systems Analyst  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Systems Analyst');
      }
    });
  });
});
