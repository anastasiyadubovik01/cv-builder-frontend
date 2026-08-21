import { useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { EXPORT_PDF_MUTATION } from '@/api/cv-preview';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { getPdfStyles } from '@/features/cvs/utils/pdfStyles';

export function useExportCvPdf(cvName: string) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [exportPdfMutation, { loading }] = useMutation(EXPORT_PDF_MUTATION);

  const handleExport = async () => {
    if (!containerRef.current) return;

    const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${cvName}</title>
      <style>${getPdfStyles()}</style>
    </head>
    <body>
      <div class="mx-auto w-full max-w-[900px] px-6 pt-8 pb-3 text-foreground">
        ${containerRef.current.innerHTML}
      </div>
    </body>
  </html>
`;

    try {
      const { data } = await exportPdfMutation({
        variables: {
          pdf: {
            html: htmlContent,
            margin: {
              top: '10mm',
              bottom: '10mm',
              left: '10mm',
              right: '30mm',
            },
          },
        },
      });

      if (data?.exportPdf) {
        const link = document.createElement('a');
        link.href = data.exportPdf.startsWith('data:')
          ? data.exportPdf
          : `data:application/pdf;base64,${data.exportPdf}`;
        link.download = `${cvName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(
          t('cvs.preview.exportSuccess', 'PDF successfully generated'),
        );
      }
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Export CV PDF',
      });
    }
  };

  return {
    containerRef,
    handleExport,
    loading,
    t,
  };
}
