'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  SKILLS_QUERY,
  USER_SKILLS_QUERY,
  type ProfileSkill,
} from '@/api/skills';
import { DeleteIcon } from '@/components/icons/delete-icon';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { AddSkillModal } from '@/features/skills/components/AddSkillModal';
import { RemoveSkillsModal } from '@/features/skills/components/RemoveSkillsModal';
import { SkillMasteryProgress } from '@/features/skills/components/SkillMasteryProgress';
import { UpdateSkillModal } from '@/features/skills/components/UpdateSkillModal';

type UserSkillsContentProps = {
  userId: string;
  canManage: boolean;
};

export function UserSkillsContent({
  userId,
  canManage,
}: UserSkillsContentProps) {
  const { t } = useTranslation();

  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ProfileSkill | null>(null);

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery(USER_SKILLS_QUERY, {
    variables: {
      userId,
    },
  });

  const {
    data: skillsData,
    loading: skillsLoading,
    error: skillsError,
    refetch: refetchSkills,
  } = useQuery(SKILLS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const loading = userLoading || skillsLoading;
  const error = userError || skillsError;

  const profileSkills = userData?.user.profile.skills ?? [];
  const availableSkills = skillsData?.skills.items ?? [];

  const selectableSkills = availableSkills.filter(
    (skill) =>
      !profileSkills.some((profileSkill) => profileSkill.name === skill.name),
  );

  const handleRefetch = async () => {
    await Promise.all([refetchUser(), refetchSkills()]);
  };

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

    if (canManage) {
      setEditingSkill(skill);
    }
  };

  const handleCancelRemove = () => {
    setIsRemoveMode(false);
    setSelectedSkills([]);
  };

  const groupedSkills = profileSkills.reduce<Record<string, ProfileSkill[]>>(
    (groups, profileSkill) => {
      const skill = availableSkills.find(
        (item) =>
          item.name === profileSkill.name &&
          (!profileSkill.categoryId ||
            item.category.id === profileSkill.categoryId),
      );

      const categoryName =
        skill?.category.name ??
        skill?.category_name ??
        t('skills.uncategorized');

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }

      groups[categoryName].push(profileSkill);

      return groups;
    },
    {},
  );

  return (
    <ContentLayout
      isLoading={loading}
      hasError={Boolean(error)}
      errorMessage={t('skills.loadError', 'Failed to load skills')}
      onRetry={handleRefetch}
    >
      <div className="mx-auto w-full max-w-[760px] pt-8">
        {profileSkills.length === 0 ? (
          <p className="pt-8 text-center text-muted-foreground">
            {t('skills.empty')}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <section key={category}>
                <h2 className="mb-6 text-base font-normal text-foreground">
                  {category}
                </h2>

                <div className="grid grid-cols-1 gap-x-16 gap-y-6 pl-5 md:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => {
                    return (
                      <button
                        key={`${skill.name}-${skill.categoryId ?? ''}`}
                        type="button"
                        disabled={!canManage}
                        onClick={() => handleSkillClick(skill)}
                        className="flex items-center gap-4 text-left disabled:cursor-default"
                      >
                        <SkillMasteryProgress
                          mastery={skill.mastery}
                          selected={selectedSkills.includes(skill.name)}
                        />

                        <span className="text-sm text-foreground">
                          {skill.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
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
                <AddSkillModal
                  userId={userId}
                  skills={selectableSkills}
                  onSuccess={async () => {
                    await handleRefetch();
                  }}
                  trigger={
                    <Button type="button" variant="ghost" className="gap-3">
                      <PlusIcon className="size-5" />
                      {t('skills.add')}
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
                  {t('skills.remove')}
                </Button>
              </>
            )}
          </div>
        )}

        {editingSkill && (
          <UpdateSkillModal
            userId={userId}
            skill={editingSkill}
            skills={availableSkills}
            open={Boolean(editingSkill)}
            onOpenChange={(open) => {
              if (!open) {
                setEditingSkill(null);
              }
            }}
            onSuccess={async () => {
              await handleRefetch();
              setEditingSkill(null);
            }}
          />
        )}

        <RemoveSkillsModal
          userId={userId}
          selectedSkills={selectedSkills}
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          onSuccess={async () => {
            await handleRefetch();
            handleCancelRemove();
          }}
        />
      </div>
    </ContentLayout>
  );
}
