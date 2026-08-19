'use client';

import type { ApiLanguage, ProfileLanguage } from '@/api/languages';
import { ChangeUserLanguageModal } from '@/features/languages/components/ChangeUserLanguageModal';
import { useUpdateUserLanguage } from '@/features/languages/hooks/useUpdateUserLanguage';

type UpdateUserLanguageModalProps = {
  userId: string;
  language: ProfileLanguage;
  languages: ApiLanguage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateUserLanguageModal({
  userId,
  language,
  languages,
  open,
  onOpenChange,
  onSuccess,
}: UpdateUserLanguageModalProps) {
  const form = useUpdateUserLanguage({
    userId,
    languageName: language.name,
    proficiency: language.proficiency,
    onSuccess,
  });

  return (
    <ChangeUserLanguageModal
      {...form}
      type="Update"
      languages={languages}
      open={open}
      onOpenChange={onOpenChange}
      languageDisabled
    />
  );
}
