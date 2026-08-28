import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from './settings';
import { z } from 'zod';

describe('changePasswordSchema validations', () => {
  const validData = {
    oldPassword: '123456',
    newPassword: 'abcd123456',
    confirmPassword: 'abcd123456',
  };

  it('should successfully validate correct password change data', () => {
    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe('oldPassword field', () => {
    it('should fail when oldPassword is empty', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        oldPassword: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.oldPassword?.errors).toContain(
          'settings.validation.passwordRequired',
        );
      }
    });
  });

  describe('newPassword field', () => {
    it('should fail when newPassword is empty', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        newPassword: '',
        confirmPassword: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.newPassword?.errors).toContain(
          'settings.validation.newPasswordRequired',
        );
      }
    });

    it('should fail when newPassword is shorter than 6 characters', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        newPassword: '123',
        confirmPassword: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.newPassword?.errors).toContain(
          'settings.validation.passwordMinLength',
        );
      }
    });

    it('should fail when newPassword is the same as oldPassword', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        oldPassword: 'samePassword123',
        newPassword: 'samePassword123',
        confirmPassword: 'samePassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.newPassword?.errors).toContain(
          'settings.validation.samePassword',
        );
      }
    });
  });

  describe('confirmPassword field & cross-field validations', () => {
    it('should fail when confirmPassword is empty', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        confirmPassword: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.confirmPassword?.errors).toContain(
          'settings.validation.confirmPasswordRequired',
        );
      }
    });

    it('should fail when newPassword and confirmPassword do not match', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        newPassword: '123456',
        confirmPassword: '12345678',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.confirmPassword?.errors).toContain(
          'settings.validation.passwordsDoNotMatch',
        );
      }
    });
  });
});
