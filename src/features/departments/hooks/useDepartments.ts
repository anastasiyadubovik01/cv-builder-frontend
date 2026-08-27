import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import {
  DEPARTMENTS_QUERY,
  type ApiDepartment,
  type DepartmentsQueryData,
} from '@/api/departments';
import type { DepartmentSortField } from '../types';

export function useDepartments() {
  const extractPaginatedData = useCallback((data: DepartmentsQueryData) => {
    if ('departments' in data && data.departments) {
      return data.departments;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback(
    (department: ApiDepartment, queryStr: string) => {
      return department.name.toLowerCase().includes(queryStr);
    },
    [],
  );

  const getSortValue = useCallback(
    (department: ApiDepartment, field: DepartmentSortField) => {
      switch (field) {
        case 'name':
          return department.name;
        default:
          return '';
      }
    },
    [],
  );

  return usePaginatedQuery<
    DepartmentsQueryData,
    Record<string, unknown>,
    ApiDepartment,
    DepartmentSortField
  >({
    query: DEPARTMENTS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
