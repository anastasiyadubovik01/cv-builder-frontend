'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { SkillsTable } from '@/features/skills/components/SkillsTable';
import { CreateSkillAdminModal } from '@/features/skills/components/CreateSkillAdminModal';
import { DeleteSkillModal } from '@/features/skills/components/DeleteSkillModal';
import { UpdateSkillAdminModal } from '@/features/skills/components/UpdateSkillAdminModal';
import { useAdminSkills } from '@/features/skills/hooks/useAdminSkills';

import type { ApiSkill } from '@/api/skills';

export function AdminSkillsContent() {
  const { t } = useTranslation();

  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<ApiSkill | null>(null);

  const {
    paginatedItems: skills,
    allItems: allSkills,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleRefresh,
    categoryTypes,
    selectableCategories,
    isLoading,
    hasError,
    handleRetry,
  } = useAdminSkills();

  return (
    <ContentLayout
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={t('skills.admin.loadError', 'Failed to load skills')}
      onRetry={handleRetry}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <CreateSkillAdminModal
          skills={allSkills}
          categories={selectableCategories}
          onSuccess={() => void handleRefresh()}
          trigger={
            <Button
              type="button"
              variant="primaryV2"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
            >
              <PlusIcon className="size-6" />
              <span className="hidden lg:inline">
                {t('skills.admin.create')}
              </span>
            </Button>
          }
        />
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    >
      <SkillsTable
        skills={skills}
        categoryTypes={categoryTypes}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={setEditingSkill}
        onDelete={setDeletingSkill}
      />

      {editingSkill && (
        <UpdateSkillAdminModal
          skill={editingSkill}
          skills={allSkills}
          categories={selectableCategories}
          open={Boolean(editingSkill)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSkill(null);
            }
          }}
          onSuccess={async () => {
            await handleRefresh();
            setEditingSkill(null);
          }}
        />
      )}

      {deletingSkill && (
        <DeleteSkillModal
          skillId={deletingSkill.id}
          name={deletingSkill.name}
          open={Boolean(deletingSkill)}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingSkill(null);
            }
          }}
          onSuccess={async () => {
            await handleRefresh();
            setDeletingSkill(null);
            setCurrentPage(1);
          }}
        />
      )}
    </ContentLayout>
  );
}
