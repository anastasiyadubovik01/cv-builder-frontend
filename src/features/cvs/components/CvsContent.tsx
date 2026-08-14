'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

import type { Cv, SortDirection, SortField } from '@/features/cvs/types';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';

const MOCK_CVS: Cv[] = [
  {
    id: '1',
    name: 'Frontend Developer CV',
    education: 'Test State Technical University',
    employee: 'test@example.com',
    description:
      'Highly motivated and experienced Software Engineer with 5+ years of proven success in leading and developing robust and scalable applications. Adept at\n' +
      'leveraging React, Node.js, Three.js, and WebGL to create innovative and visually appealing user interfaces. Possesses strong leadership and mentoring skills,\n' +
      'effectively guiding junior developers and fostering a collaborative team environment. Adept at architecting complex systems, ensuring efficient performance,\n' +
      'and adhering to best practices. Passionate about delivering high-quality solutions and contributing to the success of dynamic projects.',
  },
  {
    id: '2',
    name: 'Fullstack Engineer CV',
    education: 'Test State Technical University',
    employee: 'carrot@example.com',
    description:
      'Highly motivated and experienced Software Engineer with 5+ years of proven success in designing and developing complex software solutions. Adept at\n' +
      'utilizing cutting-edge technologies such as React and Node.js to create user-friendly and scalable applications. Possesses a strong understanding of Computer\n' +
      'Systems Design principles and methodologies. A results-oriented individual with a passion for delivering high-quality work and exceeding expectations. A strong\n' +
      'team leader and mentor with a proven ability to guide and motivate others to achieve shared goals. Seeking a challenging and rewarding Software Engineer\n' +
      'position where I can leverage my skills and experience to contribute to the success of a dynamic and innovative organization.',
  },
];

export function CvsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const sortBy: SortField = 'name';
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1);
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      <div className="mx-6 mt-[7px] flex items-center justify-between shrink-0">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('cvs.search', 'Search')}
          className="bg-background"
        />
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 uppercase font-medium text-[14px]"
          variant="primaryV2"
        >
          <PlusIcon className="size-6" />
          {t('cvs.createCv', 'CREATE CV')}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
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
