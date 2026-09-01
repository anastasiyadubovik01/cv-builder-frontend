import { describe, it, expect, vi } from 'vitest';
import { getActionTranslation, getItemTypeTranslation } from './i18n';
import { itemType } from '@/components/dialogs/types';

describe('dialogs i18n utils', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'dialogs.itemTypes.user': 'User',
      'dialogs.itemTypes.skill': 'Skill',
      'dialogs.itemTypes.language': 'Language',
      'dialogs.itemTypes.cv': 'CV',
      'dialogs.itemTypes.cvProject': 'CV Project',
      'dialogs.itemTypes.department': 'department',
      'dialogs.itemTypes.position': 'position',
      'dialogs.itemTypes.project': 'project',
      'dialogs.actions.create': 'Create',
      'dialogs.actions.add': 'Add',
      'dialogs.actions.update': 'Update',
      'dialogs.actions.delete': 'Delete',
      'dialogs.actions.remove': 'Remove',
    };
    return translations[key] || key;
  });

  describe('getActionTranslation', () => {
    it('returns translated string when action exists in translation keys', () => {
      expect(getActionTranslation('Delete', mockT)).toBe('Delete');
      expect(getActionTranslation('Create', mockT)).toBe('Create');
      expect(getActionTranslation('Remove', mockT)).toBe('Remove');
      expect(mockT).toHaveBeenCalledWith('dialogs.actions.delete');
    });

    it('returns original action string as fallback when key is not found', () => {
      expect(getActionTranslation('CustomAction', mockT)).toBe('CustomAction');
    });
  });

  describe('getItemTypeTranslation', () => {
    it('returns translated string when itemType exists in translation keys', () => {
      expect(getItemTypeTranslation('user' as itemType, mockT)).toBe('User');
      expect(getItemTypeTranslation('department' as itemType, mockT)).toBe(
        'department',
      );
      expect(getItemTypeTranslation('CV Project' as itemType, mockT)).toBe(
        'CV Project',
      );
      expect(mockT).toHaveBeenCalledWith('dialogs.itemTypes.user');
    });

    it('returns original itemType string as fallback when key is not found', () => {
      const unknownType = 'unknownItem' as itemType;
      expect(getItemTypeTranslation(unknownType, mockT)).toBe('unknownItem');
    });
  });
});
