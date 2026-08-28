import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from './user';
import { z } from 'zod';

describe('user validations', () => {
  const validCreateData = {
    email: 'carrot@example.com',
    password: '123456',
    firstName: 'Test',
    lastName: 'Carrot',
    departmentId: '123',
    positionId: '456',
    role: 'Employee' as const,
  };

  const validUpdateData = {
    email: 'carrot@example.com',
    password: '123456',
    firstName: 'Test',
    lastName: 'Carrot',
    departmentId: '123',
    positionId: '456',
    role: 'Admin' as const,
  };

  describe('createUserSchema', () => {
    it('should successfully validate correct creation data', () => {
      const result = createUserSchema.safeParse(validCreateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCreateData);
      }
    });

    describe('email field', () => {
      it('should fail when email is empty', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          email: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.email?.errors).toContain(
            'users.validation.email.required',
          );
        }
      });

      it('should fail when email format is invalid', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          email: 'invalid',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.email?.errors).toContain(
            'users.validation.email.invalid',
          );
        }
      });
    });

    describe('password field', () => {
      it('should fail when password is empty', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          password: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.password?.errors).toContain(
            'users.validation.password.required',
          );
        }
      });

      it('should fail when password is shorter than 6 characters', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          password: '123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.password?.errors).toContain(
            'users.validation.password.minLength',
          );
        }
      });
    });

    describe('firstName field', () => {
      it('should fail when firstName is empty or whitespace', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          firstName: '   ',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.firstName?.errors).toContain(
            'users.validation.firstName.required',
          );
        }
      });

      it('should trim whitespace from firstName', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
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
        const result = createUserSchema.safeParse({
          ...validCreateData,
          lastName: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.lastName?.errors).toContain(
            'users.validation.lastName.required',
          );
        }
      });

      it('should trim whitespace from lastName', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          lastName: '  Smith  ',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.lastName).toBe('Smith');
        }
      });
    });

    describe('departmentId & positionId fields', () => {
      it('should fail when departmentId is empty', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          departmentId: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.departmentId?.errors).toContain(
            'users.validation.department.required',
          );
        }
      });

      it('should fail when positionId is empty', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          positionId: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.positionId?.errors).toContain(
            'users.validation.position.required',
          );
        }
      });
    });

    describe('role field', () => {
      it('should allow valid roles (Employee, Admin)', () => {
        const employeeResult = createUserSchema.safeParse({
          ...validCreateData,
          role: 'Employee',
        });
        const adminResult = createUserSchema.safeParse({
          ...validCreateData,
          role: 'Admin',
        });

        expect(employeeResult.success).toBe(true);
        expect(adminResult.success).toBe(true);
      });

      it('should fail when role is invalid', () => {
        const result = createUserSchema.safeParse({
          ...validCreateData,
          role: 'SuperUser',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.role?.errors).toContain(
            'users.validation.role.required',
          );
        }
      });
    });
  });

  describe('updateUserSchema', () => {
    it('should successfully validate correct update data', () => {
      const result = updateUserSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdateData);
      }
    });

    it('should fail when required update fields are empty', () => {
      const result = updateUserSchema.safeParse({
        ...validUpdateData,
        firstName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(tree.properties?.firstName?.errors).toContain(
          'users.validation.firstName.required',
        );
      }
    });
  });
});
