'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProfileLanguage } from '@/api/languages';
import { DeleteIcon } from '@/components/icons/delete-icon';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { AddUserLanguageModal } from '@/features/languages/components/modals/AddUserLanguageModal';
import { LanguageProficiencyProgress } from '@/features/languages/components/LanguageProficiencyProgress';
import { RemoveUserLanguagesModal } from '@/features/languages/components/modals/RemoveUserLanguagesModal';
import { UpdateUserLanguageModal } from '@/features/languages/components/modals/UpdateUserLanguageModal';
import { useUserLanguages } from '@/features/users/hooks/useUserLanguages';

type UserLanguagesContentProps = {
  userId: string;
  canManage: boolean;
};

export function UserLanguagesContent({
  userId,
  canManage,
}: UserLanguagesContentProps) {
  const { t } = useTranslation();

  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] =
    useState<ProfileLanguage | null>(null);

  const {
    profileLanguages,
    availableLanguages,
    loading,
    error,
    refetchUserLanguages,
    handleRefresh,
  } = useUserLanguages(userId);

  const selectableLanguages = availableLanguages.filter(
    (language) =>
      !profileLanguages.some(
        (profileLanguage) => profileLanguage.name === language.name,
      ),
  );

  const handleLanguageSelection = (languageName: string) => {
    setSelectedLanguages((current) =>
      current.includes(languageName)
        ? current.filter((name) => name !== languageName)
        : [...current, languageName],
    );
  };

  const handleLanguageClick = (language: ProfileLanguage) => {
    if (isRemoveMode) {
      handleLanguageSelection(language.name);
      return;
    }

    if (canManage) {
      setEditingLanguage(language);
    }
  };

  const handleCancelRemove = () => {
    setIsRemoveMode(false);
    setSelectedLanguages([]);
  };

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('users.languages.loadError', 'Failed to load languages')}
      onRetry={handleRefresh}
    >
      <div className="mx-auto w-full max-w-[760px] pt-8">
        {profileLanguages.length === 0 ? (
          <p className="pt-8 text-center text-muted-foreground">
            {t('users.languages.empty')}
          </p>
        ) : (
          <section>
            <h2 className="mb-8 text-base font-normal text-foreground">
              {t('users.languages.current')}
            </h2>

            <div className="grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              {profileLanguages.map((language) => (
                <button
                  key={language.name}
                  type="button"
                  disabled={!canManage}
                  onClick={() => handleLanguageClick(language)}
                  className="flex items-center gap-4 text-left disabled:cursor-default"
                >
                  <LanguageProficiencyProgress
                    proficiency={language.proficiency}
                    selected={selectedLanguages.includes(language.name)}
                  />

                  <span className="text-sm text-foreground">
                    {language.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {canManage && (
          <div className="mt-10 flex justify-end gap-6">
            {isRemoveMode ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-[160px]"
                  onClick={handleCancelRemove}
                >
                  {t('dialogs.common.cancel')}
                </Button>

                <Button
                  type="button"
                  className="w-[160px]"
                  disabled={selectedLanguages.length === 0}
                  onClick={() => setRemoveDialogOpen(true)}
                >
                  {t('users.languages.removeSelected', {
                    count: selectedLanguages.length,
                  })}
                </Button>
              </>
            ) : (
              <>
                <AddUserLanguageModal
                  userId={userId}
                  languages={selectableLanguages}
                  onSuccess={async () => {
                    await refetchUserLanguages();
                  }}
                  trigger={
                    <Button type="button" variant="ghost" className="gap-3">
                      <PlusIcon className="size-5" />
                      {t('users.languages.add')}
                    </Button>
                  }
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="gap-3 text-primary hover:text-primary"
                  onClick={() => setIsRemoveMode(true)}
                >
                  <DeleteIcon className="shrink-0" />
                  {t('users.languages.remove')}
                </Button>
              </>
            )}
          </div>
        )}

        {editingLanguage && (
          <UpdateUserLanguageModal
            userId={userId}
            language={editingLanguage}
            languages={availableLanguages}
            open
            onOpenChange={(open) => {
              if (!open) {
                setEditingLanguage(null);
              }
            }}
            onSuccess={async () => {
              await refetchUserLanguages();
              setEditingLanguage(null);
            }}
          />
        )}

        <RemoveUserLanguagesModal
          userId={userId}
          selectedLanguages={selectedLanguages}
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          onSuccess={async () => {
            await refetchUserLanguages();
            handleCancelRemove();
          }}
        />
      </div>
    </ContentLayout>
  );
}
