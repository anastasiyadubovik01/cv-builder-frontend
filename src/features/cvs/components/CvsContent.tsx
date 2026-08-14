'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

import type { Cv, SortDirection, SortField } from '@/features/cvs/types';

const MOCK_CVS: Cv[] = [
  {
    id: '1',
    name: 'Frontend Developer CV',
    education: 'Test State Technical University',
    employee: 'Test',
  },
  {
    id: '2',
    name: 'Fullstack Engineer CV',
    education: 'Test State Technical University',
    employee: 'Carrot',
  },
];

export function CvsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCvs = MOCK_CVS.filter((cv) => {
    return (
      cv.name.toLowerCase().includes(normalizedSearch) ||
      cv.education.toLowerCase().includes(normalizedSearch) ||
      cv.employee.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedCvs = [...filteredCvs].sort((a, b) => {
    const firstValue = a[sortBy].trim();
    const secondValue = b[sortBy].trim();

    if (!firstValue && !secondValue) return 0;
    if (!firstValue) return 1;
    if (!secondValue) return -1;

    return sortDirection === 'asc'
      ? firstValue.localeCompare(secondValue)
      : secondValue.localeCompare(firstValue);
  });

  const totalPages = Math.ceil(sortedCvs.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCvs = sortedCvs.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      <div className="ml-6 mt-[7px] shrink-0">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('cvs.search', 'Search CVs...')}
          className="bg-background"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CvsTable
            cvs={paginatedCvs}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>

        <div className="shrink-0 bg-background pb-4">
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
      </div>
    </div>
  );
}
