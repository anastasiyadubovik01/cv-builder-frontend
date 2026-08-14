import { itemType } from '@/components/dialogs/types';

const itemTypeTranslationKeys: Record<itemType, string> = {
  user: 'dialogs.itemTypes.user',
  skill: 'dialogs.itemTypes.skill',
  language: 'dialogs.itemTypes.language',
  CV: 'dialogs.itemTypes.cv',
  'CV Project': 'dialogs.itemTypes.cvProject',
  department: 'dialogs.itemTypes.department',
  position: 'dialogs.itemTypes.position',
  project: 'dialogs.itemTypes.project',
};

const actionTranslationKeys: Record<string, string> = {
  Create: 'dialogs.actions.create',
  Add: 'dialogs.actions.add',
  Update: 'dialogs.actions.update',
  Delete: 'dialogs.actions.delete',
  Remove: 'dialogs.actions.remove',
};

export function getActionTranslation(
  action: string,
  t: (key: string) => string,
): string {
  const key = actionTranslationKeys[action];
  return key ? t(key) : action;
}

export function getItemTypeTranslation(
  itemType: itemType,
  t: (key: string) => string,
): string {
  const key = itemTypeTranslationKeys[itemType];
  return key ? t(key) : itemType;
}
