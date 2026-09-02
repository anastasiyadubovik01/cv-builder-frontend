import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EXPORT_PDF_MUTATION } from '@/api/cv-preview';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { getPdfStyles } from '@/features/cvs/utils/pdfStyles';

import { useExportCvPdf } from './useExportCvPdf';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

vi.mock('@/features/cvs/utils/pdfStyles', () => ({
  getPdfStyles: vi.fn(),
}));

describe('useExportCvPdf', () => {
  const exportPdfMutation = vi.fn();
  const toastSuccess = vi.fn();
  const t = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess,
    } as never);

    vi.mocked(useMutation).mockReturnValue([
      exportPdfMutation,
      {
        loading: false,
      },
    ] as never);

    vi.mocked(getPdfStyles).mockReturnValue('.cv { color: black; }');

    exportPdfMutation.mockResolvedValue({
      data: {
        exportPdf: 'base64-pdf',
      },
    });

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('configures export mutation', () => {
    renderHook(() => useExportCvPdf('Frontend CV'));

    expect(useMutation).toHaveBeenCalledWith(EXPORT_PDF_MUTATION);
  });

  it('does nothing when container is missing', async () => {
    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(exportPdfMutation).not.toHaveBeenCalled();
  });

  it('exports container HTML as PDF', async () => {
    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    const container = document.createElement('div');
    container.innerHTML = '<h1>Nastya Developer</h1>';

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    expect(getPdfStyles).toHaveBeenCalledTimes(1);

    expect(exportPdfMutation).toHaveBeenCalledWith({
      variables: {
        pdf: {
          html: expect.stringContaining('<h1>Nastya Developer</h1>'),
          margin: {
            top: '10mm',
            bottom: '10mm',
            left: '10mm',
            right: '30mm',
          },
        },
      },
    });

    const html = exportPdfMutation.mock.calls[0][0].variables.pdf.html;

    expect(html).toContain('<title>Frontend CV</title>');
    expect(html).toContain('.cv { color: black; }');
  });

  it('downloads returned base64 PDF', async () => {
    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    const container = document.createElement('div');

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    const anchor = document.querySelector('a');

    expect(anchor).toBeNull();

    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);

    expect(toastSuccess).toHaveBeenCalledWith('cvs.preview.exportSuccess');
  });

  it('keeps existing data URL unchanged', async () => {
    exportPdfMutation.mockResolvedValue({
      data: {
        exportPdf: 'data:application/pdf;base64,existing-pdf',
      },
    });

    const createElementSpy = vi.spyOn(document, 'createElement');

    const { result } = renderHook(() => useExportCvPdf('My CV'));

    const container = document.createElement('div');

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    const anchorCall = createElementSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    );

    const anchor = anchorCall?.value as HTMLAnchorElement;

    expect(anchor.href).toContain('data:application/pdf;base64,existing-pdf');

    expect(anchor.download).toBe('my-cv.pdf');
  });

  it('adds data URL prefix to raw base64 response', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');

    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    const container = document.createElement('div');

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    const anchorCall = createElementSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    );

    const anchor = anchorCall?.value as HTMLAnchorElement;

    expect(anchor.href).toContain('data:application/pdf;base64,base64-pdf');

    expect(anchor.download).toBe('frontend-cv.pdf');
  });

  it('does not download when mutation returns no PDF', async () => {
    exportPdfMutation.mockResolvedValue({
      data: {
        exportPdf: null,
      },
    });

    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    const container = document.createElement('div');

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();

    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('handles export error', async () => {
    const error = new Error('Export failed');

    exportPdfMutation.mockRejectedValue(error);

    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    const container = document.createElement('div');

    Object.defineProperty(result.current.containerRef, 'current', {
      value: container,
      writable: true,
    });

    await act(async () => {
      await result.current.handleExport();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Export CV PDF',
    });
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      exportPdfMutation,
      {
        loading: true,
      },
    ] as never);

    const { result } = renderHook(() => useExportCvPdf('Frontend CV'));

    expect(result.current.loading).toBe(true);
  });
});
