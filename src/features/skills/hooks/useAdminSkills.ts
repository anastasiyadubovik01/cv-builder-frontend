import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { getEmptyPaginatedResponse } from '@/components/hooks/useFetchAllPages';
import {
  SKILL_CATEGORIES_QUERY,
  SKILLS_QUERY,
  type ApiSkill,
  type SkillsData,
} from '@/api/skills';
import type { SkillSortField } from '@/features/skills/types';

export function useAdminSkills() {
  const extractPaginatedData = useCallback((data: SkillsData) => {
    if ('skills' in data && data.skills) {
      return data.skills;
    }
    return getEmptyPaginatedResponse<ApiSkill>();
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

  const paginatedQuery = usePaginatedQuery<
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
    await Promise.all([paginatedQuery.handleRefresh(), refetchCategories()]);
  };

  const hasError = Boolean(paginatedQuery.error) || Boolean(categoriesError);
  const isLoading = paginatedQuery.loading || categoriesLoading;

  return {
    ...paginatedQuery,
    categoryTypes,
    selectableCategories,
    isLoading,
    hasError,
    handleRetry,
  };
}
