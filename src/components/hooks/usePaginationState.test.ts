import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { usePaginationState } from './usePaginationState';

describe('usePaginationState', () => {
  it('returns initial pagination values', () => {
    const { result } = renderHook(() => usePaginationState());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('uses custom initial page size', () => {
    const { result } = renderHook(() => usePaginationState(20));

    expect(result.current.pageSize).toBe(20);
  });

  it('changes current page', () => {
    const { result } = renderHook(() => usePaginationState());

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('changes page size and resets current page to 1', () => {
    const { result } = renderHook(() => usePaginationState());

    act(() => {
      result.current.setCurrentPage(4);
    });

    act(() => {
      result.current.setPageSize(20);
    });

    expect(result.current.pageSize).toBe(20);
    expect(result.current.currentPage).toBe(1);
  });

  it('resets current page to 1', () => {
    const { result } = renderHook(() => usePaginationState());

    act(() => {
      result.current.setCurrentPage(5);
    });

    act(() => {
      result.current.resetPagination();
    });

    expect(result.current.currentPage).toBe(1);
  });
});
