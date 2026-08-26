import { CvPreviewContent } from '@/features/cvs/components/preview/CvPreviewContent';

interface CvPreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CvPreviewPage({ params }: CvPreviewPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      <CvPreviewContent cvId={id} />
    </div>
  );
}
