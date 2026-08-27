import { CvProjectsContent } from '@/features/cvs/components/projects/CvProjectsContent';

interface CvProjectsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CvProjectsPage({ params }: CvProjectsPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <CvProjectsContent cvId={id} />
    </div>
  );
}
