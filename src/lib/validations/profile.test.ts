import { describe, it, expect } from 'vitest';
import { profileSchema } from './profile';
import { z } from 'zod';

describe('profileSchema validations', () => {
  const validData = {
    firstName: 'Test',
    lastName: 'Carrot',
    departmentId: '123',
    positionId: '456',
  };

  it('should successfully validate correct profile data', () => {
    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('firstName field', () => {
    it('should fail when firstName is empty or whitespace', () => {
      const result = profileSchema.safeParse({
        ...validData,
        firstName: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.firstName?.errors).toContain(
          'users.details.validation.firstNameRequired',
        );
      }
    });

    it('should fail when firstName exceeds maximum length of 100 characters', () => {
      const result = profileSchema.safeParse({
        ...validData,
        firstName: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.firstName?.errors).toContain(
          'users.details.validation.firstNameMaxLength',
        );
      }
    });

    it('should trim whitespace from firstName', () => {
      const result = profileSchema.safeParse({
        ...validData,
        firstName: '  Alice  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('Alice');
      }
    });
  });

  describe('lastName field', () => {
    it('should fail when lastName is empty or whitespace', () => {
      const result = profileSchema.safeParse({
        ...validData,
        lastName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.lastName?.errors).toContain(
          'users.details.validation.lastNameRequired',
        );
      }
    });

    it('should fail when lastName exceeds maximum length of 100 characters', () => {
      const result = profileSchema.safeParse({
        ...validData,
        lastName: 'b'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.lastName?.errors).toContain(
          'users.details.validation.lastNameMaxLength',
        );
      }
    });

    it('should trim whitespace from lastName', () => {
      const result = profileSchema.safeParse({
        ...validData,
        lastName: '  Smith  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastName).toBe('Smith');
      }
    });
  });

  describe('departmentId field', () => {
    it('should fail when departmentId is empty', () => {
      const result = profileSchema.safeParse({
        ...validData,
        departmentId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.departmentId?.errors).toContain(
          'users.details.validation.departmentRequired',
        );
      }
    });
  });

  describe('positionId field', () => {
    it('should fail when positionId is empty', () => {
      const result = profileSchema.safeParse({
        ...validData,
        positionId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.positionId?.errors).toContain(
          'users.details.validation.positionRequired',
        );
      }
    });
  });
});
