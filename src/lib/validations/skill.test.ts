import { describe, it, expect } from 'vitest';
import { addSkillSchema, masteryValues } from './skill';
import { z } from 'zod';

describe('skill validations', () => {
  const validData = {
    skillName: 'React',
    mastery: 'Proficient' as const,
  };

  describe('addSkillSchema', () => {
    it('should successfully validate correct skill data', () => {
      const result = addSkillSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    describe('skillName field', () => {
      it('should fail when skillName is empty', () => {
        const result = addSkillSchema.safeParse({
          ...validData,
          skillName: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.skillName?.errors).toContain(
            'skills.validation.skillRequired',
          );
        }
      });
    });

    describe('mastery field', () => {
      it('should allow all valid mastery values', () => {
        masteryValues.forEach((mastery) => {
          const result = addSkillSchema.safeParse({
            ...validData,
            mastery,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should fail when mastery is an empty string', () => {
        const result = addSkillSchema.safeParse({
          ...validData,
          mastery: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          expect(tree.properties?.mastery?.errors).toContain(
            'skills.validation.masteryRequired',
          );
        }
      });

      it('should fail when mastery is invalid', () => {
        const result = addSkillSchema.safeParse({
          ...validData,
          mastery: 'Godlike',
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
