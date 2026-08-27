'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteIcon } from '@/components/icons/delete-icon';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { SkillMasteryProgress } from '@/features/skills/components/SkillMasteryProgress';
import { AddCvSkillModal } from '@/features/cvs/components/skills/modals/AddCvSkillModal';
import { UpdateCvSkillModal } from '@/features/cvs/components/skills/modals/UpdateCvSkillModal';
import { RemoveCvSkillsModal } from '@/features/cvs/components/skills/modals/RemoveCvSkillsModal';
import { useCvSkills } from '@/features/cvs/components/skills/hooks/useCvSkills';
import type { ProfileSkill } from '@/api/skills';

type CvSkillsContentProps = {
  cvId: string;
};

export function CvSkillsContent({ cvId }: CvSkillsContentProps) {
  const { t } = useTranslation();

  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ProfileSkill | null>(null);

  const { cvSkills, availableSkills, loading, error, handleRefresh } =
    useCvSkills(cvId);

  const selectableSkills = availableSkills.filter(
    (skill) => !cvSkills.some((cvSkill) => cvSkill.name === skill.name),
  );

  const handleSkillSelection = (skillName: string) => {
    setSelectedSkills((current) =>
      current.includes(skillName)
        ? current.filter((name) => name !== skillName)
        : [...current, skillName],
    );
  };

  const handleSkillClick = (skill: ProfileSkill) => {
    if (isRemoveMode) {
      handleSkillSelection(skill.name);
      return;
    }

    setEditingSkill(skill);
  };

  const handleCancelRemove = () => {
    setIsRemoveMode(false);
    setSelectedSkills([]);
  };

  const groupedSkills = cvSkills.reduce<Record<string, ProfileSkill[]>>(
    (groups, cvSkill) => {
      const skill = availableSkills.find(
        (item) =>
          item.name === cvSkill.name &&
          (!cvSkill.categoryId || item.category.id === cvSkill.categoryId),
      );

      const categoryName =
        skill?.category.name ??
        skill?.category_name ??
        t('skills.uncategorized', 'Uncategorized');

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }

      groups[categoryName].push(cvSkill);

      return groups;
    },
    {},
  );

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('skills.loadError', 'Failed to load skills')}
      onRetry={handleRefresh}
    >
      <div className="mx-auto w-full max-w-[760px] pt-8">
        {cvSkills.length === 0 ? (
          <p className="pt-8 text-center text-muted-foreground">
            {t('skills.empty', 'No skills added yet')}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <section key={category}>
                <h2 className="mb-6 text-base font-normal text-foreground">
                  {category}
                </h2>

                <div className="grid grid-cols-1 gap-x-16 gap-y-6 pl-5 md:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => (
                    <button
                      key={`${skill.name}-${skill.categoryId ?? ''}`}
                      type="button"
                      onClick={() => handleSkillClick(skill)}
                      className="flex items-center gap-4 text-left cursor-pointer"
                    >
                      <SkillMasteryProgress
                        mastery={skill.mastery}
                        selected={selectedSkills.includes(skill.name)}
                      />
                      <span className="text-sm text-foreground">
                        {skill.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-end gap-6">
          {isRemoveMode ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-[160px]"
                onClick={handleCancelRemove}
              >
                {t('dialogs.common.cancel', 'Cancel')}
              </Button>

              <Button
                type="button"
                className="w-[160px]"
                disabled={selectedSkills.length === 0}
                onClick={() => setRemoveDialogOpen(true)}
              >
                {t('skills.removeSelected', {
                  count: selectedSkills.length,
                })}
              </Button>
            </>
          ) : (
            <>
              <AddCvSkillModal
                cvId={cvId}
                skills={selectableSkills}
                onSuccess={handleRefresh}
                trigger={
                  <Button type="button" variant="ghost" className="gap-3">
                    <PlusIcon className="size-5" />
                    {t('skills.add', 'Add Skill')}
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
                {t('skills.remove', 'Remove Skill')}
              </Button>
            </>
          )}
        </div>

        {editingSkill && (
          <UpdateCvSkillModal
            cvId={cvId}
            skill={editingSkill}
            skills={availableSkills}
            open
            onOpenChange={(open) => {
              if (!open) setEditingSkill(null);
            }}
            onSuccess={async () => {
              await handleRefresh();
              setEditingSkill(null);
            }}
          />
        )}

        <RemoveCvSkillsModal
          cvId={cvId}
          selectedSkills={selectedSkills}
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          onSuccess={async () => {
            await handleRefresh();
            handleCancelRemove();
          }}
        />
      </div>
    </ContentLayout>
  );
}
