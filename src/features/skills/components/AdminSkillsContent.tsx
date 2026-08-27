'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  SKILL_CATEGORIES_QUERY,
  SKILLS_QUERY,
  type ApiSkill,
  type SkillsData,
} from '@/api/skills';

import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { SkillsTable } from '@/features/skills/components/SkillsTable';
import type { SkillSortField } from '@/features/skills/types';

import { CreateSkillAdminModal } from '@/features/skills/components/CreateSkillAdminModal';
import { DeleteSkillModal } from '@/features/skills/components/DeleteSkillModal';
import { UpdateSkillAdminModal } from '@/features/skills/components/UpdateSkillAdminModal';

export function AdminSkillsContent() {
  const { t } = useTranslation();

  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<ApiSkill | null>(null);

  const extractPaginatedData = useCallback((data: SkillsData) => {
    if ('skills' in data && data.skills) {
      return data.skills;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((skill: ApiSkill, queryStr: string) => {
    return skill.name.toLowerCase().includes(queryStr);
  }, []);

  const getSortValue = useCallback((skill: ApiSkill, field: SkillSortField) => {
    switch (field) {
      case 'name':
        return skill.name;
      default:
        return '';
    }
  }, []);

  const {
    paginatedItems: skills,
    allItems: allSkills,
    loading,
    error,
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
  } = usePaginatedQuery<
    SkillsData,
    Record<string, unknown>,
    ApiSkill,
    SkillSortField
  >({
    query: SKILLS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(SKILL_CATEGORIES_QUERY);

  const categoryTypes = useMemo(() => {
    const result: Record<string, string> = {};

    for (const category of categoriesData?.skillCategories ?? []) {
      if (category.parent) {
        result[category.id] = category.parent.name;
      }

      for (const child of category.children) {
        result[child.id] = category.name;
      }
    }

    return result;
  }, [categoriesData]);

  const selectableCategories = useMemo(() => {
    const result = new Map<string, { id: string; name: string }>();

    for (const category of categoriesData?.skillCategories ?? []) {
      if (category.children.length > 0) {
        for (const child of category.children) {
          result.set(child.id, {
            id: child.id,
            name: child.name,
          });
        }
      } else {
        result.set(category.id, {
          id: category.id,
          name: category.name,
        });
      }
    }

    return [...result.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesData]);

  const handleRetry = async () => {
    await Promise.all([handleRefresh(), refetchCategories()]);
  };

  const hasError = Boolean(error) || Boolean(categoriesError);
  const isLoading = loading || categoriesLoading;

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
