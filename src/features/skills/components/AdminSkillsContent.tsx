'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  SKILL_CATEGORIES_QUERY,
  SKILLS_QUERY,
  type ApiSkill,
} from '@/api/skills';

import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SkillsTable } from '@/features/skills/components/SkillsTable';
import type { SkillSortField, SortDirection } from '@/features/skills/types';

import { CreateSkillAdminModal } from '@/features/skills/components/CreateSkillAdminModal';
import { DeleteSkillModal } from '@/features/skills/components/DeleteSkillModal';
import { UpdateSkillAdminModal } from '@/features/skills/components/UpdateSkillAdminModal';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

export function AdminSkillsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SkillSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<ApiSkill | null>(null);
  const [allSkills, setAllSkills] = useState<ApiSkill[]>([]);
  const [loadError, setLoadError] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(SKILLS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: BACKEND_PAGE_SIZE,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const loadAllSkills = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<ApiSkill[]> => {
      const firstPageSkills = sourceData.skills.items;
      const totalBackendPages = sourceData.skills.total_pages;

      if (totalBackendPages <= 1) {
        return firstPageSkills;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) =>
          fetchMore({
            variables: {
              params: {
                page,
                limit: BACKEND_PAGE_SIZE,
              },
            },
          }),
        ),
      );

      const remainingSkills = responses.flatMap(
        (response) => response.data.skills.items,
      );

      return [...firstPageSkills, ...remainingSkills];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) return;

    const syncSkills = async () => {
      try {
        const skills = await loadAllSkills(data);

        setAllSkills(skills);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncSkills();
  }, [data, loadAllSkills]);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(SKILL_CATEGORIES_QUERY);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSkills = allSkills.filter((skill) =>
    skill.name.toLowerCase().includes(normalizedSearch),
  );

  const sortedSkills = [...filteredSkills].sort((a, b) =>
    sortDirection === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name),
  );

  const totalPages = Math.ceil(sortedSkills.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const skills = sortedSkills.slice(startIndex, startIndex + pageSize);

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

  const handleRefresh = async (): Promise<void> => {
    try {
      const result = await refetch();

      if (!result.data) {
        return;
      }

      const refreshedSkills = await loadAllSkills(result.data);

      setAllSkills(refreshedSkills);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  const handleSort = (field: SkillSortField) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }

    setCurrentPage(1);
  };

  const handleRetry = async () => {
    await Promise.all([handleRefresh(), refetchCategories()]);
  };

  const isLoading =
    loading ||
    categoriesLoading ||
    Boolean(data && allSkills.length < data.skills.total);
  const hasError = Boolean(error) || Boolean(categoriesError) || loadError;

  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      {isLoading && <LoadingOverlay />}

      <div className="mx-auto w-full max-w-[1190px] px-6">
        <div className="flex items-center justify-between pt-2 pb-4">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('skills.admin.search')}
            className="bg-background"
          />

          <CreateSkillAdminModal
            skills={allSkills}
            categories={selectableCategories}
            onSuccess={handleRefresh}
            trigger={
              <Button
                type="button"
                variant="primaryV2"
                className="flex items-center gap-2 text-[14px] font-medium uppercase"
              >
                <PlusIcon className="size-6" />

                <span className="hidden lg:inline">
                  {t('skills.admin.create')}
                </span>
              </Button>
            }
          />
        </div>

        {hasError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('skills.admin.loadError')}
            </p>

            <Button type="button" onClick={() => void handleRetry()}>
              {t('retry')}
            </Button>
          </div>
        ) : (
          <>
            <SkillsTable
              skills={skills}
              categoryTypes={categoryTypes}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              onEdit={setEditingSkill}
              onDelete={setDeletingSkill}
            />

            <div className="pb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
